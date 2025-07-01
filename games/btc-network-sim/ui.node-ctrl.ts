import * as PIXI from "pixi.js";
import type { GameVars } from "./game.vars";
import { bus } from "./main";
import type { Position } from "./types";
import { color } from "./ui.colors";
import { BtnState } from "./util.input-ctrl";

export interface NodeCounterUI {
   resize: () => void;
   update: (tick: PIXI.Ticker) => void;
}

interface nodeCounterProps {
   gameVars: GameVars;
}

export const createNodeCounterUI = (props: nodeCounterProps): NodeCounterUI => {
   const { gameVars } = props;
   const { app, scaler } = gameVars;

   const ctr = new PIXI.Container();

   const bgGraphic = new PIXI.Graphics();
   const bgWidth = 61;
   const bgHeight = 300;
   bgGraphic.rect(0, 0, bgWidth, bgHeight).fill({ color: color.white, alpha: 0 });

   const padding = 5;
   const nodeCountText = createNodeCountText();
   const maxBtn = createBtcGraphic({
      pixelSize: 4.25,
      width: 14,
      height: 14,
      pos: { x: 0, y: 42 },
      text: { value: "MAX", size: 14 },
   });
   const plusBtn = createBtcGraphic({
      pixelSize: 4.25,
      width: 14,
      height: 14,
      pos: { x: 0, y: maxBtn.ctr.y + maxBtn.ctr.height + padding },
      text: { value: "+", size: 20 },
   });
   const minusBtn = createBtcGraphic({
      pixelSize: 4.25,
      width: 14,
      height: 14,
      pos: { x: 0, y: plusBtn.ctr.y + plusBtn.ctr.height + padding },
      text: { value: "-", size: 20 },
   });
   const minBtn = createBtcGraphic({
      pixelSize: 4.25,
      width: 14,
      height: 14,
      pos: { x: 0, y: minusBtn.ctr.y + minusBtn.ctr.height + padding },
      text: { value: "MIN", size: 14 },
   });

   const btnControl = new BtnInputCtrl();

   maxBtn.onClick(btnControl.max.press);
   maxBtn.onRelease(btnControl.max.release);
   plusBtn.onClick(btnControl.plus.press);
   plusBtn.onRelease(btnControl.plus.release);
   minusBtn.onClick(btnControl.minus.press);
   minusBtn.onRelease(btnControl.minus.release);
   minBtn.onClick(btnControl.min.press);
   minBtn.onRelease(btnControl.min.release);

   ctr.addChild(
      bgGraphic,
      nodeCountText.nodes,
      nodeCountText.count,
      maxBtn.ctr,
      plusBtn.ctr,
      minusBtn.ctr,
      minBtn.ctr,
   );
   app.stage.addChild(ctr);

   const handleResize = () => {
      ctr.width = bgWidth * scaler.getGameScale();
      ctr.height = bgHeight * scaler.getGameScale();
      ctr.x = app.screen.width - ctr.width;
      ctr.y = app.screen.height * 0.5 - ctr.height * 0.5;
      ctr.y -= 50;
   };

   handleResize();

   const nodeAmountBounds = {
      min: 1,
      max: 127,
   };

   let currentNodeCount = 19;
   let continueTillMax = false;
   let continueTillMin = false;
   const adjustNodeCountText = () => {
      const { count, nodes } = nodeCountText;
      count.text = `${currentNodeCount}`;
      count.x = nodes.width * 0.5 - count.width * 0.5;
      bus.fire("node", { count: currentNodeCount });
   };
   adjustNodeCountText();

   const update = (_: PIXI.Ticker) => {
      if (continueTillMax) {
         if (currentNodeCount >= nodeAmountBounds.max) {
            continueTillMax = false;
            return;
         }
         currentNodeCount += 5;
         currentNodeCount =
            currentNodeCount >= nodeAmountBounds.max
               ? nodeAmountBounds.max
               : currentNodeCount;
         adjustNodeCountText();
         return;
      }

      if (continueTillMin) {
         if (currentNodeCount <= nodeAmountBounds.min) {
            continueTillMin = false;
            return;
         }
         currentNodeCount -= 4;
         currentNodeCount =
            currentNodeCount <= nodeAmountBounds.min
               ? nodeAmountBounds.min
               : currentNodeCount;
         adjustNodeCountText();
         return;
      }

      if (btnControl.max.wasPressedOnce) {
         continueTillMax = true;
      }

      if (btnControl.plus.wasPressedOnce || btnControl.plus.pressHeldAfter(500)) {
         if (currentNodeCount >= nodeAmountBounds.max) return;
         currentNodeCount++;
         adjustNodeCountText();
      }

      if (btnControl.minus.wasPressedOnce || btnControl.minus.pressHeldAfter(500)) {
         if (currentNodeCount <= nodeAmountBounds.min) return;
         currentNodeCount--;
         adjustNodeCountText();
      }

      if (btnControl.min.wasPressedOnce) {
         continueTillMin = true;
      }
   };

   return {
      resize: handleResize,
      update: update,
   };
};

const createBtcGraphic = (props: {
   pixelSize: number;
   width: number;
   height: number;
   pos: Position;
   text: { value: string; size: number };
}) => {
   const color = {
      white: "#FFFFFF",
      outBorder: "#9D5322",
      inBorder: "#E88744",
      mainBg: "#D67130",
   };
   const { pixelSize: pSize, width, height, pos } = props;
   const ctr = new PIXI.Container();

   const pixelGraphic = new PIXI.Graphics();
   pixelGraphic
      .rect(pSize * 2, 0, pSize * (width - 4), pSize)
      .fill({ color: color.outBorder });
   pixelGraphic
      .rect(pSize * 2, pSize, pSize * (width - 4), pSize)
      .fill({ color: color.inBorder });

   // top left pixel
   pixelGraphic.rect(pSize, pSize, pSize, pSize).fill({ color: color.outBorder });

   // top right pixel
   pixelGraphic
      .rect(pSize * (width - 2), pSize, pSize, pSize)
      .fill({ color: color.outBorder });

   // left border
   pixelGraphic
      .rect(0, pSize * 2, pSize, pSize * (height - 4))
      .fill({ color: color.outBorder });
   pixelGraphic
      .rect(pSize, pSize * 2, pSize, pSize * (height - 4))
      .fill({ color: color.inBorder });

   // bottom left pixel
   pixelGraphic
      .rect(pSize, pSize * (height - 2), pSize, pSize)
      .fill({ color: color.outBorder });

   // bottom border
   pixelGraphic
      .rect(pSize * 2, pSize * (height - 1), pSize * (width - 4), pSize)
      .fill({ color: color.outBorder });
   pixelGraphic
      .rect(pSize * 2, pSize * (height - 2), pSize * (width - 4), pSize)
      .fill({ color: color.inBorder });

   // bottom left pixel
   pixelGraphic
      .rect(pSize * (width - 2), pSize * (height - 2), pSize, pSize)
      .fill({ color: color.outBorder });

   // right border
   pixelGraphic
      .rect(pSize * (width - 1), pSize * 2, pSize, pSize * (height - 4))
      .fill({ color: color.outBorder });
   pixelGraphic
      .rect(pSize * (width - 2), pSize * 2, pSize, pSize * (height - 4))
      .fill({ color: color.inBorder });

   // main background
   pixelGraphic
      .rect(pSize * 2, pSize * 2, pSize * (width - 4), pSize * (height - 4))
      .fill({ color: color.mainBg });

   const text = new PIXI.Text({
      style: new PIXI.TextStyle({
         fontSize: props.text.size,
         fontFamily: "GraphPix",
         fill: color.white,
      }),
      resolution: 2,
      text: props.text.value,
   });
   text.x = pixelGraphic.x + pixelGraphic.width * 0.5 - text.width * 0.5;
   text.y = pixelGraphic.y + pixelGraphic.height * 0.5 - text.height * 0.5;

   ctr.addChild(pixelGraphic, text);

   ctr.x = pos.x;
   ctr.y = pos.y;

   ctr.interactive = true;
   ctr.alpha = 0.8;
   ctr.on("pointerenter", () => {
      ctr.alpha = 0.93;
   });
   ctr.on("pointerleave", () => {
      ctr.alpha = 0.8;
   });

   let clickCb: (() => void) | undefined = undefined;
   let releaseCb: (() => void) | undefined = undefined;

   ctr.on("pointerdown", () => {
      ctr.alpha = 1;
      clickCb?.();
   });

   ctr.on("pointerup", () => {
      ctr.alpha = 0.85;
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

const createNodeCountText = () => {
   const style = new PIXI.TextStyle({
      fontFamily: "GraphPix",
      fontSize: 14,
      fill: color.white,
   });
   const nodes = new PIXI.Text({
      style: style,
      resolution: 2,
      text: "NODES",
      alpha: 0.85,
   });
   const count = new PIXI.Text({
      style: style,
      resolution: 2,
      text: "1",
      y: nodes.y + nodes.height + 6.5,
      alpha: 0.85,
   });
   count.x = nodes.width * 0.5 - count.width * 0.5;
   return {
      nodes: nodes,
      count: count,
   };
};

class BtnInputCtrl {
   public max = new BtnState();
   public plus = new BtnState();
   public minus = new BtnState();
   public min = new BtnState();
}
