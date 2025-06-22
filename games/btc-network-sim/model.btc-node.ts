import * as PIXI from "pixi.js";
import type { GameAssets } from "./assets";
import type { GameVars } from "./game.vars";
import type { Position } from "./types";

interface BtcNodeProps {
   assets: GameAssets;
   gameVars: GameVars;
   pos: Position;
}

export const createBtcNode = (props: BtcNodeProps) => {
   const { assets, gameVars, pos } = props;
   const { game } = gameVars;
   const createdAt = new Date();

   const width = 37;
   const height = 43;
   const frames = 5;
   const scale = 2.115;

   const texture = assets.getTexture("server-anim-coin");
   const offNode = assets.createSprite("server-off");
   offNode.texture.source.scaleMode = "nearest";
   offNode.visible = false;
   offNode.scale.set(scale);

   let buffer = 0;
   const textures = Array.from({ length: frames }, (_, i) => {
      const t = new PIXI.Texture({
         source: texture.source,
         frame: new PIXI.Rectangle(width * i + buffer, 0, width, height),
      });
      buffer += 1;
      t.source.scaleMode = "nearest";
      return t;
   });

   const anim = new PIXI.AnimatedSprite({ textures });
   anim.x = pos.x;
   anim.y = pos.y;
   anim.scale.set(scale);
   anim.animationSpeed = 0.07;
   anim.play();

   game.addChild(anim);
   game.addChild(offNode);

   const setRunning = (valueChange: boolean) => {
      anim.visible = valueChange;
      offNode.visible = !valueChange;

      valueChange === true
         ? anim.position.set(anim.x, anim.y)
         : offNode.position.set(anim.x, anim.y);
   };

   return {
      anim,
      setRunning,
      createdAt: () => createdAt,
   };
};
