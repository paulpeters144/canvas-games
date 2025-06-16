import type * as PIXI from "pixi.js";
import { gameScaler } from "./camera";
import type { Position } from "./types";

export const createDragSystem = ({
   game,
   size,
}: { game: PIXI.ContainerChild; size: { width: number; height: number } }) => {
   let focusPoint: Position = {
      x: gameScaler.virtWidth * 0.5,
      y: gameScaler.virtHeight * 0.5,
   };

   let isDragging = false;
   let dragStartPointer: PIXI.PointData | null = null;
   let dragStartFocus: Position | null = null;

   game.eventMode = "static";
   game.cursor = "grab";

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

      const scale = gameScaler.getBaseScale() ?? 1;

      focusPoint = {
         x: dragStartFocus.x - dx / scale,
         y: dragStartFocus.y - dy / scale,
      };

      focusPoint.x = Math.min(focusPoint.x, size.width - gameScaler.virtWidth * 0.5);
      focusPoint.x = Math.max(focusPoint.x, gameScaler.virtWidth * 0.5);

      focusPoint.y = Math.min(focusPoint.y, size.height - gameScaler.virtHeight * 0.5);
      focusPoint.y = Math.max(focusPoint.y, gameScaler.virtHeight * 0.5);
   });

   const endDrag = () => {
      isDragging = false;
      dragStartPointer = null;
      dragStartFocus = null;
      game.cursor = "grab";
   };

   game.on("pointerup", endDrag);
   game.on("pointerupoutside", endDrag);

   const getFocusPoint = () => focusPoint;

   return { getFocusPoint };
};
