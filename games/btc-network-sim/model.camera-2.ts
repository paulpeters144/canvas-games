import type * as PIXI from "pixi.js";
import type { GameVars } from "./game.vars";
import type { Position } from "./types";

export interface GameScaler {
   virtWidth: number;
   virtHeight: number;
   updateBaseScaleFromScreen: ({
      screenWidth,
      screenHeight,
   }: {
      screenWidth: number;
      screenHeight: number;
   }) => void;
   getScale: () => number;
   setZoom: (zoom: number) => void;
   zoom: (delta: number) => void;
}

export const createGameScale = (): GameScaler => {
   const virtWidth = 854;
   const virtHeight = 480;

   let baseScale = 1;
   let dynamicScale = 1;

   const updateBaseScaleFromScreen = ({
      screenWidth,
      screenHeight,
   }: {
      screenWidth: number;
      screenHeight: number;
   }) => {
      const screenAspectRatio = screenWidth / screenHeight;
      const gameAspectRatio = virtWidth / virtHeight;

      if (screenAspectRatio > gameAspectRatio) {
         baseScale = screenHeight / virtWidth;
      } else {
         baseScale = screenWidth / virtWidth;
      }
   };

   const getScale = () => baseScale * dynamicScale;

   const zoom = (delta: number) => {
      const zoomFactor = 1 + delta;
      dynamicScale *= zoomFactor;
      if (dynamicScale < 0.4) dynamicScale = 0.4;
      if (dynamicScale > 2.5) dynamicScale = 2.5;
   };

   const setZoom = (value: number) => {
      dynamicScale = Math.min(Math.max(value, 0.4), 2.5);
   };

   return {
      virtWidth,
      virtHeight,
      getScale,
      updateBaseScaleFromScreen,
      zoom,
      setZoom,
   };
};

export interface GameResizer {
   resize: (app: PIXI.Application) => void;
}

export const createGameResizer = (gameScaler: GameScaler): GameResizer => {
   return {
      resize: (app: PIXI.Application) => {
         const { width: screenWidth, height: screenHeight } = app.screen;
         gameScaler.updateBaseScaleFromScreen({ screenWidth, screenHeight });
         const gameScale = gameScaler.getScale();
         app.stage.scale.set(gameScale);
      },
   };
};

interface CameraProps {
   gameVars: GameVars;
   app: PIXI.Application;
   clampCamera?: boolean;
}

export interface Camera {
   lookAt: (pos?: Position) => void;
   update: (tick: PIXI.Ticker) => void;
   zoomAdd: (amount: number) => void;
   zeroPos: () => Position;
   centerPos: () => Position;
}

export const createCamera = (props: CameraProps): Camera => {
   const { app, gameVars, clampCamera = true } = props;
   const { game, scaler } = gameVars;

   let viewport = { width: 0, height: 0 };
   let zoomDelta = 0;

   const zeroPos = (): Position => {
      return {
         x: -game.position.x,
         y: -game.position.y,
      };
   };

   const centerPos = (): Position => {
      const zero = zeroPos();
      return {
         x: zero.x + viewport.width * 0.5,
         y: zero.y + viewport.height * 0.5,
      };
   };

   const zoomAdd = (amount: number) => {
      zoomDelta = amount;
   };

   const lookAt = (pos?: { x: number; y: number }) => {
      viewport = {
         width: app.screen.width / scaler.getScale(),
         height: app.screen.height / scaler.getScale(),
      };

      try {
         if (!pos) return;

         let xPos = -pos.x + viewport.width * 0.5;
         let yPos = -pos.y + viewport.height * 0.5;

         if (clampCamera) {
            const boundsWidth = game.width;
            const minX = -(boundsWidth - viewport.width);
            const maxX = 0;
            xPos = Math.min(Math.max(xPos, minX), maxX);

            const boundsHeight = game.height;
            const minY = -(boundsHeight - viewport.height);
            const maxY = 0;
            yPos = Math.min(Math.max(yPos, minY), maxY);
         }

         game.position.set(xPos, yPos);
      } catch (_) {}
   };

   const update = (tick: PIXI.Ticker) => {
      if (zoomDelta !== 0) {
         const zoomSpeed = zoomDelta * tick.deltaTime * 0.025;
         scaler.zoom(zoomSpeed);
         const scale = scaler.getScale();
         app.stage.scale.set(scale);
         zoomDelta = 0;
      }
   };

   return {
      centerPos,
      zeroPos,
      lookAt,
      update,
      zoomAdd,
   };
};
