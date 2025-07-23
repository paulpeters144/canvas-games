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
      this._handleInput(props.mario);
      this._handleMarioJump(props);
      this._handleMarioMove(props);
      this._handleGravity(props);
   }

   private _handleInput(mario: MarioModel) {
      const btn = this._inputCtrl.btn;
      if (btn.ArrowRight.data.pressed) {
         mario.nexPos.x = mario.curPos.x + 3;
      }
      if (btn.ArrowLeft.data.pressed) {
         mario.nexPos.x = mario.curPos.x - 3;
      }
   }

   private _handleGravity(props: {
      tick: PIXI.Ticker;
      mario: MarioModel;
      objects: PIXI.Rectangle[];
   }) {
      const { tick, mario, objects } = props;
      const deltaTimeInSeconds = tick.deltaMS / 1000;
      const dy = 20 * deltaTimeInSeconds;
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
         const isAbove = sprite.y - sprite.height <= obj.y;
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
      const deltaTimeInSeconds = tick.deltaMS / 1000;
      const moveSpeed = 125 * deltaTimeInSeconds;
      if (mario.curPos.y !== mario.nexPos.y) {
         const needsToMoveUp = mario.curPos.y > mario.nexPos.y;
         if (needsToMoveUp) {
            mario.sprite.y -= moveSpeed * 5;
            const overshotPos = mario.curPos.y < mario.nexPos.y;
            if (overshotPos) {
               mario.sprite.y = mario.nexPos.y;
            }
         }
         const needsToMoveDn = mario.curPos.y < mario.nexPos.y;
         if (needsToMoveDn) {
            mario.sprite.y += moveSpeed * 5;
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
   private _maxJumpVal = 100;

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
            const jumpStep = 4 * eased; // Scaled jump step
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
   }
}
