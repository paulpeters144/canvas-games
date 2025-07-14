import type * as PIXI from "pixi.js";
import type { GameAssets } from "./assets";

export interface GameVars {
   game: PIXI.Container;
   assets: GameAssets;
}
export const createGameVars = (
   game: PIXI.Container,
   assets: GameAssets,
): GameVars => {
   return {
      game,
      assets,
   };
};
