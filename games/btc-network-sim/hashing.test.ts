import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils";
import { test } from "vitest";

test("simple hashing function", async () => {
   const word = "hashword";
   const problem = "00";
   let nonce = 0;
   const startTime = performance.now();
   while (true) {
      const hash = await hashStr(`${nonce}${word}`);
      if (hash.startsWith(problem)) {
         console.log("\n--- Hashing Performance Test ---");
         console.log(`hash: ${hash}`);
         break;
      }
      nonce++;
   }
   const endTime = performance.now();
   const durationMs = endTime - startTime;

   console.log(`Target prefix: "${problem}"`);
   console.log(`Word used: "${word}"`);
   console.log(`Duration: ${durationMs.toFixed(2)} ms`);
   console.log(`Nonce: ${nonce}`);
   console.log(`Hashes per second: ${(nonce / (durationMs / 1000)).toFixed(2)}`);
});

const hashStr = async (str: string) => {
   await new Promise((res) => setTimeout(res, 0));
   const hash = sha256(new TextEncoder().encode(str));
   return bytesToHex(hash);
};
