import fs from "node:fs";
import path from "node:path";
import * as PIXI from "pixi.js";
import { expect, test } from "vitest";
import { createTiledMap } from "./game.atlas";

test("simple test", () => {
   const json = getAtlasMetadata();
   const atlas = getAtlasTexture();
   const tileMap = createTiledMap({ json, atlas });
   expect(1 + 1).toBe(2);
});

const getAtlasTexture = () => {
   const imagePath = path.resolve("public/game-imgs/mario/mario-atlas.png");
   const imageBuffer = fs.readFileSync(imagePath);
   const base64Image = imageBuffer.toString("base64");

   const dataUri = `data:image/png;base64,${base64Image}`;
   const img = new Image(1200, 1200);
   img.src = dataUri;

   const base = new PIXI.ImageSource(img);
   base.width = 288;
   base.height = 288;
   const texture = PIXI.Texture.from(base.source);

   return texture;
};

const getAtlasMetadata = (): string => {
   const filePath = "public/game-imgs/mario/mario-map-1-1.json";
   const test = path.resolve(filePath);
   const json = fs.readFileSync(test, "utf-8");
   return json;
};
