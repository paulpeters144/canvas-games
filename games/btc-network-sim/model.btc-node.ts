import * as PIXI from "pixi.js";
import { ZLayer } from "./game.enums";
import type { GameVars } from "./game.vars";
import { bus } from "./main";
import { type NodeConnections, createConnections } from "./model.connection";
import { type Mempool, createMempool } from "./model.mempool";
import { type BtcWallet, createBtcWallet } from "./model.wallet";
import type { BlockTx, Position } from "./types";

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
   pos: () => Position;
   anim: PIXI.AnimatedSprite;
   sendBtc: (props: { units: number; node: BtcNode }) => void;
   receiveTx: (tx: BlockTx) => boolean;
   wallet: BtcWallet;
   mempool: Mempool;
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

   const toRect = () => {
      return new PIXI.Rectangle(anim.x, anim.y, anim.width, anim.height);
   };

   const sendBtc = (props: { units: number; node: BtcNode }) => {
      const { units, node } = props;
      const recAddr = node.wallet.addr();
      const tx = wallet.createTx({ units, recAddr });
      mempool.add(tx);
      bus.fire("newTx", { originId: id, tx: tx });
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

      if (offNode.parent) {
         offNode.parent.removeChild(offNode);
      }
      offNode.destroy();
   };

   // const ui = constructUI(anim);
   // game.addChild(ui);

   return {
      setRunning,
      anim,
      createdAt: () => createdAt,
      id: () => id,
      destroy,
      toRect,
      connections: () => connections,
      sendBtc,
      receiveTx,
      wallet,
      mempool,
      pos: () => {
         return {
            x: anim.x + anim.width * 0.5,
            y: anim.y + anim.height * 0.5,
         };
      },
   };
};

const constructUI = (anim: PIXI.AnimatedSprite) => {
   const buttonContainer = new PIXI.Container();
   buttonContainer.interactive = true;
   buttonContainer.visible = false;

   const buttonWidth = 75;
   const buttonHeight = 25;
   const buttonRadius = 5;
   const buttonPadding = 2;
   const numButtons = 3;

   const totalButtonsHeight = numButtons * buttonHeight;
   const totalPadding = (numButtons - 1) * buttonPadding;
   const backgroundWidth = buttonWidth + buttonPadding * 2;
   const backgroundHeight = totalButtonsHeight + totalPadding + buttonPadding * 2;

   const bgGraphic = new PIXI.Graphics()
      .rect(0, 0, backgroundWidth + 10, backgroundHeight)
      .fill({ color: "#FFFFFF", alpha: 0.005 });

   buttonContainer.addChild(bgGraphic);

   for (let i = 0; i < 3; i++) {
      const button = new PIXI.Graphics()
         .roundRect(0, 0, buttonWidth, buttonHeight, buttonRadius)
         .fill({ color: "#FF7518" });

      button.x = buttonPadding + 8;
      button.y = buttonPadding + i * (buttonHeight + buttonPadding);

      button.interactive = true;

      button.on("pointerdown", () => {
         console.log(`Button ${i + 1} was clicked!`);
      });

      buttonContainer.addChild(button);
   }

   anim.interactive = true;
   let isInAnim = false;
   let isInCtr = false;

   anim.on("pointerenter", (e) => {
      isInAnim = true;
      buttonContainer.x = anim.x + anim.width - 5;
      buttonContainer.y = anim.y - 15;
      buttonContainer.visible = true;
   });

   anim.on("pointerleave", () => {
      isInAnim = false;
      setTimeout(() => {
         if (!isInAnim && !isInCtr) buttonContainer.visible = false;
      }, 100);
   });

   buttonContainer.on("pointerleave", () => {
      isInCtr = false;
      setTimeout(() => {
         if (!isInAnim && !isInCtr) buttonContainer.visible = false;
      }, 100);
   });

   buttonContainer.on("pointerenter", () => {
      isInCtr = true;
   });

   buttonContainer.zIndex = ZLayer.mid;

   return buttonContainer;
};
