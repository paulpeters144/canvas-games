import { Viewport } from "pixi-viewport";
import type * as PIXI from "pixi.js";

export const createViewport = (app: PIXI.Application, bgCtr: PIXI.Container) => {
   app.canvas.style.border = "2px solid white";
   const viewport = new Viewport({
      screenWidth: app.renderer.view.canvas.width,
      screenHeight: app.renderer.view.canvas.height,
      worldWidth: bgCtr.width,
      worldHeight: bgCtr.height,
      passiveWheel: false,
      events: app.renderer.events,
   });

   window.onresize = () => {
      viewport.resize(
         app.renderer.view.canvas.width,
         app.renderer.view.canvas.height,
         bgCtr.width,
         bgCtr.height,
      );
   };

   app.stage.addChild(viewport);
   viewport.addChild(bgCtr);

   viewport.drag().pinch().wheel();

   viewport.decelerate({
      friction: 0.98,
      minSpeed: 10,
      bounce: 0,
   });

   viewport.clamp({
      //   left: false, // whether to clamp to the left and at what value
      //   right: false, // whether to clamp to the right and at what value
      //   top: false, // whether to clamp to the top and at what value
      //   bottom: false, // whether to clamp to the bottom and at what value
      direction: "all", // (all, x, or y) using clamps of [0, viewport.worldWidth / viewport.worldHeight]; replaces left / right / top / bottom if set
      //   underflow: "center", // where to place world if too small for screen (e.g., top - right, center, none, bottomleft)
   });

   viewport.clampZoom({
      minScale: 1,
      maxScale: 3.85,
   });

   return viewport;
};

//    const background = viewport.addChild(new PIXI.Graphics());
//    background
//       .rect(0, 0, worldWidth, worldHeight)
//       .fill({ color: 0x2c3e50 })
//       .stroke({ width: 5, color: "#FFFFFF" });

//    const createInteractiveBox = (
//       id: number,
//       x: number,
//       y: number,
//       size: number,
//       color: number,
//    ) => {
//       const container = new PIXI.Container();
//       container.position.set(x, y);
//       container.eventMode = "static";
//       container.cursor = "pointer";

//       const box = new PIXI.Sprite(PIXI.Texture.WHITE);
//       box.tint = color;
//       box.width = size;
//       box.height = size;
//       box.anchor.set(0.5);

//       const textStyle = new PIXI.TextStyle({
//          fill: 0xffffff,
//          fontSize: 24,
//          align: "center",
//       });
//       const label = new PIXI.Text(`Box ${id}`, textStyle);
//       label.anchor.set(0.5);
//       label.position.set(0, size / 2 + 20);

//       container.addChild(box);
//       container.addChild(label);

//       container.on("pointertap", () => {
//          viewport.animate({
//             time: 150,
//             position: {
//                x: container.x,
//                y: container.y,
//             },
//             ease: "linear",
//             scale: 1,
//          });
//       });
//       return container;
//    };

//    for (let i = 0; i < 25; i++) {
//       const x = random.range(50, worldWidth - 50);
//       const y = random.range(50, worldHeight - 50);
//       const size = random.range(50, 150);
//       const color = random.randomInt(0xffffff);
//       const box = createInteractiveBox(i + 1, x, y, size, color);
//       viewport.addChild(box);
//    }

//    const resetButton = new PIXI.Graphics();
//    resetButton.beginFill(0x34495e);
//    resetButton.drawRoundedRect(0, 0, 150, 50, 10);
//    resetButton.endFill();
//    resetButton.eventMode = "static";
//    resetButton.cursor = "pointer";
//    resetButton.position.set(app.screen.width - 160, 10);
//    resetButton.zIndex = 1000;

//    const resetTextStyle = new PIXI.TextStyle({
//       fill: 0xffffff,
//       fontSize: 20,
//       align: "center",
//    });
//    const resetText = new PIXI.Text("Reset View", resetTextStyle);
//    resetText.anchor.set(0.5);
//    resetText.position.set(75, 25);
//    resetButton.addChild(resetText);

//    resetButton.on("pointertap", () => {
//       viewport.animate({
//          time: 250,
//          position: { x: worldWidth / 2, y: worldHeight / 2 },
//          scale: 0.8,
//          ease: "linear",
//       });
//    });

//    app.stage.addChild(resetButton);

//    app.ticker.add(() => {
//       resetButton.position.set(app.screen.width - 160, 10);
//    });
// };
