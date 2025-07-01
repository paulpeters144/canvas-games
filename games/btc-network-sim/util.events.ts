import type { BlockTx } from "./types";

export type EventMap = {
   zoom: "in" | "out" | "reset";
   node: { count: number };
   randSend: { fromId: string; toId: string; units: number };
   msgAtDest: { startId: string; endId: string };
   newTx: { originId: string; tx: BlockTx };
   wheel: "in" | "out";
};
