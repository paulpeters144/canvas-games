import type * as PIXI from "pixi.js";
import type { Position } from "./types";

const createGameScale = () => {
   const appZeroPos: Position = { x: 0, y: 0 };
   const virtWidth = 854;
   const virtHeight = 480;

   let baseScale = 1;
   let dynamicScale = 1;
   let gameScale = 1;

   const updateBaseScaleFromScreen = ({
      screenWidth,
      screenHeight,
   }: { screenWidth: number; screenHeight: number }) => {
      const screenAspectRatio = screenWidth / screenHeight;
      const gameAspectRatio = virtWidth / virtHeight;

      if (screenAspectRatio > gameAspectRatio) {
         baseScale = screenHeight / virtWidth;
         const xPos = (screenWidth - virtWidth * baseScale) / 2;
         appZeroPos.x = xPos;
         appZeroPos.y = 0;
      } else {
         baseScale = screenWidth / virtWidth;
         const yPos = (screenHeight - virtHeight * baseScale) / 2;
         appZeroPos.x = 0;
         appZeroPos.y = yPos;
      }
      gameScale = baseScale * dynamicScale;
   };

   const zoom = (value: number) => {
      const zoomFactor = 1 + value;
      const nextScale = dynamicScale * zoomFactor;

      if (nextScale >= 0.5 && nextScale <= 1.5) {
         dynamicScale = nextScale;
      }
   };

   const setZoom = (value: number) => {
      dynamicScale = value;
   };

   const getGameScale = () => gameScale;

   const getAppZeroPos = () => appZeroPos;

   const getBaseScale = () => baseScale;

   return {
      getAppZeroPos,
      virtWidth,
      virtHeight,
      getBaseScale,
      updateBaseScaleFromScreen,
      getGameScale,
      zoom,
      setZoom,
   };
};

export const gameScaler = createGameScale();

export const createGameResizer = () => {
   return {
      resize: (app: PIXI.Application, game: PIXI.ContainerChild) => {
         const { width: screenWidth, height: screenHeight } = app.screen;
         gameScaler.updateBaseScaleFromScreen({ screenWidth, screenHeight });
         const gameScale = gameScaler.getGameScale();
         const zeroPos = gameScaler.getAppZeroPos();
         game.scale.set(gameScale, gameScale);
         game.position.set(zeroPos.x, zeroPos.y);
      },
   };
};

export const gameResizer = createGameResizer();

let resizeTimer = 0;
const RESIZE_INTERVAL_MS = 150;
export const maybeResize = (app: PIXI.Application, game: PIXI.ContainerChild) => {
   try {
      resizeTimer += app.ticker.deltaMS;

      if (resizeTimer >= RESIZE_INTERVAL_MS) {
         gameResizer.resize(app, game);
         resizeTimer = 0;
      }
   } catch (_) {}
};

interface CameraProps {
   app: PIXI.Application;
   game: PIXI.ContainerChild;
   bounds: { width: number; height: number };
   clampCamera?: boolean;
}

export interface Camera {
   getPosZero: () => Position;
   lookAt: (pos?: Position) => void;
   viewport: { width: number; height: number };
   zoom: (value: number) => void;
   resetZoom: () => void;
}

export const createCamera = (props: CameraProps): Camera => {
   const { game, app, bounds, clampCamera = true } = props;
   const posZero = { x: 0, y: 0 };
   const viewport = { width: 0, height: 0 };

   const zoom = (value: number) => {
      gameScaler.zoom(value);
      lookAt({ x: posZero.x, y: posZero.y });
   };

   const resetZoom = () => gameScaler.setZoom(1);

   const lookAt = (pos?: { x: number; y: number }) => {
      try {
         if (!pos) return;
         viewport.width = app.screen.width;
         viewport.height = app.screen.height;

         let xPos = -pos.x + viewport.width * 0.5;
         let yPos = -pos.y + viewport.height * 0.5;

         if (clampCamera) {
            const boundsWidth = bounds.width * gameScaler.getGameScale();
            const minX = -(boundsWidth - viewport.width);
            const maxX = 0;
            xPos = Math.min(Math.max(xPos, minX), maxX);

            const boundsHeight = bounds.height * gameScaler.getGameScale();
            const minY = -(boundsHeight - viewport.height);
            const maxY = 0;
            yPos = Math.min(Math.max(yPos, minY), maxY);
         }

         game.position.set(xPos, yPos);

         posZero.x = -game.position.x;
         posZero.y = -game.position.y;
      } catch (_) {}
   };

   const getPosZero = () => {
      return { ...posZero };
   };

   return { getPosZero, lookAt, viewport, zoom, resetZoom };
};
