import * as PIXI from "pixi.js";
import { BASE_PATH, FONT_STYLE } from "./main";

export interface GameTiles {
   tiles: GameTile[];
   sizeIdx: { row: number; col: number };
   size: { width: number; height: number };
   getTileFromIndexPos: (props: { row: number; col: number }) => GameTile;
   displayIndexes: (game: PIXI.ContainerChild) => void;
   displayPosIndexes: (game: PIXI.ContainerChild) => void;
}

interface CreateGameProps {
   textures: PIXI.Texture[];
   gridSize: { row: number; col: number };
}

export const createGameTiles = ({ gridSize, textures }: CreateGameProps): GameTiles => {
   const tiles: GameTile[] = [];
   const { row, col } = gridSize;

   for (let i = 0; i < row * col; i++) {
      const randomIndex = Math.floor(Math.random() * textures.length);
      const texture = textures[randomIndex];
      const sprite = new PIXI.Sprite(texture);

      sprite.scale.set(0.25);
      sprite.anchor.set(0.5, 0.5);

      const rowIdx = Math.floor(i / col);
      const colIdx = i % col;

      sprite.x = colIdx * sprite.width + sprite.width * 0.5;
      sprite.y = rowIdx * sprite.height + sprite.height * 0.5;

      const tile = createGameTile(sprite);
      tiles.push(tile);
   }

   const getTileFromIndexPos = (props: { row: number; col: number }): GameTile => {
      const index = props.row * gridSize.col + props.col;
      return tiles[index];
   };

   const displayIndexes = (game: PIXI.ContainerChild) => {
      for (let i = 0; i < tiles.length; i++) {
         const tile = tiles[i];
         const text = new PIXI.Text({ style: FONT_STYLE, text: `${i}` });
         text.resolution = 2;
         const { x, y } = tile.sprite;
         text.position.set(x - 18, y - 18);
         game.addChild(text);
      }
   };

   const displayPosIndexes = (game: PIXI.ContainerChild) => {
      for (const tile of tiles) {
         const pos = tile.getIndexPos();
         const text = new PIXI.Text({ style: FONT_STYLE, text: `${pos.row}, ${pos.col}` });
         text.resolution = 2;
         const { x, y } = tile.sprite;
         text.position.set(x - 18, y - 18);
         game.addChild(text);
      }
   };

   return {
      tiles,
      sizeIdx: gridSize,
      size: {
         width: tiles[0].sprite.width * gridSize.col,
         height: tiles[0].sprite.height * gridSize.row,
      },
      getTileFromIndexPos,
      displayIndexes,
      displayPosIndexes,
   };
};

export interface GameTile {
   sprite: PIXI.Sprite;
   getIndexPos: () => {
      col: number;
      row: number;
   };
}

const createGameTile = (sprite: PIXI.Sprite): GameTile => {
   const getIndexPos = () => {
      const { x, y, width, height } = sprite;

      const xAdjusted = x - width * 0.5;
      const yAdjusted = y - height * 0.5;

      const col = Math.floor(xAdjusted / width);
      const row = Math.floor(yAdjusted / height);

      return { col, row };
   };

   return { sprite, getIndexPos };
};

export const loadTileTextures = async (): Promise<PIXI.Texture[]> => {
   const arr = Array.from({ length: 5 });
   const loadAsset = (str: string): Promise<PIXI.Texture> => PIXI.Assets.load(str);
   const promises = arr.map((_, idx) => loadAsset(`${BASE_PATH}/box-${idx}.png`));
   const assets = await Promise.all(promises);
   return assets;
};
