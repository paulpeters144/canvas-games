import { type IAnimateOptions, Viewport } from "pixi-viewport";
import type * as PIXI from "pixi.js";
import type { Position } from "./types";

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

export const createCamera = (
   app: PIXI.Application,
   bgCtr: PIXI.Container,
): Camera => {
   app.renderer.resize(GAME_WIDTH, GAME_HEIGHT);

   app.canvas.style.border = "2px solid white";
   app.canvas.style.width = "100%";
   app.canvas.style.height = "100%";

   const viewport = new Viewport({
      screenWidth: GAME_WIDTH,
      screenHeight: GAME_HEIGHT,
      passiveWheel: false,
      events: app.renderer.events,
   });

   const resizeHandler = () => {
      const container = app.canvas.parentElement;
      if (container) {
         const containerWidth = container.clientWidth;
         const containerHeight = container.clientHeight;

         const scaleX = containerWidth / GAME_WIDTH;
         const scaleY = containerHeight / GAME_HEIGHT;
         const scale = Math.max(scaleX, scaleY);
         app.stage.scale.set(scale);
      }
   };

   window.onresize = () => {
      setTimeout(resizeHandler, 50);
   };

   app.stage.addChild(viewport);
   viewport.addChild(bgCtr);

   viewport.drag().pinch().wheel();

   viewport.decelerate({
      friction: 0.98,
      minSpeed: 10,
      bounce: 0,
   });

   viewport.clamp({
      //   left: false, // whether to clamp to the left and at what value
      //   right: false, // whether to clamp to the right and at what value
      //   top: false, // whether to clamp to the top and at what value
      //   bottom: false, // whether to clamp to the bottom and at what value
      direction: "all", // (all, x, or y) using clamps of [0, viewport.worldWidth / viewport.worldHeight]; replaces left / right / top / bottom if set
      //   underflow: "center", // where to place world if too small for screen (e.g., top - right, center, none, bottomleft)
   });

   viewport.clampZoom({
      minScale: 0.9,
      maxScale: 3.85,
   });

   viewport.on("drag-start", () => {
      viewport.cursor = "grabbing";
   });
   viewport.on("drag-end", () => {
      viewport.cursor = "default";
   });

   return {
      worldWidth: () => viewport.worldWidth,
      worldHeight: () => viewport.worldHeight,
      animate: (options: IAnimateOptions) => viewport.animate(options),
      dragOff: () => viewport.plugins.pause("drag"),
      dragOn: () => viewport.plugins.resume("drag"),
      centerPos: () => ({ x: viewport.center.x, y: viewport.center.y }),
      zoomPercent: () => viewport.scale.x,
   };
};

export interface Camera {
   worldWidth: () => number;
   worldHeight: () => number;
   animate: (options: IAnimateOptions) => Viewport;
   dragOff: () => void;
   dragOn: () => void;
   centerPos: () => Position;
   zoomPercent: () => number;
}
