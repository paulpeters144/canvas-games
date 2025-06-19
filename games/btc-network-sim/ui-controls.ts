import * as PIXI from "pixi.js";
import type { GameAssets } from "./assets";
import { gameScaler } from "./camera";
import { ZLayer } from "./game.enums";
import { bus } from "./main";

interface ButtonProps {
   char: string;
}

interface ZoomControlProps {
   app: PIXI.Application;
   assets: GameAssets;
}

export interface ZoomControl {
   update: (tick: PIXI.Ticker) => void;
   updatePos: (app: PIXI.Application) => void;
}

export const createZoomControls = ({ app, assets }: ZoomControlProps): ZoomControl => {
   const container = new PIXI.Container();
   container.zIndex = ZLayer.mid;

   const fontStyle = new PIXI.TextStyle({ fontFamily: "GraphPix", fontSize: 18, fill: "#FFFFFF" });

   const updatePos = (app: PIXI.Application) => {
      container.scale.set(gameScaler.getBaseScale());
      container.position.set(app.screen.width - container.width - 5, app.screen.height * 0.75);
   };

   const createBtn = (props: ButtonProps) => {
      const { char } = props;
      const container = new PIXI.Container();

      const button = assets.createSprite("circle-btn");
      button.scale.set(3);

      const text = new PIXI.Text({ style: fontStyle, text: char });
      text.resolution = 2;
      text.zIndex = ZLayer.top;
      text.x = button.x + button.width * 0.5 - text.width * 0.5 + 1;
      text.y = button.y + button.height * 0.5 - text.height * 0.5;

      container.addChild(button, text);

      container.alpha = 0.75;
      container.interactive = true;
      let active = false;
      container.on("pointerenter", () => {
         container.alpha = 1;
      });
      container.on("pointerleave", () => {
         container.alpha = 0.75;
         active = false;
      });
      container.on("pointerdown", () => {
         container.alpha = 0.5;
         active = true;
      });
      container.on("pointerup", () => {
         container.alpha = 1;
         active = false;
      });

      return { ctr: container, isActive: () => active };
   };

   const plusBtn = createBtn({ char: "+" });
   plusBtn.ctr.position.set(0, 0);

   const minusBtn = createBtn({ char: "-" });
   minusBtn.ctr.position.set(0, plusBtn.ctr.y + plusBtn.ctr.height + 1);

   const resetBtn = createBtn({ char: "↺" });
   resetBtn.ctr.position.set(0, minusBtn.ctr.y + minusBtn.ctr.height + 1);

   container.addChild(plusBtn.ctr, minusBtn.ctr, resetBtn.ctr);
   updatePos(app);
   app.stage.addChild(container);

   return {
      update: (_: PIXI.Ticker) => {
         if (plusBtn.isActive()) bus.fire("zoom", "in");
         if (minusBtn.isActive()) bus.fire("zoom", "out");
         if (resetBtn.isActive()) bus.fire("zoom", "reset");
      },
      updatePos,
   };
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
