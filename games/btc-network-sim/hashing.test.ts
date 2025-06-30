import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils";
import { test } from "vitest";
import { standard } from "./util";

const hashStr = async (str: string) => {
   await new Promise((res) => setTimeout(res, 0));
   const hash = sha256(new TextEncoder().encode(str));
   return bytesToHex(hash);
};

test("simple hashing function", async () => {
   const startTime = performance.now();
   const word = "hashword";
   const problem = "0";
   for (let i = 0; i < 100; i++) {
      let nonce = 0;
      while (true) {
         const hash = await hashStr(`${nonce}${word}`);
         if (hash.startsWith(problem)) {
            // console.log("\n--- Hashing Performance Test ---");
            // console.log(`hash: ${hash}`);
            break;
         }
         nonce++;
      }
   }

   const endTime = performance.now();
   const durationMs = endTime - startTime;

   console.log(`Target prefix: "${problem}"`);
   console.log(`Word used: "${word}"`);
   console.log(`Duration: ${durationMs.toFixed(2)} ms`);
});

test("ip random", () => {
   for (let i = 0; i < 100; i++) {
      const ip = standard.randomIp();
      console.log("ip:", ip);
   }
});
