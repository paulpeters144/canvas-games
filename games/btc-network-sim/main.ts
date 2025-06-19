import { eBus } from "games/util/event-bus";
import * as PIXI from "pixi.js";
import { createGameAssets } from "./assets";
import { type Camera, createCamera } from "./camera";
import type { EventMap } from "./event-map";
import { type GameVars, createGameVars } from "./game.vars";
import { createBackground } from "./model.background";
import { type DragSystem, createDragSystem } from "./system.pointer-drag";
import { type ZoomControl, createContextMenu, createZoomControls } from "./ui-controls";

export const bus = eBus<EventMap>();

export async function createBtcNetworkSim(app: PIXI.Application) {
   const game: PIXI.Container = new PIXI.Container();
   const gameVars = createGameVars(app, game);
   const sceneEngine = newSceneEngine(gameVars);
   sceneEngine.next(() => gameScene(gameVars));
}

export interface IScene {
   load: (game: PIXI.ContainerChild) => Promise<void>;
   update: (tick: PIXI.Ticker) => void;
}

export const newSceneEngine = (gameVars: GameVars) => {
   let gameTicker: PIXI.Ticker | undefined;
   let currentScene: IScene | undefined;
   const { game, app, resizer } = gameVars;

   app.stage.addChild(game);

   setTimeout(() => resizer.resize(app, game), 0);

   return {
      next: async (nextScene: () => IScene) => {
         game.removeChildren();
         game.removeAllListeners();

         if (gameTicker) gameTicker.destroy();

         currentScene = nextScene();
         const update = (tick: PIXI.Ticker) => {
            currentScene?.update(tick);
         };
         gameTicker = new PIXI.Ticker().add(update);

         await currentScene.load(game);

         gameTicker.start();
      },
   };
};

export const gameScene = (gameVars: GameVars): IScene => {
   const { game, app, resizer } = gameVars;

   let camera: Camera | undefined;
   let dragSystem: DragSystem | undefined;
   const assets = createGameAssets();
   let zoomCtrl: ZoomControl | undefined;

   const { graphic, size, texts } = createBackground({ rows: 25, cols: 50 });

   window.addEventListener("resize", () => window.dispatchEvent(new CustomEvent("windowResize")));

   window.addEventListener("windowResize", () =>
      setTimeout(() => {
         resizer.resize(app, game);
         zoomCtrl?.updatePos(app);
      }, 0),
   );

   bus.on("zoom", (e) => {
      if (!dragSystem || !camera) return;

      if (e === "in") camera.zoom(0.00175);
      if (e === "out") camera.zoom(-0.00175);
      if (e === "reset") camera.resetZoom();

      const prevDimen = game.getSize();
      resizer.resize(app, game);
      const nextDimen = game.getSize();
      const zoomedIn = nextDimen.height > prevDimen.height;

      const largerWidth = Math.max(prevDimen.width, nextDimen.width);
      const smallerWidth = Math.min(prevDimen.width, nextDimen.width);
      const diffWidth = smallerWidth / largerWidth;

      const largerHeight = Math.max(prevDimen.height, nextDimen.height);
      const smallerHeight = Math.min(prevDimen.height, nextDimen.height);
      const diffHeight = smallerHeight / largerHeight;

      const dragPos = dragSystem.getFocusPoint();
      const nextPos = {
         x: zoomedIn ? dragPos.x / diffWidth : dragPos.x * diffWidth,
         y: zoomedIn ? dragPos.y / diffHeight : dragPos.y * diffHeight,
      };
      dragSystem.setFocusPoint(nextPos);

      camera?.lookAt(dragSystem?.getFocusPoint());
   });

   return {
      load: async () => {
         await assets.load();
         game.addChild(graphic, ...texts);
         camera = createCamera({ gameVars, bounds: size, clampCamera: true });
         dragSystem = createDragSystem({ gameVars, bounds: size });
         zoomCtrl = createZoomControls({ gameVars, assets });
         createContextMenu({ app, assets });
      },

      update: (tick: PIXI.Ticker) => {
         zoomCtrl?.update(tick);
         if (dragSystem?.isDragging()) {
            camera?.lookAt(dragSystem?.getFocusPoint());
         }
      },
   };
};
