import { test } from "vitest";
import { createBtcWallet } from "./model.wallet";
import type { UTXO } from "./types";
import { standard, validate } from "./util";

test("simple btc tx example", () => {
   const wallet1 = createBtcWallet();
   const wallet2 = createBtcWallet();

   const utxos: UTXO[] = Array.from({ length: 15 }).map((_, i) => {
      return {
         id: standard.utxoId(),
         value: standard.numAsStr(i + 1),
         owner: "",
      };
   });
   wallet1.setNewUTXOs(utxos);
   console.log("w1 bal: ", wallet1.balance());

   const transaction = wallet1.createTx({
      units: 34.23942983,
      recAddr: wallet2.addr(),
   });

   console.log(JSON.stringify(transaction, null, 2));

   if (!validate.signature(transaction)) throw Error();
   if (!validate.hash(transaction)) throw Error();

   console.log("w1 bal: ", wallet1.balance());

   const txFee = Number(transaction.fee);
   const txOutputs = transaction.outputs.reduce((a, c) => a + Number(c.value), 0);
   console.log(
      "all val:",
      wallet1.balance() + wallet2.balance() + txFee + txOutputs,
   );
});
