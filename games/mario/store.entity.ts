import type * as PIXI from "pixi.js";
import type { Entity } from "./model.entity";

export class EntityStore {
   private _store = new Map<string, Entity[]>();
   private _gameRef: PIXI.Container;

   constructor(props: { gameRef: PIXI.Container }) {
      this._gameRef = props.gameRef;
   }

   public add<T extends Entity>(...entities: T[]) {
      for (const entity of entities) {
         const key = entity.constructor.name;
         if (!this._store.has(key)) {
            this._store.set(key, []);
         }
         this._store.get(key)?.push(entity);
         this._gameRef.addChild(entity.ctr);
      }
   }

   public remove(...entities: Entity[]) {
      for (const entity of entities) {
         const key = entity.constructor.name;
         const list = this._store.get(key);
         if (!list) continue;

         const index = list.indexOf(entity);
         if (index !== -1) {
            const entToRemove = list[index];
            list.splice(index, 1);
            this._gameRef.removeChild(entToRemove.ctr);
         }

         if (list.length === 0) {
            this._store.delete(key);
         }
      }
   }

   // biome-ignore lint/suspicious/noExplicitAny: need this to allow search by ctr name
   public getAll<T extends Entity>(type: new (...args: any[]) => T): T[] {
      return (this._store.get(type.name) as T[]) || [];
   }

   // biome-ignore lint/suspicious/noExplicitAny: need this to allow search by ctr name
   public firstOrDefault<T extends Entity>(type: new (...args: any[]) => T) {
      const result = this._store.get(type.name)?.at(0);
      return result as T | undefined;
   }

   public clear() {
      this._store.clear();
   }
}
