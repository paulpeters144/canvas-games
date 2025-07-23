import * as PIXI from "pixi.js";
import type { Position } from "./types";

export class EntityModel {
   sprite: PIXI.Sprite;
   isJumping = false;
   get curPos(): Position {
      return { x: this.sprite.x, y: this.sprite.y };
   }
   get isIdleY(): boolean {
      return this.sprite.y === this._nexPos.y;
   }
   get isIdleX(): boolean {
      return this.sprite.x === this._nexPos.x;
   }
   get isIdle(): boolean {
      return this.isIdleX && this.isIdleY;
   }

   private _nexPos: Position;
   private _speed = 1.5;

   constructor(texture: PIXI.Texture) {
      this.sprite = new PIXI.Sprite(texture);
      this._nexPos = { x: this.sprite.x, y: this.sprite.y };
   }

   moveUp() {
      this._nexPos.y -= this._speed;
   }

   moveRight() {
      this._nexPos.x += this._speed;
   }

   moveDown() {
      this._nexPos.y += this._speed;
   }

   moveLeft() {
      this._nexPos.x -= this._speed;
   }

   setNextPos(pos: Position) {
      this._nexPos.x = pos.x;
      this._nexPos.y = pos.y;
   }

   update(tick: PIXI.Ticker) {
      const moveSpeed = 25 / tick.deltaMS;
      if (this.curPos.y !== this._nexPos.y) {
         const needsToMoveUp = this.curPos.y > this._nexPos.y;
         if (needsToMoveUp) {
            this.sprite.y -= moveSpeed;
            const overshotPos = this.curPos.y < this._nexPos.y;
            if (overshotPos) {
               this.sprite.y = this._nexPos.y;
            }
         }
         const needsToMoveDn = this.curPos.y < this._nexPos.y;
         if (needsToMoveDn) {
            this.sprite.y += moveSpeed;
            const overshotPos = this.curPos.y > this._nexPos.y;
            if (overshotPos) {
               this.sprite.y = this._nexPos.y;
            }
         }
      }

      if (this.curPos.x !== this._nexPos.x) {
         const needsToMoveRight = this.curPos.x < this._nexPos.x;
         if (needsToMoveRight) {
            this.sprite.x += moveSpeed;
            const overshotPos = this.curPos.x > this._nexPos.x;
            if (overshotPos) {
               this.sprite.x = this._nexPos.x;
            }
         }

         const needsToMoveLeft = this.curPos.x > this._nexPos.x;
         if (needsToMoveLeft) {
            this.sprite.x -= moveSpeed;
            const overshotPos = this.curPos.x < this._nexPos.x;
            if (overshotPos) {
               this.sprite.x = this._nexPos.x;
            }
         }
      }
   }
}

export class Jumper {
   sprite: PIXI.Sprite;
   _jumpStartPos: Position = { x: 0, y: 0 };
   _jumpEndPos: Position = { x: 0, y: 0 };
   _jumpDuration = 0.5; // seconds
   _jumpTimeElapsed = 0;

   constructor(sprite: PIXI.Sprite) {
      this.sprite = sprite;
   }

   startJump(height: number, duration = 0.5) {
      this._jumpStartPos = { x: this.sprite.x, y: this.sprite.y };
      this._jumpEndPos = { x: this.sprite.x, y: this.sprite.y - height };
      this._jumpDuration = duration;
      this._jumpTimeElapsed = 0;
   }

   update(tick: PIXI.Ticker) {
      const delta = tick.deltaMS / 1000;
      this._jumpTimeElapsed += delta;

      const t = this._jumpTimeElapsed / this._jumpDuration;

      if (t >= 1) {
         this.sprite.y = this._jumpStartPos.y;
         return;
      }

      // Smooth jump using cosine wave: 1 - cos(π * t) / 2
      const jumpProgress = (1 - Math.cos(Math.PI * t)) / 2;
      const newY =
         this._jumpStartPos.y +
         (this._jumpEndPos.y - this._jumpStartPos.y) * jumpProgress;
      this.sprite.y = newY;
   }
}
