import { BASE_GAME_SCALE } from "games/util/util";
import type * as PIXI from "pixi.js";

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

      viewport.width = app.screen.width / BASE_GAME_SCALE;
      viewport.height = app.screen.height / BASE_GAME_SCALE;

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
