import * as PIXI from "pixi.js";
import type { Position } from "./types";

export const createBtnGraphic = (props: {
   pixelSize: number;
   width: number;
   height: number;
   pos: Position;
   text: { value: string; size: number };
   alpha: {
      base: number;
      hover: number;
      down: number;
   };
}) => {
   const color = {
      white: "#FFFFFF",
      outBorder: "#9D5322",
      inBorder: "#E88744",
      mainBg: "#D67130",
   };
   const { alpha, pixelSize: pSize, width, height, pos } = props;

   const ctr = new PIXI.Container();

   const pixelGraphic = new PIXI.Graphics();

   pixelGraphic
      .rect(pSize * 2, pSize, pSize * (width - 4), pSize)
      .fill({ color: color.inBorder });

   // left border
   pixelGraphic
      .rect(pSize, pSize * 2, pSize, pSize * (height - 4))
      .fill({ color: color.inBorder });

   // bottom border
   pixelGraphic
      .rect(pSize * 2, pSize * (height - 2), pSize * (width - 4), pSize)
      .fill({ color: color.inBorder });

   // right border
   pixelGraphic
      .rect(pSize * (width - 2), pSize * 2, pSize, pSize * (height - 4))
      .fill({ color: color.inBorder });

   // main background
   pixelGraphic
      .rect(pSize * 2, pSize * 2, pSize * (width - 4), pSize * (height - 4))
      .fill({ color: color.mainBg });

   ctr.addChild(pixelGraphic);

   const text = new PIXI.Text({
      style: new PIXI.TextStyle({
         fontSize: props.text.size,
         fontFamily: "GraphPix",
         fill: color.white,
      }),
      resolution: 2,
      text: props.text.value,
   });

   // Set the anchor point of the text to its center
   text.anchor.set(0.5); // Sets both x and y anchor to 0.5 (center)

   // Position the text at the center of the pixelGraphic
   // For PIXI.Graphics, x and y are typically its top-left corner
   // So, to find the center of the graphic:
   text.x = ctr.x + ctr.width * 0.6;
   text.y = ctr.y + ctr.height * 0.6;

   ctr.addChild(text);

   ctr.x = pos.x;
   ctr.y = pos.y;

   ctr.interactive = true;
   ctr.alpha = 0.8;
   ctr.on("pointerenter", () => {
      ctr.alpha = alpha.hover;
   });
   ctr.on("pointerleave", () => {
      ctr.alpha = alpha.base;
   });

   let clickCb: (() => void) | undefined = undefined;
   let releaseCb: (() => void) | undefined = undefined;

   ctr.on("pointerdown", () => {
      ctr.alpha = alpha.down;
      clickCb?.();
   });

   ctr.on("pointerup", () => {
      ctr.alpha = alpha.base;
      releaseCb?.();
   });

   return {
      ctr,
      onClick: (cb: () => void) => {
         clickCb = cb;
      },
      onRelease: (cb: () => void) => {
         releaseCb = cb;
      },
   };
};
