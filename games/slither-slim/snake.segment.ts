import type { IndexPos, Position } from "games/util/util";
import * as PIXI from "pixi.js";

export interface SnakeSegment {
   indexPos: {
      curr: IndexPos;
      next: IndexPos;
   };
   nextPos: Position;
   sprite: PIXI.Sprite;
   moveTo: (props: { pos: Position; idxPos: IndexPos }) => void;
   placeAt: (props: { pos: Position; idxPos: IndexPos }) => void;
   update: (tick: PIXI.Ticker) => void;
   isIdle: () => boolean;
   direction: {
      faceUp: () => void;
      faceRight: () => void;
      faceDown: () => void;
      faceLeft: () => void;
      isFacing: {
         up: () => boolean;
         right: () => boolean;
         down: () => boolean;
         left: () => boolean;
      };
   };
}

export const createSegment = (texture: PIXI.Texture): SnakeSegment => {
   const nextPos: Position = { x: 0, y: 0 };
   const nextIdxPos: IndexPos = { row: 0, col: 0 };
   const currIdxPos: IndexPos = { row: 0, col: 0 };

   const sprite = new PIXI.Sprite(texture);

   sprite.scale.set(0.2);
   sprite.anchor.set(0.5);

   const direction = {
      faceUp: () => {
         sprite.rotation = Math.PI;
      },
      faceRight: () => {
         sprite.rotation = Math.PI * 1.5;
      },
      faceDown: () => {
         sprite.rotation = 0;
      },
      faceLeft: () => {
         sprite.rotation = Math.PI * 0.5;
      },
      isFacing: {
         up: () => sprite.rotation === Math.PI,
         right: () => sprite.rotation === Math.PI * 1.5,
         down: () => sprite.rotation === 0,
         left: () => sprite.rotation === Math.PI * 0.5,
      },
   };

   const isIdle = () => sprite.x === nextPos.x && sprite.y === nextPos.y;

   const moveTo = (props: { pos: Position; idxPos: IndexPos }) => {
      nextPos.x = props.pos.x;
      nextPos.y = props.pos.y;

      currIdxPos.row = nextIdxPos.row;
      currIdxPos.col = nextIdxPos.col;

      nextIdxPos.row = props.idxPos.row;
      nextIdxPos.col = props.idxPos.col;
   };

   const placeAt = (props: { pos: Position; idxPos: IndexPos }) => {
      nextPos.x = props.pos.x;
      nextPos.y = props.pos.y;

      currIdxPos.row = nextIdxPos.row;
      currIdxPos.col = nextIdxPos.col;

      nextIdxPos.row = props.idxPos.row;
      nextIdxPos.col = props.idxPos.col;

      sprite.x = props.pos.x;
      sprite.y = props.pos.y;
   };

   const update = (tick: PIXI.Ticker) => {
      const speed = 0.12;
      if (isIdle()) return;

      if (direction.isFacing.up()) {
         sprite.y -= speed * tick.deltaMS;
         if (sprite.y < nextPos.y) sprite.y = nextPos.y;
      }
      if (direction.isFacing.right()) {
         sprite.x += speed * tick.deltaMS;
         if (sprite.x > nextPos.x) sprite.x = nextPos.x;
      }
      if (direction.isFacing.down()) {
         sprite.y += speed * tick.deltaMS;
         if (sprite.y > nextPos.y) sprite.y = nextPos.y;
      }
      if (direction.isFacing.left()) {
         sprite.x -= speed * tick.deltaMS;
         if (sprite.x < nextPos.x) sprite.x = nextPos.x;
      }
   };

   return {
      nextPos,
      indexPos: { next: nextIdxPos, curr: currIdxPos },
      direction,
      moveTo,
      placeAt,
      sprite,
      update,
      isIdle,
   };
};
