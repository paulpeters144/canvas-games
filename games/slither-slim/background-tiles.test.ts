import * as PIXI from "pixi.js";
import { describe, expect, it } from "vitest";
import { createGameTiles } from "./background-tiles";

describe("#GameTiles", async () => {
   const texture = fakeTextures()[0];

   it("should work", () => {
      const gameTiles = createGameTiles({ texture, gridSize: { row: 5, col: 5 } });
      const { rowIdx, colIdx } = { rowIdx: 2, colIdx: 3 };

      const tile = gameTiles.getTileFromIndexPos({ row: rowIdx, col: colIdx });

      const expectedXPos = rowIdx * tile.sprite.width + tile.sprite.width * 0.5;
      const expectedYPos = colIdx * tile.sprite.height + tile.sprite.height * 0.5;

      expect(tile.sprite.x).toBe(expectedXPos);
      expect(tile.sprite.y).toBe(expectedYPos);
   });
});

const fakeTextures = (): PIXI.Texture[] => {
   let assetsBase64Str = `data:image/png;base64,iVBORw0KGgoAAAANSUhEU
      gAAABoAAAAlCAYAAABcZvm2AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJ
      lYWR5ccllPAAAAWNJREFUeNrsV8sNwjAMbUqBBWACxB2pQ8AKcGALTsAJuDEFB
      1gBhuDAuWICmICPQh01pXWdJqEFcaglRGRbfonjPLuMc+5QwhjLGEJfZusjxZO
      L9akZKye9G98vPMfvsAx4qBfKwfzBL9s6uUHpI6U/u7+BKGkNb/H6umtk7MczF
      0HyfKS4zo/k/4AgTV8DOizrqX8oECgC+MGa8lGJp9sJDiAB8nyqYoglvJOPbP9
      7IqoATGxWVZeXJlMQwYHA3piF8wJIblOVNBBxe3TPMLoHIKtxrbS7AAbBrA4Y5
      NaPAXf8LjN6wKZ0RaZOnlAFZnuXInVR4FTE6eYp0olPhhshtXsAwY3PquoAJNk
      IY33U7HTs7hYBwV24ItUKqDwgKF3VzAZ6k8HF+B1BMF8xRJbeJoqMXHZAAQ1kw
      oluURCdzepEugGEImBrIADB7I4lyfbJLlw92FKE6b5hVd+ktv4vAQYASMWxvlA
      AvcsAAAAASUVORK5CYII=`.replaceAll("\n", "");

   assetsBase64Str = assetsBase64Str.replaceAll(" ", "");

   const bunnyImage = new Image();
   bunnyImage.src = assetsBase64Str;

   return [
      PIXI.Texture.from(bunnyImage),
      PIXI.Texture.from(bunnyImage),
      PIXI.Texture.from(bunnyImage),
      PIXI.Texture.from(bunnyImage),
      PIXI.Texture.from(bunnyImage),
   ];
};
