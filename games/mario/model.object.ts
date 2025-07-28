import * as PIXI from "pixi.js";
import type { LayerName, TileObjectName } from "./game.atlas";
import { Entity } from "./model.entity";
import type { Position } from "./types";

abstract class Block extends Entity {
   public type: LayerName;
   public data = "";
   public sprite: PIXI.Sprite | PIXI.AnimatedSprite;
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
      super(sprite);
      this.sprite = sprite;
      this.type = type;
   }
}

export class BrickBlock extends Block {}

export class QuestionBlock extends Block {
   active = true;

   constructor(active: PIXI.Texture, inactive: PIXI.Texture) {
      const anim = new PIXI.AnimatedSprite({ textures: [active, inactive] });
      anim.currentFrame = 0;
      super(anim, "obj-q-blocks");
   }

   bump() {
      this.active = false;
      if (this.ctr instanceof PIXI.AnimatedSprite) {
         this.ctr.currentFrame = 1;
      }
   }
}

export class GroundBlock extends Block {}

export class CollisionArea extends Entity {
   public type: LayerName;
   public rect: PIXI.Rectangle;
   public get center(): Position {
      return {
         x: this.rect.x + this.rect.width,
         y: this.rect.y + this.rect.height,
      };
   }

   constructor(rect: PIXI.Rectangle, type: LayerName) {
      super(new PIXI.Container({ ...rect }));
      this.rect = rect;
      this.type = type;
   }
}

export class StartPoint extends Entity {
   public name: TileObjectName;
   public pos: Position;

   constructor(pos: Position, name: TileObjectName) {
      super(new PIXI.Container({ ...pos }));
      this.pos = { ...pos };
      this.name = name;
   }
}
