import { maybeResize } from "games/util";
import * as PIXI from "pixi.js";

const BASE_PATH = "game-imgs/slither-slim";

export async function createSlitherSlimGame(app: PIXI.Application) {
   const sceneEngine = newSceneEngine(app);
   sceneEngine.next(gameScene);
}

export interface IScene {
   load: (game: PIXI.ContainerChild) => Promise<void>;
   update: (tick: PIXI.Ticker) => void;
}

export const newSceneEngine = (app: PIXI.Application) => {
   let gameTicker: PIXI.Ticker | undefined;
   let currentScene: IScene | undefined;

   const game: PIXI.Container = new PIXI.Container();

   app.stage.addChild(game);

   return {
      next: async (nextScene: (game: PIXI.ContainerChild) => IScene) => {
         game.removeChildren();
         game.removeAllListeners();

         if (gameTicker) gameTicker.destroy();

         currentScene = nextScene(game);
         const update = (tick: PIXI.Ticker) => {
            maybeResize({ app, game });
            currentScene?.update(tick);
         };
         gameTicker = new PIXI.Ticker().add(update);

         await currentScene.load(game);

         gameTicker.start();
      },
   };
};

export const gameScene = (game: PIXI.ContainerChild): IScene => {
   return {
      load: async () => {
         const arr = Array.from({ length: 5 });
         const loadAsset = (str: string) => PIXI.Assets.load(str);
         const promises = arr.map((_, idx) => loadAsset(`${BASE_PATH}/box-${idx}.png`));
         const assets = await Promise.all(promises);
         loadBackground({ game, assets });
      },

      update: (_tick: PIXI.Ticker) => {},
   };
};

const loadBackground = (props: { game: PIXI.ContainerChild; assets: PIXI.Texture[] }) => {
   const { game, assets } = props;
   const getRandomTile = (): PIXI.Sprite => {
      if (assets.length === 0) {
         throw new Error("The 'tiles' array is empty. Cannot get a random tile.");
      }

      const randomIndex = Math.floor(Math.random() * assets.length);
      const texture = assets[randomIndex];
      const result = new PIXI.Sprite(texture);
      return result;
   };

   const { rows, col } = { rows: 15, col: 25 };
   for (let i = 0; i < Array.from({ length: rows * col }).length; i++) {
      const tile = getRandomTile();
      tile.scale.set(0.25);
      tile.anchor.set(0.5, 0.5);
      const cords = getCoordsFromIndex(i, col);
      tile.x = cords.row * tile.width + tile.width * 0.5;
      tile.y = cords.col * tile.height + tile.height * 0.5;
      game.addChild(tile);
   }
};

function getCoordsFromIndex(index: number, numCols: number): { col: number; row: number } {
   if (numCols <= 0) {
      throw new Error("Number of columns must be a positive integer.");
   }
   if (index < 0) {
      throw new Error("Index must be a non-negative integer.");
   }

   const row = index % numCols;
   const col = Math.floor(index / numCols);

   return { col, row };
}
