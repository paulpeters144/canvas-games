import type { BlockTx, BtcBlock } from "./types";

export type EventMap = {
   node: { count: number };
   randSend: { fromId: string; toId: string; units: number };
   msgAtDest: { startId: string; endId: string };
   newTx: { originId: string; tx: BlockTx };
   wheel: "down" | "up";
   focusNode: { isFocused: true; ip: string } | { isFocused: false };
   gameLoaded: boolean;
   fwdBlock: { block: BtcBlock; fromAddr: string };
   nodeIdx: { direction: "left" | "right"; ip: string };
};
