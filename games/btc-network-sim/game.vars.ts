import type * as PIXI from "pixi.js";
import type { GameAssets } from "./assets";
import { type GameResizer, type GameScaler, createGameResizer, createGameScale } from "./camera";

export interface GameVars {
   app: PIXI.Application<PIXI.Renderer>;
   game: PIXI.ContainerChild;
   assets: GameAssets;
   resizer: GameResizer;
   scaler: GameScaler;
}
export const createGameVars = (
   app: PIXI.Application,
   game: PIXI.ContainerChild,
   assets: GameAssets,
) => {
   const gameScaler = createGameScale();
   return {
      app,
      game,
      assets,
      resizer: createGameResizer(gameScaler),
      scaler: gameScaler,
   };
};
