import type * as PIXI from "pixi.js";
import type { GameAssets } from "./assets";
import {
   type GameResizer,
   type GameScaler,
   createGameResizer,
   createGameScale,
} from "./camera";
import type { Position } from "./types";

export interface GameVars {
   app: PIXI.Application<PIXI.Renderer>;
   game: PIXI.Container;
   assets: GameAssets;
   resizer: GameResizer;
   scaler: GameScaler;
   mouse: {
      getPos: () => Position;
      setPos: (pos: Position) => void;
   };
   getWindowSize: () => {
      width: number;
      height: number;
   };
}
export const createGameVars = (
   app: PIXI.Application,
   game: PIXI.ContainerChild,
   assets: GameAssets,
): GameVars => {
   const gameScaler = createGameScale();
   const getWindowSize = () => {
      return {
         width: game.width / gameScaler.getGameScale(),
         height: game.height / gameScaler.getGameScale(),
      };
   };

   let mousePos: Position = { x: 0, y: 0 };

   return {
      app,
      game,
      assets,
      resizer: createGameResizer(gameScaler),
      scaler: gameScaler,
      getWindowSize,
      mouse: {
         getPos: () => mousePos,
         setPos: (pos: Position) => {
            mousePos = pos;
         },
      },
   };
};
