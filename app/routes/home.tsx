import { exampleGame } from "games/placeholder/main";
import { createSlitherSlimGame } from "games/slither-slim/main";
import * as PIXI from "pixi.js";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { cn } from "~/util/util";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
   return [
      { title: "Canvas Games" },
      { name: "description", content: "Just here to learn making games with the canvas" },
   ];
}

const games = [
   {
      id: "slither-slim-id",
      title: "Slither Slim",
      image: "game-imgs/space-game.png",
      init: createSlitherSlimGame,
   },
   {
      id: "placeholder2",
      title: "Placeholder",
      image: "game-imgs/space-game.png",
      init: exampleGame,
   },
   {
      id: "placeholder3",
      title: "Placeholder",
      image: "game-imgs/space-game.png",
      init: exampleGame,
   },
   {
      id: "placeholder4",
      title: "Placeholder",
      image: "game-imgs/space-game.png",
      init: exampleGame,
   },
   {
      id: "placeholder5",
      title: "Placeholder",
      image: "game-imgs/space-game.png",
      init: exampleGame,
   },
   {
      id: "placeholder6",
      title: "Placeholder",
      image: "game-imgs/space-game.png",
      init: exampleGame,
   },
];

export default function Home() {
   const [searchParams, setSearchParams] = useSearchParams();
   const activeGame = searchParams.get("game");
   const navigate = useNavigate();

   return (
      <div className="mx-auto max-w-[100rem]">
         <AppHeader />
         <div id="about" />
         <div className="px-8">
            <div className="flex items-center mt-[8rem]">
               <img className="mr-5" src={"assets/vr-boy.png"} alt="boy vr headset" />
               <h1 className="font-font md:text-xl sm:text-md font-bold text-white">About</h1>
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
               <h1 className="font-font md:text-xl sm:text-md font-bold text-white">Collection</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
               {games.map((game) => (
                  <div
                     key={game.id}
                     onClick={() => {
                        if (!activeGame) {
                           navigate(`?game=${game.id}#collection`);
                        }
                     }}
                     className={cn(
                        "relative overflow-hidden rounded-lg shadow-lg group border-3 border-transparent hover:border-sky-400 transition",
                        { "cursor-pointer": !activeGame },
                     )}
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
                              createGame={game.init}
                              onClose={() => {
                                 if (location.hash.includes("collection")) navigate("#collection");
                                 else setSearchParams("");
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
               src="assets/earth-large.png"
               alt="Large Earth"
               className="mx-auto md:w-[35rem] w-[20rem]"
            />
         </div>
         <AppFooter />
      </div>
   );
}

export function GameGallery() {}

function AppHeader() {
   return (
      <div>
         <div id="home" />
         <div className="bg-gray-800 py-6 rounded-b-lg">
            <div className="grid grid-cols-2 px-8">
               <div className="flex items-center col-start-1">
                  <img className="mr-5 w-8 h-8" src={"assets/pixel-earth.png"} alt="pixel earth" />
                  <h1 className="font-font md:text-xl sm:text-md font-bold sm:block hidden text-white">
                     Canvas Game
                  </h1>
               </div>
               <div className="flex justify-end items-center col-start-2 sm:space-x-8 space-x-4 font-font md:text-md text-sm font-bold">
                  <a href="#home" className="text-gray-300 hover:text-white">
                     Home
                  </a>
                  <a href="#about" className="text-gray-300 hover:text-white">
                     About
                  </a>
                  <a href="#collection" className="text-gray-300 hover:text-white">
                     Collection
                  </a>
               </div>
            </div>
         </div>
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

interface GameModalProps {
   createGame: (app: PIXI.Application) => Promise<void>;
   onClose: () => void;
}

export function GameModal({ createGame, onClose }: GameModalProps) {
   const containerRef = useRef<HTMLDivElement>(null);
   const wrapperRef = useRef<HTMLDivElement>(null);
   const appRef = useRef<PIXI.Application | null>(null);

   const [windowDimensions, setWindowDimensions] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
   });

   const isSmallScreen = window.innerWidth < 768 || isMobileDevice();

   useEffect(() => {
      const handleResize = () => {
         setWindowDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
         });
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, []);

   useEffect(() => {
      const init = async () => {
         if (!containerRef.current) return;
         const app = new PIXI.Application();
         await app.init({
            resizeTo: containerRef.current,
            backgroundColor: "#000000",
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
   }, [createGame, isMobileDevice]);

   const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
         wrapperRef.current?.requestFullscreen();
      } else {
         document.exitFullscreen();
      }
   };

   const { isFullscreen } = useGameIsFullScreen();

   usePreventArrowScroll();

   const maxWidthBasedOnHeight = windowDimensions.height * (16 / 9);

   return (
      <div ref={wrapperRef} className="fixed inset-0 flex items-center justify-center z-50">
         <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

         <div
            style={{
               maxWidth: isFullscreen ? `${maxWidthBasedOnHeight}px` : undefined,
            }}
            className={cn("aspect-[16/9] relative bg-gray-800 z-10 w-[90vw] rounded-lg shadow-lg", {
               "w-full max-w-full": isFullscreen,
            })}
         >
            {!isFullscreen && (
               <div>
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
               </div>
            )}

            {isSmallScreen && (
               <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-center p-4 rounded">
                  <p className="text-lg font-medium">
                     Uh oh... looks like you're on mobile. Only can play the games on a desktop for
                     now.
                  </p>
               </div>
            )}
            {!isSmallScreen && (
               <div ref={containerRef} className="w-full h-full overflow-hidden rounded" />
            )}
         </div>
      </div>
   );
}

export function AppFooter() {
   return (
      <footer className="bg-gray-800 text-gray-300 mt-20 w-full rounded-t-lg">
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
         <div className="border-t border-gray-700 text-center text-sm py-4 text-gray-500 pb-5">
            © {new Date().getFullYear()} Paul Q. Peters
         </div>
      </footer>
   );
}

function useGameIsFullScreen() {
   const [isFullscreen, setIsFullscreen] = useState(false);

   useEffect(() => {
      const handleFullscreenChange = () => {
         setIsFullscreen(!!document.fullscreenElement);
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.addEventListener("mozfullscreenchange", handleFullscreenChange);
      document.addEventListener("MSFullscreenChange", handleFullscreenChange);

      setIsFullscreen(!!document.fullscreenElement);

      return () => {
         document.removeEventListener("fullscreenchange", handleFullscreenChange);
         document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
         document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
         document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      };
   }, []);

   return { isFullscreen };
}

function usePreventArrowScroll() {
   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         const keysToBlock = ["ArrowUp", "ArrowDown", " "];
         if (keysToBlock.includes(e.key)) {
            e.preventDefault();
         }
      };

      window.addEventListener("keydown", handleKeyDown, { passive: false });

      return () => {
         window.removeEventListener("keydown", handleKeyDown);
      };
   }, []);
}

function isMobileDevice() {
   return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
