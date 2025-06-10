import { maybeResize } from "games/util";
import * as PIXI from "pixi.js";

export async function exampleGame(app: PIXI.Application) {
   const sceneEngine = newSceneEngine(app);
   sceneEngine.next(placeholderScene);
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

export const placeholderScene = (game: PIXI.ContainerChild): IScene => {
   return {
      load: async () => {
         const texture = await PIXI.Assets.load("game-imgs/space-game.png");
         const imageSprite = new PIXI.Sprite(texture);

         imageSprite.x = 0;
         imageSprite.y = 0;

         game.addChild(imageSprite);
      },

      update: (_tick: PIXI.Ticker) => {},
   };
};
