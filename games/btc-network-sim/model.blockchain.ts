import type { Block, BlockTx, UTXO } from "./types";
import { standard, validate } from "./util";

export interface Blockchain {
   addBlock: (block: Block) => boolean;
   createEmptyBlock: (txs: BlockTx[]) => Block;
   getUtxoRewardFrom: (b: Block) => UTXO[];
   blocks: () => Block[];
}

export const createBlockchain = (): Blockchain => {
   const blocks: Block[] = [];
   const blockHashSet = new Set<string>();

   const addBlock = (block: Block): boolean => {
      if (blockHashSet.has(block.hash)) return false;

      // skipping this portion because it takes up too much computer for handling up to 127 nodes
      // and each of them have to validate all the txs. If we we're working with 1 node, it'd be fine.
      // for (const tx of block.transactions) {
      //    if (!validate.txSig(tx)) {
      //       return false;
      //    }
      //    if (!validate.txHash(tx)) {
      //       return false;
      //    }
      // }

      if (!validate.headerOf(block)) return false;
      if (blocks.length === 0) {
         blocks.push(block);
         return true;
      }

      const prevHash = blocks[blocks.length - 1].hash;
      if (prevHash === block.header.previousBlockHash) {
         blockHashSet.add(block.hash);
         blocks.push(block);
         return true;
      }

      return false;
   };

   const createEmptyBlock = (txs: BlockTx[]) => {
      const bLen = blocks.length;
      const lastBlock = bLen > 0 ? blocks[bLen - 1] : undefined;
      const txHashes = txs.map((t) => t.hash);
      const b: Block = {
         hash: "",
         height: 0,
         header: {
            previousBlockHash: lastBlock?.hash || "",
            merkleRoot: standard.getMerkleRoot(txHashes),
            timestamp: 0,
            nonce: 0,
         },
         transactionCount: 0,
         difficulty: 2,
         confirmations: 0,
         rewardAmount: "50.00000000",
         rewardFees: "0",
         minerRewardAddress: "",
         transactions: txs,
      };
      return b;
   };

   const getUtxoRewardFrom = (b: Block): UTXO[] => {
      const mineReward = {
         id: standard.idStr(),
         value: b.rewardAmount,
         owner: b.minerRewardAddress,
      };
      if (b.transactions.length === 0) {
         return [mineReward];
      }
      const feeReward = {
         id: standard.idStr(),
         value: b.rewardFees,
         owner: b.minerRewardAddress,
      };
      return [mineReward, feeReward];
   };

   return {
      addBlock,
      createEmptyBlock,
      getUtxoRewardFrom,
      blocks: () => blocks,
   };
};
