import { secp256k1 } from "@noble/curves/secp256k1";
import { ripemd160 } from "@noble/hashes/legacy";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils";
import { bech32 } from "bech32";
import type { BlockTx, PreSignedTx, UTXO } from "./types";
import { standard } from "./util";

export const createBtcWallet = (): BtcWallet => {
   const privKey = secp256k1.utils.randomPrivateKey();
   const pubKey = secp256k1.getPublicKey(privKey, true);
   const pubKeyStr = bytesToHex(pubKey);

   let utxoArr: UTXO[] = [];

   const sum = (arr: number[]) => {
      let result = 0;
      for (let i = 0; i < arr.length; i++) result += arr[i];
      return standard.round(result);
   };

   const balance = () => sum(utxoArr.map((u) => Number(u.value)));

   const addr = (() => {
      const pubKeyHash = ripemd160(sha256(pubKey));
      const words = bech32.toWords(pubKeyHash);
      words.unshift(0x00);
      const result = bech32.encode("tb", words);
      return `addr${result}`;
   })();

   const getNextClosestUTXO = (value: number): UTXO | undefined => {
      let result: UTXO | undefined = undefined;
      for (const current of utxoArr) {
         if (!result) {
            result = current;
            continue;
         }
         const resDistance = Math.abs(value - Number(result.value));
         const curDistance = Math.abs(value - Number(current.value));
         if (curDistance < resDistance) {
            result = current;
         }
      }
      return result;
   };

   const calcFee = (units: number) => units * 0.0012345;

   const sign = (tx: PreSignedTx) => {
      const str = JSON.stringify(tx);
      const hash = sha256(new TextEncoder().encode(str));
      const sig = secp256k1.sign(hash, privKey).toDERRawBytes();
      const result = bytesToHex(sig);
      return result;
   };

   const createTx = (props: { units: number; recAddr: string }): BlockTx => {
      const { units, recAddr } = props;

      const fee = calcFee(units);
      if (balance() < units + fee) {
         const message = `NSF ERROR\naddr: ${addr}\n balance: ${balance()}`;
         throw new Error(message);
      }
      utxoArr.sort((a, b) => Number(a.value) - Number(b.value));

      const inputs: UTXO[] = [];
      const sumOfNextInputs = () => sum(inputs.map((u) => Number(u.value)));
      while (sumOfNextInputs() < units + fee) {
         const neededAmount = units - sumOfNextInputs();
         const utxo = getNextClosestUTXO(neededAmount);
         if (!utxo) throw new Error("unknown reason utxo not found :(");
         utxoArr = utxoArr.filter((u) => u.id !== utxo.id);
         inputs.push(utxo);
      }

      const result: PreSignedTx = {
         inputs: inputs,
         outputs: [
            {
               id: standard.idStr(),
               value: standard.numAsStr(units),
               owner: recAddr,
            },
         ],
         pubKey: pubKeyStr,
         fee: standard.numAsStr(fee),
      };

      const valUsed = inputs.map((i) => Number(i.value)).reduce((a, c) => a + c);

      const rebateValue = valUsed - (units + fee);

      if (rebateValue > 0) {
         result.outputs.push({
            id: standard.idStr(),
            value: standard.numAsStr(rebateValue),
            owner: addr,
         });
      }

      const signature = sign(result);
      const tx = { ...result, sig: signature };
      const txHash = standard.hash(tx);
      const blockTransactions: BlockTx = { ...tx, hash: txHash };
      return blockTransactions;
   };

   const setUTXOs = (utxos: UTXO[]) => {
      utxoArr.length = 0;
      utxos.map((u) => {
         u.owner = addr;
         utxoArr.push(u);
      });
   };

   const splitUTXOs = (props: { units: number; to: number }) => {
      const { units, to } = props;
      const fee = calcFee(units);
      const unitsMinusFee = units - fee;

      const inputs: UTXO[] = [];
      const sumOfNextInputs = () => sum(inputs.map((u) => Number(u.value)));
      while (sumOfNextInputs() < unitsMinusFee + fee) {
         const neededAmount = unitsMinusFee - sumOfNextInputs();
         const utxo = getNextClosestUTXO(neededAmount);
         if (!utxo) {
            throw new Error("unknown reason utxo not found :(");
         }
         utxoArr = utxoArr.filter((u) => u.id !== utxo.id);
         inputs.push(utxo);
      }

      const outputs: UTXO[] = [];
      const amountEachTx = standard.round(unitsMinusFee / to);
      Array.from({ length: to }).map(() =>
         outputs.push({
            id: standard.idStr(),
            value: standard.numAsStr(amountEachTx),
            owner: addr,
         }),
      );

      const result: PreSignedTx = {
         inputs: inputs,
         outputs: outputs,
         pubKey: pubKeyStr,
         fee: standard.numAsStr(fee),
      };

      const valUsed = inputs.map((i) => Number(i.value)).reduce((a, c) => a + c);
      const rebateValue = valUsed - (unitsMinusFee + fee);
      if (rebateValue > 0) {
         result.outputs.push({
            id: standard.idStr(),
            value: standard.numAsStr(rebateValue),
            owner: addr,
         });
      }

      const signature = sign(result);
      const tx = { ...result, sig: signature };
      const txHash = standard.hash(tx);
      const blockTransactions: BlockTx = { ...tx, hash: txHash };
      return blockTransactions;
   };

   return {
      addr: () => addr,
      pubKey: () => pubKeyStr,
      utxos: () => utxoArr,
      setUTXOs,
      balance,
      createTx,
      splitUTXOs,
   };
};

export interface BtcWallet {
   addr: () => string;
   pubKey: () => string;
   utxos: () => UTXO[];
   setUTXOs: (utxo: UTXO[]) => void;
   balance: () => number;
   createTx: ({
      units,
      recAddr,
   }: {
      units: number;
      recAddr: string;
   }) => BlockTx;
   splitUTXOs: (props: { units: number; to: number }) => BlockTx;
}
