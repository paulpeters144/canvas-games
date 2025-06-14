import type { Position } from "games/util/util";
import * as PIXI from "pixi.js";

export enum FaceDir {
   up = 0,
   right = 1,
   down = 2,
   left = 3,
}

export interface SnakeSegment {
   nextPos: Position;
   sprite: PIXI.Sprite;
   moveTo: (pos: Position) => void;
   placeAt: (pos: Position) => void;
   update: (tick: PIXI.Ticker) => void;
   isIdle: () => boolean;
   collides: (segment: SnakeSegment) => boolean;
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

   const moveTo = (pos: Position) => {
      nextPos.x = pos.x;
      nextPos.y = pos.y;
   };

   const placeAt = (pos: Position) => {
      nextPos.x = pos.x;
      nextPos.y = pos.y;

      sprite.x = pos.x;
      sprite.y = pos.y;
   };

   const update = (tick: PIXI.Ticker) => {
      const speed = 0.12;
      if (isIdle()) return;

      if (sprite.y > nextPos.y) {
         sprite.y -= speed * tick.deltaMS;
         if (sprite.y < nextPos.y) sprite.y = nextPos.y;
      }
      if (sprite.x < nextPos.x) {
         sprite.x += speed * tick.deltaMS;
         if (sprite.x > nextPos.x) sprite.x = nextPos.x;
      }
      if (sprite.y < nextPos.y) {
         sprite.y += speed * tick.deltaMS;
         if (sprite.y > nextPos.y) sprite.y = nextPos.y;
      }
      if (sprite.x > nextPos.x) {
         sprite.x -= speed * tick.deltaMS;
         if (sprite.x < nextPos.x) sprite.x = nextPos.x;
      }
   };

   const collides = (segment: SnakeSegment) => {
      const buffer = 8;
      const selfCircle = {
         x: sprite.x,
         y: sprite.y,
         radius: sprite.width * 0.5 - buffer,
      };
      const nextCircle = {
         x: segment.sprite.x,
         y: segment.sprite.y,
         radius: segment.sprite.width * 0.5,
      };

      const dx = selfCircle.x - nextCircle.x;
      const dy = selfCircle.y - nextCircle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance < selfCircle.radius + nextCircle.radius;
   };

   return {
      nextPos,
      direction,
      moveTo,
      collides,
      placeAt,
      sprite,
      update,
      isIdle,
   };
};
