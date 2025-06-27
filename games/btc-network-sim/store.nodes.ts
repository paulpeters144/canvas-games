import type { BtcNode } from "./model.btc-node";

export interface NodeStore {
   push: (node: BtcNode) => number;
   pop: () => BtcNode | undefined;
   count: () => number;
   data: () => BtcNode[];
}

export const createNodeStore = (): NodeStore => {
   const cache: BtcNode[] = [];

   return {
      push: (node: BtcNode) => cache.push(node),
      pop: () => cache.pop(),
      count: () => cache.length,
      data: () => cache,
   };
};
