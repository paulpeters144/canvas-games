import * as PIXI from "pixi.js";
import { test } from "vitest";
import { Entity } from "./model.entity";
import { EntityStore } from "./store.entity";

class Player extends Entity {
   public name: string;
   constructor(name: string) {
      super(new PIXI.Container());
      this.name = name;
   }
}

class Enemy extends Entity {
   public name: string;
   constructor(name: string) {
      super(new PIXI.Container());
      this.name = name;
   }
}

test("test", () => {
   const entityStore = new EntityStore({ gameRef: new PIXI.Container() });
   const p1 = new Player("Alice");
   const p2 = new Player("Bob");
   const e1 = new Enemy("Goblin");

   entityStore.add(p1, p2, e1);

   const players = entityStore.getAll(Player);
   console.log(players);

   console.log(entityStore.firstOrDefault(Enemy));

   entityStore.remove(p1, e1);

   console.log("after deletion");
   console.log(players);
   console.log(entityStore.firstOrDefault(Enemy));
});
