import * as PIXI from "pixi.js";
import { ZLayer } from "./game.enums";

export const createBackground = ({ rows, cols }: { rows: number; cols: number }) => {
   const gridSize = 50;
   const fillColor = "#4E505F";

   const graphic = new PIXI.Graphics();
   graphic.zIndex = ZLayer.bottom;
   const texts: PIXI.Text[] = [];

   const style = new PIXI.TextStyle({ fontFamily: "GraphPix", fontSize: 8 });

   for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
         const x = col * gridSize;
         const y = row * gridSize;

         graphic.rect(x, y, gridSize, gridSize).fill(fillColor);
         const text = new PIXI.Text({ style, text: `${row + 1},${col + 1}` });
         text.resolution = 2;
         text.anchor.set(0.5, 0.5);
         text.position.set(x + gridSize * 0.5, y + gridSize * 0.5);
         texts.push(text);
      }
   }

   const dotRadius = 1;
   const dotColor = "#b6cdd5";

   for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
         const x = col * gridSize;
         const y = row * gridSize;

         graphic.circle(x, y, dotRadius).fill({ color: dotColor, alpha: 0.25 });
      }
   }

   return {
      size: { width: cols * gridSize, height: rows * gridSize },
      graphic: graphic,
      texts,
   };
};
