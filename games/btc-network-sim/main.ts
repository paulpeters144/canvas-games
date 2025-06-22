import { eBus } from "games/util/event-bus";
import * as PIXI from "pixi.js";
import { createGameAssets } from "./assets";
import { type Camera, createCamera } from "./camera";
import { createContextMenu } from "./ctx-menu";
import type { EventMap } from "./event-map";
import { type GameVars, createGameVars } from "./game.vars";
import { type LeftPaneCtrl, createLeftPaneControls } from "./left-pane.control";
import { createBackground } from "./model.background";
import { type DragSystem, createDragSystem } from "./system.pointer-drag";

export const bus = eBus<EventMap>();

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

   let camera: Camera | undefined;
   let dragSystem: DragSystem | undefined;
   let leftPaneCtrl: LeftPaneCtrl | undefined;

   const background = createBackground({ rows: 25, cols: 40 });

   window.addEventListener("resize", () => window.dispatchEvent(new CustomEvent("windowResize")));

   const windowResize = () => setTimeout(() => resizer.resize(app, game), 0);
   window.addEventListener("windowResize", windowResize);

   bus.on("zoom", (e) => {
      if (!dragSystem || !camera) return;
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

      const dragPos = dragSystem.getFocusPoint();
      const nextPos = {
         x: zoomedIn ? dragPos.x / diffWidth : dragPos.x * diffWidth,
         y: zoomedIn ? dragPos.y / diffHeight : dragPos.y * diffHeight,
      };
      dragSystem.setFocusPoint(nextPos);

      camera?.lookAt(dragSystem?.getFocusPoint());
   });

   bus.on("node", (payload) => {
      console.log("payload", payload);
   });

   return {
      load: async () => {
         await assets.load();
         game.addChild(background.graphic);
         camera = createCamera({ gameVars, bounds: background.size, clampCamera: true });
         dragSystem = createDragSystem({ gameVars, bounds: background.size });
         leftPaneCtrl = createLeftPaneControls(gameVars);
         createContextMenu({ app, assets });
      },

      update: (tick: PIXI.Ticker) => {
         camera?.update(tick);
         leftPaneCtrl?.update(tick);
         if (dragSystem?.isDragging()) {
            camera?.lookAt(dragSystem?.getFocusPoint());
         }
      },
   };
};
