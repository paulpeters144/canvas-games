import * as PIXI from "pixi.js";
import type { GameAssets } from "./assets";
import { ZLayer } from "./game.enums";

export const createContextMenu = ({
   app,
   assets,
}: { app: PIXI.Application; assets: GameAssets }) => {
   app.canvas.addEventListener("contextmenu", (e) => e.preventDefault());

   const contextMenu = new PIXI.Container();
   contextMenu.visible = false;
   contextMenu.zIndex = ZLayer.top;

   const button = assets.createSprite("ctx-option");
   button.scale.set(4.25, 4.25);
   button.alpha = 0.75;
   button.interactive = true;
   button.on("pointerenter", () => {
      button.alpha = 1;
   });
   button.on("pointerleave", () => {
      button.alpha = 0.75;
   });

   const style = new PIXI.TextStyle({ fontFamily: "GraphPix", fill: "#ffffff", fontSize: 16 });
   const option1 = new PIXI.Text({ text: "Create Node", style: style });
   option1.resolution = 2;
   option1.position.set(18, 16);

   app.stage.on("pointerdown", (e) => {
      if (e.button === 2) {
         const local = app.stage.toLocal(e.global);
         const menuHeight = contextMenu.height;
         contextMenu.position.set(local.x, local.y - menuHeight);
         contextMenu.visible = true;
      } else {
         contextMenu.visible = false;
      }
   });

   contextMenu.addChild(button);
   contextMenu.addChild(option1);
   app.stage.addChild(contextMenu);
   app.stage.interactive = true;
};
