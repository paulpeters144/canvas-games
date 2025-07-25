import * as PIXI from "pixi.js";
import type { Position } from "./types";

enum frame {
   died = 0,
   stand = 1,
   run1 = 2,
   run2 = 3,
   run3 = 4,
   jump = 5,
   stop = 6,
}

export class MarioModel {
   // sprite: PIXI.Sprite;
   anim: PIXI.AnimatedSprite;
   isJumping = false;
   isOnGround = false;
   nexPos: Position;
   get curPos(): Position {
      return { x: this.anim.x, y: this.anim.y };
   }
   get isIdleY(): boolean {
      return this.anim.y === this.nexPos.y;
   }
   get isIdleX(): boolean {
      return this.anim.x === this.nexPos.x;
   }
   get isIdle(): boolean {
      return this.isIdleX && this.isIdleY;
   }

   constructor(spriteSheet: PIXI.Texture) {
      // this.sprite = new PIXI.Sprite(stand);

      const width = 16;
      const height = 16;
      const frames = 7;

      let buffer = 0;
      const textures = Array.from({ length: frames }, (_, i) => {
         const t = new PIXI.Texture({
            source: spriteSheet.source,
            frame: new PIXI.Rectangle(width * i + buffer, 0, width, height),
         });
         buffer += 1;
         t.source.scaleMode = "nearest";
         return t;
      });

      this.anim = new PIXI.AnimatedSprite({ textures });
      this.anim.animationSpeed = 0.15;
      // this.anim.play();
      this.anim.currentFrame = 1;

      this.nexPos = { x: this.anim.x, y: this.anim.y };
   }

   setJumping() {
      this.anim.currentFrame = frame.jump;
   }

   setStanding() {
      this.anim.currentFrame = frame.stand;
   }

   setDied() {
      this.anim.currentFrame = frame.died;
   }

   setStopping() {
      this.anim.currentFrame = frame.stop;
   }

   faceLeft() {
      this.anim.anchor.set(1, 0);
      this.anim.scale.set(-1, 1);
   }

   faceRight() {
      this.anim.anchor.set(0, 0);
      this.anim.scale.set(1, 1);
   }

   private _currentTime = 0;
   private _interval = 4.5;
   animateRunning(delta: number) {
      this._currentTime += delta;
      if (
         this.anim.currentFrame !== frame.run1 &&
         this.anim.currentFrame !== frame.run2 &&
         this.anim.currentFrame !== frame.run2
      ) {
         this.anim.currentFrame = frame.run1;
      }

      if (this._interval <= this._currentTime) {
         this.anim.currentFrame++;
         this._currentTime = 0;
      }
   }
}
