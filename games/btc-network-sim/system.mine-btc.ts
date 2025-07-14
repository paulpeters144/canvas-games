import type * as PIXI from "pixi.js";
import { bus } from "./_main";
import type { UTXOSet } from "./model.utxo-set";
import type { NodeStore } from "./store.nodes";
import type { BtcBlock } from "./types";
import { randNum, sleep } from "./util";

export const createMineBtcSystem = (props: {
   store: NodeStore;
   utxoSet: UTXOSet;
}): MineBtcSystem => {
   const { store, utxoSet } = props;
   let isMining = false;
   let lastBtcMined = performance.now();
   let eventInterval = 150;

   const mineNextBtc = async () => {
      isMining = true;
      const max = store.activeNodes().length - 1;
      const idx = randNum({ min: 0, max: max });
      const node = store.activeNodes()[idx];
      const txs = node.mempool.getAllTxs();
      const block = node.blockchain.createEmptyBlock({
         txs: txs,
         difficulty: 3,
      });
      node.miner.setNextBlockToMine(block);
      let nextBlock: BtcBlock | undefined;
      for (let i = 0; i < 150; i++) {
         if (i % 5 === 1) await sleep(0);
         nextBlock = node.miner.mineNextBlock(block);
         if (nextBlock) break;
      }
      if (nextBlock) {
         const b = structuredClone(nextBlock);
         utxoSet.handleNewlyMinedBlock(b);
         node.addBlock(b);
         const timeMinedMs = performance.now() - lastBtcMined;
         if (timeMinedMs > 15000 && eventInterval > 50) {
            eventInterval -= 50;
         }
         if (timeMinedMs < 15000 && eventInterval < 2000) {
            eventInterval += 50;
         }

         // console.log("timeMinedMs", timeMinedMs);
         // console.log("award addr", node.wallet.addr());
         // console.log("block mined", block);
         lastBtcMined = performance.now();
         bus.fire("fwdBlock", {
            block: structuredClone(b),
            fromAddr: node.wallet.addr(),
         });
      }
      isMining = false;
   };

   let gameLoaded = false;
   bus.on("gameLoaded", () => {
      lastBtcMined = performance.now();
      gameLoaded = true;
   });

   const electBtcMinerInterval = (() => {
      let startTick = 0;
      return {
         update: (t: PIXI.Ticker) => {
            if (!gameLoaded || isMining) return;
            if (startTick >= eventInterval) {
               // console.log("mining atempt");
               mineNextBtc();
               startTick = 0;
               return;
            }
            startTick += t.deltaMS;
         },
      };
   })();

   const update = (tick: PIXI.Ticker) => {
      electBtcMinerInterval.update(tick);
   };

   return { update };
};

export interface MineBtcSystem {
   update: (tick: PIXI.Ticker) => void;
}
