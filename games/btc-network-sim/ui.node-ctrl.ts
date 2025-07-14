import * as PIXI from "pixi.js";
import { bus } from "./_main";
import { createBtnGraphic } from "./ui.button";
import { color } from "./ui.colors";
import { BtnState } from "./util.input-ctrl";

export interface NodeCounterUI {
   update: (tick: PIXI.Ticker) => void;
   ctr: PIXI.Container;
}

export const createNodeCounterUI = (app: PIXI.Application): NodeCounterUI => {
   const ctr = new PIXI.Container();

   const bgGraphic = new PIXI.Graphics();
   const bgWidth = 61;
   const bgHeight = 300;
   bgGraphic.rect(0, 0, bgWidth, bgHeight).fill({ color: color.white, alpha: 0 });

   const padding = 5;
   const nodeCountText = createNodeCountText();
   const btnAlphaData = { base: 0.8, hover: 0.93, down: 1 };
   const maxBtn = createBtnGraphic({
      pixelSize: 4.25,
      width: 14,
      height: 14,
      pos: { x: 0, y: 42 },
      text: { value: "MAX", size: 14 },
      alpha: btnAlphaData,
   });
   const plusBtn = createBtnGraphic({
      pixelSize: 4.25,
      width: 14,
      height: 14,
      pos: { x: 0, y: maxBtn.ctr.y + maxBtn.ctr.height + padding },
      text: { value: "+", size: 20 },
      alpha: btnAlphaData,
   });
   const minusBtn = createBtnGraphic({
      pixelSize: 4.25,
      width: 14,
      height: 14,
      pos: { x: 0, y: plusBtn.ctr.y + plusBtn.ctr.height + padding },
      text: { value: "-", size: 20 },
      alpha: btnAlphaData,
   });
   const minBtn = createBtnGraphic({
      pixelSize: 4.25,
      width: 14,
      height: 14,
      pos: { x: 0, y: minusBtn.ctr.y + minusBtn.ctr.height + padding },
      text: { value: "MIN", size: 14 },
      alpha: btnAlphaData,
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
      nodeCountText.ctr,
      maxBtn.ctr,
      plusBtn.ctr,
      minusBtn.ctr,
      minBtn.ctr,
   );

   const nodeAmountBounds = {
      min: 1,
      max: 127,
   };

   let currentNodeCount = 19;
   let continueTillMax = false;
   let continueTillMin = false;
   const adjustNodeCountText = () => {
      nodeCountText.nodeChange(currentNodeCount);
      bus.fire("node", { count: currentNodeCount });
   };
   adjustNodeCountText();

   bus.on("focusNode", (e) => {
      ctr.visible = !e.isFocused;
   });

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

   ctr.x = app.screen.width - ctr.width;
   ctr.y = app.screen.height * 0.275;
   app.stage.addChild(ctr);

   return {
      ctr: ctr,
      update: update,
   };
};

const createNodeCountText = () => {
   const ctr = new PIXI.Container();

   const bg = new PIXI.Graphics();
   const bgWidth = 52;
   const bgHeight = 38;

   bg.roundRect(0, 0, bgWidth, bgHeight, 4).fill({ color: "#D67130" });
   bg.alpha = 0.75;
   ctr.addChild(bg);

   const style = new PIXI.TextStyle({
      fontFamily: "GraphPix",
      fontSize: 10.5,
      fill: color.white,
   });

   const nodes = new PIXI.Text({
      text: "NODES",
      style,
      resolution: 2,
   });
   nodes.anchor.set(0.5, 0);
   nodes.x = bgWidth / 2;
   nodes.y = 4.5;
   ctr.addChild(nodes);

   const count = new PIXI.Text({
      text: "1",
      style,
      resolution: 2,
   });
   count.anchor.set(0.5, 0);
   count.x = bgWidth / 2;
   count.y = nodes.y + nodes.height + 4;
   ctr.addChild(count);

   ctr.y = 4;
   ctr.x = 3.5;

   return {
      ctr,
      nodeChange: (n: number) => {
         count.text = `${n}`;
         count.x = bgWidth / 2;
         nodes.x = bgWidth / 2 + 1;
      },
   };
};

class BtnInputCtrl {
   public max = new BtnState();
   public plus = new BtnState();
   public minus = new BtnState();
   public min = new BtnState();
}
