import type * as PIXI from "pixi.js";
import type { GameTiles } from "./background-tiles";
import { bus } from "./main";
import type { Snake } from "./snake";

export interface SnakeMovement {
   update: (ticker: PIXI.Ticker) => void;
}

export interface SnakeMovementSystemProps {
   snake: Snake;
   gameTiles: GameTiles;
   initPos: { row: number; col: number };
}

enum faceDir {
   up = 0,
   right = 1,
   down = 2,
   left = 3,
}

export const snakeMovementSystem = (props: SnakeMovementSystemProps): SnakeMovement => {
   const { snake, gameTiles, initPos } = props;

   let nextPos = { ...initPos, direction: faceDir.down };
   let queuePos = { ...initPos, direction: faceDir.down };

   place(snake).on(gameTiles).at(initPos);
   snake.head.direction.faceDown();
   move(snake).on(gameTiles).to(initPos);

   bus.on("keyPressed", (pos) => {
      if (!snake) return;
      if (pos === "up") {
         if (snake.head.direction.isFacing.down()) return;
         queuePos = { ...nextPos, direction: faceDir.up, row: nextPos.row - 1 };
      }
      if (pos === "right") {
         if (snake.head.direction.isFacing.left()) return;
         queuePos = { ...nextPos, direction: faceDir.right, col: nextPos.col + 1 };
      }
      if (pos === "down") {
         if (snake.head.direction.isFacing.up()) return;
         queuePos = { ...nextPos, direction: faceDir.down, row: nextPos.row + 1 };
      }
      if (pos === "left") {
         if (snake.head.direction.isFacing.right()) return;
         queuePos = { ...nextPos, direction: faceDir.left, col: nextPos.col - 1 };
      }
   });

   const update = (_: PIXI.Ticker) => {
      if (!snake.head.isIdle()) return;

      nextPos = { ...queuePos };

      if (nextPos.direction === faceDir.up) {
         snake.head.direction.faceUp();
         move(snake).on(gameTiles).to(nextPos);
         queuePos = { ...nextPos, direction: faceDir.up, row: nextPos.row - 1 };
      }
      if (nextPos.direction === faceDir.right) {
         snake.head.direction.faceRight();
         move(snake).on(gameTiles).to(nextPos);
         queuePos = { ...nextPos, direction: faceDir.right, col: nextPos.col + 1 };
      }
      if (nextPos.direction === faceDir.down) {
         snake.head.direction.faceDown();
         move(snake).on(gameTiles).to(nextPos);
         queuePos = { ...nextPos, direction: faceDir.down, row: nextPos.row + 1 };
      }
      if (nextPos.direction === faceDir.left) {
         snake.head.direction.faceLeft();
         move(snake).on(gameTiles).to(nextPos);
         queuePos = { ...nextPos, direction: faceDir.left, col: nextPos.col - 1 };
      }
   };

   return { update };
};

const place = (snake: Snake) => {
   const on = (gameTiles: GameTiles) => {
      const at = (cords: { row: number; col: number }) => {
         const { row, col } = cords;
         const { x, y } = gameTiles.getTileFromIndexPos({ row, col }).sprite;
         const props = { pos: { x, y }, idxPos: cords };
         snake.head.placeAt(props);
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
            const props = { pos: { x, y }, idxPos: cords };
            snake.head.moveTo(props);
         }

         if (col < 0) {
            const { y } = gameTiles.getTileFromIndexPos({ row, col: 0 }).sprite;
            const xPos = -gameTiles.tiles[0].sprite.width;
            const props = { pos: { x: xPos, y }, idxPos: cords };
            snake.head.moveTo(props);
         }

         if (row < 0) {
            const { x } = gameTiles.getTileFromIndexPos({ row: 0, col }).sprite;
            const yPos = -gameTiles.tiles[0].sprite.height;
            const props = { pos: { x, y: yPos }, idxPos: cords };
            snake.head.moveTo(props);
         }

         if (row >= gameTiles.sizeIdx.row) {
            const maxRow = gameTiles.sizeIdx.row - 1;
            const { x, y } = gameTiles.getTileFromIndexPos({ row: maxRow, col }).sprite;
            const yPos = y + gameTiles.tiles[0].sprite.height;
            const props = { pos: { x, y: yPos }, idxPos: cords };
            snake.head.moveTo(props);
         }

         if (col >= gameTiles.sizeIdx.col) {
            const maxCol = gameTiles.sizeIdx.col - 1;
            const { x, y } = gameTiles.getTileFromIndexPos({ row, col: maxCol }).sprite;
            const xPos = x + gameTiles.tiles[0].sprite.width;
            const props = { pos: { x: xPos, y }, idxPos: cords };
            snake.head.moveTo(props);
         }
      };
      return { to };
   };
   return { on };
};
