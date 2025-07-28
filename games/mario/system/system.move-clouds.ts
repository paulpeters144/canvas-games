import type * as PIXI from "pixi.js";
import type { Cloud, CloudFactory } from "../factory.cloud";
import { randNum } from "../util";

export class SystemCloudsMove {
   private _cloudFactory: CloudFactory;
   private _clouds: Cloud[] = [];
   private _floatSpeed = 0.2;
   constructor(props: { cloudFactory: CloudFactory; game: PIXI.Container }) {
      const { cloudFactory, game } = props;
      this._cloudFactory = cloudFactory;
      const cloud1 = this._cloudFactory.createCloud1();
      cloud1.ctr.y = 25;

      const cloud2 = this._cloudFactory.createCloud2();
      space(cloud2).behind(cloud1);

      const cloud3 = this._cloudFactory.createCloud1();
      space(cloud3).behind(cloud2);
      cloud3.ctr.y = cloud1.ctr.y;

      const cloud4 = this._cloudFactory.createCloud3();
      space(cloud4).behind(cloud3);

      this._clouds.push(cloud1, cloud2, cloud3, cloud4);
      game.addChild(cloud1.ctr, cloud2.ctr, cloud3.ctr, cloud4.ctr);
   }

   update(tick: PIXI.Ticker) {
      for (let i = 0; i < this._clouds.length; i++) {
         const c = this._clouds[i];
         c.ctr.x -= tick.deltaTime * this._floatSpeed;
         if (c.ctr.x + c.ctr.width + 10 < 0) {
            const desc = (a: Cloud, b: Cloud) => b.ctr.x - a.ctr.x;
            const furthestCloudToRight = this._clouds.sort(desc)[0];
            space(c).behind(furthestCloudToRight);
         }
      }
   }
}

const space = (cloud1: Cloud) => {
   const behind = (cloud2: Cloud) => {
      const spaceVal = 150 + randNum({ min: 10, max: 75 });
      cloud1.ctr.x = cloud2.ctr.x + spaceVal;
   };

   return { behind };
};
