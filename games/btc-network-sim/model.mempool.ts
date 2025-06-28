import type { BlockTx } from "./types";

export interface Mempool {
   clearTxs: () => void;
   getAllTxs: () => BlockTx[];
   add: (tx: BlockTx) => number;
}

export const createMempool = (): Mempool => {
   const txs: BlockTx[] = [];

   return {
      clearTxs: () => {
         txs.length = 0;
      },
      getAllTxs: () => txs,
      add: (tx: BlockTx) => txs.push(tx),
   };
};
