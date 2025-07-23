// import * as PIXI from "pixi.js";
// import type { MarioModel } from "../model.mario";

// export class SystemGravity {
//    private gravity: number;
//    constructor(gravity = 225) {
//       this.gravity = gravity;
//    }

//    update(props: {
//       tick: PIXI.Ticker;
//       entities: MarioModel[];
//       objects: PIXI.Rectangle[];
//    }) {
//       const deltaTimeInSeconds = props.tick.deltaMS / 1000;
//       const dy = this.gravity * deltaTimeInSeconds;

//       for (const ent of props.entities) {
//          if (ent.isJumping) continue;

//          const { sprite } = ent;
//          const futureY = sprite.y + dy;

//          const futureBounds = new PIXI.Rectangle(
//             sprite.x,
//             futureY,
//             sprite.width,
//             sprite.height,
//          );

//          // Find the closest ground object below the sprite
//          let landed = false;

//          for (const obj of props.objects) {
//             const isAbove = sprite.y + sprite.height <= obj.y;
//             const willOverlap = futureBounds.intersects(obj);

//             if (isAbove && willOverlap) {
//                // Snap the sprite to the top of the object
//                sprite.y = obj.y - sprite.height;
//                landed = true;
//                break;
//             }
//          }

//          if (!landed) {
//             ent.moveDown();
//          }
//       }
//    }
// }
