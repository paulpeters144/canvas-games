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

const buttonNames = [
   "Control",
   "+",
   "=",
   "-",
   "ArrowUp",
   "ArrowDown",
   "ArrowLeft",
   "ArrowRight",
   "Escape",
] as const;

type ButtonName = (typeof buttonNames)[number];

export const createInputCtrl = () => {
   const btnStates: Record<ButtonName, BtnState> = Object.fromEntries(
      buttonNames.map((key) => [key, new BtnState()]),
   ) as Record<ButtonName, BtnState>;

   const pressDownListener = (event: KeyboardEvent) => {
      const key = event.key as ButtonName;
      if (key in btnStates) {
         event.preventDefault();
         btnStates[key].press();
      } else if (key === "=") {
         event.preventDefault();
         btnStates["-"].press();
      }
   };

   const releaseListener = (event: KeyboardEvent) => {
      const key = event.key as ButtonName;
      if (key in btnStates) {
         btnStates[key].release();
      } else if (key === "=") {
         btnStates["+"].release();
      }
   };

   window.addEventListener("keydown", pressDownListener);
   window.addEventListener("keyup", releaseListener);

   const destroy = () => {
      window.removeEventListener("keydown", pressDownListener);
      window.removeEventListener("keyup", releaseListener);
   };

   return {
      destroy,
      btn: btnStates,
   };
};

const test = createInputCtrl();
