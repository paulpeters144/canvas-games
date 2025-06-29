import type * as PIXI from "pixi.js";
import { bus } from "./main";
import type { NodeStore } from "./store.nodes";
import { randNum, standard } from "./util";

export interface SendRandTxSystem {
   update: (tick: PIXI.Ticker) => void;
}

interface props {
   store: NodeStore;
}

export const createSendTxSystem = (props: props): SendRandTxSystem => {
   const { store } = props;

   const getRandIdxs = () => {
      const allNodes = store.data();
      const sendIdx = randNum({
         min: 0,
         max: allNodes.length,
         decimal: false,
      });
      let recIdx = randNum({
         min: 0,
         max: allNodes.length,
         decimal: false,
      });
      if (recIdx === sendIdx && recIdx !== allNodes.length - 1) {
         recIdx++;
      } else if (recIdx === sendIdx && recIdx !== 0) {
         recIdx--;
      } else if (recIdx === sendIdx) {
         throw new Error("cant send btc to self");
      }

      return {
         sendIdx,
         recIdx,
      };
   };

   const fireRandomTx = () => {
      try {
         const allNodes = store.data();
         if (allNodes.length < 2) return;

         const { sendIdx, recIdx } = getRandIdxs();

         const randSendingNode = allNodes[sendIdx];
         const randReceivingNode = allNodes[recIdx];

         const balance = randSendingNode.wallet.balance();
         const amount = randNum({
            min: balance * 0.00001,
            max: balance * 0.01,
            decimal: true,
         });
         const units = standard.round(amount);
         bus.fire("randSend", {
            fromId: randSendingNode.id(),
            toId: randReceivingNode.id(),
            units,
         });
      } catch (_) {}
   };

   const sendBtcInterval = (() => {
      let eventInterval = randNum({ min: 2000, max: 3000 });
      let currentTick = 0;
      return {
         update: (t: PIXI.Ticker) => {
            if (currentTick >= eventInterval) {
               currentTick = 0;
               eventInterval = randNum({ min: 500, max: 3500 });
               fireRandomTx();
            }
            currentTick += t.deltaMS;
         },
      };
   })();

   return {
      update: (tick: PIXI.Ticker) => {
         sendBtcInterval.update(tick);
      },
   };
};
