import type * as PIXI from "pixi.js";
import type { GameVars } from "./game.vars";
import type { Position } from "./types";

interface DragSystemProps {
   gameVars: GameVars;
   bounds: { width: number; height: number };
   clamp: boolean;
}

export interface DragSystem {
   getFocusPoint: () => Position;
   setFocusPoint: (pos?: Position) => void;
   isDragging: () => boolean;
}

export const createDragSystem = (props: DragSystemProps): DragSystem => {
   const { gameVars, bounds, clamp } = props;
   const { app, game, scaler } = gameVars;
   let focusPoint: Position = {
      x: app.screen.width * 0.5,
      y: app.screen.height * 0.5,
   };

   let isDragging = false;
   let dragStartPointer: PIXI.PointData | null = null;
   let dragStartFocus: Position | null = null;

   game.eventMode = "static";
   // game.cursor = "grab";

   game.on("pointerdown", (event: PIXI.FederatedPointerEvent) => {
      isDragging = true;
      dragStartPointer = event.global.clone();
      dragStartFocus = { ...focusPoint };
      game.cursor = "grabbing";
   });

   game.on("pointermove", (event: PIXI.FederatedPointerEvent) => {
      if (!isDragging || !dragStartPointer || !dragStartFocus) return;

      const currentPointer = event.global;
      const dx = currentPointer.x - dragStartPointer.x;
      const dy = currentPointer.y - dragStartPointer.y;

      focusPoint = {
         x: dragStartFocus.x - dx,
         y: dragStartFocus.y - dy,
      };

      if (!clamp) return;

      const minX = bounds.width * scaler.getGameScale();
      focusPoint.x = Math.min(focusPoint.x, minX - app.screen.width * 0.5);
      focusPoint.x = Math.max(focusPoint.x, app.screen.width * 0.5);

      const minY = bounds.height * scaler.getGameScale();
      focusPoint.y = Math.min(focusPoint.y, minY - app.screen.height * 0.5);
      focusPoint.y = Math.max(focusPoint.y, app.screen.height * 0.5);
   });

   const endDrag = () => {
      isDragging = false;
      dragStartPointer = null;
      dragStartFocus = null;
      game.cursor = "default";
      // game.cursor = "grab";
   };

   game.on("pointerup", endDrag);
   game.on("pointerupoutside", endDrag);

   const getFocusPoint = () => {
      return focusPoint;
   };

   const setFocusPoint = (pos?: Position) => {
      if (!pos) return;
      focusPoint = pos;
   };

   return { getFocusPoint, setFocusPoint, isDragging: () => isDragging };
};
