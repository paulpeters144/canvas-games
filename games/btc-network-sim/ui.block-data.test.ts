import { test } from "vitest";
import { normalizeJsonStr } from "./ui.block-data";

const exampleJson = `
{
  "hash": "00000000000000000007890abcdef1234567890abcdef1234567890abcdef",
  "height": 790000,
  "header": {
    "previousBlockHash": "00000000000000000006789abcdef1234567890abcdef1234567890abcdef",
    "merkleRoot": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    "timestamp": 1678886400,
    "nonce": 1234567890
  },
  "transactionCount": 2500,
  "difficulty": 28000000000000,
  "confirmations": 100,
  "rewardAmount": "6.25000000",
  "rewardFees": "0.12345678",
  "minerRewardAddress": "bc1qxyzabcde01234567890abcdef01234567890abcdef01234567890",
  "transactions": [
    {
      "id": "tx1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      "fee": "0.00001234"
    },
    {
      "fee": "0.00000500",
      "id": "txabcdef01234567890r2234567890abcdef"
    }
  ]
}
`.trim();

test("normalizeJsonString", () => {
   const result = normalizeJsonStr(exampleJson);
   console.log(result);
});
