import type * as PIXI from "pixi.js";
import { bus } from "./_main";
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

   let gameLoaded = false;
   bus.on("gameLoaded", () => {
      gameLoaded = true;
   });

   const getRandIdx = () => {
      const activeNodes = store.activeNodes();
      for (let i = 0; i < 4; i++) {
         const sendIdx = randNum({
            min: 0,
            max: activeNodes.length,
            decimal: false,
         });
         let recIdx = randNum({
            min: 0,
            max: activeNodes.length,
            decimal: false,
         });
         if (recIdx === sendIdx && recIdx !== activeNodes.length - 1) {
            recIdx++;
         } else if (recIdx === sendIdx && recIdx !== 0) {
            recIdx--;
         } else if (recIdx === sendIdx) {
            continue;
         }

         if (activeNodes[sendIdx].wallet.balance() > 0.001) {
            return { sendIdx, recIdx };
         }
      }
      return undefined;
   };

   const fireRandomTx = () => {
      try {
         const allNodes = store.activeNodes();
         if (allNodes.length < 2) return;

         const randIndexes = getRandIdx();
         if (!randIndexes) return;
         const { sendIdx, recIdx } = randIndexes;

         const randSendingNode = allNodes[sendIdx];
         const randReceivingNode = allNodes[recIdx];

         const balance = randSendingNode.wallet.balance();
         const amount = randNum({
            min: balance * 0.00001,
            max: balance * 0.001,
            decimal: true,
         });
         const units = standard.round(amount);
         bus.fire("randSend", {
            fromId: randSendingNode.ip(),
            toId: randReceivingNode.ip(),
            units,
         });
      } catch (_) {}
   };

   const createTxInterval = (() => {
      let eventInterval = randNum({ min: 1000, max: 1500 });
      let currentTick = 0;
      return {
         update: (t: PIXI.Ticker) => {
            if (currentTick >= eventInterval) {
               currentTick = 0;
               eventInterval = randNum({ min: 500, max: 3000 });
               fireRandomTx();
            }
            currentTick += t.deltaMS;
         },
      };
   })();

   return {
      update: (tick: PIXI.Ticker) => {
         if (!gameLoaded) return;
         createTxInterval.update(tick);
      },
   };
};
