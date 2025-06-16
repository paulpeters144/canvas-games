import * as PIXI from "pixi.js";

const BASE_PATH = "game-imgs/btc-net-sim";

export const assetNames = ["circle-btn", "ctx-option"] as const;
export type AssetName = (typeof assetNames)[number];

export interface GameAssets {
   createSprite: (name: AssetName) => PIXI.Sprite;
   load: () => Promise<void>;
}

export const createGameAssets = (): GameAssets => {
   const textures: Record<string, PIXI.Texture> = {};
   const load = async () => {
      PIXI.Assets.reset();

      for (const name of assetNames) {
         PIXI.Assets.add({ alias: name, src: `${BASE_PATH}/${name}.png` });
      }

      const assets = await PIXI.Assets.load(assetNames);
      for (const key of Object.keys(assets)) {
         textures[key] = assets[key];
         textures[key].source.scaleMode = "nearest";
      }
   };
   return {
      createSprite: (name: AssetName) => new PIXI.Sprite(textures[name]),
      load,
   };
};
