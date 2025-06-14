import type * as PIXI from "pixi.js";

export const VIRTUAL_W = 854;
export const VIRTUAL_H = 480;
export let GAME_SCALE = 1;

export const resizeGame = (app: PIXI.Application) => {
   const { width: screenWidth, height: screenHeight } = app.screen;
   const screenAspectRatio = screenWidth / screenHeight;
   const gameAspectRatio = VIRTUAL_W / VIRTUAL_H;

   if (screenAspectRatio > gameAspectRatio) {
      GAME_SCALE = screenHeight / VIRTUAL_H;
      const xPos = (screenWidth - VIRTUAL_W * GAME_SCALE) / 2;
      app.stage.scale.set(GAME_SCALE, GAME_SCALE);
      app.stage.position.set(xPos, 0);
   } else {
      GAME_SCALE = screenWidth / VIRTUAL_W;
      const yPos = (screenHeight - VIRTUAL_H * GAME_SCALE) / 2;
      app.stage.scale.set(GAME_SCALE, GAME_SCALE);
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

export const lookAt = (props: {
   sprite?: PIXI.Sprite;
   app: PIXI.Application;
   game: PIXI.ContainerChild;
}) => {
   if (!props.sprite) return;

   const { sprite, game, app } = props;

   const viewport = {
      width: app.screen.width / GAME_SCALE,
      height: app.screen.height / GAME_SCALE,
   };

   game.position.set(-sprite.x + viewport.width * 0.5, -sprite.y + viewport.height * 0.5);

   const minX = -(game.width - viewport.width);
   if (game.position.x < minX) {
      game.position.set(minX, game.position.y);
   }
   const minY = -(game.height - viewport.height);
   if (game.position.y < minY) {
      game.position.set(game.position.x, minY);
   }

   if (game.position.x > 0) {
      game.position.set(0, game.position.y);
   }
   if (game.position.y > 0) {
      game.position.set(game.position.x, 0);
   }
};
