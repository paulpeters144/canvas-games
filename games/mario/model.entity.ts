import type * as PIXI from "pixi.js";
export class Entity {
   public readonly id: string;
   public readonly ctr: PIXI.Container;

   constructor(ctr: PIXI.Container) {
      this.ctr = ctr;
      this.id = crypto.randomUUID().replaceAll("-", "").slice(0, 15);
   }
}
