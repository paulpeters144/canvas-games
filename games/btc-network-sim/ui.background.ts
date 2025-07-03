import * as PIXI from "pixi.js";

export const createBackground = ({
   rows,
   cols,
   displayGridCords,
}: { rows: number; cols: number; displayGridCords?: boolean }) => {
   const ctr = new PIXI.Container();
   const gridSize = 50;
   const fillColor = "#4E505F";

   const style = new PIXI.TextStyle({
      fill: "#FFFFFF",
      fontFamily: "GraphPix",
      fontSize: 8,
   });

   for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
         const x = col * gridSize;
         const y = row * gridSize;
         const g = new PIXI.Graphics();
         g.cullable = true;
         g.rect(x, y, gridSize, gridSize).fill(fillColor);
         ctr.addChild(g);

         if (displayGridCords) {
            const text = new PIXI.Text({ style, text: `${row + 1},${col + 1}` });
            text.resolution = 2;
            text.anchor.set(0.5, 0.5);
            text.position.set(x + gridSize * 0.5, y + gridSize * 0.5);
            text.cullable = true;
            ctr.addChild(text);
         }
      }
   }

   const dotRadius = 1;
   const dotColor = "#b6cdd5";

   for (let row = 0; row <= rows - 1; row++) {
      for (let col = 0; col <= cols - 1; col++) {
         const x = col * gridSize;
         const y = row * gridSize;
         const g = new PIXI.Graphics();
         g.cullable = true;
         g.circle(x, y, dotRadius).fill({ color: dotColor, alpha: 0.25 });
         ctr.addChild(g);
      }
   }

   return {
      size: { width: cols * gridSize, height: rows * gridSize },
      ctr: ctr,
   };
};
