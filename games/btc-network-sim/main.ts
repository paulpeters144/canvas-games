import { eBus } from "games/util/event-bus";
import * as PIXI from "pixi.js";
import { createGameAssets } from "./assets";
import { type GameVars, createGameVars } from "./game.vars";
import { createCamera } from "./model.camera-2";
import { createBackground } from "./ui.background";
import { setMouseImages } from "./ui.mouse";
import {} from "./ui.node-ctrl";
import type { EventMap } from "./util.events";
import { createInputCtrl } from "./util.input-ctrl";

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

   app.stage.addChild(game);

   app.stage.addEventListener("pointermove", (e) => {
      gameVars.mouse.setPos({
         x: e.screenX,
         y: e.screenY,
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

export const gameScene = (gameVars: GameVars, app: PIXI.Application): IScene => {
   const { game, assets, resizer } = gameVars;

   const inputCtrl = createInputCtrl();

   const camera = createCamera({
      gameVars,
      clampCamera: true,
      app,
   });

   const background = createBackground({ rows: 50, cols: 50 });

   const sendResizeEvent = () => {
      window.dispatchEvent(new CustomEvent("windowResize"));
   };

   const preventCtxMenu = (e: MouseEvent) => e.preventDefault();

   const windowResize = () => resizer.resize(app);
   setTimeout(sendResizeEvent, 0);
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

   const greenSquare = new PIXI.Graphics()
      .rect(0, 0, 10, 10)
      .fill({ color: "lightgreen" });

   const redSquare = new PIXI.Graphics().rect(0, 0, 10, 10).fill({ color: "red" });

   const yellowSquare = new PIXI.Graphics()
      .rect(0, 0, 10, 10)
      .fill({ color: "yellow" });

   const blueSquare = new PIXI.Graphics()
      .rect(0, 0, 10, 10)
      .fill({ color: "lightblue" });

   const focusSquare = blueSquare;

   return {
      load: async () => {
         await assets.load();
         game.addChild(background.graphic);
         background.texts.map((t) => game.addChild(t));
         game.addChild(focusSquare);
         setTimeout(() => {
            focusSquare.position.set(game.width * 0.5, game.height * 0.5);
         }, 50);
      },

      update: (tick: PIXI.Ticker) => {
         if (inputCtrl.upArrow.data.pressed) focusSquare.y -= 3;
         if (inputCtrl.downArrow.data.pressed) focusSquare.y += 3;
         if (inputCtrl.leftArrow.data.pressed) focusSquare.x -= 3;
         if (inputCtrl.rightArrow.data.pressed) focusSquare.x += 3;
         if (inputCtrl.zoomIn.data.pressed) camera.zoomAdd(0.5);
         if (inputCtrl.zoomOut.data.pressed) camera.zoomAdd(-0.5);
         camera.update(tick);
         camera.lookAt({
            x: focusSquare.x + focusSquare.width * 0.5,
            y: focusSquare.y + focusSquare.height * 0.5,
         });
      },
   };
};

// const createBusListeningEvents = (props: {
//    gameVars: GameVars;
//    camera?: Camera;
//    systemDrag?: DragSystem;
//    store: NodeStore;
//    factory: NodeFactory;
//    systemNodeConnect?: ConnectionSystem;
//    systemMoveTx?: TxMessageSystem;
// }) => {
//    const {
//       gameVars,
//       camera,
//       systemDrag,
//       systemNodeConnect,
//       systemMoveTx,
//       store,
//       factory,
//    } = props;

//    const { game, app, resizer } = gameVars;

//    bus.on("zoom", (e) => {
//       if (!systemDrag || !camera) return;
//       const deltaZoom = 0.002;
//       if (e === "in") camera.zoom(deltaZoom);
//       if (e === "out") camera.zoom(-deltaZoom);
//       if (e === "reset") camera.resetZoom();

//       const prevDimen = game.getSize();
//       resizer.resize(app, game);
//       const nextDimen = game.getSize();

//       const zoomedIn = nextDimen.height > prevDimen.height;

//       const largerWidth = Math.max(prevDimen.width, nextDimen.width);
//       const smallerWidth = Math.min(prevDimen.width, nextDimen.width);
//       const diffWidth = smallerWidth / largerWidth;

//       const largerHeight = Math.max(prevDimen.height, nextDimen.height);
//       const smallerHeight = Math.min(prevDimen.height, nextDimen.height);
//       const diffHeight = smallerHeight / largerHeight;
//       const dragPos = systemDrag.getFocusPoint();
//       const nextPos = {
//          x: zoomedIn ? dragPos.x / diffWidth : dragPos.x * diffWidth,
//          y: zoomedIn ? dragPos.y / diffHeight : dragPos.y * diffHeight,
//       };
//       systemDrag.setFocusPoint(nextPos);

//       camera?.lookAt(systemDrag?.getFocusPoint());
//    });

//    bus.on("node", (e) => {
//       if (e.count > store.count()) {
//          while (e.count > store.count()) {
//             const newNode = factory.create();
//             store.push(newNode);
//             systemNodeConnect?.setup();
//          }
//       }
//       if (e.count < store.count()) {
//          while (e.count < store.count()) {
//             const node = store.pop();
//             node?.destroy();
//          }
//          systemNodeConnect?.setup();
//       }
//    });

//    bus.on("randSend", (e) => {
//       try {
//          const allNodes = store.data();
//          const receivingNode = allNodes.find((n) => n.ip() === e.toId);
//          const sendingNode = allNodes.find((n) => n.ip() === e.fromId);

//          if (!sendingNode || !receivingNode) return;
//          if (receivingNode.ip() === e.fromId) return;

//          sendingNode.sendBtc({ units: e.units, node: receivingNode });
//       } catch (_) {}
//    });

//    bus.on("newTx", (e) => {
//       const originNode = store.data().find((n) => n.ip() === e.originId);
//       if (!originNode) return;
//       const connectingNodes = originNode.connections().getAll();
//       connectingNodes.map((n) => {
//          if (!n.receiveTx(e.tx)) return;
//          systemMoveTx?.displayMovement({
//             fromNode: originNode,
//             toNode: n,
//             txMsg: e.tx,
//          });
//       });
//    });

//    setTimeout(() => {
//       if (!systemDrag || !camera) return;
//       const gridCenter = { x: game.width * 0.5, y: game.height * 0.5 };
//       systemDrag.setFocusPoint(gridCenter);
//       camera.lookAt(systemDrag?.getFocusPoint());
//       bus.fire("node", { count: 19 });

//       camera?.setZoom(0.6);
//       systemDrag.setFocusPoint({
//          x: app.screen.width * 0.8,
//          y: app.screen.height * 0.92,
//       });

//       window.dispatchEvent(new CustomEvent("windowResize"));
//       camera?.lookAt(systemDrag?.getFocusPoint());
//    }, 50);
// };
