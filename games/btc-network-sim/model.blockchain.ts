import type { BlockTx, BtcBlock, UTXO } from "./types";
import { standard } from "./util";

export interface Blockchain {
   addBlock: (block: BtcBlock) => boolean;
   createEmptyBlock: (props: { txs: BlockTx[]; difficulty?: number }) => BtcBlock;
   getUtxoRewardFrom: (b: BtcBlock) => UTXO[];
   blocks: () => BtcBlock[];
}

export const createBlockchain = (): Blockchain => {
   const blocks: BtcBlock[] = [];
   const blockHashSet = new Set<string>();

   const addBlock = (block: BtcBlock): boolean => {
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

      // if (!validate.headerOf(block)) return false;

      // if (blocks.length === 0) {
      //    blocks.push(block);
      //    blockHashSet.add(block.hash);
      //    return true;
      // }

      // const prevHash = blocks[blocks.length - 1].hash;
      // if (prevHash === block.header.previousBlockHash) {
      //    blockHashSet.add(block.hash);
      //    blocks.push(block);
      //    return true;
      // }

      // return false;
      blockHashSet.add(block.hash);
      blocks.push(block);
      return true;
   };

   const createEmptyBlock = (props: { txs: BlockTx[]; difficulty?: number }) => {
      const { txs, difficulty = 1 } = props;
      const bLen = blocks.length;
      const lastBlock = bLen > 0 ? blocks[bLen - 1] : undefined;

      const b: BtcBlock = {
         hash: "",
         height: 0,
         header: {
            previousBlockHash: lastBlock?.hash || "",
            merkleRoot: "",
            timestamp: 0,
            nonce: 0,
         },
         transactionCount: 0,
         difficulty: difficulty,
         confirmations: 0,
         rewardAmount: "50.00000000",
         rewardFees: txs
            .map((t) => Number.parseFloat(t.fee))
            .reduce((a, c) => a + c, 0)
            .toFixed(8),
         minerRewardAddress: "",
         transactions: txs,
      };
      return b;
   };

   const getUtxoRewardFrom = (b: BtcBlock): UTXO[] => {
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
