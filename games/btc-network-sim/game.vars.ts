import type * as PIXI from "pixi.js";
import { type GameResizer, type GameScaler, createGameResizer, createGameScale } from "./camera";

export interface GameVars {
   app: PIXI.Application<PIXI.Renderer>;
   game: PIXI.ContainerChild;
   resizer: GameResizer;
   scaler: GameScaler;
}
export const createGameVars = (app: PIXI.Application, game: PIXI.ContainerChild) => {
   const gameScaler = createGameScale();
   return {
      app,
      game,
      resizer: createGameResizer(gameScaler),
      scaler: gameScaler,
   };
};
