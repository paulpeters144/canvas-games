import * as PIXI from "pixi.js";
import { Entity } from "./model.entity";
import type { Position } from "./types";

enum smallMario {
   died = 0,
   stand = 1,
   run1 = 2,
   run2 = 3,
   run3 = 4,
   jump = 5,
   stop = 6,
}

export class MarioModel extends Entity {
   state: "small" | "big";
   private _smallAnim: PIXI.AnimatedSprite;
   private _bigAnim: PIXI.AnimatedSprite;
   get anim(): PIXI.AnimatedSprite {
      if (this.state === "small") {
         return this._smallAnim;
      }
      if (this.state === "big") {
         return this._bigAnim;
      }
      throw new Error("only anim state for now.");
   }
   get rect(): PIXI.Rectangle {
      const anim = this.anim;
      return new PIXI.Rectangle(anim.x, anim.y, anim.width, anim.height);
   }
   isJumping = false;
   isOnGround = false;
   lastFellAt = performance.now();
   nexPos: Position;
   get curPos(): Position {
      return { x: this._smallAnim.x, y: this._smallAnim.y };
   }
   get isIdleY(): boolean {
      return this._smallAnim.y === this.nexPos.y;
   }
   get isIdleX(): boolean {
      return this._smallAnim.x === this.nexPos.x;
   }
   get isIdle(): boolean {
      return this.isIdleX && this.isIdleY;
   }
   public get center(): Position {
      return {
         x: this.anim.x + this.anim.width,
         y: this.anim.y + this.anim.height,
      };
   }
   public isPaused = false;

   constructor(props: {
      smallMarioSheet: PIXI.Texture;
      largeMarioSheet: PIXI.Texture;
   }) {
      super(new PIXI.Container());
      this._smallAnim = this._createSmallMarioAnimation(props.smallMarioSheet);
      this._bigAnim = this._createLargeMarioAnimation(props.largeMarioSheet);
      this.state = "small";
      this.ctr.addChild(this._smallAnim);

      this.nexPos = { x: this._smallAnim.x, y: this._smallAnim.y };
   }

   setState(state: "small" | "big") {
      this.state = state;
      this.ctr.removeChildren();
      if (state === "small") {
         this.ctr.addChild(this._smallAnim);
         this._smallAnim.x = this._bigAnim.x;
         this._smallAnim.y = this._bigAnim.y + 16;
      }
      if (state === "big") {
         this.ctr.addChild(this._bigAnim);
         this._bigAnim.x = this._smallAnim.x;
         this._bigAnim.y = this._smallAnim.y - 16;
      }
   }

   setJumping() {
      this.anim.currentFrame = smallMario.jump;
   }

   setStanding() {
      this.anim.currentFrame = smallMario.stand;
   }

   setDied() {
      this.anim.currentFrame = smallMario.died;
   }

   setStopping() {
      this.anim.currentFrame = smallMario.stop;
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

      // if (this.state === "small") {
      if (
         this.anim.currentFrame !== smallMario.run1 &&
         this.anim.currentFrame !== smallMario.run2 &&
         this.anim.currentFrame !== smallMario.run2
      ) {
         this.anim.currentFrame = smallMario.run1;
      }

      if (this._interval <= this._currentTime) {
         this.anim.currentFrame++;
         this._currentTime = 0;
      }
      // }
   }

   private _createSmallMarioAnimation(texture: PIXI.Texture) {
      const width = 16;
      const height = 16;
      const frames = 7;

      let buffer = 0;
      const textures = Array.from({ length: frames }, (_, i) => {
         const t = new PIXI.Texture({
            source: texture.source,
            frame: new PIXI.Rectangle(width * i + buffer, 0, width, height),
         });
         buffer += 1;
         t.source.scaleMode = "nearest";
         return t;
      });

      const animatedSprite = new PIXI.AnimatedSprite({ textures });
      animatedSprite.animationSpeed = 0.15;
      animatedSprite.currentFrame = 1;

      return animatedSprite;
   }

   private _createLargeMarioAnimation(texture: PIXI.Texture) {
      const width = 16;
      const height = 32;
      const frames = 7;

      let buffer = 0;
      const textures = Array.from({ length: frames }, (_, i) => {
         const t = new PIXI.Texture({
            source: texture.source,
            frame: new PIXI.Rectangle(width * i + buffer, 0, width, height),
         });
         buffer += 0;
         t.source.scaleMode = "nearest";
         return t;
      });

      const animatedSprite = new PIXI.AnimatedSprite({ textures });
      animatedSprite.animationSpeed = 0.15;
      animatedSprite.currentFrame = 1;

      return animatedSprite;
   }
}
