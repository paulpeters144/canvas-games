import * as PIXI from "pixi.js";
import type { GameAssets } from "./assets";
import { ZLayer } from "./game.enums";
import type { GameVars } from "./game.vars";
import { type Mempool, createMempool } from "./model.mempool";
import { type BtcWallet, createBtcWallet } from "./model.wallet";
import type { Position } from "./types";

interface BtcNodeProps {
   assets: GameAssets;
   gameVars: GameVars;
   pos?: Position;
}

export interface BtcNode {
   id: () => string;
   setRunning: (valueChange: boolean) => void;
   createdAt: () => Date;
   destroy: () => void;
   toRect: () => PIXI.Rectangle;
   connection: NodeConnections;
   anim: PIXI.AnimatedSprite;
   sendBtc: (props: { amount: number; node: BtcNode }) => void;
}

export const createBtcNode = (props: BtcNodeProps): BtcNode => {
   const { assets, gameVars, pos } = props;
   const { game } = gameVars;

   const createdAt = new Date();
   const id = crypto.randomUUID().replaceAll("-", "").slice(0, 15);
   const wallet: BtcWallet = createBtcWallet();
   const mempool: Mempool = createMempool();

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

   const sendBtc = (props: { amount: number; node: BtcNode }) => {};

   return {
      setRunning,
      anim,
      createdAt: () => createdAt,
      id: () => id,
      destroy,
      toRect,
      connection: connection(),
      sendBtc,
   };
};

interface NodeConnections {
   connect: (node: BtcNode) => void;
   disconnect: () => void;
   connectCount: () => number;
   isConnectedTo: (node: BtcNode) => boolean;
}

const connection = (): NodeConnections => {
   const nodeConnections = new Map<string, BtcNode>();
   const connect = (node: BtcNode) => {
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

   return {
      connect,
      disconnect,
      connectCount,
      isConnectedTo,
   };
};
