import { GameGallery } from "~/welcome/welcome";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
   return [
      { title: "Canvas Games" },
      { name: "description", content: "Just here to learn making games with the canvas" },
   ];
}

export default function Home() {
   return <GameGallery />;
}
