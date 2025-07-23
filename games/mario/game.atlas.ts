import { OutlineFilter } from "pixi-filters";
import * as PIXI from "pixi.js";

const LayerNameArr = [
   "blue-bg",
   "layer-1",
   "obj-pipes",
   "obj-ground",
   "obj-q-blocks",
   "obj-brick-blocks",
] as const;

type LayerName = (typeof LayerNameArr)[number];

interface TiledLayerBase {
   id: number;
   name: LayerName;
   opacity: number;
   type: string;
   visible: boolean;
   x: number;
   y: number;
}

interface TiledTileLayer extends TiledLayerBase {
   data: number[];
   height: number;
   width: number;
   type: "tilelayer";
}

interface TiledObjectGroup extends TiledLayerBase {
   draworder: string;
   objects: TiledObject[];
   type: "objectgroup";
}

interface TiledObject {
   height: number;
   id: number;
   name: string;
   rotation: number;
   type: string;
   visible: boolean;
   width: number;
   x: number;
   y: number;
   gid?: number;
}

interface TiledTileset {
   firstgid: number;
   source: string;
}

interface TiledMapMetaData {
   compressionlevel: number;
   height: number;
   infinite: boolean;
   layers: (TiledTileLayer | TiledObjectGroup)[];
   nextlayerid: number;
   nextobjectid: number;
   orientation: string;
   renderorder: string;
   tiledversion: string;
   tileheight: number;
   tilesets: TiledTileset[];
   tilewidth: number;
   type: string;
   version: string;
   width: number;
}

export interface TiledMap {}

const colorSampler = (() => {
   let captured = false;
   let hex = "";
   return {
      sampledHex: () => hex,
      hasSampled: () => !!hex,
      getSampleFrom: async (sprite: PIXI.Sprite) => {
         if (captured) return;
         captured = true;
         const spriteProps = { ...sprite };

         const renderer = await PIXI.autoDetectRenderer(spriteProps);
         const renderTexture = PIXI.RenderTexture.create(spriteProps);
         renderer.render({ container: sprite, target: renderTexture });
         const { pixels } = renderer.extract.pixels(renderTexture);

         const pixelHexColor = rgbaIntsToHex({
            r: pixels[0],
            g: pixels[1],
            b: pixels[2],
            a: pixels[3],
         });

         hex = pixelHexColor || "#FFFFFF";
         renderer.destroy();
      },
   };
})();

export const fetchAtlasMetadata = async (): Promise<string> => {
   const mapMetaData = await fetch("game-imgs/mario/mario-map-1-1.json");
   const json = await mapMetaData.json();
   return JSON.stringify(json);
};

function rgbaIntsToHex(props: { r: number; g: number; b: number; a: number }):
   | string
   | null {
   const { r, g, b, a } = props;
   if (
      !Number.isInteger(r) ||
      r < 0 ||
      r > 255 ||
      !Number.isInteger(g) ||
      g < 0 ||
      g > 255 ||
      !Number.isInteger(b) ||
      b < 0 ||
      b > 255 ||
      !Number.isInteger(a) ||
      a < 0 ||
      a > 255
   ) {
      console.error(
         `Invalid RGBA component value(s). All must be integers between 0 and 255. Received: R=${r}, G=${g}, B=${b}, A=${a}`,
      );
      return null;
   }

   const toHex = (c: number): string => {
      const hex = c.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
   };

   let hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

   if (a < 255) {
      hexColor += toHex(a);
   }

   return hexColor.toUpperCase();
}

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

   const createTileLayer = async (layer: TiledTileLayer) => {
      const layerContainer = new PIXI.Container();
      let tileIndex = -1;

      for (const tileId of layer.data) {
         tileIndex++;
         if (tileId === 0) continue;
         const tileTexture = getTileAt(tileId);
         const tileSprite = new PIXI.Sprite(tileTexture);
         if (tileId === 143) {
            if (!colorSampler.hasSampled()) {
               await colorSampler.getSampleFrom(tileSprite);
            }
            const color = colorSampler.sampledHex();
            const filter = new OutlineFilter({ thickness: 1, color });
            tileSprite.filters = [filter];
         }

         tileSprite.x = (tileIndex % metaData.width) * metaData.tilewidth;
         tileSprite.y = Math.floor(tileIndex / metaData.width) * metaData.tileheight;
         layerContainer.addChild(tileSprite);
      }
      return layerContainer;
   };

   const createObjectGroup = (group: TiledObjectGroup) => {
      const objectContainer = new PIXI.Container();

      for (const mapObject of group.objects) {
         if (mapObject.gid) {
            if (mapObject.gid === 0) continue;
            const objectTexture = getTileAt(mapObject.gid);
            const objectSprite = new PIXI.Sprite(objectTexture);
            objectSprite.x = mapObject.x;
            objectSprite.y = mapObject.y;
            objectContainer.addChild(objectSprite);
         }
      }
      return objectContainer;
   };

   for (const layer of metaData.layers) {
      if (layer.type === "tilelayer") {
         const layerCtr = await createTileLayer(layer);
         ctr.addChild(layerCtr);
      }
      if (layer.type === "objectgroup") {
         const layerCtr = createObjectGroup(layer);
         ctr.addChild(layerCtr);
      }
   }

   const objects = metaData.layers
      .filter((layer) => layer.type === "objectgroup")
      .flatMap((layer) =>
         layer.objects.map(
            (obj) => new PIXI.Rectangle(obj.x, obj.y, obj.width, obj.height),
         ),
      );

   return { ctr, metaData, objects };
};
