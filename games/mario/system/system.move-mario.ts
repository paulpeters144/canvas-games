import * as PIXI from "pixi.js";
import { bus } from "../_main";
import type { InputCtrl } from "../input.control";
import { MarioModel } from "../model.mario";
import {
   BrickBlock,
   CollisionArea,
   GroundBlock,
   QuestionBlock,
} from "../model.object";
import type { EntityStore } from "../store.entity";

export class SystemMarioMove {
   private _gameRef: PIXI.Container;
   private _entityStore: EntityStore;
   private _inputCtrl: InputCtrl;
   private _gravity: number;
   private _jumpForce: number;
   private _moveSpeed: number;
   private _maxFallSpeed: number;
   private _velocityY = 0;
   private _velocityX = 0;
   private _friction = 0.8;
   private _acceleration = 0.5;
   private _curDeltaTime = 0.0;

   constructor(props: {
      entityStore: EntityStore;
      gameRef: PIXI.Container;
      inputCtrl: InputCtrl;
      gravity?: number;
      jumpForce?: number;
      moveSpeed?: number;
      maxFallSpeed?: number;
   }) {
      const {
         entityStore,
         inputCtrl,
         gameRef,
         gravity = 0.25,
         jumpForce = 5.15,
         moveSpeed = 1.75,
         maxFallSpeed = 4,
      } = props;

      this._gameRef = gameRef;
      this._entityStore = entityStore;
      this._inputCtrl = inputCtrl;
      this._gravity = gravity;
      this._jumpForce = jumpForce;
      this._moveSpeed = moveSpeed;
      this._maxFallSpeed = maxFallSpeed;
   }

   update(tick: PIXI.Ticker) {
      this._curDeltaTime = tick.deltaTime;
      const mario = this._entityStore.firstOrDefault(MarioModel);
      if (!mario || mario.isPaused) return;
      this._updatePosition(mario);
      this._handleHorizontalMovement(mario);
      this._handleJumping(mario);
      this._applyGravity(mario);
   }

   private _handleHorizontalMovement(mario: MarioModel) {
      const leftPressed = this._inputCtrl.btn.ArrowLeft.data.pressed;
      const rightPressed = this._inputCtrl.btn.ArrowRight.data.pressed;
      const fastRunPressed = this._inputCtrl.btn.x.data.pressed;

      if (mario.isOnGround) {
         if (leftPressed || rightPressed) {
            const dt = fastRunPressed
               ? this._curDeltaTime * 1.5
               : this._curDeltaTime;
            mario.animateRunning(dt);
         } else {
            mario.setStanding();
         }
      }

      const controlForLeft = leftPressed && !rightPressed;
      const controlForRight = rightPressed && !leftPressed;

      if (controlForLeft) mario.faceLeft();
      if (controlForRight) mario.faceRight();

      if (controlForLeft && fastRunPressed) {
         this._velocityX = Math.max(
            this._velocityX - this._acceleration * this._curDeltaTime,
            -this._moveSpeed * 1.5,
         );
      } else if (controlForRight && fastRunPressed) {
         this._velocityX = Math.min(
            this._velocityX + this._acceleration * this._curDeltaTime,
            this._moveSpeed * 1.5,
         );
      } else if (controlForLeft) {
         this._velocityX = Math.max(
            this._velocityX - this._acceleration * this._curDeltaTime,
            -this._moveSpeed,
         );
      } else if (controlForRight) {
         this._velocityX = Math.min(
            this._velocityX + this._acceleration * this._curDeltaTime,
            this._moveSpeed,
         );
      } else {
         // Apply friction when no input
         this._velocityX *= this._friction ** this._curDeltaTime;
         if (Math.abs(this._velocityX) < 0.1) {
            this._velocityX = 0;
         }
      }
   }

   private _handleJumping(mario: MarioModel) {
      // Jump when Z is pressed and Mario is on the ground
      if (!this._inputCtrl.btn.z.wasPressedOnce) return;

      const fallingBuffer100ms = performance.now() - mario.lastFellAt < 100;

      if (mario.isOnGround || fallingBuffer100ms) {
         this._velocityY = -this._jumpForce;
         mario.isJumping = true;
         mario.isOnGround = false;
         mario.setJumping();
      }

      // Variable jump height - if Z is released early, reduce upward velocity
      if (this._inputCtrl.btn.z.wasReleasedOnce && this._velocityY < 0) {
         this._velocityY *= 0.5;
      }
   }

   private _applyGravity(mario: MarioModel) {
      if (!mario.isOnGround) {
         this._velocityY += this._gravity * this._curDeltaTime;
         // Cap falling speed
         if (this._velocityY > this._maxFallSpeed) {
            this._velocityY = this._maxFallSpeed;
         }
      }
   }

   private _updatePosition(mario: MarioModel) {
      const objects = [
         ...this._entityStore.getAll(BrickBlock),
         ...this._entityStore.getAll(QuestionBlock),
         ...this._entityStore.getAll(GroundBlock),
         ...this._entityStore.getAll(CollisionArea),
      ]
         .filter(
            (o) =>
               Math.abs(o.center.x - mario.center.x) < 50 &&
               Math.abs(o.center.y - mario.center.y) < 50,
         ) // everything within 50 pixels
         .sort((a, b) => {
            const distA =
               (a.center.x - mario.center.x) ** 2 +
               (a.center.y - mario.center.y) ** 2;
            const distB =
               (b.center.x - mario.center.x) ** 2 +
               (b.center.y - mario.center.y) ** 2;
            return distA - distB; // put the closest to the front
         });

      // Store current position
      const currentX = mario.anim.x;
      const currentY = mario.anim.y;

      // Calculate new positions with deltaTime
      const newX = currentX + this._velocityX * this._curDeltaTime;
      const newY = currentY + this._velocityY * this._curDeltaTime;

      // Handle horizontal collision
      const horizontalMarioRect = new PIXI.Rectangle(
         newX,
         currentY,
         mario.anim.width,
         mario.anim.height,
      );

      let canMoveHorizontally = true;
      for (const obj of objects) {
         if (intersects({ rect1: horizontalMarioRect, rect2: obj.rect })) {
            canMoveHorizontally = false;
            this._velocityX = 0;
            break;
         }
      }

      if (canMoveHorizontally) {
         mario.anim.x = newX;
         mario.nexPos.x = newX;
      }

      // Handle vertical collision
      const verticalMarioRect = new PIXI.Rectangle(
         mario.anim.x,
         newY,
         mario.anim.width,
         mario.anim.height,
      );

      let canMoveVertically = true;
      let hitGround = false;
      let hitCeiling = false;

      for (const obj of objects) {
         if (intersects({ rect1: verticalMarioRect, rect2: obj.rect })) {
            canMoveVertically = false;

            // Check if Mario is falling (moving down) and hits an object
            if (this._velocityY > 0) {
               // Mario hit the ground/platform
               mario.anim.y = obj.rect.y - mario.anim.height;
               mario.isOnGround = true;
               mario.isJumping = false;
               hitGround = true;
               mario.setStanding();
            }
            // Check if Mario is jumping (moving up) and hits an object
            else if (this._velocityY < 0) {
               if (obj instanceof QuestionBlock && obj.active) {
                  if (obj.data === "coin") {
                     bus.fire("coinAnim", { x: obj.rect.x, y: obj.rect.y - 20 });
                  }
                  if (obj.data === "mushroom") {
                     bus.fire("mushroomSpawn", {
                        x: obj.rect.x,
                        y: obj.rect.y - 10,
                     });
                  }

                  obj.bump();
                  bus.fire("qBlockBump", { id: obj.id });
               }
               if (obj instanceof BrickBlock) {
                  if (mario.state === "big") {
                     this._entityStore.remove(obj);
                     bus.fire("brickBrake", { x: obj.ctr.x, y: obj.ctr.y });
                  }
                  if (mario.state === "small") {
                     bus.fire("brickBump", { id: obj.id });
                  }
               }
               mario.anim.y = obj.rect.y + obj.rect.height;
               hitCeiling = true;
            }

            this._velocityY = 0;
            break;
         }
      }

      if (canMoveVertically) {
         mario.anim.y = newY;
         // If Mario is moving and not colliding, he's not on ground
         if (this._velocityY !== 0) {
            mario.isOnGround = false;
         }
      }

      // Update next position
      mario.nexPos.y = mario.anim.y;

      // Check if Mario is still on ground (for when he walks off a platform)
      if (mario.isOnGround && !hitGround && this._velocityY >= 0) {
         const groundCheckRect = new PIXI.Rectangle(
            mario.anim.x,
            mario.anim.y + 1, // Check slightly below Mario
            mario.anim.width,
            mario.anim.height,
         );

         let stillOnGround = false;
         for (const obj of objects) {
            if (intersects({ rect1: groundCheckRect, rect2: obj.rect })) {
               stillOnGround = true;
               break;
            }
         }

         if (!stillOnGround) {
            mario.isOnGround = false;
            mario.anim.currentFrame = 2;
            mario.lastFellAt = performance.now();
         }
      }
   }
}

const intersects = (props: {
   rect1: PIXI.Rectangle;
   rect2: PIXI.Rectangle;
   buffer?: number;
}) => {
   const { rect1, rect2, buffer = 1.25 } = props;
   if (buffer) {
      const buffed1 = new PIXI.Rectangle(
         rect1.x + buffer,
         rect1.y + buffer,
         rect1.width - buffer * 2,
         rect1.height,
      );
      const buffed2 = new PIXI.Rectangle(
         rect2.x + buffer,
         rect2.y + buffer,
         rect2.width - buffer * 2,
         rect2.height,
      );
      return buffed1.intersects(buffed2);
   }
   return rect1.intersects(rect2);
};
