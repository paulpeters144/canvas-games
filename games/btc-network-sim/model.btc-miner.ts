import type { BtcWallet } from "./model.wallet";
import type { BtcBlock } from "./types";
import { standard } from "./util";

export const createMiner = (wallet: BtcWallet): BtcMiner => {
   let nextBlockToMine: BtcBlock | undefined;
   let merkRoot = "";
   let nonce = 0;
   const setNextBlockToMine = (b: BtcBlock) => {
      nextBlockToMine = b;
      nextBlockToMine.transactionCount = b.transactions.length;
      const txHashes = b.transactions.map((t) => t.hash);
      merkRoot = standard.getMerkleRoot(txHashes);
      b.transactionCount = b.transactions.length;
      nonce = 0;
   };

   const mineNextBlock = (b: BtcBlock): BtcBlock | undefined => {
      if (!nextBlockToMine) {
         const err = "cannot mine without a block set";
         throw new Error(err);
      }

      const prevHash = b.header.previousBlockHash;
      if (!prevHash) throw new Error("must has prev hash to mine next block");
      const time = new Date().getTime();
      nonce++;
      const hash = standard.hash(`${prevHash}${merkRoot}${time}${nonce}`);

      const difficulty = "0".repeat(b.difficulty);

      if (hash.startsWith(difficulty)) {
         b.minerRewardAddress = wallet.addr();
         b.hash = hash;
         b.header.previousBlockHash = prevHash;
         b.header.merkleRoot = merkRoot;
         b.header.timestamp = time;
         b.header.nonce = nonce;
         return b;
      }

      return undefined;
   };

   const minGenesisBlock = (): BtcBlock | undefined => {
      if (!nextBlockToMine) {
         const err = "cannot mine without a block set";
         throw new Error(err);
      }

      const b = nextBlockToMine;

      const prevHash = b.header.previousBlockHash;
      const merkRoot = standard.getMerkleRoot([]);
      const time = new Date().getTime();
      nonce++;
      const hash = standard.hash(`${merkRoot}${time}${nonce}`);

      const difficulty = "0".repeat(b.difficulty);

      if (hash.startsWith(difficulty)) {
         b.minerRewardAddress = wallet.addr();
         b.header.merkleRoot = merkRoot;
         b.hash = hash;
         b.header.previousBlockHash = prevHash;
         b.header.timestamp = time;
         b.header.nonce = nonce;
         return b;
      }

      return undefined;
   };

   return {
      setNextBlockToMine,
      mineNextBlock,
      minGenesisBlock,
   };
};

export interface BtcMiner {
   setNextBlockToMine: (b: BtcBlock) => void;
   mineNextBlock: (b: BtcBlock) => BtcBlock | undefined;
   minGenesisBlock: () => BtcBlock | undefined;
}
