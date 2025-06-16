import * as PIXI from "pixi.js";
import { ZLayer } from "./enum";
import { BASE_PATH } from "./main";
import type { Position } from "./types";

export interface Apples {
   list: () => Apple[];
   createApple: ({ game, pos }: { game: PIXI.ContainerChild; pos: Position }) => void;
   remove: ({ game, id }: { game: PIXI.ContainerChild; id: string }) => void;
   reset: (game: PIXI.ContainerChild) => void;
}

export const createApples = (texture: PIXI.Texture): Apples => {
   const apples: Map<string, Apple> = new Map();

   const createApple = ({ game, pos }: { game: PIXI.ContainerChild; pos: Position }) => {
      const sprite = new PIXI.Sprite(texture);
      sprite.zIndex = ZLayer.bottom;

      sprite.scale.set(0.15);
      sprite.anchor.set(0.5);

      sprite.x = pos.x;
      sprite.y = pos.y;

      const id = crypto.randomUUID().replaceAll("-", "").slice(0, 15);
      const apple: Apple = { id, sprite };

      game.addChild(apple.sprite);

      apples.set(id, apple);
   };

   const list = () => {
      const result: Apple[] = [];
      for (const [_, v] of apples) result.push(v);
      return result;
   };

   const remove = ({ game, id }: { game: PIXI.ContainerChild; id: string }) => {
      const apple = apples.get(id);
      if (apple) {
         game.removeChild(apple.sprite);
         apple.sprite.destroy();
         apples.delete(id);
      }
   };

   const reset = (game: PIXI.ContainerChild) => {
      for (const [id, _] of apples) remove({ game, id });
   };

   return {
      list,
      createApple,
      remove,
      reset,
   };
};

export interface Apple {
   id: string;
   sprite: PIXI.Sprite;
}

export const loadApples = async (): Promise<Apples> => {
   const appleAsset = await PIXI.Assets.load(`${BASE_PATH}/apple.png`);
   const apples = createApples(appleAsset);
   return apples;
};
