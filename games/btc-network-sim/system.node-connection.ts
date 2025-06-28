import * as PIXI from "pixi.js";
import { ZLayer } from "./game.enums";
import type { GameVars } from "./game.vars";
import type { BtcNode } from "./model.btc-node";
import type { NodeStore } from "./store.nodes";
import type { Position } from "./types";

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
      const dotSpacing = lineDotRadius * 7.5;
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

      for (const n of store.data()) n.connection.disconnect();

      // const reversedNodesData = [...store.data()].reverse();
      for (const nextNode of store.data()) {
         if (nextNode.connection.connectCount() >= 8) continue;
         getClosestNodes({ node: nextNode, count: 6, store: store }).map((n) => {
            nextNode.connection.connect(n);
            n.connection.connect(nextNode);
            const l = createConnectionBetween({ node1: nextNode, node2: n });
            connectLines.push(l);
         });
      }

      for (const line of connectLines) game.addChild(line);
   };

   const update = (tick: PIXI.Ticker) => {};

   return {
      setup: setupGridConnections,
      update,
   };
};

interface nodeWithDistance {
   node: BtcNode;
   distance: number;
}

interface closestNodeProps {
   node: BtcNode;
   count: number;
   store: NodeStore;
}

const getClosestNodes = (props: closestNodeProps): BtcNode[] => {
   const { node, count, store } = props;
   const allNodes = store.data();

   const nodesWithDistances: nodeWithDistance[] = [];

   const calculateDistance = (p1: Position, p2: Position): number => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      return Math.sqrt(dx * dx + dy * dy);
   };

   for (const currentNode of allNodes) {
      if (currentNode.connection.isConnectedTo(node)) continue;
      if (currentNode.id() === node.id()) continue;
      if (currentNode.connection.connectCount() >= 6) continue;

      const distance = calculateDistance(node.anim, currentNode.anim);
      if (distance >= 200) continue;
      nodesWithDistances.push({ node: currentNode, distance: distance });
   }

   nodesWithDistances.sort((a, b) => a.distance - b.distance);

   const result = nodesWithDistances.slice(0, count + 1).map((item) => item.node);

   return result;
};
