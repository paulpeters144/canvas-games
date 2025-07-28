import type * as PIXI from "pixi.js";

export class SquareBumpAnimation {
   private ctr: PIXI.Container;
   private originalY: number;
   private vy = 0;
   public active = false;

   private gravity = 0.5;
   private speed = -3;

   constructor(ctr: PIXI.Container) {
      this.ctr = ctr;
      this.originalY = ctr.y;
      this.originalY = this.ctr.y;
      this.vy = this.speed;
      this.active = true;
   }

   update(tick: PIXI.Ticker) {
      if (!this.active) return;

      const delta = tick.deltaTime * 0.75;

      this.ctr.y += this.vy * delta;

      this.vy += this.gravity * delta;

      if (this.ctr.y >= this.originalY) {
         this.ctr.y = this.originalY; // snap back
         this.active = false; // stop animation
      }
   }
}
