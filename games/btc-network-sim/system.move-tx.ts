import * as PIXI from "pixi.js";
import type { GameVars } from "./game.vars";
import type { BtcNode } from "./model.btc-node";
import type { Position } from "./types";
import { standard } from "./util";

export interface MoveTxSystem {
   displayMovement: (props: {
      fromNode: BtcNode;
      toNode: BtcNode;
   }) => void;
   update: (ticker: PIXI.Ticker) => void;
}
export const createMoveTxSystem = (gameVars: GameVars): MoveTxSystem => {
   const activeTxGraphics: txGraphic[] = [];
   const displayMovement = (props: { fromNode: BtcNode; toNode: BtcNode }) => {
      const { fromNode, toNode } = props;
      const tx = createTxGraphic({
         startPos: fromNode.pos(),
         endPos: toNode.pos(),
         container: gameVars.game,
      });
      activeTxGraphics.push(tx);
   };

   const update = (ticker: PIXI.Ticker) => {
      for (let i = activeTxGraphics.length - 1; i >= 0; i--) {
         const txG = activeTxGraphics[i];
         if (txG.update(ticker)) {
            txG.destroy();
            activeTxGraphics.splice(i, 1);
         }
      }
   };

   return {
      displayMovement,
      update,
   };
};

interface txGraphic {
   update: (tick: PIXI.Ticker) => boolean;
   destroy: () => void;
   id: () => string;
}
interface txGraphicProps {
   startPos: Position;
   endPos: Position;
   container: PIXI.Container;
   speed?: number;
}
const createTxGraphic = (props: txGraphicProps): txGraphic => {
   const { container, startPos, endPos, speed = 8 } = props;
   const id = standard.idStr();
   const graphic = new PIXI.Graphics().circle(0, 0, 8).fill({ color: "orange" });
   graphic.x = startPos.x;
   graphic.y = startPos.y;

   container.addChild(graphic);

   const deltaX = endPos.x - startPos.x;
   const deltaY = endPos.y - startPos.y;
   const initialDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

   const directionX = initialDistance === 0 ? 0 : deltaX / initialDistance;
   const directionY = initialDistance === 0 ? 0 : deltaY / initialDistance;

   const update = (ticker: PIXI.Ticker): boolean => {
      if (initialDistance === 0) {
         return true;
      }

      const currentDeltaX = endPos.x - graphic.x;
      const currentDeltaY = endPos.y - graphic.y;
      const currentDistance = Math.sqrt(
         currentDeltaX * currentDeltaX + currentDeltaY * currentDeltaY,
      );

      const moveAmount = speed * ticker.deltaTime;

      if (moveAmount >= currentDistance) {
         graphic.x = endPos.x;
         graphic.y = endPos.y;
         return true;
      }
      graphic.x += directionX * moveAmount;
      graphic.y += directionY * moveAmount;
      return false;
   };

   const destroy = () => {
      if (graphic.parent) {
         graphic.parent.removeChild(graphic);
      }
      graphic.destroy();
   };

   return {
      update,
      destroy,
      id: () => id,
   };
};
