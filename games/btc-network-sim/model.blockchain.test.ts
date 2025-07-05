import { test } from "vitest";
import { createBlockchain } from "./model.blockchain";
import { createMiner } from "./model.btc-miner";
import { createBtcWallet } from "./model.wallet";
import type { Block, BlockTx, UTXO } from "./types";
import { standard, validate } from "./util";

test("simple btc tx example", () => {
   const wallet1 = createBtcWallet();
   const wallet2 = createBtcWallet();

   const utxos: UTXO[] = Array.from({ length: 15 }).map((_, i) => {
      return {
         id: standard.idStr(),
         value: standard.numAsStr(i + 1),
         owner: "",
      };
   });
   wallet1.setUTXOs(utxos);
   console.log("w1 bal: ", wallet1.balance());

   const transaction = wallet1.createTx({
      units: 34.23942983,
      recAddr: wallet2.addr(),
   });

   console.log(JSON.stringify(transaction, null, 2));

   if (!validate.txSig(transaction)) throw Error();
   if (!validate.txHash(transaction)) throw Error();

   console.log("w1 bal: ", wallet1.balance());

   const txFee = Number(transaction.fee);
   const txOutputs = transaction.outputs.reduce((a, c) => a + Number(c.value), 0);
   console.log(
      "all val:",
      wallet1.balance() + wallet2.balance() + txFee + txOutputs,
   );
});

test("validate merkle root", () => {
   const wallet1 = createBtcWallet();
   const wallet2 = createBtcWallet();

   const utxos: UTXO[] = Array.from({ length: 15 }).map((_, i) => {
      return {
         id: standard.idStr(),
         value: standard.numAsStr(i + 1),
         owner: "",
      };
   });
   wallet1.setUTXOs(utxos);

   const txArr: BlockTx[] = [];
   Array.from({ length: 10 }).map(() => {
      const transaction = wallet1.createTx({
         units: 0.1,
         recAddr: wallet2.addr(),
      });

      if (!validate.txSig(transaction)) throw Error();
      if (!validate.txHash(transaction)) throw Error();
      txArr.push(transaction);
   });

   const txHashes = txArr.map((t) => t.hash);
   const merkleRoot = standard.getMerkleRoot(txHashes);
   console.log(merkleRoot);
});

test("test mining blocks", () => {
   const wallet1 = createBtcWallet();
   const miner = createMiner(wallet1);
   const blockChain = createBlockchain();

   miner.setNextBlockToMine(blockChain.createEmptyBlock([]));
   let gBlock: Block | undefined;
   let nonce = 0;
   do {
      gBlock = miner.minGenesisBlock(nonce++);
   } while (!gBlock);
   console.log("genesis block", gBlock);

   blockChain.addBlock(gBlock);

   miner.setNextBlockToMine(blockChain.createEmptyBlock([]));
   let nextBlock: Block | undefined;
   nonce = 0;
   do {
      nextBlock = miner.minGenesisBlock(nonce++);
   } while (!nextBlock);
   console.log("next block", nextBlock);
});
