import type { NodeStore } from "./store.nodes";
import type { Block, UTXO } from "./types";
import { standard } from "./util";

export interface UTXOSet {
   data: () => UTXO[];
   handleNewlyMinedBlock: (b: Block) => void;
}

export const createUtxoSet = (store: NodeStore): UTXOSet => {
   let globalSet: UTXO[] = [];
   const handleNewlyMinedBlock = (b: Block) => {
      for (const tx of b.transactions) {
         const inputIds = new Set(tx.inputs.map((i) => i.id));
         globalSet = globalSet.filter((u) => !inputIds.has(u.id));
         globalSet.push(...tx.outputs);
      }

      if (Number.parseFloat(b.rewardAmount) > 0) {
         globalSet.push({
            id: standard.idStr(),
            value: b.rewardAmount,
            owner: b.minerRewardAddress,
         });
      }

      if (Number.parseFloat(b.rewardFees) > 0) {
         globalSet.push({
            id: standard.idStr(),
            value: b.rewardAmount,
            owner: b.minerRewardAddress,
         });
      }

      for (const node of store.allData()) {
         const ownedUTXOs = globalSet.filter((u) => u.owner === node.wallet.addr());
         // if we need to break up UTXOs, like if the wallet has like only 10, we can
         // break that up to 100 of them, maybe.
         node.wallet.setUTXOs(ownedUTXOs);
      }
   };

   return {
      data: () => globalSet,
      handleNewlyMinedBlock,
   };
};
