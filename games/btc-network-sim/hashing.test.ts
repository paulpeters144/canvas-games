import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils";
import { test } from "vitest";
import { standard } from "./util";

interface hashStrProps {
   word: string;
   problem: string;
   startNonce: number;
   hashAmount: number;
}

interface hashStrResult {
   endNonce: number;
   solved: boolean;
   hash: string;
}

const hashStr = async (props: hashStrProps): Promise<hashStrResult> => {
   await new Promise((res) => setTimeout(res, 0));
   const { word, problem, startNonce, hashAmount } = props;

   let lastHash = "";
   let currentNonce: number = startNonce;
   while (currentNonce < startNonce + hashAmount) {
      const str = `${currentNonce}${word}`;
      const hash = sha256(new TextEncoder().encode(str));
      lastHash = bytesToHex(hash);

      if (lastHash.startsWith(problem)) break;

      currentNonce++;
   }

   return {
      endNonce: currentNonce,
      solved: lastHash.startsWith(problem),
      hash: lastHash,
   };
};

test("simple hashing function", async () => {
   const startTime = performance.now();
   const word = "hashword";
   const problem = "00000";
   let currentNonce = 0;
   let result: hashStrResult = { endNonce: 0, solved: false, hash: "" };
   for (let i = 0; i < 100; i++) {
      result = await hashStr({
         word,
         problem,
         startNonce: currentNonce,
         hashAmount: 1000000,
      });
      currentNonce = result.endNonce;
   }

   const endTime = performance.now();
   const durationMs = endTime - startTime;
   console.log(`solved: ${result.solved}`);
   console.log(`hashAmount: ${result.endNonce}`);
   console.log(`hash: ${result.hash}`);
   console.log(`Target prefix: "${problem}"`);
   console.log(`Word used: "${word}"`);
   console.log(`Duration: ${durationMs.toFixed(2)} ms`);
}, 1_000_000);

test("ip random", () => {
   for (let i = 0; i < 100; i++) {
      const ip = standard.randomIp();
      console.log("ip:", ip);
   }
});
