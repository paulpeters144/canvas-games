import * as PIXI from "pixi.js";
import { ZLayer } from "./game.enums";
import { bus } from "./main";
import type { BtcNode } from "./model.btc-node";
import type { NodeStore } from "./store.nodes";
import type { Position } from "./types";
import { color } from "./ui.colors";
import type { Camera } from "./util.camera";

export const createDataWidget = (props: {
   camera: Camera;
   game: PIXI.Container;
   store: NodeStore;
   pixelSize: number;
   width: number;
   height: number;
}) => {
   const { camera, game, store, pixelSize: pSize, width, height } = props;

   const ctr = new PIXI.Container();

   const pixelGraphic = new PIXI.Graphics();

   // top border
   pixelGraphic
      .rect(pSize, 0, pSize * (width - 4), pSize)
      .fill({ color: color.inBorder });

   // left border
   pixelGraphic
      .rect(0, pSize, pSize, pSize * (height - 4))
      .fill({ color: color.inBorder });

   // bottom border
   pixelGraphic
      .rect(pSize, pSize * (height - 3), pSize * (width - 4), pSize)
      .fill({ color: color.inBorder });

   // right border
   pixelGraphic
      .rect(pSize * (width - 3), pSize, pSize, pSize * (height - 4))
      .fill({ color: color.inBorder });

   // main background
   pixelGraphic
      .rect(pSize, pSize, pSize * (width - 4), pSize * (height - 4))
      .fill({ color: color.mainBg });

   const createOffClickArea = () => {
      const g = new PIXI.Graphics()
         .rect(0, 0, 1, 1)
         .fill({ color: "blue", alpha: 0 });
      g.interactive = true;
      g.onpointerdown = () => {
         bus.fire("focusNode", { isFocused: false });
      };
      return g;
   };

   const offClickAreaTop = createOffClickArea();
   const offClickAreaBtm = createOffClickArea();
   const offClickAreaRt = createOffClickArea();
   const offClickAreaLt = createOffClickArea();

   ctr.addChild(
      pixelGraphic,
      offClickAreaTop,
      offClickAreaBtm,
      offClickAreaLt,
      offClickAreaRt,
   );
   ctr.visible = false;
   ctr.zIndex = ZLayer.top;
   ctr.alpha = 0.9;

   game.addChild(ctr);

   const setRightOf = (node: BtcNode) => {
      ctr.visible = true;

      const vpBounds = camera.vpBounds();
      const nodeRect = {
         x: node.anim.x,
         y: node.anim.y,
         w: node.anim.width,
         h: node.anim.height,
      };

      // Position pixelGraphic on the right side of viewport
      pixelGraphic.x = vpBounds.right - pixelGraphic.width;
      pixelGraphic.y = vpBounds.top;

      // Top area (above the node)
      const topBuffer = 15;
      offClickAreaTop.x = vpBounds.x;
      offClickAreaTop.y = vpBounds.y;
      offClickAreaTop.width = pixelGraphic.x - vpBounds.x;
      offClickAreaTop.height = nodeRect.y - vpBounds.y - topBuffer;

      // Bottom area (below the node)
      const btmBuffer = 25;
      offClickAreaBtm.x = vpBounds.x;
      offClickAreaBtm.y = nodeRect.y + nodeRect.h + btmBuffer;
      offClickAreaBtm.width = pixelGraphic.x - vpBounds.x;
      offClickAreaBtm.height =
         vpBounds.bottom - (nodeRect.y + nodeRect.h + btmBuffer);

      // Left area (beside the node vertically, to the left of the node)
      const ltBuffer = 15;
      offClickAreaLt.x = vpBounds.x;
      offClickAreaLt.y = offClickAreaTop.y + offClickAreaTop.height;
      offClickAreaLt.width = nodeRect.x - vpBounds.x - ltBuffer;
      offClickAreaLt.height = offClickAreaBtm.y - offClickAreaLt.y;

      // Right area (between node and pixelGraphic)
      const rtBuffer = 15;
      offClickAreaRt.x = nodeRect.x + nodeRect.w + rtBuffer;
      offClickAreaRt.y = offClickAreaTop.y + offClickAreaTop.height;
      offClickAreaRt.width = pixelGraphic.x - (nodeRect.x + nodeRect.w + rtBuffer);
      offClickAreaRt.height = offClickAreaBtm.y - offClickAreaRt.y;
   };

   const setLeftOf = (node: BtcNode) => {
      ctr.visible = true;

      const vpBounds = camera.vpBounds();
      const nodeRect = {
         x: node.anim.x,
         y: node.anim.y,
         w: node.anim.width,
         h: node.anim.height,
      };

      // Position pixelGraphic on the left side of viewport
      pixelGraphic.x = vpBounds.x;
      pixelGraphic.y = vpBounds.y;

      // Top area (above the node)
      const topBuffer = 15;
      offClickAreaTop.x = vpBounds.x + pixelGraphic.width;
      offClickAreaTop.y = vpBounds.y;
      offClickAreaTop.width = vpBounds.right - (vpBounds.x + pixelGraphic.width);
      offClickAreaTop.height = nodeRect.y - vpBounds.y - topBuffer;

      // Bottom area (below the node)
      const btmBuffer = 15;
      offClickAreaBtm.x = vpBounds.x + pixelGraphic.width;
      offClickAreaBtm.y = nodeRect.y + nodeRect.h + btmBuffer;
      offClickAreaBtm.width = vpBounds.right - (vpBounds.x + pixelGraphic.width);
      offClickAreaBtm.height =
         vpBounds.bottom - (nodeRect.y + nodeRect.h + btmBuffer);

      // Left area (between pixelGraphic and node)
      const ltBuffer = 10;
      offClickAreaLt.x = vpBounds.x + pixelGraphic.width;
      offClickAreaLt.y = offClickAreaTop.y + offClickAreaTop.height;
      offClickAreaLt.width =
         nodeRect.x - (vpBounds.x + pixelGraphic.width) - ltBuffer;
      offClickAreaLt.height = offClickAreaBtm.y - offClickAreaLt.y;

      // Right area (beside the node vertically, to the right of the node)
      const rtBuffer = 10;
      offClickAreaRt.x = nodeRect.x + nodeRect.w + rtBuffer;
      offClickAreaRt.y = offClickAreaTop.y + offClickAreaTop.height;
      offClickAreaRt.width = vpBounds.right - (nodeRect.x + nodeRect.w + rtBuffer);
      offClickAreaRt.height = offClickAreaBtm.y - offClickAreaRt.y;
   };

   bus.on("focusNode", (e) => {
      if (!e.isFocused) {
         ctr.visible = false;
         return;
      }

      const node = store.data().find((n) => n.ip() === e.ip);
      if (!node) return;

      const isOnFarLeftScreen = game.width - node.anim.x > 250;
      setTimeout(() => {
         isOnFarLeftScreen ? setRightOf(node) : setLeftOf(node);
      }, 0);
   });
};

const createTabBtn = (props: {
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
   //    const color = {
   //       white: "#FFFFFF",
   //       outBorder: "#9D5322",
   //       inBorder: "#E88744",
   //       mainBg: "#D67130",
   //    };
   //    const { alpha, pixelSize: pSize, width, height, pos } = props;
   //    const ctr = new PIXI.Container();
   //    const pixelGraphic = new PIXI.Graphics();
   //    pixelGraphic
   //       .rect(pSize * 2, pSize, pSize * (width - 4), pSize)
   //       .fill({ color: color.inBorder });
   //    // left border
   //    pixelGraphic
   //       .rect(pSize, pSize * 2, pSize, pSize * (height - 4))
   //       .fill({ color: color.inBorder });
   //    // bottom border
   //    pixelGraphic
   //       .rect(pSize * 2, pSize * (height - 2), pSize * (width - 4), pSize)
   //       .fill({ color: color.inBorder });
   //    // right border
   //    pixelGraphic
   //       .rect(pSize * (width - 2), pSize * 2, pSize, pSize * (height - 4))
   //       .fill({ color: color.inBorder });
   //    // main background
   //    pixelGraphic
   //       .rect(pSize * 2, pSize * 2, pSize * (width - 4), pSize * (height - 4))
   //       .fill({ color: color.mainBg });
   //    ctr.addChild(pixelGraphic);
   //    const text = new PIXI.Text({
   //       style: new PIXI.TextStyle({
   //          fontSize: props.text.size,
   //          fontFamily: "GraphPix",
   //          fill: color.white,
   //       }),
   //       resolution: 2,
   //       text: props.text.value,
   //    });
   //    // Set the anchor point of the text to its center
   //    text.anchor.set(0.5); // Sets both x and y anchor to 0.5 (center)
   //    // Position the text at the center of the pixelGraphic
   //    // For PIXI.Graphics, x and y are typically its top-left corner
   //    // So, to find the center of the graphic:
   //    text.x = ctr.x + ctr.width * 0.6;
   //    text.y = ctr.y + ctr.height * 0.6;
   //    ctr.addChild(text);
   //    ctr.x = pos.x;
   //    ctr.y = pos.y;
   //    ctr.interactive = true;
   //    ctr.alpha = 0.8;
   //    ctr.on("pointerenter", () => {
   //       ctr.alpha = alpha.hover;
   //    });
   //    ctr.on("pointerleave", () => {
   //       ctr.alpha = alpha.base;
   //    });
   //    let clickCb: (() => void) | undefined = undefined;
   //    let releaseCb: (() => void) | undefined = undefined;
   //    ctr.on("pointerdown", () => {
   //       ctr.alpha = alpha.down;
   //       clickCb?.();
   //    });
   //    ctr.on("pointerup", () => {
   //       ctr.alpha = alpha.base;
   //       releaseCb?.();
   //    });
   //    return {
   //       ctr,
   //       onClick: (cb: () => void) => {
   //          clickCb = cb;
   //       },
   //       onRelease: (cb: () => void) => {
   //          releaseCb = cb;
   //       },
   //    };
};
