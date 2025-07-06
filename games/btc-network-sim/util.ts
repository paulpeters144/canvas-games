import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils";
import { hexToBytes } from "@noble/hashes/utils";
import type { Block, BlockTx } from "./types";

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
   getMerkleRoot: (hashes: string[]): string => {
      if (hashes.length === 0) return standard.hash("notxs");
      if (hashes.length === 1) return standard.hash(hashes[0]);
      const nextHashesArr: string[] = [];
      for (let i = 0; i < hashes.length; i += 2) {
         let concatHash = "";
         if (i === hashes.length - 1) {
            concatHash = hashes[i];
         } else {
            concatHash = `${hashes[i]}${hashes[i + 1]}`;
         }
         nextHashesArr.push(standard.hash(concatHash));
      }
      return standard.getMerkleRoot(nextHashesArr);
   },
   hashBlock: (b: Block) => {
      const prevHash = b.header.previousBlockHash;
      const merkRoot = b.header.merkleRoot;
      const time = b.header.timestamp;
      const nonce = b.header.nonce;
      const hash = b.header.previousBlockHash
         ? standard.hash(`${prevHash}${merkRoot}${time}${nonce}`)
         : standard.hash(`${merkRoot}${time}${nonce}`);
      return hash;
   },
   round: (num: number) => Math.round(num * 1000000000) / 1000000000,
   randomIp: () => {
      const isPrivate = (ip: string): boolean => {
         const [a, b] = ip.split(".").map(Number);

         if (a === 10) return true;
         if (a === 172 && b >= 16 && b <= 31) return true;
         if (a === 192 && b === 168) return true;

         return false;
      };
      const newRandomIp = () => {
         const first = randNum({ min: 65, max: 172 });
         const second = randNum({ min: 20, max: 256 });
         const third = randNum({ min: 20, max: 256 });
         const fourth = randNum({ min: 20, max: 256 });
         return `${first}.${second}.${third}.${fourth}`;
      };
      let ip: string | undefined = undefined;
      do {
         ip = newRandomIp();
      } while (isPrivate(ip));
      return ip;
   },
};

const textEncoder = new TextEncoder();
export const validate = {
   txSig: (tx: BlockTx) => {
      // const copy = structuredClone(tx);
      // const sigObj = secp256k1.Signature.fromDER(copy.sig);
      // // @ts-ignore
      // // biome-ignore lint/performance/noDelete: <explanation>
      // delete copy.sig;
      // // @ts-ignore
      // // biome-ignore lint/performance/noDelete: <explanation>
      // delete copy.hash;
      // const publicKey = hexToBytes(copy.pubKey);
      // const str = JSON.stringify(copy);
      // const messageHash = sha256(new TextEncoder().encode(str));
      // const isValid = secp256k1.verify(sigObj, messageHash, publicKey);
      // return isValid;
      const { sig, hash, ...txData } = tx; // Avoid clone + delete
      const sigObj = secp256k1.Signature.fromDER(sig);
      const publicKey = hexToBytes(tx.pubKey);
      const str = JSON.stringify(txData);
      const messageHash = sha256(textEncoder.encode(str));
      return secp256k1.verify(sigObj, messageHash, publicKey);
   },
   txHash: (tx: BlockTx) => {
      // const copy = structuredClone(tx);
      // const txHash = copy.hash;
      // const test: unknown = copy;
      // // @ts-ignore
      // // biome-ignore lint/performance/noDelete: <explanation>
      // delete test.hash;
      // const validatedHash = standard.hash(copy);
      // const isValid = txHash === validatedHash;
      // return isValid;

      const { hash, ...txData } = tx; // Avoid clone + delete
      const validatedHash = standard.hash(txData);
      return tx.hash === validatedHash;
   },
   headerOf: (block: Block) => {
      const txHashes = block.transactions.map((t) => t.hash);
      const validatedMerkleRoot = standard.getMerkleRoot(txHashes);
      if (validatedMerkleRoot !== block.header.merkleRoot) return false;

      const validatedBlockHash = standard.hashBlock(block);
      if (validatedBlockHash !== block.hash) return false;
      return true;
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

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
