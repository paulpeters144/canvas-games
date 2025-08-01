import * as PIXI from "pixi.js";
import type { GameVars } from "./game.vars";
import { type BtcNode, createBtcNode } from "./model.btc-node";
import type { Position } from "./types";

const MAX_NODE_COUNT = 127;

export interface NodeStore {
   count: () => number;
   activeNodes: () => BtcNode[];
   allData: () => BtcNode[];
   add: () => BtcNode | undefined;
   remove: () => BtcNode | undefined;
}

export const createNodeStore = (gameVars: GameVars): NodeStore => {
   const cache: BtcNode[] = [];
   const { game } = gameVars;

   const getGameSize = () => ({
      width: game.width,
      height: game.height,
   });

   // Preload max nodes if needed
   while (cache.length < MAX_NODE_COUNT) {
      const pos = getNextOpenPos(cache, getGameSize());
      const node = createBtcNode({ gameVars, pos });
      // Optionally visualize surrounding slots:
      // displayOpenNeighborSlots({ node, game });
      node.anim.visible = false;
      cache.push(node);
   }

   let len = 0;
   const add = () => {
      if (len === MAX_NODE_COUNT) return undefined;
      const result = cache[len];
      result.anim.visible = true;
      len++;
      return result;
   };

   const remove = () => {
      if (len === 1) return undefined;
      len--;
      const result = cache[len];
      result.anim.visible = false;
      return result;
   };

   return {
      count: () => len,
      activeNodes: () => cache.slice(0, len),
      allData: () => cache,
      add,
      remove,
   };
};

type posKey =
   | "top"
   | "topLeft"
   | "topRight"
   | "bottom"
   | "bottomLeft"
   | "bottomRight";

const getSurroundingPos = (node: BtcNode) => {
   const result = {
      top: new PIXI.Rectangle(),
      topLeft: new PIXI.Rectangle(),
      topRight: new PIXI.Rectangle(),
      bottom: new PIXI.Rectangle(),
      bottomLeft: new PIXI.Rectangle(),
      bottomRight: new PIXI.Rectangle(),
   };

   const blockSize = 1;
   const distanceFromNode = 135;

   const nodeCenterX = node.anim.x + node.anim.width * 0.5;
   const nodeCenterY = node.anim.y + node.anim.height * 0.5;

   const positionsData = [
      { key: "top", angle: Math.PI * 1.5 },
      { key: "topRight", angle: Math.PI * 1.85 },
      { key: "bottomRight", angle: Math.PI * 0.15 },
      { key: "bottom", angle: Math.PI * 0.5 },
      { key: "bottomLeft", angle: Math.PI * 0.85 },
      { key: "topLeft", angle: Math.PI * 1.15 },
   ];
   positionsData.map((p) => {
      const angle = p.angle;
      const blockCenterX = nodeCenterX + Math.cos(angle) * distanceFromNode;
      const blockCenterY = nodeCenterY + Math.sin(angle) * distanceFromNode;

      result[p.key as posKey] = new PIXI.Rectangle(
         blockCenterX - blockSize * 0.5,
         blockCenterY - blockSize * 0.5,
         blockSize,
         blockSize,
      );
   });

   return result;
};

const displayOpenNeighborSlots = (props: {
   node: BtcNode;
   game: PIXI.Container;
}) => {
   const { node, game } = props;
   const surroundingPos = getSurroundingPos(node);
   for (const key of Object.keys(surroundingPos) as posKey[]) {
      const rect = surroundingPos[key];
      const block = new PIXI.Graphics();

      block
         .rect(rect.x, rect.y, rect.width * 3, rect.height * 3)
         .fill({ color: 0x00ff00, alpha: 0.7 });

      game.addChild(block);
   }
};

interface rectsCollideProps {
   rectA: PIXI.Rectangle;
   rectB: PIXI.Rectangle;
   buffer?: number;
}
const rectsCollide = (props: rectsCollideProps): boolean => {
   const { rectA, rectB, buffer = 0 } = props;

   const bufferedRectA = new PIXI.Rectangle(
      rectA.x - buffer,
      rectA.y - buffer,
      rectA.width + buffer * 2,
      rectA.height + buffer * 2,
   );

   const bufferedRectB = new PIXI.Rectangle(
      rectB.x - buffer,
      rectB.y - buffer,
      rectB.width + buffer * 2,
      rectB.height + buffer * 2,
   );

   const aRightOfBLeft = bufferedRectA.x < bufferedRectB.x + bufferedRectB.width;
   if (!aRightOfBLeft) return false;

   const aLeftOfBRight = bufferedRectA.x + bufferedRectA.width > bufferedRectB.x;
   if (!aLeftOfBRight) return false;

   const aBelowBTop = bufferedRectA.y < bufferedRectB.y + bufferedRectB.height;
   if (!aBelowBTop) return false;

   const aAboveBBottom = bufferedRectA.y + bufferedRectA.height > bufferedRectB.y;
   if (!aAboveBBottom) return false;

   return true;
};

const getNextOpenPos = (
   store: BtcNode[],
   gameSize: { width: number; height: number },
): Position => {
   if (store.length === 0) {
      return {
         x: gameSize.width * 0.5 - 10,
         y: gameSize.height * 0.5 - 10,
      };
   }

   const nodeBuffer = 50;

   for (let i = 0; i < store.length; i++) {
      const node = store[i];
      const surroundingRects = getSurroundingPos(node);

      const orderedKeys: posKey[] = [
         "top",
         "topRight",
         "bottomRight",
         "bottom",
         "bottomLeft",
         "topLeft",
      ];

      for (const key of orderedKeys) {
         const potentialRect = surroundingRects[key];

         if (potentialRect.x < 10 || potentialRect.y < 10) continue;
         if (potentialRect.x + potentialRect.width + nodeBuffer > gameSize.width)
            continue;
         if (potentialRect.y + potentialRect.height + nodeBuffer > gameSize.height)
            continue;

         const collides = store.some((n) =>
            rectsCollide({
               rectA: potentialRect,
               rectB: n.toRect(),
               buffer: nodeBuffer,
            }),
         );

         if (collides) continue;

         return {
            x: potentialRect.x + potentialRect.width * 0.5,
            y: potentialRect.y + potentialRect.height * 0.5,
         };
      }
   }

   console.warn("No open position found around any existing nodes.");
   return { x: -1, y: -1 };
};
