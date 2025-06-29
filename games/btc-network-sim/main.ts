import { eBus } from "games/util/event-bus";
import * as PIXI from "pixi.js";
import { createGameAssets } from "./assets";
import { type Camera, createCamera } from "./camera";
import { type NodeFactory, createNodeFactory } from "./factory.node";
import { type GameVars, createGameVars } from "./game.vars";
import { type NodeStore, createNodeStore } from "./store.nodes";
import { type TxMessageSystem, createTxMessageSystem } from "./system.move-tx";
import {
   type ConnectionSystem,
   createNodeConnectionSystem,
} from "./system.node-connection";
import { type DragSystem, createDragSystem } from "./system.pointer-drag";
import { type SendRandTxSystem, createSendTxSystem } from "./system.send-txs";
import { createBackground } from "./ui.background";
import { type LeftPaneCtrl, createLeftPaneControls } from "./ui.left-pane";
import { setMouseImages } from "./ui.mouse";
import type { EventMap } from "./util.events";

export const bus = eBus<EventMap>();

// TODO:
// - randomly start btc with utxos
// - randomly send txs to other nodes
//    - may need to use the store to get a random node
// - show some kind of animation - needs to be small - of a tx moving from 1 node to another
// - transactions propagate from the sender of btc

export async function createBtcNetworkSim(app: PIXI.Application) {
   const game: PIXI.Container = new PIXI.Container();
   const assets = createGameAssets();
   const gameVars = createGameVars(app, game, assets);
   const sceneEngine = newSceneEngine(gameVars);
   sceneEngine.next(() => gameScene(gameVars));
}

export interface IScene {
   load: (game: PIXI.ContainerChild) => Promise<void>;
   update: (tick: PIXI.Ticker) => void;
}

export const newSceneEngine = (gameVars: GameVars) => {
   let gameTicker: PIXI.Ticker | undefined;
   let currentScene: IScene | undefined;
   const { game, app, resizer } = gameVars;

   app.stage.addChild(game);

   setTimeout(() => resizer.resize(app, game), 0);

   return {
      next: async (nextScene: () => IScene) => {
         game.removeChildren();
         game.removeAllListeners();

         if (gameTicker) gameTicker.destroy();

         currentScene = nextScene();
         const update = (tick: PIXI.Ticker) => {
            currentScene?.update(tick);
         };
         gameTicker = new PIXI.Ticker().add(update);

         await currentScene.load(game);

         gameTicker.start();
      },
   };
};

export const gameScene = (gameVars: GameVars): IScene => {
   const { game, app, assets, resizer } = gameVars;

   let systemDrag: DragSystem | undefined;
   let systemNodeConnect: ConnectionSystem | undefined;
   let systemMoveTx: TxMessageSystem | undefined;
   let systemSendRandTx: SendRandTxSystem | undefined;

   let camera: Camera | undefined;
   let leftPaneCtrl: LeftPaneCtrl | undefined;
   const store: NodeStore = createNodeStore();
   const factory: NodeFactory = createNodeFactory({ gameVars, store });

   const background = createBackground({ rows: 30, cols: 46 });

   const sendResizeEvent = () =>
      window.dispatchEvent(new CustomEvent("windowResize"));

   window.addEventListener("resize", () => sendResizeEvent);

   const windowResize = () =>
      setTimeout(() => {
         resizer.resize(app, game);
         camera?.lookAt(systemDrag?.getFocusPoint());
      }, 10);

   window.addEventListener("windowResize", windowResize);

   app.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
   app.stage.interactive = true;
   setMouseImages(app);

   bus.on("zoom", (e) => {
      if (!systemDrag || !camera) return;
      const deltaZoom = 0.001;
      if (e === "in") camera.zoom(deltaZoom);
      if (e === "out") camera.zoom(-deltaZoom);
      if (e === "reset") camera.resetZoom();

      const prevDimen = game.getSize();
      resizer.resize(app, game);
      const nextDimen = game.getSize();
      const zoomedIn = nextDimen.height > prevDimen.height;

      const largerWidth = Math.max(prevDimen.width, nextDimen.width);
      const smallerWidth = Math.min(prevDimen.width, nextDimen.width);
      const diffWidth = smallerWidth / largerWidth;

      const largerHeight = Math.max(prevDimen.height, nextDimen.height);
      const smallerHeight = Math.min(prevDimen.height, nextDimen.height);
      const diffHeight = smallerHeight / largerHeight;

      const dragPos = systemDrag.getFocusPoint();
      const nextPos = {
         x: zoomedIn ? dragPos.x / diffWidth : dragPos.x * diffWidth,
         y: zoomedIn ? dragPos.y / diffHeight : dragPos.y * diffHeight,
      };
      systemDrag.setFocusPoint(nextPos);

      camera?.lookAt(systemDrag?.getFocusPoint());
   });

   bus.on("node", (e) => {
      if (e.count > store.count()) {
         while (e.count > store.count()) {
            const newNode = factory.create();
            store.push(newNode);
            systemNodeConnect?.setup();
         }
      }
      if (e.count < store.count()) {
         while (e.count < store.count()) {
            const node = store.pop();
            node?.destroy();
         }
         systemNodeConnect?.setup();
      }
   });

   bus.on("randSend", (e) => {
      try {
         const allNodes = store.data();
         const receivingNode = allNodes.find((n) => n.id() === e.toId);
         const sendingNode = allNodes.find((n) => n.id() === e.fromId);

         if (!sendingNode || !receivingNode) return;
         if (receivingNode.id() === e.fromId) return;

         sendingNode.sendBtc({ units: e.units, node: receivingNode });
      } catch (_) {}
   });

   bus.on("newTx", (e) => {
      const originNode = store.data().find((n) => n.id() === e.originId);
      if (!originNode) return;
      const connectingNodes = originNode.connections().getAll();
      connectingNodes.map((n) => {
         if (!n.receiveTx(e.tx)) return;
         systemMoveTx?.displayMovement({
            fromNode: originNode,
            toNode: n,
            txMsg: e.tx,
         });
      });
   });

   return {
      load: async () => {
         await assets.load();
         game.addChild(background.graphic);
         camera = createCamera({
            gameVars,
            bounds: background.size,
            clampCamera: false,
         });
         systemDrag = createDragSystem({
            gameVars,
            clamp: true,
            bounds: background.size,
         });
         systemNodeConnect = createNodeConnectionSystem({
            gameVars: gameVars,
            store: store,
         });
         systemMoveTx = createTxMessageSystem(gameVars);
         systemSendRandTx = createSendTxSystem({ store });

         setTimeout(() => {
            if (!systemDrag || !camera) return;
            const gridCenter = { x: game.width * 0.5, y: game.height * 0.5 };
            systemDrag.setFocusPoint(gridCenter);
            camera.lookAt(systemDrag?.getFocusPoint());
            bus.fire("node", { count: 19 });

            for (let i = 0; i < 500; i++) {
               setTimeout(() => bus.fire("zoom", "out"), i * 1.01);
            }
         }, 50);

         leftPaneCtrl = createLeftPaneControls(gameVars);
      },

      update: (tick: PIXI.Ticker) => {
         camera?.update(tick);
         leftPaneCtrl?.update(tick);
         if (systemDrag?.isDragging()) {
            camera?.lookAt(systemDrag?.getFocusPoint());
         }
         systemNodeConnect?.update(tick);
         systemMoveTx?.update(tick);
         systemSendRandTx?.update(tick);
      },
   };
};
