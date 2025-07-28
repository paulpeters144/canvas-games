import * as PIXI from "pixi.js";
import { bus } from "../_main";
import type { GameAssets } from "../assets";
import { MarioModel } from "../model.mario";
import type { EntityStore } from "../store.entity";
import type { Camera } from "../util.camera";

export class SystemGrowMarioAnimation {
   private _gameRef: PIXI.Container;
   private _entityStore: EntityStore;
   private _growAnim: PIXI.AnimatedSprite;
   private _mode: "grow" | "shrink" | null = null;
   private _gameCam: Camera;

   constructor(props: {
      gameRef: PIXI.Container;
      entityStore: EntityStore;
      assets: GameAssets;
      camera: Camera;
   }) {
      this._gameRef = props.gameRef;
      this._entityStore = props.entityStore;
      this._gameCam = props.camera;
      // Setup grow/shrink animation frames
      const width = 16;
      const height = 32;
      const frames = 4;

      const textures = Array.from({ length: frames }, (_, i) => {
         const t = new PIXI.Texture({
            source: props.assets.getTexture("mario-grow-anim.png").source,
            frame: new PIXI.Rectangle(width * i, 0, width, height),
         });
         t.source.scaleMode = "nearest";
         return t;
      });

      this._growAnim = new PIXI.AnimatedSprite({ textures });
      this._growAnim.animationSpeed = 0.15;
      this._growAnim.loop = false;
      this._growAnim.visible = false;
      this._gameRef.addChild(this._growAnim);

      // Listen for marioChange event
      bus.on("marioChange", (e) => {
         const mario = this._entityStore.firstOrDefault(MarioModel);
         if (!mario) return;

         if (e === "grow") {
            this._mode = "grow";
            mario.isPaused = true;
            mario.anim.visible = false;

            this._growAnim.x = mario.anim.x;
            this._growAnim.y = mario.anim.y - 16;
            this._growAnim.gotoAndPlay(0);
            this._growAnim.visible = true;
         }

         if (e === "shrink") {
            this._mode = "shrink";
            mario.isPaused = true;
            mario.anim.visible = false;

            this._growAnim.x = mario.anim.x;
            this._growAnim.y = mario.anim.y;
            this._growAnim.gotoAndStop(this._growAnim.textures.length - 1);
            this._growAnim.visible = true;
         }
      });
   }

   interval = 0;
   maxInterval = 75;
   update(tick: PIXI.Ticker) {
      if (!this._growAnim.visible) return;

      const mario = this._entityStore.firstOrDefault(MarioModel);
      if (!mario) return;

      if (this._mode === "grow") {
         if (this._growAnim.currentFrame === this._growAnim.textures.length - 1) {
            mario.setState("big");
            mario.isPaused = false;
            mario.anim.visible = true;
            this._growAnim.visible = false;
            this._gameCam.follow(mario.anim);
         }
      }

      if (this._mode === "shrink") {
         // manually go in reverse
         this.interval += tick.deltaMS;
         if (this.interval >= this.maxInterval) {
            this.interval = 0;
            const prev = this._growAnim.currentFrame - 1;
            if (prev < 0) {
               mario.setState("small");
               mario.isPaused = false;
               mario.anim.visible = true;
               this._growAnim.visible = false;
            } else {
               this._growAnim.gotoAndStop(prev);
            }
         }
         this._gameCam.follow(mario.anim);
      }
   }
}
