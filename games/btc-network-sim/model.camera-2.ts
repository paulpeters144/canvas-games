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
   getScaleData: () => {
      gameScale: number;
      percentScale: number;
      baseScale: number;
   };
   setZoom: (zoom: number) => void;
   zoom: (delta: number) => void;
   zoomPercent: () => number;
   atMaxScalePercent: () => boolean;
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
         baseScale = screenHeight / virtHeight;
      } else {
         baseScale = screenWidth / virtWidth;
      }
   };

   const getScaleData = () => {
      return {
         gameScale: baseScale * dynamicScale,
         percentScale: dynamicScale,
         baseScale: baseScale,
      };
   };

   const zoom = (delta: number) => {
      const zoomFactor = 1 + delta;
      dynamicScale *= zoomFactor;
      if (dynamicScale < 0.65) dynamicScale = 0.65;
      if (dynamicScale > 1.5) dynamicScale = 1.5;
   };

   const atMaxScalePercent = () => {
      if (dynamicScale === 0.65) return true;
      if (dynamicScale === 1.5) return true;
      return false;
   };

   const zoomPercent = () => dynamicScale;

   const setZoom = (value: number) => {
      dynamicScale = Math.min(Math.max(value, 0.4), 2.5);
   };

   return {
      virtWidth,
      virtHeight,
      getScaleData,
      updateBaseScaleFromScreen,
      zoom,
      setZoom,
      zoomPercent,
      atMaxScalePercent,
   };
};

export interface GameResizer {
   resize: (app: PIXI.Application) => void;
}

export const createGameResizer = (scaler: GameScaler): GameResizer => {
   return {
      resize: (app: PIXI.Application) => {
         const { width: screenWidth, height: screenHeight } = app.screen;
         scaler.updateBaseScaleFromScreen({ screenWidth, screenHeight });
         const data = scaler.getScaleData();
         app.stage.scale.set(data.baseScale);
      },
   };
};

interface dragFeatureProps {
   app: PIXI.Application;
   game: PIXI.Container;
   scaler: GameScaler;
   clampCamera?: boolean;
   getViewport: () => { width: number; height: number };
   onDrag?: (cb: (gamePos: Position) => void) => void;
}

const createCameraDragFeature = (props: dragFeatureProps) => {
   const { app, game, scaler, clampCamera, getViewport } = props;

   let isDragging = false;
   let dragStart: Position = { x: 0, y: 0 };
   let cameraStart: Position = { x: 0, y: 0 };
   const nextGamePos: Position = { x: 0, y: 0 };

   const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragStart = { x: e.clientX, y: e.clientY };
      cameraStart = { x: game.position.x, y: game.position.y };
      app.stage.cursor = "grabbing";
   };

   let onDragCb: ((gamePos: Position) => void) | undefined;
   const onDrag = (cb: (gamePos: Position) => void) => {
      onDragCb = cb;
   };

   const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;

      const dx = (e.clientX - dragStart.x) / scaler.getScaleData().gameScale;
      const dy = (e.clientY - dragStart.y) / scaler.getScaleData().gameScale;

      let xPos = cameraStart.x + dx;
      let yPos = cameraStart.y + dy;

      if (clampCamera) {
         const boundsWidth = game.width;
         const boundsHeight = game.height;
         const { width, height } = getViewport();

         const minX = -(boundsWidth - width);
         const maxX = 0;
         const minY = -(boundsHeight - height);
         const maxY = 0;

         xPos = Math.min(Math.max(xPos, minX), maxX);
         yPos = Math.min(Math.max(yPos, minY), maxY);
      }

      nextGamePos.x = xPos;
      nextGamePos.y = yPos;
      onDragCb?.(nextGamePos);
   };

   const onPointerUp = () => {
      isDragging = false;
      app.stage.cursor = "default";
   };

   const enableDrag = () => {
      const view = app.canvas;
      view.addEventListener("pointerdown", onPointerDown);
      view.addEventListener("pointermove", onPointerMove);
      view.addEventListener("pointerup", onPointerUp);
      view.addEventListener("pointerleave", onPointerUp);
   };

   const removeDrag = () => {
      const view = app.canvas;
      view.removeEventListener("pointerdown", onPointerDown);
      view.removeEventListener("pointermove", onPointerMove);
      view.removeEventListener("pointerup", onPointerUp);
      view.removeEventListener("pointerleave", onPointerUp);
   };

   return {
      enableDrag,
      removeDrag,
      onDrag,
   };
};

interface CameraProps {
   gameVars: GameVars;
   app: PIXI.Application;
   clampCamera?: boolean;
   enableDrag?: boolean;
}

export interface Camera {
   lookAt: (pos?: Position) => void;
   update: (tick: PIXI.Ticker) => void;
   zoomAdd: (props: {
      amount: number;
      byUser?: boolean;
   }) => void;
   zeroPos: () => Position;
   centerPos: () => Position;
   userInput: {
      enable: () => void;
      disable: () => void;
      isEnabled: () => boolean;
   };
   zoomTo: (props: { percent: number }) => void;
   moveFromTo: (props: {
      endPos: Position;
      speed: number;
   }) => boolean;
   drag: {
      enable: () => void;
      remove: () => void;
   };
   viewport: () => {
      width: number;
      height: number;
   };
   scaler: GameScaler;
}

export const createCamera = (props: CameraProps): Camera => {
   const { app, gameVars, clampCamera = true } = props;
   const { game, scaler } = gameVars;
   let nextGamePos: Position = { x: 0, y: 0 };
   let userInputEnabled = true;

   let viewport = { width: 0, height: 0 };
   const updateViewport = () => {
      viewport = {
         width: app.screen.width * scaler.getScaleData().baseScale,
         height: app.screen.height * scaler.getScaleData().baseScale,
      };
   };
   const getViewport = () => viewport;

   const dragFeature = createCameraDragFeature({
      app,
      game,
      scaler,
      clampCamera,
      getViewport,
   });
   dragFeature.onDrag((pos: Position) => {
      if (!userInputEnabled) return;
      nextGamePos.x = pos.x;
      nextGamePos.y = pos.y;
   });

   if (props.enableDrag) dragFeature.enableDrag();

   let zoomDelta = 0;
   const zeroPos = (): Position => {
      const scale = game.scale.x;
      return {
         x: -game.position.x / scale,
         y: -game.position.y / scale,
      };
   };

   const centerPos = (): Position => {
      const scale = game.scale.x;
      const screenWidth = app.screen.width;
      const screenHeight = app.screen.height;

      const worldX = (screenWidth / 2 - game.position.x) / scale;
      const worldY = (screenHeight / 2 - game.position.y) / scale;

      return { x: worldX, y: worldY };
   };

   const zoomAdd = (props: { amount: number; byUser?: boolean }) => {
      const { amount, byUser = true } = props;
      if (!userInputEnabled && byUser) return;
      zoomDelta = amount;
   };

   let moveData: MoveData | null;
   const moveFromTo = (props: { endPos: Position; speed: number }) => {
      if (!props.endPos) return false;
      const { endPos, speed } = props;

      endPos.x = -endPos.x + viewport.width * 0.5;
      endPos.y = -endPos.y + viewport.height * 0.5;
      if (nextGamePos.x === endPos.x && nextGamePos.y === endPos.y) {
         return true;
      }
      moveData = createMoveToData({ endPos, startPos: nextGamePos, speed });
      userInputEnabled = false;
      return false;
   };

   let zoomTargetPercent: number | null = null;
   const zoomTo = ({ percent }: { percent: number }) => {
      userInputEnabled = false;
      zoomTargetPercent = percent;
   };

   const lookAt = (pos?: { x: number; y: number }) => {
      updateViewport();

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

         nextGamePos.x = xPos;
         nextGamePos.y = yPos;
      } catch (_) {}
   };

   const update = (tick: PIXI.Ticker) => {
      if (moveData && zoomTargetPercent) {
         const msg = "can't zoom and move camera at the same time currently";
         throw new Error(msg);
      }
      if (zoomDelta !== 0) {
         const props = { app, game, scaler, tick, zoomDelta };
         nextGamePos = handleIncrementZoom(props);
         zoomDelta = 0;
         updateViewport();
      }

      if (zoomTargetPercent) {
         const zoomDiff = zoomTargetPercent - scaler.zoomPercent();
         zoomDelta = zoomDiff > 0 ? 1 : -1;
         if (scaler.atMaxScalePercent()) {
            userInputEnabled = true;
            zoomTargetPercent = null;
         }
         if (zoomTargetPercent && Math.abs(zoomDiff) < 0.02) {
            scaler.setZoom(zoomTargetPercent);
            userInputEnabled = true;
            zoomTargetPercent = null;
         }
      }

      if (moveData) {
         moveData.update(tick);
         nextGamePos = moveData.currentPos();
         if (moveData.inPos()) {
            userInputEnabled = true;
            moveData = null;
         }
         const curPos = moveData?.currentPos();
         nextGamePos = curPos ? curPos : nextGamePos;
      }

      if (nextGamePos.x !== game.x || nextGamePos.y !== game.y) {
         game.position.set(nextGamePos.x, nextGamePos.y);
      }
   };

   return {
      centerPos,
      zeroPos,
      lookAt,
      update,
      zoomAdd,
      moveFromTo,
      zoomTo,
      userInput: {
         enable: () => {
            userInputEnabled = true;
         },
         disable: () => {
            userInputEnabled = false;
         },
         isEnabled: () => userInputEnabled,
      },
      drag: {
         enable: dragFeature.enableDrag,
         remove: dragFeature.removeDrag,
      },
      viewport: () => getViewport(),
      scaler: scaler,
   };
};

const handleIncrementZoom = (props: {
   app: PIXI.Application;
   game: PIXI.Container;
   scaler: GameScaler;
   tick: PIXI.Ticker;
   zoomDelta: number;
}) => {
   const { app, game, scaler, tick, zoomDelta } = props;
   const prevScale = scaler.getScaleData();
   const zoomSpeed = zoomDelta * tick.deltaTime * 0.025;

   scaler.zoom(zoomSpeed);

   const newScale = scaler.getScaleData();
   game.scale.set(newScale.gameScale);

   const screenCenter = {
      x: game.width / 2,
      y: game.height / 2,
   };

   const worldCenterBefore = {
      x:
         (screenCenter.x - game.position.x * prevScale.gameScale) /
         prevScale.gameScale,
      y:
         (screenCenter.y - game.position.y * prevScale.gameScale) /
         prevScale.gameScale,
   };

   let newGameX = -worldCenterBefore.x * newScale.gameScale + screenCenter.x;
   let newGameY = -worldCenterBefore.y * newScale.gameScale + screenCenter.y;

   const scaledViewport = {
      width: game.width / newScale.gameScale,
      height: game.height / newScale.gameScale,
   };

   const minX = -(game.width - scaledViewport.width);
   const maxX = 0;
   const minY = -(game.height - scaledViewport.height);
   const maxY = 0;

   newGameX = Math.min(
      Math.max(newGameX, minX * newScale.gameScale),
      maxX * newScale.gameScale,
   );
   newGameY = Math.min(
      Math.max(newGameY, minY * newScale.gameScale),
      maxY * newScale.gameScale,
   );

   const pos = {
      x: newGameX / newScale.gameScale,
      y: newGameY / newScale.gameScale,
   };
   return pos;
};

interface MoveData {
   currentPos: () => Position;
   inPos: () => boolean;
   update: (tick: PIXI.Ticker) => void;
}

const createMoveToData = (props: {
   startPos: Position;
   endPos: Position;
   speed: number;
}): MoveData => {
   const { startPos: currentPos, endPos, speed } = props;

   return {
      currentPos: () => currentPos,
      inPos: () => currentPos.x === endPos.x && currentPos.y === endPos.y,
      update: (tick: PIXI.Ticker) => {
         const dx = endPos.x - currentPos.x;
         const dy = endPos.y - currentPos.y;
         const dist = Math.sqrt(dx * dx + dy * dy);

         if (dist === 0) return;

         const step = speed * tick.deltaMS * 0.1;
         if (dist <= step) {
            currentPos.x = endPos.x;
            currentPos.y = endPos.y;
         } else {
            const ratio = step / dist;
            currentPos.x += dx * ratio;
            currentPos.y += dy * ratio;
         }
      },
   };
};
