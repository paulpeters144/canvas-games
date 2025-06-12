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
   let snakeMovement: snakeMovement | undefined;
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

         bus.on("keyPressed", (pos) => {
            if (!snake) return;
            const { head } = snake;
            if (pos === "up" && !head.direction.isFacing.down()) {
               head.direction.faceUp();
            }
            if (pos === "right" && !head.direction.isFacing.left()) {
               head.direction.faceRight();
            }
            if (pos === "down" && !head.direction.isFacing.up()) {
               head.direction.faceDown();
            }
            if (pos === "left" && !head.direction.isFacing.right()) {
               head.direction.faceLeft();
            }
         });
      },

      update: (tick: PIXI.Ticker) => {
         snake?.update(tick);
         camera?.lookAt(snake?.head.sprite.position);
         snakeMovement?.update(tick);
      },
   };
};

interface snakeMovement {
   update: (ticker: PIXI.Ticker) => void;
}

interface snakeMovementSystemProps {
   snake: Snake;
   gameTiles: GameTiles;
   initPos: { row: number; col: number };
}

const snakeMovementSystem = (props: snakeMovementSystemProps): snakeMovement => {
   const { snake, gameTiles, initPos } = props;

   place(snake).on(gameTiles).at(initPos);
   snake.head.direction.faceDown();
   move(snake).on(gameTiles).to(initPos);

   const update = (_ticker: PIXI.Ticker) => {};

   return { update };
};

const place = (snake: Snake) => {
   const on = (gameTiles: GameTiles) => {
      const at = (cords: { row: number; col: number }) => {
         const { row, col } = cords;
         const { x, y } = gameTiles.getTileFromIndexPos({ row, col }).sprite;
         snake.head.placeAt({ x, y });
      };
      return { at };
   };

   return { on };
};

const move = (snake: Snake) => {
   const on = (gameTiles: GameTiles) => {
      const to = (cords: { row: number; col: number }) => {
         const { row, col } = cords;

         const cordsInsideRowBounds = row <= gameTiles.sizeIdx.row && row >= 0;
         const cordsInsideColBounds = col <= gameTiles.sizeIdx.col && col >= 0;
         if (cordsInsideRowBounds && cordsInsideColBounds) {
            const { x, y } = gameTiles.getTileFromIndexPos({ row, col }).sprite;
            snake.head.moveTo({ x, y });
         }

         if (col < 0) {
            const { y } = gameTiles.getTileFromIndexPos({ row, col: 0 }).sprite;
            const xPos = -gameTiles.tiles[0].sprite.width;
            snake.head.moveTo({ x: xPos, y });
         }

         if (row < 0) {
            const { x } = gameTiles.getTileFromIndexPos({ row: 0, col }).sprite;
            const yPos = -gameTiles.tiles[0].sprite.height;
            snake.head.moveTo({ x, y: yPos });
         }

         if (row > gameTiles.sizeIdx.row) {
            const maxRow = gameTiles.sizeIdx.row - 1;
            const { x, y } = gameTiles.getTileFromIndexPos({ row: maxRow, col }).sprite;
            const yPos = y + gameTiles.tiles[0].sprite.height;
            snake.head.moveTo({ x, y: yPos });
         }

         if (col > gameTiles.sizeIdx.col) {
            const maxCol = gameTiles.sizeIdx.col - 1;
            const { x, y } = gameTiles.getTileFromIndexPos({ row, col: maxCol }).sprite;
            const xPos = x + gameTiles.tiles[0].sprite.width;
            snake.head.moveTo({ x: xPos, y });
         }
      };
      return { to };
   };
   return { on };
};
