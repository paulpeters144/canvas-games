import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils";
import { hexToBytes } from "@noble/hashes/utils";
import type { BlockTx, PreSignedTx } from "./types";

export const standard = {
   idStr: () => crypto.randomUUID().replaceAll("-", "").slice(0, 25),
   numAsStr: (num: number) => {
      return num.toFixed(8);
   },
   hash: (v: unknown) => {
      // objects may not work here because the objects will need to have deterministic props
      // hopefully the props stay in order
      const value = typeof v === "object" ? JSON.stringify(v) : `${v}`;
      const dataBytes = new TextEncoder().encode(value);
      const hashBytes = sha256(dataBytes);
      const result = bytesToHex(hashBytes);
      return result;
   },
   round: (num: number) => Math.round(num * 1000000000) / 1000000000,
};

export const validate = {
   signature: (tx: BlockTx) => {
      const sigObj = secp256k1.Signature.fromDER(tx.sig);
      const publicKey = hexToBytes(tx.pubKey);
      const nonSigTx: PreSignedTx = { ...tx };
      // @ts-ignore
      // biome-ignore lint/performance/noDelete: <explanation>
      delete nonSigTx.sig;
      // @ts-ignore
      // biome-ignore lint/performance/noDelete: <explanation>
      delete nonSigTx.hash;
      const str = JSON.stringify(nonSigTx);
      const messageHash = sha256(new TextEncoder().encode(str));
      const isValid = secp256k1.verify(sigObj, messageHash, publicKey);
      return isValid;
   },
   hash: (tx: BlockTx) => {
      const txHash = tx.hash;
      const test: unknown = tx;
      // @ts-ignore
      // biome-ignore lint/performance/noDelete: <explanation>
      delete test.hash;
      const validatedHash = standard.hash(tx);
      const isValid = txHash === validatedHash;
      return isValid;
   },
};

export const randNum = (props: {
   min: number;
   max: number;
   decimal?: boolean;
}): number => {
   const { min, max, decimal = false } = props;
   const baseRand = Math.random() * (max - min + 1) + min;
   return decimal ? baseRand : Math.floor(baseRand);
};
