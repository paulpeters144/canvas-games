import * as PIXI from "pixi.js";
import type { Position } from "./types";

export class MarioModel {
   sprite: PIXI.Sprite;
   isJumping = false;
   isOnGround = false;
   nexPos: Position;
   get curPos(): Position {
      return { x: this.sprite.x, y: this.sprite.y };
   }
   get isIdleY(): boolean {
      return this.sprite.y === this.nexPos.y;
   }
   get isIdleX(): boolean {
      return this.sprite.x === this.nexPos.x;
   }
   get isIdle(): boolean {
      return this.isIdleX && this.isIdleY;
   }

   private _speed = 3;

   constructor(texture: PIXI.Texture) {
      this.sprite = new PIXI.Sprite(texture);
      this.nexPos = { x: this.sprite.x, y: this.sprite.y };
   }

   update(_: PIXI.Ticker) {}
}
