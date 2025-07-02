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
import { setMouseImages } from "./ui.mouse";
import { type NodeCounterUI, createNodeCounterUI } from "./ui.node-ctrl";
import type { EventMap } from "./util.events";
import { createInputCtrl } from "./util.input-ctrl";

export const bus = eBus<EventMap>();

// TODO:
// - camera updates
//    - create a controller for the camera
//       - only use the ctrl for the camera
//    - move camera from points a to b smoothly
//    - use ctrl + "+/-" for zoom in an out, like in figma

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
   const { game, app } = gameVars;

   app.stage.addChild(game);

   app.stage.addEventListener("pointermove", (e) => {
      gameVars.mouse.setPos({
         x: e.screenX / gameVars.scaler.getBaseScale(),
         y: e.screenY / gameVars.scaler.getBaseScale(),
      });
   });

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
   let nodeCounterUI: NodeCounterUI | undefined;
   const store: NodeStore = createNodeStore();
   const factory: NodeFactory = createNodeFactory({ gameVars, store });
   const inputCtrl = createInputCtrl();

   const background = createBackground({ rows: 30, cols: 46 });

   const sendResizeEvent = () => {
      window.dispatchEvent(new CustomEvent("windowResize"));
   };

   const preventCtxMenu = (e: MouseEvent) => e.preventDefault();

   const windowResize = () => {
      resizer.resize(app, game);
      nodeCounterUI?.resize();
   };

   window.addEventListener("resize", () => setTimeout(sendResizeEvent, 0));
   window.addEventListener("windowResize", windowResize);
   app.canvas.addEventListener("contextmenu", preventCtxMenu);
   app.stage.interactive = true;

   setMouseImages(app);

   window.addEventListener("gameModal", () => {
      inputCtrl.destroy();
      bus.clear();
      try {
         window.removeEventListener("resize", sendResizeEvent);
         window.removeEventListener("windowResize", windowResize);
         app.canvas.removeEventListener("contextmenu", preventCtxMenu);
      } catch (_) {}
   });

   // setTimeout(() => {
   //    const firstNode = store.data()[0].anim;
   //    const pos = {
   //       x:
   //          (firstNode.x + firstNode.width * 0.5) * gameVars.scaler.getGameScale() +
   //          100,
   //       y:
   //          (firstNode.y + firstNode.height * 0.5) * gameVars.scaler.getGameScale() +
   //          30,
   //    };
   //    systemDrag?.setFocusPoint(pos);

   //    camera?.moveTo(pos, 1.5);
   // }, 2500);

   bus.on("zoom", (e) => {
      if (!systemDrag || !camera) return;
      const deltaZoom = 0.002;
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
      // camera?.lookAt(pos);
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
         const receivingNode = allNodes.find((n) => n.ip() === e.toId);
         const sendingNode = allNodes.find((n) => n.ip() === e.fromId);

         if (!sendingNode || !receivingNode) return;
         if (receivingNode.ip() === e.fromId) return;

         sendingNode.sendBtc({ units: e.units, node: receivingNode });
      } catch (_) {}
   });

   bus.on("newTx", (e) => {
      const originNode = store.data().find((n) => n.ip() === e.originId);
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
            clampCamera: true,
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

         nodeCounterUI = createNodeCounterUI({ gameVars });

         setTimeout(() => {
            if (!systemDrag || !camera) return;
            const gridCenter = { x: game.width * 0.5, y: game.height * 0.5 };
            systemDrag.setFocusPoint(gridCenter);
            camera.lookAt(systemDrag?.getFocusPoint());
            bus.fire("node", { count: 19 });

            camera?.setZoom(0.6);
            systemDrag.setFocusPoint({
               x: app.screen.width * 0.8,
               y: app.screen.height * 0.92,
            });

            window.dispatchEvent(new CustomEvent("windowResize"));
            camera?.lookAt(systemDrag?.getFocusPoint());
         }, 50);

         // leftPaneCtrl = createLeftPaneControls(gameVars);
      },

      update: (tick: PIXI.Ticker) => {
         nodeCounterUI?.update(tick);
         camera?.update(tick);
         if (systemDrag?.isDragging()) {
            camera?.lookAt(systemDrag?.getFocusPoint());
         }
         systemNodeConnect?.update(tick);
         systemMoveTx?.update(tick);
         systemSendRandTx?.update(tick);
      },
   };
};
