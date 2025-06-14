import { collide } from "games/util/util";
import type * as PIXI from "pixi.js";
import type { GameTiles } from "./background-tiles";
import { bus } from "./main";
import type { Snake } from "./snake";
import { FaceDir } from "./snake.segment";

export interface SnakeMovement {
   update: (ticker: PIXI.Ticker) => void;
}

export interface SnakeMovementSystemProps {
   snake: Snake;
   gameTiles: GameTiles;
   initPos: { row: number; col: number };
}

export const snakeMovementSystem = (props: SnakeMovementSystemProps): SnakeMovement => {
   const { snake, gameTiles, initPos } = props;

   let nextPos = { ...initPos, direction: FaceDir.down };
   let queuePos = { ...initPos, direction: FaceDir.down };

   place(snake).on(gameTiles).at(initPos);
   snake.head.direction.faceDown();
   move(snake).on(gameTiles).to(initPos);

   bus.on("keyPressed", (pos) => {
      if (!snake) return;
      if (pos === "up") {
         if (snake.head.direction.isFacing.down()) return;
         queuePos = { ...nextPos, direction: FaceDir.up, row: nextPos.row - 1 };
      }
      if (pos === "right") {
         if (snake.head.direction.isFacing.left()) return;
         queuePos = { ...nextPos, direction: FaceDir.right, col: nextPos.col + 1 };
      }
      if (pos === "down") {
         if (snake.head.direction.isFacing.up()) return;
         queuePos = { ...nextPos, direction: FaceDir.down, row: nextPos.row + 1 };
      }
      if (pos === "left") {
         if (snake.head.direction.isFacing.right()) return;
         queuePos = { ...nextPos, direction: FaceDir.left, col: nextPos.col - 1 };
      }
   });

   let waitTime = 0;
   const headCollides = (tick: PIXI.Ticker) => {
      if (waitTime < 2500) {
         waitTime += tick.elapsedMS;
         return;
      }

      for (let i = 0; i < snake.body.length; i++) {
         const segment = snake.body[i];
         if (collide.circles(snake.head.sprite, segment.sprite)) {
            return true;
         }
      }
      return false;
   };

   const update = (tick: PIXI.Ticker) => {
      if (headCollides(tick)) {
         bus.fire("gameEvent", "gameOver");
      }

      if (!snake.head.isIdle()) return;

      let prevSegment = snake.head;
      for (let i = 0; i < snake.body.length; i++) {
         const { x, y } = prevSegment.sprite;
         const segment = snake.body[i];
         segment.moveTo({ x, y });
         prevSegment = segment;
      }

      nextPos = { ...queuePos };

      if (nextPos.direction === FaceDir.up) {
         snake.head.direction.faceUp();
         move(snake).on(gameTiles).to(nextPos);
         queuePos = { ...nextPos, direction: FaceDir.up, row: nextPos.row - 1 };
      }
      if (nextPos.direction === FaceDir.right) {
         snake.head.direction.faceRight();
         move(snake).on(gameTiles).to(nextPos);
         queuePos = { ...nextPos, direction: FaceDir.right, col: nextPos.col + 1 };
      }
      if (nextPos.direction === FaceDir.down) {
         snake.head.direction.faceDown();
         move(snake).on(gameTiles).to(nextPos);
         queuePos = { ...nextPos, direction: FaceDir.down, row: nextPos.row + 1 };
      }
      if (nextPos.direction === FaceDir.left) {
         snake.head.direction.faceLeft();
         move(snake).on(gameTiles).to(nextPos);
         queuePos = { ...nextPos, direction: FaceDir.left, col: nextPos.col - 1 };
      }
   };

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

         const cordsInsideRowBounds = row < gameTiles.sizeIdx.row && row >= 0;
         const cordsInsideColBounds = col < gameTiles.sizeIdx.col && col >= 0;
         if (cordsInsideRowBounds && cordsInsideColBounds) {
            const { x, y } = gameTiles.getTileFromIndexPos(cords).sprite;
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

         if (row >= gameTiles.sizeIdx.row) {
            const maxRow = gameTiles.sizeIdx.row - 1;
            const { x, y } = gameTiles.getTileFromIndexPos({ row: maxRow, col }).sprite;
            const yPos = y + gameTiles.tiles[0].sprite.height;
            snake.head.moveTo({ x, y: yPos });
         }

         if (col >= gameTiles.sizeIdx.col) {
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
