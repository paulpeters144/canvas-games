import type { BlockTx, BtcBlock, UTXO } from "./types";
import { standard } from "./util";

// if you're reading this, you may be wondering: "why there is a global blockchain?"
// and if you also thinking: "this defeats the purpose of having a decentralized ledger,"
// then you'd be correct. however, let's remember, this application is a "SIMULATION"
// which means it's not the real thing. there are big memory issues setting up
// a blockchain for 100+ nodes as you can image. so this is cheating but it's
// cheating to give your web browser and its resources a break.

const globalBlockchain = (() => {
   const baseStoreKey = "blockchain";
   let chunkCount = 0;
   const blockHashSet = new Set<string>();
   const blocksHashArr: string[] = [];
   localStorage.clear();

   const _getLastChunkKey = () => {
      return `${baseStoreKey}:${chunkCount}`;
   };

   const _tooLarge = (blocks: BtcBlock[]) => {
      const str = JSON.stringify(blocks);
      const result = str.length > 75_000;
      return result;
   };

   const _getChunkData = (idx: number): BtcBlock[] => {
      try {
         const key = `${baseStoreKey}:${idx}`;
         const str = localStorage.getItem(key);
         if (str) {
            const result = JSON.parse(str) as BtcBlock[];
            return result;
         }
      } catch (e) {
         console.error("error getting stored blocks", e);
      }

      return [];
   };

   const getStoredBlocks = () => {
      const result: BtcBlock[] = [];
      try {
         for (let i = 0; i <= chunkCount; i++) {
            const blockChunk = _getChunkData(i);
            result.push(...blockChunk);
         }
      } catch (e) {
         console.error("error getting stored blocks", e);
      }

      return result;
   };

   const addBlock = (block: BtcBlock): boolean => {
      const slicedHash = block.hash.slice(0, 20);
      if (blockHashSet.has(slicedHash)) return false;
      blockHashSet.add(slicedHash);
      blocksHashArr.push(slicedHash);

      try {
         const lastChunk = _getChunkData(chunkCount);
         if (!_tooLarge([...lastChunk, block])) {
            lastChunk.push(block);
            const key = _getLastChunkKey();
            const data = JSON.stringify(lastChunk);
            localStorage.setItem(key, data);
         } else {
            chunkCount++;
            const key = _getLastChunkKey();
            const data = JSON.stringify([block]);
            localStorage.setItem(key, data);
         }
      } catch (e) {
         console.error("Error saving blockchain to localStorage:", e);
         return false;
      }

      return true;
   };

   return {
      addBlock,
      blocks: () => getStoredBlocks(),
      indexOf: (block: BtcBlock) => {
         for (let i = 0; i < blocksHashArr.length; i++) {
            const hashPrefix = blocksHashArr[i];
            if (block.hash.startsWith(hashPrefix)) return i;
         }
         return -1;
      },
   };
})();

export const createBlockchain = (): Blockchain => {
   const blockHashSet = new Set<string>();

   const addBlock = (block: BtcBlock): boolean => {
      const slicedHash = block.hash.slice(0, 20);
      if (blockHashSet.has(slicedHash)) return false;
      blockHashSet.add(slicedHash);

      // skipping this portion because it takes up too much compute for 100+ nodes
      // and each of them have to validate all the txs. If we we're working with 1
      // node, it'd be fine.

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
      globalBlockchain.addBlock(block);
      return true;
   };

   const createEmptyBlock = (props: { txs: BlockTx[]; difficulty?: number }) => {
      const { txs, difficulty = 1 } = props;
      const blocks = globalBlockchain.blocks();
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

   const getBlockData = (q: BlockQuery) => {
      const all = globalBlockchain.blocks();
      if (q.type === "head") {
         const block = all[all.length - 1];
         const hasPrev = globalBlockchain.indexOf(block) > 0;
         return { block, hasNext: false, hasPrev };
      }
      if (q.type === "exact") {
         const { hash: h } = q;
         const block = all.find((b) => b.hash === q.hash);
         if (!block) throw new Error(`counld not find block: ${h}`);
         const idxOfBlock = globalBlockchain.indexOf(block);
         const hasPrev = idxOfBlock > 0;
         const hasNext = idxOfBlock < all.length - 1;
         return { block, hasNext, hasPrev };
      }
      if (q.type === "prev") {
         const { hash: h } = q;
         const childHash =
            all.find((b) => b.hash === h)?.header.previousBlockHash || "";
         const block = all.find((b) => b.hash === childHash);
         if (!block) throw new Error(`counld not find block: ${h}`);
         const idxOfBlock = globalBlockchain.indexOf(block);
         const hasPrev = idxOfBlock > 0;
         const hasNext = idxOfBlock < all.length - 1;
         return { block, hasNext, hasPrev };
      }
      if (q.type === "next") {
         const { hash: h } = q;
         const prevBlock = (b: BtcBlock) => b.header.previousBlockHash === h;
         const prevBlockHash = all.find(prevBlock)?.hash || "";
         const block = all.find((b) => b.hash === prevBlockHash);
         if (!block) {
            throw new Error(`counld not find block: ${h}`);
         }
         const idxOfBlock = globalBlockchain.indexOf(block);
         const hasPrev = idxOfBlock > 0;
         const hasNext = idxOfBlock < all.length - 1;
         return { block, hasNext, hasPrev };
      }
      throw new Error(`unknown block query ${JSON.stringify(q)}`);
   };

   return {
      addBlock,
      createEmptyBlock,
      getUtxoRewardFrom,
      blocks: () => globalBlockchain.blocks(),
      getBlockData,
   };
};

export interface Blockchain {
   addBlock: (block: BtcBlock) => boolean;
   createEmptyBlock: (props: {
      txs: BlockTx[];
      difficulty?: number;
   }) => BtcBlock;
   getUtxoRewardFrom: (b: BtcBlock) => UTXO[];
   blocks: () => BtcBlock[];
   getBlockData: (q: BlockQuery) => {
      block: BtcBlock;
      hasNext: boolean;
      hasPrev: boolean;
   };
}

export type BlockQuery =
   | {
        type: "head";
     }
   | {
        type: "exact";
        hash: string;
     }
   | {
        type: "prev";
        hash: string;
     }
   | {
        type: "next";
        hash: string;
     };
