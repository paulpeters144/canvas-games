import * as PIXI from "pixi.js";

export class MarioModel {
   sprite: PIXI.Sprite;
   constructor(texture: PIXI.Texture) {
      this.sprite = new PIXI.Sprite(texture);
   }

   update(tick: PIXI.Ticker) {}
}
