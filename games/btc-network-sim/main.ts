// TODO:
// - [ ] need to encapsulate the scaling of the game. it's getting complicated.
//          will need to keep the scaling of the game and the camera in the same place,
//          since they are related and work with each other.

import * as PIXI from "pixi.js";
import { createGameAssets } from "./assets";
import { type Camera, createCamera, gameResizer, maybeResize } from "./camera";
import { createBackground } from "./model.background";
import { createDragSystem } from "./system.pointer-drag";
import { createContextMenu, createZoomControls } from "./ui-controls";

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

   setTimeout(() => gameResizer.resize(app), 0);

   return {
      next: async (nextScene: (game: PIXI.ContainerChild, app: PIXI.Application) => IScene) => {
         game.removeChildren();
         game.removeAllListeners();

         if (gameTicker) gameTicker.destroy();

         currentScene = nextScene(game, app);
         const update = (tick: PIXI.Ticker) => {
            maybeResize(app);
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
   const assets = createGameAssets();

   const { graphic, size } = createBackground({ rows: 25, cols: 35 });
   const { getFocusPoint } = createDragSystem({ game, size });

   window.addEventListener("keydown", (e) => {
      switch (e.code) {
         case "ArrowUp":
            camera?.zoom(0.005);
            gameResizer.resize(app);
            break;
         case "ArrowDown":
            camera?.zoom(-0.005);
            gameResizer.resize(app);
            break;
      }
   });

   return {
      load: async () => {
         await assets.load();
         game.addChild(graphic);
         camera = createCamera({ app, game, bounds: size, clampCamera: true });

         createZoomControls({ app, assets });
         createContextMenu({ app, assets });
      },

      update: () => {
         camera?.lookAt(getFocusPoint());
      },
   };
};
