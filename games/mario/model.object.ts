import * as PIXI from "pixi.js";
import type { LayerName, TileObjectName } from "./game.atlas";
import type { Position } from "./types";

export class ObjectModel {
   public type: LayerName;
   public sprite: PIXI.Sprite;
   public get rect(): PIXI.Rectangle {
      return new PIXI.Rectangle(
         this.sprite.x,
         this.sprite.y,
         this.sprite.width,
         this.sprite.height,
      );
   }
   public get center(): Position {
      return {
         x: this.sprite.x + this.sprite.width,
         y: this.sprite.y + this.sprite.height,
      };
   }

   constructor(sprite: PIXI.Sprite, type: LayerName) {
      this.sprite = sprite;
      this.type = type;
   }

   bumpUp() {}

   break() {}
}

export class CollisionArea {
   public type: LayerName;
   public rect: PIXI.Rectangle;
   public get center(): Position {
      return {
         x: this.rect.x + this.rect.width,
         y: this.rect.y + this.rect.height,
      };
   }

   constructor(rect: PIXI.Rectangle, type: LayerName) {
      this.rect = rect;
      this.type = type;
   }
}

export class StartPoint {
   public name: TileObjectName;
   public pos: Position;

   constructor(pos: Position, name: TileObjectName) {
      this.pos = { ...pos };
      this.name = name;
   }
}
