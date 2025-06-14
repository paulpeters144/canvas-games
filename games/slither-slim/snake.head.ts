// import type { Position } from "games/util/util";
// import * as PIXI from "pixi.js";

// export interface Head {
//    nextPos: Position;
//    sprite: PIXI.Sprite;
//    moveTo: (pos: Position) => void;
//    placeAt: (pos: Position) => void;
//    update: (tick: PIXI.Ticker) => void;
//    isIdle: () => boolean;
//    direction: {
//       faceUp: () => void;
//       faceRight: () => void;
//       faceDown: () => void;
//       faceLeft: () => void;
//       isFacing: {
//          up: () => boolean;
//          right: () => boolean;
//          down: () => boolean;
//          left: () => boolean;
//       };
//    };
// }

// export const createHead = (texture: PIXI.Texture): Head => {
//    const nextPos: Position = { x: 0, y: 0 };
//    const sprite = new PIXI.Sprite(texture);
//    sprite.scale.set(0.2);
//    sprite.anchor.set(0.5);

//    const direction = {
//       faceUp: () => {
//          sprite.rotation = Math.PI;
//       },
//       faceRight: () => {
//          sprite.rotation = Math.PI * 1.5;
//       },
//       faceDown: () => {
//          sprite.rotation = 0;
//       },
//       faceLeft: () => {
//          sprite.rotation = Math.PI * 0.5;
//       },
//       isFacing: {
//          up: () => sprite.rotation === Math.PI,
//          right: () => sprite.rotation === Math.PI * 1.5,
//          down: () => sprite.rotation === 0,
//          left: () => sprite.rotation === Math.PI * 0.5,
//       },
//    };

//    const isIdle = () => sprite.x === nextPos.x && sprite.y === nextPos.y;

//    const moveTo = (pos: Position) => {
//       nextPos.x = pos.x;
//       nextPos.y = pos.y;
//    };

//    const placeAt = (pos: Position) => {
//       nextPos.x = pos.x;
//       nextPos.y = pos.y;
//       sprite.x = pos.x;
//       sprite.y = pos.y;
//    };

//    const update = (tick: PIXI.Ticker) => {
//       const speed = 0.12;
//       if (isIdle()) return;

//       if (direction.isFacing.up()) {
//          sprite.y -= speed * tick.deltaMS;
//          if (sprite.y < nextPos.y) sprite.y = nextPos.y;
//       }
//       if (direction.isFacing.right()) {
//          sprite.x += speed * tick.deltaMS;
//          if (sprite.x > nextPos.x) sprite.x = nextPos.x;
//       }
//       if (direction.isFacing.down()) {
//          sprite.y += speed * tick.deltaMS;
//          if (sprite.y > nextPos.y) sprite.y = nextPos.y;
//       }
//       if (direction.isFacing.left()) {
//          sprite.x -= speed * tick.deltaMS;
//          if (sprite.x < nextPos.x) sprite.x = nextPos.x;
//       }
//    };

//    return {
//       direction,
//       moveTo,
//       placeAt,
//       nextPos,
//       sprite,
//       update,
//       isIdle,
//    };
// };
