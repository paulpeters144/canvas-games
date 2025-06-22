import * as PIXI from "pixi.js";
import type { GameAssets } from "./assets";
import { ZLayer } from "./game.enums";

const createNodeOption = (assets: GameAssets) => {
   const button = assets.createSprite("ctx-option");
   button.scale.set(3.25, 3.25);
   button.alpha = 0.75;
   button.interactive = true;
   let hovering = false;
   button.on("pointerenter", () => {
      button.alpha = 1;
      hovering = true;
   });
   button.on("pointerleave", () => {
      button.alpha = 0.75;
      hovering = false;
   });

   const style = new PIXI.TextStyle({ fontFamily: "GraphPix", fill: "#ffffff", fontSize: 12 });
   const text = new PIXI.Text({ text: "Create Node", style: style });
   text.resolution = 2;
   text.position.set(13, 12);

   const ctr = new PIXI.Container();
   ctr.addChild(button, text);

   return {
      ctr: ctr,
      isHovering: () => hovering,
   };
};

export const createContextMenu = ({
   app,
   assets,
}: { app: PIXI.Application; assets: GameAssets }) => {
   app.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
   app.stage.interactive = true;

   const contextMenu = new PIXI.Container();
   contextMenu.visible = false;
   contextMenu.zIndex = ZLayer.top;

   const createNodeBtn = createNodeOption(assets);

   app.stage.on("pointerdown", (e) => {
      if (e.button === 2) {
         const local = app.stage.toLocal(e.global);
         const menuHeight = contextMenu.height;
         contextMenu.position.set(local.x, local.y - menuHeight);
         contextMenu.visible = true;
      } else {
         contextMenu.visible = false;
      }
      if (e.button === 0 && createNodeBtn.isHovering()) {
         // may need to send an event
         console.log("create node");
      }
   });

   contextMenu.addChild(createNodeBtn.ctr);
   app.stage.addChild(contextMenu);
};
