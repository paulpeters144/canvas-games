import { eBus } from "games/util/event-bus";
import { type Camera, createCamera, maybeResize, resizeGame } from "games/util/util";
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
// - [ ] show default image for mobile devices
// - [ ] remove all TODOs, they aren't needed cept here
// - [ ] add out of bounds detection
// - [ ] add game over loop
// - [ ] add the zLayer to everything added to game

export const BASE_PATH = "game-imgs/slither-slim";
export const FONT_STYLE = new PIXI.TextStyle({
   fontFamily: "GraphPix",
   fontSize: 6,
   fill: "#000000",
});

export const PIXEL_FON_STYLE = new PIXI.TextStyle({
   fontFamily: "GraphPix",
   fontSize: 8,
   fill: "#000000",
});

export enum ZLayer {
   bot = 0,
   mid = 1,
   top = 2,
}

export enum GameState {
   paused = 0,
   play = 1,
}

export const bus = eBus<EventMap>();

export async function createSlitherSlimGame(app: PIXI.Application) {
   const sceneEngine = newSceneEngine(app);
   sceneEngine.next((game, app) => gameScene(game, app));

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
         case "Enter":
            bus.fire("keyPressed", "enter");
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

   setTimeout(() => resizeGame(app), 0);

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
   const scoreText = createScoreText();
   const pregameOverlay = createPregameOverlay();
   let state: GameState = GameState.paused;

   const resetGame = () => {
      if (!snake || !gameTiles) return;
      snakeMovement = snakeMovementSystem({ snake, gameTiles, initPos: { row: 5, col: 5 } });
      snake.reset(game);
   };

   bus.on("keyPressed", (e) => {
      if (e === "enter" && state === GameState.paused) {
         state = GameState.play;
         scoreText.setVisible(true);
         pregameOverlay.setVisible(false);
         resetGame();
      }
   });

   return {
      load: async () => {
         const tileTextures = await loadTileTextures();
         gameTiles = createBackgroundTiles({
            textures: tileTextures,
            gridSize: { row: 20, col: 25 },
         });
         gameTiles.tiles.map((t) => game.addChild(t.sprite));

         snake = await loadSnakeTextures().then((t) => createSnake(t));
         if (!snake?.head) throw new Error("snake head did not load");
         game.addChild(snake.head.sprite);

         snakeMovement = snakeMovementSystem({ snake, gameTiles, initPos: { row: 5, col: 5 } });

         scoreText.addTo(game);

         pregameOverlay.addTo(game);

         camera = createCamera({ app, game, bounds: gameTiles.size });
      },

      update: (tick: PIXI.Ticker) => {
         if (state === GameState.paused) {
            pregameOverlay.update(camera);
         }

         if (state === GameState.play) {
            snake?.update(tick);
            snakeMovement?.update(tick);
            scoreText.setPos(camera?.posZero);
         }
         camera?.lookAt(snake?.head.sprite.position);
      },
   };
};

const createScoreText = () => {
   const text = new PIXI.Text({
      style: new PIXI.TextStyle({
         fontFamily: "GraphPix",
         fontSize: 10,
         fill: "#FFFFFF",
      }),
      text: "SCORE: 10",
   });
   text.resolution = 2;

   const graphics = new PIXI.Graphics()
      .roundRect(0, 0, 100, 100, 6)
      .fill({ color: "#000000", alpha: 0.5 });

   const addTo = (game: PIXI.Container) => {
      game.addChild(graphics);
      game.addChild(text);
   };

   const setPos = (pos: { x: number; y: number } | undefined) => {
      if (!pos) return;

      const { x, y } = pos;
      text.position.set(x + 8, y + 5);
      graphics.width = text.width + 5;
      graphics.height = text.height + 5;
      graphics.position.set(x + 4, y + 3);
   };

   const setVisible = (value: boolean) => {
      text.visible = value;
      graphics.visible = value;
   };

   setVisible(false);

   return { addTo, setPos, setVisible };
};

const createPregameOverlay = () => {
   const fontFamily = "GraphPix";
   const fill = "#FFFFFF";

   const titleTextStyle = new PIXI.TextStyle({ fontFamily, fontSize: 40, fill });
   const titleText = new PIXI.Text({ style: titleTextStyle });
   titleText.resolution = 2;
   titleText.text = "SLITHER SLIM";

   const regTextStyle = new PIXI.TextStyle({ fontFamily, fontSize: 18, fill });

   const scoreText = new PIXI.Text({ style: regTextStyle });
   scoreText.resolution = 2;
   scoreText.text = "HIGH SCORE: 0";
   scoreText.scale.set(0.75);

   const commandText = new PIXI.Text({ style: regTextStyle });
   commandText.resolution = 2;
   commandText.text = "Press “ENTER” to begin";

   const graphics = new PIXI.Graphics()
      .rect(0, 0, 100, 100)
      .fill({ color: "#000000", alpha: 0.65 });

   const addTo = (game: PIXI.Container) => {
      game.addChild(graphics);
      game.addChild(titleText);
      game.addChild(commandText);
      game.addChild(scoreText);
   };

   const update = (camera?: Camera) => {
      if (!camera) return;

      const { posZero, viewport } = camera;

      const equalWidth = viewport.width === graphics.width;
      const equalHeight = viewport.height === graphics.height;
      if (!equalWidth || !equalHeight) {
         graphics.width = viewport.width;
         graphics.height = viewport.height;
      }

      graphics.position.set(posZero.x, posZero.y);

      const titleXOffset = viewport.width * 0.5 - titleText.width * 0.5;
      titleText.position.set(posZero.x + titleXOffset, posZero.y + 50);

      const scoreXOffset = viewport.width * 0.5 - scoreText.width * 0.5;
      scoreText.position.set(posZero.x + scoreXOffset, posZero.y + 225);

      const commandXOffset = viewport.width * 0.5 - commandText.width * 0.5;
      commandText.position.set(posZero.x + commandXOffset, posZero.y + 400);
   };

   const setVisible = (value: boolean) => {
      graphics.visible = value;
      titleText.visible = value;
      scoreText.visible = value;
      commandText.visible = value;
   };

   return { addTo, update, setVisible };
};
