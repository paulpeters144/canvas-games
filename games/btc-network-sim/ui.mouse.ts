import type * as PIXI from "pixi.js";
import type { AssetName } from "./assets";

export const setMouseImages = (app: PIXI.Application) => {
   const baseImages = "game-imgs/btc-net-sim";
   const getAssetPath = (name: AssetName) => `url(${baseImages}/${name}.png),auto`;

   app.renderer.events.cursorStyles.default = getAssetPath("ms-default");
   app.renderer.events.cursorStyles.pointer = getAssetPath("ms-pointer");
   app.renderer.events.cursorStyles.grabbing = getAssetPath("ms-grabbing");
   app.renderer.events.cursorStyles.grab = getAssetPath("ms-grab");
};
