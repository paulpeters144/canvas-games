import * as PIXI from "pixi.js";
import { bus } from "./_main";
import type { GameVars } from "./game.vars";
import type { BtcNode } from "./model.btc-node";
import type { BlockTx, BtcBlock } from "./types";

export interface TxMessageSystem {
   displayTxMovement: (props: txMessage) => void;
   update: (ticker: PIXI.Ticker) => void;
   displayBlockMovement: (props: blockMessage) => void;
}

interface txMessage {
   fromNode: BtcNode;
   toNode: BtcNode;
   tx: BlockTx;
}

interface blockMessage {
   fromNode: BtcNode;
   toNode: BtcNode;
   block: BtcBlock;
}

export const createTxMessageSystem = (gameVars: GameVars): TxMessageSystem => {
   const activeTxGraphics: txGraphic[] = [];

   const displayTxMovement = (props: txMessage) => {
      const { fromNode, toNode, tx } = props;
      const txGraphic = createTxGraphic({
         start: fromNode,
         end: toNode,
         container: gameVars.game,
         msg: tx,
         type: "tx",
         size: 4,
      });
      activeTxGraphics.push(txGraphic);
   };

   const displayBlockMovement = (props: blockMessage) => {
      const { fromNode, toNode, block } = props;
      const txGraphic = createTxGraphic({
         start: fromNode,
         end: toNode,
         container: gameVars.game,
         msg: block,
         type: "block",
         size: 25,
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

         if (txGraphic.type === "block") {
            const completedDestination = txGraphic.update(ticker);
            if (completedDestination) {
               txGraphic.destroy();
               activeTxGraphics.splice(i, 1);
               bus.fire("fwdBlock", {
                  block: structuredClone(txGraphic.msg()),
                  fromAddr: txGraphic.endAddr(),
               });
            }
         }

         if (txGraphic.type === "tx") {
            const completedDestination = txGraphic.update(ticker);
            if (completedDestination) {
               txGraphic.destroy();
               activeTxGraphics.splice(i, 1);
               const msg = { originId: txGraphic.endId(), tx: txGraphic.msg() };
               bus.fire("newTx", msg);
            }
         }
      }
   };

   return {
      displayTxMovement: displayTxMovement,
      displayBlockMovement: displayBlockMovement,
      update,
   };
};

type txGraphic =
   | {
        update: (tick: PIXI.Ticker) => boolean;
        destroy: () => void;
        startId: () => string;
        endId: () => string;
        graphic: () => PIXI.Graphics;
        type: "tx";
        msg: () => BlockTx;
     }
   | {
        update: (tick: PIXI.Ticker) => boolean;
        destroy: () => void;
        startId: () => string;
        endAddr: () => string;
        graphic: () => PIXI.Graphics;
        type: "block";
        msg: () => BtcBlock;
     };

type txGraphicProps =
   | {
        start: BtcNode;
        end: BtcNode;
        container: PIXI.Container;
        type: "tx";
        msg: BlockTx;
        size: number;
     }
   | {
        start: BtcNode;
        end: BtcNode;
        container: PIXI.Container;
        type: "block";
        msg: BtcBlock;
        size: number;
     };

const createTxGraphic = (props: txGraphicProps): txGraphic => {
   const { container, start, end, msg, type, size } = props;
   const speed = 5.25;
   const startPos = start.pos();
   const endPos = end.pos();
   const graphic = new PIXI.Graphics().circle(0, 0, size).fill({ color: "#ff8f45" });
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

   return type === "tx"
      ? {
           update,
           destroy,
           type: "tx",
           msg: () => msg,
           startId: () => start.ip(),
           endId: () => end.ip(),
           graphic: () => graphic,
        }
      : {
           update,
           destroy,
           type: "block",
           msg: () => msg,
           startId: () => start.ip(),
           endAddr: () => end.wallet.addr(),
           graphic: () => graphic,
        };
};
