import type { InputCtrl } from "../input.control";
import type { EntityModel } from "../model.entity";

export class SystemJump {
   private _inputCtrl: InputCtrl;
   private _velocity = 100;
   constructor(props: { inputCtrl: InputCtrl }) {
      const { inputCtrl } = props;
      this._inputCtrl = inputCtrl;
   }

   update(props: { mario: EntityModel }) {
      const { mario } = props;
      if (!mario.isJumping && this._inputCtrl.btn.z.data.pressed) {
         mario.isJumping = true;
         const nextPos = { x: mario.sprite.x, y: mario.sprite.y - 50 };
         mario.setNextPos(nextPos);
         return;
      }
      if (mario.isJumping && mario.isIdleY) {
         mario.isJumping = false;
      }
   }
}
