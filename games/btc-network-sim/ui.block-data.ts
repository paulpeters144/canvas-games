import * as PIXI from "pixi.js";
import { ZLayer } from "./game.enums";
import { bus } from "./main";
import type { BtcNode } from "./model.btc-node";
import type { NodeStore } from "./store.nodes";
import { NODE_FOCUSED } from "./system.node-focus";
import { color } from "./ui.colors";
import { createScrollBox } from "./ui.scrollbox";
import type { Camera } from "./util.camera";

export const createDataWidget = (props: {
   camera: Camera;
   game: PIXI.Container;
   store: NodeStore;
   pixelSize: number;
   width: number;
   height: number;
}) => {
   const { camera, game, store, pixelSize: pSize, width, height } = props;

   const ctr = new PIXI.Container();

   const pixelGraphic = new PIXI.Graphics();

   // top border
   pixelGraphic
      .rect(pSize, 0, pSize * (width - 4), pSize)
      .fill({ color: color.inBorder });

   // left border
   pixelGraphic
      .rect(0, pSize, pSize, pSize * (height - 4))
      .fill({ color: color.inBorder });

   // bottom border
   pixelGraphic
      .rect(pSize, pSize * (height - 3), pSize * (width - 4), pSize)
      .fill({ color: color.inBorder });

   // right border
   pixelGraphic
      .rect(pSize * (width - 3), pSize, pSize, pSize * (height - 4))
      .fill({ color: color.inBorder });

   // main background
   pixelGraphic
      .rect(pSize, pSize, pSize * (width - 4), pSize * (height - 4))
      .fill({ color: color.mainBg });

   const createOffClickArea = () => {
      const g = new PIXI.Graphics()
         .rect(0, 0, 1, 1)
         .fill({ color: "blue", alpha: 0 });
      g.interactive = true;
      g.onpointerdown = () => {
         bus.fire("focusNode", { isFocused: false });
      };
      return g;
   };

   const offClickAreaTop = createOffClickArea();
   const offClickAreaBtm = createOffClickArea();
   const offClickAreaRt = createOffClickArea();
   const offClickAreaLt = createOffClickArea();
   const tabButtons = createTabButtons();
   let text = createScrollBox({
      width: 0,
      height: 0,
      fontSize: 0,
      title: "",
      defaultText: "",
   });
   const newScrollBox = (title: string, body: string) => {
      ctr.removeChild(text.ctr);
      text = createScrollBox({
         width: 120,
         height: 160,
         fontSize: 3.5,
         title: title,
         defaultText: body,
      });
      ctr.addChild(text.ctr);
      text.updatePosBasedOn(pixelGraphic);
   };

   bus.on("wheel", (e) => {
      if (!ctr.visible) return;
      if (e === "up") {
         text.scrollTo(-15);
      }
      if (e === "down") {
         text.scrollTo(15);
      }
   });

   ctr.addChild(
      pixelGraphic,
      offClickAreaTop,
      offClickAreaBtm,
      offClickAreaLt,
      offClickAreaRt,
      tabButtons.ctr,
   );

   ctr.visible = false;
   ctr.zIndex = ZLayer.top;

   game.addChild(ctr);

   const setRightOf = (node: BtcNode) => {
      ctr.visible = true;

      const vpBounds = camera.vpBounds();
      const nodeRect = {
         x: node.anim.x,
         y: node.anim.y,
         w: node.anim.width,
         h: node.anim.height,
      };

      // Position pixelGraphic on the right side of viewport
      pixelGraphic.x = vpBounds.right - pixelGraphic.width;
      pixelGraphic.y = vpBounds.top;

      // Top area (above the node)
      const topBuffer = 5;
      offClickAreaTop.x = vpBounds.x;
      offClickAreaTop.y = vpBounds.y;
      offClickAreaTop.width = pixelGraphic.x - vpBounds.x;
      offClickAreaTop.height = nodeRect.y - vpBounds.y - topBuffer;

      // Bottom area (below the node)
      const btmBuffer = 15;
      offClickAreaBtm.x = vpBounds.x;
      offClickAreaBtm.y = nodeRect.y + nodeRect.h + btmBuffer;
      offClickAreaBtm.width = pixelGraphic.x - vpBounds.x;
      offClickAreaBtm.height =
         vpBounds.bottom - (nodeRect.y + nodeRect.h + btmBuffer);

      // Left area (beside the node vertically, to the left of the node)
      const ltBuffer = 25;
      offClickAreaLt.x = vpBounds.x;
      offClickAreaLt.y = offClickAreaTop.y + offClickAreaTop.height;
      offClickAreaLt.width = nodeRect.x - vpBounds.x - ltBuffer;
      offClickAreaLt.height = offClickAreaBtm.y - offClickAreaLt.y;

      // Right area (between node and pixelGraphic)
      const rtBuffer = 25;
      offClickAreaRt.x = nodeRect.x + nodeRect.w + rtBuffer;
      offClickAreaRt.y = offClickAreaTop.y + offClickAreaTop.height;
      offClickAreaRt.width = pixelGraphic.x - (nodeRect.x + nodeRect.w + rtBuffer);
      offClickAreaRt.height = offClickAreaBtm.y - offClickAreaRt.y;

      tabButtons.updatePosBasedOn(pixelGraphic);
      text.updatePosBasedOn(pixelGraphic);
   };

   const setLeftOf = (node: BtcNode) => {
      ctr.visible = true;

      const vpBounds = camera.vpBounds();
      const nodeRect = {
         x: node.anim.x,
         y: node.anim.y,
         w: node.anim.width,
         h: node.anim.height,
      };

      // Position pixelGraphic on the left side of viewport
      pixelGraphic.x = vpBounds.x;
      pixelGraphic.y = vpBounds.y;

      // Top area (above the node)
      const topBuffer = 15;
      offClickAreaTop.x = vpBounds.x + pixelGraphic.width;
      offClickAreaTop.y = vpBounds.y;
      offClickAreaTop.width = vpBounds.right - (vpBounds.x + pixelGraphic.width);
      offClickAreaTop.height = nodeRect.y - vpBounds.y - topBuffer;

      // Bottom area (below the node)
      const btmBuffer = 15;
      offClickAreaBtm.x = vpBounds.x + pixelGraphic.width;
      offClickAreaBtm.y = nodeRect.y + nodeRect.h + btmBuffer;
      offClickAreaBtm.width = vpBounds.right - (vpBounds.x + pixelGraphic.width);
      offClickAreaBtm.height =
         vpBounds.bottom - (nodeRect.y + nodeRect.h + btmBuffer);

      // Left area (between pixelGraphic and node)
      const ltBuffer = 10;
      offClickAreaLt.x = vpBounds.x + pixelGraphic.width;
      offClickAreaLt.y = offClickAreaTop.y + offClickAreaTop.height;
      offClickAreaLt.width =
         nodeRect.x - (vpBounds.x + pixelGraphic.width) - ltBuffer;
      offClickAreaLt.height = offClickAreaBtm.y - offClickAreaLt.y;

      // Right area (beside the node vertically, to the right of the node)
      const rtBuffer = 10;
      offClickAreaRt.x = nodeRect.x + nodeRect.w + rtBuffer;
      offClickAreaRt.y = offClickAreaTop.y + offClickAreaTop.height;
      offClickAreaRt.width = vpBounds.right - (nodeRect.x + nodeRect.w + rtBuffer);
      offClickAreaRt.height = offClickAreaBtm.y - offClickAreaRt.y;

      tabButtons.updatePosBasedOn(pixelGraphic);
      text.updatePosBasedOn(pixelGraphic);
   };

   bus.on("focusNode", (e) => {
      if (!e.isFocused) {
         ctr.visible = false;
         return;
      }
      const node = store.activeNodes().find((n) => n.ip() === e.ip);
      if (!node) return;

      const strData = createStringData(store);
      tabButtons.event.onBlockchainTab(() => {
         newScrollBox("Blockchain", strData.blockchainData());
      });
      tabButtons.event.onMempoolTab(() => {
         newScrollBox("Mempool", strData.mempoolData());
      });
      tabButtons.event.onWalletTab(() => {
         newScrollBox("Wallet", strData.walletData());
      });

      newScrollBox("Blockchain", strData.blockchainData());
      tabButtons.reset();
      text.scrollTo(Number.NEGATIVE_INFINITY);
      const isOnFarLeftScreen = game.width - node.anim.x > 250;
      setTimeout(() => {
         isOnFarLeftScreen ? setRightOf(node) : setLeftOf(node);
      }, 0);
   });
};

const createTabButtons = () => {
   const padding = 1;
   const createProps = (text: string) => {
      const t = { value: text, size: 4.5 };
      return { pixelSize: 1, width: 40, height: 11, text: t };
   };

   const blockchainTab = createTabBtn(createProps("Blockchain"));
   let blockchainTabCb: (() => void) | undefined;
   blockchainTab.onClick(() => {
      if (blockchainTab.isFocused()) return;
      blockchainTab.setFocused(true);
      mempoolTab.setFocused(false);
      walletTab.setFocused(false);
      blockchainTabCb?.();
   });

   const mempoolTab = createTabBtn(createProps("Mempool"));
   let mempoolTabCb: (() => void) | undefined;
   mempoolTab.ctr.x = blockchainTab.ctr.x + blockchainTab.ctr.width;
   mempoolTab.ctr.x += padding;
   mempoolTab.onClick(() => {
      if (mempoolTab.isFocused()) return;
      mempoolTab.setFocused(true);
      blockchainTab.setFocused(false);
      walletTab.setFocused(false);
      mempoolTabCb?.();
   });

   const walletTab = createTabBtn(createProps("Wallet"));
   walletTab.ctr.x = mempoolTab.ctr.x + mempoolTab.ctr.width;
   walletTab.ctr.x += padding;
   let walletTabCb: (() => void) | undefined;
   walletTab.onClick(() => {
      if (walletTab.isFocused()) return;
      walletTab.setFocused(true);
      mempoolTab.setFocused(false);
      blockchainTab.setFocused(false);
      walletTabCb?.();
   });

   blockchainTab.setFocused(true);

   const ctr = new PIXI.Container();
   ctr.addChild(blockchainTab.ctr, mempoolTab.ctr, walletTab.ctr);

   return {
      ctr,
      updatePosBasedOn: (graphic: PIXI.Graphics) => {
         ctr.x = graphic.x + (graphic.width * 0.5 - ctr.width * 0.5);
         ctr.y = graphic.y + 3;
      },
      event: {
         onBlockchainTab: (cb: () => void) => {
            blockchainTabCb = cb;
         },
         onMempoolTab: (cb: () => void) => {
            mempoolTabCb = cb;
         },
         onWalletTab: (cb: () => void) => {
            walletTabCb = cb;
         },
      },
      reset: () => {
         if (blockchainTab.isFocused()) return;
         blockchainTab.setFocused(true);
         mempoolTab.setFocused(false);
         walletTab.setFocused(false);
         blockchainTabCb?.();
      },
   };
};

const createTabBtn = (props: {
   pixelSize: number;
   width: number;
   height: number;
   text: { value: string; size: number };
}) => {
   const color = {
      white: "#FFFFFF",
      border: "#E88744",
      mainBg: "#D67130",
   };
   const { pixelSize: pSize, width, height } = props;
   let isFocused = false;
   const ctr = new PIXI.Container();

   const topB = new PIXI.Graphics();
   const createTopBWithColor = (c: string) => {
      topB
         .clear()
         .rect(pSize * 2, pSize, pSize * (width - 4), pSize)
         .fill({ color: c });
   };

   const leftB = new PIXI.Graphics();
   const createLeftBWithColor = (c: string | number) => {
      leftB
         .clear()
         .rect(pSize, pSize * 2, pSize, pSize * (height - 4))
         .fill({ color: c });
   };

   const btmB = new PIXI.Graphics();
   const createBtmBWithColor = (c: string | number) => {
      btmB
         .clear()
         .rect(pSize * 2, pSize * (height - 2), pSize * (width - 4), pSize)
         .fill({ color: c });
   };

   const rightB = new PIXI.Graphics();
   const createRightBWithColor = (c: string | number) => {
      rightB
         .clear()
         .rect(pSize * (width - 2), pSize * 2, pSize, pSize * (height - 4))
         .fill({ color: c });
   };

   createTopBWithColor(color.border);
   createRightBWithColor(color.border);
   createBtmBWithColor(color.border);
   createLeftBWithColor(color.border);

   const mainBg = new PIXI.Graphics()
      .rect(pSize * 2, pSize * 2, pSize * (width - 4), pSize * (height - 4))
      .fill({ color: color.mainBg });

   ctr.addChild(topB, leftB, btmB, rightB, mainBg);

   const text = new PIXI.Text({
      style: new PIXI.TextStyle({
         fontSize: props.text.size,
         fontFamily: "consolas",
         fill: color.white,
      }),
      resolution: 8,
      text: props.text.value,
   });

   text.anchor.set(0.5);
   text.x = ctr.x + ctr.width * 0.54;
   text.y = ctr.y + ctr.height * 0.54;
   ctr.addChild(text);
   ctr.interactive = true;

   let clickCb: (() => void) | undefined = undefined;
   ctr.on("pointerdown", () => {
      clickCb?.();
   });

   return {
      ctr,
      onClick: (cb: () => void) => {
         clickCb = cb;
      },
      setFocused: (value: boolean) => {
         isFocused = value;
         if (value) {
            createTopBWithColor(color.white);
            createRightBWithColor(color.white);
            createBtmBWithColor(color.white);
            createLeftBWithColor(color.white);
         }
         if (!value) {
            createTopBWithColor(color.border);
            createRightBWithColor(color.border);
            createBtmBWithColor(color.border);
            createLeftBWithColor(color.border);
         }
      },
      isFocused: () => isFocused,
   };
};

const createStringData = (store: NodeStore) => {
   const focusNode = store.activeNodes().find((n) => n.ip() === NODE_FOCUSED);
   if (!focusNode) throw new Error(`couldn't find node ${NODE_FOCUSED}`);
   let blockchainStrData = "";
   let mempoolStrData = "";
   let walletStrData = "";

   const normalizeJsonStr = (json: string) => {
      const lines: string[] = [];
      const jsonLines = json.split("\n");
      for (let i = 0; i < jsonLines.length; i++) {
         const line = jsonLines[i];
         if (line.length > 50) {
            lines.push(`${line.slice(0, 45)}...`);
            if (line.endsWith('",')) {
               lines[i] += '",';
            } else if (line.endsWith(",")) {
               lines[i] += ",";
            }
         } else {
            lines.push(line);
         }
         if (i === 800) {
            lines.push("...");
            break;
         }
      }
      const result = lines.join("\n");
      return result;
   };

   const walletData = () => {
      if (walletStrData) return walletStrData;
      const wallet = focusNode.wallet;
      const data = { balance: wallet.balance(), utxos: wallet.utxos() };
      const json = JSON.stringify(data, null, 2);
      const normJson = normalizeJsonStr(json);
      walletStrData = normJson;
      return walletStrData;
   };

   const mempoolData = () => {
      if (mempoolStrData) return mempoolStrData;
      const data = focusNode.mempool.getAllTxs();
      const json = JSON.stringify(data, null, 2);
      const normJson = normalizeJsonStr(json);
      mempoolStrData = normJson;
      return mempoolStrData;
   };

   const blockchainData = () => {
      if (blockchainStrData) return blockchainStrData;
      const data = focusNode.blockchain.getBlockData({ type: "head" });
      const json = JSON.stringify(data, null, 2);
      const normJson = normalizeJsonStr(json);
      blockchainStrData = normJson;
      return blockchainStrData;
   };

   return {
      walletData,
      mempoolData,
      blockchainData,
      refresh: () => {
         blockchainStrData = "";
         mempoolStrData = "";
         walletStrData = "";
      },
   };
};
