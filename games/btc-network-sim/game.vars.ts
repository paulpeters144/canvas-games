import type * as PIXI from "pixi.js";
import type { GameAssets } from "./assets";
import {
   type GameResizer,
   type GameScaler,
   createGameResizer,
   createGameScale,
} from "./model.camera-2";
import type { Position } from "./types";

export interface GameVars {
   game: PIXI.Container;
   assets: GameAssets;
   resizer: GameResizer;
   scaler: GameScaler;
   mouse: {
      getPos: () => Position;
      setPos: (pos: Position) => void;
   };
}
export const createGameVars = (
   game: PIXI.Container,
   assets: GameAssets,
): GameVars => {
   const gameScaler = createGameScale();

   let mousePos: Position = { x: 0, y: 0 };

   return {
      game,
      assets,
      resizer: createGameResizer(gameScaler),
      scaler: gameScaler,
      mouse: {
         getPos: () => mousePos,
         setPos: (pos: Position) => {
            mousePos = pos;
         },
      },
   };
};
