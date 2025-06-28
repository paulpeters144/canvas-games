import * as PIXI from "pixi.js";
import type { GameAssets } from "./assets";
import type { GameVars } from "./game.vars";
import { bus } from "./main";
import type { Position } from "./types";

const createBackgroundGraphic = () => {
   const originalWidth = 180;
   const mainGraphic = new PIXI.Graphics();
   const height = 275;
   mainGraphic.rect(0, 0, originalWidth, height).fill({ color: "#dca27f" });

   const borderWidth = 5;
   const borderColor = "#cd7a47";

   const topLine = new PIXI.Graphics();
   topLine.moveTo(0, -borderWidth * 0.5);
   topLine.lineTo(originalWidth, -borderWidth * 0.5);
   topLine.stroke({ width: borderWidth, color: borderColor });

   const leftLine = new PIXI.Graphics();
   leftLine.moveTo(-borderWidth * 0.5, 0);
   leftLine.lineTo(-borderWidth * 0.5, height);
   leftLine.stroke({ width: borderWidth, color: borderColor });

   const rightLine = new PIXI.Graphics();
   rightLine.moveTo(originalWidth + borderWidth * 0.5, 0);
   rightLine.lineTo(originalWidth + borderWidth * 0.5, height);
   rightLine.stroke({ width: borderWidth, color: borderColor });

   const bottomLine = new PIXI.Graphics();
   bottomLine.moveTo(0, height + borderWidth * 0.5);
   bottomLine.lineTo(originalWidth, height + borderWidth * 0.5);
   bottomLine.stroke({ width: borderWidth, color: borderColor });

   const ctr = new PIXI.Container();
   ctr.addChild(mainGraphic, topLine, rightLine, bottomLine, leftLine);

   let isOpen = true;

   const setIsOpen = (value: boolean) => {
      if (isOpen === value) return;
      isOpen = value;

      const newWidth = value ? originalWidth : 15;

      mainGraphic.clear();
      mainGraphic.rect(0, 0, newWidth, height).fill({ color: "#dca27f" });

      topLine.clear();
      topLine.moveTo(0, -borderWidth * 0.5);
      topLine.lineTo(newWidth, -borderWidth * 0.5);
      topLine.stroke({ width: borderWidth, color: borderColor });

      rightLine.clear();
      rightLine.moveTo(newWidth + borderWidth * 0.5, 0);
      rightLine.lineTo(newWidth + borderWidth * 0.5, height);
      rightLine.stroke({ width: borderWidth, color: borderColor });

      bottomLine.clear();
      bottomLine.moveTo(0, height + borderWidth * 0.5);
      bottomLine.lineTo(newWidth, height + borderWidth * 0.5);
      bottomLine.stroke({ width: borderWidth, color: borderColor });
   };

   return { ctr, setIsOpen };
};

const createChevron = () => {
   let facingRight = true;
   const ctr = new PIXI.Container();
   const pos = { x: 5, y: 5 };
   const boxSize = 4;

   const box1 = new PIXI.Graphics()
      .rect(pos.x, pos.y, boxSize, boxSize)
      .fill("#FFFFFF");

   const box2 = new PIXI.Graphics()
      .rect(pos.x + boxSize, pos.y + boxSize, boxSize, boxSize)
      .fill("#FFFFFF");

   const box3 = new PIXI.Graphics()
      .rect(pos.x + boxSize * 2, pos.y + boxSize * 2, boxSize, boxSize)
      .fill("#FFFFFF");

   const box4 = new PIXI.Graphics()
      .rect(pos.x + boxSize, pos.y + boxSize * 3, boxSize, boxSize)
      .fill("#FFFFFF");

   const box5 = new PIXI.Graphics()
      .rect(pos.x, pos.y + boxSize * 4, boxSize, boxSize)
      .fill("#FFFFFF");

   const hitArea = new PIXI.Graphics()
      .rect(pos.x - 2, pos.y - 2, boxSize * 3 + 4, boxSize * 5 + 4)
      .fill({ color: "#FFFFFF", alpha: 0.0 });

   ctr.addChild(box1, box2, box3, box4, box5, hitArea);

   const faceLeft = () => {
      if (!facingRight) return;
      box1.x += boxSize * 2;
      box3.x -= boxSize * 2;
      box5.x += boxSize * 2;
      facingRight = false;
   };

   const faceRight = () => {
      if (facingRight) return;
      box1.x -= boxSize * 2;
      box3.x += boxSize * 2;
      box5.x -= boxSize * 2;
      facingRight = true;
   };

   return { ctr, hitArea, faceRight, faceLeft };
};

interface btcNodeCtrlProps {
   app: PIXI.Application;
   pos: Position;
   label: string;
   values: { min: number; max: number };
   disable?: boolean;
   onChange?: (value: number) => void;
}

const createBitcoinNodeControls = (props: btcNodeCtrlProps) => {
   const { app, onChange, values, pos, label } = props;
   const ctr = new PIXI.Container();

   const textStyle = new PIXI.TextStyle({
      fontFamily: "GraphPix",
      fontSize: 10,
      fill: "#FFFFFF",
   });
   const text = new PIXI.Text({ style: textStyle, text: `${label}: 0` });
   text.resolution = 2;

   const bgSliderCtr = new PIXI.Container();

   const bgSliderPos = { x: 0, y: text.height + 15 };
   const bgSliderMain = new PIXI.Graphics()
      .rect(bgSliderPos.x, bgSliderPos.y, 150, 10)
      .fill({ color: "#aa4f11" });

   const tipSize = 4;

   const leftTipPos = { x: -tipSize, y: bgSliderPos.y + tipSize * 0.75 };
   const bgSliderLeftTip = new PIXI.Graphics()
      .rect(leftTipPos.x, leftTipPos.y, tipSize, tipSize)
      .fill({ color: "#aa4f11" });

   const rightTipPos = { x: bgSliderMain.width, y: bgSliderPos.y + tipSize * 0.75 };
   const bgSliderRightTip = new PIXI.Graphics()
      .rect(rightTipPos.x, rightTipPos.y, 4, 4)
      .fill({ color: "#aa4f11" });

   const sliderCtr = new PIXI.Container();
   const sliderMain = new PIXI.Graphics()
      .rect(5, 25, 10, 10)
      .fill({ color: "#d8bbaa" });
   const sliderBT = new PIXI.Graphics()
      .rect(5, 22, 10, 3)
      .fill({ color: "#FFFFFF" });
   const sliderBR = new PIXI.Graphics()
      .rect(15, 25, 3, 10)
      .fill({ color: "#FFFFFF" });
   const sliderBB = new PIXI.Graphics()
      .rect(5, 35, 10, 3)
      .fill({ color: "#FFFFFF" });
   const sliderBL = new PIXI.Graphics()
      .rect(2, 25, 3, 10)
      .fill({ color: "#FFFFFF" });
   sliderCtr.addChild(sliderMain, sliderBT, sliderBR, sliderBB, sliderBL);
   sliderCtr.y -= 1;

   bgSliderCtr.addChild(bgSliderMain, bgSliderLeftTip, bgSliderRightTip, sliderCtr);

   let currentValue = 0;
   let isDragging = false;

   sliderCtr.interactive = true;
   sliderCtr.cursor = "grab";

   const onDragMove = (e: PIXI.FederatedPointerEvent) => {
      if (!isDragging) return;

      const parent = sliderCtr.parent;
      const local = parent.toLocal(e.global);

      const trackX = bgSliderMain.x;
      const trackWidth = bgSliderMain.width;
      const sliderWidth = sliderMain.width;

      let newX = local.x - 10;

      const minX = -2;
      const maxX = trackX + trackWidth - sliderWidth - 8;
      newX = Math.max(minX, Math.min(newX, maxX));

      const maxRawVal = maxX - minX;
      const newRawVal = newX - minX;
      const div = maxRawVal / values.max;
      const newValue = Math.round(newRawVal / div);
      if (onChange && currentValue !== newValue) {
         currentValue = newValue;
         onChange(newValue);
         text.text = `${label}: ${newValue}`;
         text.x = bgSliderMain.width * 0.5 - text.width * 0.5;
      }
      sliderCtr.x = newX;
   };

   const onDragEnd = () => {
      isDragging = false;
      sliderCtr.cursor = "grab";
      app.stage.off("pointermove", onDragMove);
      app.stage.off("pointerup", onDragEnd);
      app.stage.off("pointerupoutside", onDragEnd);
   };

   sliderCtr.on("pointerdown", () => {
      isDragging = true;
      sliderCtr.cursor = "grabbing";

      app.stage.on("pointermove", onDragMove);
      app.stage.on("pointerup", onDragEnd);
      app.stage.on("pointerupoutside", onDragEnd);
   });

   ctr.addChild(text, bgSliderCtr);
   ctr.x = pos.x;
   ctr.y = pos.y;
   text.x = bgSliderMain.width * 0.5 - text.width * 0.5;

   if (props.disable) {
      ctr.alpha = 0.5;
      sliderCtr.interactive = false;
   }

   return { ctr };
};

interface zoomCtrlsProps {
   assets: GameAssets;
   pos: Position;
   label: string;
}
const createZoomCtrls = (props: zoomCtrlsProps) => {
   const { assets, pos, label } = props;

   const ctr = new PIXI.Container();

   const zoomInBtn = createSquareBtn({
      pos: { x: 0, y: 0 },
      assets,
      icon: "+",
   });

   const zoomOutBtn = createSquareBtn({
      pos: { x: 40, y: 0 },
      assets,
      icon: "-",
   });

   const zoomResetBtn = createSquareBtn({
      pos: { x: 80, y: 0 },
      assets,
      icon: assets.createSprite("reset"),
   });

   const textStyle = new PIXI.TextStyle({
      fontFamily: "GraphPix",
      fontSize: 10,
      fill: "#FFFFFF",
   });
   const text = new PIXI.Text({ style: textStyle, text: label });
   text.resolution = 2;
   text.x += 5;
   text.y -= 20;

   ctr.addChild(zoomInBtn.ctr, zoomOutBtn.ctr, zoomResetBtn.ctr, text);

   ctr.position.set(pos.x, pos.y);

   return {
      ctr,
      isZoomInPressed: zoomInBtn.isPressed,
      isZoomOutPressed: zoomOutBtn.isPressed,
      isZoomResetPressed: zoomResetBtn.isPressed,
   };
};

interface squareBtnProps {
   pos: Position;
   assets: GameAssets;
   icon?: string | PIXI.Sprite;
}
const createSquareBtn = (props: squareBtnProps) => {
   const { pos, assets, icon } = props;

   const upPos = { x: pos.x, y: pos.y };
   const dnPos = { x: pos.x, y: pos.y + 4 };

   const ctr = new PIXI.Container();
   ctr.position.set(upPos.x, upPos.y);

   let pressed = false;

   const btnUpTexture = assets.getTexture("zoom-btn-up");
   const btnDnTexture = assets.getTexture("zoom-btn-dn");

   const sprite = new PIXI.Sprite(btnUpTexture);
   sprite.scale.set(2.5);
   ctr.addChild(sprite);

   ctr.interactive = true;
   ctr.on("pointerdown", () => {
      pressed = true;
      sprite.texture = btnDnTexture;
      ctr.position.set(dnPos.x, dnPos.y);
   });
   ctr.on("pointerup", () => {
      pressed = false;
      sprite.texture = btnUpTexture;
      ctr.position.set(upPos.x, upPos.y);
   });
   ctr.on("pointerout", () => {
      pressed = false;
      sprite.texture = btnUpTexture;
      ctr.position.set(upPos.x, upPos.y);
   });

   if (typeof icon === "string") {
      const textStyle = new PIXI.TextStyle({
         fontFamily: "GraphPix",
         fontSize: 18,
         fill: "#FFFFFF",
      });
      const text = new PIXI.Text({ style: textStyle, text: icon });
      text.resolution = 2;
      text.x = sprite.width * 0.5 - text.width * 0.43;
      text.y = sprite.height * 0.5 - text.height * 0.6;
      ctr.addChild(text);
   }

   if (typeof icon === "object") {
      icon.scale.set(2.5);
      icon.x = icon.width * 0.5;
      icon.y = icon.height * 0.45;
      ctr.addChild(icon);
   }

   return {
      ctr,
      isPressed: () => pressed,
   };
};

export interface LeftPaneCtrl {
   update: (tick: PIXI.Ticker) => void;
}

export const createLeftPaneControls = (gameVars: GameVars): LeftPaneCtrl => {
   const { app, scaler, assets } = gameVars;
   const container = new PIXI.Container();
   const bg = createBackgroundGraphic();
   const chevron = createChevron();
   let isOpen = true;

   const handleResize = (app: PIXI.Application) => {
      container.scale.set(scaler.getBaseScale());
      container.position.set(
         app.screen.width - container.width,
         90 * scaler.getBaseScale(),
      );
   };

   const resize = () => setTimeout(() => handleResize(app), 10);
   window.addEventListener("windowResize", resize);

   const btcNodeCtrl = createBitcoinNodeControls({
      app: app,
      pos: { x: 15, y: 48 },
      label: "Bitcoin Nodes",
      values: { min: 0, max: 127 },
      onChange: (value: number) => {
         bus.fire("node", { count: value });
      },
   });

   const badNodeCtrl = createBitcoinNodeControls({
      app: app,
      pos: { x: 15, y: 113 },
      label: "Bad Actor Nodes",
      values: { min: 0, max: 100 },
      disable: true,
      onChange: (value: number) => {
         // bus.fire("node", { count: value });
      },
   });

   const zoomCtrls = createZoomCtrls({
      assets: assets,
      pos: { x: 32, y: 225 },
      label: "Zoom Controls",
   });

   const setOpen = (value: boolean) => {
      bg.setIsOpen(value);

      if (value === false) {
         chevron.faceLeft();
         chevron.ctr.x -= 5;
      } else {
         chevron.faceRight();
         chevron.ctr.x += 5;
      }

      btcNodeCtrl.ctr.visible = value;
      badNodeCtrl.ctr.visible = value;
      isOpen = value;
      zoomCtrls.ctr.visible = value;

      handleResize(app);
   };

   // TODO: remove
   setOpen(false);

   chevron.hitArea.interactive = true;
   chevron.hitArea.cursor = "pointer";
   chevron.hitArea.on("pointerdown", () => setOpen(!isOpen));

   container.addChild(
      bg.ctr,
      chevron.ctr,
      btcNodeCtrl.ctr,
      badNodeCtrl.ctr,
      zoomCtrls.ctr,
   );

   app.stage.addChild(container);
   handleResize(app);

   return {
      update: (_: PIXI.Ticker) => {
         if (zoomCtrls.isZoomInPressed()) bus.fire("zoom", "in");
         if (zoomCtrls.isZoomOutPressed()) bus.fire("zoom", "out");
         if (zoomCtrls.isZoomResetPressed()) bus.fire("zoom", "reset");
      },
   };
};
