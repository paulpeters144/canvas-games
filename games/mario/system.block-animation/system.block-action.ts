import type * as PIXI from "pixi.js";
import { bus } from "../_main";
import type { GameAssets } from "../assets";
import { BrickBlock, QuestionBlock } from "../model.object";
import type { EntityStore } from "../store.entity";
import type { Position } from "../types";
import { BrickDebris } from "./model.brick-debris";
import { SquareBumpAnimation } from "./model.square-bump-anim";

export class SystemBlockAction {
   private _gameRef: PIXI.Container;
   private _entityStore: EntityStore;
   private _gameAssets: GameAssets;
   private _debris: BrickDebris[] = [];
   private _bumpAnimations: SquareBumpAnimation[] = [];

   constructor(props: {
      gameRef: PIXI.Container;
      entityStore: EntityStore;
      assets: GameAssets;
   }) {
      this._gameRef = props.gameRef;
      this._entityStore = props.entityStore;
      this._gameAssets = props.assets;

      bus.on("brickBrake", (e) => {
         this._setBrickExplodeAt(e);
      });

      bus.on("brickBump", (e) => {
         const byId = (x: { id: string }) => x.id === e.id;
         const block = this._entityStore.getAll(BrickBlock).find(byId);
         if (!block) return;
         this._bumpAnimations.push(new SquareBumpAnimation(block.ctr));
      });

      bus.on("qBlockBump", (e) => {
         const byId = (x: { id: string }) => x.id === e.id;
         const block = this._entityStore.getAll(QuestionBlock).find(byId);
         if (!block) return;
         this._bumpAnimations.push(new SquareBumpAnimation(block.ctr));
      });
   }

   update(tick: PIXI.Ticker) {
      for (let i = 0; i < this._debris.length; i++) {
         this._debris[i].update(tick);
      }
      for (const debris of this._debris.filter((d) => !d.isActive)) {
         this._gameRef.removeChild(...debris.allSprites);
         const idx = this._debris.indexOf(debris);
         this._debris.splice(idx, 1);
      }

      for (let i = 0; i < this._bumpAnimations.length; i++) {
         this._bumpAnimations[i].update(tick);
      }
      for (const bumpAnim of this._bumpAnimations.filter((d) => !d.active)) {
         const idx = this._bumpAnimations.indexOf(bumpAnim);
         this._bumpAnimations.splice(idx, 1);
      }
   }

   private _setBrickExplodeAt(pos: Position) {
      const brick = new BrickDebris({
         startPos: pos,
         pieces: {
            topLeft: this._gameAssets.createSprite("brick-debris.png"),
            topRight: this._gameAssets.createSprite("brick-debris.png"),
            btLeft: this._gameAssets.createSprite("brick-debris.png"),
            btRight: this._gameAssets.createSprite("brick-debris.png"),
         },
      });

      this._gameRef.addChild(...brick.allSprites);
      this._debris.push(brick);
   }
}
