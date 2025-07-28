import * as PIXI from "pixi.js";
import { bus } from "../_main";
import type { GameAssets } from "../assets";
import { MarioModel } from "../model.mario";
import {
   BrickBlock,
   CollisionArea,
   GroundBlock,
   QuestionBlock,
} from "../model.object";
import type { EntityStore } from "../store.entity";
import type { Position } from "../types";

type GameObjs = BrickBlock | QuestionBlock | CollisionArea | GroundBlock;

class MushroomData {
   sprite: PIXI.Sprite;
   get rect(): PIXI.Rectangle {
      return new PIXI.Rectangle(
         this.sprite.x,
         this.sprite.y,
         this.sprite.width,
         this.sprite.height,
      );
   }
   private spawnY: number;
   private targetY: number;
   private easeTime = 0;
   private easeDuration = 20;
   private isEmerging = true;

   private vy = 0;
   private gravity = 0.15;
   private vx = 1.2;
   public isActive = true;

   get center(): Position {
      return {
         x: this.sprite.x + this.sprite.width / 2,
         y: this.sprite.y + this.sprite.height / 2,
      };
   }

   constructor(sprite: PIXI.Sprite) {
      this.sprite = sprite;
      this.sprite.zIndex = 0;
      this.spawnY = sprite.y;
      this.targetY = sprite.y - 8;
   }

   update(tick: PIXI.Ticker, closeByObjects: GameObjs[]) {
      if (!this.isActive) return;

      const delta = tick.deltaTime * 0.75;

      // --- EASING EMERGENCE ---
      if (this.isEmerging) {
         this.easeTime += delta;
         const t = Math.min(this.easeTime / this.easeDuration, 1);
         this.sprite.y = this.spawnY + (this.targetY - this.spawnY) * t;

         if (t >= 1) {
            this.sprite.y = this.targetY;
            this.isEmerging = false;
         }
         return;
      }

      // --- HORIZONTAL MOVEMENT ---
      this.sprite.x += this.vx * delta;

      const spriteRect = new PIXI.Rectangle(
         this.sprite.x,
         this.sprite.y,
         this.sprite.width,
         this.sprite.height,
      );

      for (const obj of closeByObjects) {
         const touchingRight =
            spriteRect.right >= obj.rect.left &&
            spriteRect.left < obj.rect.left &&
            spriteRect.bottom > obj.rect.top &&
            spriteRect.top < obj.rect.bottom;

         const touchingLeft =
            spriteRect.left <= obj.rect.right &&
            spriteRect.right > obj.rect.right &&
            spriteRect.bottom > obj.rect.top &&
            spriteRect.top < obj.rect.bottom;

         if (touchingLeft || touchingRight) {
            this.vx = -this.vx;
            this.sprite.x += this.vx * delta;
            break;
         }
      }

      // --- GRAVITY ---
      this.vy += this.gravity * delta;
      this.sprite.y += this.vy * delta;

      // --- RECOMPUTE SPRITE RECT AFTER FALLING ---
      const newSpriteRect = new PIXI.Rectangle(
         this.sprite.x,
         this.sprite.y,
         this.sprite.width,
         this.sprite.height,
      );

      for (const obj of closeByObjects) {
         const landingOnTop =
            newSpriteRect.bottom >= obj.rect.top &&
            spriteRect.bottom <= obj.rect.top &&
            newSpriteRect.right > obj.rect.left &&
            newSpriteRect.left < obj.rect.right;

         if (landingOnTop) {
            this.sprite.y = obj.rect.top - this.sprite.height;
            this.vy = 0;
            break;
         }
      }
   }
}

export class SystemMushroomSpawn {
   private _gameRef: PIXI.Container;
   private _gameAssets: GameAssets;
   private _entityStore: EntityStore;
   private _mushrooms: MushroomData[] = [];

   constructor(props: {
      gameRef: PIXI.Container;
      assets: GameAssets;
      entityStore: EntityStore;
   }) {
      this._gameRef = props.gameRef;
      this._gameAssets = props.assets;
      this._entityStore = props.entityStore;

      bus.on("mushroomSpawn", (pos: Position) => {
         const mushroom = this._createMushroom(pos);
         this._mushrooms.push(mushroom);
         mushroom.sprite.zIndex = 0;
         this._gameRef.addChild(mushroom.sprite);
      });
   }

   update(tick: PIXI.Ticker) {
      const mario = this._entityStore.firstOrDefault(MarioModel);
      if (!mario) return;

      for (let i = 0; i < this._mushrooms.length; i++) {
         const mushroom = this._mushrooms[i];
         const closeByObjects = this._getObjectsCloseTo(mushroom);
         mushroom.update(tick, closeByObjects);

         if (mario.rect.intersects(mushroom.rect)) {
            mushroom.isActive = false;
            this._gameRef.removeChild(mushroom.sprite);
            if (mario.state === "small") {
               bus.fire("marioChange", "grow");
            }
         }
      }
      // cleanup mushrooms if needed (e.g., off screen)
      this._mushrooms = this._mushrooms.filter((m) => m.isActive);
   }

   private _createMushroom(pos: Position): MushroomData {
      const ga = this._gameAssets;
      const mushroom = ga.createSprite("grow-mushroom.png");
      mushroom.position.set(pos.x, pos.y);
      return new MushroomData(mushroom);
   }

   private _getObjectsCloseTo(mushroom: MushroomData) {
      const collidableEntities = [
         ...this._entityStore.getAll(BrickBlock),
         ...this._entityStore.getAll(QuestionBlock),
         ...this._entityStore.getAll(GroundBlock),
         ...this._entityStore.getAll(CollisionArea),
      ];

      const closeByEntities = collidableEntities.filter(
         (o) =>
            Math.abs(o.center.x - mushroom.center.x) < 50 &&
            Math.abs(o.center.y - mushroom.center.y) < 50,
      );

      const closestToFurthest = closeByEntities.sort((a, b) => {
         const distA =
            (a.center.x - mushroom.center.x) ** 2 +
            (a.center.y - mushroom.center.y) ** 2;
         const distB =
            (b.center.x - mushroom.center.x) ** 2 +
            (b.center.y - mushroom.center.y) ** 2;
         return distA - distB;
      });

      return closestToFurthest;
   }
}
