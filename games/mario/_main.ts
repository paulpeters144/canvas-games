import { eBus } from "games/util/event-bus";
import { CRTFilter } from "pixi-filters/crt";
import * as PIXI from "pixi.js";
import { createGameAssets } from "./assets";
import { createCloudFactory } from "./factory.cloud";
import { createTiledMap, fetchAtlasMetadata } from "./game.atlas";
import { ZLayer } from "./game.enums";
import { type GameVars, createGameVars } from "./game.vars";
import { createInputCtrl } from "./input.control";
import { MarioModel } from "./model.mario";
import { EntityStore } from "./store.entity";
import { SystemBlockAction } from "./system.block-animation/system.block-action";
import { SystemCoinAnimations } from "./system/system.coin.anim";
import { SystemGrowMarioAnimation } from "./system/system.mario-grow-anim";
import { SystemCloudsMove } from "./system/system.move-clouds";
import { SystemMarioMove } from "./system/system.move-mario";
import { SystemMushroomSpawn } from "./system/system.mushroom-grow";
import { createCamera } from "./util.camera";
import type { EventMap } from "./util.events";

export const bus = eBus<EventMap>();

// TODO
// mushroom to pop out of the 1 q block

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
   const entityStore = new EntityStore({ gameRef: game });
   const systemMove = new SystemMarioMove({ gameRef: game, inputCtrl, entityStore });
   const systemBlockAction = new SystemBlockAction({
      gameRef: game,
      entityStore,
      assets,
   });
   let systemCloud: SystemCloudsMove | undefined;
   const systemCoinAnim = new SystemCoinAnimations({
      gameRef: game,
      assets,
   });
   let systemMushroomSpawn: SystemMushroomSpawn | undefined;
   let systemGrowMario: SystemGrowMarioAnimation | undefined;

   const crtFilter = new CRTFilter({
      vignetting: 0.4,
      vignettingAlpha: 0.2,
   });

   const camera = createCamera(app, game);
   camera.addFilter(crtFilter);

   return {
      load: async () => {
         await assets.load();
         const jsonMetaData = await fetchAtlasMetadata();
         const atlasTexture = assets.getTexture("mario-atlas.png");
         const tileMapData = await createTiledMap({
            json: jsonMetaData,
            atlas: atlasTexture,
         });
         game.addChild(tileMapData.ctr);

         systemCloud = new SystemCloudsMove({
            cloudFactory: createCloudFactory({
               json: jsonMetaData,
               atlas: atlasTexture,
            }),
            game,
         });
         systemGrowMario = new SystemGrowMarioAnimation({
            gameRef: game,
            entityStore,
            assets,
            camera,
         });
         systemMushroomSpawn = new SystemMushroomSpawn({
            gameRef: game,
            assets,
            entityStore,
         });

         entityStore.add(...tileMapData.objects.collidables);

         const spMario = (o: { name: string }) => o.name === "sp_mario";
         const marioStartPoint = tileMapData.objects.startPoints.find(spMario);
         const mario = new MarioModel({
            smallMarioSheet: assets.getTexture("small-mario-spritesheet.png"),
            largeMarioSheet: assets.getTexture("large-mario-spritesheet.png"),
         });
         mario.anim.x = marioStartPoint?.pos.x ?? 0;
         mario.anim.y = marioStartPoint?.pos.y ?? 0;
         entityStore.add(mario);

         camera.follow(mario.anim);
         camera.clamp({
            left: 0,
            top: 0,
            right: tileMapData.metaData.width,
            bottom: tileMapData.metaData.height,
         });
      },

      update: (tick: PIXI.Ticker) => {
         crtFilter.time += 0.5;
         crtFilter.seed = Math.random();

         const marioState = entityStore.firstOrDefault(MarioModel)?.state || "";

         if (inputCtrl.btn["1"].wasPressedOnce && marioState === "small") {
            bus.fire("marioChange", "grow");
         }
         if (inputCtrl.btn["2"].wasPressedOnce && marioState === "big") {
            bus.fire("marioChange", "shrink");
         }

         systemMove.update(tick);
         systemCloud?.update(tick);
         systemBlockAction.update(tick);
         systemCoinAnim.update(tick);
         systemGrowMario?.update(tick);
         systemMushroomSpawn?.update(tick);
      },
   };
};
