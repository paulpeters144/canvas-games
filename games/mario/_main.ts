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
import { type CollisionArea, ObjectModel, type StartPoint } from "./model.object";
import { SystemCloudsMove } from "./system/system.move-clouds";
import { SystemMarioMove } from "./system/system.move-mario";
import { createCamera } from "./util.camera";
import type { EventMap } from "./util.events";

export const bus = eBus<EventMap>();

// TODO
// create a camera follow system on mario

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
   const systemMove = new SystemMarioMove({ inputCtrl, gameRef: game });
   let systemCloud: SystemCloudsMove | undefined;

   const crtFilter = new CRTFilter({
      vignetting: 0.4,
      vignettingAlpha: 0.2,
   });

   let mario: MarioModel | undefined;

   const objects: (ObjectModel | CollisionArea)[] = [];
   const camera = createCamera(app, game);
   camera.addFilter(crtFilter);

   return {
      load: async () => {
         await assets.load();
         const jsonMetaData = await fetchAtlasMetadata();
         const atlasTexture = assets.getTexture("mario-atlas.png");
         const { objects: mapObjs, ctr } = await createTiledMap({
            json: jsonMetaData,
            atlas: atlasTexture,
         });
         game.addChild(ctr);
         game.addChild(
            ...mapObjs.collidables
               .filter((o) => o instanceof ObjectModel)
               .map((o) => o.sprite),
         );

         systemCloud = new SystemCloudsMove({
            cloudFactory: createCloudFactory({
               json: jsonMetaData,
               atlas: atlasTexture,
            }),
            game,
         });

         objects.push(...mapObjs.collidables);

         const spMario = (o: { name: string }) => o.name === "sp_mario";
         const marioStartPoint = mapObjs.startPoints.find(spMario);
         mario = new MarioModel(assets.getTexture("small-mario-spritesheet.png"));
         mario.anim.x = marioStartPoint?.pos.x ?? 0;
         mario.anim.y = marioStartPoint?.pos.y ?? 0;
         setFromStartPoint({ obj: mario.anim, startPoint: marioStartPoint });
         game.addChild(mario.anim);

         // camera.animate({
         //    position: { x: 50, y: 50 },
         // });
         camera.follow(mario.anim);
      },

      update: (tick: PIXI.Ticker) => {
         if (!mario) return;
         crtFilter.time += 0.5;
         crtFilter.seed = Math.random();
         systemMove.update({ tick, mario, objects });
         systemCloud?.update(tick);
      },
   };
};

const setFromStartPoint = (props: {
   obj: { x: number; y: number; width: number; height: number };
   startPoint?: StartPoint;
}) => {
   const { obj, startPoint } = props;
   if (!startPoint) return;
   obj.x = startPoint.pos.x - obj.width * 0.5;
   obj.y = startPoint.pos.y - obj.height;
};
