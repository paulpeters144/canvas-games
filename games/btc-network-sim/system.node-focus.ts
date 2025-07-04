import type * as PIXI from "pixi.js";
import { bus } from "./main";
import type { BtcNode } from "./model.btc-node";
import type { NodeStore } from "./store.nodes";
import type { Camera } from "./util.camera";

export let NODE_FOCUSED = "";

export const setupNodeFocus = (props: {
   game: PIXI.Container;
   camera: Camera;
   node: BtcNode;
   store: NodeStore;
}) => {
   const { game, camera, node, store } = props;

   node.anim.on("pointerdown", () => {
      if (NODE_FOCUSED) return;

      camera.dragOff();

      const lastPos = camera.centerPos();
      const lastZoomPercent = camera.zoomPercent();

      NODE_FOCUSED = node.ip();
      bus.fire("focusNode", { ip: node.ip(), isFocused: true });

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
         time: 375,
         position: posToMove,
         scale: 3.85,
         ease: "easeInOutSine",
      });

      setTimeout(() => {
         bus.fire("focusNode", { ip: node.ip(), isFocused: false });
         NODE_FOCUSED = "";
         camera.dragOn();
         store.data().map((n) => {
            n.anim.interactive = true;
            n.anim.alpha = 1;
            n.anim.filters = [];
         });
         camera.animate({
            time: 375,
            position: lastPos,
            scale: lastZoomPercent,
            ease: "easeInOutSine",
         });
      }, 2500);
   });
};
