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

interface CameraProps {
   app: PIXI.Application;
   game: PIXI.ContainerChild;
   bounds: { width: number; height: number };
}

export interface Camera {
   posZero: {
      x: number;
      y: number;
   };
   lookAt: (pos?: {
      x: number;
      y: number;
   }) => void;
   viewport: {
      width: number;
      height: number;
   };
}

export const createCamera = (props: CameraProps): Camera => {
   const { game, app, bounds } = props;
   const posZero = { x: 0, y: 0 };
   const viewport = { width: 0, height: 0 };

   const lookAt = (pos?: { x: number; y: number }) => {
      if (!pos) return;

      viewport.width = app.screen.width / GAME_SCALE;
      viewport.height = app.screen.height / GAME_SCALE;

      let xPos = -pos.x + viewport.width * 0.5;
      let yPos = -pos.y + viewport.height * 0.5;
      const minX = -(bounds.width - viewport.width);
      const maxX = 0;
      xPos = Math.min(Math.max(xPos, minX), maxX);

      const minY = -(bounds.height - viewport.height);
      const maxY = 0;
      yPos = Math.min(Math.max(yPos, minY), maxY);

      game.position.set(xPos, yPos);

      posZero.x = -game.position.x;
      posZero.y = -game.position.y;
   };

   return { posZero, lookAt, viewport };
};

export interface Position {
   x: number;
   y: number;
}

export interface IndexPos {
   row: number;
   col: number;
}

export const collide = {
   circles: (sprite1: PIXI.Sprite, sprite2: PIXI.Sprite): boolean => {
      const buffer = 8;
      const circle1 = {
         x: sprite1.x,
         y: sprite1.y,
         radius: sprite1.width * 0.5 - buffer,
      };
      const circle2 = {
         x: sprite2.x,
         y: sprite2.y,
         radius: sprite2.width * 0.5,
      };

      const dx = circle1.x - circle2.x;
      const dy = circle1.y - circle2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance < circle1.radius + circle2.radius;
   },

   squares: (sprite1: PIXI.Sprite, sprite2: PIXI.Sprite): boolean => {
      const bounds1 = sprite1.getBounds();
      const bounds2 = sprite2.getBounds();

      const xOverlap = bounds1.left < bounds2.right && bounds1.right > bounds2.left;
      const yOverlap = bounds1.top < bounds2.bottom && bounds1.bottom > bounds2.top;

      return xOverlap && yOverlap;
   },
};
