import type * as PIXI from "pixi.js";
import { bus } from "./main";
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
   let eventInterval = 3500;

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
      for (let i = 0; i < 100; i++) {
         if (i % 2 === 1) await sleep(0);
         nextBlock = node.miner.mineNextBlock(block);
         if (nextBlock) break;
      }
      if (nextBlock) {
         const b = structuredClone(nextBlock);
         utxoSet.handleNewlyMinedBlock(b);
         node.addBlock(b);
         const timeMinedMs = performance.now() - lastBtcMined;
         if (timeMinedMs > 15000 && eventInterval > 500) {
            eventInterval -= 500;
         }
         if (timeMinedMs < 15000 && eventInterval < 20000) {
            eventInterval += 500;
         }

         console.log("award addr", node.wallet.addr());
         console.log("block mined", block);
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
               startTick += t.deltaMS;
               return;
            }
            startTick = 0;
            console.log("mining atempt");
            mineNextBtc();
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
