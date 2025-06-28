import type { BlockTx } from "./types";

export interface Mempool {
   clearTxs: () => void;
   getAllTxs: () => BlockTx[];
   add: (tx: BlockTx) => number;
   hasTx: (tx: BlockTx) => boolean;
}

export const createMempool = (): Mempool => {
   const txs: BlockTx[] = [];

   return {
      clearTxs: () => {
         txs.length = 0;
      },
      hasTx: (tx: BlockTx) => txs.some((t) => t.hash === tx.hash),
      getAllTxs: () => txs,
      add: (tx: BlockTx) => txs.push(tx),
   };
};
