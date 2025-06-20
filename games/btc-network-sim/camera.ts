import type * as PIXI from "pixi.js";
import type { GameVars } from "./game.vars";
import type { Position } from "./types";

export interface GameScaler {
   getAppZeroPos: () => Position;
   virtWidth: number;
   virtHeight: number;
   getBaseScale: () => number;
   updateBaseScaleFromScreen: ({
      screenWidth,
      screenHeight,
   }: {
      screenWidth: number;
      screenHeight: number;
   }) => void;
   getGameScale: () => number;
   zoom: (value: number) => void;
   setZoom: (value: number) => void;
}

export const createGameScale = (): GameScaler => {
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
      dynamicScale = dynamicScale * zoomFactor;
      if (dynamicScale < 0.5) {
         dynamicScale = 0.5;
      }
      if (dynamicScale > 2) {
         dynamicScale = 2;
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

export interface GameResizer {
   resize: (app: PIXI.Application, game: PIXI.ContainerChild) => void;
}

export const createGameResizer = (gameScaler: GameScaler): GameResizer => {
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

let resizeTimer = 0;
const RESIZE_INTERVAL_MS = 150;
export const maybeResize = (gameVars: GameVars) => {
   try {
      const { app, game, resizer } = gameVars;
      resizeTimer += app.ticker.deltaMS;

      if (resizeTimer >= RESIZE_INTERVAL_MS) {
         resizer.resize(app, game);
         resizeTimer = 0;
      }
   } catch (_) {}
};

interface CameraProps {
   gameVars: GameVars;
   bounds: { width: number; height: number };
   clampCamera?: boolean;
}

export interface Camera {
   lookAt: (pos?: Position) => void;
   viewport: { width: number; height: number };
   zoom: (value: number) => void;
   resetZoom: () => void;
   update: (tick: PIXI.Ticker) => void;
}

export const createCamera = (props: CameraProps): Camera => {
   const { gameVars, bounds, clampCamera = true } = props;
   const { app, game, scaler } = gameVars;

   const viewport = { width: 0, height: 0 };
   let zoomAmount = 0;
   const zoom = (value: number) => {
      zoomAmount = value;
      // scaler.zoom(value);
   };

   const resetZoom = () => scaler.setZoom(1);

   const lookAt = (pos?: { x: number; y: number }) => {
      try {
         if (!pos) return;
         viewport.width = app.screen.width;
         viewport.height = app.screen.height;

         let xPos = -pos.x + viewport.width * 0.5;
         let yPos = -pos.y + viewport.height * 0.5;

         if (clampCamera) {
            const boundsWidth = bounds.width * scaler.getGameScale();
            const minX = -(boundsWidth - viewport.width);
            const maxX = 0;
            xPos = Math.min(Math.max(xPos, minX), maxX);

            const boundsHeight = bounds.height * scaler.getGameScale();
            const minY = -(boundsHeight - viewport.height);
            const maxY = 0;
            yPos = Math.min(Math.max(yPos, minY), maxY);
         }

         game.position.set(xPos, yPos);
      } catch (_) {}
   };

   const update = (tick: PIXI.Ticker) => {
      if (zoomAmount !== 0) {
         scaler.zoom(zoomAmount * tick.deltaMS);
         zoomAmount = 0;
      }
   };

   return {
      lookAt,
      viewport,
      zoom,
      resetZoom,
      update,
   };
};
