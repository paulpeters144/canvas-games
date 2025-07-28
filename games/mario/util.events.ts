import type { Position } from "./types";

export type EventMap = {
   eventName: { count: number };
   brickBrake: Position;
   brickBump: { id: string };
   qBlockBump: { id: string };
   coinAnim: Position;
};
