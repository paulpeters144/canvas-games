import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts, useSearchParams } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import * as PIXI from "pixi.js";
import { useState, useEffect, useRef } from "react";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
function exampleGame(app) {
  app.canvas.style.width = "100%";
  app.canvas.style.height = "100%";
  const graphics = new PIXI.Graphics();
  graphics.rect(50, 50, 100, 100);
  graphics.fill(6621786);
  graphics.stroke({ width: 2, color: 16706423 });
  graphics.circle(250, 100, 50);
  graphics.fill(6621786);
  graphics.stroke({ width: 2, color: 16706423 });
  app.stage.addChild(graphics);
}
const games = [
  {
    id: "placeholder1",
    title: "Placeholder",
    image: "https://imgs.search.brave.com/_bEUvkX0umM3x5ygwOYwiFilG8kLuIpG1i71-Al0qHI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA1Lzk5LzcyLzA2/LzM2MF9GXzU5OTcy/MDYyNV9OMlU4QVF6/aFM1eTdsbHJwMkFN/QVFtS0w0QjZuV0hL/VC5qcGc"
  },
  {
    id: "placeholder2",
    title: "Placeholder",
    image: "https://imgs.search.brave.com/_bEUvkX0umM3x5ygwOYwiFilG8kLuIpG1i71-Al0qHI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA1Lzk5LzcyLzA2/LzM2MF9GXzU5OTcy/MDYyNV9OMlU4QVF6/aFM1eTdsbHJwMkFN/QVFtS0w0QjZuV0hL/VC5qcGc"
  },
  {
    id: "placeholder3",
    title: "Placeholder",
    image: "https://imgs.search.brave.com/_bEUvkX0umM3x5ygwOYwiFilG8kLuIpG1i71-Al0qHI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA1Lzk5LzcyLzA2/LzM2MF9GXzU5OTcy/MDYyNV9OMlU4QVF6/aFM1eTdsbHJwMkFN/QVFtS0w0QjZuV0hL/VC5qcGc"
  },
  {
    id: "placeholder4",
    title: "Placeholder",
    image: "https://imgs.search.brave.com/_bEUvkX0umM3x5ygwOYwiFilG8kLuIpG1i71-Al0qHI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA1Lzk5LzcyLzA2/LzM2MF9GXzU5OTcy/MDYyNV9OMlU4QVF6/aFM1eTdsbHJwMkFN/QVFtS0w0QjZuV0hL/VC5qcGc"
  },
  {
    id: "placeholder5",
    title: "Placeholder",
    image: "https://imgs.search.brave.com/_bEUvkX0umM3x5ygwOYwiFilG8kLuIpG1i71-Al0qHI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA1Lzk5LzcyLzA2/LzM2MF9GXzU5OTcy/MDYyNV9OMlU4QVF6/aFM1eTdsbHJwMkFN/QVFtS0w0QjZuV0hL/VC5qcGc"
  },
  {
    id: "placeholder6",
    title: "Placeholder",
    image: "https://imgs.search.brave.com/_bEUvkX0umM3x5ygwOYwiFilG8kLuIpG1i71-Al0qHI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA1Lzk5LzcyLzA2/LzM2MF9GXzU5OTcy/MDYyNV9OMlU4QVF6/aFM1eTdsbHJwMkFN/QVFtS0w0QjZuV0hL/VC5qcGc"
  }
];
function GameGallery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeGame = searchParams.get("game");
  const [_scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  useEffect(() => {
    const onScroll = () => {
      var _a, _b;
      setScrolled(window.scrollY > 20);
      const about = (((_a = document.getElementById("about")) == null ? void 0 : _a.offsetTop) || 0) + 100;
      const collection = ((_b = document.getElementById("collection")) == null ? void 0 : _b.offsetTop) || 0;
      const scrollPos = window.scrollY + 100;
      if (scrollPos >= collection) setActiveSection("collection");
      else if (scrollPos >= about) setActiveSection("about");
      else setActiveSection("home");
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[100rem]", children: [
    /* @__PURE__ */ jsx("div", { id: "home" }),
    /* @__PURE__ */ jsx("div", { className: "sticky top-0 z-50 bg-gray-800 py-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center col-start-1", children: [
        /* @__PURE__ */ jsx("img", { className: "mr-5 w-8 h-8", src: "assets/pixel-earth.png", alt: "pixel earth" }),
        /* @__PURE__ */ jsx("h1", { className: "font-font md:text-xl sm:text-md font-bold sm:block hidden text-white", children: "Canvas Games" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end items-center col-start-2 space-x-8 font-font text-md font-bold", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "#home",
            className: activeSection === "home" ? "text-sky-400" : "text-gray-300 hover:text-white",
            onClick: () => setActiveSection("home"),
            children: "Home"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "#about",
            className: activeSection === "about" ? "text-sky-400" : "text-gray-300 hover:text-white",
            children: "About"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "#collection",
            className: activeSection === "collection" ? "text-sky-400" : "text-gray-300 hover:text-white",
            children: "Collection"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { id: "about" }),
    /* @__PURE__ */ jsxs("div", { className: "px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center mt-[8rem]", children: [
        /* @__PURE__ */ jsx("img", { className: "mr-5", src: "assets/vr-boy.png", alt: "boy vr headset" }),
        /* @__PURE__ */ jsx("h1", { className: "font-font md:text-xl sm:text-md font-bold sm:block hidden text-white", children: "About" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full flex justify-center mt-3", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[50rem] text-gray-200", children: [
        /* @__PURE__ */ jsx("div", { children: "Welcome! This site is a personal project where I'm collecting and showcasing projects I've built as part of my learning journey. Think of it as my digital playground for exploring game development and various html canvas ideas." }),
        /* @__PURE__ */ jsx("div", { className: "mt-8", children: "Thanks for stopping by!" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { id: "collection" }),
    /* @__PURE__ */ jsxs("div", { className: "px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center mt-[8rem]", children: [
        /* @__PURE__ */ jsx("img", { className: "mr-5", src: "assets/rocket.png", alt: "rocket ship" }),
        /* @__PURE__ */ jsx("h1", { className: "font-font md:text-xl sm:text-md font-bold sm:block hidden text-white", children: "Collection" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8", children: games.map((game) => /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: () => {
            if (!activeGame) {
              setSearchParams({ game: game.id });
            }
          },
          className: "relative overflow-hidden rounded-lg shadow-lg group border-2 border-transparent hover:border-sky-400 transition",
          children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: game.image,
                alt: game.title,
                className: "w-full h-full object-cover opacity-70 group-hover:opacity-100 transition"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-white text-xl font-bold bg-black/40 px-4 py-2 rounded", children: game.title }) }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4", children: [
              /* @__PURE__ */ jsx(
                GameCard,
                {
                  title: "Example Game",
                  onClick: () => setSearchParams({ game: game.id })
                },
                game.id
              ),
              activeGame === game.id && /* @__PURE__ */ jsx(
                GameModal,
                {
                  createGame: exampleGame,
                  onClose: () => {
                    setSearchParams("");
                  }
                }
              )
            ] })
          ]
        },
        game.id
      )) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "my-14", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: "/assets/earth-large.png",
        alt: "Logo",
        className: "mx-auto md:w-[35rem] w-[20rem]"
      }
    ) }),
    /* @__PURE__ */ jsx(AppFooter, {})
  ] });
}
function GameCard({ title, onClick }) {
  return /* @__PURE__ */ jsx("div", { onClick, className: "p-4 bg-gray-800 shadow rounded hover:scale-105 transition", children: /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: title }) });
}
function GameModal({
  createGame,
  onClose
}) {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const appRef = useRef(null);
  useEffect(() => {
    const init = async () => {
      if (!containerRef.current) return;
      const app = new PIXI.Application();
      await app.init({
        resizeTo: containerRef.current,
        backgroundColor: 16308885,
        antialias: true,
        autoDensity: true
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
    var _a;
    if (!document.fullscreenElement) {
      (_a = wrapperRef.current) == null ? void 0 : _a.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };
  return /* @__PURE__ */ jsxs("div", { ref: wrapperRef, className: "fixed inset-0 flex items-center justify-center z-50", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/40 backdrop-blur-sm", onClick: onClose }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 w-[90vw] max-w-[1920px] aspect-[16/9] bg-white rounded-lg shadow-lg", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "absolute top-2 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold cursor-pointer",
          children: "✕"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: toggleFullscreen,
          title: "Toggle Fullscreen",
          className: "absolute bottom-2 right-3 text-gray-400 hover:text-gray-700 text-4xl cursor-pointer",
          children: "⛶"
        }
      ),
      /* @__PURE__ */ jsx("div", { ref: containerRef, className: "w-full h-full overflow-hidden rounded" })
    ] })
  ] });
}
function AppFooter() {
  return /* @__PURE__ */ jsxs("footer", { className: "bg-gray-800 text-gray-300 mt-20 w-full rounded-lg", children: [
    /* @__PURE__ */ jsxs("div", { className: "max-w-screen-xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-3", children: /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-white", children: "Canvas Games" }) }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-gray-400", children: "A collection of experimental HTML canvas games built with curiosity and a bit of pixel dust." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "md:col-start-3 md:text-right", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-white text-lg font-semibold mb-4", children: "Follow Me" }),
        /* @__PURE__ */ jsxs("div", { className: "flex md:justify-end space-x-4", children: [
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://github.com",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "hover:text-white",
              children: "GitHub"
            }
          ),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://twitter.com",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "hover:text-white",
              children: "Twitter"
            }
          ),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://linkedin.com",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "hover:text-white",
              children: "LinkedIn"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-700 text-center text-sm py-4 text-gray-500", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " Paul Q. Peters"
    ] })
  ] });
}
function meta({}) {
  return [{
    title: "New React Router App"
  }, {
    name: "description",
    content: "Welcome to React Router!"
  }];
}
const home = UNSAFE_withComponentProps(function Home() {
  return /* @__PURE__ */ jsx(GameGallery, {});
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/canvas-gamesassets/entry.client-XC4V7GpG.js", "imports": ["/canvas-gamesassets/chunk-NL6KNZEE-97CjQthj.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/canvas-gamesassets/root-BmiJZF4g.js", "imports": ["/canvas-gamesassets/chunk-NL6KNZEE-97CjQthj.js"], "css": ["/canvas-gamesassets/root-B-neDKIB.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/canvas-gamesassets/home-BvaICcvT.js", "imports": ["/canvas-gamesassets/home-BLYotF6O.js", "/canvas-gamesassets/chunk-NL6KNZEE-97CjQthj.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/canvas-gamesassets/manifest-1df80cf2.js", "version": "1df80cf2", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/canvas-games";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
