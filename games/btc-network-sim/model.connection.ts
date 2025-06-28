import type { BtcNode } from "./model.btc-node";
import type { BlockTx } from "./types";

export type BroadcastMsg =
   | {
        type: "tx";
        obj: BlockTx;
        fromId: string;
     }
   | {
        type: "block";
        obj: null;
        fromId: string;
     };

export interface NodeConnections {
   connect: (node: BtcNode) => void;
   disconnect: () => void;
   connectCount: () => number;
   isConnectedTo: (node: BtcNode) => boolean;
   getAll: () => BtcNode[];
   sendBroadcast: (msg: BroadcastMsg) => void;
}

export const createConnections = (id: string): NodeConnections => {
   const nodeConnections = new Map<string, BtcNode>();

   const connect = (node: BtcNode) => {
      if (node.id() === id) return;
      if (nodeConnections.has(node.id())) return;

      nodeConnections.set(node.id(), node);
   };

   const disconnect = () => {
      nodeConnections.clear();
   };

   const connectCount = () => {
      return nodeConnections.size;
   };

   const isConnectedTo = (node: BtcNode) => nodeConnections.has(node.id());

   const getAll = () => {
      const result = [];
      for (const n of nodeConnections.values()) result.push(n);
      return result;
   };

   const sendBroadcast = (msg: BroadcastMsg) => {
      for (const n of getAll()) {
         if (n.id() === msg.fromId) continue;
         n.receiveMsg(msg);
      }
   };

   return {
      connect,
      disconnect,
      connectCount,
      isConnectedTo,
      getAll,
      sendBroadcast,
   };
};
