import * as PIXI from "pixi.js";

export const VIRTUAL_W = 854;
export const VIRTUAL_H = 480;

export async function exampleGame(app: PIXI.Application) {
   const sceneEngine = newSceneEngine(app);
   sceneEngine.next(placeholderScene);
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

         const background = new PIXI.Graphics().rect(0, 0, VIRTUAL_W, VIRTUAL_H).fill(0xffff00);

         game.addChild(background);

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

export const placeholderScene = (game: PIXI.ContainerChild): IScene => {
   return {
      load: async () => {
         const texture = await PIXI.Assets.load("game-imgs/forrest-background.png");
         const imageSprite = new PIXI.Sprite(texture);

         imageSprite.x = 0;
         imageSprite.y = 0;

         game.addChild(imageSprite);
      },

      update: (_tick: PIXI.Ticker) => {},
   };
};

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=- UTIL -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
const createLetterboxes = (app: PIXI.Application): PIXI.Container<PIXI.ContainerChild> => {
   const letterboxContainer = new PIXI.Container();

   const createBox = (): PIXI.Graphics => {
      return new PIXI.Graphics().fill(0x000000).rect(0, 0, 1, 1).fill();
   };

   const topBox = createBox();
   const bottomBox = createBox();
   const leftBox = createBox();
   const rightBox = createBox();

   letterboxContainer.addChild(topBox, bottomBox, leftBox, rightBox);

   const { width: screenWidth, height: screenHeight } = app.screen;
   const screenAspectRatio = screenWidth / screenHeight;
   const gameAspectRatio = VIRTUAL_W / VIRTUAL_H;

   if (screenAspectRatio > gameAspectRatio) {
      const scaleFactor = screenHeight / VIRTUAL_H;
      const scaledGameWidth = VIRTUAL_W * scaleFactor;
      const xOffset = (screenWidth - scaledGameWidth) / 2;

      topBox.visible = bottomBox.visible = false;
      leftBox.visible = rightBox.visible = true;

      leftBox.width = xOffset;
      leftBox.height = screenHeight;
      leftBox.position.set(0, 0);

      rightBox.width = xOffset;
      rightBox.height = screenHeight;
      rightBox.position.set(screenWidth - xOffset, 0);
   } else {
      const scaleFactor = screenWidth / VIRTUAL_W;
      const scaledGameHeight = VIRTUAL_H * scaleFactor;
      const yOffset = (screenHeight - scaledGameHeight) / 2;

      leftBox.visible = rightBox.visible = false;
      topBox.visible = bottomBox.visible = true;

      topBox.width = screenWidth;
      topBox.height = yOffset;
      topBox.position.set(0, 0);

      bottomBox.width = screenWidth;
      bottomBox.height = yOffset;
      bottomBox.position.set(0, screenHeight - yOffset);
   }

   return letterboxContainer;
};

let letterBoxes: PIXI.Container<PIXI.ContainerChild> | undefined;
const resizeGame = (props: GameProps) => {
   const { game, app } = props;

   if (!game || !app) return;

   const { width: screenWidth, height: screenHeight } = app.screen;
   const screenAspectRatio = screenWidth / screenHeight;
   const gameAspectRatio = VIRTUAL_W / VIRTUAL_H;

   if (screenAspectRatio > gameAspectRatio) {
      const scaleFactor = screenHeight / VIRTUAL_H;
      game.scale.set(scaleFactor, scaleFactor);
      game.position.set((screenWidth - VIRTUAL_W * scaleFactor) / 2, 0);
   } else {
      const scaleFactor = screenWidth / VIRTUAL_W;
      game.scale.set(scaleFactor, scaleFactor);
      game.position.set(0, (screenHeight - VIRTUAL_H * scaleFactor) / 2);
   }

   if (letterBoxes) {
      app.stage.removeChild(letterBoxes);
   }
   letterBoxes = createLetterboxes(app);
   app.stage.addChild(letterBoxes);
};

interface GameProps {
   app?: PIXI.Application;
   game?: PIXI.ContainerChild;
}

// TODO: we need to clean up the game when the application closes. right now, the
// ticker still runs once when closing the modal with the below error
// react-dom_client.js?v=109420bd:17987 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
// pixi__js.js?v=109420bd:6539 Uncaught TypeError: Cannot read properties of null (reading 'screen')
//     at get screen (pixi__js.js?v=109420bd:6539:26)
//     at maybeResize (test.ts:156:9)
//     at TickerListener.update [as _fn] (test.ts:38:16)
//     at TickerListener.emit (chunk-WZSKTUMO.js?v=109420bd:7313:14)
//     at _Ticker2.update (chunk-WZSKTUMO.js?v=109420bd:7710:29)
//     at _tick (chunk-WZSKTUMO.js?v=109420bd:7379:14)

export const maybeResize = (props: GameProps) => {
   try {
      const { app, game } = props;

      if (!app?.screen) return;
      if (!game) return;

      if (app.screen.width === game.width) return;

      resizeGame(props);
   } catch (_) {}
};

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=- UTIL -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
