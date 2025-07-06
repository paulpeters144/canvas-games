import { OutlineFilter } from "pixi-filters";
import * as PIXI from "pixi.js";
import { ZLayer } from "./game.enums";
import type { GameVars } from "./game.vars";
import { type Blockchain, createBlockchain } from "./model.blockchain";
import { type BtcMiner, createMiner } from "./model.btc-miner";
import { type NodeConnections, createConnections } from "./model.connection";
import { type Mempool, createMempool } from "./model.mempool";
import { type BtcWallet, createBtcWallet } from "./model.wallet";
import type { BlockTx, Position } from "./types";
import { randNum, standard } from "./util";

interface BtcNodeProps {
   gameVars: GameVars;
   pos?: Position;
}

export const createBtcNode = (props: BtcNodeProps): BtcNode => {
   const { gameVars, pos } = props;
   const { game, assets } = gameVars;

   const createdAt = new Date();
   const ip = standard.randomIp();
   const wallet: BtcWallet = createBtcWallet();
   const mempool: Mempool = createMempool();
   const connections: NodeConnections = createConnections(ip);
   const blockchain: Blockchain = createBlockchain();
   const miner: BtcMiner = createMiner(wallet);

   const width = 37;
   const height = 43;
   const frames = 5;
   const scale = 1;

   const texture = assets.getTexture("server-anim-coin");

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
   anim.currentFrame = randNum({ min: 0, max: frames - 1 });

   const filter = new OutlineFilter({ thickness: 2, color: "#FFFFFF" });
   anim.interactive = true;
   anim.on("pointerenter", () => {
      anim.cursor = "pointer";
      anim.filters = [filter];
   });

   anim.on("pointerleave", () => {
      anim.filters = [];
      anim.cursor = "default";
   });

   anim.zIndex = ZLayer.mid;
   game.addChild(anim);

   anim.x = pos ? pos.x - anim.width * 0.5 : 0;
   anim.y = pos ? pos.y - anim.height * 0.5 : 0;

   const toRect = () => {
      return new PIXI.Rectangle(anim.x, anim.y, anim.width, anim.height);
   };

   const createTx = (props: { units: number; node: BtcNode }): BlockTx => {
      const { units, node } = props;
      const recAddr = node.wallet.addr();
      const tx = wallet.createTx({ units, recAddr });
      mempool.add(tx);
      return tx;
   };

   const receiveTx = (tx: BlockTx) => {
      if (mempool.hasTx(tx)) return false;
      mempool.add(tx);
      return true;
   };

   const destroy = () => {
      if (anim.parent) {
         anim.parent.removeChild(anim);
      }
      anim.destroy();
   };

   return {
      anim,
      createdAt: () => createdAt,
      ip: () => ip,
      destroy,
      toRect,
      connections: () => connections,
      createTx,
      receiveTx,
      wallet,
      mempool,
      blockchain,
      miner,
      pos: () => {
         return {
            x: anim.x + anim.width * 0.5,
            y: anim.y + anim.height * 0.5,
         };
      },
   };
};

export interface BtcNode {
   ip: () => string;
   createdAt: () => Date;
   destroy: () => void;
   toRect: () => PIXI.Rectangle;
   connections: () => NodeConnections;
   pos: () => Position;
   anim: PIXI.AnimatedSprite;
   createTx: (props: { units: number; node: BtcNode }) => BlockTx;
   receiveTx: (tx: BlockTx) => boolean;
   miner: BtcMiner;
   blockchain: Blockchain;
   wallet: BtcWallet;
   mempool: Mempool;
}
