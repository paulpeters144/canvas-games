import type * as PIXI from "pixi.js";
import type { GameAssets } from "./assets";
import { type GameResizer, type GameScaler, createGameResizer, createGameScale } from "./camera";

export interface GameVars {
   app: PIXI.Application<PIXI.Renderer>;
   game: PIXI.ContainerChild;
   assets: GameAssets;
   resizer: GameResizer;
   scaler: GameScaler;
   getWindowSize: () => {
      width: number;
      height: number;
   };
}
export const createGameVars = (
   app: PIXI.Application,
   game: PIXI.ContainerChild,
   assets: GameAssets,
) => {
   const gameScaler = createGameScale();
   const getWindowSize = () => {
      return {
         width: game.width / gameScaler.getGameScale(),
         height: game.height / gameScaler.getGameScale(),
      };
   };

   return {
      app,
      game,
      assets,
      resizer: createGameResizer(gameScaler),
      scaler: gameScaler,
      getWindowSize,
   };
};
