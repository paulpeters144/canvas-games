import * as PIXI from "pixi.js";
import { BASE_PATH } from "./main";
import { type Head, createHead } from "./snake.head";

interface createSnakeProps {
   head: PIXI.Texture;
   dead: PIXI.Texture;
   body: PIXI.Texture;
}

export interface Snake {
   head: Head;
   update: (_tick: PIXI.Ticker) => void;
}

export const createSnake = (props: createSnakeProps): Snake => {
   const { head: headAsset, dead: deadAsset, body: bodyAsset } = props;
   const head = createHead(headAsset);

   const update = (tick: PIXI.Ticker) => {
      head.update(tick);
   };

   return {
      head,
      update,
   };
};

export const loadSnakeTextures = async () => {
   const snakeHeadAsset: Promise<PIXI.Texture> = PIXI.Assets.load(`${BASE_PATH}/snake-head.png`);
   const snakeDeadAsset: Promise<PIXI.Texture> = PIXI.Assets.load(`${BASE_PATH}/dead-snake.png`);
   const segmentAsset: Promise<PIXI.Texture> = PIXI.Assets.load(`${BASE_PATH}/snake-body.png`);
   const assets = await Promise.all([snakeHeadAsset, snakeDeadAsset, segmentAsset]);

   for (const asset of assets) asset.source.scaleMode = "nearest";

   return {
      head: assets[0],
      dead: assets[1],
      body: assets[2],
   };
};
