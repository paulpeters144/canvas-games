import * as PIXI from "pixi.js";
import { ZLayer } from "./game.enums";

export const createBackground = ({ rows, cols }: { rows: number; cols: number }) => {
   const gridSize = 50;
   const fillColor = "#FCC889";

   const graphic = new PIXI.Graphics();
   graphic.zIndex = ZLayer.bottom;

   for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
         const x = col * gridSize;
         const y = row * gridSize;

         graphic.rect(x, y, gridSize, gridSize).fill(fillColor);
      }
   }

   const dotRadius = 1;
   const dotColor = "#474e6a";

   for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
         const x = col * gridSize;
         const y = row * gridSize;

         graphic.circle(x, y, dotRadius).fill(dotColor);
      }
   }

   return {
      size: { width: cols * gridSize, height: rows * gridSize },
      graphic: graphic,
   };
};
