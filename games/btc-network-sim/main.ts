import { eBus } from "games/util/event-bus";
import * as PIXI from "pixi.js";
import { createGameAssets } from "./assets";
import { type NodeFactory, createNodeFactory } from "./factory.node";
import { ZLayer } from "./game.enums";
import { type GameVars, createGameVars } from "./game.vars";
import { type NodeStore, createNodeStore } from "./store.nodes";
import { type TxMessageSystem, createTxMessageSystem } from "./system.move-tx";
import {
   type ConnectionSystem,
   createNodeConnectionSystem,
} from "./system.node-connection";
import { setupNodeFocus } from "./system.node-focus";
import { createSendTxSystem } from "./system.send-txs";
import { createBackground } from "./ui.background";
import { createDataWidget } from "./ui.block-data";
import { setMouseImages } from "./ui.mouse";
import { createNodeCounterUI } from "./ui.node-ctrl";
import { type Camera, createCamera } from "./util.camera";
import type { EventMap } from "./util.events";

export const bus = eBus<EventMap>();

export async function createBtcNetworkSim(app: PIXI.Application) {
   const game: PIXI.Container = new PIXI.Container();
   const assets = createGameAssets();
   const gameVars = createGameVars(game, assets);
   const sceneEngine = newSceneEngine(gameVars, app);
   sceneEngine.next(() => gameScene(gameVars, app));
}

export interface IScene {
   load: (game: PIXI.ContainerChild) => Promise<void>;
   update: (tick: PIXI.Ticker) => void;
}

export const newSceneEngine = (gameVars: GameVars, app: PIXI.Application) => {
   let gameTicker: PIXI.Ticker | undefined;
   let currentScene: IScene | undefined;
   const { game } = gameVars;
   game.zIndex = ZLayer.bottom;
   app.stage.addChild(game);

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

export const gameScene = (gameVars: GameVars, app: PIXI.Application): IScene => {
   const { game, assets } = gameVars;

   const camera = createCamera(app, game);
   const background = createBackground({
      rows: 20,
      cols: 41,
   });
   const nodeCountUI = createNodeCounterUI(app);
   const store = createNodeStore();
   const factory = createNodeFactory({ gameVars, store });
   const systemNodeConnect = createNodeConnectionSystem({ gameVars, store });
   const systemMoveTx = createTxMessageSystem(gameVars);
   const systemSendTx = createSendTxSystem({ store });
   createDataWidget({
      game: game,
      camera,
      store: store,
      pixelSize: 2.01,
      width: 70,
      height: 95,
   });

   setMouseImages(app);

   createBusListeningEvents({
      gameVars,
      store,
      factory,
      systemNodeConnect,
      systemMoveTx,
      camera,
   });

   return {
      load: async () => {
         await assets.load();
         game.addChild(background.ctr);

         setTimeout(() => {
            camera.animate({
               time: 0,
               position: {
                  x: camera.worldWidth() / 2,
                  y: camera.worldHeight() / 2 - 10,
               },
               scale: 1.15,
               ease: "linear",
            });
            bus.fire("node", { count: 19 });
         }, 0);

         setTimeout(() => {
            const index = 0;
            const node = store.data()[index].anim;
            const e = {} as PIXI.FederatedPointerEvent;
            // node.emit("pointerdown", e);
         }, 100);
      },

      update: (tick: PIXI.Ticker) => {
         nodeCountUI.update(tick);
         systemSendTx.update(tick);
         systemMoveTx.update(tick);
      },
   };
};

const createBusListeningEvents = (props: {
   gameVars: GameVars;
   store: NodeStore;
   factory: NodeFactory;
   systemNodeConnect?: ConnectionSystem;
   systemMoveTx?: TxMessageSystem;
   camera: Camera;
}) => {
   const { systemNodeConnect, gameVars, systemMoveTx, store, factory, camera } =
      props;
   const { game } = gameVars;

   bus.on("node", (e) => {
      if (e.count > store.count()) {
         while (e.count > store.count()) {
            const newNode = factory.create();

            setupNodeFocus({
               game,
               camera,
               node: newNode,
               store,
            });

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
};
