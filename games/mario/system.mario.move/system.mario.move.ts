import * as PIXI from "pixi.js";
import type { InputCtrl } from "../input.control";
import type { MarioModel } from "../model.mario";

export class SystemMarioMove {
   private _inputCtrl: InputCtrl;
   constructor(props: {
      inputCtrl: InputCtrl;
      gravity?: number;
   }) {
      const { inputCtrl } = props;
      this._inputCtrl = inputCtrl;
   }

   update(props: {
      tick: PIXI.Ticker;
      mario: MarioModel;
      objects: PIXI.Rectangle[];
   }) {
      this._handleGroundMove(props.mario);
      this._handleMarioJump(props);
      this._handleMarioMove(props);
      this._handleGravity(props);
      this._handleBlockBumping(props);
   }

   private _handleGroundMove(mario: MarioModel) {
      const btn = this._inputCtrl.btn;
      if (!mario.isOnGround) return;
      if (btn.ArrowRight.data.pressed) {
         mario.nexPos.x = mario.curPos.x + 3;
      }
      if (btn.ArrowLeft.data.pressed) {
         mario.nexPos.x = mario.curPos.x - 3;
      }
   }

   private _handleBlockBumping(props: {
      tick: PIXI.Ticker;
      mario: MarioModel;
      objects: PIXI.Rectangle[];
   }) {
      const { tick, mario, objects } = props;
      if (!mario.isJumping) return;

      const marioRect = new PIXI.Rectangle(
         mario.sprite.x,
         mario.sprite.y,
         mario.sprite.width,
         mario.sprite.height,
      );
      for (let i = 0; i < objects.length; i++) {
         const obj = objects[i];
         if (!marioRect.intersects(obj)) continue;
         if (marioRect.top <= obj.bottom) {
            mario.sprite.y = obj.y + obj.height;
         }
      }
   }

   private _handleGravity(props: {
      tick: PIXI.Ticker;
      mario: MarioModel;
      objects: PIXI.Rectangle[];
   }) {
      const { tick, mario, objects } = props;
      const dy = (tick.deltaMS / 1000) * 20;
      if (mario.isJumping) return;

      const { sprite } = mario;
      const futureY = sprite.y + dy;

      const futureBounds = new PIXI.Rectangle(
         sprite.x,
         futureY,
         sprite.width,
         sprite.height,
      );

      mario.isOnGround = false;

      for (const obj of objects) {
         const isAbove = sprite.y - sprite.height <= obj.y - 5;
         const willOverlap = futureBounds.intersects(obj);

         if (isAbove && willOverlap) {
            sprite.y = obj.y - sprite.height;
            mario.isOnGround = true;
            break;
         }
      }

      if (!mario.isOnGround) {
         mario.nexPos.y = mario.curPos.y + 3;
      }
   }

   private _handleMarioMove(props: {
      tick: PIXI.Ticker;
      mario: MarioModel;
      objects: PIXI.Rectangle[];
   }) {
      const { tick, mario } = props;
      const moveSpeed = 100 * (tick.deltaMS * 0.001);
      if (mario.curPos.y !== mario.nexPos.y) {
         const needsToMoveUp = mario.curPos.y > mario.nexPos.y;
         if (needsToMoveUp) {
            mario.sprite.y -= moveSpeed * 2;
            const overshotPos = mario.curPos.y < mario.nexPos.y;
            if (overshotPos) {
               mario.sprite.y = mario.nexPos.y;
            }
         }
         const needsToMoveDn = mario.curPos.y < mario.nexPos.y;
         if (needsToMoveDn) {
            mario.sprite.y += moveSpeed * 2;
            const overshotPos = mario.curPos.y > mario.nexPos.y;
            if (overshotPos) {
               mario.sprite.y = mario.nexPos.y;
            }
         }
      }

      if (mario.curPos.x !== mario.nexPos.x) {
         const needsToMoveRight = mario.curPos.x < mario.nexPos.x;
         if (needsToMoveRight) {
            mario.sprite.x += moveSpeed;
            const overshotPos = mario.curPos.x > mario.nexPos.x;
            if (overshotPos) {
               mario.sprite.x = mario.nexPos.x;
            }
         }

         const needsToMoveLeft = mario.curPos.x > mario.nexPos.x;
         if (needsToMoveLeft) {
            mario.sprite.x -= moveSpeed;
            const overshotPos = mario.curPos.x < mario.nexPos.x;
            if (overshotPos) {
               mario.sprite.x = mario.nexPos.x;
            }
         }
      }
   }

   private _curJumpVal = 0;
   private _startJumpVal = 0;
   private _maxJumpVal = 70;

   private _handleMarioJump(props: {
      tick: PIXI.Ticker;
      mario: MarioModel;
      objects: PIXI.Rectangle[];
   }) {
      const { tick, mario, objects } = props;
      const jumpPressed = this._inputCtrl.btn.z.data.pressed;
      const reachedMaxJump = this._curJumpVal >= this._maxJumpVal * 0.75;

      // Start jump
      if (jumpPressed && !reachedMaxJump && mario.isOnGround) {
         mario.isJumping = true;
         this._startJumpVal = mario.curPos.y;
         this._curJumpVal = 0;
         mario.isOnGround = false;
      }

      if (mario.isJumping) {
         if (jumpPressed && !reachedMaxJump) {
            // Smooth jump using cosine easing
            const t = this._curJumpVal / this._maxJumpVal; // 0 to 1
            const eased = Math.cos(t * (Math.PI / 2)); // 1 to 0
            const jumpStep = 2.75 * eased; // Scaled jump step
            mario.nexPos.y = mario.curPos.y - jumpStep;

            this._curJumpVal = Math.abs(mario.nexPos.y - this._startJumpVal);
         }
      }

      if (this._inputCtrl.btn.z.wasReleasedOnce || reachedMaxJump) {
         mario.isJumping = false;
      }
      // Reset jump when landing
      if (
         mario.isOnGround &&
         !mario.isJumping &&
         this._inputCtrl.btn.z.data.released
      ) {
         this._curJumpVal = 0;
         this._startJumpVal = 0;
      }

      this.marioInTheAir(props);
   }

   private _movingRight = false;
   private _curHorzMoveVal = 0.0005;
   private _defaultHorzMoveVal = 0.0005;
   private marioInTheAir(props: {
      tick: PIXI.Ticker;
      mario: MarioModel;
      objects: PIXI.Rectangle[];
   }) {
      const { tick, mario, objects } = props;
      if (!mario.isOnGround) {
         const moveSpeed = tick.deltaMS * 0.1;
         if (this._inputCtrl.btn.ArrowRight.data.pressed) {
            if (!this._movingRight) {
               this._curHorzMoveVal = this._defaultHorzMoveVal;
            }
            this._movingRight = true;
            this._curHorzMoveVal *= moveSpeed;
            this._curHorzMoveVal = Math.min(this._curHorzMoveVal, 3);
            mario.nexPos.x = mario.curPos.x + this._curHorzMoveVal;
         }
         if (this._inputCtrl.btn.ArrowLeft.data.pressed) {
            if (this._movingRight) {
               this._curHorzMoveVal = this._defaultHorzMoveVal;
            }
            this._movingRight = false;
            this._curHorzMoveVal *= moveSpeed;
            this._curHorzMoveVal = Math.min(this._curHorzMoveVal, 3);
            mario.nexPos.x = mario.curPos.x - this._curHorzMoveVal;
         }
      }
      if (mario.isOnGround) {
         this._curHorzMoveVal = this._defaultHorzMoveVal;
      }
   }
}
