import { eBus } from "games/util/event-bus";
import * as PIXI from "pixi.js";
import { createGameAssets } from "./assets";
import { createTiledMap, fetchAtlasMetadata } from "./game.atlas";
import { ZLayer } from "./game.enums";
import { type GameVars, createGameVars } from "./game.vars";
import { createInputCtrl } from "./input.control";
import { EntityModel } from "./model.entity";
import { SystemGravity } from "./system/system.gravity";
import { SystemJump } from "./system/system.jump";
import type { EventMap } from "./util.events";

export const bus = eBus<EventMap>();

export async function createMario1Dash1Level(app: PIXI.Application) {
   const game: PIXI.Container = new PIXI.Container();
   const assets = createGameAssets();
   const gameVars = createGameVars(game, assets);
   const sceneEngine = newSceneEngine(gameVars, app);
   sceneEngine.next(() => gameScene({ gameVars, app }));
}

export interface IScene {
   load: (game: PIXI.ContainerChild) => Promise<void>;
   update: (tick: PIXI.Ticker) => void;
}

export const newSceneEngine = (gameVars: GameVars, app: PIXI.Application) => {
   let gameTicker: PIXI.Ticker | undefined;
   let currentScene: IScene | undefined;
   const { game } = gameVars;
   game.zIndex = ZLayer.btm;
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

interface GameSceneProps {
   gameVars: GameVars;
   app: PIXI.Application;
}
export const gameScene = (props: GameSceneProps): IScene => {
   const { gameVars, app } = props;
   const { game, assets } = gameVars;

   const inputCtrl = createInputCtrl();
   const systemGravity = new SystemGravity();
   const systemJump = new SystemJump({ inputCtrl });

   // const crtFilter = new CRTFilter({
   //    curvature: 1.0,
   //    lineWidth: 1.3,
   //    lineContrast: 0.2,
   //    verticalLine: false,
   //    noiseSize: 0.1,
   //    noise: 0.1,
   //    vignetting: 0.4,
   //    vignettingAlpha: 0.15,
   //    vignettingBlur: 0.3,
   //    seed: 0.0,
   //    time: 0.5,
   // });

   // game.filters = [crtFilter];

   let mario: EntityModel | undefined;

   const objects: PIXI.Rectangle[] = [];

   return {
      load: async () => {
         await assets.load();
         const jsonMetaData = await fetchAtlasMetadata();
         const atlasTexture = assets.getTexture("mario-atlas.png");
         const tiledMap = await createTiledMap({
            json: jsonMetaData,
            atlas: atlasTexture,
         });
         game.addChild(tiledMap.ctr);
         objects.push(...tiledMap.objects);

         mario = new EntityModel(assets.getTexture("mario-stand.png"));
         game.addChild(mario.sprite);

         const resize = () => {
            const diff = app.screen.height / tiledMap.ctr.height;
            app.stage.scale.set(diff);
         };
         setTimeout(resize, 50);

         window.addEventListener("resize", () => setTimeout(() => resize, 500));
      },

      update: (tick: PIXI.Ticker) => {
         if (!mario) return;

         if (inputCtrl.btn.ArrowUp.data.pressed) mario.moveUp();
         if (inputCtrl.btn.ArrowRight.data.pressed) mario.moveRight();
         if (inputCtrl.btn.ArrowDown.data.pressed) mario.moveDown();
         if (inputCtrl.btn.ArrowLeft.data.pressed) mario.moveLeft();

         mario.update(tick);
         // crtFilter.time += 0.5;
         // crtFilter.seed = Math.random();

         systemGravity.update({ tick, entities: [mario], objects });
         systemJump.update({ mario });
      },
   };
};
