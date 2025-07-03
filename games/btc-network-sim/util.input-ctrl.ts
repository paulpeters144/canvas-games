import { bus } from "./main";

export class BtnState {
   private on = false;
   private onOnce = false;
   private off = false;
   private offOnce = false;
   private lastReleaseMs = 0;
   private lastPressMs = 0;

   public press = () => {
      this.on = true;
      this.onOnce = true;
      this.offOnce = false;
      this.off = false;
      this.lastPressMs = performance.now();
   };

   public release = () => {
      this.on = false;
      this.onOnce = false;
      this.offOnce = true;
      this.off = true;
      this.lastReleaseMs = performance.now();
   };

   public get lastPress() {
      return this.lastPressMs;
   }

   public get lastRelease() {
      return this.lastReleaseMs;
   }

   public get wasPressedOnce() {
      if (this.onOnce) {
         this.onOnce = false;
         this.on = true;
         this.lastPressMs = performance.now();
         return true;
      }
      return false;
   }

   public get wasReleasedOnce() {
      if (this.offOnce) {
         this.offOnce = false;
         this.lastReleaseMs = performance.now();
         return true;
      }
      return false;
   }

   public get data() {
      return {
         pressed: this.on,
         released: this.off,
      };
   }

   public pressHeldAfter = (ms: number): boolean => {
      if (!this.on) return false;
      const now = performance.now();
      const diff = now - this.lastPress;
      return diff > ms;
   };
}

export const createInputCtrl = () => {
   const ctrl = new BtnState();
   const zoomIn = new BtnState();
   const zoomOut = new BtnState();

   const upArrow = new BtnState();
   const downArrow = new BtnState();
   const leftArrow = new BtnState();
   const rightArrow = new BtnState();

   const wheelListener = (event: WheelEvent) => {
      event.preventDefault();
      if (event.deltaY > 0) bus.fire("zoom", "out");
      if (event.deltaY < 0) bus.fire("zoom", "in");
   };

   const pressDownListener = (event: KeyboardEvent) => {
      switch (event.key) {
         case "Control":
            event.preventDefault();
            ctrl.press();
            break;
         case "+":
         case "=":
            event.preventDefault();
            zoomIn.press();
            break;
         case "-":
            event.preventDefault();
            zoomOut.press();
            break;
         case "ArrowUp":
            event.preventDefault();
            upArrow.press();
            break;
         case "ArrowDown":
            event.preventDefault();
            downArrow.press();
            break;
         case "ArrowLeft":
            event.preventDefault();
            leftArrow.press();
            break;
         case "ArrowRight":
            event.preventDefault();
            rightArrow.press();
            break;
      }
   };

   const releaseListener = (event: KeyboardEvent) => {
      switch (event.key) {
         case "Control":
            ctrl.release();
            break;
         case "+":
         case "=":
            zoomIn.release();
            break;
         case "-":
            zoomOut.release();
            break;
         case "ArrowUp":
            upArrow.release();
            break;
         case "ArrowDown":
            downArrow.release();
            break;
         case "ArrowLeft":
            leftArrow.release();
            break;
         case "ArrowRight":
            rightArrow.release();
            break;
      }
   };

   window.addEventListener("keydown", pressDownListener);
   window.addEventListener("keyup", releaseListener);
   window.addEventListener("wheel", wheelListener, { passive: false });

   const destroy = () => {
      window.removeEventListener("keydown", pressDownListener);
      window.removeEventListener("keyup", releaseListener);
      window.removeEventListener("wheel", wheelListener);
   };

   return {
      zoomIn,
      zoomOut,
      destroy,
      upArrow,
      rightArrow,
      downArrow,
      leftArrow,
   };
};
