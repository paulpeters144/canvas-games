import * as PIXI from "pixi.js";
import { test } from "vitest";
import type { AssetName, GameAssets } from "./assets";
import { createGameVars } from "./game.vars";
import { createBtcNode } from "./model.btc-node";
import type { UTXO } from "./types";
import { standard } from "./util";

const createGameAssetsMock = (): GameAssets => {
   const bunnyBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAA" +
      "AXNSR0IArs4c6QAAAC5JREFUCJljZEACb+9d+Y/MZ2HAAoSV" +
      "dBgxBGE64SYgG4XOZiLaOHQ+IzYFMBMAZY8hvY6ArJ4AAAAA" +
      "SUVORK5CYII=";

   const bunnyImage = new Image();
   bunnyImage.src = bunnyBase64;
   const simpleTexture = PIXI.Texture.from(bunnyImage);
   return {
      createSprite: (name: AssetName) => new PIXI.Sprite(simpleTexture),
      getTexture: (name: AssetName) => simpleTexture,
      load: async () => Promise.resolve(),
   };
};

test("nodeConnection", () => {
   const gameVars = createGameVars(
      new PIXI.Application(),
      new PIXI.Container(),
      createGameAssetsMock(),
   );
   const nodes = Array.from({ length: 5 }).map(() => {
      const n = createBtcNode({ gameVars });
      n.wallet.setNewUTXOs(createUTXOs(20));
      return n;
   });
   for (const outerNode of nodes) {
      for (const innerNode of nodes) {
         outerNode.connections().connect(innerNode);
         innerNode.connections().connect(outerNode);
      }
   }
   nodes[0].sendBtc({ units: 1, node: nodes[1] });
});

const createUTXOs = (len: number) => {
   const utxos: UTXO[] = Array.from({ length: len }).map((_, i) => {
      return {
         id: standard.idStr(),
         value: standard.numAsStr(i + 1),
         owner: "",
      };
   });
   return utxos;
};
