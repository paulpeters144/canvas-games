import { OutlineFilter } from "pixi-filters";
import * as PIXI from "pixi.js";
import { bus } from "./_main";
import { ZLayer } from "./game.enums";
import type { GameVars } from "./game.vars";
import { type Blockchain, createBlockchain } from "./model.blockchain";
import { type BtcMiner, createMiner } from "./model.btc-miner";
import { type NodeConnections, createConnections } from "./model.connection";
import { type Mempool, createMempool } from "./model.mempool";
import { type BtcWallet, createBtcWallet } from "./model.wallet";
import type { BlockTx, BtcBlock, Position } from "./types";
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
   const frames = 10;
   const scale = 1.01;

   const texture = assets.getTexture("server-anim-coin-2");

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
   anim.animationSpeed = 0.15;
   anim.play();
   anim.currentFrame = randNum({ min: 0, max: frames - 1 });
   anim.zIndex = ZLayer.mid;

   const text = createDisplayText(ip);
   text.ctr.zIndex = ZLayer.mid;
   text.setInteractive(false);

   const filter = new OutlineFilter({ thickness: 2, color: "#FFFFFF" });
   anim.interactive = true;
   anim.on("pointerenter", () => {
      anim.cursor = "pointer";
      anim.filters = [filter];
      text.showIp(true);
   });

   anim.on("pointerleave", () => {
      anim.filters = [];
      anim.cursor = "default";
      text.showIp(false);
   });

   game.addChild(anim, text.ctr);

   anim.x = pos ? pos.x - anim.width * 0.5 : 0;
   anim.y = pos ? pos.y - anim.height * 0.5 : 0;
   text.ctr.y = anim.y + anim.height + 5;
   text.ctr.x = anim.x + anim.width * 0.5 - text.ctr.width * 0.5;

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

   const destroy = () => {
      if (anim.parent) {
         anim.parent.removeChild(anim);
      }
      anim.destroy();
   };

   const addBlock = (block: BtcBlock): boolean => {
      if (!blockchain.addBlock(block)) return false;
      block.transactions.map((tx) => mempool.remove(tx));
      return true;
   };

   return {
      anim,
      ipText: text,
      createdAt: () => createdAt,
      ip: () => ip,
      destroy,
      toRect,
      connections: () => connections,
      addBlock,
      createTx,
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
   addBlock: (block: BtcBlock) => boolean;
   anim: PIXI.AnimatedSprite;
   ipText: NodeDisplayText;
   createTx: (props: { units: number; node: BtcNode }) => BlockTx;
   miner: BtcMiner;
   blockchain: Blockchain;
   wallet: BtcWallet;
   mempool: Mempool;
}

const createDisplayText = (ip: string): NodeDisplayText => {
   const ctr = new PIXI.Container();

   const leftChevron = new PIXI.Text({
      style: new PIXI.TextStyle({
         fontFamily: "consolas",
         fontSize: 10,
         fill: "white",
         fontWeight: "900",
      }),
      text: "<",
      resolution: 8,
      x: 0,
      y: -2,
   });
   leftChevron.on("pointerenter", () => {
      leftChevron.cursor = "pointer";
   });
   leftChevron.on("pointerleave", () => {
      leftChevron.cursor = "default";
   });
   leftChevron.on("pointerdown", () => {
      bus.fire("nodeIdx", { direction: "left", ip: ip });
   });

   const text = new PIXI.Text({
      style: new PIXI.TextStyle({
         fontFamily: "consolas",
         fontSize: 8,
         fill: "white",
         fontWeight: "900",
      }),
      text: `${ip}`,
      resolution: 8,
      x: leftChevron.width + 5,
   });

   const rightChevron = new PIXI.Text({
      style: new PIXI.TextStyle({
         fontFamily: "consolas",
         fontSize: 10,
         fill: "white",
         fontWeight: "900",
      }),
      text: ">",
      resolution: 8,
      x: text.x + text.width + 5,
      y: -2,
   });
   rightChevron.on("pointerenter", () => {
      rightChevron.cursor = "pointer";
   });
   rightChevron.on("pointerleave", () => {
      rightChevron.cursor = "default";
   });
   rightChevron.on("pointerdown", () => {
      bus.fire("nodeIdx", { direction: "right", ip: ip });
   });

   ctr.addChild(leftChevron, text, rightChevron);

   return {
      ctr,
      setInteractive: (value: boolean) => {
         rightChevron.interactive = value;
         leftChevron.interactive = value;
         ctr.visible = value;
         if (value) {
            rightChevron.visible = true;
            leftChevron.visible = true;
         }
      },
      showIp: (value: boolean) => {
         if (value) {
            rightChevron.visible = false;
            leftChevron.visible = false;
            text.visible = true;
            ctr.visible = true;
         } else {
            rightChevron.visible = true;
            leftChevron.visible = true;
            text.visible = true;
            ctr.visible = false;
         }
      },
   };
};

interface NodeDisplayText {
   ctr: PIXI.Container<PIXI.ContainerChild>;
   setInteractive: (value: boolean) => void;
   showIp: (value: boolean) => void;
}
