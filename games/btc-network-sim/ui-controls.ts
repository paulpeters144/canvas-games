import * as PIXI from "pixi.js";
import type { GameAssets } from "./assets";
import { gameScaler } from "./camera";
import { ZLayer } from "./game.enums";

export const createZoomControls = ({
   app,
   assets,
}: { app: PIXI.Application; assets: GameAssets }) => {
   const container = new PIXI.Container();
   container.zIndex = ZLayer.mid;

   const fontStyle = new PIXI.TextStyle({ fontFamily: "GraphPix", fontSize: 12, fill: "#FFFFFF" });

   const createBtn = (char: string) => {
      const container = new PIXI.Container();

      const button = assets.createSprite("circle-btn");
      button.scale.set(2.5, 2.5);

      const text = new PIXI.Text({ style: fontStyle, text: char });
      text.resolution = 2;
      text.zIndex = ZLayer.top;
      text.x = button.x + button.width * 0.5 - text.width * 0.5 + 1;
      text.y = button.y + button.height * 0.5 - text.height * 0.5;

      container.addChild(button, text);

      return container;
   };

   const makeInteractive = (...containers: PIXI.Container[]) => {
      containers.map((c) => {
         c.alpha = 0.75;
         c.interactive = true;
         c.on("pointerenter", () => {
            c.alpha = 1;
         });
         c.on("pointerleave", () => {
            c.alpha = 0.75;
         });
         c.on("pointerdown", () => {
            c.alpha = 0.75;
         });
         c.on("pointerup", () => {
            c.alpha = 1;
         });
      });
   };

   const plusBtn = createBtn("+");
   plusBtn.position.set(0, 0);

   const minusBtn = createBtn("-");
   minusBtn.position.set(0, plusBtn.y + plusBtn.height + 1);

   const resetBtn = createBtn("↺");
   resetBtn.position.set(0, minusBtn.y + minusBtn.height + 1);

   makeInteractive(plusBtn, minusBtn, resetBtn);
   container.addChild(plusBtn, minusBtn, resetBtn);

   container.position.set(gameScaler.virtWidth - container.width - 5, gameScaler.virtHeight * 0.75);
   app.stage.addChild(container);
};

export const createContextMenu = ({
   app,
   assets,
}: { app: PIXI.Application; assets: GameAssets }) => {
   app.canvas.addEventListener("contextmenu", (e) => e.preventDefault());

   const contextMenu = new PIXI.Container();
   contextMenu.visible = false;
   contextMenu.zIndex = ZLayer.top;

   const button = assets.createSprite("ctx-option");
   button.scale.set(2.5, 2.5);
   button.alpha = 0.75;
   button.interactive = true;
   button.on("pointerenter", () => {
      button.alpha = 1;
   });
   button.on("pointerleave", () => {
      button.alpha = 0.75;
   });

   const style = new PIXI.TextStyle({ fontFamily: "GraphPix", fill: "#ffffff", fontSize: 9 });
   const option1 = new PIXI.Text({ text: "Create Node", style: style });
   option1.resolution = 2;
   option1.position.set(13, 10);

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
