import { exampleGame } from "games/simple/test";
import * as PIXI from "pixi.js";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

const games = [
   {
      id: "placeholder1",
      title: "Placeholder",
      image: "https://imgs.search.brave.com/_bEUvkX0umM3x5ygwOYwiFilG8kLuIpG1i71-Al0qHI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA1Lzk5LzcyLzA2/LzM2MF9GXzU5OTcy/MDYyNV9OMlU4QVF6/aFM1eTdsbHJwMkFN/QVFtS0w0QjZuV0hL/VC5qcGc",
   },
   {
      id: "placeholder2",
      title: "Placeholder",
      image: "https://imgs.search.brave.com/_bEUvkX0umM3x5ygwOYwiFilG8kLuIpG1i71-Al0qHI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA1Lzk5LzcyLzA2/LzM2MF9GXzU5OTcy/MDYyNV9OMlU4QVF6/aFM1eTdsbHJwMkFN/QVFtS0w0QjZuV0hL/VC5qcGc",
   },
   {
      id: "placeholder3",
      title: "Placeholder",
      image: "https://imgs.search.brave.com/_bEUvkX0umM3x5ygwOYwiFilG8kLuIpG1i71-Al0qHI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA1Lzk5LzcyLzA2/LzM2MF9GXzU5OTcy/MDYyNV9OMlU4QVF6/aFM1eTdsbHJwMkFN/QVFtS0w0QjZuV0hL/VC5qcGc",
   },
   {
      id: "placeholder4",
      title: "Placeholder",
      image: "https://imgs.search.brave.com/_bEUvkX0umM3x5ygwOYwiFilG8kLuIpG1i71-Al0qHI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA1Lzk5LzcyLzA2/LzM2MF9GXzU5OTcy/MDYyNV9OMlU4QVF6/aFM1eTdsbHJwMkFN/QVFtS0w0QjZuV0hL/VC5qcGc",
   },
   {
      id: "placeholder5",
      title: "Placeholder",
      image: "https://imgs.search.brave.com/_bEUvkX0umM3x5ygwOYwiFilG8kLuIpG1i71-Al0qHI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA1Lzk5LzcyLzA2/LzM2MF9GXzU5OTcy/MDYyNV9OMlU4QVF6/aFM1eTdsbHJwMkFN/QVFtS0w0QjZuV0hL/VC5qcGc",
   },
   {
      id: "placeholder6",
      title: "Placeholder",
      image: "https://imgs.search.brave.com/_bEUvkX0umM3x5ygwOYwiFilG8kLuIpG1i71-Al0qHI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA1Lzk5LzcyLzA2/LzM2MF9GXzU5OTcy/MDYyNV9OMlU4QVF6/aFM1eTdsbHJwMkFN/QVFtS0w0QjZuV0hL/VC5qcGc",
   },
];

export function GameGallery() {
   const [searchParams, setSearchParams] = useSearchParams();
   const activeGame = searchParams.get("game");
   const [_scrolled, setScrolled] = useState(false);
   const [activeSection, setActiveSection] = useState("home");

   useEffect(() => {
      const onScroll = () => {
         setScrolled(window.scrollY > 20);

         const about = (document.getElementById("about")?.offsetTop || 0) + 100;
         const collection = document.getElementById("collection")?.offsetTop || 0;

         const scrollPos = window.scrollY + 100;
         if (scrollPos >= collection) setActiveSection("collection");
         else if (scrollPos >= about) setActiveSection("about");
         else setActiveSection("home");
      };
      window.addEventListener("scroll", onScroll);
      return () => window.removeEventListener("scroll", onScroll);
   }, []);

   return (
      <div className="mx-auto max-w-[100rem]">
         <div id="home" />
         <div className={"sticky top-0 z-50 bg-gray-800 py-6"}>
            <div className="grid grid-cols-2 px-8">
               <div className="flex items-center col-start-1">
                  <img className="mr-5 w-8 h-8" src={"assets/pixel-earth.png"} alt="pixel earth" />
                  <h1 className="font-font md:text-xl sm:text-md font-bold sm:block hidden text-white">
                     Canvas Games
                  </h1>
               </div>
               <div className="flex justify-end items-center col-start-2 space-x-8 font-font text-md font-bold">
                  <a
                     href="#home"
                     className={
                        activeSection === "home" ? "text-sky-400" : "text-gray-300 hover:text-white"
                     }
                     onClick={() => setActiveSection("home")}
                  >
                     Home
                  </a>
                  <a
                     href="#about"
                     className={
                        activeSection === "about"
                           ? "text-sky-400"
                           : "text-gray-300 hover:text-white"
                     }
                  >
                     About
                  </a>
                  <a
                     href="#collection"
                     className={
                        activeSection === "collection"
                           ? "text-sky-400"
                           : "text-gray-300 hover:text-white"
                     }
                  >
                     Collection
                  </a>
               </div>
            </div>
         </div>

         <div id="about" />
         <div className="px-8">
            <div className="flex items-center mt-[8rem]">
               <img className="mr-5" src={"assets/vr-boy.png"} alt="boy vr headset" />
               <h1 className="font-font md:text-xl sm:text-md font-bold sm:block hidden text-white">
                  About
               </h1>
            </div>
            <div className="w-full flex justify-center mt-3">
               <div className="max-w-[50rem] text-gray-200">
                  <div>
                     Welcome! This site is a personal project where I'm collecting and showcasing
                     projects I've built as part of my learning journey. Think of it as my digital
                     playground for exploring game development and various html canvas ideas.
                  </div>
                  <div className="mt-8">Thanks for stopping by!</div>
               </div>
            </div>
         </div>
         <div id="collection" />
         <div className="px-8">
            <div className="flex items-center mt-[8rem]">
               <img className="mr-5" src={"assets/rocket.png"} alt="rocket ship" />
               <h1 className="font-font md:text-xl sm:text-md font-bold sm:block hidden text-white">
                  Collection
               </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
               {games.map((game) => (
                  <div
                     key={game.id}
                     onClick={() => {
                        if (!activeGame) {
                           setSearchParams({ game: game.id });
                        }
                     }}
                     // TODO: need to add a pointy cursor when only when there's no modal
                     className={
                        "relative overflow-hidden rounded-lg shadow-lg group border-2 border-transparent hover:border-sky-400 transition"
                     }
                  >
                     <img
                        src={game.image}
                        alt={game.title}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition"
                     />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xl font-bold bg-black/40 px-4 py-2 rounded">
                           {game.title}
                        </span>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <GameCard
                           key={game.id}
                           title={"Example Game"}
                           onClick={() => setSearchParams({ game: game.id })}
                        />
                        {activeGame === game.id && (
                           <GameModal
                              createGame={exampleGame}
                              onClose={() => {
                                 setSearchParams("");
                              }}
                           />
                        )}
                     </div>
                  </div>
               ))}
            </div>
         </div>
         <div className="my-14">
            <img
               src="/assets/earth-large.png"
               alt="Logo"
               className="mx-auto md:w-[35rem] w-[20rem]"
            />
         </div>

         <AppFooter />
      </div>
   );
}

export function GameCard({ title, onClick }: { title: string; onClick: () => void }) {
   return (
      <div onClick={onClick} className="p-4 bg-gray-800 shadow rounded hover:scale-105 transition">
         <h2 className="text-lg font-semibold">{title}</h2>
      </div>
   );
}
export function GameModal({
   createGame,
   onClose,
}: {
   createGame: (app: PIXI.Application) => void;
   onClose: () => void;
}) {
   const containerRef = useRef<HTMLDivElement>(null);
   const wrapperRef = useRef<HTMLDivElement>(null);
   const appRef = useRef<PIXI.Application | null>(null);

   useEffect(() => {
      const init = async () => {
         if (!containerRef.current) return;

         const app = new PIXI.Application();
         await app.init({
            resizeTo: containerRef.current,
            backgroundColor: 0xf8da95,
            antialias: true,
            autoDensity: true,
         });

         if (containerRef.current) {
            containerRef.current.innerHTML = "";
            containerRef.current.appendChild(app.canvas);
         }

         appRef.current = app;
         createGame(app);
      };

      init();

      return () => {
         if (appRef.current) {
            appRef.current.destroy(true);
            appRef.current = null;
         }
      };
   }, [createGame]);

   const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
         wrapperRef.current?.requestFullscreen();
      } else {
         document.exitFullscreen();
      }
   };

   return (
      <div ref={wrapperRef} className="fixed inset-0 flex items-center justify-center z-50">
         <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

         <div className="relative z-10 w-[90vw] max-w-[1920px] aspect-[16/9] bg-white rounded-lg shadow-lg">
            <button
               onClick={onClose}
               className="absolute top-2 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold cursor-pointer"
            >
               ✕
            </button>

            <button
               onClick={toggleFullscreen}
               title="Toggle Fullscreen"
               className="absolute bottom-2 right-3 text-gray-400 hover:text-gray-700 text-4xl cursor-pointer"
            >
               ⛶
            </button>

            <div ref={containerRef} className="w-full h-full overflow-hidden rounded" />
         </div>
      </div>
   );
}

export function AppFooter() {
   return (
      <footer className="bg-gray-800 text-gray-300 mt-20 w-full rounded-lg">
         <div className="max-w-screen-xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
               <div className="flex items-center space-x-3">
                  <span className="text-xl font-bold text-white">Canvas Games</span>
               </div>
               <p className="mt-4 text-sm text-gray-400">
                  A collection of experimental HTML canvas games built with curiosity and a bit of
                  pixel dust.
               </p>
            </div>
            <div className="md:col-start-3 md:text-right">
               <h3 className="text-white text-lg font-semibold mb-4">Follow Me</h3>
               <div className="flex md:justify-end space-x-4">
                  <a
                     href="https://github.com"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="hover:text-white"
                  >
                     GitHub
                  </a>
                  <a
                     href="https://twitter.com"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="hover:text-white"
                  >
                     Twitter
                  </a>
                  <a
                     href="https://linkedin.com"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="hover:text-white"
                  >
                     LinkedIn
                  </a>
               </div>
            </div>
         </div>
         <div className="border-t border-gray-700 text-center text-sm py-4 text-gray-500">
            © {new Date().getFullYear()} Paul Q. Peters
         </div>
      </footer>
   );
}
