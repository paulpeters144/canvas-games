import * as PIXI from "pixi.js";

const BASE_PATH = "game-imgs/mario";

export const assetFilePath = [
   "brick-debris.png",
   "mario-atlas.png",
   "mario-stand.png",
   "spin-coin-sheet.png",
   "small-mario-spritesheet.png",
] as const;
export type AssetName = (typeof assetFilePath)[number];

export interface GameAssets {
   createSprite: (name: AssetName) => PIXI.Sprite;
   load: () => Promise<void>;
   getTexture: (name: AssetName) => PIXI.Texture;
}

export const createGameAssets = (): GameAssets => {
   const textures: Record<string, PIXI.Texture> = {};
   const load = async () => {
      PIXI.Assets.reset();

      for (const path of assetFilePath) {
         PIXI.Assets.add({ alias: path, src: `${BASE_PATH}/${path}` });
      }

      const assets = await PIXI.Assets.load(assetFilePath);
      for (const key of Object.keys(assets)) {
         textures[key] = assets[key];
         textures[key].source.scaleMode = "nearest";
      }
   };
   return {
      createSprite: (name: AssetName) => new PIXI.Sprite(textures[name]),
      getTexture: (name: AssetName) => textures[name],
      load,
   };
};
