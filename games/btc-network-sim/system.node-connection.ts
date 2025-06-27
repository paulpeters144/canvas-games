import * as PIXI from "pixi.js";
import { ZLayer } from "./game.enums";
import type { GameVars } from "./game.vars";
import type { BtcNode } from "./model.btc-node";
import type { NodeStore } from "./store.nodes";

export interface ConnectionSystem {
   setup: () => void;
   update: (tick: PIXI.Ticker) => void;
}

interface connectionSystemProps {
   gameVars: GameVars;
   store: NodeStore;
}

export const createNodeConnectionSystem = (props: connectionSystemProps): ConnectionSystem => {
   const { gameVars, store } = props;
   const { game } = gameVars;

   const createConnectionBetween = (props: { node1: BtcNode; node2: BtcNode }) => {
      const { node1, node2 } = props;
      const p1 = {
         x: node1.anim.x + node1.anim.width * 0.5,
         y: node1.anim.y + node1.anim.height * 0.5,
      };
      const p2 = {
         x: node2.anim.x + node2.anim.width * 0.5,
         y: node2.anim.y + node2.anim.height * 0.5,
      };
      const line = new PIXI.Graphics();

      const lineDotRadius = 2;
      const dotSpacing = lineDotRadius * 5;
      const lineColor = "#FFFFFF";

      const deltaX = p2.x - p1.x;
      const deltaY = p2.y - p1.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const angleRadians = Math.atan2(deltaY, deltaX);

      for (let i = 0; i < distance; i += dotSpacing) {
         const dotX = p1.x + Math.cos(angleRadians) * i;
         const dotY = p1.y + Math.sin(angleRadians) * i;

         line.circle(dotX, dotY, lineDotRadius).fill({ color: lineColor });
      }
      line.zIndex = ZLayer.bottom;
      return line;
   };

   const connectLines: PIXI.Graphics[] = [];
   const setupGridConnections = () => {
      while (connectLines.length > 0) {
         const line = connectLines.pop();
         if (line) game.removeChild(line);
         line?.destroy();
      }

      for (const n of store.data()) n.disconnect();

      let prevNode: BtcNode | undefined = undefined;
      for (const nextNode of store.data()) {
         if (!prevNode) {
            prevNode = nextNode;
            continue;
         }
         if (prevNode.connectCount() <= 2) {
            prevNode.connect(nextNode);
            nextNode.connect(prevNode);
            const line = createConnectionBetween({ node1: prevNode, node2: nextNode });
            connectLines.push(line);
         }
         prevNode = nextNode;
      }

      for (const line of connectLines) game.addChild(line);
   };

   const update = (tick: PIXI.Ticker) => {};

   return {
      setup: setupGridConnections,
      update,
   };
};
