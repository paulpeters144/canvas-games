import { describe, expect, it } from "vitest";
import { eBus } from "./event-bus";

type EventMap = {
   userLoggedIn: { userId: string };
};

describe("eBus", () => {
   it("should call the listener when fire is called", () => {
      const bus = eBus<EventMap>();

      bus.on("userLoggedIn", (userLoggedIn) => {
         expect(userLoggedIn.userId).toBe("12345");
      });

      bus.fire("userLoggedIn", { userId: "12345" });
   });

   it("should remove listeners using id", () => {
      const bus = eBus<EventMap>();

      bus.on("userLoggedIn", () => {});
      bus.on("userLoggedIn", () => {});
      bus.on("userLoggedIn", () => {});
      bus.on("userLoggedIn", () => {});
      bus.on("userLoggedIn", () => {});

      const subscriber1 = bus.on("userLoggedIn", () => {});
      const subscriber2 = bus.on("userLoggedIn", () => {});
      bus.remove(subscriber1);
      bus.remove(subscriber2);

      expect(bus.count()).toBe(5);
   });

   it("should clear all listeners", () => {
      const bus = eBus<EventMap>();
      bus.on("userLoggedIn", () => {});
      bus.on("userLoggedIn", () => {});
      bus.on("userLoggedIn", () => {});
      bus.on("userLoggedIn", () => {});
      bus.on("userLoggedIn", () => {});

      bus.clear();

      expect(bus.count()).toBe(0);
   });
});
