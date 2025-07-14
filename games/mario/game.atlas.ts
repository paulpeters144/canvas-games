import type { GameAssets } from "./assets";

interface TiledLayerBase {
   id: number;
   name: string;
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

interface TiledMap {
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

export const createGameAtlas = async (assets: GameAssets) => {
   const mapMetaData = await fetch("game-imgs/mario/mario-map-1-1.json")
      .then((res) => res.json())
      .then((res) => res as TiledMap);
};
