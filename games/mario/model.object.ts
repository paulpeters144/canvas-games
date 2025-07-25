import type * as PIXI from "pixi.js";
import type { LayerName } from "./game.atlas";

export class ObjectModel {
   rect: PIXI.Rectangle;
   type: LayerName;

   constructor(rect: PIXI.Rectangle, type: LayerName) {
      this.rect = rect;
      this.type = type;
   }
}
