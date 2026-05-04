const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

const statusLine = document.getElementById("statusLine");
const heroStats = document.getElementById("heroStats");
const partyList = document.getElementById("partyList");
const inventoryList = document.getElementById("inventoryList");
const questLog = document.getElementById("questLog");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const modalActions = document.getElementById("modalActions");

const TILE = 32;
const VIEW_W = 24;
const VIEW_H = 16;
const SAVE_KEY = "heroes-robin-era-save-v1";
const HERO_WORLD_HEIGHT = 54;
const NPC_WORLD_HEIGHT = 52;
const BATTLE_COLS = 9;
const BATTLE_ROWS = 5;
const MOVE_DURATION_MS = 235;
const WALK_FRAME_MS = 76;
const IDLE_FRAME_MS = 620;
const DAY_LENGTH_STEPS = 40;
const NIGHT_ENCOUNTER_MIN = 1;
const NIGHT_ENCOUNTER_MAX = 3;

const spriteSheet = new Image();
let spriteSheetReady = false;
const cutoutCache = new Map();
const portraitCache = new Map();
let terrainCache = null;
spriteSheet.onload = () => {
  spriteSheetReady = true;
  terrainCache = null;
  cutoutCache.clear();
  portraitCache.clear();
  prewarmCutouts();
  renderAll();
};
spriteSheet.src = "assets/generated-spritesheet.png";

const characterSheet = new Image();
let characterSheetReady = false;
const characterCutoutCache = new Map();
characterSheet.onload = () => {
  characterSheetReady = true;
  characterCutoutCache.clear();
  portraitCache.clear();
  prewarmCharacterCutouts();
  renderAll();
};
characterSheet.src = "assets/character-animation-sheet.png";

const heroDirectionSheet = new Image();
let heroDirectionSheetReady = false;
const heroDirectionCutoutCache = new Map();
heroDirectionSheet.onload = () => {
  heroDirectionSheetReady = true;
  heroDirectionCutoutCache.clear();
  portraitCache.clear();
  prewarmHeroDirectionCutouts();
  renderAll();
};
heroDirectionSheet.src = "assets/hero-directional-animation.png";

const enemySheet = new Image();
let enemySheetReady = false;
const enemyCutoutCache = new Map();
enemySheet.onload = () => {
  enemySheetReady = true;
  enemyCutoutCache.clear();
  portraitCache.clear();
  prewarmEnemyCutouts();
  renderAll();
};
enemySheet.src = "assets/enemy-animation-sheet.png";

const atlas = {
  hero: [18, 18, 76, 126],
  heroRight: [139, 18, 74, 126],
  heroLeft: [255, 18, 76, 126],
  heroBack: [18, 174, 76, 126],
  rival: [382, 22, 82, 125],
  rivalSide: [493, 23, 73, 124],
  leafFox: [582, 44, 105, 101],
  leafFoxWalk: [582, 173, 104, 93],
  emberGolem: [768, 34, 105, 126],
  emberGolemWalk: [763, 169, 109, 96],
  tideWisp: [910, 148, 87, 129],
  tideWispAlt: [912, 25, 83, 107],
  town: [25, 460, 380, 250],
  mine: [431, 454, 256, 255],
  forestScene: [714, 452, 287, 195],
  castle: [1025, 12, 492, 374],
  arena: [1024, 443, 492, 457],
  grass: [23, 744, 138, 118],
  forest: [178, 745, 145, 118],
  road: [333, 746, 133, 116],
  stone: [481, 746, 118, 115],
  water: [616, 744, 154, 126],
  bridge: [791, 744, 208, 127],
  mountain: [22, 879, 171, 88],
  mountainSnow: [431, 873, 255, 95],
  chest: [693, 902, 111, 94],
  chestOpen: [839, 900, 118, 95],
};

const palette = {
  grass: "#5fae5d",
  grass2: "#76c46b",
  forest: "#276c3f",
  mountain: "#70737a",
  water: "#347db3",
  road: "#b68955",
  town: "#d9b95f",
  castle: "#b4b7c6",
  mine: "#8c6a4a",
  tower: "#302339",
  chest: "#e3a84d",
  danger: "#9e463f",
  playerFlag: "#2f7de1",
};

const heroBaseStats = {
  name: "Robin",
  level: 1,
  xp: 0,
  maxHp: 34,
  hp: 34,
  atk: 7,
  def: 3,
  speed: 6,
  power: 4,
  morale: 5,
  moveType: "ground",
  skills: [],
};

const creatureBook = {
  leafFox: { name: "Leaf Fox", color: "#6fc66a", maxHp: 22, atk: 6, def: 2, speed: 8, power: 3, morale: 6, moveType: "ground", skill: "Vine snap" },
  emberGolem: { name: "Ember Golem", color: "#d66945", maxHp: 28, atk: 8, def: 1, speed: 4, power: 6, morale: 4, moveType: "ground", skill: "Cinder fist" },
  tideWisp: { name: "Tide Wisp", color: "#62a8d8", maxHp: 20, atk: 5, def: 4, speed: 7, power: 5, morale: 5, moveType: "flying", skill: "Foam guard" },
  duskMoth: { name: "Dusk Moth", color: "#a477d7", maxHp: 24, atk: 7, def: 2, speed: 6, power: 5, morale: 5, moveType: "flying", skill: "Moon dust" },
};

const encounters = {
  goblin: { name: "Hill Bandit", color: "#ab7048", hp: 28, atk: 6, def: 2, speed: 6, power: 3, morale: 4, moveType: "ground", reward: 28 },
  basilisk: { name: "Mire Basilisk", color: "#568d55", hp: 34, atk: 8, def: 3, speed: 5, power: 5, morale: 4, moveType: "ground", reward: 35 },
  raiders: { name: "Cinder Raiders", color: "#bd5f45", hp: 38, atk: 9, def: 3, speed: 6, power: 5, morale: 5, moveType: "ground", reward: 42 },
  wyvern: { name: "Glasswing Wyvern", color: "#5aa6c8", hp: 42, atk: 9, def: 4, speed: 8, power: 6, morale: 5, moveType: "flying", reward: 52 },
  knight: { name: "Clockwork Knight", color: "#9fa7b7", hp: 44, atk: 10, def: 6, speed: 3, power: 6, morale: 5, moveType: "ground", reward: 48 },
  warlock: { name: "Ashen Warlock", color: "#8b5fbf", hp: 56, atk: 11, def: 4, speed: 6, power: 8, morale: 6, moveType: "flying", reward: 70 },
  rival: { name: "Rival Mage Orius", color: "#7a4bb5", hp: 72, atk: 12, def: 5, speed: 7, power: 8, morale: 7, moveType: "flying", reward: 140 },
};

const nightEncounterPool = ["goblin", "basilisk", "raiders", "wyvern", "knight", "warlock"];

const itemDefinitions = {
  healingDraught: {
    name: "Healing Draught",
    type: "consumable",
    description: "Restore 18 HP to every party member.",
    use: () => {
      recoverParty(18);
      return "Healing Draught restores 18 HP to the party.";
    },
  },
  bannerOfLuck: {
    name: "Banner of Luck",
    type: "equipment",
    description: "Equip once: Robin gains +1 attack.",
    use: () => {
      state.hero.atk += 1;
      return "Banner of Luck is equipped. Robin gains +1 attack.";
    },
  },
  silverBridle: {
    name: "Silver Bridle",
    type: "equipment",
    description: "Equip once: Robin gains +1 defense.",
    use: () => {
      state.hero.def += 1;
      return "Silver Bridle is equipped. Robin gains +1 defense.";
    },
  },
  starlitCompass: {
    name: "Starlit Compass",
    type: "equipment",
    description: "Equip once: Robin gains +1 speed.",
    use: () => {
      state.hero.speed += 1;
      return "Starlit Compass is equipped. Robin gains +1 speed.";
    },
  },
  forgeCharm: {
    name: "Forge Charm",
    type: "equipment",
    description: "Equip once: Robin gains +6 max HP and fully heals.",
    use: () => {
      state.hero.maxHp += 6;
      state.hero.hp = state.hero.maxHp;
      return "Forge Charm is equipped. Robin gains +6 max HP.";
    },
  },
};

const chestItemIds = {
  "Banner of Luck": "bannerOfLuck",
  "Silver Bridle": "silverBridle",
  "Starlit Compass": "starlitCompass",
  "Forge Charm": "forgeCharm",
};

const mapRows = [
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
  "WGGGGGFFFGGGGGGMMMWWGGGGGGGGGGFFFGGGGW",
  "WGTGGGFFFGGCHGGMMMWWGGFFFGGGGGRRRGGGGW",
  "WGGGRRRGGGGRRRGGGGGWWGFFFGGGGGRGGGGGGW",
  "WFFGRWGGGGGGRRRGGGGGGGGGRRRGGGGRGGMMGW",
  "WFFFWWWWGGGGGRRRGGTTGGGRHGGGGGRGGMMMGW",
  "WGGRGGWWGGMMGGGRRGGGGGGRGGGGGGRRRGGGGW",
  "WGGRTGGGGGMMGGGGRRRRRGGGGGGGGGGGGRGGTW",
  "WGGGRRRRGGGGGFFFGGGGRGGMMGGGFFFGGRGGGW",
  "WGMMGGGRRRGGGFFFGGGGRGGMMGGGFFFGRRGGGW",
  "WGMMTTGGGRRRGGGGGGTGRGGGGGGGGMGGGGRGGW",
  "WGGGGGGGGGGRRRRRGGGGRRRGFFFGGMGGGGRGGW",
  "WGGGFFFGGGGGGGGRRRGGGGRGFFFGGMRRRRGGGW",
  "WGGGFFFGGGGCHGGGGRRRGGGRGGGGGGGGGGGCHW",
  "WGGGGGGGGGGGGGGGGGGRRRKGGGGGGGGFFFGGGW",
  "WGGFFFGGMMGGGGRRRRGGGGGGGMMGGGFFFGGGGW",
  "WGGFFFGGMMGGGGRGGGGGTTGGGMMGGGRRRGGGGW",
  "WGGGGGGGGGGGRRRGGGGGGGGGGGGGGGRGGGGGGW",
  "WGGGMMMWWGGGRGGFFFFGGGRRRRGGGGRGGMMMGW",
  "WGGGGGGWWGGGRGGGFFFGGGGGGRGGGGRGGMMMGW",
  "WGGCHGGGGGGGRRRRGGGGGGGGGRRRRRGGGGKTGW",
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
];

const MAP_W = Math.max(...mapRows.map((row) => row.length));
const MAP_H = mapRows.length;
const map = mapRows.map((row) => row.padEnd(MAP_W, "W").split(""));
const events = new Map([
  ["3,2", { type: "town", name: "Robinhold", creature: "leafFox" }],
  ["16,5", { type: "town", name: "Ashbell", creature: "emberGolem" }],
  ["9,10", { type: "town", name: "Mistfen", creature: "tideWisp" }],
  ["35,7", { type: "town", name: "Moonbarrow", creature: "duskMoth" }],
  ["36,20", { type: "town", name: "Southwatch", creature: "tideWisp" }],
  ["11,2", { type: "chest", gold: 55, item: "Banner of Luck" }],
  ["11,13", { type: "chest", gold: 70, item: "Silver Bridle" }],
  ["35,13", { type: "chest", gold: 85, item: "Starlit Compass" }],
  ["4,20", { type: "chest", gold: 95, item: "Forge Charm" }],
  ["7,7", { type: "battle", encounter: "goblin" }],
  ["13,9", { type: "battle", encounter: "basilisk" }],
  ["29,6", { type: "battle", encounter: "raiders" }],
  ["31,11", { type: "battle", encounter: "wyvern" }],
  ["22,6", { type: "battle", encounter: "knight" }],
  ["24,18", { type: "battle", encounter: "warlock" }],
  ["34,20", { type: "battle", encounter: "knight" }],
  ["35,20", { type: "final", encounter: "rival" }],
  ["5,6", { type: "mine", gold: 20 }],
  ["20,2", { type: "mine", gold: 25 }],
  ["21,9", { type: "mine", gold: 25 }],
  ["30,10", { type: "mine", gold: 30 }],
  ["7,16", { type: "mine", gold: 35 }],
  ["31,18", { type: "mine", gold: 40 }],
]);

const defaultState = () => ({
  x: 2,
  y: 2,
  day: 1,
  steps: 0,
  dayProgress: 0,
  nightReady: false,
  gold: 80,
  relics: [],
  inventory: [{ id: "healingDraught", qty: 1 }],
  equipped: {},
  won: false,
  visited: {},
  hero: { ...heroBaseStats, skills: [] },
  party: [makeCreature("leafFox")],
  log: ["Reach the southeast tower.", "Gather four creatures.", "Claim the scattered relics."],
});

let state = loadGame() || defaultState();
let message = "Explore the realm and build your party.";
let modalOpen = false;
let visual = { x: state.x, y: state.y, fromX: state.x, fromY: state.y, toX: state.x, toY: state.y, moving: false, startedAt: 0, progress: 0 };
let facing = "down";
let animationTime = 0;
let activeBattle = null;
let activeNight = null;
let pendingLevelUps = 0;
let camera = { x: 0, y: 0, originX: 0, originY: 0, key: "" };
const keyMap = {
  ArrowUp: [0, -1],
  w: [0, -1],
  W: [0, -1],
  ArrowDown: [0, 1],
  s: [0, 1],
  S: [0, 1],
  ArrowLeft: [-1, 0],
  a: [-1, 0],
  A: [-1, 0],
  ArrowRight: [1, 0],
  d: [1, 0],
  D: [1, 0],
};
const heldKeys = new Set();

function makeCreature(id) {
  const base = creatureBook[id];
  return { id, name: base.name, color: base.color, level: 1, xp: 0, maxHp: base.maxHp, hp: base.maxHp, atk: base.atk, def: base.def, speed: base.speed, power: base.power, morale: base.morale, moveType: base.moveType, skill: base.skill, skills: [] };
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function normalizeState(saved) {
  saved.steps ??= 0;
  saved.dayProgress = Number.isFinite(saved.dayProgress) ? Math.max(0, Math.min(DAY_LENGTH_STEPS, saved.dayProgress)) : (saved.steps || 0) % DAY_LENGTH_STEPS;
  saved.nightReady ??= saved.dayProgress >= DAY_LENGTH_STEPS;
  saved.relics ??= [];
  saved.inventory = normalizeInventory(saved.inventory ?? saved.relics);
  saved.equipped ??= {};
  saved.hero = { ...heroBaseStats, ...saved.hero, skills: saved.hero.skills || [] };
  saved.party?.forEach((unit) => {
    unit.xp ??= 0;
    unit.atk ??= creatureBook[unit.id]?.atk ?? 5;
    unit.def ??= creatureBook[unit.id]?.def ?? 2;
    unit.speed ??= creatureBook[unit.id]?.speed ?? 5;
    unit.power ??= creatureBook[unit.id]?.power ?? 3;
    unit.morale ??= creatureBook[unit.id]?.morale ?? 4;
    unit.moveType ??= creatureBook[unit.id]?.moveType ?? "ground";
    unit.skills ??= [];
  });
  return saved;
}

function normalizeInventory(inventory) {
  if (!Array.isArray(inventory)) return [];
  return inventory
    .map((entry) => (typeof entry === "string" ? { id: chestItemIds[entry] || entry, qty: 1 } : entry))
    .filter((entry) => entry && itemDefinitions[entry.id] && Number(entry.qty) > 0)
    .reduce((items, entry) => {
      const existing = items.find((item) => item.id === entry.id);
      const qty = Number(entry.qty);
      if (existing) existing.qty += qty;
      else items.push({ id: entry.id, qty });
      return items;
    }, []);
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  setMessage("Game saved at day " + state.day + ".");
}

function resetGame() {
  state = defaultState();
  visual = { x: state.x, y: state.y, fromX: state.x, fromY: state.y, toX: state.x, toY: state.y, moving: false, startedAt: 0, progress: 0 };
  terrainCache = null;
  camera = { x: 0, y: 0, originX: 0, originY: 0, key: "" };
  heldKeys.clear();
  localStorage.removeItem(SAVE_KEY);
  setMessage("A fresh campaign begins.");
  renderAll();
}

function setMessage(text) {
  message = text;
  statusLine.textContent = text;
}

function isBlocked(x, y) {
  const tile = map[y]?.[x];
  return !tile || tile === "W" || tile === "M";
}

function move(dx, dy) {
  if (modalOpen || state.won || visual.moving) return;
  if (state.nightReady || activeNight) return beginNight();
  const ox = state.x;
  const oy = state.y;
  const nx = state.x + dx;
  const ny = state.y + dy;
  if (isBlocked(nx, ny)) {
    setMessage("Impassable terrain blocks the route.");
    return;
  }
  facing = dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down";
  state.x = nx;
  state.y = ny;
  state.steps = (state.steps || 0) + 1;
  advanceDayProgress();
  recoverParty(1);
  startMoveAnimation(ox, oy, nx, ny);
  renderSidebar();
}

function advanceDayProgress() {
  if (state.nightReady) return;
  state.dayProgress = Math.min(DAY_LENGTH_STEPS, (state.dayProgress || 0) + 1);
  if (state.dayProgress >= DAY_LENGTH_STEPS) {
    state.nightReady = true;
    setMessage("Dusk falls. Make camp before traveling farther.");
  }
}

function startMoveAnimation(fromX, fromY, toX, toY) {
  visual = { x: fromX, y: fromY, fromX, fromY, toX, toY, moving: true, startedAt: performance.now(), progress: 0 };
  const step = (now) => {
    const t = Math.min(1, (now - visual.startedAt) / MOVE_DURATION_MS);
    const eased = smoothStep(t);
    visual.x = fromX + (toX - fromX) * eased;
    visual.y = fromY + (toY - fromY) * eased;
    visual.progress = t;
    if (t < 1) {
      requestAnimationFrame(step);
      return;
    }
    visual = { x: toX, y: toY, fromX: toX, fromY: toY, toX, toY, moving: false, startedAt: 0, progress: 0 };
    triggerEvent();
    if (state.nightReady && !modalOpen) beginNight();
    renderAll();
    continueHeldMovement();
  };
  requestAnimationFrame(step);
}

function smoothStep(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function continueHeldMovement() {
  if (modalOpen || state.won || visual.moving) return;
  if (state.nightReady || activeNight) return beginNight();
  const next = getHeldDirection();
  if (next) move(next[0], next[1]);
}

function getHeldDirection() {
  const priority = ["ArrowUp", "w", "W", "ArrowDown", "s", "S", "ArrowLeft", "a", "A", "ArrowRight", "d", "D"];
  const key = priority.find((item) => heldKeys.has(item));
  return key ? keyMap[key] : null;
}

function recoverParty(amount) {
  state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + amount);
  state.party.forEach((unit) => {
    unit.hp = Math.min(unit.maxHp, unit.hp + amount);
  });
}

function triggerEvent() {
  const key = `${state.x},${state.y}`;
  const event = events.get(key);
  if (!event) {
    return;
  }
  if (state.visited[key] && event.type !== "final") {
    setMessage(`${eventLabel(event)} is already under your banner.`);
    return;
  }
  if (event.type === "town") return townEvent(key, event);
  if (event.type === "mine") return mineEvent(key, event);
  if (event.type === "chest") return chestEvent(key, event);
  if (event.type === "battle" || event.type === "final") return battleEvent(key, event);
}

function randomTravelLine() {
  const lines = [
    "Scouts report movement beyond the trees.",
    "The road bends toward old banners and buried coins.",
    "Your creatures are ready for the next skirmish.",
    "A wind from the tower carries a challenge.",
  ];
  return lines[(state.day + state.x + state.y) % lines.length];
}

function beginNight() {
  if (modalOpen || state.won) return;
  heldKeys.clear();
  if (!activeNight) {
    activeNight = {
      day: state.day,
      encounters: buildNightEncounters(),
      index: 0,
      awaitingResult: false,
    };
  }
  openModal("Nightfall", `Day ${state.day} ends. Spend the night and defend camp through ${activeNight.encounters.length} encounter${activeNight.encounters.length === 1 ? "" : "s"}.`, [
    { label: "Make Camp", action: () => startNextNightEncounter() },
  ]);
}

function buildNightEncounters() {
  const count = NIGHT_ENCOUNTER_MIN + Math.floor(Math.random() * (NIGHT_ENCOUNTER_MAX - NIGHT_ENCOUNTER_MIN + 1));
  const partyLevel = averagePartyLevel();
  return Array.from({ length: count }, (_, index) => {
    const difficulty = partyLevel + Math.floor((state.day - 1) / 2) + index;
    const poolIndex = Math.min(nightEncounterPool.length - 1, Math.max(0, Math.floor(difficulty / 2) + Math.floor(Math.random() * 2)));
    const encounterId = nightEncounterPool[poolIndex];
    return scaledNightEnemy(encounterId, difficulty, index);
  });
}

function averagePartyLevel() {
  const team = [state.hero, ...state.party];
  return team.reduce((sum, unit) => sum + (unit.level || 1), 0) / Math.max(1, team.length);
}

function scaledNightEnemy(encounterId, difficulty, index) {
  const base = structuredClone(encounters[encounterId]);
  const level = Math.max(1, Math.round(difficulty));
  const scale = Math.max(0, level - 1);
  const hp = base.hp + scale * 6 + index * 3;
  return {
    ...base,
    name: `${base.name} Night Raid`,
    hp,
    maxHp: hp,
    atk: base.atk + Math.floor(scale * 0.85),
    def: base.def + Math.floor(scale * 0.45),
    speed: base.speed + Math.floor(scale * 0.2),
    power: (base.power ?? 3) + Math.floor(scale * 0.4),
    morale: (base.morale ?? 4) + Math.floor(scale * 0.25),
    reward: Math.round(base.reward * 0.45 + level * 6),
    nightLevel: level,
    sourceEncounter: encounterId,
  };
}

function startNextNightEncounter() {
  if (!activeNight) return beginNight();
  const enemy = activeNight.encounters[activeNight.index];
  if (!enemy) return finishNight();
  activeNight.awaitingResult = true;
  setMessage(`Night ${activeNight.index + 1}/${activeNight.encounters.length}: ${enemy.name} approaches camp.`);
  startBattle(`night-${activeNight.day}-${activeNight.index}`, { type: "night", encounter: enemy.sourceEncounter }, enemy);
}

function continueNightAfterBattle() {
  if (!activeNight) return renderAll();
  activeNight.awaitingResult = false;
  activeNight.index += 1;
  if (activeNight.index >= activeNight.encounters.length) return finishNight();
  const next = activeNight.encounters[activeNight.index];
  openModal("Night Watch", `${next.name} is moving in the dark. ${activeNight.encounters.length - activeNight.index} encounter${activeNight.encounters.length - activeNight.index === 1 ? "" : "s"} remain before dawn.`, [
    { label: "Stand Guard", action: () => startNextNightEncounter() },
  ]);
}

function finishNight() {
  const completedDay = activeNight?.day || state.day;
  activeNight = null;
  state.day += 1;
  state.dayProgress = 0;
  state.nightReady = false;
  recoverParty(Math.max(8, Math.round(state.hero.maxHp * 0.35)));
  setMessage(`Dawn breaks on day ${state.day}. Camp survived night ${completedDay}.`);
  openModal("Dawn", `Your party rests before sunrise. Day ${state.day} begins.`, [
    { label: "Continue", action: () => renderAll() },
  ]);
}

function abandonNightAfterDefeat() {
  activeNight = null;
  state.day += 1;
  state.dayProgress = 0;
  state.nightReady = false;
}

function eventLabel(event) {
  if (event.type === "town") return event.name;
  if (event.type === "mine") return "This mine";
  if (event.type === "chest") return "This treasure";
  if (event.type === "battle") return "This outpost";
  return "This place";
}

function townEvent(key, event) {
  const creature = creatureBook[event.creature];
  const owned = state.party.some((unit) => unit.id === event.creature);
  const cost = 45 + state.party.length * 20;
  if (owned) {
    state.visited[key] = true;
    state.hero.hp = state.hero.maxHp;
    state.party.forEach((unit) => (unit.hp = unit.maxHp));
    setMessage(`${event.name} restores your party.`);
    return;
  }
  openModal(event.name, `${creature.name} will join for ${cost} gold. Current gold: ${state.gold}.`, [
    {
      label: "Recruit",
      action: () => {
        if (state.gold < cost) {
          setMessage("Not enough gold for recruitment.");
          return;
        }
        state.gold -= cost;
        state.party.push(makeCreature(event.creature));
        state.visited[key] = true;
        setMessage(`${creature.name} joined the party.`);
        renderAll();
      },
    },
    { label: "Leave", secondary: true, action: () => setMessage(`You leave ${event.name}.`) },
  ]);
}

function mineEvent(key, event) {
  const payout = event.gold + state.hero.level * 4;
  state.gold += payout;
  state.visited[key] = true;
  setMessage(`The mine yields ${payout} gold.`);
  openModal("Mine Claimed", `Your banner is raised over the mine. It yields ${payout} gold.`, [
    { label: "Done", action: () => renderAll() },
  ]);
}

function chestEvent(key, event) {
  state.gold += event.gold;
  state.relics.push(event.item);
  const itemId = chestItemIds[event.item];
  if (itemId) addInventoryItem(itemId, 1);
  state.visited[key] = true;
  setMessage(`Found ${event.item} and ${event.gold} gold.`);
  openModal("Treasure Found", `You found ${event.item} and ${event.gold} gold. The item was added to your inventory.`, [
    { label: "Done", action: () => renderAll() },
  ]);
}

function addInventoryItem(id, qty = 1) {
  const definition = itemDefinitions[id];
  if (!definition || qty <= 0) return;
  const existing = state.inventory.find((item) => item.id === id);
  if (existing) existing.qty += qty;
  else state.inventory.push({ id, qty });
}

function useInventoryItem(id) {
  if (modalOpen) return;
  const item = state.inventory.find((entry) => entry.id === id);
  const definition = itemDefinitions[id];
  if (!item || !definition) return;
  if (definition.type === "equipment" && state.equipped[id]) {
    setMessage(`${definition.name} is already equipped.`);
    return;
  }
  const result = definition.use();
  if (definition.type === "consumable") {
    item.qty -= 1;
    if (item.qty <= 0) state.inventory = state.inventory.filter((entry) => entry !== item);
  } else {
    state.equipped[id] = true;
  }
  setMessage(result);
  renderAll();
}

function battleEvent(key, event) {
  const enemies = createEnemyParty(event.encounter);
  const leader = enemies[0];
  const enemyText = enemies.length > 1 ? `${leader.name} and ${enemies.length - 1} ally${enemies.length === 2 ? "" : "ies"} block the path.` : `${leader.name} blocks the path.`;
  openModal("Battle", `${enemyText} Commit your army to battle?`, [
    { label: "Fight", action: () => startBattle(key, event, enemies) },
    { label: "Retreat", secondary: true, action: () => setMessage("You hold position and prepare.") },
  ]);
}

function createEnemyParty(encounterId, sourceEnemy = null) {
  const base = structuredClone(sourceEnemy || encounters[encounterId]);
  const countByEncounter = {
    goblin: 2,
    raiders: 3,
    warlock: 2,
    rival: 3,
  };
  const count = sourceEnemy ? 1 : countByEncounter[encounterId] || 1;
  const partyNames = {
    goblin: [`${base.name} Leader`, `${base.name} Scout`],
    raiders: [`${base.name} Captain`, `${base.name} Scout`, `${base.name} Guard`],
    warlock: [base.name, "Ashen Familiar"],
    rival: [base.name, "Tower Adept", "Tower Sentinel"],
  };
  const names = count === 1 ? [base.name] : partyNames[encounterId] || [`${base.name} Captain`, `${base.name} Scout`, `${base.name} Guard`];
  return Array.from({ length: count }, (_, index) => {
    const unit = normalizeEnemyUnit({ ...structuredClone(base), name: names[index] || `${base.name} ${index + 1}` });
    unit.sourceEncounter ??= sourceEnemy?.sourceEncounter || encounterId;
    if (count > 1) {
      const rewardShare = Math.floor((base.reward || 0) / count);
      const hpScale = index === 0 ? 0.84 : 0.64;
      unit.maxHp = Math.max(8, Math.round(unit.maxHp * hpScale));
      unit.hp = unit.maxHp;
      unit.atk = Math.max(2, unit.atk - (index === 0 ? 1 : 2));
      unit.def = Math.max(0, unit.def - (index === 0 ? 0 : 1));
      unit.reward = index === 0 ? (base.reward || 0) - rewardShare * (count - 1) : rewardShare;
    }
    return unit;
  });
}

function normalizeEnemyUnit(enemy) {
  enemy.maxHp ??= enemy.hp;
  enemy.hp ??= enemy.maxHp;
  enemy.def ??= 1;
  enemy.power ??= 3;
  enemy.morale ??= 4;
  enemy.moveType ??= "ground";
  return enemy;
}

function startBattle(key, event, enemyInput) {
  const team = [state.hero, ...state.party];
  const positions = team.map((unit, index) => ({ x: 1, y: Math.min(BATTLE_ROWS - 1, index), acted: unit.hp <= 0 }));
  const enemies = Array.isArray(enemyInput) ? enemyInput.map((enemy) => normalizeEnemyUnit(enemy)) : createEnemyParty(event.encounter, enemyInput);
  const enemyPositions = enemies.map((_, index) => ({ x: BATTLE_COLS - 2, y: Math.min(BATTLE_ROWS - 1, index + 1) }));
  const enemyNames = enemies.map((enemy) => enemy.name).join(", ");
  activeBattle = {
    key,
    event,
    enemies,
    reward: enemies.reduce((sum, enemy) => sum + (enemy.reward || 0), 0),
    turn: "",
    round: 1,
    selectedIndex: -1,
    selectedEnemyIndex: 0,
    activeActor: null,
    queue: [],
    queueIndex: 0,
    positions,
    enemyPositions,
    log: [`${enemyNames} engage your party.`],
  };
  buildBattleQueue();
  advanceBattleTurn();
  renderBattle();
}

function buildBattleQueue() {
  if (!activeBattle) return;
  const enemyTurns = activeBattle.enemies
    .map((enemy, index) => ({ type: "enemy", index, name: enemy.name, speed: enemy.speed || 1 }))
    .filter((actor) => activeBattle.enemies[actor.index]?.hp > 0);
  activeBattle.queue = [state.hero, ...state.party]
    .map((unit, index) => ({ type: "unit", index, name: unit.name, speed: unit.speed || 1 }))
    .concat(enemyTurns)
    .sort((a, b) => b.speed - a.speed || a.name.localeCompare(b.name));
  activeBattle.queueIndex = 0;
}

function advanceBattleTurn() {
  if (!activeBattle) return;
  const aliveUnits = [state.hero, ...state.party].some((unit) => unit.hp > 0);
  if (!aliveUnits) return finishBattle(false);
  if (!livingEnemies().length) return finishBattle(true);
  if (activeBattle.queueIndex >= activeBattle.queue.length) {
    activeBattle.round += 1;
    buildBattleQueue();
  }
  const actor = activeBattle.queue[activeBattle.queueIndex++];
  if (actor.type === "unit") {
    const unit = [state.hero, ...state.party][actor.index];
    if (!unit || unit.hp <= 0) return advanceBattleTurn();
    activeBattle.activeActor = actor;
    activeBattle.selectedIndex = actor.index;
    if (activeBattle.positions[actor.index]) activeBattle.positions[actor.index].acted = false;
    activeBattle.turn = "player";
    activeBattle.log.push(`${unit.name}'s turn.`);
    return;
  }
  const enemy = activeBattle.enemies[actor.index];
  if (!enemy || enemy.hp <= 0) return advanceBattleTurn();
  activeBattle.activeActor = actor;
  activeBattle.selectedIndex = -1;
  activeBattle.selectedEnemyIndex = actor.index;
  activeBattle.turn = "enemy";
  activeBattle.log.push(`${enemy.name}'s turn.`);
  window.setTimeout(enemyBattleTurn, 450);
}

function renderBattle() {
  if (!activeBattle) return;
  modalOpen = true;
  modalTitle.textContent = `Battle: ${battleEnemyTitle()}`;
  modalText.innerHTML = battleMarkup();
  modalActions.innerHTML = "";
  bindBattleBoard();

  if (activeBattle.turn === "player") {
    const activeUnit = selectedBattleUnit();
    if (activeUnit) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "battle-action";
      button.innerHTML = `<span>${activeUnit.name}</span><b>Attack</b>`;
      button.setAttribute("aria-label", `${activeUnit.name} attacks selected enemy`);
      button.addEventListener("click", () => selectedBattleAttack());
      modalActions.appendChild(button);
    }
    const guard = document.createElement("button");
    guard.type = "button";
    guard.className = "secondary battle-action";
    guard.innerHTML = `<span>${activeUnit?.name || "Unit"}</span><b>Guard</b>`;
    guard.setAttribute("aria-label", "Current unit guards against the next enemy attack");
    guard.addEventListener("click", guardBattleAction);
    modalActions.appendChild(guard);
  } else {
    const waiting = document.createElement("p");
    waiting.className = "battle-wait";
    waiting.textContent = "Enemy turn...";
    modalActions.appendChild(waiting);
  }

  if (!modal.open) modal.showModal();
}

function battleMarkup() {
  const teamRows = [state.hero, ...state.party]
    .map((unit, index) => battleUnitMarkup(unit, index))
    .join("");
  const enemyRows = activeBattle.enemies
    .map((enemy, index) => battleEnemyMarkup(enemy, index))
    .join("");
  const cells = battleCellsMarkup();
  const log = activeBattle.log.slice(-5).map((line) => `<li>${line}</li>`).join("");
  const order = activeBattle.queue.map((actor, index) => `<span class="${index === activeBattle.queueIndex - 1 ? "active" : ""}">${actor.name} ${actor.speed}</span>`).join("");
  return `
    <div class="battle-board">
      <div class="turn-order"><b>Turn order</b>${order}</div>
      <div class="battle-layout">
        <div class="battle-arena" aria-label="Battle arena">
          <div class="battle-grid">${cells}${teamRows}${enemyRows}</div>
        </div>
        <div class="battle-roster">${battleRosterMarkup()}</div>
      </div>
      <ol class="battle-log">${log}</ol>
    </div>
  `;
}

function battleCellsMarkup() {
  let html = "";
  const activeUnit = selectedBattleUnit();
  const activePos = activeBattle?.positions?.[activeBattle.selectedIndex];
  for (let y = 0; y < BATTLE_ROWS; y += 1) {
    for (let x = 0; x < BATTLE_COLS; x += 1) {
      const classes = ["battle-cell"];
      const tile = { x, y };
      const canMoveHere = activeBattle?.turn === "player" && activeUnit && activePos && !isBattleOccupied(x, y) && battleDistance(activePos, tile, activeUnit) <= moveRange(activeUnit);
      const attacksFromHere = activeBattle?.turn === "player" && activeUnit && activeBattle.enemyPositions.some((pos, index) => activeBattle.enemies[index]?.hp > 0 && battleDistance(tile, pos, activeUnit) <= 1);
      const attackableEnemyHere = activeBattle?.turn === "player" && activeUnit && activePos && activeBattle.enemyPositions.some((pos, index) => activeBattle.enemies[index]?.hp > 0 && pos.x === x && pos.y === y && battleDistance(activePos, pos, activeUnit) <= 1);
      if (canMoveHere) {
        classes.push("reachable");
      }
      if ((canMoveHere && attacksFromHere) || attackableEnemyHere) {
        classes.push("attack-lane");
      }
      html += `<button type="button" class="${classes.join(" ")}" data-battle-tile="${x},${y}" style="grid-column:${x + 1};grid-row:${y + 1}" aria-label="Battle tile ${x + 1}, ${y + 1}"></button>`;
    }
  }
  return html;
}

function battleRosterMarkup() {
  const rows = [state.hero, ...state.party].map((unit, index) => battleStatCard(unit, activeBattle.selectedIndex === index)).join("");
  const enemyRows = activeBattle.enemies.map((enemy, index) => battleStatCard(enemy, activeBattle.selectedEnemyIndex === index, true)).join("");
  return `${rows}${enemyRows}`;
}

function battleStatCard(unit, active, enemy = false) {
  return `<div class="battle-stat-card ${active ? "active" : ""} ${enemy ? "enemy" : ""}"><strong>${unit.name}</strong><span>HP ${Math.max(0, unit.hp)}/${unit.maxHp || unit.hp}</span><span>Atk ${unit.atk || 0} Def ${unit.def || 0}</span><span>Spd ${unit.speed || 1} Move ${moveRange(unit)} ${unit.moveType || "ground"}</span></div>`;
}

function bindBattleBoard() {
  const board = modalText.querySelector(".battle-grid");
  if (!board || !activeBattle) return;
  board.addEventListener("click", (event) => {
    const unitEl = event.target.closest("[data-battle-unit]");
    if (unitEl) {
      selectBattleUnit(Number(unitEl.dataset.battleUnit));
      return;
    }
    const enemyEl = event.target.closest("[data-battle-enemy]");
    if (enemyEl) {
      selectedBattleAttack(Number(enemyEl.dataset.battleEnemy));
      return;
    }
    const tile = event.target.closest("[data-battle-tile]");
    if (tile) {
      const [x, y] = tile.dataset.battleTile.split(",").map(Number);
      moveSelectedBattleUnit(x, y);
    }
  });
}

function livingTeam() {
  return [state.hero, ...state.party].filter((unit) => unit.hp > 0);
}

function livingEnemies() {
  return activeBattle?.enemies.filter((enemy) => enemy.hp > 0) || [];
}

function hpPercent(unit) {
  return Math.max(0, Math.min(100, Math.round((unit.hp / unit.maxHp) * 100)));
}

function battleUnitMarkup(unit, index) {
  const fill = hpPercent(unit);
  const portrait = battleUnitPortrait(unit);
  const pos = activeBattle.positions[index] || { x: 1, y: index };
  const selected = activeBattle.selectedIndex === index;
  const feedbackClass = battleFeedbackClassForUnit(index);
  const sprite = portrait
    ? `<img class="battle-sprite-img" src="${portrait}" alt="" />`
    : `<div class="battle-token" style="--unit-color:${unit.color || "#f0c15b"}"></div>`;
  return `
    <button type="button" class="battle-combatant battle-unit ${unit.hp <= 0 ? "down" : ""} ${selected ? "selected" : ""} ${feedbackClass}" data-battle-unit="${index}" style="grid-column:${pos.x + 1};grid-row:${pos.y + 1}" aria-label="Select ${unit.name}">
      <div class="battle-base">${sprite}</div>
      <div class="battle-mini-hp" style="--fill:${fill}%"><span></span></div>
    </button>
  `;
}
function battleEnemyMarkup(enemy, index) {
  const fill = hpPercent(enemy);
  const portrait = battleEnemyPortrait(enemy);
  const feedbackClass = battleFeedbackClassForEnemy(index);
  const attackable = canActiveUnitAttackEnemy(index);
  const sprite = portrait
    ? `<img class="battle-sprite-img enemy" src="${portrait}" alt="" />`
    : `<div class="battle-token enemy" style="--unit-color:${enemy.color || "#d95d5d"}"></div>`;
  const pos = activeBattle.enemyPositions[index];
  const selected = activeBattle.selectedEnemyIndex === index;
  return `
    <button type="button" class="battle-combatant battle-enemy ${enemy.hp <= 0 ? "down" : ""} ${selected ? "selected" : ""} ${attackable ? "attackable" : ""} ${feedbackClass}" data-battle-enemy="${index}" style="grid-column:${pos.x + 1};grid-row:${pos.y + 1}" aria-label="${attackable ? "Attack" : "Select"} ${enemy.name}">
      <div class="battle-base">${sprite}</div>
      ${attackable ? `<span class="battle-attack-icon" aria-hidden="true">&#9876;</span>` : ""}
      <div class="battle-mini-hp danger" style="--fill:${fill}%"><span></span></div>
    </button>
  `;
}

function canActiveUnitAttackEnemy(enemyIndex) {
  if (!activeBattle || activeBattle.turn !== "player") return false;
  const unit = selectedBattleUnit();
  const unitPos = activeBattle.positions[activeBattle.selectedIndex];
  const enemy = activeBattle.enemies[enemyIndex];
  const enemyPos = activeBattle.enemyPositions[enemyIndex];
  return Boolean(unit && unit.hp > 0 && unitPos && !unitPos.acted && enemy && enemy.hp > 0 && enemyPos && battleDistance(unitPos, enemyPos, unit) <= 1);
}

function battleFeedbackClassForUnit(index) {
  const feedback = activeBattle?.feedback;
  if (!feedback || feedback.unitIndex !== index) return "";
  if (feedback.type === "move") return "battle-feedback-move";
  if (feedback.type === "guard") return "battle-feedback-guard";
  if (feedback.type === "hit" && feedback.target === "unit") return "battle-feedback-damage";
  if (feedback.type === "hit") return "battle-feedback-attack";
  return "";
}

function battleFeedbackClassForEnemy(index) {
  const feedback = activeBattle?.feedback;
  if (!feedback || feedback.target !== "enemy" || feedback.enemyIndex !== index) return "";
  if (feedback.type === "hit") return "battle-feedback-damage";
  if (feedback.type === "move") return "battle-feedback-move";
  return "";
}
function battleUnitPortrait(unit) {
  if (!characterSheetReady && !spriteSheetReady) return "";
  return getPortraitDataUrl(spriteNameForUnit(unit));
}

function battleEnemyPortrait(enemy) {
  const enemySprite = spriteNameForEnemy(enemy);
  if (enemySheetReady && enemySprite) return getEnemyPortraitDataUrl(enemySprite);
  if (!characterSheetReady && !spriteSheetReady) return "";
  return getPortraitDataUrl(fallbackSpriteForEnemy(enemy));
}

function spriteNameForEnemy(enemy) {
  if (enemy.sourceEncounter) return enemy.sourceEncounter;
  if (enemy.color === encounters.goblin.color) return "goblin";
  if (enemy.color === encounters.basilisk.color) return "basilisk";
  if (enemy.color === encounters.knight.color) return "knight";
  if (enemy.color === encounters.raiders.color) return "raiders";
  if (enemy.color === encounters.wyvern.color) return "wyvern";
  if (enemy.color === encounters.warlock.color) return "warlock";
  return "rival";
}

function fallbackSpriteForEnemy(enemy) {
  if (enemy.color === encounters.basilisk.color) return "leafFox";
  if (enemy.color === encounters.knight.color || enemy.color === encounters.raiders.color) return "emberGolem";
  if (enemy.color === encounters.wyvern.color) return "tideWisp";
  return "rival";
}

function selectBattleUnit(index) {
  if (!activeBattle || activeBattle.turn !== "player") return;
  if (activeBattle.activeActor?.type !== "unit" || activeBattle.activeActor.index !== index) return;
  const unit = [state.hero, ...state.party][index];
  const pos = activeBattle.positions[index];
  if (!unit || unit.hp <= 0 || pos?.acted) return;
  activeBattle.selectedIndex = index;
  activeBattle.log.push(`${unit.name} is ready.`);
  renderBattle();
}

function selectedBattleUnit() {
  if (!activeBattle) return null;
  return [state.hero, ...state.party][activeBattle.selectedIndex] || null;
}

function moveSelectedBattleUnit(x, y) {
  if (!activeBattle || activeBattle.turn !== "player") return;
  const unit = selectedBattleUnit();
  const pos = activeBattle.positions[activeBattle.selectedIndex];
  if (!unit || unit.hp <= 0 || !pos || pos.acted) return;
  if (isBattleOccupied(x, y)) {
    activeBattle.log.push("That tile is occupied.");
    return renderBattle();
  }
  if (x < 0 || y < 0 || x >= BATTLE_COLS || y >= BATTLE_ROWS) return;
  const distance = battleDistance(pos, { x, y }, unit);
  const range = moveRange(unit);
  if (distance > range) {
    activeBattle.log.push(`${unit.name} can move ${range} tiles.`);
    return renderBattle();
  }
  pos.x = x;
  pos.y = y;
  activeBattle.feedback = { type: "move", unitIndex: activeBattle.selectedIndex };
  activeBattle.log.push(`${unit.name} moves.`);
  finishBattleUnitAction();
}

function selectedBattleAttack(enemyIndex = activeBattle?.selectedEnemyIndex) {
  if (!activeBattle || activeBattle.turn !== "player") return;
  const unit = selectedBattleUnit();
  const pos = activeBattle.positions[activeBattle.selectedIndex];
  const explicitTarget = Number.isInteger(enemyIndex);
  const targetIndex = explicitTarget ? enemyIndex : livingEnemyIndex(activeBattle.selectedEnemyIndex);
  const enemy = activeBattle.enemies[targetIndex];
  const enemyPos = activeBattle.enemyPositions[targetIndex];
  if (!unit || unit.hp <= 0 || !pos || pos.acted) return;
  if (!enemy || !enemyPos) return;
  if (enemy.hp <= 0) {
    activeBattle.log.push(`${enemy.name} is already down.`);
    return renderBattle();
  }
  activeBattle.selectedEnemyIndex = targetIndex;
  const distance = battleDistance(pos, enemyPos, unit);
  if (distance > 1) {
    activeBattle.log.push(`${unit.name} is too far away to attack.`);
    return renderBattle();
  }
  playerBattleAction(activeBattle.selectedIndex, targetIndex);
}

function isBattleOccupied(x, y) {
  if (activeBattle.enemyPositions.some((pos, index) => pos.x === x && pos.y === y && activeBattle.enemies[index]?.hp > 0)) return true;
  return activeBattle.positions.some((pos, index) => pos.x === x && pos.y === y && [state.hero, ...state.party][index]?.hp > 0);
}

function moveRange(unit) {
  return Math.max(1, unit.speed || 1);
}

function battleDistance(from, to, unit) {
  const dx = Math.abs(from.x - to.x);
  const dy = Math.abs(from.y - to.y);
  return unit?.moveType === "flying" ? Math.max(dx, dy) : dx + dy;
}

function finishBattleUnitAction() {
  const pos = activeBattle.positions[activeBattle.selectedIndex];
  if (pos) pos.acted = true;
  advanceBattleTurn();
  renderBattle();
}

function playerBattleAction(attackerIndex, enemyIndex) {
  const attacker = [state.hero, ...state.party][attackerIndex];
  const enemy = activeBattle?.enemies[enemyIndex];
  if (!activeBattle || !attacker || !enemy || enemy.hp <= 0) return;
  const moraleBonus = (attacker.morale || 0) >= 7 ? 2 : 0;
  const damage = Math.max(2, attacker.atk + Math.ceil((attacker.power || 0) / 2) + attacker.level + moraleBonus - (enemy.def || 0) + Math.floor(Math.random() * 4) - 1);
  activeBattle.feedback = { type: "hit", unitIndex: attackerIndex, enemyIndex, target: "enemy" };
  enemy.hp -= damage;
  activeBattle.log.push(`${attacker.name} hits ${enemy.name} for ${damage}.`);
  if (enemy.hp <= 0) {
    enemy.hp = 0;
    activeBattle.log.push(`${enemy.name} falls.`);
  }
  if (!livingEnemies().length) return finishBattle(true);
  finishBattleUnitAction();
}

function guardBattleAction() {
  if (!activeBattle) return;
  const unit = selectedBattleUnit();
  activeBattle.feedback = { type: "guard", unitIndex: activeBattle.selectedIndex };
  activeBattle.log.push(`${unit?.name || "Unit"} guards.`);
  activeBattle.guarding = true;
  finishBattleUnitAction();
}

function enemyBattleTurn() {
  if (!activeBattle) return;
  const enemyIndex = activeBattle.activeActor?.index ?? activeBattle.selectedEnemyIndex;
  const enemy = activeBattle.enemies[enemyIndex];
  if (!enemy || enemy.hp <= 0) {
    advanceBattleTurn();
    return renderBattle();
  }
  const targets = livingTeam();
  if (!targets.length) return finishBattle(false);
  const target = nearestEnemyTarget(enemyIndex, targets);
  moveEnemyTowardTarget(enemyIndex, target);
  const enemyPos = activeBattle.enemyPositions[enemyIndex];
  const targetIndex = [state.hero, ...state.party].indexOf(target);
  const targetPos = activeBattle.positions[targetIndex];
  if (battleDistance(enemyPos, targetPos, enemy) > 1) {
    activeBattle.feedback = { type: "move", enemyIndex, target: "enemy" };
    activeBattle.log.push(`${enemy.name} advances.`);
    advanceBattleTurn();
    return renderBattle();
  }
  const guardReduction = activeBattle.guarding ? 3 : 0;
  const damage = Math.max(1, enemy.atk - (target.def || 1) - guardReduction + Math.floor(Math.random() * 3));
  activeBattle.feedback = { type: "hit", unitIndex: targetIndex, target: "unit" };
  target.hp -= damage;
  activeBattle.log.push(`${enemy.name} strikes ${target.name} for ${damage}.`);
  activeBattle.guarding = false;
  if (!livingTeam().length) return finishBattle(false);
  advanceBattleTurn();
  renderBattle();
}

function nearestEnemyTarget(enemyIndex, targets) {
  const team = [state.hero, ...state.party];
  const enemy = activeBattle.enemies[enemyIndex];
  const enemyPos = activeBattle.enemyPositions[enemyIndex];
  return targets
    .map((unit) => {
      const index = team.indexOf(unit);
      const pos = activeBattle.positions[index];
      return { unit, distance: battleDistance(enemyPos, pos, enemy) };
    })
    .sort((a, b) => a.distance - b.distance || a.unit.name.localeCompare(b.unit.name))[0].unit;
}

function moveEnemyTowardTarget(enemyIndex, target) {
  const enemy = activeBattle.enemies[enemyIndex];
  const from = activeBattle.enemyPositions[enemyIndex];
  const targetIndex = [state.hero, ...state.party].indexOf(target);
  const to = activeBattle.positions[targetIndex];
  const range = moveRange(enemy);
  if (!enemy || !from || !to || battleDistance(from, to, enemy) <= 1) return;
  let best = { ...from, distance: battleDistance(from, to, enemy) };
  for (let y = 0; y < BATTLE_ROWS; y += 1) {
    for (let x = 0; x < BATTLE_COLS; x += 1) {
      if (x === from.x && y === from.y) continue;
      if (battleDistance(from, { x, y }, enemy) > range) continue;
      if (isBattleOccupiedByOther(x, y, enemyIndex)) continue;
      const distance = battleDistance({ x, y }, to, enemy);
      if (distance < best.distance) best = { x, y, distance };
    }
  }
  from.x = best.x;
  from.y = best.y;
}

function isBattleOccupiedByOther(x, y, movingEnemyIndex = -1) {
  const enemyOccupied = activeBattle.enemyPositions.some((pos, index) => index !== movingEnemyIndex && pos.x === x && pos.y === y && activeBattle.enemies[index]?.hp > 0);
  if (enemyOccupied) return true;
  return activeBattle.positions.some((pos, index) => pos.x === x && pos.y === y && [state.hero, ...state.party][index]?.hp > 0);
}

function livingEnemyIndex(preferredIndex) {
  if (Number.isInteger(preferredIndex) && activeBattle.enemies[preferredIndex]?.hp > 0) return preferredIndex;
  return activeBattle.enemies.findIndex((enemy) => enemy.hp > 0);
}

function battleEnemyTitle() {
  const enemies = activeBattle.enemies;
  if (enemies.length === 1) return enemies[0].name;
  const living = livingEnemies().length;
  return `${enemies[0].name} Party (${living}/${enemies.length})`;
}

function finishBattle(wonBattle) {
  if (!activeBattle) return;
  const { key, event, enemies, reward, log } = activeBattle;
  const leader = enemies[0];
  const enemyLabel = enemies.length > 1 ? `${leader.name}'s party` : leader.name;
  activeBattle = null;
  if (wonBattle) {
    state.gold += reward;
    const xpReport = gainXp(event.type === "night" ? Math.max(18, 18 + (leader.nightLevel || state.hero.level) * 4) : event.encounter === "rival" ? 60 : 24);
    if (event.type !== "night") state.visited[key] = true;
    if (event.type === "final") {
      state.won = true;
      setMessage("The rival mage falls. Robinhold is free.");
      openModal("Victory", "Your banner rises over the black tower. The realm remembers Robin's era.", [
        { label: "Continue", action: () => resolvePostBattleProgression() },
      ]);
    } else if (event.type === "night") {
      setMessage(`${enemyLabel} defeated before dawn.`);
      openModal("Camp Defended", `${log.slice(-3).join(" ")} Reward: ${reward} gold and ${xpReport.amount} XP.`, [{ label: "Continue Watch", action: () => resolvePostBattleProgression() }]);
    } else {
      setMessage(`${enemyLabel} defeated. Gained ${reward} gold.`);
      openModal("Victory", `${log.slice(-3).join(" ")} Reward: ${reward} gold and ${xpReport.amount} XP.`, [{ label: "Done", action: () => resolvePostBattleProgression() }]);
    }
  } else {
    const wasNightBattle = event.type === "night";
    state.gold = Math.max(0, state.gold - 30);
    state.x = 2;
    state.y = 2;
    visual = { x: state.x, y: state.y, fromX: state.x, fromY: state.y, toX: state.x, toY: state.y, moving: false, startedAt: 0, progress: 0 };
    terrainCache = null;
    camera = { x: 0, y: 0, originX: 0, originY: 0, key: "" };
    state.hero.hp = Math.ceil(state.hero.maxHp / 2);
    state.party.forEach((unit) => (unit.hp = Math.ceil(unit.maxHp / 2)));
    if (wasNightBattle) abandonNightAfterDefeat();
    setMessage(wasNightBattle ? "Night defeat. You retreat to Robinhold by dawn and lose 30 gold." : "Defeat. You retreat to Robinhold and lose 30 gold.");
    openModal("Defeat", wasNightBattle ? "Your camp breaks before dawn. The party retreats to Robinhold and loses 30 gold." : "Your party collapses and retreats to Robinhold. You lose 30 gold.", [{ label: "Recover", action: () => renderAll() }]);
  }
  renderAll();
}

function gainXp(amount) {
  let heroLevels = 0;
  state.hero.xp += amount;
  state.party.forEach((unit) => {
    unit.xp = (unit.xp || 0) + amount;
    while (unit.xp >= xpToNext(unit)) {
      unit.xp -= xpToNext(unit);
      unit.level += 1;
      unit.maxHp += 4;
      unit.atk += 1;
      unit.hp = unit.maxHp;
    }
  });
  while (state.hero.xp >= state.hero.level * 50) {
    state.hero.xp -= xpToNext(state.hero);
    state.hero.level += 1;
    state.hero.maxHp += 6;
    state.hero.atk += 2;
    state.hero.def += 1;
    state.hero.hp = state.hero.maxHp;
    heroLevels += 1;
  }
  pendingLevelUps += heroLevels;
  return { amount, heroLevels };
}

function xpToNext(unit) {
  return unit.level * 50;
}

function resolvePostBattleProgression() {
  if (pendingLevelUps > 0) return openSkillChoice();
  if (activeNight?.awaitingResult) return continueNightAfterBattle();
  renderAll();
}

function openSkillChoice() {
  const choices = [
    { name: "Command", text: "+2 attack. Your units hit harder.", apply: () => (state.hero.atk += 2) },
    { name: "Fortitude", text: "+10 max HP. Robin fully heals.", apply: () => { state.hero.maxHp += 10; state.hero.hp = state.hero.maxHp; } },
    { name: "Tactics", text: "+2 defense. Enemy strikes hurt less.", apply: () => (state.hero.def += 2) },
  ].filter((choice) => !state.hero.skills.includes(choice.name));
  const available = choices.length ? choices : [{ name: "Veteran", text: "+1 attack and +1 defense.", apply: () => { state.hero.atk += 1; state.hero.def += 1; } }];
  openModal("Level Up", `Robin reached level ${state.hero.level}. Choose a skill.`, available.map((choice) => ({
    label: choice.name,
    action: () => {
      choice.apply();
      state.hero.skills.push(choice.name);
      pendingLevelUps -= 1;
      setMessage(`Learned ${choice.name}.`);
      resolvePostBattleProgression();
    },
  })));
  modalText.innerHTML = `<p>Robin reached level ${state.hero.level}. Choose a skill.</p><div class="skill-choice-list">${available.map((choice) => `<div><strong>${choice.name}</strong><span>${choice.text}</span></div>`).join("")}</div>`;
}

function openModal(title, text, actions) {
  modalOpen = true;
  modalTitle.textContent = title;
  modalText.textContent = text;
  modalActions.innerHTML = "";
  actions.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.label;
    if (item.secondary) button.className = "secondary";
    button.addEventListener("click", () => {
      if (modal.open) modal.close();
      modalOpen = false;
      item.action?.();
      if (state.nightReady && !modalOpen && !activeBattle && !activeNight && !state.won) beginNight();
    });
    modalActions.appendChild(button);
  });
  modal.showModal();
}

function renderAll() {
  renderSidebar();
  statusLine.textContent = message;
}

function animationLoop(now) {
  animationTime = now;
  draw();
  requestAnimationFrame(animationLoop);
}

function draw() {
  updateCamera();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTerrain();
  drawEvents();
  drawHero(visual.x, visual.y);
  drawHud();
}

function updateCamera() {
  const maxX = Math.max(0, map[0].length - VIEW_W);
  const maxY = Math.max(0, map.length - VIEW_H);
  const targetX = Math.max(0, Math.min(maxX, visual.x - VIEW_W / 2));
  const targetY = Math.max(0, Math.min(maxY, visual.y - VIEW_H / 2));
  if (!Number.isFinite(camera.x) || !Number.isFinite(camera.y)) {
    camera.x = targetX;
    camera.y = targetY;
  }
  camera.x += (targetX - camera.x) * 0.18;
  camera.y += (targetY - camera.y) * 0.18;
  if (Math.abs(targetX - camera.x) < 0.01) camera.x = targetX;
  if (Math.abs(targetY - camera.y) < 0.01) camera.y = targetY;
  const originX = Math.max(0, Math.min(maxX, Math.floor(camera.x)));
  const originY = Math.max(0, Math.min(maxY, Math.floor(camera.y)));
  const key = `${originX},${originY}`;
  if (camera.key !== key) {
    terrainCache = null;
  }
  camera.originX = originX;
  camera.originY = originY;
  camera.key = key;
}

function drawTerrain() {
  if (!terrainCache) terrainCache = buildTerrainCache();
  ctx.drawImage(terrainCache, (camera.originX - camera.x) * TILE, (camera.originY - camera.y) * TILE);
}

function buildTerrainCache() {
  const cache = document.createElement("canvas");
  cache.width = canvas.width + TILE * 2;
  cache.height = canvas.height + TILE * 2;
  const cacheCtx = cache.getContext("2d");
  cacheCtx.imageSmoothingEnabled = true;
  cacheCtx.imageSmoothingQuality = "high";
  for (let y = 0; y < VIEW_H + 2; y += 1) {
    for (let x = 0; x < VIEW_W + 2; x += 1) {
      const worldX = camera.originX + x;
      const worldY = camera.originY + y;
      drawTile(x, y, map[worldY]?.[worldX] || "W", cacheCtx);
    }
  }
  return cache;
}

function screenTileX(worldX) {
  return (worldX - camera.x) * TILE;
}

function screenTileY(worldY) {
  return (worldY - camera.y) * TILE;
}

function isOnScreen(worldX, worldY, pad = 1) {
  return worldX >= camera.x - pad && worldY >= camera.y - pad && worldX < camera.x + VIEW_W + pad && worldY < camera.y + VIEW_H + pad;
}

function drawAtlas(name, dx, dy, dw, dh, options = {}, targetCtx = ctx) {
  const rect = atlas[name];
  if (!spriteSheetReady || !rect) return false;
  const inset = options.inset || 0;
  targetCtx.save();
  targetCtx.imageSmoothingEnabled = options.smooth ?? true;
  targetCtx.imageSmoothingQuality = "high";
  if (options.alpha !== undefined) targetCtx.globalAlpha = options.alpha;
  targetCtx.drawImage(spriteSheet, rect[0] + inset, rect[1] + inset, rect[2] - inset * 2, rect[3] - inset * 2, dx, dy, dw, dh);
  targetCtx.restore();
  return true;
}

function getCutout(name) {
  if (cutoutCache.has(name)) return cutoutCache.get(name);
  const rect = atlas[name];
  if (!spriteSheetReady || !rect) return null;

  const source = document.createElement("canvas");
  source.width = rect[2];
  source.height = rect[3];
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  sourceCtx.drawImage(spriteSheet, rect[0], rect[1], rect[2], rect[3], 0, 0, rect[2], rect[3]);

  const image = sourceCtx.getImageData(0, 0, source.width, source.height);
  const data = image.data;
  const bg = sampleBackgroundColor(data, source.width, source.height);
  const remove = new Uint8Array(source.width * source.height);
  const queue = [];
  const transparentDistance = 104;
  const featherDistance = 148;
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= source.width || y >= source.height) return;
    const idx = y * source.width + x;
    if (remove[idx]) return;
    const i = idx * 4;
    const distance = colorDistance(data[i], data[i + 1], data[i + 2], bg);
    if (distance > transparentDistance) return;
    remove[idx] = 1;
    queue.push([x, y]);
  };

  for (let x = 0; x < source.width; x += 1) {
    push(x, 0);
    push(x, source.height - 1);
  }
  for (let y = 0; y < source.height; y += 1) {
    push(0, y);
    push(source.width - 1, y);
  }

  for (let q = 0; q < queue.length; q += 1) {
    const [x, y] = queue[q];
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  let minX = source.width;
  let minY = source.height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const idx = y * source.width + x;
      const i = idx * 4;
      if (remove[idx]) {
        data[i + 3] = 0;
        continue;
      }
      const distance = colorDistance(data[i], data[i + 1], data[i + 2], bg);
      if (distance < featherDistance && hasTransparentNeighbor(remove, source.width, source.height, x, y)) {
        const opacity = Math.max(0, Math.min(1, (distance - transparentDistance) / (featherDistance - transparentDistance)));
        data[i + 3] = Math.round(data[i + 3] * opacity);
      }
      if (data[i + 3] > 20) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  sourceCtx.putImageData(image, 0, 0);

  const hasPixels = minX <= maxX && minY <= maxY;
  const cutout = { canvas: source, bounds: hasPixels ? { minX, minY, maxX, maxY } : { minX: 0, minY: 0, maxX: source.width - 1, maxY: source.height - 1 } };
  cutoutCache.set(name, cutout);
  return cutout;
}

function prewarmCutouts() {
  ["hero", "heroRight", "heroLeft", "heroBack", "rival", "rivalSide", "leafFox", "leafFoxWalk", "emberGolem", "emberGolemWalk", "tideWisp", "tideWispAlt"].forEach((name) => getCutout(name));
}

function prewarmCharacterCutouts() {
  ["hero", "rival", "leafFox", "emberGolem", "tideWisp"].forEach((name) => {
    for (let frame = 0; frame < 4; frame += 1) getCharacterCutout(`${name}:${frame}`);
  });
}

function prewarmHeroDirectionCutouts() {
  ["down", "left", "right", "up"].forEach((direction) => {
    for (let frame = 0; frame < 4; frame += 1) getHeroDirectionCutout(`${direction}:${frame}`);
  });
}

function prewarmEnemyCutouts() {
  ["goblin", "basilisk", "raiders", "wyvern", "knight", "warlock", "rival"].forEach((name) => {
    for (let frame = 0; frame < 4; frame += 1) getEnemyCutout(`${name}:${frame}`);
  });
}

function heroDirectionCell(key) {
  const directions = ["down", "left", "right", "up"];
  const [direction, frameText = "0"] = key.split(":");
  const row = directions.indexOf(direction);
  const col = Math.max(0, Math.min(3, Number(frameText) || 0));
  if (!heroDirectionSheetReady || row < 0) return null;
  const cellWidth = heroDirectionSheet.width / 4;
  const cellHeight = heroDirectionSheet.height / 4;
  return [Math.round(col * cellWidth), Math.round(row * cellHeight), Math.round(cellWidth), Math.round(cellHeight)];
}

function getHeroDirectionCutout(key) {
  if (heroDirectionCutoutCache.has(key)) return heroDirectionCutoutCache.get(key);
  const rect = heroDirectionCell(key);
  if (!rect) return null;
  const cutout = buildChromaCutout(heroDirectionSheet, rect);
  heroDirectionCutoutCache.set(key, cutout);
  return cutout;
}

function characterCell(key) {
  const order = ["hero", "rival", "leafFox", "emberGolem", "tideWisp"];
  const [name, frameText = "0"] = key.split(":");
  const row = order.indexOf(name);
  const col = Math.max(0, Math.min(3, Number(frameText) || 0));
  if (!characterSheetReady || row < 0) return null;
  const cellWidth = characterSheet.width / 4;
  const cellHeight = characterSheet.height / order.length;
  return [Math.round(col * cellWidth), Math.round(row * cellHeight), Math.round(cellWidth), Math.round(cellHeight)];
}

function getCharacterCutout(key) {
  if (characterCutoutCache.has(key)) return characterCutoutCache.get(key);
  const rect = characterCell(key);
  if (!rect) return null;
  const cutout = buildChromaCutout(characterSheet, rect);
  characterCutoutCache.set(key, cutout);
  return cutout;
}

function enemyCell(key) {
  const order = ["goblin", "basilisk", "knight", "warlock", "wyvern"];
  const aliases = { raiders: "goblin", rival: "warlock" };
  const [rawName, frameText = "0"] = key.split(":");
  const name = aliases[rawName] || rawName;
  const row = order.indexOf(name);
  const col = Math.max(0, Math.min(3, Number(frameText) || 0));
  if (!enemySheetReady || row < 0) return null;
  const cellWidth = enemySheet.width / 4;
  const cellHeight = enemySheet.height / order.length;
  return [Math.round(col * cellWidth), Math.round(row * cellHeight), Math.round(cellWidth), Math.round(cellHeight)];
}

function getEnemyCutout(key) {
  if (enemyCutoutCache.has(key)) return enemyCutoutCache.get(key);
  const rect = enemyCell(key);
  if (!rect) return null;
  const cutout = buildChromaCutout(enemySheet, rect);
  enemyCutoutCache.set(key, cutout);
  return cutout;
}

function buildChromaCutout(sourceImage, rect) {
  const source = document.createElement("canvas");
  source.width = rect[2];
  source.height = rect[3];
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  sourceCtx.drawImage(sourceImage, rect[0], rect[1], rect[2], rect[3], 0, 0, rect[2], rect[3]);

  const imageData = sourceCtx.getImageData(0, 0, source.width, source.height);
  const data = imageData.data;
  const chromaKey = [0, 255, 0];
  let minX = source.width;
  let minY = source.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const i = (y * source.width + x) * 4;
      const distance = colorDistance(data[i], data[i + 1], data[i + 2], chromaKey);
      if (distance < 95) {
        data[i + 3] = 0;
        continue;
      }
      if (distance < 135) {
        data[i + 3] = Math.round(data[i + 3] * Math.min(1, (distance - 95) / 40));
      }
      if (data[i + 3] > 20) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  sourceCtx.putImageData(imageData, 0, 0);

  const cutout = {
    canvas: source,
    bounds: minX <= maxX ? { minX, minY, maxX, maxY } : { minX: 0, minY: 0, maxX: source.width - 1, maxY: source.height - 1 },
  };
  return cutout;
}

function sampleBackgroundColor(data, width, height) {
  const points = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];
  const rgb = [0, 0, 0];
  points.forEach(([x, y]) => {
    const i = (y * width + x) * 4;
    rgb[0] += data[i];
    rgb[1] += data[i + 1];
    rgb[2] += data[i + 2];
  });
  return rgb.map((v) => Math.round(v / points.length));
}

function colorDistance(r, g, b, bg) {
  const dr = r - bg[0];
  const dg = g - bg[1];
  const db = b - bg[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function hasTransparentNeighbor(remove, width, height, x, y) {
  for (let oy = -1; oy <= 1; oy += 1) {
    for (let ox = -1; ox <= 1; ox += 1) {
      if (ox === 0 && oy === 0) continue;
      const nx = x + ox;
      const ny = y + oy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      if (remove[ny * width + nx]) return true;
    }
  }
  return false;
}

function getPortraitDataUrl(name) {
  if (portraitCache.has(name)) return portraitCache.get(name);
  const cutout = name === "hero" ? getHeroDirectionCutout("down:0") || getCharacterCutout("hero:0") || getCutout(name) : getCharacterCutout(`${name}:0`) || getCutout(name);
  if (!cutout) return "";
  const { bounds, canvas: source } = cutout;
  const sw = bounds.maxX - bounds.minX + 1;
  const sh = bounds.maxY - bounds.minY + 1;
  const portrait = document.createElement("canvas");
  portrait.width = 72;
  portrait.height = 72;
  const portraitCtx = portrait.getContext("2d");
  portraitCtx.imageSmoothingEnabled = true;
  portraitCtx.imageSmoothingQuality = "high";
  const scale = Math.min(60 / sw, 60 / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  portraitCtx.drawImage(source, bounds.minX, bounds.minY, sw, sh, (portrait.width - dw) / 2, portrait.height - dh - 5, dw, dh);
  const url = portrait.toDataURL("image/png");
  portraitCache.set(name, url);
  return url;
}

function getEnemyPortraitDataUrl(name) {
  const cacheKey = `enemy:${name}`;
  if (portraitCache.has(cacheKey)) return portraitCache.get(cacheKey);
  const frame = animationFrame(false, name.length * 0.13);
  const cutout = getEnemyCutout(`${name}:${frame}`) || getEnemyCutout(`${name}:0`);
  if (!cutout) return "";
  const { bounds, canvas: source } = cutout;
  const sw = bounds.maxX - bounds.minX + 1;
  const sh = bounds.maxY - bounds.minY + 1;
  const portrait = document.createElement("canvas");
  portrait.width = 82;
  portrait.height = 82;
  const portraitCtx = portrait.getContext("2d");
  portraitCtx.imageSmoothingEnabled = true;
  portraitCtx.imageSmoothingQuality = "high";
  const scale = Math.min(76 / sw, 76 / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  portraitCtx.drawImage(source, bounds.minX, bounds.minY, sw, sh, (portrait.width - dw) / 2, portrait.height - dh - 3, dw, dh);
  const url = portrait.toDataURL("image/png");
  portraitCache.set(cacheKey, url);
  return url;
}

function spriteNameForUnit(unit) {
  if (!unit.id) return "hero";
  if (unit.id === "leafFox") return "leafFox";
  if (unit.id === "emberGolem") return "emberGolem";
  if (unit.id === "tideWisp") return "tideWisp";
  return "leafFox";
}

function drawCutout(name, cx, footY, maxW, maxH, options = {}) {
  const cutout = getCutout(name);
  if (!cutout) return false;
  const { bounds, canvas: source } = cutout;
  const fullFrame = options.fullFrame || false;
  const sx = fullFrame ? 0 : bounds.minX;
  const sy = fullFrame ? 0 : bounds.minY;
  const sw = fullFrame ? source.width : bounds.maxX - bounds.minX + 1;
  const sh = fullFrame ? source.height : bounds.maxY - bounds.minY + 1;
  const scale = options.scale || Math.min(maxW / sw, maxH / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  const dx = cx - dw / 2 + (options.offsetX || 0);
  const dy = footY - dh + (options.offsetY || 0);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (options.flip) {
    ctx.translate(dx + dw, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, dw, dh);
  } else {
    ctx.drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh);
  }
  ctx.restore();
  return true;
}

function drawCharacterCutout(name, frame, cx, footY, options = {}) {
  const cutout = getCharacterCutout(`${name}:${frame}`);
  if (!cutout) return false;
  return drawPreparedCutout(cutout, cx, footY, options);
}

function drawEnemyCutout(name, frame, cx, footY, options = {}) {
  const cutout = getEnemyCutout(`${name}:${frame}`) || getEnemyCutout(`${name}:0`);
  if (!cutout) return false;
  return drawPreparedCutout(cutout, cx, footY, options);
}

function drawHeroDirectionCutout(direction, frame, cx, footY, options = {}) {
  const cutout = getHeroDirectionCutout(`${direction}:${frame}`);
  if (!cutout) return false;
  return drawPreparedCutout(cutout, cx, footY, options);
}

function drawPreparedCutout(cutout, cx, footY, options = {}) {
  const { bounds, canvas: source } = cutout;
  const sx = bounds.minX;
  const sy = bounds.minY;
  const sw = bounds.maxX - bounds.minX + 1;
  const sh = bounds.maxY - bounds.minY + 1;
  const scale = options.targetHeight ? options.targetHeight / sh : options.scale || 1;
  const dw = sw * scale;
  const dh = sh * scale;
  const dx = cx - dw / 2 + (options.offsetX || 0);
  const dy = footY - dh + (options.offsetY || 0);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (options.flip) {
    ctx.translate(dx + dw, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, dw, dh);
  } else {
    ctx.drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh);
  }
  ctx.restore();
  return true;
}

function drawTile(x, y, tile, targetCtx = ctx) {
  const px = x * TILE;
  const py = y * TILE;
  const spriteName = tile === "W" ? "water" : tile === "F" ? "forest" : tile === "M" ? "mountain" : tile === "R" ? "road" : "grass";
  const color = tile === "W" ? palette.water : tile === "F" ? palette.forest : tile === "M" ? palette.mountain : tile === "R" ? palette.road : palette.grass;
  targetCtx.fillStyle = color;
  targetCtx.fillRect(px, py, TILE, TILE);
  if (drawAtlas(spriteName, px, py, TILE, TILE, { alpha: tile === "G" ? 0.7 : 0.86, inset: tile === "W" ? 10 : 8 }, targetCtx)) {
    if (tile === "G" && (x + y) % 3 !== 0) {
      targetCtx.fillStyle = "rgba(95, 174, 93, 0.28)";
      targetCtx.fillRect(px, py, TILE, TILE);
    }
    return;
  }
  targetCtx.fillStyle = tile === "G" ? palette.grass2 : "rgba(255,255,255,0.08)";
  if ((x + y) % 2 === 0) targetCtx.fillRect(px + 3, py + 24, 7, 3);
  if (tile === "F") drawTree(px, py);
  if (tile === "M") drawMountain(px, py);
  if (tile === "W") drawWater(px, py, x, y);
}

function drawTree(px, py) {
  ctx.fillStyle = "#164d2e";
  ctx.fillRect(px + 13, py + 18, 6, 9);
  ctx.fillStyle = "#2f8650";
  ctx.fillRect(px + 8, py + 8, 16, 14);
  ctx.fillStyle = "#3fa35d";
  ctx.fillRect(px + 12, py + 5, 10, 7);
}

function drawMountain(px, py) {
  ctx.fillStyle = "#535761";
  ctx.beginPath();
  ctx.moveTo(px + 4, py + 27);
  ctx.lineTo(px + 16, py + 6);
  ctx.lineTo(px + 29, py + 27);
  ctx.fill();
  ctx.fillStyle = "#d9dde4";
  ctx.fillRect(px + 14, py + 10, 4, 4);
}

function drawWater(px, py, x, y) {
  ctx.fillStyle = "#7fc4df";
  ctx.fillRect(px + ((x + y) % 3) * 4 + 4, py + 13, 12, 3);
  ctx.fillRect(px + 17, py + 22, 9, 2);
}

function drawShadow(cx, cy, width, height) {
  ctx.save();
  ctx.fillStyle = "rgba(7, 10, 14, 0.34)";
  ctx.beginPath();
  ctx.ellipse(cx, cy, width / 2, height / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function animatedSpriteName(spriteName) {
  const phase = Math.floor(animationTime / IDLE_FRAME_MS) % 2;
  if (spriteName === "leafFox") return phase ? "leafFoxWalk" : "leafFox";
  if (spriteName === "emberGolem") return phase ? "emberGolemWalk" : "emberGolem";
  if (spriteName === "tideWisp") return phase ? "tideWispAlt" : "tideWisp";
  if (spriteName === "rival") return phase ? "rivalSide" : "rival";
  return spriteName;
}

function animationFrame(isWalking = false) {
  if (isWalking) return Math.floor(animationTime / WALK_FRAME_MS) % 4;
  return [0, 1, 0, 3][Math.floor(animationTime / IDLE_FRAME_MS) % 4];
}

function frameForWorldSprite(isWalking = false, offset = 0) {
  if (isWalking) return (Math.floor(animationTime / WALK_FRAME_MS + offset) % 4 + 4) % 4;
  return [0, 1, 0, 3][(Math.floor(animationTime / IDLE_FRAME_MS + offset) % 4 + 4) % 4];
}

function drawGrounding(cx, cy, tileX, tileY, width, height) {
  drawShadow(cx, cy, width, height);
  const tile = map[Math.round(tileY)]?.[Math.round(tileX)];
  if (tile === "R") {
    ctx.fillStyle = "rgba(196, 147, 80, 0.22)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 1, width * 0.42, height * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (tile === "F") {
    ctx.fillStyle = "rgba(39, 108, 63, 0.25)";
    ctx.beginPath();
    ctx.ellipse(cx, cy - 1, width * 0.5, height * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFootTint(px, py, tileX, tileY) {
  const tile = map[Math.round(tileY)]?.[Math.round(tileX)];
  if (tile !== "F" && tile !== "G" && tile !== "R") return;
  ctx.save();
  ctx.globalAlpha = tile === "F" ? 0.34 : 0.18;
  ctx.fillStyle = tile === "R" ? "#b68955" : "#5fae5d";
  ctx.fillRect(px + 5, py + 21, TILE - 10, 8);
  ctx.restore();
}

function drawStepDust(tileX, tileY) {
  if (!visual.moving) return;
  const progress = visual.progress || 0;
  const pulse = Math.sin(progress * Math.PI);
  if (pulse <= 0.04) return;
  const px = screenTileX(tileX);
  const py = screenTileY(tileY);
  const dx = visual.toX - visual.fromX;
  const dy = visual.toY - visual.fromY;
  const side = Math.sin(progress * Math.PI * 2) >= 0 ? 1 : -1;
  const footX = px + 16 - dx * 7 + (dy ? side * 7 : 0);
  const footY = py + 29 - dy * 5 + (dx ? side * 5 : 0);

  ctx.save();
  ctx.globalAlpha = 0.28 * pulse;
  ctx.fillStyle = map[Math.round(tileY)]?.[Math.round(tileX)] === "R" ? "#d7aa6b" : "#d4e2a7";
  ctx.beginPath();
  ctx.ellipse(footX, footY, 4 + pulse * 5, 2 + pulse * 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawEvents() {
  events.forEach((event, key) => {
    const [x, y] = key.split(",").map(Number);
    if (!isOnScreen(x, y)) return;
    if (x === state.x && y === state.y && ["battle", "final"].includes(event.type)) return;
    const px = screenTileX(x);
    const py = screenTileY(y);
    if (event.type === "town") drawBuilding(px, py, palette.town);
    if (event.type === "mine") drawMine(px, py);
    if (event.type === "chest") drawChest(px, py, state.visited[key]);
    if (event.type === "battle" && !state.visited[key]) drawMonster(encounters[event.encounter].color, x, y, event.encounter);
    if (event.type === "final") drawTower(px, py);
    if (state.visited[key] && shouldFlagEvent(event)) drawPlayerFlag(px, py);
  });
}

function shouldFlagEvent(event) {
  return event.type === "mine" || event.type === "battle" || event.type === "town";
}

function drawBuilding(px, py, color) {
  drawShadow(px + 16, py + 27, 30, 8);
  if (drawAtlas("town", px - 8, py - 10, 48, 42)) return;
  ctx.fillStyle = "#6b4735";
  ctx.fillRect(px + 7, py + 15, 18, 13);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(px + 4, py + 16);
  ctx.lineTo(px + 16, py + 6);
  ctx.lineTo(px + 28, py + 16);
  ctx.fill();
  ctx.fillStyle = "#241914";
  ctx.fillRect(px + 14, py + 21, 5, 7);
}

function drawMine(px, py) {
  drawShadow(px + 16, py + 27, 26, 8);
  if (drawAtlas("mine", px - 4, py - 8, 42, 42)) return;
  ctx.fillStyle = palette.mine;
  ctx.fillRect(px + 6, py + 17, 20, 11);
  ctx.fillStyle = "#241914";
  ctx.fillRect(px + 11, py + 13, 10, 15);
  ctx.strokeStyle = "#d6aa62";
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 8, py + 15, 16, 13);
}

function drawChest(px, py, opened = false) {
  drawShadow(px + 17, py + 27, 19, 5);
  if (drawAtlas(opened ? "chestOpen" : "chest", px + 5, py + 5, 24, 24)) return;
  ctx.fillStyle = palette.chest;
  ctx.fillRect(px + 8, py + 14, 17, 12);
  ctx.fillStyle = "#6f3c28";
  ctx.fillRect(px + 8, py + 19, 17, 3);
  ctx.fillStyle = "#fff0a3";
  ctx.fillRect(px + 15, py + 18, 3, 5);
}

function drawPlayerFlag(px, py) {
  ctx.save();
  ctx.fillStyle = "#f4ead7";
  ctx.fillRect(px + 21, py + 6, 2, 19);
  ctx.fillStyle = palette.playerFlag;
  ctx.beginPath();
  ctx.moveTo(px + 23, py + 7);
  ctx.lineTo(px + 31, py + 10);
  ctx.lineTo(px + 23, py + 14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(px + 20, py + 25, 6, 2);
  ctx.restore();
}

function drawTower(px, py) {
  drawShadow(px + 16, py + 29, 40, 9);
  if (drawAtlas("castle", px - 12, py - 18, 58, 48)) return;
  ctx.fillStyle = palette.tower;
  ctx.fillRect(px + 10, py + 8, 13, 21);
  ctx.fillStyle = "#5b3b75";
  ctx.fillRect(px + 8, py + 5, 17, 7);
  ctx.fillStyle = "#d95d5d";
  ctx.fillRect(px + 15, py + 15, 4, 5);
}

function drawHero(x, y) {
  const stride = visual.moving ? Math.sin((visual.progress || 0) * Math.PI) : 0;
  const bob = visual.moving ? -Math.abs(Math.sin(animationTime / 42)) * 2.3 - stride * 0.9 : Math.sin(animationTime / 420) * 0.7;
  if (drawHeroWorldSprite(x, y, bob)) {
    return;
  }
  const px = screenTileX(x);
  const py = screenTileY(y);
  ctx.fillStyle = "#26344f";
  ctx.fillRect(px + 10, py + 12, 12, 15);
  ctx.fillStyle = "#f0c15b";
  ctx.fillRect(px + 11, py + 6, 10, 8);
  ctx.fillStyle = "#d85a4f";
  ctx.fillRect(px + 8, py + 12, 5, 11);
  ctx.fillStyle = "#f4ead7";
  ctx.fillRect(px + 13, py + 8, 2, 2);
  ctx.fillRect(px + 18, py + 8, 2, 2);
}

function drawHeroWorldSprite(tileX, tileY, bob = 0) {
  const px = screenTileX(tileX);
  const py = screenTileY(tileY);
  const direction = facing === "up" ? "up" : facing === "left" ? "left" : facing === "right" ? "right" : "down";
  drawStepDust(tileX, tileY);
  drawGrounding(px + 16, py + 28, tileX, tileY, 24, 8);
  if (drawHeroDirectionCutout(direction, frameForWorldSprite(visual.moving), px + 16, py + 34, { targetHeight: HERO_WORLD_HEIGHT, offsetY: bob })) {
    drawFootTint(px, py, tileX, tileY);
    return true;
  }
  return drawWorldSprite("hero", tileX, tileY, bob, { frame: frameForWorldSprite(visual.moving), targetHeight: HERO_WORLD_HEIGHT });
}

function drawWorldSprite(sprite, tileX, tileY, bob = 0, options = {}) {
  const px = screenTileX(tileX);
  const py = screenTileY(tileY);
  drawGrounding(px + 16, py + 28, tileX, tileY, 24, 8);
  if (drawCharacterCutout(sprite, options.frame ?? animationFrame(false), px + 16, py + 34, { targetHeight: options.targetHeight || NPC_WORLD_HEIGHT, offsetY: bob, flip: options.flip })) {
    drawFootTint(px, py, tileX, tileY);
    return true;
  }
  if (drawCutout(sprite, px + 16, py + 36, 0, 0, { scale: 0.42, offsetY: bob, fullFrame: true })) {
    drawFootTint(px, py, tileX, tileY);
    return true;
  }
  return false;
}

function drawMonster(color, tileX, tileY, encounterId = "") {
  const bob = Math.sin(animationTime / 360 + tileX * 0.33 + tileY * 0.21) * 1.2;
  const enemyFrame = frameForWorldSprite(false, tileX * 0.17 + tileY * 0.11);
  if (encounterId && drawEnemyCutout(encounterId, enemyFrame, screenTileX(tileX) + 16, screenTileY(tileY) + 35, { targetHeight: NPC_WORLD_HEIGHT + 2, offsetY: bob })) {
    drawFootTint(screenTileX(tileX), screenTileY(tileY), tileX, tileY);
    return;
  }
  const spriteName = color === creatureBook.leafFox.color ? "leafFox" : color === creatureBook.emberGolem.color ? "emberGolem" : color === creatureBook.tideWisp.color ? "tideWisp" : color === encounters.rival.color ? "rival" : "";
  if (spriteName && drawWorldSprite(spriteName, tileX, tileY, bob, { frame: enemyFrame })) {
    return;
  }
  if (spriteSheetReady) {
    const fallbackSprite = color === encounters.basilisk.color ? "leafFox" : color === encounters.knight.color ? "emberGolem" : "rival";
    if (drawWorldSprite(fallbackSprite, tileX, tileY, bob, { frame: enemyFrame })) {
      return;
    }
  }
  const cx = screenTileX(tileX) + 16;
  const cy = screenTileY(tileY) + 16;
  ctx.fillStyle = color;
  ctx.fillRect(cx - 9, cy - 8, 18, 16);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(cx - 6, cy + 8, 12, 4);
  ctx.fillStyle = "#fff8df";
  ctx.fillRect(cx - 5, cy - 3, 3, 3);
  ctx.fillRect(cx + 3, cy - 3, 3, 3);
}

function drawHud() {
  ctx.fillStyle = "rgba(15,18,25,0.82)";
  ctx.fillRect(8, 8, 238, 70);
  ctx.fillStyle = "#f4ead7";
  ctx.font = "16px Trebuchet MS";
  ctx.fillText(`Day ${state.day}  Gold ${state.gold}`, 18, 28);
  ctx.fillText(`${state.nightReady ? "Night ready" : "Daylight"}  HP ${state.hero.hp}/${state.hero.maxHp}`, 18, 48);
  drawDayProgressHud(18, 58, 208, 8);
}

function drawDayProgressHud(x, y, width, height) {
  const fill = dayProgressPercent() / 100;
  ctx.fillStyle = "#0f1219";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = state.nightReady ? "#7a4bb5" : "#f0c15b";
  ctx.fillRect(x, y, width * fill, height);
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
}

function dayProgressPercent() {
  return Math.round((Math.min(DAY_LENGTH_STEPS, state.dayProgress || 0) / DAY_LENGTH_STEPS) * 100);
}

function countVisitedEvents(type) {
  let count = 0;
  events.forEach((event, key) => {
    if (event.type === type && state.visited[key]) count += 1;
  });
  return count;
}

function countEvents(type) {
  let count = 0;
  events.forEach((event) => {
    if (event.type === type) count += 1;
  });
  return count;
}

function renderSidebar() {
  const mineCount = countVisitedEvents("mine");
  const battleCount = countVisitedEvents("battle");
  const mineTarget = countEvents("mine");
  const battleTarget = countEvents("battle");
  heroStats.innerHTML = stat("Level", state.hero.level) + stat("Gold", state.gold) + stat("HP", `${state.hero.hp}/${state.hero.maxHp}`) + stat("Attack", state.hero.atk) + stat("Defense", state.hero.def) + stat("Speed", state.hero.speed) + stat("Power", state.hero.power) + stat("Morale", state.hero.morale) + stat("Move", `${moveRange(state.hero)} ${state.hero.moveType}`) + stat("XP", `${state.hero.xp}/${xpToNext(state.hero)}`) + stat("Daylight", dayProgressMarkup()) + stat("Relics", `${state.relics.length}/4`) + stat("Mines", `${mineCount}/${mineTarget}`) + stat("Outposts", `${battleCount}/${battleTarget}`) + stat("Skills", state.hero.skills?.length ? state.hero.skills.join(", ") : "None");
  partyList.innerHTML = [state.hero, ...state.party].map(renderUnit).join("");
  renderInventory();
  const quests = [
    { text: "Gather four creatures", done: state.party.length >= 4 },
    { text: "Claim four relics", done: state.relics.length >= 4 },
    { text: `Claim ${mineTarget} mines`, done: mineCount >= mineTarget },
    { text: `Clear ${battleTarget} outposts`, done: battleCount >= battleTarget },
    { text: "Defeat the rival mage", done: state.won },
  ];
  questLog.innerHTML = quests.map((quest) => `<li class="${quest.done ? "done" : ""}">${quest.text}</li>`).join("");
}

function renderInventory() {
  if (!inventoryList) return;
  if (!state.inventory.length) {
    inventoryList.innerHTML = `<p class="empty-inventory">No items carried.</p>`;
    return;
  }
  inventoryList.innerHTML = state.inventory.map(renderInventoryItem).join("");
}

function renderInventoryItem(entry) {
  const definition = itemDefinitions[entry.id];
  const equipped = state.equipped[entry.id];
  const disabled = equipped ? " disabled" : "";
  const action = definition.type === "consumable" ? "Use" : equipped ? "Equipped" : "Equip";
  return `
    <div class="inventory-item">
      <div>
        <div class="item-name"><span>${definition.name}</span><span>x${entry.qty}</span></div>
        <p>${definition.description}</p>
      </div>
      <button type="button" data-use-item="${entry.id}"${disabled}>${action}</button>
    </div>
  `;
}

function stat(label, value) {
  return `<div class="stat"><b>${label}</b><span>${value}</span></div>`;
}

function dayProgressMarkup() {
  const progress = dayProgressPercent();
  const label = state.nightReady ? "Camp" : `${state.dayProgress || 0}/${DAY_LENGTH_STEPS}`;
  return `<span class="day-progress-label">${label}</span><span class="day-progress" style="--fill:${progress}%"><i></i></span>`;
}

function renderUnit(unit) {
  const fill = Math.max(0, Math.round((unit.hp / unit.maxHp) * 100));
  const xpFill = Math.max(0, Math.round(((unit.xp || 0) / xpToNext(unit)) * 100));
  const color = unit.color || "#f0c15b";
  const spriteClass = unit.id ? ` sprite-${unit.id}` : " sprite-hero";
  const portrait = characterSheetReady || spriteSheetReady ? getPortraitDataUrl(spriteNameForUnit(unit)) : "";
  const sprite = portrait
    ? `<img class="unit-sprite-img" src="${portrait}" alt="" />`
    : `<div class="unit-sprite${spriteClass}" style="--unit-color:${color}"></div>`;
  return `<div class="unit">${sprite}<div><div class="unit-name"><span>${unit.name}</span><span>Lv ${unit.level}</span></div><div class="unit-stats">Atk ${unit.atk} &middot; Def ${unit.def} &middot; Spd ${unit.speed} &middot; ${unit.moveType || "ground"}</div><div class="meter" style="--fill:${fill}%"><span></span></div><div class="meter xp-meter" title="Experience ${unit.xp || 0}/${xpToNext(unit)}" style="--fill:${xpFill}%"><span></span></div></div></div>`;
}

function battleModalLocked() {
  return Boolean(activeBattle);
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !battleModalLocked()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);

document.addEventListener("keydown", (event) => {
  const delta = keyMap[event.key];
  if (!delta) return;
  event.preventDefault();
  if (event.repeat) return;
  heldKeys.add(event.key);
  if (!visual.moving) move(delta[0], delta[1]);
});

document.addEventListener("keyup", (event) => {
  if (!keyMap[event.key]) return;
  heldKeys.delete(event.key);
});

window.addEventListener("blur", () => heldKeys.clear());

document.querySelectorAll("[data-move]").forEach((button) => {
  button.addEventListener("click", () => {
    const dir = button.dataset.move;
    const delta = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
    move(delta[0], delta[1]);
  });
});

document.getElementById("saveBtn").addEventListener("click", saveGame);
document.getElementById("resetBtn").addEventListener("click", resetGame);
modal.addEventListener("cancel", (event) => {
  if (battleModalLocked()) event.preventDefault();
});
modal.addEventListener("close", () => {
  if (!battleModalLocked()) return;
  window.setTimeout(() => {
    if (battleModalLocked()) renderBattle();
  }, 0);
});
inventoryList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-use-item]");
  if (!button) return;
  useInventoryItem(button.dataset.useItem);
});

renderAll();
requestAnimationFrame(animationLoop);
