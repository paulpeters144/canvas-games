export type EventMap = {
   zoom: "in" | "out" | "reset";
   node: { count: number };
   randSend: { fromId: string; units: number };
};
