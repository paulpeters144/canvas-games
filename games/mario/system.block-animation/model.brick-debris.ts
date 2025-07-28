import type * as PIXI from "pixi.js";
import type { Position } from "../types";
import { GAME_HEIGHT, GAME_WIDTH } from "../util.camera";

export class BrickDebris {
   topLeft: PIXI.Sprite;
   topRight: PIXI.Sprite;
   btLeft: PIXI.Sprite;
   btRight: PIXI.Sprite;

   public isActive = true;
   public get allSprites(): PIXI.Sprite[] {
      return [this.topLeft, this.topRight, this.btLeft, this.btRight];
   }

   private velocities: { sprite: PIXI.Sprite; vx: number; vy: number }[] = [];
   private gravity = 0.4;
   private friction = 0.98;

   constructor(props: {
      startPos: Position;
      pieces: {
         topLeft: PIXI.Sprite;
         topRight: PIXI.Sprite;
         btLeft: PIXI.Sprite;
         btRight: PIXI.Sprite;
      };
   }) {
      const { pieces, startPos } = props;
      const { topLeft, topRight, btLeft, btRight } = pieces;

      this.topLeft = topLeft;
      this.topRight = topRight;
      this.btLeft = btLeft;
      this.btRight = btRight;

      // Initial positions
      this.topLeft.x = startPos.x + 2;
      this.topLeft.y = startPos.y;

      this.topRight.x = startPos.x + 7;
      this.topRight.y = startPos.y;

      this.btLeft.x = startPos.x + 2;
      this.btLeft.y = startPos.y + 5;

      this.btRight.x = startPos.x + 7;
      this.btRight.y = startPos.y + 5;

      // Initial velocities
      this.velocities = [
         { sprite: this.topLeft, vx: -2, vy: -6 },
         { sprite: this.topRight, vx: 2, vy: -6 },
         { sprite: this.btLeft, vx: -2, vy: -3 },
         { sprite: this.btRight, vx: 2, vy: -3 },
      ];
   }

   update(tick: PIXI.Ticker) {
      if (!this.isActive) return;

      const delta = tick.deltaTime;
      let allOffScreen = true;

      for (const v of this.velocities) {
         // Move
         v.sprite.x += v.vx * delta;
         v.sprite.y += v.vy * delta;

         v.vy += this.gravity * delta;

         v.vx *= this.friction;

         if (
            v.sprite.x > GAME_WIDTH * 0.95 ||
            v.sprite.y > GAME_HEIGHT * 0.95 ||
            v.sprite.x < 3 ||
            v.sprite.y < 3
         ) {
            v.sprite.visible = false;
         } else {
            v.sprite.visible = true;
            allOffScreen = false;
         }
      }

      if (allOffScreen) {
         this.isActive = false;
      }
   }
}
