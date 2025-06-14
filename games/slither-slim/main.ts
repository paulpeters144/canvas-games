import { eBus } from "games/util/event-bus";
import { type Camera, createCamera, maybeResize } from "games/util/util";
import * as PIXI from "pixi.js";
import {
   type GameTiles,
   createGameTiles as createBackgroundTiles,
   loadTileTextures,
} from "./background-tiles";
import type { EventMap } from "./event-map";
import { type Snake, createSnake, loadSnakeTextures } from "./snake";
import { type SnakeMovement, snakeMovementSystem } from "./system.snake-movement";

// TODO:
// - [ ] snake moves from box to box smoothly

export const BASE_PATH = "game-imgs/slither-slim";
export const FONT_STYLE = new PIXI.TextStyle({
   fontFamily: "Consolas",
   fontSize: 8,
   fill: "#000000",
});

export const bus = eBus<EventMap>();

export async function createSlitherSlimGame(app: PIXI.Application) {
   const sceneEngine = newSceneEngine(app);
   sceneEngine.next(gameScene);

   window.addEventListener("keydown", (e) => {
      switch (e.code) {
         case "ArrowUp":
            bus.fire("keyPressed", "up");
            break;
         case "ArrowRight":
            bus.fire("keyPressed", "right");
            break;
         case "ArrowDown":
            bus.fire("keyPressed", "down");
            break;
         case "ArrowLeft":
            bus.fire("keyPressed", "left");
            break;
      }
   });
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
   let gameTiles: GameTiles | undefined;
   let snake: Snake | undefined;
   let camera: Camera | undefined;
   let snakeMovement: SnakeMovement | undefined;
   return {
      load: async () => {
         const tileTextures = await loadTileTextures();
         gameTiles = createBackgroundTiles({
            textures: tileTextures,
            gridSize: { row: 20, col: 25 },
         });
         gameTiles.tiles.map((t) => game.addChild(t.sprite));
         gameTiles.displayPosIndexes(game);

         snake = await loadSnakeTextures().then((t) => createSnake(t));
         if (!snake?.head) throw new Error("snake head did not load");
         game.addChild(snake.head.sprite);

         snakeMovement = snakeMovementSystem({ snake, gameTiles, initPos: { row: 5, col: 5 } });

         camera = createCamera({ app, game, bounds: gameTiles.size });
      },

      update: (tick: PIXI.Ticker) => {
         snake?.update(tick);
         camera?.lookAt(snake?.head.sprite.position);
         snakeMovement?.update(tick);
      },
   };
};
