import type { Block, BlockTx, UTXO } from "./types";
import { standard, validate } from "./util";

export const createBlockchain = () => {
   const blocks: Block[] = [];

   const addBlock = (block: Block): boolean => {
      for (const tx of block.transactions) {
         if (!validate.txSig(tx)) {
            return false;
         }
         if (!validate.txHash(tx)) {
            return false;
         }
      }

      if (!validate.headerOf(block)) return false;

      if (blocks.length === 0) {
         blocks.push(block);
         return true;
      }

      const prevHash = blocks[blocks.length - 1].hash;
      if (prevHash === block.header.previousBlockHash) {
         blocks.push(block);
         return true;
      }

      return false;
   };

   const createEmptyBlock = (txs: BlockTx[]) => {
      const bLen = blocks.length;
      const lastBlock = bLen > 0 ? blocks[bLen - 1] : undefined;
      const b: Block = {
         hash: "",
         height: 0,
         header: {
            previousBlockHash: lastBlock?.hash || "",
            merkleRoot: standard.getMerkleRoot(txs.map((t) => t.hash)),
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
