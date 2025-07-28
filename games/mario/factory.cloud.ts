import * as PIXI from "pixi.js";
import type { TiledMapMetaData, TiledTileLayer } from "./game.atlas";

export class Cloud {
   ctr: PIXI.Container;

   constructor(ctr: PIXI.Container) {
      this.ctr = ctr;
   }
}

export interface CloudFactory {
   createCloud1: () => Cloud;
   createCloud2: () => Cloud;
   createCloud3: () => Cloud;
}

export const createCloudFactory = (props: {
   json: string;
   atlas: PIXI.Texture;
}): CloudFactory => {
   const metaData: TiledMapMetaData = JSON.parse(props.json);

   const getTileAt = (idx: number) => {
      const tileW = metaData.tilewidth;
      const tileH = metaData.tileheight;
      const columnLen = props.atlas.width / tileW;

      const colIdx = (idx - 1) % columnLen;
      const rowIdx = Math.floor((idx - 1) / columnLen);

      const x = tileW * colIdx;
      const y = tileH * rowIdx;
      const tileTexture = new PIXI.Texture({
         source: props.atlas.source,
         frame: new PIXI.Rectangle(x, y, tileW, tileH),
      });
      tileTexture.source.scaleMode = "nearest";
      return tileTexture;
   };

   const createCloud1 = () => {
      const ctr = new PIXI.Container();

      const texture1 = new PIXI.Sprite(getTileAt(64));
      texture1.x = 0;
      texture1.y = 0;

      const texture2 = new PIXI.Sprite(getTileAt(82));
      texture2.x = 0;
      texture2.y = texture1.height;

      const texture3 = new PIXI.Sprite(getTileAt(65));
      texture3.x = texture1.width;
      texture3.y = 0;

      const texture4 = new PIXI.Sprite(getTileAt(83));
      texture4.x = texture3.x;
      texture4.y = texture3.height;

      ctr.addChild(texture1, texture2, texture3, texture4);

      return new Cloud(ctr);
   };

   const createCloud2 = () => {
      const ctr = new PIXI.Container();

      const texture1 = new PIXI.Sprite(getTileAt(55));

      const texture2 = new PIXI.Sprite(getTileAt(56));
      texture2.x = texture1.x + texture1.width;

      const texture3 = new PIXI.Sprite(getTileAt(57));
      texture3.x = texture2.x + texture2.width;

      const texture4 = new PIXI.Sprite(getTileAt(73));
      texture4.x = 0;
      texture4.y = texture1.y + texture1.height;

      const texture5 = new PIXI.Sprite(getTileAt(74));
      texture5.x = texture4.x + texture4.width;
      texture5.y = texture1.y + texture1.height;

      const texture6 = new PIXI.Sprite(getTileAt(75));
      texture6.x = texture5.x + texture5.width;
      texture6.y = texture1.y + texture1.height;

      ctr.addChild(texture1, texture2, texture3, texture4, texture5, texture6);

      return new Cloud(ctr);
   };

   const createCloud3 = () => {
      const ctr = new PIXI.Container();

      const texture1 = new PIXI.Sprite(getTileAt(59));

      const texture2 = new PIXI.Sprite(getTileAt(60));
      texture2.x = texture1.x + texture1.width;

      const texture3 = new PIXI.Sprite(getTileAt(61));
      texture3.x = texture2.x + texture2.width;

      const texture4 = new PIXI.Sprite(getTileAt(62));
      texture4.x = texture3.x + texture3.width;

      const texture5 = new PIXI.Sprite(getTileAt(77));
      texture5.x = 0;
      texture5.y = texture1.y + texture1.height;

      const texture6 = new PIXI.Sprite(getTileAt(78));
      texture6.x = texture5.x + texture5.width;
      texture6.y = texture1.y + texture1.height;

      const texture7 = new PIXI.Sprite(getTileAt(79));
      texture7.x = texture6.x + texture6.width;
      texture7.y = texture1.y + texture1.height;

      const texture8 = new PIXI.Sprite(getTileAt(80));
      texture8.x = texture7.x + texture7.height;
      texture8.y = texture1.y + texture1.height;

      ctr.addChild(
         texture1,
         texture2,
         texture3,
         texture4,
         texture5,
         texture6,
         texture7,
         texture8,
      );

      return new Cloud(ctr);
   };

   return { createCloud1, createCloud2, createCloud3 };
};

export const createTiledMap = async (props: {
   json: string;
   atlas: PIXI.Texture;
}) => {
   const ctr = new PIXI.Container();
   const metaData: TiledMapMetaData = JSON.parse(props.json);

   const getTileAt = (idx: number) => {
      const tileW = metaData.tilewidth;
      const tileH = metaData.tileheight;
      const columnLen = props.atlas.width / tileW;

      const colIdx = (idx - 1) % columnLen;
      const rowIdx = Math.floor((idx - 1) / columnLen);

      const x = tileW * colIdx;
      const y = tileH * rowIdx;
      const tileTexture = new PIXI.Texture({
         source: props.atlas.source,
         frame: new PIXI.Rectangle(x, y, tileW, tileH),
      });
      tileTexture.source.scaleMode = "nearest";
      return tileTexture;
   };

   const createTileLayer = (layer: TiledTileLayer) => {
      const layerContainer = new PIXI.Container();
      let tileIndex = -1;

      for (const tileId of layer.data) {
         tileIndex++;
         if (tileId === 0) continue;
         const tileTexture = getTileAt(tileId);
         const tileSprite = new PIXI.Sprite(tileTexture);

         tileSprite.x = (tileIndex % metaData.width) * metaData.tilewidth;
         tileSprite.y = Math.floor(tileIndex / metaData.width) * metaData.tileheight;
         layerContainer.addChild(tileSprite);
      }
      return layerContainer;
   };

   for (const layer of metaData.layers) {
      if (layer.type === "tilelayer") {
         const layerCtr = createTileLayer(layer);
         ctr.addChild(layerCtr);
      }
   }
};
