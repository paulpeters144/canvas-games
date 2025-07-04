import type * as PIXI from "pixi.js";
import { bus } from "./main";
import type { BtcNode } from "./model.btc-node";
import type { NodeStore } from "./store.nodes";
import type { Position } from "./types";
import type { Camera } from "./util.camera";

export let NODE_FOCUSED = "";
export let LAST_POS: Position = { x: 0, y: 0 };
export let LAST_ZOOM_PERCENT = 1;

export const setupNodeFocus = (props: {
   game: PIXI.Container;
   camera: Camera;
   node: BtcNode;
   store: NodeStore;
}) => {
   const { game, camera, node, store } = props;
   NODE_FOCUSED = "";
   LAST_POS = { x: 0, y: 0 };
   LAST_ZOOM_PERCENT = 1;

   node.anim.on("pointerdown", () => {
      if (NODE_FOCUSED) return;

      camera.enableDrag(false);
      camera.enableZoom(false);
      NODE_FOCUSED = node.ip();
      LAST_POS = camera.centerPos();
      LAST_ZOOM_PERCENT = camera.zoomPercent();

      store.data().map((n) => {
         n.anim.interactive = false;
         if (n.ip() !== NODE_FOCUSED) n.anim.alpha = 0.5;
      });

      const posToMove =
         game.width - node.anim.x > 250
            ? {
                 x: node.anim.x + 100,
                 y: node.anim.y + 35,
              }
            : {
                 x: node.anim.x - 85,
                 y: node.anim.y + 35,
              };
      camera.animate({
         time: 370,
         position: posToMove,
         scale: 3.85,
         ease: "easeInOutSine",
         callbackOnComplete: () => {
            bus.fire("focusNode", { ip: node.ip(), isFocused: true });
         },
      });
   });

   bus.on("focusNode", (e) => {
      if (e.isFocused) return;
      if (!NODE_FOCUSED) return;

      NODE_FOCUSED = "";
      camera.enableDrag(true);
      camera.enableZoom(true);

      store.data().map((n) => {
         n.anim.interactive = true;
         n.anim.alpha = 1;
         n.anim.filters = [];
      });

      camera.animate({
         time: 370,
         position: LAST_POS,
         scale: LAST_ZOOM_PERCENT,
         ease: "easeInOutSine",
      });
   });
};
