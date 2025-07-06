import * as PIXI from "pixi.js";
import type { GameVars } from "./game.vars";
import { bus } from "./main";
import type { BtcNode } from "./model.btc-node";
import type { BlockTx } from "./types";

export interface TxMessageSystem {
   displayMovement: (props: txMessage) => void;
   update: (ticker: PIXI.Ticker) => void;
}

interface txMessage {
   fromNode: BtcNode;
   toNode: BtcNode;
   txMsg: BlockTx;
}

export const createTxMessageSystem = (gameVars: GameVars): TxMessageSystem => {
   const activeTxGraphics: txGraphic[] = [];
   const displayMovement = (props: txMessage) => {
      const { fromNode, toNode, txMsg } = props;
      const txGraphic = createTxGraphic({
         start: fromNode,
         end: toNode,
         container: gameVars.game,
         txMsg: txMsg,
      });
      activeTxGraphics.push(txGraphic);
   };

   let aNodeIsFocused = false;
   bus.on("focusNode", (e) => {
      aNodeIsFocused = e.isFocused;
   });

   const update = (ticker: PIXI.Ticker) => {
      for (let i = activeTxGraphics.length - 1; i >= 0; i--) {
         const txGraphic = activeTxGraphics[i];

         if (aNodeIsFocused && txGraphic.graphic().alpha > 0.5) {
            txGraphic.graphic().alpha = 0.5;
         }

         const completedDestination = txGraphic.update(ticker);
         if (completedDestination) {
            txGraphic.destroy();
            activeTxGraphics.splice(i, 1);
            const msg = { originId: txGraphic.endId(), tx: txGraphic.txMsg() };
            bus.fire("newTx", msg);
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
   txMsg: () => BlockTx;
   startId: () => string;
   endId: () => string;
   graphic: () => PIXI.Graphics;
}

interface txGraphicProps {
   start: BtcNode;
   end: BtcNode;
   container: PIXI.Container;
   txMsg: BlockTx;
   speed?: number;
}

const createTxGraphic = (props: txGraphicProps): txGraphic => {
   const { container, start, end, txMsg, speed = 5.5 } = props;
   const startPos = start.pos();
   const endPos = end.pos();
   const graphic = new PIXI.Graphics().circle(0, 0, 4).fill({ color: "#ff8f45" });
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
      txMsg: () => txMsg,
      startId: () => start.ip(),
      endId: () => end.ip(),
      graphic: () => graphic,
   };
};
