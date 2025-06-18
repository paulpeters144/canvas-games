import { eBus } from "games/util/event-bus";
import { maybeResize, resizeGame } from "games/util/util";
import * as PIXI from "pixi.js";
import { type Apples, loadApples } from "./apple";
import {
   type GameTile,
   type GameTiles,
   createGameTiles as createBackgroundTiles,
   loadTileTextures,
} from "./background-tiles";
import { type Camera, createCamera } from "./camera";
import { GameState, ZLayer } from "./enum";
import type { EventMap } from "./event-map";
import { type Snake, createSnake, loadSnakeTextures } from "./snake";
import { type SnakeMovement, snakeMovementSystem } from "./system.snake-movement";

export const BASE_PATH = "game-imgs/slither-slim";

let HIGH_SCORE = 0;
export const ASSET_SCALE = 3.25;

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
   let apples: Apples | undefined;
   const scoreText = createScoreText();
   const pregameOverlay = createPregameOverlay();
   let state: GameState = GameState.paused;

   const resetGame = () => {
      if (!snake || !gameTiles || !apples) return;

      const initSnakePos = { snake, gameTiles, initPos: { row: 5, col: 5 } };
      snakeMovement = snakeMovementSystem(initSnakePos);
      snake.reset(game);
      snake.addSegment(game);
      scoreText.setScore(snake?.body.length);

      apples.reset(game);
      Array.from({ length: 12 }).map(() => addRandomApple());
   };

   const addRandomApple = () => {
      const nextApplePos = fromOpenTiles({ gameTiles, snake, apples }).getRandomTile();
      const pos = { x: nextApplePos.sprite.x, y: nextApplePos.sprite.y };
      apples?.createApple({ game, pos });
   };

   bus.on("keyPressed", (e) => {
      if (e === "enter" && state === GameState.paused) {
         state = GameState.play;
         scoreText.setVisible(true);
         pregameOverlay.setVisible(false);
         resetGame();
      }
   });

   bus.on("gameEvent", (e) => {
      if (e === "gameOver" && state === GameState.play) {
         snake?.died();
         state = GameState.paused;
         scoreText.setVisible(false);
         pregameOverlay.setVisible(true);
      }
   });

   return {
      load: async () => {
         const tileTexture = await loadTileTextures();
         gameTiles = createBackgroundTiles({
            texture: tileTexture,
            gridSize: { row: 15, col: 20 },
         });
         gameTiles.tiles.map((t) => game.addChild(t.sprite));

         snake = await loadSnakeTextures().then((t) => createSnake(t));
         if (!snake?.head) throw new Error("snake head did not load");
         game.addChild(snake.head.sprite);

         apples = await loadApples();

         snakeMovement = snakeMovementSystem({ snake, gameTiles, initPos: { row: 5, col: 5 } });

         scoreText.addToApp(app);

         pregameOverlay.addTo(game);

         camera = createCamera({ app, game, bounds: gameTiles.size });
      },

      update: (tick: PIXI.Ticker) => {
         if (!snake || !gameTiles || !apples) return;

         if (state === GameState.paused) {
            pregameOverlay.update(camera);
         }

         if (state === GameState.play) {
            snake.update(tick);
            snakeMovement?.update(tick);
            if (isOutOfBounds({ snake, bounds: gameTiles.size })) {
               bus.fire("gameEvent", "gameOver");
            }
            for (const apple of apples.list()) {
               if (collide.circles(snake.head.sprite, apple.sprite)) {
                  const { id } = apple;
                  apples.remove({ game, id });
                  snake.addSegment(game);
                  scoreText.setScore(snake?.body.length);
                  addRandomApple();
               }
            }
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
      text: "LENGTH: 0",
   });
   text.resolution = 2;
   text.zIndex = ZLayer.top;

   const graphics = new PIXI.Graphics()
      .roundRect(0, 0, 100, 100, 6)
      .fill({ color: "#000000", alpha: 0.5 });
   graphics.zIndex = ZLayer.top;

   const addTo = (game: PIXI.Container) => {
      game.addChild(graphics);
      game.addChild(text);
   };

   const addToApp = (app: PIXI.Application) => {
      app.stage.addChild(graphics);
      app.stage.addChild(text);
      graphics.position.set(3, 3);
      text.position.set(7, 5);
   };

   const setVisible = (value: boolean) => {
      text.visible = value;
      graphics.visible = value;
   };

   setVisible(false);

   const setScore = (score?: number) => {
      const nextScore = (score || 0) + 1;
      text.text = `LENGTH: ${nextScore}`;
      HIGH_SCORE = Math.max(nextScore, HIGH_SCORE);
      graphics.width = text.width + 5;
      graphics.height = text.height + 5;
   };

   return { addTo, setVisible, setScore, addToApp };
};

const createPregameOverlay = () => {
   const fontFamily = "GraphPix";
   const fill = "#FFFFFF";

   const titleTextStyle = new PIXI.TextStyle({ fontFamily, fontSize: 40, fill });
   const titleText = new PIXI.Text({ style: titleTextStyle });
   titleText.resolution = 2;
   titleText.text = "SLITHER SLIM";
   titleText.zIndex = ZLayer.top;

   const regTextStyle = new PIXI.TextStyle({ fontFamily, fontSize: 18, fill });

   const scoreText = new PIXI.Text({ style: regTextStyle });
   scoreText.resolution = 2;
   scoreText.text = `HIGH SCORE: ${HIGH_SCORE}`;
   scoreText.scale.set(0.75);
   scoreText.zIndex = ZLayer.top;

   const commandText = new PIXI.Text({ style: regTextStyle });
   commandText.resolution = 2;
   commandText.text = "Press “ENTER” to begin";
   commandText.zIndex = ZLayer.top;

   const graphics = new PIXI.Graphics()
      .rect(0, 0, 100, 100)
      .fill({ color: "#000000", alpha: 0.65 });
   graphics.zIndex = ZLayer.top;

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
         graphics.width = viewport.width + 10;
         graphics.height = viewport.height + 10;
      }

      graphics.position.set(posZero.x - 5, posZero.y - 5);

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
      scoreText.text = `HIGH SCORE: ${HIGH_SCORE}`;
   };

   return { addTo, update, setVisible };
};

const fromOpenTiles = ({
   gameTiles,
   snake,
   apples,
}: { gameTiles?: GameTiles; snake?: Snake; apples?: Apples }) => {
   if (!gameTiles) throw new Error("in fromOpenTiles(), gameTiles not defined");
   if (!snake) throw new Error("in fromOpenTiles(), snake not defined");
   if (!apples) throw new Error("in fromOpenTiles(), apples not defined");

   const openTiles: GameTile[] = [];
   for (let i = 0; i < gameTiles.tiles.length; i++) {
      const tile = gameTiles.tiles[i];
      let spritesCollide = false;

      for (let x = 0; x < snake.body.length; x++) {
         if (spritesCollide) break;

         const segment = snake.body[x];
         const collision = collide.squares(segment.sprite, tile.sprite);
         if (collision) spritesCollide = true;
      }

      const applesList = apples.list();
      for (let x = 0; x < applesList.length; x++) {
         if (spritesCollide) break;

         const apple = applesList[x];
         const collides = collide.squares(apple.sprite, tile.sprite);
         if (collides) spritesCollide = true;
      }

      if (!spritesCollide) {
         openTiles.push(tile);
      }
   }

   const getRandomTile = () => {
      if (openTiles.length === 0) throw new Error("empty game tiles");
      const randIdx = Math.floor(Math.random() * openTiles.length);
      const result = openTiles[randIdx];
      return result;
   };

   return { getRandomTile };
};

export const collide = {
   circles: (sprite1: PIXI.Sprite, sprite2: PIXI.Sprite): boolean => {
      const buffer = 8;
      const circle1 = {
         x: sprite1.x,
         y: sprite1.y,
         radius: sprite1.width * 0.5 - buffer,
      };
      const circle2 = {
         x: sprite2.x,
         y: sprite2.y,
         radius: sprite2.width * 0.5,
      };

      const dx = circle1.x - circle2.x;
      const dy = circle1.y - circle2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance < circle1.radius + circle2.radius;
   },

   squares: (sprite1: PIXI.Sprite, sprite2: PIXI.Sprite): boolean => {
      const bounds1 = sprite1.getBounds();
      const bounds2 = sprite2.getBounds();

      const xOverlap = bounds1.left < bounds2.right && bounds1.right > bounds2.left;
      const yOverlap = bounds1.top < bounds2.bottom && bounds1.bottom > bounds2.top;

      return xOverlap && yOverlap;
   },
};

export const isOutOfBounds = (props: {
   snake: Snake;
   bounds: { width: number; height: number };
}) => {
   const { snake, bounds } = props;
   const rect = {
      x: snake.head.sprite.x,
      y: snake.head.sprite.y,
      width: snake.head.sprite.width,
      height: snake.head.sprite.height,
   };

   const buffer = rect.width * 0.35;
   if (rect.x - buffer < 0) return true;
   if (rect.y - buffer < 0) return true;
   if (rect.x + buffer > bounds.width) return true;
   if (rect.y + buffer > bounds.height) return true;

   return false;
};
