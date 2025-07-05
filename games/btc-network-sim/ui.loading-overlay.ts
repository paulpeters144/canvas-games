import * as PIXI from "pixi.js";
import { bus } from "./main";
import { color } from "./ui.colors";

export const createLoadingOverlay = (app: PIXI.Application) => {
   const ctr = new PIXI.Container();
   const { screen } = app;

   const bgGraphic = new PIXI.Graphics()
      .rect(0, 0, screen.width, screen.height)
      .fill({ color: color.inBorder });

   const loadingText = new PIXI.Text({
      style: new PIXI.TextStyle({
         fontFamily: "GraphPix",
         fontSize: 32,
         fill: "white",
      }),
      text: "Loading",
   });
   loadingText.x = screen.width * 0.5 - loadingText.width * 0.62;
   loadingText.y = screen.height * 0.45 - loadingText.height;

   let gameLoaded = false;
   const addBouncingSquares = () => {
      const squareSize = 10;
      const spacing = 30;
      const startX = loadingText.x + loadingText.width + 7;
      const baseY = loadingText.y + loadingText.height * 0.2;

      const squares: PIXI.Graphics[] = [];

      for (let i = 0; i < 3; i++) {
         const square = new PIXI.Graphics()
            .rect(0, 0, squareSize, squareSize)
            .fill({ color: "white" });
         square.x = startX + i * spacing;
         square.y = baseY;
         squares.push(square);
      }

      app.ticker.add((_) => {
         if (gameLoaded) return;

         const time = performance.now() / 900;
         for (let i = 0; i < squares.length; i++) {
            const square = squares[i];
            const phase = i * 0.75;
            square.y = baseY + Math.sin(time * 4 + phase) * -15;
         }
      });
      ctr.addChild(...squares);
   };

   setTimeout(addBouncingSquares, 0);

   ctr.addChild(bgGraphic, loadingText);
   app.stage.addChild(ctr);

   bus.on("gameLoaded", () => {
      gameLoaded = true;
      setTimeout(() => {
         app.stage.removeChild(ctr);
         ctr.destroy({ children: true });
      }, 0);
   });
};
