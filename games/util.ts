import type * as PIXI from "pixi.js";

export const VIRTUAL_W = 854;
export const VIRTUAL_H = 480;

export const resizeGame = (props: GameProps) => {
   const { game, app } = props;

   if (!game || !app) return;

   const { width: screenWidth, height: screenHeight } = app.screen;
   const screenAspectRatio = screenWidth / screenHeight;
   const gameAspectRatio = VIRTUAL_W / VIRTUAL_H;

   if (screenAspectRatio > gameAspectRatio) {
      const scaleFactor = screenHeight / VIRTUAL_H;
      const xPos = (screenWidth - VIRTUAL_W * scaleFactor) / 2;
      game.scale.set(scaleFactor, scaleFactor);
      game.position.set(xPos, 0);
   } else {
      const scaleFactor = screenWidth / VIRTUAL_W;
      const yPos = (screenHeight - VIRTUAL_H * scaleFactor) / 2;
      game.scale.set(scaleFactor, scaleFactor);
      game.position.set(0, yPos);
   }

   //    if (!letterboxContainer || !topBox || !bottomBox || !leftBox || !rightBox) {
   //       initializeLetterboxes(app);
   //    }

   //    updateLetterboxes(app);
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
