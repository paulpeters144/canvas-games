import type * as PIXI from "pixi.js";
import { gameScaler } from "./camera";
import type { Position } from "./types";

interface DragSystemProps {
   app: PIXI.Application;
   game: PIXI.ContainerChild;
   bounds: { width: number; height: number };
}

export interface DragSystem {
   getFocusPoint: () => Position;
   setFocusPoint: (pos?: Position) => void;
}

export const createDragSystem = (props: DragSystemProps): DragSystem => {
   const { game, app, bounds } = props;
   let focusPoint: Position = {
      x: app.screen.width * 0.5,
      y: app.screen.height * 0.5,
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
      console.log("focusPoint", focusPoint);
      console.log("screen.stats", { x: app.screen.width, y: app.screen.height });
      console.log("game.stats", {
         x: game.x,
         y: game.y,
         width: game.width,
         height: game.height,
      });
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

      const minX = bounds.width * gameScaler.getGameScale();
      focusPoint.x = Math.min(focusPoint.x, minX - app.screen.width * 0.5);
      focusPoint.x = Math.max(focusPoint.x, app.screen.width * 0.5);

      const minY = bounds.height * gameScaler.getGameScale();
      focusPoint.y = Math.min(focusPoint.y, minY - app.screen.height * 0.5);
      focusPoint.y = Math.max(focusPoint.y, app.screen.height * 0.5);
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
   const setFocusPoint = (pos?: Position) => {
      if (!pos) return;
      focusPoint = pos;
   };

   return { getFocusPoint, setFocusPoint };
};
