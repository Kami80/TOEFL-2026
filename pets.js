(function () {
  "use strict";

  if (window.__TOEFL_PIXEL_PETS__) return;
  window.__TOEFL_PIXEL_PETS__ = true;

  var STORAGE_KEY = "toefl26-pet-world:v1";
  var MAX_PETS = 1;
  var ROOT_ID = "toefl-pixel-pets";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var PETS = [
    {
      id: "saffron",
      name: "Saffron",
      species: "cat",
      kind: "Ginger tabby",
      trait: "bold pouncer",
      main: "#e98a37",
      light: "#ffd18b",
      accent: "#2d8e87",
      pattern: "tabby"
    },
    {
      id: "nori",
      name: "Nori",
      species: "cat",
      kind: "Tuxedo cat",
      trait: "quiet observer",
      main: "#34374a",
      light: "#fff5df",
      accent: "#e66f83",
      pattern: "tuxedo"
    },
    {
      id: "cloud",
      name: "Cloud",
      species: "cat",
      kind: "Fluffy calico",
      trait: "soft-hearted",
      main: "#f4dfb9",
      light: "#fff8e8",
      accent: "#79bfb2",
      pattern: "calico"
    },
    {
      id: "biscuit",
      name: "Biscuit",
      species: "dog",
      kind: "Honey corgi",
      trait: "happy helper",
      main: "#d98932",
      light: "#ffe0a3",
      accent: "#405c9b",
      pattern: "corgi"
    },
    {
      id: "scout",
      name: "Scout",
      species: "dog",
      kind: "Chestnut beagle",
      trait: "curious sniffer",
      main: "#9a5839",
      light: "#fff0cf",
      accent: "#3fa5aa",
      pattern: "beagle"
    },
    {
      id: "pepper",
      name: "Pepper",
      species: "dog",
      kind: "Dalmatian",
      trait: "playful scout",
      main: "#fff7e7",
      light: "#ffffff",
      accent: "#e86f63",
      pattern: "dalmatian"
    }
  ];

  var HOUSES = {
    sunbeam: {
      id: "sunbeam",
      name: "Sunbeam Cottage",
      wall: "#f2b36e",
      wallLight: "#ffd79f",
      roof: "#e86f65",
      trim: "#fff1cf",
      door: "#2f8c88",
      night: "#694f82"
    },
    arcade: {
      id: "arcade",
      name: "Mint Arcade",
      wall: "#9bd9cf",
      wallLight: "#d7f1e9",
      roof: "#f0bb42",
      trim: "#fff5d9",
      door: "#5470bd",
      night: "#35547c"
    },
    moon: {
      id: "moon",
      name: "Moonberry Cabin",
      wall: "#39466f",
      wallLight: "#6876a1",
      roof: "#9d71c2",
      trim: "#f8d77d",
      door: "#e37472",
      night: "#18203f"
    }
  };

  var DEFAULT_STATE = {
    version: 1,
    active: ["saffron"],
    house: "sunbeam",
    autoplay: true,
    quiet: false,
    worldHidden: false,
    positions: {},
    housePosition: null,
    introduced: false
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function random(min, max) {
    return Math.round(min + Math.random() * (max - min));
  }

  function choose(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function petById(id) {
    return PETS.find(function (pet) { return pet.id === id; });
  }

  function safeReadState() {
    var stored;
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch (error) {
      stored = null;
    }
    if (!stored || stored.version !== 1) return copyDefaultState();

    var allowed = stored.active instanceof Array
      ? stored.active.filter(function (id, index, list) {
          return petById(id) && list.indexOf(id) === index;
        }).slice(0, MAX_PETS)
      : DEFAULT_STATE.active.slice();

    return {
      version: 1,
      active: allowed,
      house: HOUSES[stored.house] ? stored.house : DEFAULT_STATE.house,
      autoplay: stored.autoplay !== false,
      quiet: stored.quiet === true,
      worldHidden: stored.worldHidden === true,
      positions: stored.positions && typeof stored.positions === "object" ? stored.positions : {},
      housePosition: stored.housePosition && typeof stored.housePosition === "object" ? stored.housePosition : null,
      introduced: stored.introduced === true
    };
  }

  function copyDefaultState() {
    return {
      version: DEFAULT_STATE.version,
      active: DEFAULT_STATE.active.slice(),
      house: DEFAULT_STATE.house,
      autoplay: DEFAULT_STATE.autoplay,
      quiet: DEFAULT_STATE.quiet,
      worldHidden: DEFAULT_STATE.worldHidden,
      positions: {},
      housePosition: null,
      introduced: false
    };
  }

  function safeWriteState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      /* Storage can be unavailable in privacy modes; the live world still works. */
    }
  }

  function svgOpen(label) {
    return '<svg viewBox="0 0 88 80" role="img" aria-label="' + label + '" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">';
  }

  function catTail(config) {
    var ink = "#18203f";
    if (config.pattern === "tabby") {
      return '<g class="pet-tail"><path fill="' + ink + '" d="M58 39h12v-8h8V19h-8v8h-8v6h-8z"/><path fill="' + config.main + '" d="M60 41h10v-8h6V22h-4v7h-8v6h-6z"/><rect x="70" y="25" width="6" height="4" fill="' + config.light + '"/></g>';
    }
    if (config.pattern === "tuxedo") {
      return '<g class="pet-tail"><path fill="' + ink + '" d="M60 43h10V23h6V9h-8v12h-8z"/><path fill="' + config.main + '" d="M63 41h4V22h6V12h-3v12h-7z"/></g>';
    }
    return '<g class="pet-tail"><path fill="' + ink + '" d="M57 42h13v-5h8V25h-5v-6h-9v7h-6z"/><path fill="' + config.main + '" d="M60 40h9v-5h6v-8h-5v-5h-4v7h-6z"/><rect x="69" y="27" width="6" height="7" fill="#c78553"/></g>';
  }

  function catPattern(config) {
    if (config.pattern === "tabby") {
      return '<path fill="#8f4b2c" d="M31 17h5v7h-3zM41 16h5v8h-3zM51 18h5v6h-3z"/><path fill="#8f4b2c" d="M29 43h5v13h-3zM48 42h6v14h-3z"/>';
    }
    if (config.pattern === "tuxedo") {
      return '<path fill="' + config.light + '" d="M27 20h23v8h6v13H24V28h3z"/><rect x="35" y="40" width="13" height="17" fill="' + config.light + '"/><rect x="54" y="45" width="8" height="10" fill="#242636"/>';
    }
    return '<path fill="#c67c49" d="M23 17h14v10h-6v8h-8z"/><path fill="#737487" d="M48 17h10v16h-7v-6h-7v-7h4z"/><rect x="50" y="44" width="12" height="11" fill="#c67c49"/>';
  }

  function catHeadPattern(config) {
    if (config.pattern === "tabby") {
      return '<path fill="#8f4b2c" d="M31 17h5v7h-3zm10-1h5v8h-3zm10 2h5v6h-3z"/>';
    }
    if (config.pattern === "tuxedo") {
      return '<path fill="' + config.light + '" d="M27 20h23v8h6v13H24V28h3z"/>';
    }
    return '<path fill="#c67c49" d="M23 17h14v10h-6v8h-8z"/><path fill="#737487" d="M48 17h10v16h-7v-6h-7v-7h4z"/>';
  }

  function catSvg(config, label) {
    var ink = "#18203f";
    return svgOpen(label || config.name + " the cat") +
      catTail(config) +
      '<g class="pet-body">' +
        '<rect x="18" y="37" width="48" height="28" fill="' + ink + '"/>' +
        '<rect x="22" y="41" width="40" height="20" fill="' + config.main + '"/>' +
        '<rect x="29" y="44" width="22" height="17" fill="' + config.light + '" opacity=".72"/>' +
        catPattern(config) +
      '</g>' +
      '<g class="pet-paw-back"><rect x="20" y="57" width="15" height="14" fill="' + ink + '"/><rect x="24" y="59" width="9" height="8" fill="' + config.main + '"/></g>' +
      '<g class="pet-paw-front"><rect x="51" y="57" width="15" height="14" fill="' + ink + '"/><rect x="53" y="59" width="9" height="8" fill="' + config.main + '"/></g>' +
      '<g class="pet-head">' +
        '<path fill="' + ink + '" d="M16 16h7V8h11v8h18V8h11v8h7v33H16z"/>' +
        '<path fill="' + config.main + '" d="M20 19h7v-7h5v7h22v-7h5v7h7v26H20z"/>' +
        '<path fill="' + config.light + '" d="M29 31h28v12H25v-8h4z"/>' +
        catHeadPattern(config) +
        '<g class="pet-eyes"><rect x="28" y="27" width="5" height="6" fill="' + ink + '"/><rect x="52" y="27" width="5" height="6" fill="' + ink + '"/><rect x="29" y="27" width="2" height="2" fill="#fff"/><rect x="53" y="27" width="2" height="2" fill="#fff"/></g>' +
        '<rect x="40" y="34" width="6" height="4" fill="#c45d67"/>' +
        '<path fill="' + ink + '" d="M35 39h5v3h-8v-2h3zM46 39h5v1h3v2h-8z"/>' +
        '<rect x="23" y="37" width="9" height="2" fill="' + ink + '"/><rect x="54" y="37" width="9" height="2" fill="' + ink + '"/>' +
      '</g>' +
      '<g class="pet-collar"><rect x="25" y="47" width="36" height="5" fill="' + ink + '"/><rect x="28" y="47" width="30" height="3" fill="' + config.accent + '"/><rect x="41" y="50" width="5" height="5" fill="#f2bd45"/></g>' +
      '</svg>';
  }

  function dogTail(config) {
    var ink = "#18203f";
    if (config.pattern === "corgi") {
      return '<g class="pet-tail"><path fill="' + ink + '" d="M61 40h13v-8h7v10H70v6h-9z"/><path fill="' + config.main + '" d="M64 42h7v-7h6v4h-9v6h-4z"/></g>';
    }
    if (config.pattern === "beagle") {
      return '<g class="pet-tail"><path fill="' + ink + '" d="M61 40h10V24h8v-7h7v11h-8v16H61z"/><path fill="' + config.main + '" d="M64 41h5V25h7v-5h6v5h-7v16z"/><rect x="77" y="20" width="5" height="5" fill="' + config.light + '"/></g>';
    }
    return '<g class="pet-tail"><path fill="' + ink + '" d="M60 40h11V28h7v-8h7v12h-8v12H60z"/><path fill="' + config.light + '" d="M64 41h5V30h6v-7h6v6h-7v12z"/><rect x="73" y="27" width="6" height="6" fill="#2e3140"/></g>';
  }

  function dogEars(config) {
    var ink = "#18203f";
    if (config.pattern === "corgi") {
      return '<path fill="' + ink + '" d="M17 20V6h11l6 13zm50 0V6H56l-5 13z"/><path fill="#f3b05c" d="M21 16V10h6l3 8zm42 0v-6h-6l-3 8z"/>';
    }
    if (config.pattern === "beagle") {
      return '<path fill="' + ink + '" d="M15 19H7v25h13V31h6V19zm54 0h8v25H64V31h-6V19z"/><path fill="#6f3c31" d="M11 22h8v17h-7zm58 0h4v17h-8V27h4z"/>';
    }
    return '<path fill="' + ink + '" d="M15 18H8v23h13V29h5V18zm54 0h8v21H65V29h-7V18z"/><path fill="#2d3040" d="M11 21h8v16h-7zm57 0h5v14h-7V25h2z"/>';
  }

  function dogPattern(config) {
    if (config.pattern === "corgi") {
      return '<path fill="' + config.light + '" d="M25 43h22v19H29V54h-4z"/><rect x="51" y="43" width="11" height="10" fill="#b96d2d"/>';
    }
    if (config.pattern === "beagle") {
      return '<path fill="#2f3241" d="M25 41h22v12H35v9H23z"/><rect x="48" y="44" width="14" height="15" fill="' + config.main + '"/>';
    }
    return '<rect x="29" y="43" width="8" height="8" fill="#2e3140"/><rect x="50" y="50" width="10" height="9" fill="#2e3140"/><rect x="40" y="59" width="6" height="5" fill="#2e3140"/>';
  }

  function dogFacePattern(config) {
    if (config.pattern === "corgi") {
      return '<path fill="' + config.light + '" d="M29 24h28v21H24V34h5z"/><path fill="#b96d2d" d="M22 20h13v11H22zm31 0h11v12H53z"/>';
    }
    if (config.pattern === "beagle") {
      return '<path fill="' + config.light + '" d="M29 28h28v17H23V34h6z"/><path fill="#2f3241" d="M22 19h18v11H22z"/>';
    }
    return '<path fill="' + config.light + '" d="M27 23h32v22H22V32h5z"/><path fill="#2e3140" d="M22 19h15v13H22z"/><rect x="53" y="24" width="8" height="8" fill="#2e3140"/>';
  }

  function dogSvg(config, label) {
    var ink = "#18203f";
    return svgOpen(label || config.name + " the dog") +
      dogTail(config) +
      '<g class="pet-body">' +
        '<rect x="18" y="37" width="49" height="29" fill="' + ink + '"/>' +
        '<rect x="22" y="41" width="41" height="21" fill="' + config.main + '"/>' +
        dogPattern(config) +
      '</g>' +
      '<g class="pet-paw-back"><rect x="20" y="57" width="15" height="14" fill="' + ink + '"/><rect x="24" y="59" width="8" height="8" fill="' + config.light + '"/></g>' +
      '<g class="pet-paw-front"><rect x="51" y="57" width="15" height="14" fill="' + ink + '"/><rect x="54" y="59" width="8" height="8" fill="' + config.light + '"/></g>' +
      '<g class="pet-head">' +
        dogEars(config) +
        '<rect x="17" y="15" width="52" height="35" fill="' + ink + '"/>' +
        '<rect x="21" y="19" width="44" height="27" fill="' + config.main + '"/>' +
        dogFacePattern(config) +
        '<g class="pet-eyes"><rect x="28" y="27" width="5" height="6" fill="' + ink + '"/><rect x="53" y="27" width="5" height="6" fill="' + ink + '"/><rect x="29" y="27" width="2" height="2" fill="#fff"/><rect x="54" y="27" width="2" height="2" fill="#fff"/></g>' +
        '<rect x="40" y="35" width="7" height="5" fill="' + ink + '"/>' +
        '<path fill="' + ink + '" d="M36 41h5v3h-9v-2h4zm11 0h5v1h3v2h-8z"/>' +
        '<rect x="47" y="42" width="5" height="5" fill="#e77879"/>' +
      '</g>' +
      '<g class="pet-collar"><rect x="24" y="47" width="39" height="5" fill="' + ink + '"/><rect x="27" y="47" width="33" height="3" fill="' + config.accent + '"/><path fill="' + config.accent + '" d="M35 51h17l-4 9-5-4-5 4z"/></g>' +
      '</svg>';
  }

  function petSvg(config, label) {
    return config.species === "cat" ? catSvg(config, label) : dogSvg(config, label);
  }

  function petFaceSvg(config) {
    return '<svg viewBox="0 0 26 20" aria-hidden="true" shape-rendering="crispEdges">' +
      '<path fill="#18203f" d="M3 6h3V2h4l3 4 3-4h4v4h3v11H3z"/>' +
      '<path fill="' + config.main + '" d="M6 7h3V5l4 3 4-3v2h3v7H6z"/>' +
      '<rect x="8" y="9" width="2" height="2" fill="#18203f"/>' +
      '<rect x="16" y="9" width="2" height="2" fill="#18203f"/>' +
      '<rect x="12" y="12" width="3" height="2" fill="' + config.accent + '"/>' +
      '</svg>';
  }

  function toySvg(species) {
    if (species === "cat") {
      return '<svg viewBox="0 0 32 26" aria-hidden="true"><path fill="#18203f" d="M6 7h20v14H6z"/><path fill="#e86f65" d="M9 6h14v3h4v10h-4v3H9v-3H5V9h4z"/><path fill="#f2bd45" d="M13 8h4v12h-4z"/><path fill="#9fd8cf" d="M7 12h18v4H7z"/></svg>';
    }
    return '<svg viewBox="0 0 36 24" aria-hidden="true"><path fill="#18203f" d="M2 5h7v4h18V5h7v6h-4v4h4v6h-7v-4H9v4H2v-6h4v-4H2z"/><path fill="#fff0c5" d="M5 7h3v5h20V7h3v2h-3v6H8V9H5zm0 10h3v-2h20v2h3v2h-3v-4H8v4H5z"/></svg>';
  }

  function houseSvg(theme) {
    var ink = "#18203f";
    return '<svg viewBox="0 0 120 104" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">' +
      '<rect x="84" y="8" width="18" height="30" fill="' + ink + '"/><rect x="88" y="12" width="10" height="26" fill="' + theme.night + '"/>' +
      '<path fill="' + ink + '" d="M6 46h9V37h10V28h10V19h50v9h10v9h10v9h9v10H6z"/>' +
      '<path fill="' + theme.roof + '" d="M11 46h9v-7h10v-8h10v-7h40v7h10v8h10v7h9v5H11z"/>' +
      '<rect x="14" y="50" width="92" height="48" fill="' + ink + '"/>' +
      '<rect x="19" y="54" width="82" height="39" fill="' + theme.wall + '"/>' +
      '<rect x="22" y="58" width="57" height="24" fill="' + theme.wallLight + '" opacity=".42"/>' +
      '<g class="house-window-glow">' +
        '<rect x="22" y="52" width="20" height="21" fill="' + ink + '"/><rect x="26" y="56" width="12" height="13" fill="#ffe58f"/>' +
        '<rect x="44" y="52" width="20" height="21" fill="' + ink + '"/><rect x="48" y="56" width="12" height="13" fill="#ffe58f"/>' +
        '<rect x="66" y="52" width="20" height="21" fill="' + ink + '"/><rect x="70" y="56" width="12" height="13" fill="#ffe58f"/>' +
      '</g>' +
      '<rect x="20" y="80" width="62" height="4" fill="' + theme.trim + '"/>' +
      '<g class="house-door"><rect x="84" y="61" width="19" height="34" fill="' + ink + '"/><rect x="88" y="65" width="11" height="28" fill="' + theme.door + '"/><rect x="89" y="79" width="3" height="3" fill="#f2bd45"/></g>' +
      '<rect x="30" y="39" width="60" height="8" fill="' + ink + '"/><rect x="34" y="41" width="52" height="4" fill="' + theme.trim + '"/>' +
      '<path fill="' + ink + '" d="M6 94h108v6H6z"/><rect x="13" y="92" width="94" height="4" fill="' + theme.night + '"/>' +
      '</svg>';
  }

  function pawIconSvg() {
    return '<svg viewBox="0 0 32 32" aria-hidden="true" shape-rendering="crispEdges">' +
      '<rect x="4" y="6" width="7" height="9" rx="2" fill="#18203f"/>' +
      '<rect x="21" y="6" width="7" height="9" rx="2" fill="#18203f"/>' +
      '<rect x="11" y="2" width="5" height="8" rx="2" fill="#18203f"/>' +
      '<rect x="17" y="2" width="5" height="8" rx="2" fill="#18203f"/>' +
      '<path fill="#18203f" d="M8 21c0-6 4-10 8-10s8 4 8 10c0 5-4 8-8 8s-8-3-8-8z"/>' +
      '<path fill="#f2786b" d="M12 21c0-3 2-6 4-6s4 3 4 6c0 2-2 4-4 4s-4-2-4-4z"/>' +
      '</svg>';
  }

  function treatSvg(species) {
    if (species === "cat") {
      return '<svg viewBox="0 0 32 24" aria-hidden="true" shape-rendering="crispEdges">' +
        '<path fill="#18203f" d="M3 8h5V5h13v3h4V4h4v16h-4v-4h-4v3H8v-3H3z"/>' +
        '<path fill="#79bfb2" d="M7 9h14v3h4V8h1v8h-1v-3h-4v3H7v-2H4v-4h3z"/>' +
        '<rect x="10" y="10" width="3" height="3" fill="#fff8e8"/>' +
      '</svg>';
    }
    return '<svg viewBox="0 0 32 24" aria-hidden="true" shape-rendering="crispEdges">' +
      '<path fill="#18203f" d="M3 5h7v4h12V5h7v6h-4v2h4v6h-7v-4H10v4H3v-6h4v-2H3z"/>' +
      '<path fill="#e5ad62" d="M6 8h3v4h14V8h3v1h-3v5H9V9H6zm0 7h3v-1h14v1h3v1h-3v-2H9v2H6z"/>' +
    '</svg>';
  }

  function actionIconSvg(action, species) {
    var open = '<svg viewBox="0 0 28 28" aria-hidden="true" shape-rendering="crispEdges">';
    if (action === "pet") {
      return open + '<path fill="#18203f" d="M3 8h4V4h6v4h2V4h6v4h4v8h-3v4h-4v4h-8v-4H6v-4H3z"/><path fill="#f2786b" d="M7 9h4v4h6V9h4v6h-3v4h-8v-4H7z"/></svg>';
    }
    if (action === "play") {
      return species === "cat"
        ? open + '<rect x="5" y="7" width="18" height="16" fill="#18203f"/><rect x="8" y="5" width="12" height="20" fill="#e86f65"/><rect x="3" y="10" width="22" height="9" fill="#e86f65"/><rect x="11" y="6" width="4" height="18" fill="#f2bd45"/><rect x="4" y="12" width="20" height="4" fill="#9fd8cf"/></svg>'
        : open + '<path fill="#18203f" d="M2 6h6v4h12V6h6v6h-3v4h3v6h-6v-4H8v4H2v-6h3v-4H2z"/><path fill="#fff0c5" d="M5 9h3v4h12V9h3v1h-3v6H8v-6H5zm0 9h3v-2h12v2h3v1h-3v-3H8v3H5z"/></svg>';
    }
    if (action === "snack") {
      return species === "cat"
        ? open + '<path fill="#18203f" d="M2 9h5V6h12v3h4V5h4v18h-4v-5h-4v3H7v-3H2z"/><path fill="#79bfb2" d="M6 10h13v3h4V9h1v10h-1v-4h-4v3H6v-2H3v-4h3z"/><rect x="9" y="11" width="3" height="3" fill="#fff"/></svg>'
        : open + '<path fill="#18203f" d="M3 6h6v4h10V6h6v6h-3v4h3v6h-6v-4H9v4H3v-6h3v-4H3z"/><path fill="#e5ad62" d="M6 9h3v4h10V9h3v1h-3v6H9v-6H6zm0 9h3v-2h10v2h3v1h-3v-3H9v3H6z"/></svg>';
    }
    if (action === "dance") {
      return open + '<path fill="#18203f" d="M14 3h11v5h-7v12h-3v4h-7v-7h7V3zm5 2v2h4V5z"/><rect x="9" y="19" width="4" height="3" fill="#a878ca"/><rect x="18" y="4" width="5" height="2" fill="#f2bd45"/></svg>';
    }
    if (action === "zoomie") {
      return open + '<path fill="#18203f" d="M12 2h8l-3 8h7L10 26l3-10H5z"/><path fill="#f2bd45" d="M13 5h4l-3 8h5l-6 8 2-8H9z"/></svg>';
    }
    return open + '<path fill="#18203f" d="M3 13h3V9h4V6h8v3h4v4h3v11H3z"/><path fill="#9fd8cf" d="M7 14h3v-3h8v3h3v7h-5v-5h-5v5H7z"/><path fill="#a878ca" d="M18 2h7v3h-3v3h-5V5h3V4h-2z"/></svg>';
  }

  function contextMenuMarkup() {
    var actions = [
      { id: "pet", label: "Pet" },
      { id: "play", label: "Play" },
      { id: "snack", label: "Give snack" },
      { id: "dance", label: "Dance" },
      { id: "zoomie", label: "Zoomies" },
      { id: "sleep", label: "Go home" }
    ];
    return '<div class="pixel-pet-context-menu" data-pet-context role="menu" aria-label="Pet actions" hidden>' +
      actions.map(function (action) {
        return '<button type="button" role="menuitem" data-context-action="' + action.id + '" aria-label="' + action.label + '" title="' + action.label + '" data-tooltip="' + action.label + '">' + actionIconSvg(action.id, "cat") + '</button>';
      }).join("") +
    '</div>';
  }

  function managerMarkup() {
    var cards = PETS.map(function (pet) {
      return '<article class="pixel-pet-card" data-pet-card="' + pet.id + '" data-active="false">' +
        '<div class="pixel-pet-card-preview" aria-hidden="true">' + petSvg(pet, "") + '</div>' +
        '<div class="pixel-pet-card-copy"><b>' + pet.name + '</b><span>' + pet.kind + '<br>' + pet.trait + '</span>' +
        '<button class="pixel-pet-toggle" type="button" data-pet-toggle="' + pet.id + '">Add pet</button></div>' +
      '</article>';
    }).join("");

    return '<div class="pixel-pet-dialog-shell">' +
      '<header class="pixel-pet-dialog-header">' +
        '<span class="pixel-pet-dialog-mark" aria-hidden="true">&#9829;</span>' +
        '<div class="pixel-pet-dialog-title"><h2 id="pixel-pet-dialog-title">Pet Home</h2><p data-pet-count-copy>0 / 1 in your crew</p></div>' +
        '<button class="pixel-pet-close" type="button" data-pet-close aria-label="Close Pet Home">&times;</button>' +
      '</header>' +
      '<section class="pixel-pet-panel-section">' +
        '<div class="pixel-pet-panel-heading"><h3>Choose your pet</h3><small>One companion at a time</small></div>' +
        '<div class="pixel-pet-roster">' + cards + '</div>' +
      '</section>' +
      '<section class="pixel-pet-panel-section">' +
        '<div class="pixel-pet-panel-heading"><h3>Home style</h3><small>Fixed safely at bottom-left</small></div>' +
        '<div class="pixel-house-picker">' +
          '<button class="pixel-house-choice" type="button" data-house="sunbeam" aria-pressed="false"><span class="pixel-house-mini"></span>Sunbeam<br>Cottage</button>' +
          '<button class="pixel-house-choice" type="button" data-house="arcade" aria-pressed="false"><span class="pixel-house-mini"></span>Mint<br>Arcade</button>' +
          '<button class="pixel-house-choice" type="button" data-house="moon" aria-pressed="false"><span class="pixel-house-mini"></span>Moonberry<br>Cabin</button>' +
        '</div>' +
      '</section>' +
      '<section class="pixel-pet-panel-section">' +
        '<div class="pixel-pet-panel-heading"><h3>Quick actions</h3><small>Instant pixel mischief</small></div>' +
        '<div class="pixel-pet-actions">' +
          '<button class="pixel-pet-action" type="button" data-pet-action="play"><span aria-hidden="true">&#9679;</span>Playtime</button>' +
          '<button class="pixel-pet-action" type="button" data-pet-action="home"><span aria-hidden="true">&#8962;</span>Call home</button>' +
          '<button class="pixel-pet-action" type="button" data-pet-action="wake"><span aria-hidden="true">Zz</span>Wake all</button>' +
          '<button class="pixel-pet-action" type="button" data-pet-action="party"><span aria-hidden="true">&#9829;</span>Solo party</button>' +
          '<button class="pixel-pet-action" type="button" data-pet-action="shuffle"><span aria-hidden="true">&#8644;</span>Shuffle spots</button>' +
          '<button class="pixel-pet-action" type="button" data-pet-action="visibility"><span aria-hidden="true">&#9673;</span><span data-visibility-copy>Hide world</span></button>' +
        '</div>' +
      '</section>' +
      '<section class="pixel-pet-panel-section">' +
        '<div class="pixel-pet-panel-heading"><h3>Play settings</h3><small>Saved in this browser</small></div>' +
        '<div class="pixel-pet-settings">' +
          '<div class="pixel-setting"><div><b>Autoplay adventures</b><small>Pets roam, play and visit the den.</small></div><button class="pixel-switch" type="button" data-pet-setting="autoplay" aria-label="Toggle autoplay adventures" aria-pressed="true"></button></div>' +
          '<div class="pixel-setting"><div><b>Quiet motion</b><small>Keep pets still until you interact.</small></div><button class="pixel-switch" type="button" data-pet-setting="quiet" aria-label="Toggle quiet motion" aria-pressed="false"></button></div>' +
        '</div>' +
      '</section>' +
      '<footer class="pixel-pet-help">' +
        '<p><b>Try this:</b> drag pets around the screen, click for affection, or right-click a pet to open its icon-only action palette. Drop a pet onto this little home for a nap.</p>' +
        '<button class="pixel-pet-reset" type="button" data-pet-reset>Reset the entire pet world</button>' +
      '</footer>' +
    '</div>';
  }

  function PetWorld() {
    this.state = safeReadState();
    this.root = null;
    this.stage = null;
    this.house = null;
    this.dialog = null;
    this.launcher = null;
    this.contextMenu = null;
    this.contextActor = null;
    this.live = null;
    this.toastEl = null;
    this.toastTimer = 0;
    this.houseTipTimer = 0;
    this.actors = new Map();
    this.scheduler = 0;
    this.nextSocialAt = Date.now() + random(18000, 28000);
    this.managerOpen = false;
    this.destroyed = false;
  }

  PetWorld.prototype.init = function () {
    if (document.getElementById(ROOT_ID)) return;

    this.root = document.createElement("div");
    this.root.id = ROOT_ID;
    this.root.className = "pixel-pets-root";
    this.root.setAttribute("data-pet-ui", "");
    this.root.innerHTML =
      '<div class="pixel-pet-stage" data-pet-stage aria-label="Interactive pixel pet playground"></div>' +
      '<button class="pixel-pet-launcher" type="button" data-pet-launcher data-pet-house data-door-open="false" data-sleepers="0" aria-controls="pixel-pet-dialog" aria-expanded="false" aria-label="Open Pet Home">' +
        '<span class="pixel-pet-home-art" data-home-art aria-hidden="true">' + houseSvg(HOUSES[this.state.house]) + '</span>' +
        '<span class="pixel-house-sleepers" aria-hidden="true"><span></span><span></span><span></span></span>' +
        '<span class="pixel-house-zzz" aria-hidden="true">Zz</span>' +
        '<span class="pixel-pet-home-sign" aria-hidden="true">PET HOME</span>' +
        '<span class="pixel-pet-count" data-pet-count>0</span>' +
      '</button>' +
      contextMenuMarkup() +
      '<div class="pixel-pet-toast" data-pet-toast aria-hidden="true"></div>' +
      '<div class="pixel-pet-live" data-pet-live role="status" aria-live="polite"></div>' +
      '<dialog class="pixel-pet-dialog" id="pixel-pet-dialog" aria-labelledby="pixel-pet-dialog-title">' + managerMarkup() + '</dialog>';

    document.body.appendChild(this.root);
    this.stage = this.root.querySelector("[data-pet-stage]");
    this.launcher = this.root.querySelector("[data-pet-launcher]");
    this.contextMenu = this.root.querySelector("[data-pet-context]");
    this.dialog = this.root.querySelector("#pixel-pet-dialog");
    this.live = this.root.querySelector("[data-pet-live]");
    this.toastEl = this.root.querySelector("[data-pet-toast]");

    this.buildHouse();
    this.bindInterface();
    this.syncActors();
    this.applyPreferences();
    this.updateManager();
    this.scheduler = window.setInterval(this.tick.bind(this), 1600);

    if (!this.state.introduced) {
      var self = this;
      window.setTimeout(function () {
        self.launcher.dataset.nudge = "true";
        self.toast("New: right-click a pet for tricks, or open the little Pet Home.");
        var first = self.actors.values().next().value;
        if (first) first.say("Drag me or click for a trick!", 4400);
        self.state.introduced = true;
        self.persist();
        window.setTimeout(function () { delete self.launcher.dataset.nudge; }, 2200);
      }, 1200);
    }
  };

  PetWorld.prototype.buildHouse = function () {
    var theme = HOUSES[this.state.house];
    this.house = this.launcher;
    if (!this.house) return;
    var art = this.house.querySelector("[data-home-art]");
    if (art) art.innerHTML = houseSvg(theme);
    this.house.setAttribute("data-door-open", "false");
    this.house.setAttribute("data-sleepers", "0");
    this.updateHouseSleepers();
  };

  PetWorld.prototype.bindInterface = function () {
    var self = this;
    this.launcher.addEventListener("click", function () { self.openManager(); });

    this.contextMenu.addEventListener("click", function (event) {
      var action = event.target.closest("[data-context-action]");
      if (!action || !self.contextActor) return;
      event.preventDefault();
      event.stopPropagation();
      self.runContextAction(self.contextActor, action.getAttribute("data-context-action"));
    });

    this.contextMenu.addEventListener("keydown", function (event) {
      var buttons = Array.from(self.contextMenu.querySelectorAll("button"));
      var index = buttons.indexOf(document.activeElement);
      var next = index;
      if (event.key === "ArrowRight") next = (index + 1 + buttons.length) % buttons.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + buttons.length) % buttons.length;
      else if (event.key === "ArrowDown") next = (index + 3) % buttons.length;
      else if (event.key === "ArrowUp") next = (index - 3 + buttons.length) % buttons.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = buttons.length - 1;
      else return;
      event.preventDefault();
      buttons[next].focus();
    });

    this.dialog.addEventListener("click", function (event) {
      if (event.target === self.dialog) {
        var rect = self.dialog.getBoundingClientRect();
        var outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
        if (outside) self.closeManager();
        return;
      }

      var close = event.target.closest("[data-pet-close]");
      if (close) {
        self.closeManager();
        return;
      }

      var toggle = event.target.closest("[data-pet-toggle]");
      if (toggle) {
        self.togglePet(toggle.getAttribute("data-pet-toggle"));
        return;
      }

      var houseChoice = event.target.closest("[data-house]");
      if (houseChoice) {
        self.setHouse(houseChoice.getAttribute("data-house"));
        return;
      }

      var action = event.target.closest("[data-pet-action]");
      if (action) {
        var actionName = action.getAttribute("data-pet-action");
        self.command(actionName, true);
        if (actionName !== "visibility") self.closeManager();
        return;
      }

      var setting = event.target.closest("[data-pet-setting]");
      if (setting) {
        self.toggleSetting(setting.getAttribute("data-pet-setting"));
        return;
      }

      if (event.target.closest("[data-pet-reset]")) self.reset();
    });

    this.dialog.addEventListener("cancel", function (event) {
      event.preventDefault();
      self.closeManager();
    });

    this.dialog.addEventListener("close", function () {
      self.managerOpen = false;
      self.launcher.setAttribute("aria-expanded", "false");
      self.scheduleAll();
    });

    window.addEventListener("resize", function () {
      self.closeContextMenu();
      self.handleResize();
    }, { passive: true });
    window.addEventListener("scroll", function () { self.closeContextMenu(); }, { passive: true, capture: true });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) self.scheduleAll();
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest("[data-pet-context]")) self.closeContextMenu();
      if (self.managerOpen && event.target.closest(".notes-button,.annotation-fab,.annotation-drawer")) self.closeManager();
    }, true);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !self.contextMenu.hidden) {
        event.preventDefault();
        self.closeContextMenu(true);
      }
    });
  };

  PetWorld.prototype.openManager = function () {
    this.closeContextMenu();
    this.managerOpen = true;
    this.launcher.setAttribute("aria-expanded", "true");
    this.updateManager();
    this.actors.forEach(function (actor) { actor.pauseForManager(); });
    if (typeof this.dialog.showModal === "function") {
      if (!this.dialog.open) this.dialog.showModal();
    } else {
      this.dialog.setAttribute("open", "");
    }
    var close = this.dialog.querySelector("[data-pet-close]");
    if (close) close.focus();
  };

  PetWorld.prototype.closeManager = function () {
    if (!this.dialog.open) return;
    if (typeof this.dialog.close === "function") this.dialog.close();
    else this.dialog.removeAttribute("open");
    this.managerOpen = false;
    this.launcher.setAttribute("aria-expanded", "false");
    this.launcher.focus();
    this.scheduleAll();
  };

  PetWorld.prototype.openContextMenu = function (actor, clientX, clientY, focusMenu) {
    if (!actor || actor.state === "sleep" || !this.contextMenu) return;
    this.closeContextMenu();
    if (this.managerOpen) this.closeManager();
    actor.cancelAction();
    actor.wake(false);
    window.clearTimeout(actor.bubbleTimer);
    actor.el.removeAttribute("data-speaking");
    actor.lock = "menu";
    actor.setState("idle");
    actor.lastUserAction = Date.now();
    this.contextActor = actor;
    this.contextMenu.setAttribute("aria-label", "Actions for " + actor.name);
    Array.from(this.contextMenu.querySelectorAll("[data-context-action]")).forEach(function (button) {
      var action = button.getAttribute("data-context-action");
      var label = button.getAttribute("data-tooltip") || action;
      button.innerHTML = actionIconSvg(action, actor.config.species);
      button.setAttribute("aria-label", label + " — " + actor.name);
    });
    var rect = actor.el.getBoundingClientRect();
    var x = rect.left + rect.width / 2;
    var y = rect.top;
    this.contextMenu.hidden = false;
    this.contextMenu.dataset.species = actor.config.species;
    this.contextMenu.dataset.petName = actor.name;
    var width = this.contextMenu.offsetWidth || 115;
    var height = this.contextMenu.offsetHeight || 58;
    this.contextMenu.style.left = clamp(x - width / 2, 8, window.innerWidth - width - 8) + "px";
    this.contextMenu.style.top = clamp(y - height - 1, 46, window.innerHeight - height - 8) + "px";
    if (focusMenu) {
      var first = this.contextMenu.querySelector("button");
      if (first) first.focus();
    }
  };

  PetWorld.prototype.closeContextMenu = function (restoreFocus) {
    if (!this.contextMenu || this.contextMenu.hidden) return;
    var actor = this.contextActor;
    this.contextMenu.hidden = true;
    this.contextActor = null;
    if (actor && actor.lock === "menu") {
      actor.lock = "";
      actor.setState("idle");
      actor.scheduleNext();
    }
    if (restoreFocus && actor && actor.state !== "sleep") actor.el.focus();
  };

  PetWorld.prototype.runContextAction = function (actor, action) {
    this.closeContextMenu();
    if (!actor) return;
    if (action === "pet") {
      actor.react();
    } else if (action === "play") {
      this.play(actor, true);
      this.announce(actor.name + " started playing.");
    } else if (action === "snack") {
      actor.snack();
    } else if (action === "dance") {
      actor.dance();
    } else if (action === "zoomie") {
      actor.zoomie();
    } else if (action === "sleep") {
      this.sendHome(actor, true);
      this.announce(actor.name + " is going home for a nap.");
    }
  };

  PetWorld.prototype.syncActors = function () {
    var self = this;
    Array.from(this.actors.keys()).forEach(function (id) {
      if (self.state.active.indexOf(id) === -1) {
        self.actors.get(id).destroy();
        self.actors.delete(id);
      }
    });

    this.state.active.forEach(function (id, index) {
      if (!self.actors.has(id)) {
        var config = petById(id);
        if (!config) return;
        self.actors.set(id, new PetActor(self, config, index));
      }
    });

    this.updateHouseSleepers();
    this.updateManager();
  };

  PetWorld.prototype.togglePet = function (id) {
    var index = this.state.active.indexOf(id);
    var config = petById(id);
    if (!config) return;

    if (index >= 0) {
      this.state.active.splice(index, 1);
      this.announce(config.name + " went back to the roster.");
      this.toast(config.name + " is resting off-screen.");
    } else {
      if (this.state.active.length >= MAX_PETS) {
        var previous = petById(this.state.active[0]);
        this.state.active = [id];
        this.announce(config.name + " is now your active companion.");
        this.toast(config.name + " moved in" + (previous ? "; " + previous.name + " returned to the roster." : "."));
      } else {
        this.state.active.push(id);
        this.announce(config.name + " joined the playground.");
      }
      this.state.worldHidden = false;
    }

    this.persist();
    this.syncActors();
  };

  PetWorld.prototype.setHouse = function (id) {
    if (!HOUSES[id] || id === this.state.house) return;
    this.state.house = id;
    this.buildHouse();
    this.updateHouseSleepers();
    this.persist();
    this.updateManager();
    this.announce(HOUSES[id].name + " is now the shared home.");
    this.toast("Den changed to " + HOUSES[id].name + ".");
  };

  PetWorld.prototype.toggleSetting = function (setting) {
    if (setting === "autoplay") this.state.autoplay = !this.state.autoplay;
    if (setting === "quiet") this.state.quiet = !this.state.quiet;
    this.applyPreferences();
    if (setting === "autoplay" || setting === "quiet") {
      var self = this;
      this.sleepingActors().forEach(function (actor) { self.scheduleNaturalWake(actor); });
    }
    this.persist();
    this.updateManager();
    this.announce(setting === "autoplay"
      ? "Autoplay adventures " + (this.state.autoplay ? "enabled." : "paused.")
      : "Quiet motion " + (this.state.quiet ? "enabled." : "disabled."));
  };

  PetWorld.prototype.applyPreferences = function () {
    var activeCount = this.state.active.length;
    this.root.setAttribute("data-world-hidden", this.state.worldHidden ? "true" : "false");
    this.root.setAttribute("data-quiet-motion", this.state.quiet || reduceMotion ? "true" : "false");
    this.launcher.setAttribute("aria-label", "Open " + HOUSES[this.state.house].name + " Pet Home. " + activeCount + (activeCount === 1 ? " pet active, " : " pets active, ") + this.sleepingActors().length + " sleeping.");
  };

  PetWorld.prototype.updateManager = function () {
    if (!this.dialog) return;
    var active = this.state.active;
    var countCopy = this.dialog.querySelector("[data-pet-count-copy]");
    var countBadge = this.root.querySelector("[data-pet-count]");
    if (countCopy) countCopy.textContent = active.length + " / " + MAX_PETS + " in your crew";
    if (countBadge) countBadge.textContent = active.length;

    PETS.forEach(function (pet) {
      var card = this.dialog.querySelector('[data-pet-card="' + pet.id + '"]');
      if (!card) return;
      var isActive = active.indexOf(pet.id) >= 0;
      var button = card.querySelector("[data-pet-toggle]");
      card.setAttribute("data-active", isActive ? "true" : "false");
      button.textContent = isActive ? "Remove pet" : "Choose pet";
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      button.disabled = false;
      button.title = isActive ? pet.name + " is your current companion." : "Switch to " + pet.name + ".";
    }, this);

    Array.from(this.dialog.querySelectorAll("[data-house]")).forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-house") === this.state.house ? "true" : "false");
    }, this);

    var autoplay = this.dialog.querySelector('[data-pet-setting="autoplay"]');
    var quiet = this.dialog.querySelector('[data-pet-setting="quiet"]');
    if (autoplay) autoplay.setAttribute("aria-pressed", this.state.autoplay ? "true" : "false");
    if (quiet) quiet.setAttribute("aria-pressed", this.state.quiet ? "true" : "false");
    var visibilityCopy = this.dialog.querySelector("[data-visibility-copy]");
    if (visibilityCopy) visibilityCopy.textContent = this.state.worldHidden ? "Show world" : "Hide world";
    this.applyPreferences();
  };

  PetWorld.prototype.command = function (name, userTriggered) {
    var self = this;
    var actors = Array.from(this.actors.values());
    if (!actors.length && name !== "visibility") {
      this.toast("Add a pet first.");
      this.announce("Add a pet before using playground actions.");
      return;
    }

    if (name === "play") {
      actors.forEach(function (actor, index) {
        window.setTimeout(function () { self.play(actor, true); }, index * 180);
      });
      this.announce("Playtime started. Cats have balls and dogs have bones.");
    } else if (name === "home") {
      actors.forEach(function (actor, index) {
        window.setTimeout(function () { self.sendHome(actor, true, index); }, index * 220);
      });
      this.announce("The pets are heading to their fixed little home.");
    } else if (name === "wake") {
      this.wakeAll(true);
    } else if (name === "party") {
      if (actors.length < 2) {
        actors[0].react("Solo pixel party!");
        this.toast("One tiny companion, one excellent party.");
      } else {
        this.startSocial(true);
      }
    } else if (name === "shuffle") {
      actors.forEach(function (actor, index) {
        actor.wake(false);
        var spot = self.defaultPosition(index, actors.length, true);
        actor.moveTo(spot.x, spot.y, self.motionAllowed() ? 650 + index * 100 : 0, "wander");
      });
      this.toast("New lookout spots!");
      this.announce("Pet positions shuffled.");
    } else if (name === "visibility") {
      this.state.worldHidden = !this.state.worldHidden;
      this.applyPreferences();
      this.updateManager();
      this.toast(this.state.worldHidden ? "Pet world hidden. The little home stays here." : "Pet world is back!");
      this.announce(this.state.worldHidden ? "Pet world hidden." : "Pet world shown.");
    }

    if (userTriggered) {
      this.persist();
      this.updateManager();
    }
  };

  PetWorld.prototype.tick = function () {
    if (this.destroyed || document.hidden || this.managerOpen || this.state.worldHidden) return;
    if (!this.state.autoplay || !this.motionAllowed()) return;
    var now = Date.now();
    var idle = Array.from(this.actors.values()).filter(function (actor) {
      return actor.state === "idle" && !actor.lock;
    });

    if (idle.length >= 2 && now >= this.nextSocialAt) {
      this.startSocial(false);
      this.nextSocialAt = now + random(20000, 32000);
      return;
    }

    var due = idle.filter(function (actor) { return actor.nextActionAt <= now; });
    if (due.length) this.autonomousAction(choose(due));
  };

  PetWorld.prototype.autonomousAction = function (actor) {
    var inactivity = Date.now() - actor.lastUserAction;
    var roll = Math.random();
    if (inactivity > 45000 && roll < 0.24) {
      this.sendHome(actor, false);
    } else if (roll < 0.46) {
      this.wander(actor);
    } else if (roll < 0.76) {
      this.play(actor, false);
    } else {
      actor.react(actor.config.species === "cat" ? "Tiny grooming break." : "Shake, stretch, wag!");
    }
  };

  PetWorld.prototype.wander = function (actor) {
    if (!actor || actor.lock) return;
    var size = actor.size();
    var maxX = Math.max(8, window.innerWidth - size.width - 8);
    var lowerLane = Math.max(88, window.innerHeight * 0.7);
    var maxY = Math.max(88, window.innerHeight - size.height - 12);
    var targetX = random(12, maxX);
    var targetY;
    if (actor.manualAnchorUntil > Date.now()) {
      targetY = clamp(actor.anchorY + random(-30, 30), 76, maxY);
    } else {
      targetY = random(lowerLane, maxY);
    }
    if (targetY > window.innerHeight - 175 && targetX > window.innerWidth - 275) {
      targetX = random(12, Math.max(20, window.innerWidth - 300));
    }
    var distance = Math.hypot(targetX - actor.x, targetY - actor.y);
    var duration = clamp(Math.round(distance * 5.5), 900, 3400);
    actor.moveTo(targetX, targetY, duration, "wander");
    actor.finishAfter(duration + 100);
  };

  PetWorld.prototype.play = function (actor, announce) {
    if (!actor) return;
    actor.cancelAction();
    actor.lock = "solo";
    actor.setState("play");
    actor.say(actor.config.species === "cat" ? "Ball mission!" : "Bone patrol!", 1800);
    actor.emitFx(actor.config.species === "cat" ? ["*", "o", "*"] : ["!", "*", "!"]);
    var self = this;
    actor.finishTimer = window.setTimeout(function () {
      actor.lock = "";
      actor.setState("idle");
      actor.scheduleNext();
    }, this.motionAllowed() ? 3600 : 1200);
    if (announce) this.toast(actor.name + (actor.config.species === "cat" ? " is chasing a pixel ball." : " is flipping a pixel bone."));
  };

  PetWorld.prototype.sendHome = function (actor, announce, preferredSlot) {
    if (!actor) return;
    if (actor.state === "sleep") {
      if (announce) actor.wake(true);
      return;
    }
    actor.cancelAction();
    actor.lock = "home";
    var housePos = this.housePosition();
    var houseSize = this.houseSize();
    var actorSize = actor.size();
    var slot = isFinite(preferredSlot) ? preferredSlot % MAX_PETS : this.sleepingActors().length % MAX_PETS;
    var targetX = housePos.x + (houseSize.width - actorSize.width) / 2 + (slot - (MAX_PETS - 1) / 2) * 11;
    var targetY = housePos.y + houseSize.height - actorSize.height * 0.72;
    var distance = Math.hypot(targetX - actor.x, targetY - actor.y);
    var duration = this.motionAllowed() ? clamp(Math.round(distance * 4.8), 700, 3000) : 0;
    actor.say("Home, sweet pixel home.", 1700);
    actor.moveTo(targetX, targetY, duration, "wander");
    var self = this;
    actor.finishTimer = window.setTimeout(function () {
      actor.setState("sleep");
      actor.lock = "home";
      actor.say("z z z", 0);
      self.updateHouseSleepers();
      self.scheduleNaturalWake(actor);
    }, duration + 120);
    if (announce) this.toast(actor.name + " is curling up in the den.");
  };

  PetWorld.prototype.sleepingActors = function () {
    return Array.from(this.actors.values()).filter(function (actor) { return actor.state === "sleep"; });
  };

  PetWorld.prototype.scheduleNaturalWake = function (actor) {
    window.clearTimeout(actor.finishTimer);
    if (!this.state.autoplay || !this.motionAllowed() || actor.state !== "sleep") return;
    var self = this;
    actor.finishTimer = window.setTimeout(function () {
      if (actor.state === "sleep" && self.state.autoplay && self.motionAllowed()) actor.wake(false);
    }, random(12000, 19000));
  };

  PetWorld.prototype.updateHouseSleepers = function () {
    if (!this.house) return;
    var sleepers = this.sleepingActors();
    this.house.setAttribute("data-sleepers", String(sleepers.length));
    this.house.setAttribute("data-door-open", sleepers.length ? "true" : "false");
    var windows = Array.from(this.house.querySelectorAll(".pixel-house-sleepers span"));
    windows.forEach(function (slot, index) {
      var actor = sleepers[index];
      slot.classList.toggle("is-filled", !!actor);
      slot.innerHTML = actor ? petFaceSvg(actor.config) : "";
    });
    this.house.setAttribute("aria-label", HOUSES[this.state.house].name + ". " +
      (sleepers.length
        ? sleepers.length + (sleepers.length === 1 ? " pet is sleeping. " : " pets are sleeping. ") + "Activate to manage pets."
        : "Pet Home. Activate to manage pets."));
  };

  PetWorld.prototype.wakeAll = function (announce) {
    var sleepers = this.sleepingActors();
    sleepers.forEach(function (actor, index) {
      window.setTimeout(function () { actor.wake(false); }, index * 160);
    });
    if (announce) {
      this.toast(sleepers.length ? "Rise and shine, pixel crew!" : "Everyone is already awake.");
      this.announce(sleepers.length ? "All sleeping pets are waking." : "All pets are already awake.");
    }
  };

  PetWorld.prototype.startSocial = function (userTriggered) {
    var available = Array.from(this.actors.values()).filter(function (actor) {
      return actor.state !== "sleep" && !actor.lock;
    });
    if (available.length < 2) return;

    available.sort(function () { return Math.random() - 0.5; });
    var count = available.length >= 3 && (userTriggered || Math.random() < 0.38) ? 3 : 2;
    var crew = available.slice(0, count);
    var centerX = clamp(random(Math.round(window.innerWidth * 0.3), Math.round(window.innerWidth * 0.72)), 145, window.innerWidth - 170);
    var centerY = clamp(random(Math.round(window.innerHeight * 0.72), window.innerHeight - 120), 100, window.innerHeight - 115);
    var self = this;
    var travel = this.motionAllowed() ? 1400 : 0;

    crew.forEach(function (actor, index) {
      actor.cancelAction();
      actor.lock = "pair";
      var x = centerX + (index - (crew.length - 1) / 2) * 72;
      actor.facing = index < (crew.length - 1) / 2 ? "right" : "left";
      actor.updateFacing();
      actor.moveTo(x, centerY + (index % 2) * 4, travel, "wander");
    });

    window.setTimeout(function () {
      var species = crew.map(function (actor) { return actor.config.species; });
      var message;
      if (crew.length === 3) message = "Tiny pixel parade!";
      else if (species[0] === "cat" && species[1] === "cat") message = "Secret paw handshake!";
      else if (species[0] === "dog" && species[1] === "dog") message = "Friendly bone-tug!";
      else message = "Cautious nose boop!";

      crew.forEach(function (actor, index) {
        actor.setState("social");
        if (index === 0) actor.say(message, 2500);
        else actor.el.removeAttribute("data-speaking");
        actor.emitFx(["&hearts;", "*", "&hearts;"]);
      });
      if (userTriggered) {
        self.toast(message);
        self.announce(message);
      }

      window.setTimeout(function () {
        crew.forEach(function (actor) {
          actor.lock = "";
          actor.setState("idle");
          actor.scheduleNext();
        });
      }, self.motionAllowed() ? 3200 : 1300);
    }, travel + 80);
  };

  PetWorld.prototype.motionAllowed = function () {
    return !reduceMotion && !this.state.quiet;
  };

  PetWorld.prototype.defaultPosition = function (index, total, shuffled) {
    var narrow = window.innerWidth < 720;
    var width = narrow ? 80 : 94;
    var height = narrow ? 80 : 94;
    var x;
    if (shuffled) {
      x = random(narrow ? 75 : 185, Math.max(narrow ? 80 : 190, window.innerWidth - width - 20));
    } else {
      x = (narrow ? 76 : 188) + index * (narrow ? 88 : 116);
    }
    return {
      x: clamp(x, 8, Math.max(8, window.innerWidth - width - 8)),
      y: clamp(window.innerHeight - height - 18 - (index % 2) * 12, 74, Math.max(74, window.innerHeight - height - 8))
    };
  };

  PetWorld.prototype.startHouseDrag = function (event) {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    var pos = this.housePosition();
    this.houseDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pos.x,
      originY: pos.y,
      moved: false
    };
    this.house.setPointerCapture(event.pointerId);
    this.house.style.transition = "none";
  };

  PetWorld.prototype.moveHouseDrag = function (event) {
    if (!this.houseDrag || event.pointerId !== this.houseDrag.pointerId) return;
    var dx = event.clientX - this.houseDrag.startX;
    var dy = event.clientY - this.houseDrag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) this.houseDrag.moved = true;
    this.setHousePosition(this.houseDrag.originX + dx, this.houseDrag.originY + dy, false);
  };

  PetWorld.prototype.endHouseDrag = function (event) {
    if (!this.houseDrag || event.pointerId !== this.houseDrag.pointerId) return;
    var moved = this.houseDrag.moved;
    this.houseDrag = null;
    this.house.releasePointerCapture && this.house.releasePointerCapture(event.pointerId);
    this.house.style.transition = "";
    this.saveHousePosition();
    if (!moved) this.activateHouse();
  };

  PetWorld.prototype.activateHouse = function () {
    var sleepers = this.sleepingActors();
    if (sleepers.length) {
      this.wakeAll(true);
      this.houseSpeak("Door open: rise and shine!");
      return;
    }
    var awake = Array.from(this.actors.values()).filter(function (actor) { return actor.state !== "sleep"; });
    if (!awake.length) {
      this.houseSpeak("Add a pet in the Home first.");
      return;
    }
    var pos = this.housePosition();
    awake.sort(function (a, b) {
      return Math.hypot(a.x - pos.x, a.y - pos.y) - Math.hypot(b.x - pos.x, b.y - pos.y);
    });
    this.sendHome(awake[0], true);
    this.houseSpeak("A cozy bed is ready!");
  };

  PetWorld.prototype.houseKeydown = function (event) {
    var step = event.shiftKey ? 24 : 8;
    var pos = this.housePosition();
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.activateHouse();
      return;
    }
    if (event.key === "ArrowLeft") pos.x -= step;
    else if (event.key === "ArrowRight") pos.x += step;
    else if (event.key === "ArrowUp") pos.y -= step;
    else if (event.key === "ArrowDown") pos.y += step;
    else return;
    event.preventDefault();
    this.setHousePosition(pos.x, pos.y, false);
    this.saveHousePosition();
  };

  PetWorld.prototype.setHousePosition = function (x, y, animate) {
    var size = this.houseSize();
    var maxX = Math.max(8, window.innerWidth - size.width - 8);
    var maxY = Math.max(74, window.innerHeight - size.height - 8);
    x = clamp(x, 8, maxX);
    y = clamp(y, 72, maxY);
    if (!animate) this.house.style.transition = "none";
    this.house.style.setProperty("--house-x", x + "px");
    this.house.style.setProperty("--house-y", y + "px");
    this.house.dataset.x = String(x);
    this.house.dataset.y = String(y);
    if (!animate) {
      var house = this.house;
      requestAnimationFrame(function () { house.style.transition = ""; });
    }
  };

  PetWorld.prototype.housePosition = function () {
    var rect = this.house ? this.house.getBoundingClientRect() : null;
    return {
      x: rect ? rect.left : 14,
      y: rect ? rect.top : Math.max(72, window.innerHeight - 108)
    };
  };

  PetWorld.prototype.houseSize = function () {
    var rect = this.house ? this.house.getBoundingClientRect() : null;
    return {
      width: rect && rect.width ? rect.width : (window.innerWidth < 720 ? 86 : 104),
      height: rect && rect.height ? rect.height : (window.innerWidth < 720 ? 78 : 94)
    };
  };

  PetWorld.prototype.wakePositionFor = function (actor) {
    var house = this.housePosition();
    var houseSize = this.houseSize();
    var petSize = actor.size();
    var gap = 14;
    var maxX = Math.max(8, window.innerWidth - petSize.width - 8);
    var maxY = Math.max(72, window.innerHeight - petSize.height - 8);
    var floorY = clamp(house.y + houseSize.height - petSize.height + 2, 72, maxY);
    var leftX = house.x - petSize.width - gap;
    var rightX = house.x + houseSize.width + gap;
    var rawCandidates = [
      { x: leftX, y: floorY },
      { x: rightX, y: floorY },
      { x: leftX - petSize.width - 10, y: floorY },
      { x: rightX + petSize.width + 10, y: floorY },
      { x: leftX, y: floorY - petSize.height - 8 },
      { x: rightX, y: floorY - petSize.height - 8 },
      { x: house.x + (houseSize.width - petSize.width) / 2, y: house.y - petSize.height - gap }
    ];
    var awake = Array.from(this.actors.values()).filter(function (other) {
      return other !== actor && other.state !== "sleep";
    });

    var candidates = rawCandidates.map(function (candidate, index) {
      var x = clamp(candidate.x, 8, maxX);
      var y = clamp(candidate.y, 72, maxY);
      var clearOfHouse =
        x + petSize.width <= house.x - 8 ||
        x >= house.x + houseSize.width + 8 ||
        y + petSize.height <= house.y - 8 ||
        y >= house.y + houseSize.height + 8;
      var minimumPetDistance = awake.reduce(function (closest, other) {
        var distance = Math.hypot(x - other.x, y - other.y);
        return Math.min(closest, distance);
      }, 260);
      var distanceFromHouse = Math.hypot(
        x + petSize.width / 2 - (house.x + houseSize.width / 2),
        y + petSize.height / 2 - (house.y + houseSize.height / 2)
      );
      var clampPenalty = Math.abs(x - candidate.x) + Math.abs(y - candidate.y);
      return {
        x: x,
        y: y,
        clearOfHouse: clearOfHouse,
        minimumPetDistance: minimumPetDistance,
        score: clearOfHouse ? minimumPetDistance - distanceFromHouse * 0.35 - clampPenalty * 2 - index * 3 : -10000
      };
    });

    var openSide = candidates.slice(0, 2).filter(function (candidate) {
      return candidate.clearOfHouse && candidate.minimumPetDistance >= petSize.width * 0.82;
    });
    if (openSide.length) {
      openSide.sort(function (a, b) { return b.minimumPetDistance - a.minimumPetDistance; });
      return openSide[0];
    }

    candidates.sort(function (a, b) { return b.score - a.score; });
    return candidates[0];
  };

  PetWorld.prototype.saveHousePosition = function () {
    var pos = this.housePosition();
    var size = this.houseSize();
    this.state.housePosition = {
      x: pos.x / Math.max(1, window.innerWidth - size.width),
      y: pos.y / Math.max(1, window.innerHeight - size.height)
    };
    this.persist();
  };

  PetWorld.prototype.houseSpeak = function (message) {
    var tip = this.house.querySelector("[data-house-tip]");
    if (!tip) {
      this.toast(message);
      return;
    }
    tip.textContent = message;
    this.house.setAttribute("data-speaking", "true");
    window.clearTimeout(this.houseTipTimer);
    var self = this;
    this.houseTipTimer = window.setTimeout(function () {
      self.house.removeAttribute("data-speaking");
    }, 2600);
  };

  PetWorld.prototype.handleResize = function () {
    var self = this;
    this.actors.forEach(function (actor) {
      actor.setPosition(actor.x, actor.y, 0);
    });
    window.clearTimeout(this.resizePersistTimer);
    this.resizePersistTimer = window.setTimeout(function () {
      self.actors.forEach(function (actor) {
        var actorSize = actor.size();
        self.state.positions[actor.id] = {
          x: actor.x / Math.max(1, window.innerWidth - actorSize.width),
          y: actor.y / Math.max(1, window.innerHeight - actorSize.height)
        };
      });
      self.persist();
      self.updateHouseSleepers();
    }, 180);
  };

  PetWorld.prototype.scheduleAll = function () {
    this.actors.forEach(function (actor) { actor.scheduleNext(); });
    this.nextSocialAt = Date.now() + random(18000, 30000);
  };

  PetWorld.prototype.announce = function (message) {
    if (!this.live) return;
    this.live.textContent = "";
    var live = this.live;
    window.setTimeout(function () { live.textContent = message; }, 30);
  };

  PetWorld.prototype.toast = function (message) {
    if (!this.toastEl) return;
    this.toastEl.textContent = message;
    this.toastEl.setAttribute("data-show", "true");
    this.toastEl.setAttribute("aria-hidden", "false");
    window.clearTimeout(this.toastTimer);
    var self = this;
    this.toastTimer = window.setTimeout(function () {
      self.toastEl.removeAttribute("data-show");
      self.toastEl.setAttribute("aria-hidden", "true");
    }, 3400);
  };

  PetWorld.prototype.persist = function () {
    safeWriteState(this.state);
  };

  PetWorld.prototype.reset = function () {
    var confirmed = window.confirm("Reset pets, den, positions and animation settings?");
    if (!confirmed) return;
    this.actors.forEach(function (actor) { actor.destroy(); });
    this.actors.clear();
    this.state = copyDefaultState();
    this.buildHouse();
    this.syncActors();
    this.applyPreferences();
    this.persist();
    this.updateManager();
    this.toast("Fresh playground, same tiny chaos.");
    this.announce("The pet world was reset.");
  };

  function PetActor(world, config, index) {
    this.world = world;
    this.config = config;
    this.id = config.id;
    this.name = config.name;
    this.el = document.createElement("div");
    this.el.className = "pixel-pet-actor";
    this.el.tabIndex = 0;
    this.el.setAttribute("role", "button");
    this.el.setAttribute("data-pet-instance", config.id);
    this.el.setAttribute("data-species", config.species);
    this.el.setAttribute("data-state", "idle");
    this.el.setAttribute("data-facing", "right");
    this.el.setAttribute("aria-label", config.name + " the " + config.kind + ". Enter to pet, Space to play, arrow keys to move, H to go home, or Shift F10 for actions.");
    this.el.innerHTML =
      '<span class="pixel-pet-shadow" aria-hidden="true"></span>' +
      '<span class="pixel-pet-facing" aria-hidden="true"><span class="pixel-pet-avatar">' + petSvg(config, "") + '</span></span>' +
      '<span class="pixel-pet-toy" aria-hidden="true">' + toySvg(config.species) + '</span>' +
      '<span class="pixel-pet-treat" aria-hidden="true">' + treatSvg(config.species) + '</span>' +
      '<span class="pixel-pet-fx" aria-hidden="true"></span>' +
      '<span class="pixel-pet-bubble" aria-hidden="true"></span>' +
      '<span class="pixel-pet-label">' + config.name + '</span>';

    this.state = "idle";
    this.lock = "";
    this.x = 0;
    this.y = 0;
    this.facing = "right";
    this.drag = null;
    this.finishTimer = 0;
    this.bubbleTimer = 0;
    this.clickTimer = 0;
    this.suppressClickUntil = 0;
    this.nextActionAt = Date.now() + random(5000, 9000);
    this.lastUserAction = Date.now();
    this.anchorY = 0;
    this.manualAnchorUntil = 0;

    world.stage.appendChild(this.el);
    var saved = world.state.positions[this.id];
    var size = this.size();
    var position = saved && isFinite(saved.x) && isFinite(saved.y)
      ? {
          x: saved.x * Math.max(1, window.innerWidth - size.width),
          y: saved.y * Math.max(1, window.innerHeight - size.height)
        }
      : world.defaultPosition(index, world.state.active.length, false);
    this.setPosition(position.x, position.y, 0);
    this.anchorY = this.y;
    this.bind();
    this.say(choose(config.species === "cat" ? ["mrrp?", "ready to pounce.", "tiny paws online."] : ["woof!", "bone radar on.", "ready to roam."]), 2200);
  }

  PetActor.prototype.bind = function () {
    var self = this;
    this.el.addEventListener("pointerdown", function (event) { self.pointerDown(event); });
    this.el.addEventListener("pointermove", function (event) { self.pointerMove(event); });
    this.el.addEventListener("pointerup", function (event) { self.pointerUp(event); });
    this.el.addEventListener("pointercancel", function (event) { self.pointerUp(event); });
    this.el.addEventListener("lostpointercapture", function (event) { self.pointerUp(event); });
    this.windowPointerUp = function (event) { self.pointerUp(event); };
    window.addEventListener("pointerup", this.windowPointerUp);
    window.addEventListener("pointercancel", this.windowPointerUp);
    this.el.addEventListener("click", function (event) { self.click(event); });
    this.el.addEventListener("contextmenu", function (event) {
      event.preventDefault();
      event.stopPropagation();
      self.world.openContextMenu(self, event.clientX, event.clientY, false);
    });
    this.el.addEventListener("keydown", function (event) { self.keydown(event); });
    var toy = this.el.querySelector(".pixel-pet-toy");
    toy.addEventListener("pointerdown", function (event) { event.stopPropagation(); });
    toy.addEventListener("click", function (event) {
      event.stopPropagation();
      self.lastUserAction = Date.now();
      self.world.play(self, true);
      self.world.announce(self.name + " chased the tossed " + (self.config.species === "cat" ? "ball." : "bone."));
    });
  };

  PetActor.prototype.pointerDown = function (event) {
    if (event.target.closest(".pixel-pet-toy")) return;
    if (event.button !== undefined && event.button !== 0) return;
    if (this.lock === "pair") {
      event.preventDefault();
      event.stopPropagation();
      this.say("Friend moment!", 900);
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.cancelAction();
    this.wake(false);
    this.drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: this.x,
      originY: this.y,
      moved: false
    };
    this.lock = "user";
    this.setState("dragging");
    this.el.setPointerCapture(event.pointerId);
    this.el.style.zIndex = "610";
  };

  PetActor.prototype.pointerMove = function (event) {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;
    event.preventDefault();
    var dx = event.clientX - this.drag.startX;
    var dy = event.clientY - this.drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) this.drag.moved = true;
    this.setPosition(this.drag.originX + dx, this.drag.originY + dy, 0);
  };

  PetActor.prototype.pointerUp = function (event) {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    var moved = this.drag.moved;
    this.drag = null;
    this.el.releasePointerCapture && this.el.releasePointerCapture(event.pointerId);
    this.lock = "";
    this.lastUserAction = Date.now();
    this.anchorY = this.y;
    this.manualAnchorUntil = Date.now() + 60000;
    this.setState("idle");
    this.savePosition();
    this.updateDepth();
    if (moved && this.overHouseDoor()) {
      this.suppressClickUntil = Date.now() + 420;
      this.world.sendHome(this, true);
      this.world.announce(this.name + " was tucked into the little Pet Home.");
    } else if (moved) {
      this.suppressClickUntil = Date.now() + 420;
      this.say("New lookout!", 1600);
      this.emitFx(["*", "+", "*"]);
      this.world.announce(this.name + " moved to a new spot.");
    }
    this.scheduleNext();
  };

  PetActor.prototype.click = function (event) {
    if (event.target.closest(".pixel-pet-toy")) return;
    event.preventDefault();
    event.stopPropagation();
    if (this.drag) return;
    if (Date.now() < this.suppressClickUntil) return;
    var self = this;
    window.clearTimeout(this.clickTimer);
    if (event.detail >= 2) {
      this.zoomie();
      return;
    }
    this.clickTimer = window.setTimeout(function () { self.react(); }, 210);
  };

  PetActor.prototype.keydown = function (event) {
    var step = event.shiftKey ? 24 : 8;
    if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
      event.preventDefault();
      this.world.openContextMenu(this, 0, 0, true);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      this.react();
      return;
    }
    if (event.key === " ") {
      event.preventDefault();
      this.world.play(this, true);
      this.world.announce(this.name + " started playing.");
      return;
    }
    if (event.key.toLowerCase() === "h") {
      event.preventDefault();
      this.world.sendHome(this, true);
      this.world.announce(this.name + " is going home.");
      return;
    }
    if (event.key === "ArrowLeft") this.x -= step;
    else if (event.key === "ArrowRight") this.x += step;
    else if (event.key === "ArrowUp") this.y -= step;
    else if (event.key === "ArrowDown") this.y += step;
    else return;
    event.preventDefault();
    this.wake(false);
    this.setPosition(this.x, this.y, 0);
    this.anchorY = this.y;
    this.manualAnchorUntil = Date.now() + 60000;
    this.savePosition();
    this.say("step!", 700);
  };

  PetActor.prototype.react = function (customMessage) {
    this.cancelAction();
    this.wake(false);
    this.lock = "user";
    this.lastUserAction = Date.now();
    this.setState("react");
    var messages = this.config.species === "cat"
      ? ["Purrfect timing!", "Head boop accepted.", "Tiny heart deployed.", "Study buddy mode!"]
      : ["Best click ever!", "Tail-wag turbo!", "You found the happy spot.", "Study squad!"];
    this.say(customMessage || choose(messages), 1900);
    this.emitFx(["&hearts;", "*", "&hearts;"]);
    var self = this;
    this.finishTimer = window.setTimeout(function () {
      self.lock = "";
      self.setState("idle");
      self.scheduleNext();
    }, this.world.motionAllowed() ? 900 : 500);
    if (!customMessage) {
      this.world.announce(this.name + " is happy.");
      this.world.toast(this.name + (this.config.species === "cat" ? " purrs in eight-bit." : " activates turbo tail."));
    }
  };

  PetActor.prototype.snack = function () {
    this.cancelAction();
    this.wake(false);
    this.lock = "user";
    this.lastUserAction = Date.now();
    this.setState("snack");
    this.say(this.config.species === "cat" ? "Pixel fish!" : "Biscuit break!", 1800);
    this.emitFx(["+", "*", "+"]);
    var self = this;
    this.finishTimer = window.setTimeout(function () {
      self.lock = "";
      self.setState("idle");
      self.scheduleNext();
    }, this.world.motionAllowed() ? 2300 : 900);
    this.world.toast(this.name + " enjoyed a tiny snack.");
    this.world.announce(this.name + " is eating a pixel snack.");
  };

  PetActor.prototype.dance = function () {
    this.cancelAction();
    this.wake(false);
    this.lock = "user";
    this.lastUserAction = Date.now();
    this.setState("dance");
    this.say(this.config.species === "cat" ? "Paw-step remix!" : "Tail-wag shuffle!", 1900);
    this.emitFx(["&#9835;", "*", "&#9834;"]);
    var self = this;
    this.finishTimer = window.setTimeout(function () {
      self.lock = "";
      self.setState("idle");
      self.scheduleNext();
    }, this.world.motionAllowed() ? 2700 : 1000);
    this.world.toast(this.name + " started an eight-bit dance.");
    this.world.announce(this.name + " is dancing.");
  };

  PetActor.prototype.zoomie = function () {
    this.cancelAction();
    this.wake(false);
    this.lock = "user";
    this.lastUserAction = Date.now();
    this.setState("zoomie");
    this.say("ZOOM!", 1000);
    this.emitFx(["*", "!", "*"]);
    var startX = this.x;
    var targetX = clamp(this.x + (this.facing === "left" ? -100 : 100), 8, window.innerWidth - this.size().width - 8);
    this.moveTo(targetX, this.y, this.world.motionAllowed() ? 420 : 0, "zoomie");
    var self = this;
    this.finishTimer = window.setTimeout(function () {
      self.moveTo(startX, self.y, self.world.motionAllowed() ? 420 : 0, "zoomie");
      self.finishTimer = window.setTimeout(function () {
        self.lock = "";
        self.setState("idle");
        self.scheduleNext();
      }, self.world.motionAllowed() ? 460 : 120);
    }, this.world.motionAllowed() ? 460 : 120);
    this.world.announce(this.name + " did a zoomie loop.");
  };

  PetActor.prototype.wake = function (announce) {
    if (this.state !== "sleep") return;
    window.clearTimeout(this.finishTimer);
    this.lock = "";
    var house = this.world.housePosition();
    var spot = this.world.wakePositionFor(this);
    this.setPosition(spot.x, spot.y, 0);
    this.anchorY = spot.y;
    this.facing = spot.x < house.x ? "right" : "left";
    this.updateFacing();
    this.setState("react");
    this.say("Good morning!", 1700);
    this.emitFx(["*", "+", "*"]);
    this.world.updateHouseSleepers();
    var self = this;
    this.finishTimer = window.setTimeout(function () {
      self.setState("idle");
      self.scheduleNext();
      self.world.updateHouseSleepers();
    }, this.world.motionAllowed() ? 850 : 300);
    if (announce) {
      this.world.toast(this.name + " woke up refreshed.");
      this.world.announce(this.name + " woke up.");
    }
  };

  PetActor.prototype.pauseForManager = function () {
    if (this.state === "wander" && !this.lock) this.setState("idle");
  };

  PetActor.prototype.setState = function (state) {
    this.state = state;
    this.el.setAttribute("data-state", state);
    this.el.tabIndex = state === "sleep" ? -1 : 0;
    if (state === "sleep") this.el.setAttribute("aria-hidden", "true");
    else this.el.removeAttribute("aria-hidden");
    var activity = state === "idle" ? "waiting" : state;
    this.el.setAttribute("aria-label", this.name + " the " + this.config.kind + ", " + activity + ". Enter to pet, Space to play, arrow keys to move, H to go home, or Shift F10 for actions.");
    if (state !== "sleep") this.world.updateHouseSleepers();
  };

  PetActor.prototype.moveTo = function (x, y, duration, state) {
    if (state) this.setState(state);
    this.facing = x < this.x ? "left" : "right";
    this.updateFacing();
    this.setPosition(x, y, duration);
  };

  PetActor.prototype.setPosition = function (x, y, duration) {
    var size = this.size();
    var maxX = Math.max(8, window.innerWidth - size.width - 8);
    x = clamp(x, 8, maxX);
    y = clamp(y, 72, Math.max(72, window.innerHeight - size.height - 8));
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.el.setAttribute("data-edge", this.x < 58 ? "left" : this.x > maxX - 58 ? "right" : "center");
    this.el.style.setProperty("--pet-travel", Math.max(0, duration || 0) + "ms");
    this.el.style.setProperty("--pet-x", this.x + "px");
    this.el.style.setProperty("--pet-y", this.y + "px");
    this.updateDepth();
  };

  PetActor.prototype.updateFacing = function () {
    this.el.setAttribute("data-facing", this.facing);
  };

  PetActor.prototype.updateDepth = function () {
    var ratio = this.y / Math.max(1, window.innerHeight);
    this.el.style.zIndex = String(80 + Math.round(ratio * 360));
  };

  PetActor.prototype.size = function () {
    return {
      width: this.el.offsetWidth || (window.innerWidth < 720 ? 80 : 94),
      height: this.el.offsetHeight || (window.innerWidth < 720 ? 80 : 94)
    };
  };

  PetActor.prototype.savePosition = function () {
    var size = this.size();
    this.world.state.positions[this.id] = {
      x: this.x / Math.max(1, window.innerWidth - size.width),
      y: this.y / Math.max(1, window.innerHeight - size.height)
    };
    this.world.persist();
  };

  PetActor.prototype.scheduleNext = function () {
    this.nextActionAt = Date.now() + random(7500, 15000);
  };

  PetActor.prototype.finishAfter = function (delay) {
    var self = this;
    window.clearTimeout(this.finishTimer);
    this.finishTimer = window.setTimeout(function () {
      self.lock = "";
      self.setState("idle");
      self.savePosition();
      self.scheduleNext();
    }, delay);
  };

  PetActor.prototype.cancelAction = function () {
    window.clearTimeout(this.finishTimer);
    window.clearTimeout(this.clickTimer);
    this.lock = "";
  };

  PetActor.prototype.say = function (message, duration) {
    var bubble = this.el.querySelector(".pixel-pet-bubble");
    bubble.textContent = message;
    this.el.setAttribute("data-speaking", "true");
    window.clearTimeout(this.bubbleTimer);
    if (duration === 0) return;
    var self = this;
    this.bubbleTimer = window.setTimeout(function () {
      self.el.removeAttribute("data-speaking");
    }, duration || 1800);
  };

  PetActor.prototype.emitFx = function (symbols) {
    if (reduceMotion || this.world.state.quiet) return;
    var fx = this.el.querySelector(".pixel-pet-fx");
    fx.innerHTML = symbols.map(function (symbol) { return "<i>" + symbol + "</i>"; }).join("");
    window.setTimeout(function () { fx.innerHTML = ""; }, 1050);
  };

  PetActor.prototype.overHouseDoor = function () {
    var petRect = this.el.getBoundingClientRect();
    var houseRect = this.world.house.getBoundingClientRect();
    var petCenterX = petRect.left + petRect.width / 2;
    var petCenterY = petRect.top + petRect.height / 2;
    return petCenterX > houseRect.left + houseRect.width * 0.48 &&
      petCenterX < houseRect.right + 16 &&
      petCenterY > houseRect.top + houseRect.height * 0.32 &&
      petCenterY < houseRect.bottom + 18;
  };

  PetActor.prototype.destroy = function () {
    if (this.world.contextActor === this) this.world.closeContextMenu();
    window.clearTimeout(this.finishTimer);
    window.clearTimeout(this.bubbleTimer);
    window.clearTimeout(this.clickTimer);
    window.removeEventListener("pointerup", this.windowPointerUp);
    window.removeEventListener("pointercancel", this.windowPointerUp);
    this.el.remove();
    this.world.updateHouseSleepers();
  };

  function start() {
    if (!document.body || document.getElementById(ROOT_ID)) return;
    var world = new PetWorld();
    world.init();
    window.PixelPetWorld = {
      open: function () { world.openManager(); },
      add: function (id) {
        if (world.state.active.indexOf(id) < 0) world.togglePet(id);
      },
      remove: function (id) {
        if (world.state.active.indexOf(id) >= 0) world.togglePet(id);
      },
      command: function (name) { world.command(name, true); },
      getState: function () { return JSON.parse(JSON.stringify(world.state)); },
      pets: PETS.map(function (pet) { return { id: pet.id, name: pet.name, species: pet.species }; })
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
