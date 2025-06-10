import * as PIXI from "pixi.js";
import { BASE_PATH } from "./main";

export interface GameTiles {
   tiles: GameTile[];
}

export const createGameTiles = (assets: PIXI.Texture[]): GameTiles => {
   const tiles: GameTile[] = [];

   const { rows, col } = { rows: 15, col: 25 };
   for (let i = 0; i < rows * col; i++) {
      const randomIndex = Math.floor(Math.random() * assets.length);
      const texture = assets[randomIndex];
      const sprite = new PIXI.Sprite(texture);

      sprite.scale.set(0.25);
      sprite.anchor.set(0.5, 0.5);

      const rowIdx = i % col;
      const colIdx = Math.floor(i / col);

      sprite.x = rowIdx * sprite.width + sprite.width * 0.5;
      sprite.y = colIdx * sprite.height + sprite.height * 0.5;

      const tile = createGameTile(sprite);
      tiles.push(tile);
   }

   return {
      tiles,
   };
};

export interface GameTile {
   sprite: PIXI.Sprite;
   getIndexPos: (tile: PIXI.Sprite) => {
      col: number;
      row: number;
   };
}

const createGameTile = (sprite: PIXI.Sprite): GameTile => {
   const getIndexPos = (tile: PIXI.Sprite) => {
      const { x, y, width, height } = tile;

      const xAdjusted = x - width * 0.5;
      const yAdjusted = y - height * 0.5;

      const col = Math.floor(xAdjusted / width);
      const row = Math.floor(yAdjusted / height);

      return { col, row };
   };

   return { sprite, getIndexPos };
};

export const loadTileTextures = async () => {
   const arr = Array.from({ length: 5 });
   const loadAsset = (str: string) => PIXI.Assets.load(str);
   const promises = arr.map((_, idx) => loadAsset(`${BASE_PATH}/box-${idx}.png`));
   const assets = await Promise.all(promises);
   return assets;
};
