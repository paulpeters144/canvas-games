import type { BlockTx } from "./types";

export interface Mempool {
   clearTxs: () => void;
   getAllTxs: () => BlockTx[];
   add: (tx: BlockTx) => boolean;
   remove: (tx: BlockTx) => boolean;
   hasTx: (tx: BlockTx) => boolean;
}

export const createMempool = (): Mempool => {
   let txs: BlockTx[] = [];
   return {
      clearTxs: () => {
         txs.length = 0;
      },
      hasTx: (tx: BlockTx) => txs.some((t) => t.hash === tx.hash),
      remove: (tx: BlockTx) => {
         if (!txs.some((t) => t.hash === tx.hash)) {
            return false;
         }
         txs = txs.filter((t) => t.hash !== tx.hash);
         return true;
      },
      getAllTxs: () => txs,
      add: (tx: BlockTx) => {
         if (txs.some((t) => t.hash === tx.hash)) {
            return false;
         }
         txs.push(tx);
         return true;
      },
   };
};
