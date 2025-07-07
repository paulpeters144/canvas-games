import type { BlockTx } from "./types";

export interface Mempool {
   clearTxs: () => void;
   getAllTxs: () => BlockTx[];
   add: (tx: BlockTx) => boolean;
   remove: (tx: BlockTx) => boolean;
   hasTx: (tx: BlockTx) => boolean;
   toJsonStr: () => string;
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
      toJsonStr: () => dummyJson(),
   };
};

const dummyJson = () => {
   return `{
  "inputs": [
    {
      "id": "utxo-abc123def456",
      "value": "50000000",
      "owner": "alice_address_xyz"
    },
    {
      "id": "utxo-ghi789jkl012",
      "value": "20000000",
      "owner": "alice_address_xyz"
    }
  ],
  "outputs": [
    {
      "id": "utxo-newTx123_0",
      "value": "60000000",
      "owner": "bob_address_pqr"
    },
    {
      "id": "utxo-newTx123_1",
      "value": "9990000",
      "owner": "alice_address_xyz"
    }
  ],
  "pubKey": "038e88e88e88e88e88e88e88e88e88e88e88e88e88e88e88e88e88e88e88e88e88",
  "fee": "10000",
  "sig": "3045022100a7b8f9d0c2e1d4b6a7c8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b02200a7b8f9d0c2e1d4b6a7c8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
  "hash": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
}`;
};
