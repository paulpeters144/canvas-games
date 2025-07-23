import * as PIXI from "pixi.js";

export enum Collides {
   top = "top",
   right = "right",
   down = "down",
   left = "left",
}

export class CollisionBox {
   public rect: PIXI.Rectangle;

   public get center(): { x: number; y: number } {
      return {
         x: this.rect.x + this.rect.width / 2,
         y: this.rect.y + this.rect.height / 2,
      };
   }

   constructor(props: { x: number; y: number; width: number; height: number }) {
      const { x, y, width, height } = props;
      this.rect = new PIXI.Rectangle(x, y, width, height);
   }

   collides(rect: PIXI.Rectangle, buffer = 0): Collides[] {
      if (!this.rect.intersects(rect)) return [];

      const result: Collides[] = [];

      if (this.rect.right + buffer > rect.left && this.rect.left < rect.left) {
         result.push(Collides.right);
      }

      if (this.rect.left - buffer < rect.right && this.rect.right > rect.right) {
         result.push(Collides.left);
      }

      if (this.rect.bottom + buffer > rect.top && this.rect.top < rect.top) {
         result.push(Collides.down);
      }

      if (this.rect.top - buffer < rect.bottom && this.rect.bottom > rect.bottom) {
         result.push(Collides.top);
      }
      return result;
   }
}

export class SystemObjectCollision {
   private _moveDistance = 150;
   update(props: {
      tick: PIXI.Ticker;
      sprites: PIXI.Sprite[];
      objects: PIXI.Rectangle[];
   }) {
      const { tick, sprites, objects } = props;
      for (let i = 0; i < sprites.length; i++) {
         for (let ii = 0; ii < objects.length; ii++) {
            const spriteCollision = new CollisionBox(sprites[i]);
            const objectCollision = new CollisionBox(objects[ii]);
            const detectedCollision = spriteCollision.collides(objectCollision.rect);
            for (let iii = 0; iii < detectedCollision.length; iii++) {
               if (detectedCollision[iii] === Collides.top)
                  sprites[i].y += this._moveDistance / tick.deltaMS;

               // if (detectedCollision[iii] === Collides.right)
               //    sprites[i].x -= this._moveDistance / tick.deltaMS;

               if (detectedCollision[iii] === Collides.down)
                  sprites[i].y -= this._moveDistance / tick.deltaMS;

               if (detectedCollision[iii] === Collides.left)
                  sprites[i].x += this._moveDistance / tick.deltaMS;
            }
         }
      }
   }
}
