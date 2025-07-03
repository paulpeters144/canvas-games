import type * as PIXI from "pixi.js";
import type { GameAssets } from "./assets";
import type { Position } from "./types";

export interface GameVars {
   game: PIXI.Container;
   assets: GameAssets;
   mouse: {
      getPos: () => Position;
      setPos: (pos: Position) => void;
   };
}
export const createGameVars = (
   game: PIXI.Container,
   assets: GameAssets,
): GameVars => {
   let mousePos: Position = { x: 0, y: 0 };

   return {
      game,
      assets,
      mouse: {
         getPos: () => mousePos,
         setPos: (pos: Position) => {
            mousePos = pos;
         },
      },
   };
};
