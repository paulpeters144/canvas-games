import * as PIXI from "pixi.js";
import { ZLayer } from "./game.enums";
import type { GameVars } from "./game.vars";
import {
   type BroadcastMsg,
   type NodeConnections,
   createConnections,
} from "./model.connection";
import { type Mempool, createMempool } from "./model.mempool";
import { type BtcWallet, createBtcWallet } from "./model.wallet";
import type { Position } from "./types";

interface BtcNodeProps {
   gameVars: GameVars;
   pos?: Position;
}

export interface BtcNode {
   id: () => string;
   setRunning: (valueChange: boolean) => void;
   createdAt: () => Date;
   destroy: () => void;
   toRect: () => PIXI.Rectangle;
   connections: () => NodeConnections;
   anim: PIXI.AnimatedSprite;
   sendBtc: (props: { units: number; node: BtcNode }) => void;
   receiveMsg: (msg: BroadcastMsg) => void;
   wallet: BtcWallet;
}

export const createBtcNode = (props: BtcNodeProps): BtcNode => {
   const { gameVars, pos } = props;
   const { game, assets } = gameVars;

   const createdAt = new Date();
   const id = crypto.randomUUID().replaceAll("-", "").slice(0, 15);
   const wallet: BtcWallet = createBtcWallet();
   const mempool: Mempool = createMempool();
   const connections: NodeConnections = createConnections(id);

   const width = 37;
   const height = 43;
   const frames = 5;
   const scale = 1.25;

   const texture = assets.getTexture("server-anim-coin");
   const offNode = assets.createSprite("server-off");
   offNode.texture.source.scaleMode = "nearest";
   offNode.visible = false;
   offNode.scale.set(scale);

   let buffer = 0;
   const textures = Array.from({ length: frames }, (_, i) => {
      const t = new PIXI.Texture({
         source: texture.source,
         frame: new PIXI.Rectangle(width * i + buffer, 0, width, height),
      });
      buffer += 1;
      t.source.scaleMode = "nearest";
      return t;
   });

   const anim = new PIXI.AnimatedSprite({ textures });
   anim.scale.set(scale);
   anim.animationSpeed = 0.07;
   anim.play();

   anim.zIndex = ZLayer.mid;
   offNode.zIndex = ZLayer.mid;
   game.addChild(anim);
   game.addChild(offNode);

   anim.x = pos ? pos.x - anim.width * 0.5 : 0;
   anim.y = pos ? pos.y - anim.height * 0.5 : 0;

   const setRunning = (valueChange: boolean) => {
      anim.visible = valueChange;
      offNode.visible = !valueChange;

      valueChange === true
         ? anim.position.set(anim.x, anim.y)
         : offNode.position.set(anim.x, anim.y);
   };

   const destroy = () => {
      if (anim.parent) {
         anim.parent.removeChild(anim);
      }
      anim.destroy();

      if (offNode.parent) {
         offNode.parent.removeChild(offNode);
      }
      offNode.destroy();
   };

   const toRect = () => {
      return new PIXI.Rectangle(anim.x, anim.y, anim.width, anim.height);
   };

   const sendBtc = (props: { units: number; node: BtcNode }) => {
      const { units, node } = props;
      const recAddr = node.wallet.addr();
      const tx = wallet.createTx({ units, recAddr });
      mempool.add(tx);
      const msg: BroadcastMsg = { type: "tx", obj: tx, fromId: id };
      connections.sendBroadcast(msg);
   };

   const receiveMsg = (msg: BroadcastMsg) => {
      if (msg.type === "block") {
         throw new Error("not impl yet");
      }

      if (msg.type === "tx") {
         if (mempool.hasTx(msg.obj)) return;
         mempool.add(msg.obj);
      }

      console.log(`id:${id} recieved msg from:${msg.fromId}`);

      msg.fromId = id;
      for (const n of connections.getAll()) {
         if (n.id() === msg.fromId) continue;
         connections.sendBroadcast(msg);
      }
   };

   return {
      setRunning,
      anim,
      createdAt: () => createdAt,
      id: () => id,
      destroy,
      toRect,
      connections: () => connections,
      sendBtc,
      receiveMsg,
      wallet,
   };
};
