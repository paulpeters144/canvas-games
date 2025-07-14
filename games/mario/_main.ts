import { eBus } from "games/util/event-bus";
import * as PIXI from "pixi.js";
import { createGameAssets } from "./assets";
import { createGameAtlas } from "./game.atlas";
import { ZLayer } from "./game.enums";
import { type GameVars, createGameVars } from "./game.vars";
import type { EventMap } from "./util.events";

export const bus = eBus<EventMap>();

export async function createMario1Dash1Level(app: PIXI.Application) {
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

   window.addEventListener("gameModal", () => {
      app.stage.removeAllListeners();
      app.stage.removeChildren();
      gameTicker?.destroy();
      bus.clear();
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
   const { game, assets } = gameVars;

   return {
      load: async () => {
         await assets.load();
         await createGameAtlas(assets);
      },

      update: (tick: PIXI.Ticker) => {},
   };
};
