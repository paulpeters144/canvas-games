import * as PIXI from "pixi.js";

export function exampleGame(app: PIXI.Application) {
   app.canvas.style.width = "100%";
   app.canvas.style.height = "100%";
   const graphics = new PIXI.Graphics();

   graphics.rect(50, 50, 100, 100);
   graphics.fill(0x650a5a);
   graphics.stroke({ width: 2, color: 0xfeeb77 });

   graphics.circle(250, 100, 50);
   graphics.fill(0x650a5a);
   graphics.stroke({ width: 2, color: 0xfeeb77 });

   app.stage.addChild(graphics);
}
