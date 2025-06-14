import * as PIXI from "pixi.js";
import { BASE_PATH } from "./main";
import { type SnakeSegment, createSegment } from "./snake.segment";

interface createSnakeProps {
   head: PIXI.Texture;
   dead: PIXI.Texture;
   body: PIXI.Texture;
}

export interface Snake {
   head: SnakeSegment;
   body: SnakeSegment[];
   update: (tick: PIXI.Ticker) => void;
   addSegment: (game: PIXI.ContainerChild) => void;
   reset: (game: PIXI.ContainerChild) => void;
}

export const createSnake = (props: createSnakeProps): Snake => {
   const { head: headAsset, dead: deadAsset, body: bodyAsset } = props;
   const head = createSegment(headAsset);
   const body: SnakeSegment[] = [];

   const update = (tick: PIXI.Ticker) => {
      head.update(tick);
      for (let i = 0; i < body.length; i++) {
         body[i].update(tick);
      }
   };

   const reset = (game: PIXI.ContainerChild) => {
      body.map((s) => {
         game.removeChild(s.sprite);
         s.sprite.destroy();
      });
      body.length = 0;
   };

   const addSegment = (game: PIXI.ContainerChild) => {
      const newSegment = createSegment(bodyAsset);

      if (body.length === 0) {
         const { x, y } = head.sprite;
         newSegment.placeAt({ x, y });
      } else {
         const { x, y } = body[body.length - 1].sprite;
         newSegment.placeAt({ x, y });
      }

      body.push(newSegment);
      game.addChild(newSegment.sprite);
   };

   return {
      head,
      body,
      update,
      addSegment,
      reset,
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
