import * as PIXI from "pixi.js";
import { bus } from "../_main";
import type { GameAssets } from "../assets";
import type { Position } from "../types";

class CoinAnimData {
   anim: PIXI.AnimatedSprite;
   private originalY: number;
   private vy = -4; // initial upward speed
   private gravity = 0.4; // gravity pulling it back down
   public isActive = true;

   constructor(anim: PIXI.AnimatedSprite) {
      this.anim = anim;
      this.originalY = anim.y;
   }

   update(tick: PIXI.Ticker) {
      if (!this.isActive) return;

      const delta = tick.deltaTime * 0.75;

      // Move the coin
      this.anim.y += this.vy * delta;

      // Apply gravity
      this.vy += this.gravity * delta;

      // Check if the coin returned to its original Y
      if (this.anim.y >= this.originalY) {
         this.anim.y = this.originalY; // snap to original position
         this.isActive = false; // animation is done
      }
   }
}

export class SystemCoinAnimations {
   private _gameRef: PIXI.Container;
   private _gameAssets: GameAssets;
   private _spinningCoins: CoinAnimData[] = [];

   constructor(props: {
      gameRef: PIXI.Container;
      assets: GameAssets;
   }) {
      this._gameRef = props.gameRef;
      this._gameAssets = props.assets;

      bus.on("coinAnim", (e) => {
         const coinAnimation = this._createSpineCoinAnim(e);
         this._spinningCoins.push(coinAnimation);
         this._gameRef.addChild(coinAnimation.anim);
      });
   }

   update(tick: PIXI.Ticker) {
      for (let i = 0; i < this._spinningCoins.length; i++) {
         this._spinningCoins[i].update(tick);
      }
      if (this._spinningCoins.length > 0) {
         const inactiveCoins = this._spinningCoins.filter((e) => !e.isActive);
         this._gameRef.removeChild(...inactiveCoins.map((e) => e.anim));
         this._spinningCoins = this._spinningCoins.filter((e) => e.isActive);
      }
   }

   private _createSpineCoinAnim(startPos: Position) {
      const spriteSheet = this._gameAssets.getTexture("spin-coin-sheet.png");
      const width = 16;
      const height = 16;
      const frames = 4;
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

      const anim = new PIXI.AnimatedSprite({ textures });
      anim.position.set(startPos.x + 2, startPos.y);
      anim.play();
      anim.animationSpeed = 0.2;
      const result = new CoinAnimData(anim);
      return result;
   }
}
