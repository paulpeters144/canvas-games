import type { BlockTx } from "./types";

export type EventMap = {
   node: { count: number };
   randSend: { fromId: string; toId: string; units: number };
   msgAtDest: { startId: string; endId: string };
   newTx: { originId: string; tx: BlockTx };
   wheel: "in" | "out";
   focusNode: { ip: string; isFocused: boolean };
};
