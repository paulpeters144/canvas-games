import type * as PIXI from "pixi.js";

export const VIRTUAL_W = 854;
export const VIRTUAL_H = 480;
export let BASE_GAME_SCALE = 1;

export const resizeGame = (app: PIXI.Application) => {
   const { width: screenWidth, height: screenHeight } = app.screen;
   const screenAspectRatio = screenWidth / screenHeight;
   const gameAspectRatio = VIRTUAL_W / VIRTUAL_H;

   if (screenAspectRatio > gameAspectRatio) {
      BASE_GAME_SCALE = screenHeight / VIRTUAL_H;
      const xPos = (screenWidth - VIRTUAL_W * BASE_GAME_SCALE) / 2;
      app.stage.scale.set(BASE_GAME_SCALE, BASE_GAME_SCALE);
      app.stage.position.set(xPos, 0);
   } else {
      BASE_GAME_SCALE = screenWidth / VIRTUAL_W;
      const yPos = (screenHeight - VIRTUAL_H * BASE_GAME_SCALE) / 2;
      app.stage.scale.set(BASE_GAME_SCALE, BASE_GAME_SCALE);
      app.stage.position.set(0, yPos);
   }
};

let resizeTimer = 0;
const RESIZE_INTERVAL_MS = 150;
export const maybeResize = (app: PIXI.Application) => {
   try {
      resizeTimer += app.ticker.deltaMS;

      if (resizeTimer >= RESIZE_INTERVAL_MS) {
         resizeGame(app);
         resizeTimer = 0;
      }
   } catch (_) {}
};
