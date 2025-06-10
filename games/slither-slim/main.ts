import { maybeResize } from "games/util";
import * as PIXI from "pixi.js";
import {
   type GameTiles,
   createGameTiles as createBackgroundTiles,
   loadTileTextures,
} from "./background-tiles";

export const BASE_PATH = "game-imgs/slither-slim";

export async function createSlitherSlimGame(app: PIXI.Application) {
   const sceneEngine = newSceneEngine(app);
   sceneEngine.next(gameScene);
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

   return {
      next: async (nextScene: (game: PIXI.ContainerChild) => IScene) => {
         game.removeChildren();
         game.removeAllListeners();

         if (gameTicker) gameTicker.destroy();

         currentScene = nextScene(game);
         const update = (tick: PIXI.Ticker) => {
            maybeResize({ app, game });
            currentScene?.update(tick);
         };
         gameTicker = new PIXI.Ticker().add(update);

         await currentScene.load(game);

         gameTicker.start();
      },
   };
};

export const gameScene = (game: PIXI.ContainerChild): IScene => {
   let gameTiles: GameTiles | undefined;

   return {
      load: async () => {
         const tileTextures = await loadTileTextures();
         gameTiles = createBackgroundTiles(tileTextures);
         gameTiles.tiles.map((t) => game.addChild(t.sprite));
      },

      update: (_tick: PIXI.Ticker) => {},
   };
};
