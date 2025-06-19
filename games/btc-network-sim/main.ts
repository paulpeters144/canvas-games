// TODO:
// - [ ] the background contains a idxPos text in the middle of each tile
// - [ ] on game resize event, the game resizes itself

import { eBus } from "games/util/event-bus";
import * as PIXI from "pixi.js";
import { createGameAssets } from "./assets";
import { type Camera, createCamera, gameResizer } from "./camera";
import type { EventMap } from "./event-map";
import { createBackground } from "./model.background";
import { type DragSystem, createDragSystem } from "./system.pointer-drag";
import { type ZoomControl, createContextMenu, createZoomControls } from "./ui-controls";

export const bus = eBus<EventMap>();

export async function createBtcNetworkSim(app: PIXI.Application) {
   const sceneEngine = newSceneEngine(app);
   sceneEngine.next((game, app) => gameScene(game, app));
}

export interface IScene {
   load: (game: PIXI.ContainerChild) => Promise<void>;
   update: (tick: PIXI.Ticker) => void;
}

export const newSceneEngine = (app: PIXI.Application) => {
   let gameTicker: PIXI.Ticker | undefined;
   let currentScene: IScene | undefined;

   const game: PIXI.Container = new PIXI.Container();
   app.stage.addChild(game);

   setTimeout(() => gameResizer.resize(app, game), 0);

   return {
      next: async (nextScene: (game: PIXI.ContainerChild, app: PIXI.Application) => IScene) => {
         game.removeChildren();
         game.removeAllListeners();

         if (gameTicker) gameTicker.destroy();

         currentScene = nextScene(game, app);
         const update = (tick: PIXI.Ticker) => {
            currentScene?.update(tick);
         };
         gameTicker = new PIXI.Ticker().add(update);

         await currentScene.load(game);

         gameTicker.start();
      },
   };
};

export const gameScene = (game: PIXI.ContainerChild, app: PIXI.Application): IScene => {
   let camera: Camera | undefined;
   let dragSystem: DragSystem | undefined;
   const assets = createGameAssets();
   let zoomCtrl: ZoomControl | undefined;

   const { graphic, size, texts } = createBackground({ rows: 25, cols: 50 });

   window.addEventListener("resize", () => window.dispatchEvent(new CustomEvent("windowResize")));

   window.addEventListener("windowResize", () =>
      setTimeout(() => {
         gameResizer.resize(app, game);
         zoomCtrl?.updatePos(app);
      }, 0),
   );

   bus.on("zoom", (e) => {
      switch (e) {
         case "in":
            camera?.zoom(0.001);
            break;
         case "out":
            camera?.zoom(-0.001);
            break;
         case "reset":
            camera?.resetZoom();
            break;
      }
      gameResizer.resize(app, game);
      zoomCtrl?.updatePos(app);
   });

   return {
      load: async () => {
         await assets.load();
         game.addChild(graphic, ...texts);
         camera = createCamera({ app, game, bounds: size, clampCamera: true });
         dragSystem = createDragSystem({ app, game, bounds: size });
         zoomCtrl = createZoomControls({ app, assets });
         createContextMenu({ app, assets });
      },

      update: (tick: PIXI.Ticker) => {
         zoomCtrl?.update(tick);
         camera?.lookAt(dragSystem?.getFocusPoint());
      },
   };
};
