import { eBus } from "games/util/event-bus";
import * as PIXI from "pixi.js";
import { createGameAssets } from "./assets";
import { ZLayer } from "./game.enums";
import { type GameVars, createGameVars } from "./game.vars";
import type { BtcNode } from "./model.btc-node";
import { type UTXOSet, createUtxoSet } from "./model.utxo-set";
import { type NodeStore, createNodeStore } from "./store.nodes";
import { type MineBtcSystem, createMineBtcSystem } from "./system.mine-btc";
import { type TxMessageSystem, createTxMessageSystem } from "./system.move-tx";
import {
   type ConnectionSystem,
   createNodeConnectionSystem,
} from "./system.node-connection";
import { setupNodeFocus } from "./system.node-focus";
import { type SendRandTxSystem, createSendTxSystem } from "./system.send-txs";
import type { BtcBlock } from "./types";
import { createBackground } from "./ui.background";
import { createDataWidget } from "./ui.block-data";
import { createLoadingOverlay } from "./ui.loading-overlay";
import { setMouseImages } from "./ui.mouse";
import { type NodeCounterUI, createNodeCounterUI } from "./ui.node-ctrl";
import { randNum, sleep } from "./util";
import { type Camera, createCamera } from "./util.camera";
import type { EventMap } from "./util.events";

// TODO: create a loading screen where we mine 3 blocks

// TODO: initialize all node, but just don't make some of them visible
//       with the left blade ctrls

export const bus = eBus<EventMap>();

export async function createBtcNetworkSim(app: PIXI.Application) {
   const game: PIXI.Container = new PIXI.Container();
   const assets = createGameAssets();
   const gameVars = createGameVars(game, assets);
   const sceneEngine = newSceneEngine(gameVars, app);
   sceneEngine.next(() => gameScene(gameVars, app));
}

export interface IScene {
   load: (game: PIXI.ContainerChild) => Promise<void>;
   update: (tick: PIXI.Ticker) => void;
}

export const newSceneEngine = (gameVars: GameVars, app: PIXI.Application) => {
   let gameTicker: PIXI.Ticker | undefined;
   let currentScene: IScene | undefined;
   const { game } = gameVars;
   game.zIndex = ZLayer.bottom;
   app.stage.addChild(game);

   // TODO: need to dispose these listeners
   const wheelEventListener = (e: WheelEvent) => {
      e.preventDefault();
      e.deltaY > 0 ? bus.fire("wheel", "down") : bus.fire("wheel", "up");
   };
   window.addEventListener("wheel", wheelEventListener, { passive: false });
   return {
      next: async (nextScene: () => IScene) => {
         game.removeChildren();
         game.removeAllListeners();

         if (gameTicker) gameTicker.destroy();

         currentScene = nextScene();
         const update = (tick: PIXI.Ticker) => {
            currentScene?.update(tick);
         };
         gameTicker = new PIXI.Ticker().add(update);

         await currentScene.load(game);

         gameTicker.start();
      },
   };
};

export const gameScene = (gameVars: GameVars, app: PIXI.Application): IScene => {
   const { game, assets } = gameVars;
   let nodeCountUI: NodeCounterUI | undefined;
   let systemNodeConnect: ConnectionSystem | undefined;
   let systemMoveTx: TxMessageSystem | undefined;
   let systemSendTx: SendRandTxSystem | undefined;
   let store: NodeStore | undefined;
   let utxoSet: UTXOSet | undefined;
   let mineBtcSystem: MineBtcSystem | undefined;
   const camera = createCamera(app, game);

   return {
      load: async () => {
         await assets.load();

         const background = createBackground({
            rows: 20,
            cols: 41,
         });
         game.addChild(background.ctr);
         store = createNodeStore(gameVars);
         utxoSet = createUtxoSet(store);
         nodeCountUI = createNodeCounterUI(app);
         mineBtcSystem = createMineBtcSystem({ store, utxoSet });
         createLoadingOverlay(app);
         systemNodeConnect = createNodeConnectionSystem({ gameVars, store });
         systemMoveTx = createTxMessageSystem(gameVars);
         systemSendTx = createSendTxSystem({ store });
         createBusListeningEvents({
            gameVars,
            store,
            systemNodeConnect,
            systemMoveTx,
            nodeCountUI,
            camera,
            utxoSet,
         });
         createDataWidget({
            game: game,
            app,
            camera,
            store: store,
            pixelSize: 2.01,
            width: 70,
            height: 95,
         });

         bus.fire("node", { count: 19 });
         setMouseImages(app);

         initMineBtc({ store, utxoSet });

         game.visible = false;
         nodeCountUI.ctr.visible = false;

         setTimeout(() => {
            if (!store) return;
            // const index = 0;
            // const node = store.activeNodes()[index].anim;
            // const e = {} as PIXI.FederatedPointerEvent;
            // node.emit("pointerdown", e);
         }, 1750);
      },

      update: (tick: PIXI.Ticker) => {
         nodeCountUI?.update(tick);
         systemSendTx?.update(tick);
         systemMoveTx?.update(tick);
         mineBtcSystem?.update(tick);
      },
   };
};

const createBusListeningEvents = (props: {
   gameVars: GameVars;
   store: NodeStore;
   camera: Camera;
   systemNodeConnect?: ConnectionSystem;
   systemMoveTx?: TxMessageSystem;
   nodeCountUI?: NodeCounterUI;
   utxoSet: UTXOSet;
}) => {
   const { gameVars, store, camera } = props;
   const { systemNodeConnect, nodeCountUI, systemMoveTx } = props;
   const { game } = gameVars;

   bus.on("node", (e) => {
      if (e.count > store.count()) {
         while (e.count > store.count()) {
            const newNode = store.add();
            setupNodeFocus({
               game,
               camera,
               node: newNode,
               store,
            });
         }
      }
      if (e.count < store.count()) {
         while (e.count < store.count()) {
            store.remove();
         }
      }
      systemNodeConnect?.setup();
   });

   bus.on("randSend", (e) => {
      try {
         const allNodes = store.activeNodes();
         const recNode = allNodes.find((n) => n.ip() === e.toId);
         const senderNode = allNodes.find((n) => n.ip() === e.fromId);

         if (!senderNode || !recNode) return;
         if (recNode.ip() === e.fromId) return;
         const tx = senderNode.createTx({ units: e.units, node: recNode });
         bus.fire("newTx", { originId: senderNode.ip(), tx: tx });
      } catch (e) {
         // console.error(e);
      }
   });

   bus.on("gameLoaded", (e) => {
      if (!nodeCountUI) return;
      game.visible = true;
      nodeCountUI.ctr.visible = true;
      camera.animate({
         time: 0,
         position: {
            x: camera.worldWidth() / 2,
            y: camera.worldHeight() / 2 - 10,
         },
         scale: 1.15,
         ease: "linear",
      });
   });

   bus.on("newTx", (e) => {
      const originNode = store.activeNodes().find((n) => n.ip() === e.originId);
      if (!originNode) return;
      const connectingNodes = originNode.connections().getAll();
      connectingNodes.map((n) => {
         if (!n.mempool.add(e.tx)) return;
         systemMoveTx?.displayTxMovement({
            fromNode: originNode,
            toNode: n,
            tx: e.tx,
         });
      });
   });

   bus.on("fwdBlock", (e) => {
      const { block, fromAddr } = e;
      const activeNodes = store.activeNodes();
      const fromNode = (n: BtcNode) => n.wallet.addr() === fromAddr;
      const senderNode = activeNodes.find(fromNode);
      if (!senderNode) {
         console.error("couldnt find senderNode node for ", block);
         return;
      }
      const connectingNodes = senderNode.connections().getAll();
      connectingNodes.map((n) => {
         if (!n.addBlock(block)) return;
         systemMoveTx?.displayBlockMovement({
            fromNode: senderNode,
            toNode: n,
            block: block,
         });
      });
   });
};

interface InitBtcProps {
   store: NodeStore;
   utxoSet: UTXOSet;
}

const initMineBtc = async (props: InitBtcProps): Promise<void> => {
   const { store, utxoSet } = props;
   const firstNode = store.activeNodes()[0];
   const allNodes = store.allData();

   await sleep(0);
   {
      const block = firstNode.blockchain.createEmptyBlock({
         txs: [],
         difficulty: 0,
      });
      firstNode.miner.setNextBlockToMine(block);
      let genesisBlock: BtcBlock | undefined;
      do {
         genesisBlock = firstNode.miner.minGenesisBlock();
      } while (!genesisBlock);
      firstNode.addBlock(genesisBlock);
      utxoSet.handleNewlyMinedBlock(genesisBlock);
      for (const n of allNodes) {
         n.addBlock(genesisBlock);
      }
   }

   const mineBlock = async (nodeIdx: number) => {
      const nextNode = allNodes[nodeIdx];
      const txs = nextNode.mempool.getAllTxs();
      const block = nextNode.blockchain.createEmptyBlock({
         txs: txs,
         difficulty: 0,
      });
      nextNode.miner.setNextBlockToMine(block);
      let nextBlock: BtcBlock | undefined;
      let counter = 0;
      await sleep(0);
      do {
         counter++;
         if (counter % 5 === 1) await sleep(0);
         nextBlock = nextNode.miner.mineNextBlock(block);
      } while (!nextBlock);
      nextNode.addBlock(nextBlock);
      utxoSet.handleNewlyMinedBlock(nextBlock);
      for (let i = 0; i < allNodes.length; i++) {
         allNodes[i].addBlock(nextBlock);
      }
   };

   for (let i = 1; i < allNodes.length; i++) {
      await mineBlock(i);
   }

   for (const outNode of allNodes) {
      const data = { units: 50, to: 150 };
      const tx = outNode.wallet.splitUTXOs(data);
      for (const inNode of allNodes) {
         inNode.mempool.add(tx);
      }
   }

   const randIdx = randNum({ min: 0, max: 126 });
   await mineBlock(randIdx);

   bus.fire("gameLoaded", true);
};
