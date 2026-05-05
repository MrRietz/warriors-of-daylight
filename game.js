const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

const statusLine = document.getElementById("statusLine");
const objectiveHintLine = document.getElementById("objectiveHint");
const topDay = document.getElementById("topDay");
const topLight = document.getElementById("topLight");
const topGold = document.getElementById("topGold");
const heroStats = document.getElementById("heroStats");
const partyList = document.getElementById("partyList");
const inventoryList = document.getElementById("inventoryList");
const questLog = document.getElementById("questLog");
const minimap = document.getElementById("minimap");
const minimapCtx = minimap?.getContext("2d");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const modalActions = document.getElementById("modalActions");
const musicBtn = document.getElementById("musicBtn");

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
const DAY_LENGTH_STEPS = 48;
const NIGHT_ENCOUNTER_MIN = 1;
const NIGHT_ENCOUNTER_MAX = 2;
const NIGHT_WAVE_SNEAK_MS = 3200;
const NIGHT_WAVE_STAGGER_MS = 180;
const NIGHT_WAVE_TRIGGER_BUFFER_MS = 120;
const MAX_PARTY_UNITS = 6;
const HEALING_DRAUGHT_AMOUNT = 24;
const AUTO_BATTLE_DELAY_MS = 720;

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

const townSheet = new Image();
let townSheetReady = false;
const townCutoutCache = new Map();
townSheet.onload = () => {
  townSheetReady = true;
  townCutoutCache.clear();
  renderAll();
};
townSheet.src = "assets/town-building-sheet-chroma.png";

const tradeCartSheet = new Image();
let tradeCartSheetReady = false;
const tradeCartCutoutCache = new Map();
tradeCartSheet.onload = () => {
  tradeCartSheetReady = true;
  tradeCartCutoutCache.clear();
  renderAll();
};
tradeCartSheet.src = "assets/trade-cart-sheet-chroma.png";

const caravanMarketArt = new Image();
let caravanMarketArtReady = false;
let caravanMarketArtCache = "";
caravanMarketArt.onload = () => {
  caravanMarketArtReady = true;
  caravanMarketArtCache = "";
  renderAll();
};
caravanMarketArt.src = "assets/caravan-market-banner.png";

const questGiverSheet = new Image();
let questGiverSheetReady = false;
const questGiverCutoutCache = new Map();
questGiverSheet.onload = () => {
  questGiverSheetReady = true;
  questGiverCutoutCache.clear();
  renderAll();
};
questGiverSheet.src = "assets/quest-giver-sheet.png";

const unitSheet = new Image();
let unitSheetReady = false;
const unitCutoutCache = new Map();
unitSheet.onload = () => {
  unitSheetReady = true;
  unitCutoutCache.clear();
  portraitCache.clear();
  renderAll();
};
unitSheet.src = "assets/creature-unit-sheet.png";

const castleSheet = new Image();
let castleSheetReady = false;
const castleCutoutCache = new Map();
castleSheet.onload = () => {
  castleSheetReady = true;
  castleCutoutCache.clear();
  renderAll();
};
castleSheet.src = "assets/castle-fortress-sheet.png";

const castleWallSheet = new Image();
let castleWallSheetReady = false;
const castleWallCutoutCache = new Map();
castleWallSheet.onload = () => {
  castleWallSheetReady = true;
  castleWallCutoutCache.clear();
  renderAll();
};
castleWallSheet.src = "assets/castle-wall-gate-sheet.png";

const castleWallFrame = new Image();
let castleWallFrameReady = false;
let castleWallFrameCutout = null;
castleWallFrame.onload = () => {
  castleWallFrameReady = true;
  castleWallFrameCutout = null;
  renderAll();
};
castleWallFrame.src = "assets/castle-wall-frame.png";

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
  bridge: "#c7945a",
  road: "#b68955",
  town: "#d9b95f",
  castle: "#b4b7c6",
  mine: "#8c6a4a",
  tower: "#302339",
  chest: "#e3a84d",
  danger: "#9e463f",
  playerFlag: "#2f7de1",
  ownedTownRing: "#f0c15b",
  ownedTownGlow: "#66a7d8",
};

const heroBaseStats = {
  name: "Champion",
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
  attackType: "melee",
  attackRange: 1,
  skills: [],
};

const creatureBook = {
  leafFox: { name: "Leaf Fox", color: "#6fc66a", maxHp: 22, atk: 6, def: 2, speed: 8, power: 3, morale: 6, moveType: "ground", attackType: "melee", attackRange: 1, skill: "Vine snap" },
  emberGolem: { name: "Ember Golem", color: "#d66945", maxHp: 28, atk: 8, def: 1, speed: 4, power: 6, morale: 4, moveType: "ground", attackType: "melee", attackRange: 1, skill: "Cinder fist" },
  tideWisp: { name: "Tide Wisp", color: "#62a8d8", maxHp: 20, atk: 5, def: 4, speed: 7, power: 5, morale: 5, moveType: "flying", attackType: "ranged", attackRange: 6, skill: "Foam guard" },
  duskMoth: { name: "Dusk Moth", color: "#a477d7", maxHp: 24, atk: 7, def: 2, speed: 6, power: 5, morale: 5, moveType: "flying", attackType: "ranged", attackRange: 7, skill: "Moon dust" },
  thornArcher: { name: "Thorn Archer", color: "#8ccf76", maxHp: 18, atk: 5, def: 2, speed: 6, power: 4, morale: 6, moveType: "ground", attackType: "ranged", attackRange: 7, skill: "Briar shot" },
  ironPikeman: { name: "Iron Pikeman", color: "#b6a47c", maxHp: 30, atk: 7, def: 5, speed: 3, power: 4, morale: 5, moveType: "ground", attackType: "melee", attackRange: 1, skill: "Shield wall" },
  reefGuard: { name: "Reef Guard", color: "#63bfd3", maxHp: 26, atk: 6, def: 4, speed: 5, power: 5, morale: 5, moveType: "ground", attackType: "melee", attackRange: 1, skill: "Tide spear" },
  moonSeer: { name: "Moon Seer", color: "#c392e8", maxHp: 19, atk: 6, def: 2, speed: 5, power: 7, morale: 6, moveType: "flying", attackType: "ranged", attackRange: 7, skill: "Star bolt" },
  bloomStag: { name: "Bloom Stag", color: "#7ecf86", maxHp: 31, atk: 7, def: 3, speed: 7, power: 4, morale: 7, moveType: "ground", attackType: "melee", attackRange: 1, skill: "Antler charge", spriteId: "leafFox" },
  cinderMage: { name: "Cinder Mage", color: "#dc7a4a", maxHp: 21, atk: 7, def: 2, speed: 5, power: 8, morale: 5, moveType: "ground", attackType: "ranged", attackRange: 6, skill: "Coal flare", spriteId: "emberGolem" },
  coralArcher: { name: "Coral Archer", color: "#55c7c8", maxHp: 20, atk: 6, def: 3, speed: 6, power: 5, morale: 6, moveType: "ground", attackType: "ranged", attackRange: 7, skill: "Reef shot", spriteId: "reefGuard" },
  nightblade: { name: "Nightblade", color: "#9a78d7", maxHp: 24, atk: 8, def: 2, speed: 8, power: 6, morale: 5, moveType: "flying", attackType: "melee", attackRange: 1, skill: "Shadow dive", spriteId: "duskMoth" },
};

const townFactions = {
  grove: {
    name: "Grove Pact",
    units: ["leafFox", "thornArcher", "bloomStag", "duskMoth"],
    perk: "Recruits cost 10% less in Grove towns.",
  },
  forge: {
    name: "Iron Hearth",
    units: ["emberGolem", "ironPikeman", "cinderMage", "thornArcher"],
    perk: "Unit upgrades cost 15% less in Forge towns.",
  },
  tide: {
    name: "Tide Court",
    units: ["tideWisp", "reefGuard", "coralArcher", "moonSeer"],
    perk: "Caravan Posts in Tide towns earn 25% more trade gold.",
  },
  dusk: {
    name: "Dusk Circle",
    units: ["duskMoth", "moonSeer", "nightblade", "leafFox"],
    perk: "Dusk towns offer scouting toward unrecovered relics and threats.",
  },
};

const heroSkillCatalog = [
  { name: "Command", type: "Offense", text: "+2 attack. All your direct strikes hit harder.", apply: () => (state.hero.atk += 2) },
  { name: "Fortitude", type: "Survival", text: "+10 max HP and full heal. Best when fights run long.", apply: () => { state.hero.maxHp += 10; state.hero.hp = state.hero.maxHp; } },
  { name: "Tactics", type: "Defense", text: "+2 defense. Reduces most incoming melee and ranged damage.", apply: () => (state.hero.def += 2) },
  { name: "Skirmisher", type: "Mobility", text: "+1 speed. Move earlier and reach better tiles in battle.", apply: () => (state.hero.speed += 1) },
  { name: "Battle Standard", type: "Morale", text: "+2 morale. Improves damage consistency for the whole campaign leader.", apply: () => (state.hero.morale += 2) },
  { name: "Power Channel", type: "Magic", text: "+2 power and ranged attack. Turns the champion into a flexible back-line threat.", apply: () => { state.hero.power += 2; state.hero.attackType = "ranged"; state.hero.attackRange = Math.max(state.hero.attackRange || 1, 5); } },
  { name: "Field Medic", type: "Support", text: "+6 max HP and +1 defense. Also fully heals the party now.", apply: () => { state.hero.maxHp += 6; state.hero.def += 1; state.hero.hp = state.hero.maxHp; state.party.forEach((unit) => (unit.hp = unit.maxHp)); } },
  { name: "Quartermaster", type: "Economy", text: "+80 gold and +1 morale. Helps recover from expensive recruitment turns.", apply: () => { state.gold += 80; state.hero.morale += 1; } },
];

const encounters = {
  goblin: { name: "Hill Bandit", color: "#ab7048", hp: 24, atk: 5, def: 1, speed: 5, power: 3, morale: 4, moveType: "ground", attackType: "melee", attackRange: 1, reward: 34 },
  basilisk: { name: "Mire Basilisk", color: "#568d55", hp: 31, atk: 7, def: 3, speed: 5, power: 4, morale: 4, moveType: "ground", attackType: "melee", attackRange: 1, reward: 43 },
  raiders: { name: "Cinder Raiders", color: "#bd5f45", hp: 35, atk: 8, def: 3, speed: 6, power: 5, morale: 5, moveType: "ground", attackType: "ranged", attackRange: 6, reward: 52 },
  wyvern: { name: "Glasswing Wyvern", color: "#5aa6c8", hp: 40, atk: 9, def: 4, speed: 8, power: 6, morale: 5, moveType: "flying", attackType: "melee", attackRange: 1, reward: 62 },
  knight: { name: "Clockwork Knight", color: "#9fa7b7", hp: 42, atk: 9, def: 5, speed: 3, power: 6, morale: 5, moveType: "ground", attackType: "melee", attackRange: 1, reward: 58 },
  tideGuard: { name: "Harbor Guard", color: "#6aa7bf", hp: 37, atk: 7, def: 5, speed: 5, power: 5, morale: 5, moveType: "ground", attackType: "melee", attackRange: 1, reward: 54 },
  warlock: { name: "Ashen Warlock", color: "#8b5fbf", hp: 56, atk: 11, def: 4, speed: 6, power: 8, morale: 6, moveType: "flying", attackType: "ranged", attackRange: 7, reward: 70 },
  gatekeeper: { name: "Black Gate Warden", color: "#646b7d", hp: 86, atk: 13, def: 8, speed: 5, power: 8, morale: 8, moveType: "ground", attackType: "melee", attackRange: 1, reward: 115 },
  rival: { name: "Rival Mage Orius", color: "#7a4bb5", hp: 116, atk: 16, def: 8, speed: 8, power: 11, morale: 9, moveType: "flying", attackType: "ranged", attackRange: 7, reward: 220 },
};

const roamingHeroDefinitions = {
  sableKnight: { name: "Sable Knight", encounter: "knight", x: 18, y: 13, patrol: [[18, 13], [23, 13], [23, 17], [18, 17]], reward: 75 },
  cinderDuke: { name: "Cinder Duke", encounter: "raiders", x: 41, y: 9, patrol: [[41, 9], [46, 9], [46, 13], [41, 13]], reward: 90 },
  moonRider: { name: "Moon Rider", encounter: "warlock", x: 62, y: 21, patrol: [[62, 21], [69, 21], [69, 28], [62, 28]], reward: 120 },
};

const nightEncounterPool = ["goblin", "basilisk", "raiders", "wyvern", "knight", "warlock"];

const enemySpriteVisuals = {
  goblin: { source: "enemy", id: "goblin" },
  basilisk: { source: "enemy", id: "basilisk" },
  raiders: { source: "enemy", id: "goblin" },
  wyvern: { source: "enemy", id: "wyvern" },
  knight: { source: "enemy", id: "knight" },
  tideGuard: { source: "unit", id: "reefGuard" },
  warlock: { source: "enemy", id: "warlock" },
  gatekeeper: { source: "enemy", id: "knight" },
  rival: { source: "character", id: "rival" },
  towerAdept: { source: "enemy", id: "warlock" },
  towerSentinel: { source: "enemy", id: "knight" },
};

const npcSpriteVisuals = {
  elder: "elder",
  ranger: "ranger",
  archivist: "archivist",
  wayfinder: "ranger",
};

const townBuildingDefinitions = {
  market: { name: "Market", cost: 75, income: 14, text: "+14 gold each dawn." },
  caravanPost: { name: "Caravan Post", cost: 110, income: 8, text: "Shop stays open. Trade carts dispatch automatically and earn more with each owned town." },
  barracks: { name: "Barracks", cost: 105, income: 0, text: "Lets this town raise and train its local unit." },
  trainingYard: { name: "Training Yard", cost: 125, income: 0, text: "Owned town visits grant +1 attack once." },
};

const npcQuests = {
  elder: {
    name: "Elder Mira",
    title: "Elder's Request",
    dialogue: "The roads are waking, but our scouts need proof you can hold them. Claim two mines and I will fund your march.",
    objective: "Claim 2 mines",
    rewardText: "90 gold and a Healing Draught",
    complete: () => countVisitedEvents("mine") >= 2,
    reward: () => {
      state.gold += 90;
      addInventoryItem("healingDraught", 1);
    },
  },
  ranger: {
    name: "Ranger Sol",
    title: "Road Patrol",
    dialogue: "Bandits shadow every road marker. Clear three outposts and the rangers will teach your army field tactics.",
    objective: "Clear 3 outposts",
    rewardText: "60 gold and +1 attack",
    complete: () => countVisitedEvents("battle") >= 3,
    reward: () => {
      state.gold += 60;
      state.hero.atk += 1;
    },
  },
  archivist: {
    name: "Archivist Nara",
    title: "Relic Ledger",
    dialogue: "Bring me two true relics from the old chests. I can identify which banners still hold power.",
    objective: "Find 2 relics",
    rewardText: "120 gold and +1 defense",
    complete: () => uniqueRelicCount() >= 2,
    reward: () => {
      state.gold += 120;
      state.hero.def += 1;
    },
  },
  wayfinder: {
    name: "Wayfinder Toma",
    title: "Southern Survey",
    dialogue: "The southern road is mapped in guesses and old rumors. Raise banners over four landmarks down there and I will open our reserve stores.",
    objective: "Secure 4 southern landmarks",
    rewardText: "140 gold and +1 speed",
    complete: () => ["9,31", "6,33", "13,36", "43,36", "19,31", "36,37"].filter((key) => state.visited[key]).length >= 4,
    reward: () => {
      state.gold += 140;
      state.hero.speed += 1;
    },
  },
};

const townCommissionDefinitions = {
  groveAid: {
    title: "Grove Aid",
    objective: "Recruit 3 creature units",
    rewardText: "70 gold and +1 morale",
    complete: () => state.party.length >= 3,
    reward: () => {
      state.gold += 70;
      state.hero.morale += 1;
    },
  },
  roadTithe: {
    title: "Road Tithe",
    objective: "Build a Caravan Post in any town",
    rewardText: "90 gold",
    complete: () => ownedTownEntries().some(([, town]) => town.buildings.includes("caravanPost")),
    reward: () => {
      state.gold += 90;
    },
  },
  musterCall: {
    title: "Muster Call",
    objective: "Own 3 towns",
    rewardText: "120 gold and a Healing Draught",
    complete: () => ownedTownEntries().length >= 3,
    reward: () => {
      state.gold += 120;
      addInventoryItem("healingDraught", 1);
    },
  },
};

const campUpgradeDefinitions = {
  betterTent: { name: "Better Tent", cost: 120, text: "Restores more HP at dawn and makes camp feel safer." },
  watchtower: { name: "Watchtower", cost: 160, text: "Spots raiders early. Reduces night waves by one when possible." },
  traps: { name: "Stake Traps", cost: 140, text: "Weakens the first unit in every night wave." },
  healerFire: { name: "Healer Fire", cost: 180, text: "Restores the party before each wave reaches camp." },
};

const nightPlanDefinitions = {
  holdfast: {
    name: "Hold Fast",
    text: "Safer rest. Fewer risks, steadier recovery, and slightly weaker night waves.",
  },
  nightRaid: {
    name: "Night Raid",
    text: "Press the dark for extra dawn gold, but draw a harder night response.",
  },
  scoutLines: {
    name: "Scout Lines",
    text: "Keep outriders moving. Dawn reveals the next major target on the overworld.",
  },
};

const itemDefinitions = {
  healingDraught: {
    name: "Healing Draught",
    type: "consumable",
    description: `Restore ${HEALING_DRAUGHT_AMOUNT} HP to every party member. Usable in battle.`,
    use: () => {
      recoverParty(HEALING_DRAUGHT_AMOUNT);
      return `Healing Draught restores ${HEALING_DRAUGHT_AMOUNT} HP to the party. It tastes like heroic soup.`;
    },
  },
  bannerOfLuck: {
    name: "Banner of Luck",
    type: "equipment",
    description: "Equip once: your champion gains +1 attack.",
    use: () => {
      state.hero.atk += 1;
      return `${championName()} equips the Banner of Luck and gains +1 attack.`;
    },
  },
  dawnwoodBow: {
    name: "Dawnwood Bow",
    type: "equipment",
    description: "Equip once: your champion becomes ranged, gains +1 power, and shoots best within 6 tiles.",
    use: () => {
      state.hero.power += 1;
      state.hero.attackType = "ranged";
      state.hero.attackRange = Math.max(state.hero.attackRange || 1, 6);
      return `${championName()} equips the Dawnwood Bow and can now attack from range.`;
    },
  },
  silverBridle: {
    name: "Silver Bridle",
    type: "equipment",
    description: "Equip once: your champion gains +1 defense.",
    use: () => {
      state.hero.def += 1;
      return `${championName()} equips the Silver Bridle and gains +1 defense.`;
    },
  },
  starlitCompass: {
    name: "Starlit Compass",
    type: "equipment",
    description: "Equip once: your champion gains +1 speed.",
    use: () => {
      state.hero.speed += 1;
      return `${championName()} equips the Starlit Compass and gains +1 speed.`;
    },
  },
  forgeCharm: {
    name: "Forge Charm",
    type: "equipment",
    description: "Equip once: your champion gains +6 max HP and fully heals.",
    use: () => {
      state.hero.maxHp += 6;
      state.hero.hp = state.hero.maxHp;
      return `${championName()} equips the Forge Charm and gains +6 max HP.`;
    },
  },
};

const chestItemIds = {
  "Healing Draught": "healingDraught",
  "Banner of Luck": "bannerOfLuck",
  "Dawnwood Bow": "dawnwoodBow",
  "Silver Bridle": "silverBridle",
  "Starlit Compass": "starlitCompass",
  "Forge Charm": "forgeCharm",
};
const relicItems = new Set(["Banner of Luck", "Silver Bridle", "Starlit Compass", "Forge Charm"]);
const relicItemNamesById = Object.fromEntries(Object.entries(chestItemIds).map(([name, id]) => [id, name]));
const caravanTradeGoods = [
  { id: "healingDraught", buyPrice: 35, sellPrice: 20, kind: "Supply" },
  { id: "bannerOfLuck", buyPrice: 150, sellPrice: 80, kind: "Artifact" },
  { id: "dawnwoodBow", buyPrice: 165, sellPrice: 90, kind: "Weapon" },
  { id: "silverBridle", buyPrice: 150, sellPrice: 80, kind: "Artifact" },
  { id: "starlitCompass", buyPrice: 150, sellPrice: 80, kind: "Artifact" },
  { id: "forgeCharm", buyPrice: 175, sellPrice: 95, kind: "Rare" },
];
const battleQuips = {
  playerHit: [
    "The paperwork will be brutal.",
    "That one had daylight on it.",
    "A very official bonk lands.",
    "The party pretends this was rehearsed.",
  ],
  enemyHit: [
    "Rude, but technically a tactic.",
    "The healer makes a judgmental noise.",
    "Everyone agrees that was unnecessary.",
    "That looked expensive.",
  ],
  enemyDown: [
    "They drop like a sack of dramatic potatoes.",
    "They reconsider their whole career.",
    "The battlefield gets slightly less crowded.",
    "They lie down with theatrical commitment.",
  ],
  potion: [
    "The bottle goes glug glug and morale goes up.",
    "It tastes like mint, thunder, and questionable decisions.",
    "The party drinks it without reading the label.",
  ],
};

const mapRows = [
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
  "WGGGGGFFFGGGGGGMMMWWGGGGGGGGGGFFFGGGGGRRRGGGGGFFFGGGW",
  "WGTGGGFFFGGCHGGMMMWWGGFFFGGGGGRRRGGGGGGRGGGGGGFFFGGGW",
  "WGGGRRRGGGGRRRGGGGGWWGFFFGGGGGRGGGGGGGGRGGGGGGGGGGGGW",
  "WFFGRWGGGGGGRRRGGGGGGGGGRRRGGGGRGGMMGGGRRRRGGGGMMMGGW",
  "WFFFWWWWGGGGGRRRGGTTGGGRHGGGGGRGGMMMGGGGGGRGGGGMMMGGW",
  "WGGRGGWWGGMMGGGRRGGGGGGRGGGGGGRRRGGGGGGFFFGGGGGRGGGGW",
  "WGGRTGGGGGMMGGGGRRRRRGGGGGGGGGGGGRGGTGGFFFGGGGGRGGGTW",
  "WGGGRRRRGGGGGFFFGGGGRGGMMGGGFFFGGRGGGGGGGGGGRRRGGGGGW",
  "WGMMGGGRRRGGGFFFGGGGRGGMMGGGFFFGRRGGGMMGGGGGRGGGGGGGW",
  "WGMMTTGGGRRRGGGGGGTGRGGGGGGGGMGGGGRGGGMMGGCHRGGGFFFGW",
  "WGGGGGGGGGGRRRRRGGGGRRRGFFFGGMGGGGRGGGGGGGGGRGGGFFFGW",
  "WGGGFFFGGGGGGGGRRRGGGGRGFFFGGMRRRRGGGGGRRRGGGRGGGGGGW",
  "WGGGFFFGGGGCHGGGGRRRGGGRGGGGGGGGGGGCHGGGRGGGGGGGGGCHW",
  "WGGGGGGGGGGGGGGGGGGRRRKGGGGGGGGFFFGGGGGGRGGMMMMGGGGGW",
  "WGGFFFGGMMGGGGRRRRGGGGGGGMMGGGFFFGGGGGGRGGMMMMGGRGGGW",
  "WGGFFFGGMMGGGGRGGGGGTTGGGMMGGGRRRGGGTTGGRGGGGGGGRGGGW",
  "WGGGGGGGGGGGRRRGGGGGGGGGGGGGGGRGGGGGGGGGRRRRGGGGRGGGW",
  "WGGGMMMWWGGGRGGFFFFGGGRRRRGGGGRGGMMMGGGGGGGRGGFFFGGGW",
  "WGGGGGGWWGGGRGGGFFFGGGGGGRGGGGRGGMMMGGGGMMGRGGFFFGGGW",
  "WGGCHGGGGGGGRRRRGGGGGGGGGRRRRRGGGGKTGGGGMMGRGGGGGGGGW",
  "WGGGGRRRRGGFFFGGGGGGMMMGGGGGRRRRGGGGGGGGGGGRRRRGGGGGW",
  "WGGGGGGGRGGFFFGGGTTGMMMGGGGGGGGRGGGFFFGGGGGGGGRGGMMGW",
  "WGGMMMGGRGGGGGGGGRGGGGGGGCHGGGGRGGGFFFGGGTTGGGRGGMMGW",
  "WGGMMMGGRRRRGGGGGRGGGFFFGGGGGGGRGGGGGGGGGRRGGGGRGGGGW",
  "WGGGGGGGGGGGRGGGGGGGGFFFGGGMMGGGRRRRGGGGGGRGGGGGGGGTW",
  "WGGGFFFGGGGGRRRRGGGGGGGGGGMMGGGGGGGRGGMMGGRGGGCHGGGGW",
  "WGGGFFFGGGGGGGGRGGGMMMMGGGGGGGGGTTGGRGGMMGGRRRRGGGKGW",
  "WGGGGGGGGGGGGGGRGGGGGGGGGGRRRRGGGGGGGGGGGGGGGGGRRRTGW",
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
];

function eastExpansionForRow(y) {
  const rows = [
    "GGGFFFGGGGRRRGGGGMMGGG",
    "GGGFFFGGGGRGGGGGGMMGTG",
    "GGGGGGGGGGRGGFFFGGGGGG",
    "GGRRRGGMMGRGGFFFGGGGGG",
    "GGGRGGGMMGRGGGGGGGRRRG",
    "GGGRGGGGGGRRRRGGGGRGGG",
  ];
  if (y === 0 || y === mapRows.length - 1) return "W".repeat(rows[0].length);
  return rows[y % rows.length];
}

const southExpansionRows = [
  "WGGGFFFGGGGGRRRGGGGGGGGMMGGGRRRRGGGGGFFFGGGGGGGRRRGGGGGGFFFGGGGGW",
  "WGGGFFFGGTTGGRGGGGGCHGGMMGGGGGRGGGGGGFFFGGGMMGGGGGRGGGGGGGGGGGW",
  "WGGGGGGGGGGGGRGGMMMMGGGGGGGGGGGRGGGTTGGGGGGMMGGRRRRGGGGCHGGGGW",
  "WGGMMMGGGRRRRRGGGGGGGGGGFFFGGGGRGGGGGGFFFGGGGGGGGGGRGGGGGGGGTW",
  "WGGMMMGGGGGGGRGGGFFFGGGGFFFGGGGRGGMMMMGGGGGGGRRRRGGRGGMMMGGGW",
  "WGGGGGGGGCHGGRGGGFFFGGGGGGGGGGGRGGMMMMGGTTGGGGGGGRGRGGMMMGGGW",
  "WGGGGRRRRGGGGRGGGGGGGMMMMGGGGGRRRGGGGGGGGRGGFFFGGGRGGGGGGGGGW",
  "WGGGGGGGRGGGGGGRRRRGGMMMMGGGGGGGRGGGCHGGGRGGFFFGGGRRRRGGGKGW",
  "WGGFFFGGRGGMMGGGGGGRGGGGGGGGTTGGRGGGGGGGGRGGGGGGGGGGGRRRRTGW",
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
];

const worldRows = [
  ...mapRows.map((row, y) => row.slice(0, -1) + eastExpansionForRow(y) + "W"),
  ...southExpansionRows,
];

const MAP_W = Math.max(...worldRows.map((row) => row.length));
const MAP_H = worldRows.length;
const map = worldRows.map((row) => row.padEnd(MAP_W, "W").split(""));
const finalFortressAnchor = { x: 71, y: 4 };
const finalFortressGateTile = { x: 71, y: 5 };
const finalFortressApproachTile = { x: 71, y: 6 };
const finalFortressTerrainBounds = { minX: 68, maxX: 74, minY: 3, maxY: 5 };
const finalFortressMountainTiles = [
  [67, 2], [68, 2], [69, 2], [70, 2], [71, 2], [72, 2], [73, 2], [74, 2],
  [67, 3], [74, 3],
  [67, 4], [74, 4],
  [67, 5], [74, 5],
  [67, 6], [68, 6], [69, 6], [70, 6], [72, 6], [73, 6], [74, 6],
];
const riverBridgeTiles = [
  [29, 29],
  [30, 29],
  [31, 29],
  [49, 29],
  [50, 29],
  [51, 29],
];
riverBridgeTiles.forEach(([x, y]) => {
  if (map[y]?.[x] === "W") map[y][x] = "B";
});
for (let y = finalFortressTerrainBounds.minY; y <= finalFortressTerrainBounds.maxY; y += 1) {
  for (let x = finalFortressTerrainBounds.minX; x <= finalFortressTerrainBounds.maxX; x += 1) {
    if (!map[y]?.[x] || map[y][x] === "W") continue;
    map[y][x] = x === finalFortressGateTile.x && y === finalFortressGateTile.y ? "R" : "G";
  }
}
finalFortressMountainTiles.forEach(([x, y]) => {
  if (map[y]?.[x] && map[y][x] !== "W") map[y][x] = "M";
});
if (map[finalFortressApproachTile.y]?.[finalFortressApproachTile.x]) {
  map[finalFortressApproachTile.y][finalFortressApproachTile.x] = "R";
}
const events = new Map([
  ["3,2", { type: "town", name: "Dawnhaven", creature: "leafFox", faction: "grove" }],
  ["16,5", { type: "town", name: "Ashbell", creature: "emberGolem", faction: "forge" }],
  ["9,10", { type: "town", name: "Mistfen", creature: "tideWisp", faction: "tide" }],
  ["35,7", { type: "town", name: "Moonbarrow", creature: "duskMoth", faction: "dusk" }],
  ["36,20", { type: "town", name: "Southwatch", creature: "tideWisp", faction: "tide" }],
  ["47,7", { type: "town", name: "Eastmere", creature: "leafFox", faction: "grove" }],
  ["44,16", { type: "town", name: "Sunforge", creature: "emberGolem", faction: "forge" }],
  ["44,23", { type: "town", name: "Amberwatch", creature: "duskMoth", faction: "dusk" }],
  ["11,2", { type: "chest", gold: 55, item: "Banner of Luck" }],
  ["11,13", { type: "chest", gold: 70, item: "Silver Bridle" }],
  ["35,13", { type: "chest", gold: 85, item: "Starlit Compass" }],
  ["4,20", { type: "chest", gold: 95, item: "Forge Charm" }],
  ["41,10", { type: "chest", gold: 115, item: "Dawnwood Bow" }],
  ["27,23", { type: "chest", gold: 130, item: "Forge Charm" }],
  ["48,26", { type: "chest", gold: 150, item: "Starlit Compass" }],
  ["7,7", { type: "battle", encounter: "goblin" }],
  ["13,9", { type: "battle", encounter: "basilisk" }],
  ["29,6", { type: "battle", encounter: "raiders" }],
  ["31,11", { type: "battle", encounter: "wyvern" }],
  ["22,6", { type: "battle", encounter: "knight" }],
  ["24,18", { type: "battle", encounter: "warlock" }],
  ["34,20", { type: "battle", encounter: "knight" }],
  ["42,12", { type: "battle", encounter: "basilisk" }],
  ["45,18", { type: "battle", encounter: "wyvern" }],
  ["38,24", { type: "battle", encounter: "raiders" }],
  ["51,25", { type: "battle", encounter: "warlock" }],
  ["71,5", { type: "battle", encounter: "gatekeeper", gate: true }],
  ["71,4", { type: "final", encounter: "rival" }],
  ["5,6", { type: "mine", gold: 20 }],
  ["20,2", { type: "mine", gold: 25 }],
  ["21,9", { type: "mine", gold: 25 }],
  ["30,10", { type: "mine", gold: 30 }],
  ["7,16", { type: "mine", gold: 35 }],
  ["31,18", { type: "mine", gold: 40 }],
  ["42,14", { type: "mine", gold: 45 }],
  ["46,20", { type: "mine", gold: 50 }],
  ["30,26", { type: "mine", gold: 55 }],
  ["47,27", { type: "mine", gold: 60 }],
  ["5,3", { type: "npc", quest: "elder" }],
  ["18,7", { type: "npc", quest: "ranger" }],
  ["39,14", { type: "npc", quest: "archivist" }],
  ["63,4", { type: "town", name: "Highglass", creature: "emberGolem", faction: "forge" }],
  ["68,12", { type: "town", name: "Greenmarch", creature: "leafFox", faction: "grove" }],
  ["60,33", { type: "town", name: "Starfen", creature: "duskMoth", faction: "dusk" }],
  ["9,31", { type: "town", name: "Lowmarket", creature: "reefGuard", faction: "tide" }],
  ["61,6", { type: "battle", encounter: "raiders" }],
  ["70,9", { type: "battle", encounter: "wyvern" }],
  ["59,20", { type: "battle", encounter: "warlock" }],
  ["60,31", { type: "battle", encounter: "knight" }],
  ["59,35", { type: "battle", encounter: "warlock" }],
  ["13,36", { type: "battle", encounter: "raiders" }],
  ["43,36", { type: "battle", encounter: "wyvern" }],
  ["8,5", { type: "landmark", landmark: "signpost", title: "Dawnhaven Crossing" }],
  ["18,11", { type: "landmark", landmark: "ruins", title: "Broken Watch" }],
  ["33,8", { type: "landmark", landmark: "camp", title: "Cinder Road Camp" }],
  ["41,21", { type: "landmark", landmark: "statue", title: "Sunfall Monument" }],
  ["57,12", { type: "landmark", landmark: "signpost", title: "High March Road" }],
  ["63,31", { type: "landmark", landmark: "camp", title: "South Road Camp" }],
  ["19,31", { type: "chest", gold: 105, item: "Healing Draught" }],
  ["65,16", { type: "chest", gold: 175, item: "Healing Draught" }],
  ["60,32", { type: "chest", gold: 190, item: "Banner of Luck" }],
  ["36,37", { type: "chest", gold: 170, item: "Silver Bridle" }],
  ["61,28", { type: "mine", gold: 65 }],
  ["6,33", { type: "mine", gold: 70 }],
  ["58,34", { type: "mine", gold: 75 }],
  ["28,38", { type: "npc", quest: "wayfinder" }],
]);

const defaultState = () => ({
  x: 2,
  y: 2,
  day: 1,
  steps: 0,
  dayProgress: 0,
  nightReady: false,
  gold: 160,
  relics: [],
  inventory: [{ id: "healingDraught", qty: 1 }],
  equipped: {},
  towns: {
    "3,2": { owner: "player", buildings: ["market"] },
  },
  enemyHeroes: createDefaultEnemyHeroes(),
  quests: {},
  tradeLedger: [],
  campUpgrades: {},
  won: false,
  visited: {},
  discoveredRegions: {},
  scoutMarker: "",
  nightPlan: "holdfast",
  hero: { ...heroBaseStats, nameChosen: false, skills: [] },
  startingBonus: "",
  party: [makeCreature("leafFox")],
  log: ["Reach the northeast fortress.", "Gather four creatures.", "Survey the southern road.", "Claim the scattered relics."],
});

const loadedState = loadGame();
let state = loadedState || defaultState();
let message = "Explore the realm and build your party.";
let modalOpen = false;
let visual = { x: state.x, y: state.y, fromX: state.x, fromY: state.y, toX: state.x, toY: state.y, moving: false, startedAt: 0, progress: 0 };
let facing = "down";
let animationTime = 0;
let activeBattle = null;
let activeNight = null;
let pendingLevelUps = 0;
let pendingPostBattleAction = null;
let caravanTradeFeedback = { text: "", type: "info" };
let camera = { x: 0, y: 0, originX: 0, originY: 0, key: "" };
let audioContext = null;
let musicEnabled = false;
let musicTimer = 0;
let musicStep = 0;
let musicGain = null;
let musicMode = "field";
let autoBattleTimer = 0;
let lastStepSoundAt = 0;
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
const heldPadDirections = new Set();
let heldMovementTimer = 0;
const padDirectionMap = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

function makeCreature(id) {
  const base = creatureBook[id];
  return { id, name: base.name, color: base.color, level: 1, xp: 0, maxHp: base.maxHp, hp: base.maxHp, atk: base.atk, def: base.def, speed: base.speed, power: base.power, morale: base.morale, moveType: base.moveType, attackType: base.attackType, attackRange: base.attackRange, skill: base.skill, spriteId: base.spriteId || id, skills: [] };
}

function makeRecruitedCreature(id) {
  const unit = makeCreature(id);
  return unit;
}

function createDefaultEnemyHeroes() {
  return Object.entries(roamingHeroDefinitions).map(([id, definition]) => ({
    id,
    x: definition.x,
    y: definition.y,
    facing: "left",
    patrolIndex: 0,
    defeated: false,
  }));
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
  saved.towns ??= { "3,2": { owner: "player", buildings: ["market"] } };
  saved.towns["3,2"] ??= { owner: "player", buildings: ["market"] };
  Object.values(saved.towns).forEach((town) => {
    town.owner ??= "neutral";
    town.buildings = Array.isArray(town.buildings) ? town.buildings : [];
    town.usedActions ??= {};
  });
  saved.tradeLedger = Array.isArray(saved.tradeLedger) ? saved.tradeLedger : [];
  saved.campUpgrades = saved.campUpgrades && typeof saved.campUpgrades === "object" ? saved.campUpgrades : {};
  if (saved.campUpgrades.stakeTraps && saved.campUpgrades.traps == null) saved.campUpgrades.traps = true;
  delete saved.campUpgrades.stakeTraps;
  saved.discoveredRegions = saved.discoveredRegions && typeof saved.discoveredRegions === "object" ? saved.discoveredRegions : {};
  saved.scoutMarker = typeof saved.scoutMarker === "string" ? saved.scoutMarker : "";
  saved.nightPlan = nightPlanDefinitions[saved.nightPlan] ? saved.nightPlan : "holdfast";
  saved.enemyHeroes = normalizeEnemyHeroes(saved.enemyHeroes);
  saved.quests = saved.quests && typeof saved.quests === "object" ? saved.quests : {};
  saved.startingBonus ??= saved.hero?.nameChosen ? "legacy" : "";
  saved.hero = { ...heroBaseStats, ...saved.hero, nameChosen: saved.hero.nameChosen ?? Boolean(saved.hero.name && saved.hero.name !== heroBaseStats.name), skills: saved.hero.skills || [] };
  saved.party = Array.isArray(saved.party) ? saved.party.filter((unit, index, party) => unit?.id && creatureBook[unit.id] && party.findIndex((candidate) => candidate?.id === unit.id) === index).slice(0, MAX_PARTY_UNITS) : [makeCreature("leafFox")];
  if (!saved.party.length) saved.party = [makeCreature("leafFox")];
  saved.party?.forEach((unit) => {
    unit.xp ??= 0;
    unit.atk ??= creatureBook[unit.id]?.atk ?? 5;
    unit.def ??= creatureBook[unit.id]?.def ?? 2;
    unit.speed ??= creatureBook[unit.id]?.speed ?? 5;
    unit.power ??= creatureBook[unit.id]?.power ?? 3;
    unit.morale ??= creatureBook[unit.id]?.morale ?? 4;
    unit.moveType ??= creatureBook[unit.id]?.moveType ?? "ground";
    unit.attackType ??= creatureBook[unit.id]?.attackType ?? "melee";
    unit.attackRange ??= creatureBook[unit.id]?.attackRange ?? 1;
    unit.skill ??= creatureBook[unit.id]?.skill ?? "";
    unit.spriteId ??= creatureBook[unit.id]?.spriteId || unit.id;
    unit.skills ??= [];
  });
  return saved;
}

function normalizeEnemyHeroes(enemyHeroes) {
  const existing = new Map(Array.isArray(enemyHeroes) ? enemyHeroes.map((hero) => [hero?.id, hero]) : []);
  return createDefaultEnemyHeroes().map((hero) => {
    const saved = existing.get(hero.id);
    if (!saved) return hero;
    return {
      ...hero,
      x: Number.isFinite(saved.x) ? saved.x : hero.x,
      y: Number.isFinite(saved.y) ? saved.y : hero.y,
      facing: saved.facing || hero.facing,
      patrolIndex: Number.isFinite(saved.patrolIndex) ? saved.patrolIndex : 0,
      defeated: Boolean(saved.defeated),
    };
  });
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
  window.setTimeout(openNamePrompt, 0);
}

function setMessage(text) {
  message = text;
  statusLine.textContent = text;
}

function ensureAudioContext() {
  if (audioContext) return audioContext;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  audioContext = new AudioCtx();
  musicGain = audioContext.createGain();
  musicGain.gain.value = 0.22;
  musicGain.connect(audioContext.destination);
  return audioContext;
}

function playTone(frequency, duration = 0.1, type = "square", volume = 0.05, destination = null) {
  const ctxAudio = ensureAudioContext();
  if (!ctxAudio) return;
  const osc = ctxAudio.createOscillator();
  const gain = ctxAudio.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, ctxAudio.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume, ctxAudio.currentTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctxAudio.currentTime + duration);
  osc.connect(gain);
  gain.connect(destination || ctxAudio.destination);
  osc.start();
  osc.stop(ctxAudio.currentTime + duration + 0.02);
}

function playNoise(duration = 0.06, volume = 0.03, destination = null, filterFrequency = 900, filterType = "bandpass") {
  const ctxAudio = ensureAudioContext();
  if (!ctxAudio) return;
  const length = Math.max(1, Math.floor(ctxAudio.sampleRate * duration));
  const buffer = ctxAudio.createBuffer(1, length, ctxAudio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1;
  const source = ctxAudio.createBufferSource();
  const filter = ctxAudio.createBiquadFilter();
  const gain = ctxAudio.createGain();
  source.buffer = buffer;
  filter.type = filterType;
  filter.frequency.value = filterFrequency;
  gain.gain.setValueAtTime(volume, ctxAudio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctxAudio.currentTime + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination || ctxAudio.destination);
  source.start();
  source.stop(ctxAudio.currentTime + duration + 0.01);
}

function playSfx(kind) {
  if (!audioContext && !musicEnabled) return;
  const now = performance.now();
  if (kind === "step" && now - lastStepSoundAt < 120) return;
  if (kind === "step") lastStepSoundAt = now;
  const sounds = {
    step: [120, 0.035, "triangle", 0.04],
    coin: [880, 0.09, "square", 0.075],
    hit: [150, 0.08, "sawtooth", 0.09],
    guard: [520, 0.12, "triangle", 0.07],
    win: [660, 0.16, "square", 0.08],
  };
  const sound = sounds[kind];
  if (!sound) return;
  playTone(sound[0], sound[1], sound[2], sound[3]);
  if (kind === "coin") window.setTimeout(() => playTone(1175, 0.08, "square", 0.035), 70);
  if (kind === "win") window.setTimeout(() => playTone(990, 0.18, "square", 0.045), 120);
}

function toggleMusic() {
  setMusicEnabled(!musicEnabled);
}

function setMusicEnabled(enabled) {
  const ctxAudio = ensureAudioContext();
  if (!ctxAudio) return;
  ctxAudio.resume?.();
  musicEnabled = enabled;
  if (musicEnabled) startMusic();
  else stopMusic();
  updateMusicButton();
}

function startMusicFromFirstGesture(event) {
  if (event?.target?.closest?.("#musicBtn")) return;
  if (!musicEnabled) setMusicEnabled(true);
}

function startMusic() {
  stopMusic();
  musicStep = 0;
  musicMode = currentMusicMode();
  scheduleMusicBeat();
}

function stopMusic() {
  if (musicTimer) window.clearTimeout(musicTimer);
  musicTimer = 0;
}

function scheduleMusicBeat() {
  if (!musicEnabled || !musicGain || !audioContext) return;
  const mode = currentMusicMode();
  if (mode !== musicMode) {
    musicMode = mode;
    musicStep = 0;
  }
  const patterns = {
    field: {
      variations: [
        [294, 330, 392, 494, 440, 392, 330, 392, 294, 330, 392, 587, 523, 494, 440, 392, 330, 392, 440, 523, 587, 523, 494, 440, 392, 440, 494, 659, 587, 523, 494, 440],
        [247, 294, 330, 392, 494, 587, 494, 440, 392, 330, 294, 392, 440, 523, 494, 392, 330, 392, 494, 587, 659, 587, 523, 494, 440, 392, 330, 392, 494, 587, 523, 440],
        [294, 330, 370, 440, 494, 440, 392, 370, 330, 370, 392, 494, 554, 494, 440, 392, 330, 294, 330, 392, 440, 494, 523, 587, 523, 494, 440, 392, 370, 330, 294, 392],
        [392, 440, 494, 587, 659, 587, 523, 494, 440, 392, 330, 392, 494, 587, 523, 494, 440, 494, 523, 587, 659, 740, 659, 587, 523, 494, 440, 392, 494, 587, 523, 440],
      ],
      bass: [98, 98, 147, 147, 123, 123, 165, 147, 110, 110, 147, 147, 123, 165, 147, 123, 98, 98, 147, 147, 123, 123, 196, 165, 110, 110, 147, 147, 165, 147, 123, 98],
      tempo: 0.22,
      delay: 240,
      sectionLength: 32,
    },
    night: {
      variations: [
        [147, 196, 220, 247, 294, 247, 220, 196, 165, 220, 247, 330, 294, 247, 220, 196, 147, 165, 196, 247, 294, 330, 294, 247, 220, 196, 165, 220, 247, 294, 247, 196],
        [165, 220, 247, 294, 330, 294, 247, 220, 196, 247, 294, 392, 330, 294, 247, 220, 185, 220, 247, 277, 330, 392, 330, 294, 247, 220, 196, 165, 196, 220, 247, 196],
        [147, 185, 196, 220, 247, 294, 247, 220, 196, 220, 247, 294, 330, 294, 247, 220, 165, 196, 220, 247, 294, 247, 220, 196, 185, 220, 247, 330, 294, 247, 220, 196],
      ],
      bass: [73, 73, 98, 98, 82, 82, 110, 98, 65, 65, 98, 98, 82, 110, 98, 82, 73, 73, 98, 98, 82, 82, 123, 110, 65, 65, 98, 98, 82, 98, 73, 65],
      tempo: 0.27,
      delay: 300,
      sectionLength: 32,
    },
    battle: {
      variations: [
        [220, 247, 294, 330, 392, 330, 294, 247, 262, 294, 349, 392, 440, 392, 349, 294, 247, 294, 330, 392, 494, 440, 392, 330, 294, 330, 392, 523, 494, 440, 392, 330],
        [196, 220, 262, 330, 392, 330, 262, 220, 247, 294, 330, 440, 392, 349, 330, 294, 220, 247, 294, 349, 392, 440, 392, 349, 330, 294, 262, 294, 330, 392, 349, 294],
        [247, 294, 330, 392, 494, 440, 392, 330, 294, 330, 392, 523, 494, 440, 392, 330, 262, 294, 349, 392, 440, 392, 349, 330, 294, 262, 247, 294, 330, 349, 392, 294],
      ],
      bass: [55, 55, 82, 82, 73, 73, 98, 82, 65, 65, 98, 98, 73, 110, 98, 82, 55, 55, 82, 82, 73, 73, 110, 98, 65, 65, 98, 98, 82, 110, 98, 73],
      tempo: 0.16,
      delay: 170,
      sectionLength: 32,
    },
  };
  const pattern = patterns[mode];
  const sectionLength = pattern.sectionLength || 16;
  const sectionIndex = Math.floor(musicStep / sectionLength);
  const stepInSection = musicStep % sectionLength;
  const phrase = pattern.variations?.[sectionIndex % pattern.variations.length] || pattern.variations?.[0] || [];
  const note = phrase[stepInSection % phrase.length];
  const root = pattern.bass[Math.floor(musicStep / 2) % pattern.bass.length];
  const field = mode === "field";
  const battle = mode === "battle";
  const night = mode === "night";
  playTone(note, pattern.tempo, battle ? "square" : field ? "sawtooth" : "triangle", battle ? 0.07 : field ? 0.045 : 0.052, musicGain);
  if (field && musicStep % 4 === 0) playTone(note * 2, 0.09, "triangle", 0.026, musicGain);
  if (field && [7, 15, 23, 31].includes(stepInSection)) playTone(note * 1.5, 0.11, "square", 0.024, musicGain);
  if (field && [12, 28].includes(stepInSection)) playTone(note * 0.75, 0.16, "triangle", 0.022, musicGain);
  if (battle && musicStep % 4 === 1) playTone(note * 2, 0.055, "square", 0.033, musicGain);
  if (battle && [14, 30].includes(stepInSection)) playTone(note * 1.5, 0.075, "sawtooth", 0.03, musicGain);
  if (night && musicStep % 8 === 5) playTone(note * 1.5, 0.12, "sine", 0.028, musicGain);
  if (night && [10, 26].includes(stepInSection)) playTone(note * 2, 0.16, "triangle", 0.02, musicGain);
  if (musicStep % 2 === 0) playTone(root, pattern.tempo + 0.08, "sine", battle ? 0.13 : field ? 0.105 : 0.095, musicGain);
  if (field && musicStep % 4 === 2) playTone(root / 2, 0.12, "triangle", 0.07, musicGain);
  if (battle && musicStep % 4 === 2) playTone(55, 0.09, "sawtooth", 0.11, musicGain);
  if (mode !== "battle" && !field && musicStep % 8 === 6) playTone(note * 1.5, 0.14, "sine", 0.035, musicGain);
  if (sectionLength > 16 && [15, 31].includes(stepInSection)) playTone(root * 2, 0.18, battle ? "square" : "triangle", battle ? 0.03 : 0.024, musicGain);
  if (mode === "field") playFieldDrums(musicStep);
  if (mode === "night") playNightDrums(musicStep);
  if (mode === "battle") playBattleDrums(musicStep);
  musicStep += 1;
  musicTimer = window.setTimeout(scheduleMusicBeat, pattern.delay);
}

function playFieldDrums(step) {
  const beat = step % 16;
  if ([0, 6, 8, 14].includes(beat)) {
    playTone(54, 0.095, "sine", 0.13, musicGain);
    playTone(82, 0.045, "triangle", 0.05, musicGain);
  }
  if ([4, 12].includes(beat)) {
    playNoise(0.07, 0.052, musicGain, 520, "bandpass");
    playTone(176, 0.035, "triangle", 0.036, musicGain);
  }
  if (step % 2 === 1) playNoise(0.024, 0.018, musicGain, 5200, "highpass");
  if ([3, 7, 11, 15].includes(beat)) playTone(1760, 0.025, "square", 0.014, musicGain);
}

function playNightDrums(step) {
  const beat = step % 16;
  if ([0, 8].includes(beat)) {
    playTone(44, 0.14, "sine", 0.12, musicGain);
    playTone(66, 0.06, "triangle", 0.04, musicGain);
  }
  if ([5, 12].includes(beat)) playNoise(0.08, 0.036, musicGain, 420, "bandpass");
  if ([3, 7, 11, 15].includes(beat)) playTone(130, 0.04, "sawtooth", 0.024, musicGain);
  if (step % 2 === 1) playNoise(0.02, 0.01, musicGain, 3400, "highpass");
}

function playBattleDrums(step) {
  const beat = step % 16;
  if ([0, 3, 8, 11].includes(beat)) {
    playTone(46, 0.085, "sine", 0.15, musicGain);
    playTone(69, 0.04, "triangle", 0.06, musicGain);
  }
  if ([4, 12].includes(beat)) {
    playNoise(0.075, 0.06, musicGain, 760, "bandpass");
    playTone(155, 0.03, "sawtooth", 0.035, musicGain);
  }
  if (step % 2 === 1) playNoise(0.018, 0.02, musicGain, 6200, "highpass");
  if ([2, 6, 10, 14].includes(beat)) playTone(2200, 0.018, "square", 0.013, musicGain);
}

function currentMusicMode() {
  if (activeBattle) return "battle";
  if (activeNight || state.nightReady) return "night";
  return "field";
}

function updateMusicButton() {
  if (!musicBtn) return;
  musicBtn.textContent = musicEnabled ? "Music On" : "Music";
  musicBtn.classList.toggle("active", musicEnabled);
}

function championName() {
  return state.hero?.name || heroBaseStats.name;
}

function sanitizeChampionName(value) {
  return String(value || "")
    .replace(/[^\w '\-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 18);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const startingBonuses = {
  gold: { name: "Merchant Purse", text: "+80 gold for early buildings and recruits." },
  command: { name: "Command Training", text: "+1 attack and +1 defense for your champion." },
  scout: { name: "Scout Boots", text: "+1 speed and +20 gold for safer early scouting." },
  companion: { name: "Second Companion", text: "Begin with an Ember Golem beside your Leaf Fox." },
};

function applyStartingBonus(id) {
  state.startingBonus = id;
  if (id === "gold") state.gold += 80;
  else if (id === "command") {
    state.hero.atk += 1;
    state.hero.def += 1;
  } else if (id === "scout") {
    state.hero.speed += 1;
    state.gold += 20;
  } else if (id === "companion" && !state.party.some((unit) => unit.id === "emberGolem")) {
    state.party.push(makeRecruitedCreature("emberGolem"));
  }
}

function openNamePrompt() {
  if (modalOpen || activeBattle || activeNight || state.hero.nameChosen) return;
  const currentName = state.hero.name === heroBaseStats.name ? "" : state.hero.name;
  const bonusOptions = Object.entries(startingBonuses).map(([id, bonus], index) => `
    <label class="bonus-choice">
      <input type="radio" name="startingBonus" value="${id}"${index === 0 ? " checked" : ""} />
      <span><strong>${bonus.name}</strong><small>${bonus.text}</small></span>
    </label>
  `).join("");
  openModal(
    "Name Your Champion",
    `<label class="name-field" for="championNameInput"><span>Champion name</span><input id="championNameInput" type="text" maxlength="18" autocomplete="off" value="${escapeHtml(currentName)}" placeholder="Enter a name" /></label><div class="bonus-choice-list"><strong>Starting bonus</strong>${bonusOptions}</div><p class="small">Your name and bonus appear in battle, level ups, items, and the campaign menu.</p>`,
    [{
      label: "Begin Campaign",
      action: () => {
        const input = document.getElementById("championNameInput");
        const name = sanitizeChampionName(input?.value) || heroBaseStats.name;
        const bonus = document.querySelector("input[name='startingBonus']:checked")?.value || "gold";
        state.hero.name = name;
        state.hero.nameChosen = true;
        applyStartingBonus(bonus);
        setMessage(`${name} begins the campaign from Dawnhaven.`);
        renderAll();
      },
    }],
    {
      html: true,
      className: "name-modal",
      onRender: () => {
        const input = document.getElementById("championNameInput");
        input?.focus();
        input?.select();
        input?.addEventListener("keydown", (event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          modalActions.querySelector("button")?.click();
        });
      },
    },
  );
}

function isBlocked(x, y) {
  const tile = map[y]?.[x];
  const event = events.get(`${x},${y}`);
  return !tile || tile === "W" || tile === "M" || event?.type === "wall";
}

function finalGateCleared() {
  return Boolean(state.visited[`${finalFortressGateTile.x},${finalFortressGateTile.y}`]);
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
  if (nx === finalFortressAnchor.x && ny === finalFortressAnchor.y && !finalGateCleared()) {
    setMessage("The mountain pass is still guarded. Defeat the warden in the gap before entering the fortress.");
    return;
  }
  facing = dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down";
  state.x = nx;
  state.y = ny;
  state.steps = (state.steps || 0) + 1;
  advanceDayProgress();
  recoverParty(1);
  playSfx("step");
  startMoveAnimation(ox, oy, nx, ny);
  renderAll();
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
    checkRegionDiscovery();
    if (!modalOpen && !activeBattle && !activeNight) {
      advanceRoamingHeroes();
      checkRoamingHeroContact();
    }
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

function ensureHeldMovementLoop() {
  if (heldMovementTimer) return;
  heldMovementTimer = window.setInterval(() => {
    if (!getHeldDirection()) {
      stopHeldMovementLoop();
      return;
    }
    if (!modalOpen && !state.won && !visual.moving) {
      continueHeldMovement();
    }
  }, 40);
}

function stopHeldMovementLoop() {
  if (!heldMovementTimer) return;
  window.clearInterval(heldMovementTimer);
  heldMovementTimer = 0;
}

function getHeldDirection() {
  const padDirection = Array.from(heldPadDirections).at(-1);
  if (padDirection) return padDirectionMap[padDirection] || null;
  const priority = ["ArrowUp", "w", "W", "ArrowDown", "s", "S", "ArrowLeft", "a", "A", "ArrowRight", "d", "D"];
  const key = priority.find((item) => heldKeys.has(item));
  return key ? keyMap[key] : null;
}

function recoverParty(amount) {
  return recoverPartyDetailed(amount);
}

function recoverPartyDetailed(amount) {
  let restored = 0;
  const team = [state.hero, ...state.party];
  team.forEach((unit) => {
    const before = unit.hp;
    unit.hp = Math.min(unit.maxHp, unit.hp + amount);
    restored += unit.hp - before;
  });
  return restored;
}

function totalPartyMissingHp() {
  return [state.hero, ...state.party].reduce((sum, unit) => sum + Math.max(0, (unit.maxHp || 0) - (unit.hp || 0)), 0);
}

function triggerEvent() {
  const key = `${state.x},${state.y}`;
  const event = events.get(key);
  if (!event) {
    return;
  }
  if (state.visited[key] && !["final", "town"].includes(event.type)) {
    if (event.type === "landmark") {
      setMessage(`${event.title || "This landmark"} is a known waypoint.`);
      return;
    }
    setMessage(`${eventLabel(event)} is already under your banner.`);
    return;
  }
  if (event.type === "town") return townEvent(key, event);
  if (event.type === "npc") return npcEvent(key, event);
  if (event.type === "mine") return mineEvent(key, event);
  if (event.type === "chest") return chestEvent(key, event);
  if (event.type === "landmark") return landmarkEvent(key, event);
  if (event.type === "battle" || event.type === "final") return battleEvent(key, event);
}

function advanceRoamingHeroes() {
  state.enemyHeroes ??= createDefaultEnemyHeroes();
  state.enemyHeroes.forEach((hero) => {
    const definition = roamingHeroDefinitions[hero.id];
    if (!definition || hero.defeated) return;
    const distance = Math.abs(hero.x - state.x) + Math.abs(hero.y - state.y);
    if (distance <= 5) {
      stepRoamingHeroToward(hero, state.x, state.y);
      return;
    }
    const patrol = definition.patrol || [[definition.x, definition.y]];
    const target = patrol[hero.patrolIndex % patrol.length];
    if (hero.x === target[0] && hero.y === target[1]) {
      hero.patrolIndex = (hero.patrolIndex + 1) % patrol.length;
    }
    const next = patrol[hero.patrolIndex % patrol.length];
    stepRoamingHeroToward(hero, next[0], next[1]);
  });
}

function stepRoamingHeroToward(hero, targetX, targetY) {
  const dxTotal = Math.abs(targetX - hero.x);
  const dyTotal = Math.abs(targetY - hero.y);
  const options = dxTotal >= dyTotal
    ? [[Math.sign(targetX - hero.x), 0], [0, Math.sign(targetY - hero.y)]]
    : [[0, Math.sign(targetY - hero.y)], [Math.sign(targetX - hero.x), 0]];
  for (const [dx, dy] of options.filter(([dx, dy]) => dx || dy)) {
    const nx = hero.x + dx;
    const ny = hero.y + dy;
    if (!isBlocked(nx, ny) && !events.has(`${nx},${ny}`)) {
      if (dx < 0) hero.facing = "left";
      if (dx > 0) hero.facing = "right";
      hero.x = nx;
      hero.y = ny;
      return;
    }
  }
}

function checkRoamingHeroContact() {
  const hero = activeRoamingHeroAt(state.x, state.y) || state.enemyHeroes?.find((item) => !item.defeated && Math.abs(item.x - state.x) + Math.abs(item.y - state.y) <= 1);
  if (!hero) return;
  const definition = roamingHeroDefinitions[hero.id];
  if (!definition) return;
  setMessage(`${definition.name} challenges your army.`);
  startBattle(`roaming-${hero.id}`, { type: "roamingHero", roamingHeroId: hero.id, encounter: definition.encounter, reward: definition.reward }, createEnemyParty(definition.encounter));
}

function activeRoamingHeroAt(x, y) {
  return state.enemyHeroes?.find((hero) => !hero.defeated && hero.x === x && hero.y === y);
}

function randomTravelLine() {
  const lines = [
    "Scouts report movement beyond the trees.",
    "The road bends toward old banners and buried coins.",
    "Your creatures are ready for the next skirmish.",
    "A wind from the fortress carries a challenge.",
  ];
  return lines[(state.day + state.x + state.y) % lines.length];
}

function npcEvent(key, event) {
  const quest = npcQuests[event.quest];
  if (!quest) return;
  state.quests ??= {};
  const status = state.quests[event.quest] || "new";
  if (status === "claimed") {
    setMessage(`${quest.name}: The realm remembers your help.`);
    openModal(quest.name, `"You have already done more than I asked. Keep the daylight moving."`, [
      { label: "Continue", action: () => renderAll() },
    ]);
    return;
  }
  if (status === "accepted" && quest.complete()) {
    quest.reward();
    state.quests[event.quest] = "claimed";
    setMessage(`${quest.title} completed. ${quest.rewardText}.`);
    openModal(quest.title, `${quest.name} smiles. "You kept your word." Reward: ${quest.rewardText}.`, [
      { label: "Collect", action: () => renderAll() },
    ]);
    return;
  }
  if (status === "accepted") {
    setMessage(`${quest.title}: ${quest.objective}.`);
    openModal(quest.title, `${quest.dialogue}\n\nProgress: ${quest.objective}. Reward: ${quest.rewardText}.`, [
      { label: "Continue", action: () => renderAll() },
    ]);
    return;
  }
  openModal(quest.name, `${quest.dialogue}\n\nQuest: ${quest.objective}. Reward: ${quest.rewardText}.`, [
    {
      label: "Accept Quest",
      action: () => {
        state.quests[event.quest] = "accepted";
        setMessage(`${quest.title} accepted: ${quest.objective}.`);
        renderAll();
      },
    },
    { label: "Maybe Later", secondary: true, action: () => renderAll() },
  ]);
}

function beginNight() {
  if (state.won) return;
  if (modalOpen && modalTitle.textContent !== "Nightfall") return;
  heldKeys.clear();
  if (!activeNight) {
    activeNight = createNightState(state.nightPlan || "holdfast");
  }
  openModal("Nightfall", nightfallMarkup(), [
    { label: "Make Camp", action: () => startNextNightEncounter() },
  ], { html: true, className: "night-modal", onRender: bindNightfallModal });
}

function createNightState(plan = "holdfast") {
  const encounters = buildNightEncounters(plan);
  return {
    day: state.day,
    plan,
    encounters,
    index: 0,
    awaitingResult: false,
    report: createNightReport(plan, encounters),
  };
}

function createNightReport(planId, encounters) {
  const plan = nightPlanDefinitions[planId] || nightPlanDefinitions.holdfast;
  const campBuilt = Object.entries(campUpgradeDefinitions)
    .filter(([id]) => state.campUpgrades?.[id])
    .map(([id, upgrade]) => ({ id, name: upgrade.name }));
  return {
    day: state.day,
    planId,
    planName: plan.name,
    wavesPlanned: encounters.length,
    wavesCleared: 0,
    campBuilt,
    startingMissingHp: totalPartyMissingHp(),
    preDawnMissingHp: 0,
    postDawnMissingHp: 0,
    preDawnGold: state.gold,
    postDawnGold: state.gold,
    holdfastRecovery: 0,
    healerFireRecovery: 0,
    dawnRecovery: 0,
    dawnHealing: 0,
    raidBonus: 0,
    trapDamageTotal: 0,
    income: { total: 0, mines: 0, towns: 0, routes: 0, text: "" },
    scoutingTarget: null,
    scoutingText: "",
  };
}

function currentNightPlanId() {
  return activeNight?.plan || state.nightPlan || "holdfast";
}

function currentNightPlan() {
  return nightPlanDefinitions[currentNightPlanId()] || nightPlanDefinitions.holdfast;
}

function setNightPlan(id) {
  if (!nightPlanDefinitions[id]) return beginNight();
  state.nightPlan = id;
  activeNight = createNightState(id);
  setMessage(`Night plan set: ${nightPlanDefinitions[id].name}.`);
  beginNight();
}

function buildNightEncounters(planId = currentNightPlanId()) {
  const tier = campaignDifficultyTier();
  const watchtowerReduction = state.campUpgrades?.watchtower ? 1 : 0;
  const nightRaid = planId === "nightRaid" ? 1 : 0;
  const holdfastReduction = planId === "holdfast" ? 1 : 0;
  const count = Math.max(1, Math.min(4, NIGHT_ENCOUNTER_MIN + Math.floor(Math.random() * (NIGHT_ENCOUNTER_MAX - NIGHT_ENCOUNTER_MIN + 1)) + (tier.rank >= 2 ? 1 : 0) + nightRaid - watchtowerReduction - holdfastReduction));
  const partyLevel = averagePartyLevel();
  return Array.from({ length: count }, (_, index) => {
    const difficulty = partyLevel + Math.floor((state.day - 1) / 2) + index + (planId === "nightRaid" ? 1 : 0) - (planId === "holdfast" ? 1 : 0);
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
  const tier = campaignDifficultyTier();
  const level = Math.max(1, Math.round(difficulty));
  const scale = Math.max(0, level - 1);
  const hp = base.hp + scale * 5 + index * 3;
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
    partySize: desiredEnemyPartySize(encounterId, { night: true, tier }),
    difficultyTier: tier,
    sourceEncounter: encounterId,
  };
}

function startNextNightEncounter() {
  if (!activeNight) return beginNight();
  const enemy = activeNight.encounters[activeNight.index];
  if (!enemy) return finishNight();
  return openNightWaveModal(enemy);
}

function openNightWaveModal(enemy) {
  const remaining = activeNight.encounters.length - activeNight.index;
  const partySize = enemy.partySize || 1;
  openModal("Camp Defense", nightWaveMarkup(enemy, remaining, partySize), [
    { label: "Ambush!", action: () => launchNightBattle(enemy) },
  ], { html: true, className: "night-modal", onRender: () => armNightWaveAutoStart(enemy) });
  modalActions.hidden = true;
}

function armNightWaveAutoStart(enemy) {
  const totalTravelMs = nightWaveTravelMs(enemy.partySize || 1);
  window.setTimeout(() => {
    if (!activeNight || activeNight.awaitingResult || !modal.open || modalTitle.textContent !== "Camp Defense") return;
    launchNightBattle(enemy);
  }, totalTravelMs);
}

function nightWaveTravelMs(partySize) {
  const attackers = Math.min(5, Math.max(1, partySize || 1));
  return NIGHT_WAVE_SNEAK_MS + (attackers - 1) * NIGHT_WAVE_STAGGER_MS + NIGHT_WAVE_TRIGGER_BUFFER_MS;
}

function launchNightBattle(enemy) {
  activeNight.awaitingResult = true;
  if (state.campUpgrades?.healerFire) {
    const restored = recoverPartyDetailed(Math.max(6, Math.round(state.hero.maxHp * 0.16)));
    if (activeNight?.report) activeNight.report.healerFireRecovery += restored;
  }
  if (activeNight?.plan === "holdfast") {
    const restored = recoverPartyDetailed(Math.max(4, Math.round(state.hero.maxHp * 0.08)));
    if (activeNight?.report) activeNight.report.holdfastRecovery += restored;
  }
  setMessage(`Night ${activeNight.index + 1}/${activeNight.encounters.length}: ${enemy.name} reaches camp under the ${currentNightPlan().name} plan.`);
  startBattle(`night-${activeNight.day}-${activeNight.index}`, { type: "night", encounter: enemy.sourceEncounter }, enemy);
}

function nightWaveMarkup(enemy, remaining, partySize) {
  const sprite = enemyWaveSpriteUrl(enemy);
  const attackerCount = Math.min(5, partySize);
  const plan = currentNightPlan();
  const attackers = Array.from({ length: Math.min(5, partySize) }, (_, index) => sprite
    ? `<img src="${sprite}" alt="" style="--i:${index};--delay:${index * NIGHT_WAVE_STAGGER_MS}ms;--sneak-ms:${NIGHT_WAVE_SNEAK_MS}ms" />`
    : `<i style="--i:${index};--delay:${index * NIGHT_WAVE_STAGGER_MS}ms;--sneak-ms:${NIGHT_WAVE_SNEAK_MS}ms"></i>`).join("");
  return `
    <div class="night-wave">
      <div class="camp-scene" aria-label="Night camp under attack">
        <div class="night-sky"><span></span><span></span><span></span></div>
        <img class="camp-art" src="assets/night-camp-defense.png" alt="" />
        <div class="camp-attackers">${attackers}</div>
      </div>
      <div class="night-prep-banner">
        <strong>${plan.name}</strong>
        <span>${nightWavePlanLead(plan.id || currentNightPlanId())}</span>
      </div>
      <div class="night-defense-strip">
        ${nightDefenseEffectPills().map((item) => `<span>${item}</span>`).join("")}
      </div>
      <p><strong>Wave ${activeNight.index + 1}/${activeNight.encounters.length}</strong>: shadows sneak toward the tent. Battle waits until the last of the ${attackerCount} raiders reaches camp.</p>
      <p>${remaining} wave${remaining === 1 ? "" : "s"} remain before dawn. ${escapeHtml(enemy.name)} waits in the dark.</p>
      <p><strong>Night plan</strong>: ${plan.name}. ${plan.text}</p>
      ${campUpgradeSummary()}
    </div>
  `;
}

function enemyWaveSpriteUrl(enemy) {
  const visual = enemyVisualForEncounter(enemy.sourceEncounter || spriteNameForEnemy(enemy));
  if (!visual) return "";
  if (visual.source === "enemy") return getEnemyPortraitDataUrl(visual.id);
  if (visual.source === "unit") return getUnitPortraitDataUrl(visual.id);
  if (visual.source === "character") return getPortraitDataUrl(visual.id);
  return "";
}

function nightfallMarkup() {
  const currentPlanId = currentNightPlanId();
  const currentPlan = currentNightPlan();
  const campBuilt = Object.entries(campUpgradeDefinitions).filter(([id]) => state.campUpgrades?.[id]).map(([, upgrade]) => upgrade.name);
  return `
    <div class="night-wave">
      <div class="nightfall-head">
        <strong>Night Watch</strong>
        <p>Day ${state.day} ends. Hold the camp through ${activeNight.encounters.length} wave${activeNight.encounters.length === 1 ? "" : "s"} before dawn.</p>
      </div>
      <div class="night-summary-bar">
        <span><small>Waves</small><strong>${activeNight.encounters.length}</strong></span>
        <span><small>Plan</small><strong>${currentPlan.name}</strong></span>
        <span><small>Camp</small><strong>${campBuilt.length ? campBuilt.length : "Basic"}</strong></span>
      </div>
      <div class="night-plan-banner">
        <strong>${currentPlan.name}</strong>
        <span>${currentPlan.text}</span>
      </div>
      <div class="night-section">
        <div class="night-section-head">
          <h3>Night Plans</h3>
          <p class="night-section-note">Choose the camp posture before the first wave reaches the tent.</p>
        </div>
        <div class="camp-upgrade-list night-plan-list">${Object.entries(nightPlanDefinitions).map(([id, plan]) => nightPlanCard(id, plan, currentPlanId)).join("")}</div>
      </div>
      <div class="night-section">
        <div class="night-section-head">
          <h3>Camp Prep</h3>
          <p class="night-section-note">${campBuilt.length ? `Built tonight: ${campBuilt.join(", ")}.` : "No camp structures built yet."}</p>
        </div>
        <div class="camp-upgrade-list">${Object.entries(campUpgradeDefinitions).map(([id, upgrade]) => campUpgradeCard(id, upgrade)).join("")}</div>
      </div>
    </div>
  `;
}

function nightPlanCard(id, plan, currentPlanId = currentNightPlanId()) {
  const selected = currentPlanId === id;
  return `<div class="camp-upgrade night-plan-card ${selected ? "owned selected" : ""}">
    <div class="camp-upgrade-topline">
      <strong>${plan.name}</strong>
      <span>${selected ? "Current Plan" : "Available"}</span>
    </div>
    <div class="night-card-tags">${nightPlanEffectTags(id).map((tag) => `<em>${tag}</em>`).join("")}</div>
    <p>${plan.text}</p>
    <button type="button" class="night-card-button ${selected ? "selected" : ""}" data-night-plan="${id}"${selected ? " disabled" : ""}>${selected ? "Selected for tonight" : `Use ${plan.name}`}</button>
  </div>`;
}

function campUpgradeSummary() {
  const owned = Object.entries(campUpgradeDefinitions).filter(([id]) => state.campUpgrades?.[id]).map(([, upgrade]) => upgrade.name);
  return `<p><strong>Camp</strong>: ${owned.length ? owned.join(", ") : "Basic tent"}</p><p><strong>Posture</strong>: ${currentNightPlan().name}</p>`;
}

function nightWavePlanLead(planId) {
  return {
    holdfast: "Shields stay close, the fire burns low, and the warband braces for a steady defense.",
    nightRaid: "Scouts pushed deep into the dark, so the camp meets a fiercer answer at the tent line.",
    scoutLines: "Outriders keep moving beyond the firelight, feeding the camp a steadier picture of the road.",
  }[planId] || currentNightPlan().text;
}

function nightDefenseEffectPills() {
  const pills = [];
  if (currentNightPlanId() === "holdfast") pills.push("Hold Fast: extra recovery before battle");
  if (currentNightPlanId() === "nightRaid") pills.push("Night Raid: bonus dawn gold if camp holds");
  if (currentNightPlanId() === "scoutLines") pills.push("Scout Lines: dawn reveals the next target");
  if (state.campUpgrades?.watchtower) pills.push("Watchtower: one fewer wave when possible");
  if (state.campUpgrades?.traps) pills.push("Stake Traps: first raider weakened");
  if (state.campUpgrades?.healerFire) pills.push("Healer Fire: party restored before each wave");
  if (state.campUpgrades?.betterTent) pills.push("Better Tent: stronger dawn recovery");
  if (!pills.length) pills.push("Basic camp: no extra defenses");
  return pills.slice(0, 4);
}

function campUpgradeCard(id, upgrade) {
  const owned = Boolean(state.campUpgrades?.[id]);
  const affordable = state.gold >= upgrade.cost;
  return `<div class="camp-upgrade ${owned ? "owned" : affordable ? "ready" : ""}">
    <div class="camp-upgrade-topline">
      <strong>${upgrade.name}</strong>
      <span>${owned ? "Built" : `${upgrade.cost} gold`}</span>
    </div>
    <div class="night-card-tags">${campUpgradeEffectTags(id).map((tag) => `<em>${tag}</em>`).join("")}</div>
    <p>${upgrade.text}</p>
    <button type="button" class="night-card-button" data-camp-upgrade="${id}"${owned || !affordable ? " disabled" : ""}>${owned ? "Built" : affordable ? `Build ${upgrade.name}` : `Need ${upgrade.cost} gold`}</button>
  </div>`;
}

function nightPlanEffectTags(id) {
  return {
    holdfast: ["Safer rest", "Fewer waves", "Steadier recovery"],
    nightRaid: ["Harder waves", "Bonus dawn gold", "High pressure"],
    scoutLines: ["Balanced defense", "Dawn scouting", "Target revealed"],
  }[id] || [];
}

function campUpgradeEffectTags(id) {
  return {
    betterTent: ["More dawn healing", "Safer camp"],
    watchtower: ["One fewer wave", "Early warning"],
    traps: ["Weakens first raider", "Every wave"],
    healerFire: ["Pre-wave healing", "Party sustain"],
  }[id] || [];
}

function bindNightfallModal() {
  modalText.querySelectorAll("[data-night-plan]").forEach((button) => {
    button.addEventListener("click", () => {
      const { nightPlan } = button.dataset;
      if (!nightPlan || button.disabled) return;
      setNightPlan(nightPlan);
    });
  });
  modalText.querySelectorAll("[data-camp-upgrade]").forEach((button) => {
    button.addEventListener("click", () => {
      const { campUpgrade } = button.dataset;
      if (!campUpgrade || button.disabled) return;
      buildCampUpgrade(campUpgrade);
    });
  });
}

function buildCampUpgrade(id) {
  const upgrade = campUpgradeDefinitions[id];
  if (!upgrade) return beginNight();
  if (state.gold < upgrade.cost) {
    setMessage(`${upgrade.name} costs ${upgrade.cost} gold.`);
    activeNight = null;
    return beginNight();
  }
  state.gold -= upgrade.cost;
  state.campUpgrades ??= {};
  state.campUpgrades[id] = true;
  activeNight = null;
  setMessage(`${upgrade.name} built. Tonight's camp is now better prepared.`);
  renderAll();
  beginNight();
}

function continueNightAfterBattle() {
  if (!activeNight) return renderAll();
  if (activeNight.report) activeNight.report.wavesCleared = Math.max(activeNight.report.wavesCleared, activeNight.index + 1);
  activeNight.awaitingResult = false;
  activeNight.index += 1;
  if (activeNight.index >= activeNight.encounters.length) return finishNight();
  const next = activeNight.encounters[activeNight.index];
  openModal("Night Watch", `${next.name} is moving in the dark. ${activeNight.encounters.length - activeNight.index} encounter${activeNight.encounters.length - activeNight.index === 1 ? "" : "s"} remain before dawn.`, [
    { label: "Stand Guard", action: () => startNextNightEncounter() },
  ]);
}

function finishNight() {
  const nightState = activeNight;
  const completedDay = nightState?.day || state.day;
  const planId = nightState?.plan || state.nightPlan || "holdfast";
  const report = nightState?.report || createNightReport(planId, nightState?.encounters || []);
  report.preDawnGold = state.gold;
  report.preDawnMissingHp = totalPartyMissingHp();
  activeNight = null;
  state.day += 1;
  state.dayProgress = 0;
  state.nightReady = false;
  const economy = collectTownIncome();
  report.income = { total: economy.total || 0, mines: economy.mines || 0, towns: economy.towns || 0, routes: economy.routes || 0, text: economy.text || "" };
  const dawnRecovery = Math.max(8, Math.round(state.hero.maxHp * (planId === "holdfast" ? 0.47 : 0.35)));
  report.dawnRecovery = dawnRecovery;
  report.dawnHealing = recoverPartyDetailed(dawnRecovery);
  if (planId === "nightRaid") {
    const raidBonus = 24 + completedDay * 8;
    state.gold += raidBonus;
    report.raidBonus = raidBonus;
  } else if (planId === "scoutLines") {
    const target = nearestScoutingTarget();
    if (target) {
      state.scoutMarker = target.key;
      const label = target.event.type === "town" ? target.event.name : target.event.type === "chest" ? "a relic chest" : "a hostile outpost";
      report.scoutingTarget = { key: target.key, label, x: target.x, y: target.y };
      report.scoutingText = `Scouts marked ${label} at ${target.x},${target.y}.`;
    } else {
      report.scoutingText = "Scouts reported no urgent targets beyond your current map.";
    }
  }
  report.postDawnGold = state.gold;
  report.postDawnMissingHp = totalPartyMissingHp();
  setMessage(`Dawn breaks on day ${state.day}. Camp survived night ${completedDay} under the ${nightPlanDefinitions[planId].name} plan.`);
  openModal("Dawn", dawnMarkup(report), [
    { label: "Continue", action: () => renderAll() },
  ], { html: true, className: "night-modal dawn-modal" });
}

function dawnMarkup(report) {
  const campNames = report.campBuilt.map((item) => item.name);
  const campStatus = campNames.length ? `${campNames.length} structures held through the night.` : "The basic camp held until sunrise.";
  const planPayoff = dawnPlanPayoffMarkup(report);
  const totalRecovery = report.healerFireRecovery + report.holdfastRecovery + report.dawnHealing;
  const economyCards = [
    { label: "Raid Spoils", value: `${report.raidBonus} gold`, note: report.raidBonus ? "Night riders returned with extra coin." : "No raid income this dawn." },
    { label: "Town Income", value: `${report.income.total} gold`, note: report.income.total ? `${report.income.mines} mines, ${report.income.towns} towns, ${report.income.routes} trade.` : "No realm income collected this dawn." },
    { label: "Recovery", value: `${totalRecovery} HP`, note: `${report.healerFireRecovery} pre-wave, ${report.holdfastRecovery} holdfast, ${report.dawnHealing} dawn rest.` },
    { label: "Camp Damage", value: `${report.trapDamageTotal} HP`, note: report.trapDamageTotal ? "Stake Traps bloodied the first raider in each wave." : "No trap damage contributed overnight." },
  ];
  return `
    <div class="night-wave dawn-report">
      <div class="dawn-hero">
        <strong>Dawn on Day ${state.day}</strong>
        <p>${escapeHtml(dawnLeadLine(report))}</p>
      </div>
      <div class="night-summary-bar dawn-summary-bar">
        <span><small>Waves Held</small><strong>${report.wavesCleared}/${report.wavesPlanned}</strong></span>
        <span><small>Plan</small><strong>${escapeHtml(report.planName)}</strong></span>
        <span><small>Camp Status</small><strong>${campNames.length ? "Standing" : "Basic"}</strong></span>
      </div>
      <div class="dawn-payoff-panel">
        <strong>Plan Payoff</strong>
        <span>${planPayoff}</span>
      </div>
      <div class="dawn-reward-grid">
        ${economyCards.map((item) => `<article><small>${item.label}</small><strong>${item.value}</strong><p>${item.note}</p></article>`).join("")}
      </div>
      <div class="dawn-camp-state">
        <strong>Camp State</strong>
        <p>${campStatus}</p>
        <div class="night-defense-strip">
          ${(campNames.length ? campNames : ["Basic Tent"]).map((name) => `<span>${escapeHtml(name)}</span>`).join("")}
        </div>
      </div>
      ${report.scoutingText ? `<div class="dawn-scouting"><strong>Scouting</strong><p>${escapeHtml(report.scoutingText)}</p></div>` : ""}
      <p><strong>Gold at sunrise</strong>: ${report.postDawnGold}. <strong>Missing party HP</strong>: ${report.postDawnMissingHp}.</p>
    </div>
  `;
}

function dawnLeadLine(report) {
  if (report.planId === "nightRaid" && report.raidBonus) return `The warband broke the dark line and came home richer. ${report.raidBonus} gold arrived with the sunrise.`;
  if (report.planId === "scoutLines") return report.scoutingText || "Outriders kept the roads watched until first light.";
  if (report.planId === "holdfast") return `The camp held fast. ${report.holdfastRecovery + report.dawnHealing} HP came back through discipline and dawn rest.`;
  return "The camp held through the night and the army greets a steadier dawn.";
}

function dawnPlanPayoffMarkup(report) {
  if (report.planId === "nightRaid") return report.raidBonus ? `Night Raid paid off with <strong>${report.raidBonus} bonus gold</strong> after the camp held.` : "Night Raid drew pressure, but no extra spoils arrived.";
  if (report.planId === "scoutLines") return escapeHtml(report.scoutingText || "Scout Lines kept the roads watched, but no clear target stood out.");
  if (report.planId === "holdfast") return `Hold Fast restored <strong>${report.holdfastRecovery}</strong> HP before the waves and <strong>${report.dawnHealing}</strong> more at dawn.`;
  return "The camp plan carried the warband safely into the next day.";
}

function abandonNightAfterDefeat() {
  activeNight = null;
  state.day += 1;
  state.dayProgress = 0;
  state.nightReady = false;
}

function eventLabel(event) {
  if (event.type === "town") return event.name;
  if (event.type === "npc") return npcQuests[event.quest]?.name || "This traveler";
  if (event.type === "mine") return "This mine";
  if (event.type === "chest") return "This treasure";
  if (event.type === "battle") return "This outpost";
  if (event.type === "landmark") return event.title || "This landmark";
  return "This place";
}

function landmarkFlavor(event) {
  if (event.landmark === "signpost") return `${event.title || "The signpost"} points the way ahead. Fresh paint marks the safer road and warns that the darker trail leads toward trouble.`;
  if (event.landmark === "ruins") return `${event.title || "The ruins"} still watch the road. Broken stone and old ash suggest this route has been contested for years.`;
  if (event.landmark === "camp") return `${event.title || "The camp"} is warm but abandoned. The embers are recent enough to suggest travelers or raiders passed through not long ago.`;
  if (event.landmark === "statue") return `${event.title || "The monument"} rises over the road, reminding every army marching past that someone else once tried to rule this ground.`;
  return `${event.title || "The landmark"} breaks the road's monotony.`;
}

function landmarkEvent(key, event) {
  const firstVisit = !state.visited[key];
  state.visited[key] = true;
  const text = landmarkFlavor(event);
  setMessage(firstVisit ? `Discovered ${event.title || "a landmark"}.` : `${event.title || "This landmark"} is familiar now.`);
  openModal(event.title || "Landmark", text, [
    { label: firstVisit ? "Mark Route" : "Continue", action: () => renderAll() },
  ]);
}

function townClaimCost(event) {
  const baseCost = 75 + (townFaction(event).units.length - 1) * 20 + state.hero.level * 10;
  return Math.round(baseCost * economyDiscountMultiplier());
}

function townGuardEncounter(event) {
  const faction = event.faction || "grove";
  if (faction === "forge") return "knight";
  if (faction === "tide") return "tideGuard";
  if (faction === "dusk") return "warlock";
  return "raiders";
}

function townEvent(key, event) {
  const town = getTownState(key);
  const creature = creatureBook[event.creature];
  const owned = recruitableUnitsForTown(event).some((id) => state.party.some((unit) => unit.id === id));
  const cost = recruitCostForTown(event.creature, event);
  const actions = [];
  if (town.owner !== "player") {
    const claimCost = townClaimCost(event);
    actions.push({
      label: `Buy Claim ${claimCost}`,
      action: () => {
        if (state.gold < claimCost) {
          setMessage(`${event.name} requires ${claimCost} gold or a battle for control.`);
          reopenTownModal(key, event);
          return;
        }
        state.gold -= claimCost;
        town.owner = "player";
        state.visited[key] = true;
        setMessage(`${event.name} accepts your charter for ${claimCost} gold.`);
        renderAll();
        reopenTownModal(key, event);
      },
    });
    actions.push({
      label: "Fight Guard",
      action: () => startBattle(key, { type: "townClaim", encounter: townGuardEncounter(event), townKey: key, townName: event.name }, createEnemyParty(townGuardEncounter(event))),
    });
  }
  actions.push({ label: "Leave", secondary: true, action: () => {
    setMessage(`You leave ${event.name}.`);
    renderAll();
  } });
  openModal(event.name, townModalMarkup(key, event, town, creature, cost, owned), actions, { html: true, className: "town-modal", onRender: () => bindTownModal(key, event) });
}

function reopenTownModal(key, event) {
  window.setTimeout(() => {
    if (!activeBattle && !activeNight) townEvent(key, event);
  }, 0);
}

function reopenTownNoticeBoard(key, event) {
  window.setTimeout(() => {
    if (!activeBattle && !activeNight) openTownCommissionModal(key, event);
  }, 0);
}

function openTownCommissionModal(key, event) {
  state.quests ??= {};
  const entries = Object.entries(townCommissionDefinitions);
  openModal("Town Notice Board", townNoticeBoardMarkup(event, entries), [
    { label: "Back", secondary: true, action: () => reopenTownModal(key, event) },
  ], { html: true, className: "notice-modal", onRender: () => bindTownNoticeBoard(key, event) });
}

function townNoticeBoardMarkup(event, entries) {
  const cards = entries.map(([id, quest]) => {
    const status = state.quests?.[id] || "new";
    const ready = status === "accepted" && quest.complete();
    const claimed = status === "claimed";
    const tone = claimed ? "claimed" : ready ? "ready" : status === "accepted" ? "active" : "new";
    const label = claimed ? "Complete" : ready ? "Reward ready" : status === "accepted" ? "In progress" : "Available";
    const action = claimed ? "Already paid." : ready ? "Claim this reward now." : status === "accepted" ? "Keep working, then return here." : "Accept this job now.";
    const buttonLabel = claimed ? "Done" : ready ? "Claim Reward" : status === "accepted" ? "View Objective" : "Accept Job";
    const disabled = claimed ? " disabled" : "";
    return `
      <article class="notice-job ${tone}">
        <span class="notice-pin"></span>
        <strong>${quest.title}</strong>
        <em>${label}</em>
        <p>${quest.objective}</p>
        <small>Reward: ${quest.rewardText}. ${action}</small>
        <button type="button" data-notice-job="${id}"${disabled}>${buttonLabel}</button>
      </article>
    `;
  }).join("");
  return `
    <div class="notice-board-panel">
      <div class="notice-board-art">
        <img src="assets/town-notice-board-banner.png" alt="" />
        <div>
          <strong>${escapeHtml(event.name)} Notice Board</strong>
          <span>Local contracts are optional jobs. Accept one, complete its condition during play, then return here to claim the reward.</span>
        </div>
      </div>
      <div class="notice-board-guide">
        <span><b>Available</b> can be accepted now</span>
        <span><b>In progress</b> tracks in the quest log</span>
        <span><b>Reward ready</b> can be claimed below</span>
      </div>
      <div class="notice-job-grid">${cards}</div>
    </div>
  `;
}

function bindTownNoticeBoard(key, event) {
  modalText.querySelectorAll("[data-notice-job]").forEach((button) => {
    button.addEventListener("click", () => handleTownCommissionAction(key, event, button.dataset.noticeJob));
  });
}

function handleTownCommissionAction(key, event, id) {
  const quest = townCommissionDefinitions[id];
  if (!quest) return;
  const status = state.quests?.[id] || "new";
  const ready = status === "accepted" && quest.complete();
  const claimed = status === "claimed";
  if (claimed) {
    setMessage(`${quest.title} is already complete.`);
    reopenTownNoticeBoard(key, event);
    return;
  }
  if (ready) {
    quest.reward();
    state.quests[id] = "claimed";
    setMessage(`${quest.title} complete. Reward: ${quest.rewardText}.`);
    renderAll();
    reopenTownNoticeBoard(key, event);
    return;
  }
  if (status === "accepted") {
    setMessage(`${quest.title}: ${quest.objective}.`);
    reopenTownNoticeBoard(key, event);
    return;
  }
  state.quests[id] = "accepted";
  setMessage(`${quest.title} accepted: ${quest.objective}.`);
  renderAll();
  reopenTownNoticeBoard(key, event);
}

function getTownState(key) {
  state.towns ??= {};
  state.towns[key] ??= { owner: "neutral", buildings: [] };
  state.towns[key].buildings ??= [];
  state.towns[key].usedActions ??= {};
  return state.towns[key];
}

function defaultTownSelection(key, event) {
  const town = getTownState(key);
  const builtBuildings = Object.keys(townBuildingDefinitions).filter((id) => town.buildings.includes(id));
  const readyBuilding = builtBuildings.find((id) => {
    if (id === "caravanPost") return true;
    return !isTownActionUsed(town, id);
  });
  if (readyBuilding) return `building:${readyBuilding}`;
  const affordableRecruit = recruitableUnitsForTown(event).find((id) => {
    const unit = creatureBook[id];
    if (!unit) return false;
    const primary = id === event.creature;
    const existing = partyUnitForId(id);
    if (!primary && !town.buildings.includes("barracks")) return false;
    if (existing && isTownActionUsed(town, `upgrade:${id}`)) return false;
    if (!existing && !primary && isTownActionUsed(town, "barracks")) return false;
    const cost = existing ? townUpgradeCostForUnit(id, event) : recruitCostForTown(id, event);
    return state.gold >= cost;
  });
  if (affordableRecruit) return `recruit:${affordableRecruit}`;
  return town.owner === "player" ? "building:market" : "building:barracks";
}

function getTownSelection(key, event) {
  const town = getTownState(key);
  town.selection ??= defaultTownSelection(key, event);
  return town.selection;
}

function setTownSelection(key, event, selection, preview = true) {
  const town = getTownState(key);
  town.selection = selection;
  syncTownSelectionUi(selection);
  if (!preview) return;
  const [kind, id] = String(selection || "").split(":");
  if (kind === "building" && id) previewTownBuilding(key, event, id);
  if (kind === "recruit" && id) previewTownRecruit(key, event, id);
}

function syncTownSelectionUi(selection) {
  modalText.querySelectorAll(".town-yard-slot, .town-recruit-card").forEach((node) => {
    const current = node.dataset.townBuilding
      ? `building:${node.dataset.townBuilding}`
      : node.dataset.townRecruit
        ? `recruit:${node.dataset.townRecruit}`
        : "";
    node.classList.toggle("selected", current === selection);
  });
}

function townDescription(event, town, creature, cost, ownsCreature) {
  const owner = town.owner === "player" ? "Your town" : "Neutral town";
  const buildings = town.buildings.length ? town.buildings.map((id) => townBuildingDefinitions[id]?.name || id).join(", ") : "None";
  const recruit = ownsCreature ? `${creature.name} already travels with you.` : `${creature.name} can join for ${cost} gold.`;
  return `${owner}. Buildings: ${buildings}. ${recruit} Current gold: ${state.gold}.`;
}

function townModalMarkup(key, event, town, creature, cost, ownsCreature) {
  const owner = town.owner === "player" ? "Your town" : "Neutral town";
  const faction = townFaction(event);
  const recruit = ownsCreature ? `${faction.name} units already travel with you.` : `${creature.name} can join for ${cost} gold.`;
  const economy = townEconomyPreview();
  const income = town.owner === "player" ? economy.towns + economy.routes : 0;
  const builtCount = town.buildings.length;
  const recruitCount = recruitableUnitsForTown(event).length;
  const builtNames = town.buildings.length ? town.buildings.map((id) => townBuildingDefinitions[id]?.name || id).join(", ") : "No structures built yet";
  const selection = getTownSelection(key, event);
  const barracksIntro = town.owner !== "player"
    ? `Claim ${event.name} before recruiting units.`
    : town.buildings.includes("barracks")
      ? `${faction.name} roster ready. Recruit local units or train veterans here.`
      : `${creature.name} can join now. Build Barracks to unlock the full ${faction.name} roster.`;
  return `
    <div class="town-view">
      <div class="town-overview">
        <div class="town-left">
          <div class="town-yard ${town.owner === "player" ? "owned" : "neutral"}" aria-label="${event.name} town yard">
            <div class="town-yard-hall" aria-hidden="true"><img src="${townSpriteDataUrl("ownedTown", town.owner === "player")}" alt="" /></div>
            ${townYardSprite("market", "market", town.buildings.includes("market"), town, "market", true, selection === "building:market")}
            ${townYardSprite("caravanPost", "caravan-post", town.buildings.includes("caravanPost"), town, "caravanPost", true, selection === "building:caravanPost")}
            ${townYardSprite("barracks", "barracks", town.buildings.includes("barracks"), town, "barracks", true, selection === "building:barracks")}
            ${townYardSprite("trainingYard", "training-yard", town.buildings.includes("trainingYard"), town, "trainingYard", true, selection === "building:trainingYard")}
          </div>
          <div class="town-building-list town-panel">
            <strong>Town Status</strong>
            ${Object.entries(townBuildingDefinitions).map(([id, building]) => townBuildingCard(id, building, town)).join("")}
          </div>
        </div>
        <div class="town-info">
          <div class="town-head">
            <div>
              <span class="town-kicker">${owner}</span>
              <h3>${event.name}</h3>
              <p>${faction.name}. ${recruit}</p>
            </div>
            <div class="town-summary">
              <span><small>Gold</small><strong>${state.gold}</strong></span>
              <span><small>Income</small><strong>${income}</strong></span>
              <span><small>Buildings</small><strong>${builtCount}/4</strong></span>
              <span><small>Units</small><strong>${recruitCount}</strong></span>
            </div>
          </div>
          <div class="town-desk town-panel">
            <strong>Town Command</strong>
            <span class="town-desk-line"><b>Control</b> ${owner}. ${town.owner === "player" ? "Your banner holds the square." : "The square is still neutral."}</span>
            <span class="town-desk-line"><b>Faction Perk</b> ${faction.perk}</span>
            <span class="town-desk-line"><b>Barracks</b> ${town.buildings.includes("barracks") ? `${faction.name} roster ready. Enter Barracks to recruit or train units.` : `Build Barracks to unlock the full ${faction.name} roster.`}</span>
            <span class="town-desk-line"><b>Local Unit</b> ${creature.name}${ownsCreature ? " already marches with you." : ` can join for ${cost} gold.`}</span>
            <span class="town-desk-line"><b>Built</b> ${builtNames}</span>
            <span class="town-desk-line"><b>Focus</b> Built plots act immediately. Empty owned plots show build-now costs in the square.</span>
            ${town.owner === "player" ? townCommandRailMarkup(key, event, town) : `<div class="town-claim-note">Claim ${event.name} before issuing town orders, building, or training units.</div>`}
            <div id="townFeedback" class="town-feedback">Select a building plot to inspect it. Built plots act immediately, and empty owned plots can be purchased from the square.</div>
          </div>
          <div class="town-recruit-list town-panel">
            <strong>Barracks Roster</strong>
            <p class="town-panel-note">${barracksIntro}</p>
            ${recruitableUnitsForTown(event).map((id) => townRecruitCard(key, event, town, id)).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function townCommandRailMarkup(key, event, town) {
  const actionId = townFactionActionId(event);
  const factionUsed = isTownActionUsed(town, actionId);
  return `
    <div class="town-command-rail">
      <button type="button" class="town-command-button" data-town-action="rest">Rest Party</button>
      <button type="button" class="town-command-button secondary" data-town-action="notice">Open Notice Board</button>
      <button type="button" class="town-command-button ${factionUsed ? "used" : ""}" data-town-action="faction"${factionUsed ? " disabled" : ""}>${factionUsed ? `${townFactionActionLabel(event)} Used` : townFactionActionLabel(event)}</button>
    </div>
  `;
}

function townFaction(event) {
  return townFactions[event.faction] || townFactions.grove;
}

function townFactionByKey(key) {
  const event = events.get(key);
  return event?.type === "town" ? townFaction(event) : townFactions.grove;
}

function nearestScoutingTarget() {
  const candidates = [];
  events.forEach((event, key) => {
    if (state.visited[key]) return;
    if (!["chest", "battle", "town"].includes(event.type)) return;
    const [x, y] = key.split(",").map(Number);
    const distance = Math.abs(x - state.x) + Math.abs(y - state.y);
    const priority = event.type === "chest" ? 0 : event.type === "town" ? 1 : 2;
    candidates.push({ key, event, x, y, distance, priority });
  });
  candidates.sort((a, b) => a.priority - b.priority || a.distance - b.distance);
  return candidates[0] || null;
}

function scoutingHintText() {
  const target = nearestScoutingTarget();
  if (!target) return "Scouts report no urgent landmarks nearby.";
  const label = target.event.type === "chest"
    ? "an unrecovered relic chest"
    : target.event.type === "town"
      ? `${target.event.name}, an unclaimed town`
      : "an active outpost";
  return `Scouts mark ${label} at ${target.x},${target.y}.`;
}

function townFactionActionId(event) {
  return `faction:${event.faction || "grove"}`;
}

function townFactionActionLabel(event) {
  if (event.faction === "forge") return "Run Forge Drills";
  if (event.faction === "tide") return "Dispatch Harbor Levy";
  if (event.faction === "dusk") return "Cast Moon Scry";
  return "Call Grove Blessing";
}

function townFactionActionDescription(event) {
  if (event.faction === "forge") return "Grant the whole warband bonus drill XP once today.";
  if (event.faction === "tide") return "Collect an immediate trade payout based on your realm.";
  if (event.faction === "dusk") return "Mark the nearest unrecovered target directly on the world map.";
  return "Restore the party, or brew a Healing Draught if everyone is already fit.";
}

function useTownFactionAction(key, event) {
  const town = getTownState(key);
  const actionId = townFactionActionId(event);
  if (town.owner !== "player") {
    setTownFeedback(`Claim ${event.name} before calling on its faction support.`, "warn");
    return;
  }
  if (isTownActionUsed(town, actionId)) {
    setTownFeedback(`${townFaction(event).name} has already answered your call today.`, "used");
    return;
  }
  let messageText = "";
  let messageType = "good";
  if (event.faction === "forge") {
    const xp = 24 + state.hero.level * 5;
    const report = gainXp(xp);
    const levelText = report.unitLevelUps.length ? ` ${report.unitLevelUps.length} unit${report.unitLevelUps.length === 1 ? "" : "s"} advanced.` : "";
    messageText = `${event.name}'s smiths run live drills. The warband gains ${xp} XP.${levelText}`;
    markTownActionUsed(town, actionId);
    if (report.heroLevels > 0) {
      setMessage(messageText);
      refreshTownModal(key, event, messageText, messageType);
      pendingPostBattleAction = () => reopenTownModal(key, event);
      openSkillChoice();
      return;
    }
  } else if (event.faction === "tide") {
    const bonus = 26 + ownedTownEntries().length * 10 + Math.max(0, state.day - 1) * 2;
    state.gold += bonus;
    messageText = `${event.name}'s harbor brokers return ${bonus} gold from priority cargo levies.`;
    markTownActionUsed(town, actionId);
  } else if (event.faction === "dusk") {
    const target = nearestScoutingTarget();
    if (!target) {
      messageText = `${event.name}'s moon seers find no urgent target beyond your current charts.`;
      messageType = "info";
    } else {
      state.scoutMarker = target.key;
      const label = target.event.type === "chest"
        ? "a relic chest"
        : target.event.type === "town"
          ? target.event.name
          : "a hostile outpost";
      messageText = `${event.name}'s moon seers pin ${label} to your war map at ${target.x},${target.y}.`;
    }
    markTownActionUsed(town, actionId);
  } else {
    const missing = totalMissingPartyHealth();
    if (missing > 0) {
      const amount = Math.max(10, Math.round(missing * 0.45));
      recoverParty(amount);
      const remaining = totalMissingPartyHealth();
      messageText = `${event.name}'s wardens call a Grove Blessing and restore ${amount} HP across the party.${remaining > 0 ? ` ${remaining} HP still needs mending.` : " The warband is fully restored."}`;
    } else {
      addInventoryItem("healingDraught", 1);
      messageText = `${event.name}'s herbalists answer the Grove Blessing with a Healing Draught. You now carry ${inventoryCount("healingDraught")} draught${inventoryCount("healingDraught") === 1 ? "" : "s"}.`;
    }
    markTownActionUsed(town, actionId);
  }
  refreshTownModal(key, event, messageText, messageType);
}

function recruitableUnitsForTown(event) {
  return townFaction(event).units.filter((id) => creatureBook[id]);
}

function recruitCostForTown(id, event = null) {
  const unit = creatureBook[id];
  const baseCost = 24 + (unit?.maxHp || 20) * 0.8 + (unit?.atk || 5) * 3.2 + state.hero.level * 5;
  const factionMultiplier = event?.faction === "grove" ? 0.9 : 1;
  return Math.round(baseCost * economyDiscountMultiplier() * factionMultiplier);
}

function partyUnitForId(id) {
  return state.party.find((unit) => unit.id === id);
}

function townUpgradeCostForUnit(id, event = null) {
  const unit = partyUnitForId(id);
  const baseRecruit = recruitCostForTown(id) / economyDiscountMultiplier();
  const factionMultiplier = event?.faction === "forge" ? 0.85 : 1;
  return Math.round((baseRecruit * 0.65 + (unit?.level || 1) * 10) * economyDiscountMultiplier() * factionMultiplier);
}

function economyDiscountMultiplier() {
  return state.hero.skills?.includes("Quartermaster") ? 0.9 : 1;
}

function townBuildingCost(building) {
  return Math.round((building?.cost || 0) * economyDiscountMultiplier());
}

function upgradePartyUnit(unit) {
  applyUnitLevelGrowth(unit);
}

function townRecruitCard(key, event, town, id) {
  const unit = creatureBook[id];
  const builtBarracks = town.buildings.includes("barracks");
  const primary = id === event.creature;
  const existing = partyUnitForId(id);
  const actionId = existing ? `upgrade:${id}` : "barracks";
  const unclaimed = town.owner !== "player";
  const locked = !primary && !builtBarracks;
  const used = existing ? isTownActionUsed(town, actionId) : builtBarracks && !primary && isTownActionUsed(town, "barracks");
  const partyFull = !existing && state.party.length >= MAX_PARTY_UNITS;
  const disabled = unclaimed || locked || used ? " disabled" : "";
  const badge = unclaimed
    ? "Claim first"
    : locked
      ? "Needs Barracks"
      : used
        ? "Used today"
        : partyFull && !existing
          ? "Replace required"
          : existing
            ? "Upgrade ready"
            : "Recruit ready";
  const tone = unclaimed || locked ? "warn" : used ? "used" : partyFull && !existing ? "info" : "good";
  const note = unclaimed ? "Claim town first" : locked ? "Needs Barracks" : used ? "Trained today" : existing ? `Upgrade ${townUpgradeCostForUnit(id, event)} gold` : partyFull ? `Replace ${recruitCostForTown(id, event)} gold` : `Recruit ${recruitCostForTown(id, event)} gold`;
  const role = unitRole(unit);
  const selected = getTownSelection(key, event) === `recruit:${id}` ? " selected" : "";
  return `
    <button type="button" class="town-recruit-card${selected}" data-town-recruit="${id}" aria-label="${unit.name}"${disabled}>
      <span class="recruit-dot" style="--unit-color:${unit.color}"></span>
      <span class="town-recruit-main"><b>${unit.name}</b><small>${role} / ${rangeText(unit)}</small><span class="town-card-tags"><i class="town-state-badge ${tone}">${badge}</i>${existing ? `<i class="town-state-badge neutral">Veteran</i>` : ""}</span></span>
      <em>${note}</em>
    </button>
  `;
}

function townYardSprite(sprite, slot, visible, town, buildingId, owned = true, selected = false) {
  const stateClass = visible ? "built" : "empty";
  const building = slot.replace(/-([a-z])/g, (_, chr) => chr.toUpperCase());
  const definition = townBuildingDefinitions[buildingId];
  const labelText = buildingId === "townHall" ? "Town Hall" : definition?.name || "Building";
  const used = visible && isTownActionUsed(town, buildingId);
  const caravanPost = buildingId === "caravanPost";
  const readyClass = visible ? used && !caravanPost ? "used" : "ready" : "";
  const cost = definition ? townBuildingCost(definition) : 0;
  const canBuild = owned && !visible && definition;
  const label = visible
    ? `<span class="building-ready">${caravanPost ? "Shop" : used ? "Used" : "Ready"}</span>`
    : canBuild
      ? `<span class="building-ready build-cost"><b>${labelText}</b><small>${town.owner === "player" ? `${cost} gold` : "Claim first"}</small></span>`
      : `<span>${labelText} plot</span>`;
  return `<button type="button" class="town-yard-slot ${slot} ${stateClass} ${readyClass}${selected ? " selected" : ""}" data-town-building="${building}" aria-label="${labelText}">${visible ? `<img src="${townSpriteDataUrl(sprite, owned)}" alt="" />` : ""}${label}</button>`;
}

function townBuildingPreviewText(event, town, buildingId) {
  const definition = townBuildingDefinitions[buildingId];
  if (!definition) return "";
  const built = town.buildings.includes(buildingId);
  const cost = townBuildingCost(definition);
  const caravanPost = buildingId === "caravanPost";
  const barracks = buildingId === "barracks";
  if (!built) {
    if (town.owner !== "player") return `${definition.name}: ${definition.text} Claim ${event.name} before building here. Cost: ${cost} gold.`;
    if (state.gold < cost) return `${definition.name}: ${definition.text} Cost: ${cost} gold. Need ${cost - state.gold} more gold.`;
    return `${definition.name}: ${definition.text} Ready to build now for ${cost} gold.`;
  }
  if (caravanPost) return `${definition.name}: ${definition.text} Opens the trade shop and keeps routes moving automatically.`;
  if (barracks) return `${definition.name}: Enter to recruit the local unit or train ${townFaction(event).name} roster units.`;
  if (isTownActionUsed(town, buildingId)) return `${definition.name}: ${definition.text} Already used today. Ready again tomorrow.`;
  return `${definition.name}: ${definition.text} Ready to use now.`;
}

function townBuildingCard(id, building, town) {
  const built = town.buildings.includes(id);
  const used = isTownActionUsed(town, id);
  const cost = townBuildingCost(building);
  const missingGold = Math.max(0, cost - state.gold);
  const unavailable = !built && (town.owner !== "player" || missingGold > 0);
  const caravanPost = id === "caravanPost";
  const actionUsed = used && !caravanPost;
  const status = built
    ? caravanPost
      ? used ? "Shop open, caravan dispatched" : "Shop open, dispatches automatically"
      : used ? "Used today" : "Ready"
    : town.owner !== "player" ? "Claim town first" : missingGold ? `Need ${missingGold} more gold` : `${cost} gold`;
  const badge = built
    ? caravanPost
      ? "Shop open"
      : used ? "Used today" : "Ready"
    : town.owner !== "player" ? "Claim first" : missingGold ? `Need ${missingGold} gold` : "Build now";
  const tone = built ? caravanPost ? "info" : used ? "used" : "good" : town.owner !== "player" || missingGold ? "warn" : "good";
  const actionLabel = caravanPost ? "Shop" : id === "barracks" ? "Enter" : actionUsed ? "Used" : "Use";
  const action = built
    ? `<button type="button" data-town-use="${id}"${actionUsed ? " disabled" : ""}>${actionLabel}</button>`
    : `<button type="button" data-town-build="${id}"${unavailable ? " disabled" : ""}>Build ${cost}</button>`;
  return `<div class="town-building-card ${built ? "built" : ""} ${actionUsed ? "used" : ""} ${unavailable ? "unavailable" : ""}"><div><strong>${building.name}</strong><span class="town-card-tags"><i class="town-state-badge ${tone}">${badge}</i></span><p>${building.text}</p><span>${status}</span></div>${action}</div>`;
}

function townSpriteDataUrl(name, owned = true) {
  const key = `town:${name}:${owned ? "owned" : "neutral"}`;
  if (portraitCache.has(key)) return portraitCache.get(key);
  const cutout = getTownCutout(name) || getTownCutout(owned ? "ownedTown" : "neutralTown");
  if (!cutout) return "";
  const { bounds, canvas: source } = cutout;
  const sw = bounds.maxX - bounds.minX + 1;
  const sh = bounds.maxY - bounds.minY + 1;
  const image = document.createElement("canvas");
  image.width = 112;
  image.height = 96;
  const imageCtx = image.getContext("2d");
  imageCtx.imageSmoothingEnabled = true;
  imageCtx.imageSmoothingQuality = "high";
  const scale = Math.min(104 / sw, 88 / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  imageCtx.drawImage(source, bounds.minX, bounds.minY, sw, sh, (image.width - dw) / 2, image.height - dh - 2, dw, dh);
  const url = image.toDataURL("image/png");
  portraitCache.set(key, url);
  return url;
}

function bindTownModal(key, event) {
  modalText.querySelectorAll("[data-town-building]").forEach((button) => {
    button.addEventListener("click", () => {
      setTownSelection(key, event, `building:${button.dataset.townBuilding}`);
      handleTownBuildingClick(key, event, button.dataset.townBuilding);
    });
    button.addEventListener("mouseenter", () => setTownSelection(key, event, `building:${button.dataset.townBuilding}`));
    button.addEventListener("focus", () => setTownSelection(key, event, `building:${button.dataset.townBuilding}`));
  });
  modalText.querySelectorAll("[data-town-recruit]").forEach((button) => {
    button.addEventListener("click", () => {
      setTownSelection(key, event, `recruit:${button.dataset.townRecruit}`);
      recruitTownUnit(key, event, button.dataset.townRecruit);
    });
    button.addEventListener("mouseenter", () => setTownSelection(key, event, `recruit:${button.dataset.townRecruit}`));
    button.addEventListener("focus", () => setTownSelection(key, event, `recruit:${button.dataset.townRecruit}`));
  });
  modalText.querySelectorAll("[data-town-build]").forEach((button) => {
    button.addEventListener("click", () => buildTownBuilding(key, event, button.dataset.townBuild));
  });
  modalText.querySelectorAll("[data-town-use]").forEach((button) => {
    button.addEventListener("click", () => {
      setTownSelection(key, event, `building:${button.dataset.townUse}`, false);
      handleTownBuildingClick(key, event, button.dataset.townUse);
    });
  });
  modalText.querySelectorAll("[data-town-action]").forEach((button) => {
    button.addEventListener("click", () => handleTownBodyAction(key, event, button.dataset.townAction));
  });
  syncTownSelectionUi(getTownSelection(key, event));
  setTownSelection(key, event, getTownSelection(key, event));
}

function handleTownBodyAction(key, event, action) {
  if (action === "notice") {
    openTownCommissionModal(key, event);
    return;
  }
  if (action === "faction") {
    useTownFactionAction(key, event);
    return;
  }
  if (action === "rest") {
    const town = getTownState(key);
    state.hero.hp = state.hero.maxHp;
    state.party.forEach((unit) => (unit.hp = unit.maxHp));
    applyTownTraining(town);
    state.visited[key] = true;
    const scoutText = event.faction === "dusk" ? ` ${scoutingHintText()}` : "";
    refreshTownModal(key, event, `${event.name} restores your party.${scoutText}`, "good");
  }
}

function previewTownBuilding(key, event, buildingId) {
  const town = getTownState(key);
  const preview = townBuildingPreviewText(event, town, buildingId);
  if (preview) setTownFeedback(preview, "info");
}

function previewTownRecruit(key, event, unitId) {
  const town = getTownState(key);
  const unit = creatureBook[unitId];
  if (!unit) return;
  if (town.owner !== "player") {
    setTownFeedback(`${unit.name}: claim ${event.name} before recruiting or training units here.`, "warn");
    return;
  }
  const primary = unitId === event.creature;
  const existing = partyUnitForId(unitId);
  const builtBarracks = town.buildings.includes("barracks");
  const baseStatus = !primary && !builtBarracks
    ? `Needs Barracks before ${unit.name} can join.`
    : existing
      ? isTownActionUsed(town, `upgrade:${unitId}`)
        ? `${unit.name} already trained here today.`
        : `Ready to upgrade for ${townUpgradeCostForUnit(unitId, event)} gold.`
      : state.party.length >= MAX_PARTY_UNITS
        ? `Ready to replace a creature for ${recruitCostForTown(unitId, event)} gold.`
        : `Ready to recruit for ${recruitCostForTown(unitId, event)} gold.`;
  setTownFeedback(`${unit.name}: ${unitRole(unit)}, ${rangeText(unit)}, ${unit.skill}. ${baseStatus}`, !primary && !builtBarracks ? "warn" : existing && isTownActionUsed(town, `upgrade:${unitId}`) ? "used" : "info");
}

function handleTownBuildingClick(key, event, buildingId) {
  const town = getTownState(key);
  const definition = townBuildingDefinitions[buildingId];
  if (!definition) return;
  if (!town.buildings.includes(buildingId)) {
    if (town.owner !== "player") {
      setTownFeedback(`Claim ${event.name} before you can build the ${definition.name}. Buy the claim or fight the town guard.`, "warn");
    } else if (state.gold < townBuildingCost(definition)) {
      setTownFeedback(`${definition.name} costs ${townBuildingCost(definition)} gold. You have ${state.gold}, so you need ${townBuildingCost(definition) - state.gold} more.`, "warn");
    } else {
      buildTownBuilding(key, event, buildingId);
    }
    return;
  }
  if (buildingId === "market") {
    if (isTownActionUsed(town, buildingId)) {
      setTownFeedback(`${definition.name} has already been used today. It will be ready again tomorrow.`, "used");
      return;
    }
    const bonus = 20 + state.hero.level * 3;
    state.gold += bonus;
    markTownActionUsed(town, buildingId);
    refreshTownModal(key, event, `${event.name}'s market trades supplies for ${bonus} gold.`, "good");
  } else if (buildingId === "caravanPost") {
    openCaravanTradeModal(key, event);
  } else if (buildingId === "barracks") {
    setTownFeedback("Barracks roster is open. Local units can be raised here; built Barracks unlocks the wider roster once per day.", "info");
    return;
  } else if (buildingId === "trainingYard") {
    if (isTownActionUsed(town, buildingId)) {
      setTownFeedback(`${definition.name} has already been used today. It will be ready again tomorrow.`, "used");
      return;
    }
    const trained = applyTownTraining(town);
    if (trained) markTownActionUsed(town, buildingId);
    refreshTownModal(key, event, trained ? `${event.name}'s training yard sharpens ${championName()}'s attack.` : `${event.name}'s training yard has already trained ${championName()}.`, trained ? "good" : "used");
  }
}

function buildTownBuilding(key, event, buildingId) {
  const town = getTownState(key);
  const building = townBuildingDefinitions[buildingId];
  if (!building) return;
  if (town.owner !== "player") {
    setTownFeedback(`Claim ${event.name} before building. Choose Buy Claim or Fight Guard at the bottom of the town window.`, "warn");
    return;
  }
  if (town.buildings.includes(buildingId)) {
    setTownFeedback(`${building.name} is already built.`, "used");
    return;
  }
  const cost = townBuildingCost(building);
  if (state.gold < cost) {
    setTownFeedback(`${building.name} costs ${cost} gold. You have ${state.gold}, so you need ${cost - state.gold} more.`, "warn");
    return;
  }
  state.gold -= cost;
  town.buildings.push(buildingId);
  if (buildingId === "barracks") town.selection = "building:barracks";
  state.visited[key] = true;
  const autoBonus = buildingId === "caravanPost" ? autoDispatchCaravan(town) : 0;
  refreshTownModal(key, event, autoBonus > 0 ? `${event.name} builds a ${building.name}. Its first caravan returns with ${autoBonus} gold.` : `${event.name} builds a ${building.name}.`, "good");
}

function openCaravanTradeModal(key, event) {
  const town = getTownState(key);
  const autoBonus = autoDispatchCaravan(town);
  const used = isTownActionUsed(town, "caravanPost");
  if (autoBonus > 0) {
    const text = `${event.name}'s caravan dispatches automatically and returns with ${autoBonus} gold.`;
    caravanTradeFeedback = { text, type: "good" };
    setMessage(text);
    renderAll();
  }
  openModal("Caravan Post", caravanTradeMarkup(key, event), [
    {
      label: used ? "Caravan Dispatched" : "Dispatching...",
      action: () => {
        const text = `${event.name}'s caravan route is automatic. The shop stays open while the cart travels.`;
        caravanTradeFeedback = { text, type: "info" };
        setMessage(text);
        reopenCaravanTradeModal(key, event);
      },
    },
    { label: "Back", secondary: true, action: () => reopenTownModal(key, event) },
  ], { html: true, className: "trade-modal", onRender: () => bindCaravanTradeModal(key, event) });
}

function buyCaravanItem(good, key, event) {
  const definition = itemDefinitions[good.id];
  if (!definition) {
    caravanTradeFeedback = { text: "That caravan item is no longer available.", type: "warn" };
    reopenCaravanTradeModal(key, event);
    return;
  }
  if (definition.type === "equipment" && (inventoryCount(good.id) > 0 || state.equipped[good.id])) {
    const text = `${definition.name} is already in your collection.`;
    caravanTradeFeedback = { text, type: "warn" };
    setMessage(text);
    reopenCaravanTradeModal(key, event);
    return;
  }
  if (state.gold < good.buyPrice) {
    const text = `${definition.name} costs ${good.buyPrice} gold. You have ${state.gold}.`;
    caravanTradeFeedback = { text, type: "warn" };
    setMessage(text);
    reopenCaravanTradeModal(key, event);
    return;
  }
  state.gold -= good.buyPrice;
  addInventoryItem(good.id, 1);
  rememberRelicItem(good.id);
  const text = `Bought ${definition.name} for ${good.buyPrice} gold. It is now in your bag.`;
  caravanTradeFeedback = { text, type: "good" };
  setMessage(text);
  renderAll();
  reopenCaravanTradeModal(key, event);
}

function sellCaravanItem(good, key, event) {
  const definition = itemDefinitions[good.id];
  if (!definition || inventoryCount(good.id) <= 0) {
    const text = `You have no ${definition?.name || "item"} to sell.`;
    caravanTradeFeedback = { text, type: "warn" };
    setMessage(text);
    reopenCaravanTradeModal(key, event);
    return;
  }
  if (state.equipped[good.id]) {
    const text = `${definition.name} is equipped and cannot be sold.`;
    caravanTradeFeedback = { text, type: "warn" };
    setMessage(text);
    reopenCaravanTradeModal(key, event);
    return;
  }
  removeInventoryItem(good.id, 1);
  forgetRelicItem(good.id);
  state.gold += good.sellPrice;
  const text = `Sold ${definition.name} for ${good.sellPrice} gold.`;
  caravanTradeFeedback = { text, type: "good" };
  setMessage(text);
  renderAll();
  reopenCaravanTradeModal(key, event);
}

function reopenCaravanTradeModal(key, event) {
  window.setTimeout(() => {
    if (!activeBattle && !activeNight) openCaravanTradeModal(key, event);
  }, 0);
}

function shortItemName(id) {
  const name = itemDefinitions[id]?.name || id;
  return name.replace("Healing ", "").replace(" of Luck", "");
}

function rememberRelicItem(id) {
  const relicName = relicItemNamesById[id];
  if (relicName && relicItems.has(relicName) && !state.relics.includes(relicName)) state.relics.push(relicName);
}

function forgetRelicItem(id) {
  const relicName = relicItemNamesById[id];
  if (!relicName || !relicItems.has(relicName) || inventoryCount(id) > 0 || state.equipped[id]) return;
  state.relics = state.relics.filter((name) => name !== relicName);
}

function caravanTradeMarkup(key, event) {
  const town = getTownState(key);
  const caravanStatus = isTownActionUsed(town, "caravanPost") ? "Route dispatched" : "Route dispatches now";
  const feedback = caravanTradeFeedback.text
    ? `<div class="trade-feedback ${caravanTradeFeedback.type}">${escapeHtml(caravanTradeFeedback.text)}</div>`
    : `<div class="trade-feedback info">Select an item to buy from caravan stock, or sell carried goods from your inventory.</div>`;
  const stock = caravanTradeGoods.map((good) => {
    const definition = itemDefinitions[good.id];
    const owned = inventoryCount(good.id);
    const equipped = state.equipped[good.id];
    const status = definition.type === "equipment" && (owned || equipped) ? "Owned" : good.kind;
    const cantBuy = definition.type === "equipment" && (owned || equipped);
    const buyDisabled = state.gold < good.buyPrice || cantBuy ? " disabled" : "";
    return `
      <li class="trade-row ${definition.type === "equipment" ? "artifact" : "supply"}">
        ${tradeItemIconMarkup(good.id)}
        <span class="trade-item"><strong>${escapeHtml(definition.name)}</strong><em>${status}</em></span>
        <span class="trade-price"><small>Cost</small><strong>${good.buyPrice}g</strong></span>
        <button type="button" data-caravan-buy="${good.id}"${buyDisabled}>Buy</button>
      </li>
    `;
  }).join("");
  const inventory = state.inventory.length
    ? state.inventory.map((item) => {
        const definition = itemDefinitions[item.id];
        const tradeGood = caravanTradeGoods.find((good) => good.id === item.id);
        const sellText = tradeGood ? `Sell ${tradeGood.sellPrice}` : "Not traded";
        const sellDisabled = !tradeGood || state.equipped[item.id] ? " disabled" : "";
        return `
          <li class="trade-row ${definition?.type === "equipment" ? "artifact" : "supply"}">
            ${tradeItemIconMarkup(item.id)}
            <span class="trade-item"><strong>${escapeHtml(definition?.name || item.id)}</strong><em>x${item.qty}${state.equipped[item.id] ? " Equipped" : ""}</em></span>
            <span class="trade-price"><small>${tradeGood ? "Receive" : "Buyer"}</small><strong>${tradeGood ? `${tradeGood.sellPrice}g` : "None"}</strong></span>
            <button type="button" data-caravan-sell="${item.id}"${sellDisabled}>Sell</button>
          </li>
        `;
      }).join("")
    : `<li class="trade-row empty"><span class="trade-icon">-</span><span class="trade-item"><strong>No items carried</strong><em>Sell list empty</em></span><span class="trade-price"><small>Receive</small><strong>-</strong></span><button type="button" disabled>Sell</button></li>`;
  return `
    <div class="trade-panel">
      <div class="trade-hero">
        ${caravanMarketArtUrl() ? `<img src="${caravanMarketArtUrl()}" alt="" />` : ""}
        <div><strong>${escapeHtml(event.name)} Caravan</strong><span>Trade without closing the automatic route.</span></div>
      </div>
      <div class="trade-summary"><span>Gold: ${state.gold}</span><span>${caravanStatus}</span></div>
      ${feedback}
      <div class="trade-columns">
        <section class="trade-section">
          <h3><span>Buy</span><small>Caravan stock</small></h3>
          <ul class="trade-inventory trade-stock">${stock}</ul>
        </section>
        <section class="trade-section">
          <h3><span>Sell</span><small>Your inventory</small></h3>
          <ul class="trade-inventory">${inventory}</ul>
        </section>
      </div>
    </div>
  `;
}

function tradeItemIconMarkup(id) {
  return `<span class="trade-icon trade-item-icon ${tradeItemIconClass(id)}" aria-hidden="true"></span>`;
}

function tradeItemIconClass(id) {
  return {
    healingDraught: "icon-healing-draught",
    bannerOfLuck: "icon-banner-of-luck",
    dawnwoodBow: "icon-dawnwood-bow",
    silverBridle: "icon-silver-bridle",
    starlitCompass: "icon-starlit-compass",
    forgeCharm: "icon-forge-charm",
  }[id] || "icon-supply-crate";
}

function caravanMarketArtUrl() {
  if (caravanMarketArtCache) return caravanMarketArtCache;
  if (!caravanMarketArtReady || !caravanMarketArt.naturalWidth || !caravanMarketArt.naturalHeight) return "";
  const cutout = buildChromaCutout(caravanMarketArt, { x: 0, y: 0, w: caravanMarketArt.naturalWidth, h: caravanMarketArt.naturalHeight }, { transparentThreshold: 82 });
  if (!cutout) return "";
  const { bounds, canvas: source } = cutout;
  const sw = bounds.maxX - bounds.minX + 1;
  const sh = bounds.maxY - bounds.minY + 1;
  const image = document.createElement("canvas");
  image.width = 760;
  image.height = 230;
  const imageCtx = image.getContext("2d");
  imageCtx.imageSmoothingEnabled = true;
  imageCtx.imageSmoothingQuality = "high";
  const scale = Math.min(740 / sw, 220 / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  imageCtx.drawImage(source, bounds.minX, bounds.minY, sw, sh, (image.width - dw) / 2, image.height - dh - 4, dw, dh);
  caravanMarketArtCache = image.toDataURL("image/png");
  return caravanMarketArtCache;
}

function bindCaravanTradeModal(key, event) {
  modalText.querySelectorAll("[data-caravan-buy]").forEach((button) => {
    const good = caravanTradeGoods.find((entry) => entry.id === button.dataset.caravanBuy);
    button.addEventListener("click", () => good && buyCaravanItem(good, key, event));
  });
  modalText.querySelectorAll("[data-caravan-sell]").forEach((button) => {
    const good = caravanTradeGoods.find((entry) => entry.id === button.dataset.caravanSell);
    button.addEventListener("click", () => good && sellCaravanItem(good, key, event));
  });
}

function isTownActionUsed(town, id) {
  return town.usedActions?.[id] === state.day;
}

function markTownActionUsed(town, id) {
  town.usedActions ??= {};
  town.usedActions[id] = state.day;
}

function setTownFeedback(text, type = "info") {
  const feedback = modalText.querySelector("#townFeedback");
  if (feedback) {
    feedback.textContent = text;
    feedback.className = `town-feedback ${type}`;
  }
  setMessage(text);
}

function refreshTownModal(key, event, feedbackText = "", feedbackType = "info") {
  townEvent(key, event);
  if (feedbackText) setTownFeedback(feedbackText, feedbackType);
  renderSidebar();
}

function recruitTownUnit(key, event, unitId) {
  const town = getTownState(key);
  const unit = creatureBook[unitId];
  if (!unit) return;
  if (town.owner !== "player") {
    setTownFeedback(`Claim ${event.name} before recruiting or training units here.`, "warn");
    return;
  }
  const primary = unitId === event.creature;
  const existing = partyUnitForId(unitId);
  const actionId = existing ? `upgrade:${unitId}` : "barracks";
  if (!primary && !town.buildings.includes("barracks")) {
    setTownFeedback(`Build Barracks to recruit ${unit.name}.`, "warn");
    return;
  }
  if (existing && isTownActionUsed(town, actionId)) {
    setTownFeedback(`${unit.name} has already trained here today. Try again tomorrow.`, "used");
    return;
  }
  if (!existing && !primary && isTownActionUsed(town, "barracks")) {
    setTownFeedback("Barracks has already raised a unit today. Try again tomorrow.", "used");
    return;
  }
  const cost = existing ? townUpgradeCostForUnit(unitId, event) : recruitCostForTown(unitId, event);
  if (state.gold < cost) {
    setTownFeedback(`${existing ? "Training" : unit.name} costs ${cost} gold.`, "warn");
    return;
  }
  if (!existing && state.party.length >= MAX_PARTY_UNITS) {
    openReplaceUnitModal(key, event, unitId, cost);
    return;
  }
  state.gold -= cost;
  if (existing) {
    upgradePartyUnit(existing);
    markTownActionUsed(town, actionId);
  } else {
    state.party.push(makeRecruitedCreature(unitId));
  }
  state.visited[key] = true;
  if (!existing && !primary) markTownActionUsed(town, "barracks");
  refreshTownModal(key, event, existing ? `${event.name} upgrades ${existing.name} to level ${existing.level}.` : `${event.name} recruits ${unit.name}.`, "good");
}

function openReplaceUnitModal(key, event, unitId, cost) {
  const unit = creatureBook[unitId];
  if (!unit) return;
  openModal(
    "Replace Unit",
    `Your party has ${MAX_PARTY_UNITS} creature units. Choose one to dismiss and recruit ${unit.name} for ${cost} gold.`,
    [
      ...state.party.map((member, index) => ({
        label: `Replace ${member.name}`,
        action: () => {
          if (state.gold < cost) {
            setMessage(`${unit.name} costs ${cost} gold.`);
            reopenTownModal(key, event);
            return;
          }
          const removed = state.party[index];
          state.gold -= cost;
          state.party.splice(index, 1, makeRecruitedCreature(unitId));
          const town = getTownState(key);
          if (unitId !== event.creature) markTownActionUsed(town, "barracks");
          state.visited[key] = true;
          setMessage(`${removed.name} leaves. ${unit.name} joins the party.`);
          renderAll();
          reopenTownModal(key, event);
        },
      })),
      { label: "Cancel", secondary: true, action: () => reopenTownModal(key, event) },
    ],
  );
}

function raiseTownUnit(event, creature) {
  const key = `${state.x},${state.y}`;
  recruitTownUnit(key, event, event.creature);
}

function townBuildActions(key, event, town) {
  return Object.entries(townBuildingDefinitions)
    .filter(([id]) => !town.buildings.includes(id))
    .map(([id, building]) => ({
      label: `Build ${building.name}`,
      action: () => {
        const cost = townBuildingCost(building);
        if (state.gold < cost) {
          setMessage(`${building.name} costs ${cost} gold.`);
          return;
        }
        state.gold -= cost;
        town.buildings.push(id);
        state.visited[key] = true;
        const autoBonus = id === "caravanPost" ? autoDispatchCaravan(town) : 0;
        setMessage(autoBonus > 0 ? `${event.name} builds a ${building.name}. Its first caravan returns with ${autoBonus} gold.` : `${event.name} builds a ${building.name}.`);
        renderAll();
        townEvent(key, event);
      },
    }));
}

function applyTownTraining(town) {
  if (!town.buildings.includes("trainingYard") || town.trainingClaimed) return false;
  state.hero.atk += 1;
  town.trainingClaimed = true;
  return true;
}

function caravanRouteGoldFor(caravanCount, townCount) {
  return caravanCount ? caravanCount * Math.max(12, townCount * 12) : 0;
}

function caravanRouteGoldForTown(key, townCount) {
  const base = caravanRouteGoldFor(1, townCount);
  return Math.round(base * (events.get(key)?.faction === "tide" ? 1.25 : 1));
}

function autoDispatchCaravan(town) {
  if (!town.buildings.includes("caravanPost") || isTownActionUsed(town, "caravanPost")) return 0;
  const townEntry = ownedTownEntries().find(([, candidate]) => candidate === town);
  const bonus = caravanRouteGoldForTown(townEntry?.[0] || "", ownedTownEntries().length);
  state.gold += bonus;
  markTownActionUsed(town, "caravanPost");
  return bonus;
}

function townEconomyPreview() {
  const ownedTowns = ownedTownEntries();
  const mineGold = claimedMineIncome();
  const buildingGold = ownedTowns.reduce((sum, [, town]) => sum + town.buildings.reduce((part, id) => part + (townBuildingDefinitions[id]?.income || 0), 0), 0);
  const caravanTowns = ownedTowns.filter(([, town]) => town.buildings.includes("caravanPost"));
  const routeGold = caravanTowns.reduce((sum, [key]) => sum + caravanRouteGoldForTown(key, ownedTowns.length), 0);
  const townGold = ownedTowns.length * 8;
  return { total: mineGold + townGold + buildingGold + routeGold, mines: mineGold, towns: townGold + buildingGold, routes: routeGold };
}

function collectTownIncome() {
  const ownedTowns = ownedTownEntries();
  const caravanTowns = ownedTowns.filter(([, town]) => town.buildings.includes("caravanPost"));
  const economy = townEconomyPreview();
  const { total, mines: mineGold, towns: townGold, routes: routeGold } = economy;
  if (total > 0) state.gold += total;
  caravanTowns.forEach(([, town]) => markTownActionUsed(town, "caravanPost"));
  state.tradeLedger = [
    { day: state.day, gold: total, mines: mineGold, towns: townGold, routes: routeGold },
    ...(state.tradeLedger || []),
  ].slice(0, 5);
  return { total, mines: mineGold, towns: townGold, routes: routeGold, text: total ? `Income: ${total} gold (${mineGold} mines, ${townGold} towns, ${routeGold} trade).` : "" };
}

function claimedMineIncome() {
  let total = 0;
  events.forEach((event, key) => {
    if (event.type === "mine" && state.visited[key]) total += event.gold;
  });
  return total;
}

function ownedTownEntries() {
  return Array.from(events.entries()).filter(([key, event]) => event.type === "town" && getTownState(key).owner === "player").map(([key, event]) => [key, getTownState(key), event]);
}

function mineEvent(key, event) {
  const payout = event.gold + state.hero.level * 4;
  state.gold += payout;
  state.visited[key] = true;
  playSfx("coin");
  setMessage(`The mine yields ${payout} gold.`);
  openModal("Mine Claimed", `Your banner is raised over the mine. It yields ${payout} gold.`, [
    { label: "Done", action: () => renderAll() },
  ]);
}

function chestEvent(key, event) {
  state.gold += event.gold;
  const isRelic = relicItems.has(event.item);
  if (isRelic && !state.relics.includes(event.item)) state.relics.push(event.item);
  const itemId = chestItemIds[event.item];
  if (itemId) addInventoryItem(itemId, 1);
  state.visited[key] = true;
  playSfx("coin");
  setMessage(`Found ${event.item} and ${event.gold} gold.`);
  openModal(isRelic ? "Relic Found" : "Treasure Found", `You found ${event.item} and ${event.gold} gold.${isRelic ? ` Relics: ${state.relics.length}/4.` : ""} The item was added to your inventory.`, [
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

function removeInventoryItem(id, qty = 1) {
  const item = state.inventory.find((entry) => entry.id === id);
  if (!item || qty <= 0) return false;
  item.qty -= qty;
  if (item.qty <= 0) state.inventory = state.inventory.filter((entry) => entry !== item);
  return true;
}

function inventoryCount(id) {
  return state.inventory.find((entry) => entry.id === id)?.qty || 0;
}

function partyMissingHp() {
  return [state.hero, ...state.party].reduce((sum, unit) => sum + Math.max(0, (unit.maxHp || 0) - Math.max(0, unit.hp || 0)), 0);
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
  const tier = campaignDifficultyTier();
  const enemyText = enemies.length > 1 ? `${leader.name} and ${enemies.length - 1} ${enemies.length === 2 ? "ally" : "allies"} block the path.` : `${leader.name} blocks the path.`;
  openModal("Battle", battlePreviewMarkup(event, enemies, tier, enemyText), [
    { label: "Fight", action: () => startBattle(key, event, enemies) },
    { label: "Retreat", secondary: true, action: () => setMessage("You hold position and prepare.") },
  ], { html: true, className: event.gate || event.type === "final" ? "boss-preview-modal" : "" });
}

function battlePreviewMarkup(event, enemies, tier, enemyText) {
  const reward = enemies.reduce((sum, enemy) => sum + (enemy.reward || 0), 0);
  const icons = enemies.map((enemy) => `<span class="enemy-icon ${enemyArchetype(enemy)}" title="${escapeHtml(enemy.name)}">${enemyArchetypeIcon(enemy)}</span>`).join("");
  const leadText = bossLeadText(event);
  const bossText = bossTraitText(event);
  return `
    <div class="battle-preview ${event.gate || event.type === "final" ? "boss-preview" : ""}">
      ${leadText ? `<div class="boss-preview-hero"><strong>${event.gate ? "Fortress Approach" : event.type === "final" ? "Fortress Heart" : "Battle Readiness"}</strong><p>${leadText}</p></div>` : ""}
      <p>${escapeHtml(enemyText)} Threat: <strong>${tier.label}</strong>.</p>
      ${bossText ? `<div class="boss-preview-panel"><strong>Boss Trait</strong><p>${bossText}</p></div>` : ""}
      <div class="enemy-icon-row">${icons}</div>
      <div class="battle-reward-preview">
        <span>Reward ${reward} gold</span>
        <span>${event.type === "final" ? "Victory fight" : event.gate ? "Pass guardian" : `${enemies.length} enemy unit${enemies.length === 1 ? "" : "s"}`}</span>
      </div>
    </div>
  `;
}

function bossLeadText(event) {
  if (event.encounter === "gatekeeper") return "The mountain road narrows into a killing gap. Break the Black Gate Warden here and the fortress road finally opens.";
  if (event.encounter === "rival") return "Orius waits inside the fortress with the war already gathered around him. This is the fight that decides whether the campaign was a march or a claim.";
  return "";
}

function bossTraitText(event) {
  if (event.encounter === "gatekeeper") return "The Warden begins behind an iron bulwark, then enrages and crushes harder below half health.";
  if (event.encounter === "rival") return "Orius blinks away behind a moon ward and can unleash an arcane barrage across your whole party.";
  if (event.gate) return "Defeat this guardian creature to clear the pass to Orius.";
  return "";
}

function enemyArchetype(enemy) {
  if (enemy.attackType === "ranged") return "ranged";
  if ((enemy.def || 0) >= 6) return "guard";
  if (enemy.moveType === "flying") return "flying";
  return "melee";
}

function enemyArchetypeIcon(enemy) {
  const type = enemyArchetype(enemy);
  if (type === "ranged") return "R";
  if (type === "guard") return "G";
  if (type === "flying") return "F";
  return "M";
}

function createEnemyParty(encounterId, sourceEnemy = null) {
  const base = structuredClone(sourceEnemy || encounters[encounterId]);
  const tier = sourceEnemy?.difficultyTier || campaignDifficultyTier();
  const count = sourceEnemy?.partySize || desiredEnemyPartySize(encounterId, { tier });
  const partyNames = {
    goblin: [`${base.name} Leader`, `${base.name} Scout`, `${base.name} Skirmisher`, `${base.name} Trapper`, `${base.name} Guard`],
    basilisk: [base.name, "Mire Stalker", "Bog Spitter", "Fen Guard", "Mire Hatchling"],
    raiders: [`${base.name} Captain`, `${base.name} Scout`, `${base.name} Guard`, `${base.name} Torchbearer`, `${base.name} Striker`],
    wyvern: [base.name, "Glasswing Whelp", "Sky Talon", "Wing Guard", "Storm Whelp"],
    knight: [base.name, "Clockwork Squire", "Gear Shield", "Brass Lancer", "Iron Page"],
    warlock: [base.name, "Ashen Familiar", "Cinder Hexer", "Coal Imp", "Ember Shade"],
    rival: [base.name, "Fortress Adept", "Fortress Sentinel", "Moonbound Duelist", "Rift Scribe"],
  };
  const names = count === 1 ? [base.name] : partyNames[encounterId] || [`${base.name} Captain`, `${base.name} Scout`, `${base.name} Guard`];
  return Array.from({ length: count }, (_, index) => {
    const unit = normalizeEnemyUnit({ ...structuredClone(base), name: names[index] || `${base.name} ${index + 1}` });
    unit.sourceEncounter ??= sourceEnemy?.sourceEncounter || encounterId;
    if (!sourceEnemy && encounterId === "rival" && index === 1) unit.sourceEncounter = "towerAdept";
    if (!sourceEnemy && encounterId === "rival" && index === 2) unit.sourceEncounter = "towerSentinel";
    if (count > 1) {
      const rewardShare = Math.floor((base.reward || 0) / count);
      const hpScale = index === 0 ? 0.9 + tier.rank * 0.09 : 0.64 + tier.rank * 0.08;
      unit.maxHp = Math.max(8, Math.round(unit.maxHp * hpScale));
      unit.hp = unit.maxHp;
      unit.atk = Math.max(2, unit.atk - (index === 0 ? 1 : 2) + tier.rank);
      unit.def = Math.max(0, unit.def - (index === 0 ? 0 : 1) + Math.floor(tier.rank / 2));
      unit.speed = Math.max(1, unit.speed + (tier.rank >= 2 && index > 0 ? 1 : 0));
      unit.reward = index === 0 ? (base.reward || 0) - rewardShare * (count - 1) : rewardShare;
    } else {
      unit.maxHp += tier.rank * 5;
      unit.hp = unit.maxHp;
      unit.atk += tier.rank;
    }
    unit.difficultyTier = tier.label;
    return unit;
  });
}

function campaignDifficultyTier() {
  const clearedBattles = countVisitedEvents("battle");
  const ownedTowns = ownedTownEntries().length;
  const mines = countVisitedEvents("mine");
  const army = state.party.length + 1;
  const score = clearedBattles + ownedTowns * 1.25 + mines * 0.75 + Math.max(0, state.day - 1) * 0.9 + Math.max(0, army - 3) * 1.3 + Math.max(0, averagePartyLevel() - 2) * 1.1;
  if (score >= 15) return { label: "Hard", rank: 2, score };
  if (score >= 7) return { label: "Medium", rank: 1, score };
  return { label: "Easy", rank: 0, score };
}

function desiredEnemyPartySize(encounterId, options = {}) {
  const tier = options.tier || campaignDifficultyTier();
  const base = { goblin: 2, basilisk: 2, raiders: 3, wyvern: 2, knight: 2, warlock: 2, tideGuard: 2, gatekeeper: 4, rival: 5 }[encounterId] || 2;
  const armyPressure = Math.max(0, Math.floor((state.party.length - 2) / 2));
  const nightBonus = options.night ? 1 : 0;
  const cap = encounterId === "rival" || encounterId === "gatekeeper" ? 5 : tier.rank === 0 ? 2 : tier.rank === 1 ? 4 : 5;
  return Math.max(1, Math.min(BATTLE_ROWS, cap, base + tier.rank + armyPressure + nightBonus));
}

function normalizeEnemyUnit(enemy) {
  enemy.maxHp ??= enemy.hp;
  enemy.hp ??= enemy.maxHp;
  enemy.def ??= 1;
  enemy.power ??= 3;
  enemy.morale ??= 4;
  enemy.moveType ??= "ground";
  enemy.attackType ??= (enemy.attackRange ?? enemy.range) > 1 ? "ranged" : "melee";
  enemy.attackRange ??= enemy.range ?? (enemy.attackType === "ranged" ? 3 : 1);
  return enemy;
}

function createBossBattleState(event) {
  if (event.encounter === "gatekeeper") {
    return {
      kind: "gatekeeper",
      shieldCharges: 2,
      enraged: false,
    };
  }
  if (event.encounter === "rival") {
    return {
      kind: "rival",
      wardStrength: 0,
      blinkUsed: false,
      lastBarrageRound: 0,
    };
  }
  return null;
}

function startBattle(key, event, enemyInput) {
  const team = [state.hero, ...state.party];
  const positions = team.map((unit, index) => ({ x: index >= BATTLE_ROWS ? 0 : 1, y: index % BATTLE_ROWS, acted: unit.hp <= 0 }));
  const enemies = Array.isArray(enemyInput) ? enemyInput.map((enemy) => normalizeEnemyUnit(enemy)) : createEnemyParty(event.encounter, enemyInput);
  if (state.campUpgrades?.traps && event.type === "night" && enemies[0]) {
    const damage = Math.max(4, Math.round(enemies[0].maxHp * 0.18));
    enemies[0].hp = Math.max(1, enemies[0].hp - damage);
    enemies[0].trapDamage = damage;
    if (activeNight?.report) activeNight.report.trapDamageTotal += damage;
  }
  const enemyPositions = enemies.map((_, index) => ({ x: index >= BATTLE_ROWS ? BATTLE_COLS - 1 : BATTLE_COLS - 2, y: index % BATTLE_ROWS }));
  const enemyNames = enemies.map((enemy) => enemy.name).join(", ");
  const trapLine = enemies[0]?.trapDamage ? ` Stake traps hit ${enemies[0].name} for ${enemies[0].trapDamage}.` : "";
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
    floaters: [],
    log: [`${enemyNames} engage your party.${trapLine}`],
    bossState: createBossBattleState(event),
    auto: false,
  };
  clearAutoBattleTimer();
  buildBattleQueue();
  advanceBattleTurn();
  renderBattle();
  modal.classList.remove("victory-modal", "town-modal", "night-modal", "name-modal");
  modal.classList.add("battle-modal");
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
  clearAutoBattleTimer();
  normalizeSelectedBattleEnemy();
  modalOpen = true;
  modalTitle.textContent = `Battle: ${battleEnemyTitle()}`;
  modalText.innerHTML = battleMarkup();
  clearBattleFloaters();
  modalActions.innerHTML = "";
  bindBattleBoard();

  if (activeBattle.turn === "player") {
    const activeUnit = selectedBattleUnit();
    if (activeUnit) {
      const targetIndex = currentBattleTargetIndex();
      const target = activeBattle.enemies[targetIndex];
      const canAttack = Number.isInteger(targetIndex) && targetIndex >= 0 && canActiveUnitAttackEnemy(targetIndex);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "battle-action";
      button.disabled = !canAttack;
      button.innerHTML = `<span>${activeUnit.name}${target ? ` -> ${target.name}` : ""}</span><b>${battleAttackButtonText(activeUnit, targetIndex)}</b>`;
      button.setAttribute("aria-label", canAttack ? `${activeUnit.name} attacks ${target.name}` : `${activeUnit.name} has no enemy in attack range`);
      button.addEventListener("click", () => selectedBattleAttack());
      modalActions.appendChild(button);
    }
    const potionCount = inventoryCount("healingDraught");
    const injured = partyMissingHp();
    const potion = document.createElement("button");
    potion.type = "button";
    potion.className = "secondary battle-action battle-action-potion";
    potion.innerHTML = `<span>Healing Draught x${potionCount}</span><b>Heal Party +${HEALING_DRAUGHT_AMOUNT}</b>`;
    potion.disabled = potionCount <= 0 || injured <= 0;
    potion.setAttribute("aria-label", `Use Healing Draught to heal the party for ${HEALING_DRAUGHT_AMOUNT}`);
    potion.addEventListener("click", useBattleHealingDraught);
    modalActions.appendChild(potion);
    const guard = document.createElement("button");
    guard.type = "button";
    guard.className = "secondary battle-action battle-action-guard";
    guard.innerHTML = `<span>${activeUnit?.name || "Unit"}</span><b>Guard</b>`;
    guard.setAttribute("aria-label", "Current unit guards against the next enemy attack");
    guard.addEventListener("click", guardBattleAction);
    modalActions.appendChild(guard);
    const auto = document.createElement("button");
    auto.type = "button";
    auto.className = `${activeBattle.auto ? "secondary " : ""}battle-action battle-action-auto`;
    auto.innerHTML = activeBattle.auto
      ? `<span>Auto Battle</span><b>Stop Auto</b>`
      : `<span>${battleHasBoss() ? "Boss fight: risky" : "Repeat fight helper"}</span><b>Auto Battle</b>`;
    auto.setAttribute("aria-label", activeBattle.auto ? "Stop auto battle" : "Enable auto battle");
    auto.addEventListener("click", toggleAutoBattle);
    modalActions.appendChild(auto);
  } else {
    const waiting = document.createElement("p");
    waiting.className = "battle-wait";
    waiting.textContent = activeBattle.auto ? "Enemy turn... Auto Battle armed." : "Enemy turn...";
    modalActions.appendChild(waiting);
    if (activeBattle.auto) {
      const stopAuto = document.createElement("button");
      stopAuto.type = "button";
      stopAuto.className = "secondary battle-action battle-action-auto";
      stopAuto.innerHTML = `<span>Auto Battle</span><b>Stop Auto</b>`;
      stopAuto.setAttribute("aria-label", "Stop auto battle");
      stopAuto.addEventListener("click", toggleAutoBattle);
      modalActions.appendChild(stopAuto);
    }
  }

  if (!modal.open) modal.showModal();
  if (activeBattle.auto && activeBattle.turn === "player") scheduleAutoBattleAction();
}

function battleMarkup() {
  const teamRows = [state.hero, ...state.party]
    .map((unit, index) => battleUnitMarkup(unit, index))
    .join("");
  const enemyRows = activeBattle.enemies
    .map((enemy, index) => battleEnemyMarkup(enemy, index))
    .join("");
  const cells = battleCellsMarkup();
  const floaters = battleFloatersMarkup();
  const log = activeBattle.log.slice(-5).map((line) => `<li>${line}</li>`).join("");
  const order = activeBattle.queue.map((actor, index) => `<span class="${index === activeBattle.queueIndex - 1 ? "active" : ""}">${actor.name} ${actor.speed}</span>`).join("");
  return `
    <div class="battle-board">
      <div class="turn-order"><b>Turn order</b>${order}</div>
      <div class="battle-layout">
        <div class="battle-arena" aria-label="Battle arena">
          <div class="battle-grid">${cells}${teamRows}${enemyRows}${floaters}</div>
        </div>
        <div class="battle-roster">${battleRosterMarkup()}</div>
      </div>
      <ol class="battle-log">${log}</ol>
    </div>
  `;
}

function battleFloatersMarkup() {
  return (activeBattle.floaters || []).slice(-4).map((floater) => `
    <span class="battle-floater ${floater.kind || ""}" style="grid-column:${floater.x + 1};grid-row:${floater.y + 1};--battle-layer:9">${floater.text}</span>
  `).join("");
}

function randomBattleQuip(kind) {
  const lines = battleQuips[kind] || [];
  return lines[Math.floor(Math.random() * lines.length)] || "";
}

function addBattleFloater(x, y, text, kind = "") {
  if (!activeBattle) return;
  activeBattle.floaters = (activeBattle.floaters || []).concat({ x, y, text, kind }).slice(-4);
}

function clearBattleFloaters() {
  if (!activeBattle?.floaters?.length) return;
  activeBattle.floaters = [];
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
      const attacksFromHere = activeBattle?.turn === "player" && activeUnit && activeBattle.enemyPositions.some((pos, index) => activeBattle.enemies[index]?.hp > 0 && canAttackTarget(activeUnit, tile, pos));
      const attackableEnemyHere = activeBattle?.turn === "player" && activeUnit && activePos && activeBattle.enemyPositions.some((pos, index) => activeBattle.enemies[index]?.hp > 0 && pos.x === x && pos.y === y && canAttackTarget(activeUnit, activePos, pos));
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
  const attackText = rangeText(unit);
  const role = unitRole(unit);
  return `<div class="battle-stat-card ${active ? "active" : ""} ${enemy ? "enemy" : ""}"><strong>${unit.name}</strong><span>${role}</span><span>HP ${Math.max(0, unit.hp)}/${unit.maxHp || unit.hp}</span><span>Attack ${unit.atk || 0} / Defense ${unit.def || 0}</span><span>Speed ${unit.speed || 1} / Move ${moveRange(unit)} ${unit.moveType || "ground"}</span><span>${attackText}</span></div>`;
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
      handleBattleEnemyClick(Number(enemyEl.dataset.battleEnemy));
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
  const defeated = unit.hp <= 0;
  const selected = !defeated && activeBattle.selectedIndex === index;
  const feedbackClass = battleFeedbackClassForUnit(index);
  const sprite = portrait
    ? `<img class="battle-sprite-img" src="${portrait}" alt="" />`
    : `<div class="battle-token" style="--unit-color:${unit.color || "#f0c15b"}"></div>`;
  return `
    <button type="button" class="battle-combatant battle-unit battle-facing-right ${defeated ? "down" : ""} ${selected ? "selected" : ""} ${feedbackClass}" data-battle-unit="${index}" style="grid-column:${pos.x + 1};grid-row:${pos.y + 1};--battle-layer:${pos.y + 2}" aria-label="${defeated ? `${unit.name} defeated` : `Select ${unit.name}`}" ${defeated ? "disabled" : ""}>
      <div class="battle-base">${sprite}</div>
      <div class="battle-mini-hp" style="--fill:${fill}%"><span></span></div>
    </button>
  `;
}
function battleEnemyMarkup(enemy, index) {
  const fill = hpPercent(enemy);
  const portrait = battleEnemyPortrait(enemy);
  const feedbackClass = battleFeedbackClassForEnemy(index);
  const defeated = enemy.hp <= 0;
  const attackable = !defeated && canActiveUnitAttackEnemy(index);
  const visual = enemyVisualForEnemy(enemy);
  const sprite = portrait
    ? `<img class="battle-sprite-img enemy" src="${portrait}" alt="" />`
    : `<div class="battle-token enemy sprite-${visual?.id || "enemy"}" style="--unit-color:${enemy.color || "#d95d5d"}"></div>`;
  const pos = activeBattle.enemyPositions[index];
  const selected = !defeated && activeBattle.selectedEnemyIndex === index;
  return `
    <button type="button" class="battle-combatant battle-enemy battle-facing-left ${defeated ? "down" : ""} ${selected ? "selected" : ""} ${attackable ? "attackable" : ""} ${feedbackClass}" data-battle-enemy="${index}" style="grid-column:${pos.x + 1};grid-row:${pos.y + 1};--battle-layer:${pos.y + 2}" aria-label="${defeated ? `${enemy.name} defeated` : `Target ${enemy.name}`}" ${defeated ? "disabled" : ""}>
      <div class="battle-base">${sprite}</div>
      ${attackable ? `<span class="battle-attack-icon" aria-hidden="true">&#9876;</span>` : ""}
      <div class="battle-mini-hp danger" style="--fill:${fill}%"><span></span></div>
    </button>
  `;
}

function currentBattleTargetIndex() {
  if (!activeBattle) return -1;
  return livingEnemyIndex(activeBattle.selectedEnemyIndex);
}

function normalizeSelectedBattleEnemy() {
  if (!activeBattle) return -1;
  const targetIndex = currentBattleTargetIndex();
  activeBattle.selectedEnemyIndex = targetIndex;
  return targetIndex;
}

function clearAutoBattleTimer() {
  if (autoBattleTimer) window.clearTimeout(autoBattleTimer);
  autoBattleTimer = 0;
}

function battleHasBoss() {
  return Boolean(activeBattle?.event?.type === "final" || activeBattle?.event?.gate || activeBattle?.enemies?.some((enemy) => ["gatekeeper", "rival"].includes(enemy.sourceEncounter)));
}

function toggleAutoBattle() {
  if (!activeBattle) return;
  activeBattle.auto = !activeBattle.auto;
  clearAutoBattleTimer();
  activeBattle.log.push(activeBattle.auto
    ? battleHasBoss()
      ? "Auto Battle engaged. Boss fight warning: decisions may be risky."
      : "Auto Battle engaged."
    : "Auto Battle stopped.");
  renderBattle();
}

function scheduleAutoBattleAction() {
  clearAutoBattleTimer();
  if (!activeBattle?.auto || activeBattle.turn !== "player") return;
  autoBattleTimer = window.setTimeout(runAutoBattleAction, AUTO_BATTLE_DELAY_MS);
}

function runAutoBattleAction() {
  if (!activeBattle?.auto || activeBattle.turn !== "player") return;
  const activeUnit = selectedBattleUnit();
  const activeIndex = activeBattle.selectedIndex;
  const pos = activeBattle.positions[activeIndex];
  if (!activeUnit || activeUnit.hp <= 0 || !pos || pos.acted) return;
  const emergencyHeal = inventoryCount("healingDraught") > 0
    && partyMissingHp() >= HEALING_DRAUGHT_AMOUNT
    && [state.hero, ...state.party].some((unit) => unit.hp > 0 && unit.hp / unit.maxHp <= 0.35);
  if (emergencyHeal) {
    useBattleHealingDraught();
    return;
  }
  const targetIndex = chooseAutoBattleTarget(activeIndex);
  if (targetIndex >= 0) {
    activeBattle.selectedEnemyIndex = targetIndex;
    selectedBattleAttack(targetIndex);
    return;
  }
  guardBattleAction();
}

function chooseAutoBattleTarget(unitIndex) {
  if (!activeBattle) return -1;
  const unit = [state.hero, ...state.party][unitIndex];
  const pos = activeBattle.positions[unitIndex];
  if (!unit || !pos) return -1;
  const living = activeBattle.enemies
    .map((enemy, index) => ({ enemy, index, pos: activeBattle.enemyPositions[index] }))
    .filter(({ enemy, pos }) => enemy?.hp > 0 && pos);
  if (!living.length) return -1;
  const ranked = living
    .map(({ enemy, index, pos: enemyPos }) => {
      const attackPos = attackPositionForTarget(unit, unitIndex, enemyPos);
      const inRangeNow = canAttackTarget(unit, pos, enemyPos);
      const killable = inRangeNow && expectedPlayerDamage(unit, enemy, pos, enemyPos) >= enemy.hp;
      const movementCost = attackPos ? battleDistance(pos, attackPos, unit) : Number.POSITIVE_INFINITY;
      const distanceNow = battleDistance(pos, enemyPos, unit);
      return { index, enemy, inRangeNow, killable, movementCost, distanceNow };
    })
    .filter((entry) => Number.isFinite(entry.movementCost))
    .sort((a, b) =>
      Number(b.killable) - Number(a.killable)
      || Number(b.inRangeNow) - Number(a.inRangeNow)
      || a.enemy.hp - b.enemy.hp
      || a.movementCost - b.movementCost
      || a.distanceNow - b.distanceNow
      || a.enemy.name.localeCompare(b.enemy.name));
  return ranked[0]?.index ?? -1;
}

function expectedPlayerDamage(unit, enemy, fromPos, enemyPos) {
  const penalty = rangedDamagePenalty(unit, fromPos, enemyPos);
  return Math.max(1, (unit.atk || 0) + (unit.power || 0) - (enemy.def || 0) - penalty * 2);
}

function battleAttackButtonText(unit, targetIndex) {
  if (!unit) return "Attack";
  if (!Number.isInteger(targetIndex) || targetIndex < 0) return "No target";
  if (!canActiveUnitAttackEnemy(targetIndex)) return "Move closer";
  return attackTypeLabel(unit) === "Ranged" ? `Shoot, best <= ${attackRange(unit)}` : "Melee Attack";
}

function canActiveUnitAttackEnemy(enemyIndex) {
  if (!activeBattle || activeBattle.turn !== "player") return false;
  const unit = selectedBattleUnit();
  const unitPos = activeBattle.positions[activeBattle.selectedIndex];
  const enemy = activeBattle.enemies[enemyIndex];
  const enemyPos = activeBattle.enemyPositions[enemyIndex];
  return Boolean(unit && unit.hp > 0 && unitPos && !unitPos.acted && enemy && enemy.hp > 0 && enemyPos && attackPositionForTarget(unit, activeBattle.selectedIndex, enemyPos));
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
  if (!unit.id && heroDirectionSheetReady) return getHeroBattlePortraitDataUrl("right");
  if (unit.id && unitSheetReady && unitCell(unit.id, 0)) return getUnitPortraitDataUrl(unit.id);
  const sprite = spriteNameForUnit(unit);
  if (!sprite) return "";
  if (!characterSheetReady && !spriteSheetReady) return "";
  return getPortraitDataUrl(sprite);
}

function battleEnemyPortrait(enemy) {
  const visual = enemyVisualForEnemy(enemy);
  if (visual?.source === "enemy" && enemySheetReady) {
    const enemyPortrait = getEnemyPortraitDataUrl(visual.id);
    if (enemyPortrait) return enemyPortrait;
  }
  if (visual?.source === "unit" && unitSheetReady) return getUnitPortraitDataUrl(visual.id);
  if (visual?.source === "character" && (characterSheetReady || spriteSheetReady)) return getPortraitDataUrl(visual.id);
  return "";
}

function spriteNameForEnemy(enemy) {
  if (enemy.sourceEncounter) return enemy.sourceEncounter;
  if (enemy.color === encounters.goblin.color) return "goblin";
  if (enemy.color === encounters.basilisk.color) return "basilisk";
  if (enemy.color === encounters.knight.color) return "knight";
  if (enemy.color === encounters.raiders.color) return "raiders";
  if (enemy.color === encounters.wyvern.color) return "wyvern";
  if (enemy.color === encounters.warlock.color) return "warlock";
  if (enemy.color === encounters.rival.color) return "rival";
  return "goblin";
}

function enemyVisualForEncounter(encounterId) {
  return enemySpriteVisuals[encounterId] || null;
}

function enemyVisualForEnemy(enemy) {
  return enemyVisualForEncounter(spriteNameForEnemy(enemy));
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

function selectBattleEnemy(index) {
  if (!activeBattle || activeBattle.turn !== "player") return;
  const enemy = activeBattle.enemies[index];
  if (!enemy || enemy.hp <= 0) return;
  activeBattle.selectedEnemyIndex = index;
  activeBattle.log.push(`${enemy.name} is targeted.`);
  renderBattle();
}

function handleBattleEnemyClick(index) {
  if (!activeBattle || activeBattle.turn !== "player") return;
  const enemy = activeBattle.enemies[index];
  if (!enemy || enemy.hp <= 0) return;
  activeBattle.selectedEnemyIndex = index;
  if (canActiveUnitAttackEnemy(index)) {
    selectedBattleAttack(index);
    return;
  }
  activeBattle.log.push(`${enemy.name} is targeted.`);
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
  const targetIndex = explicitTarget ? enemyIndex : normalizeSelectedBattleEnemy();
  const enemy = activeBattle.enemies[targetIndex];
  const enemyPos = activeBattle.enemyPositions[targetIndex];
  if (!unit || unit.hp <= 0 || !pos || pos.acted) return;
  if (!enemy || !enemyPos) return;
  if (enemy.hp <= 0) {
    const livingTargetIndex = normalizeSelectedBattleEnemy();
    if (livingTargetIndex >= 0) {
      activeBattle.log.push(`${enemy.name} is already down. ${activeBattle.enemies[livingTargetIndex].name} is the next target.`);
    } else {
      activeBattle.log.push(`${enemy.name} is already down.`);
    }
    return renderBattle();
  }
  activeBattle.selectedEnemyIndex = targetIndex;
  const attackPos = attackPositionForTarget(unit, activeBattle.selectedIndex, enemyPos);
  if (!attackPos) {
    activeBattle.log.push(`${enemy.name} is too far for ${unit.name} to reach and attack.`);
    return renderBattle();
  }
  if (attackPos.x !== pos.x || attackPos.y !== pos.y) {
    pos.x = attackPos.x;
    pos.y = attackPos.y;
    activeBattle.log.push(`${unit.name} moves into range.`);
  }
  playerBattleAction(activeBattle.selectedIndex, targetIndex);
}

function isBattleOccupied(x, y) {
  if (activeBattle.enemyPositions.some((pos, index) => pos.x === x && pos.y === y && activeBattle.enemies[index]?.hp > 0)) return true;
  return activeBattle.positions.some((pos, index) => pos.x === x && pos.y === y && [state.hero, ...state.party][index]?.hp > 0);
}

function isBattleOccupiedExceptUnit(x, y, unitIndex) {
  if (activeBattle.enemyPositions.some((pos, index) => pos.x === x && pos.y === y && activeBattle.enemies[index]?.hp > 0)) return true;
  return activeBattle.positions.some((pos, index) => index !== unitIndex && pos.x === x && pos.y === y && [state.hero, ...state.party][index]?.hp > 0);
}

function attackPositionForTarget(unit, unitIndex, enemyPos) {
  if (!activeBattle || !unit || !enemyPos) return null;
  const from = activeBattle.positions[unitIndex];
  if (!from) return null;
  if (canAttackTarget(unit, from, enemyPos)) return from;
  const range = moveRange(unit);
  let best = null;
  for (let y = 0; y < BATTLE_ROWS; y += 1) {
    for (let x = 0; x < BATTLE_COLS; x += 1) {
      const tile = { x, y };
      const movementCost = battleDistance(from, tile, unit);
      if (movementCost > range) continue;
      if (isBattleOccupiedExceptUnit(x, y, unitIndex)) continue;
      if (!canAttackTarget(unit, tile, enemyPos)) continue;
      if (!best || movementCost < best.movementCost || (movementCost === best.movementCost && attackDistance(tile, enemyPos) < best.attackDistance)) {
        best = { x, y, movementCost, attackDistance: attackDistance(tile, enemyPos) };
      }
    }
  }
  return best ? { x: best.x, y: best.y } : null;
}

function moveRange(unit) {
  return Math.max(1, unit.speed || 1);
}

function attackRange(unit) {
  const range = Number(unit?.attackRange ?? unit?.range);
  if (unit?.attackType === "melee") return 1;
  if (unit?.attackType === "ranged") return Math.max(2, range || 3);
  return Math.max(1, range || 1);
}

function attackTypeLabel(unit) {
  return attackRange(unit) > 1 || unit?.attackType === "ranged" ? "Ranged" : "Melee";
}

function rangeText(unit) {
  return attackTypeLabel(unit) === "Ranged" ? `Ranged, best <= ${attackRange(unit)}` : "Melee adjacent";
}

function unitRole(unit) {
  if (!unit) return "Adventurer";
  if ((unit.def || 0) >= 5 && (unit.maxHp || 0) >= 28) return "Bulwark";
  if (attackTypeLabel(unit) === "Ranged" && (unit.speed || 0) >= 6) return "Skirmisher";
  if (attackTypeLabel(unit) === "Ranged") return "Artillery";
  if (unit.moveType === "flying" && (unit.speed || 0) >= 7) return "Diver";
  if ((unit.speed || 0) >= 7) return "Striker";
  if ((unit.power || 0) >= 7) return "Caster";
  return "Vanguard";
}

function unitRoleSummary(unit) {
  const role = unitRole(unit);
  if (role === "Bulwark") return "Absorbs pressure and anchors the line.";
  if (role === "Skirmisher") return "Repositions fast and punishes from range.";
  if (role === "Artillery") return "Softens targets before they reach your front.";
  if (role === "Diver") return "Jumps fragile backliners and hard-to-reach threats.";
  if (role === "Striker") return "Wins trades by reaching key targets first.";
  if (role === "Caster") return "Relies on power spikes more than raw toughness.";
  return "Reliable frontline pressure for steady turns.";
}

function partyCompositionSummary() {
  const team = [state.hero, ...state.party];
  const ranged = team.filter((unit) => attackTypeLabel(unit) === "Ranged").length;
  const flying = team.filter((unit) => unit.moveType === "flying").length;
  const tanks = team.filter((unit) => unitRole(unit) === "Bulwark").length;
  const fast = team.filter((unit) => (unit.speed || 0) >= 7).length;
  const notes = [];
  if (!tanks) notes.push("add a bulwark");
  if (!ranged) notes.push("add ranged pressure");
  if (!flying) notes.push("add a flanker");
  if (fast <= 1) notes.push("improve initiative");
  const strengths = `Line ${tanks} / Range ${ranged} / Flight ${flying} / Fast ${fast}`;
  const advice = notes.length ? `Needs: ${notes.join(", ")}.` : "Balanced warband with answers for most fights.";
  return { strengths, advice };
}

function isTargetInAttackRange(attacker, from, to) {
  return Boolean(attacker && from && to && attackDistance(from, to) <= attackRange(attacker));
}

function canAttackTarget(attacker, from, to) {
  if (!attacker || !from || !to) return false;
  if (attackTypeLabel(attacker) === "Ranged") return true;
  return isTargetInAttackRange(attacker, from, to);
}

function rangedDamagePenalty(attacker, from, to) {
  if (attackTypeLabel(attacker) !== "Ranged") return 0;
  return Math.max(0, attackDistance(from, to) - attackRange(attacker));
}

function attackDistance(from, to) {
  return Math.max(Math.abs(from.x - to.x), Math.abs(from.y - to.y));
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
  const attackerPos = activeBattle.positions[attackerIndex];
  const enemyPos = activeBattle.enemyPositions[enemyIndex];
  const penalty = rangedDamagePenalty(attacker, attackerPos, enemyPos);
  const moraleBonus = (attacker.morale || 0) >= 7 ? 2 : 0;
  let damage = Math.max(1, attacker.atk + Math.ceil((attacker.power || 0) / 2) + attacker.level + moraleBonus - (enemy.def || 0) - penalty * 2 + Math.floor(Math.random() * 4) - 1);
  let bossNote = "";
  if (enemy.sourceEncounter === "gatekeeper" && activeBattle.bossState?.kind === "gatekeeper" && activeBattle.bossState.shieldCharges > 0) {
    const absorbed = Math.min(Math.max(0, damage - 1), 6);
    damage = Math.max(1, damage - absorbed);
    activeBattle.bossState.shieldCharges -= 1;
    bossNote = ` The iron bulwark absorbs ${absorbed}.`;
    addBattleFloater(enemyPos.x, enemyPos.y, "Block", "guard");
  } else if (enemy.sourceEncounter === "rival" && activeBattle.bossState?.kind === "rival" && activeBattle.bossState.wardStrength > 0) {
    const absorbed = Math.min(Math.max(0, damage - 1), activeBattle.bossState.wardStrength);
    damage = Math.max(1, damage - absorbed);
    activeBattle.bossState.wardStrength = 0;
    bossNote = ` Moon ward absorbs ${absorbed} before shattering.`;
    addBattleFloater(enemyPos.x, enemyPos.y, "Ward", "guard");
  }
  activeBattle.feedback = { type: "hit", unitIndex: attackerIndex, enemyIndex, target: "enemy" };
  enemy.hp -= damage;
  addBattleFloater(enemyPos.x, enemyPos.y, `-${damage}`, "damage");
  playSfx("hit");
  activeBattle.log.push(`${attacker.name} hits ${enemy.name} for ${damage}${penalty ? ` (${penalty} range penalty)` : ""}.${bossNote} ${randomBattleQuip("playerHit")}`);
  if (enemy.hp > 0) maybeTriggerBossPhase(enemyIndex);
  if (enemy.hp <= 0) {
    enemy.hp = 0;
    activeBattle.log.push(`${enemy.name} falls. ${randomBattleQuip("enemyDown")}`);
    normalizeSelectedBattleEnemy();
  }
  if (!livingEnemies().length) return finishBattle(true);
  finishBattleUnitAction();
}

function maybeTriggerBossPhase(enemyIndex) {
  const enemy = activeBattle?.enemies?.[enemyIndex];
  const enemyPos = activeBattle?.enemyPositions?.[enemyIndex];
  if (!activeBattle || !enemy || enemy.hp <= 0) return false;
  if (enemy.sourceEncounter === "gatekeeper" && activeBattle.bossState?.kind === "gatekeeper" && !activeBattle.bossState.enraged && enemy.hp <= Math.ceil(enemy.maxHp * 0.5)) {
    activeBattle.bossState.enraged = true;
    enemy.atk += 3;
    enemy.def += 1;
    enemy.speed += 1;
    activeBattle.log.push(`${enemy.name} roars behind the broken gate and fights in a rage.`);
    if (enemyPos) addBattleFloater(enemyPos.x, enemyPos.y, "Rage", "attack");
    return true;
  }
  if (enemy.sourceEncounter === "rival" && activeBattle.bossState?.kind === "rival" && !activeBattle.bossState.blinkUsed && enemy.hp <= Math.ceil(enemy.maxHp * 0.5)) {
    activeBattle.bossState.blinkUsed = true;
    activeBattle.bossState.wardStrength = 8;
    if (enemyPos) {
      const fallback = { x: BATTLE_COLS - 2, y: 2 };
      let blinkTile = fallback;
      for (let y = 0; y < BATTLE_ROWS; y += 1) {
        const x = BATTLE_COLS - 2;
        if (!isBattleOccupiedByOther(x, y, enemyIndex)) {
          blinkTile = { x, y };
          break;
        }
      }
      enemyPos.x = blinkTile.x;
      enemyPos.y = blinkTile.y;
      addBattleFloater(enemyPos.x, enemyPos.y, "Blink", "move");
    }
    activeBattle.log.push(`${enemy.name} slips through moonlight, reforms in the rear, and raises a moon ward.`);
    return true;
  }
  return false;
}

function guardBattleAction() {
  if (!activeBattle) return;
  const unit = selectedBattleUnit();
  activeBattle.feedback = { type: "guard", unitIndex: activeBattle.selectedIndex };
  playSfx("guard");
  activeBattle.log.push(`${unit?.name || "Unit"} guards.`);
  activeBattle.guarding = true;
  finishBattleUnitAction();
}

function useBattleHealingDraught() {
  if (!activeBattle || activeBattle.turn !== "player") return;
  const unit = selectedBattleUnit();
  const pos = activeBattle.positions[activeBattle.selectedIndex];
  if (!unit || unit.hp <= 0 || !pos || pos.acted) return;
  if (inventoryCount("healingDraught") <= 0) {
    activeBattle.log.push("No Healing Draughts left. The bag looks embarrassed.");
    return renderBattle();
  }
  if (partyMissingHp() <= 0) {
    activeBattle.log.push("Everyone is already healthy enough to make poor choices.");
    return renderBattle();
  }
  removeInventoryItem("healingDraught", 1);
  [state.hero, ...state.party].forEach((member, index) => {
    if (member.hp <= 0) return;
    const before = member.hp;
    member.hp = Math.min(member.maxHp, member.hp + HEALING_DRAUGHT_AMOUNT);
    const healed = member.hp - before;
    const memberPos = activeBattle.positions[index];
    if (healed > 0 && memberPos) addBattleFloater(memberPos.x, memberPos.y, `+${healed}`, "heal");
  });
  activeBattle.feedback = { type: "guard", unitIndex: activeBattle.selectedIndex };
  playSfx("coin");
  activeBattle.log.push(`${unit.name} uses a Healing Draught. ${randomBattleQuip("potion")}`);
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
  maybeTriggerBossPhase(enemyIndex);
  if (enemy.sourceEncounter === "rival" && activeBattle.bossState?.kind === "rival" && activeBattle.round >= 2 && activeBattle.bossState.lastBarrageRound !== activeBattle.round) {
    activeBattle.bossState.lastBarrageRound = activeBattle.round;
    return performOriusBarrage(enemyIndex);
  }
  const targets = livingTeam();
  if (!targets.length) return finishBattle(false);
  const target = nearestEnemyTarget(enemyIndex, targets);
  const moved = moveEnemyTowardTarget(enemyIndex, target);
  if (moved) {
    activeBattle.feedback = { type: "move", enemyIndex, target: "enemy" };
    activeBattle.log.push(`${enemy.name} advances on ${target.name}.`);
    renderBattle();
    window.setTimeout(() => resolveEnemyAttack(enemyIndex, [state.hero, ...state.party].indexOf(target)), 320);
    return;
  }
  resolveEnemyAttack(enemyIndex, [state.hero, ...state.party].indexOf(target));
}

function performOriusBarrage(enemyIndex) {
  if (!activeBattle) return;
  const enemy = activeBattle.enemies[enemyIndex];
  const enemyPos = activeBattle.enemyPositions[enemyIndex];
  const targets = livingTeam();
  if (!enemy || !targets.length) {
    advanceBattleTurn();
    return renderBattle();
  }
  activeBattle.feedback = { type: "hit", enemyIndex, target: "enemy" };
  activeBattle.log.push(`${enemy.name} unleashes Arcane Barrage across the field.`);
  targets.forEach((unit) => {
    const targetIndex = [state.hero, ...state.party].indexOf(unit);
    const targetPos = activeBattle.positions[targetIndex];
    const damage = Math.max(2, Math.round(enemy.power * 0.7 + activeBattle.round - (unit.def || 0) * 0.35));
    unit.hp = Math.max(0, unit.hp - damage);
    if (targetPos) addBattleFloater(targetPos.x, targetPos.y, `-${damage}`, "damage");
    if (unit.hp <= 0) activeBattle.log.push(`${unit.name} is blasted down by the barrage.`);
  });
  if (enemyPos) addBattleFloater(enemyPos.x, enemyPos.y, "Burst", "attack");
  playSfx("hit");
  activeBattle.guarding = false;
  if (!livingTeam().length) return finishBattle(false);
  advanceBattleTurn();
  renderBattle();
}

function resolveEnemyAttack(enemyIndex, targetIndex) {
  if (!activeBattle) return;
  const enemy = activeBattle.enemies[enemyIndex];
  const target = [state.hero, ...state.party][targetIndex];
  if (!enemy || enemy.hp <= 0) {
    advanceBattleTurn();
    return renderBattle();
  }
  if (!target || target.hp <= 0) {
    const nextTarget = nearestEnemyTarget(enemyIndex, livingTeam());
    if (!nextTarget) return finishBattle(false);
    targetIndex = [state.hero, ...state.party].indexOf(nextTarget);
  }
  const enemyPos = activeBattle.enemyPositions[enemyIndex];
  const resolvedTarget = [state.hero, ...state.party][targetIndex];
  const targetPos = activeBattle.positions[targetIndex];
  if (!resolvedTarget || !targetPos || !canAttackTarget(enemy, enemyPos, targetPos)) {
    activeBattle.feedback = { type: "move", enemyIndex, target: "enemy" };
    activeBattle.log.push(`${resolvedTarget?.name || "The party"} is too far for ${enemy.name}'s attack.`);
    advanceBattleTurn();
    return renderBattle();
  }
  const guardReduction = activeBattle.guarding ? 4 : 0;
  const penalty = rangedDamagePenalty(enemy, enemyPos, targetPos);
  const partyCourage = Math.min(2, Math.floor(livingTeam().length / 3));
  const gatekeeperCrush = enemy.sourceEncounter === "gatekeeper" && activeBattle.bossState?.kind === "gatekeeper" && activeBattle.bossState.enraged;
  const damage = Math.max(1, enemy.atk - (resolvedTarget.def || 1) - guardReduction - partyCourage - penalty * 2 + (gatekeeperCrush ? 3 : 0) + Math.floor(Math.random() * 3));
  activeBattle.feedback = { type: "hit", unitIndex: targetIndex, target: "unit" };
  resolvedTarget.hp -= damage;
  if (resolvedTarget.hp <= 0) resolvedTarget.hp = 0;
  addBattleFloater(targetPos.x, targetPos.y, `-${damage}`, "damage");
  playSfx("hit");
  activeBattle.log.push(`${enemy.name} ${gatekeeperCrush ? "crushes" : "strikes"} ${resolvedTarget.name} for ${damage}${penalty ? ` (${penalty} range penalty)` : ""}. ${randomBattleQuip("enemyHit")}`);
  if (resolvedTarget.hp <= 0) activeBattle.log.push(`${resolvedTarget.name} falls.`);
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
  const start = from ? { x: from.x, y: from.y } : null;
  const targetIndex = [state.hero, ...state.party].indexOf(target);
  const to = activeBattle.positions[targetIndex];
  const range = moveRange(enemy);
  if (!enemy || !from || !to || canAttackTarget(enemy, from, to)) return false;
  let best = { ...from, distance: battleDistance(from, to, enemy), movementCost: 0 };
  for (let y = 0; y < BATTLE_ROWS; y += 1) {
    for (let x = 0; x < BATTLE_COLS; x += 1) {
      if (x === from.x && y === from.y) continue;
      const movementCost = battleDistance(from, { x, y }, enemy);
      if (movementCost > range) continue;
      if (isBattleOccupiedByOther(x, y, enemyIndex)) continue;
      const distance = battleDistance({ x, y }, to, enemy);
      if (distance < best.distance || (distance === best.distance && movementCost < best.movementCost)) best = { x, y, distance, movementCost };
    }
  }
  from.x = best.x;
  from.y = best.y;
  return Boolean(start && (from.x !== start.x || from.y !== start.y));
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
  clearAutoBattleTimer();
  const { key, event, enemies, reward, log } = activeBattle;
  const leader = enemies[0];
  const enemyLabel = enemies.length > 1 ? `${leader.name}'s party` : leader.name;
  activeBattle = null;
  if (wonBattle) {
    playSfx("win");
    state.gold += reward;
    const xpReport = gainXp(event.type === "night" ? Math.max(18, 18 + (leader.nightLevel || state.hero.level) * 4) : event.encounter === "rival" ? 60 : 24);
    if (event.type !== "night") state.visited[key] = true;
    if (event.type === "townClaim" && event.townKey) {
      const town = getTownState(event.townKey);
      town.owner = "player";
      state.visited[event.townKey] = true;
      setMessage(`${event.townName || "The town"} is claimed after battle.`);
      openModal("Town Claimed", `${event.townName || "The town"} raises your banner. Reward: ${reward} gold and ${xpReport.amount} XP.`, [{ label: "Enter Town", action: () => resolvePostBattleProgression(() => reopenTownModal(event.townKey, events.get(event.townKey) || event)) }]);
      return renderAll();
    }
    if (event.type === "roamingHero" && event.roamingHeroId) {
      const roamingHero = state.enemyHeroes?.find((hero) => hero.id === event.roamingHeroId);
      if (roamingHero) roamingHero.defeated = true;
    }
    if (event.type === "final") {
      return triggerVictory("military", "DAYLIGHT VICTORY", finalVictoryMarkup(enemyLabel, reward, xpReport.amount), { html: true, className: "victory-modal boss-aftermath-modal" });
    } else if (event.gate) {
      setMessage("The Black Gate Warden falls. The fortress pass is finally open.");
      openModal("Pass Cleared", gateAftermathMarkup(reward, xpReport.amount), [
        { label: "March to Fortress", action: () => resolvePostBattleProgression() },
      ], { html: true, className: "boss-aftermath-modal" });
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
    setMessage(wasNightBattle ? "Night defeat. You retreat to Dawnhaven by dawn and lose 30 gold." : "Defeat. You retreat to Dawnhaven and lose 30 gold.");
    openModal("Defeat", wasNightBattle ? "Your camp breaks before dawn. The party retreats to Dawnhaven and loses 30 gold." : "Your party collapses and retreats to Dawnhaven. You lose 30 gold.", [{ label: "Recover", action: () => renderAll() }]);
  }
  renderAll();
}

function victoryConditions() {
  const townCount = ownedTownEntries().length;
  const mineCount = countVisitedEvents("mine");
  const relicCount = uniqueRelicCount();
  const battleCount = countVisitedEvents("battle");
  return [
    { id: "military", title: "Military Victory", text: "Defeat Rival Mage Orius at the northeast fortress.", done: state.won && state.victoryType === "military" },
    { id: "kingdom", title: "Kingdom Victory", text: `Own 6 towns, 6 mines, and hold 900 gold (${townCount}/6 towns, ${mineCount}/6 mines, ${state.gold}/900 gold).`, ready: townCount >= 6 && mineCount >= 6 && state.gold >= 900 },
    { id: "relic", title: "Relic Victory", text: `Find 4 relics and clear 8 outposts (${relicCount}/4 relics, ${battleCount}/8 outposts).`, ready: relicCount >= 4 && battleCount >= 8 },
  ];
}

function checkVictoryConditions() {
  if (state.won || modalOpen || activeBattle || activeNight) return;
  const condition = victoryConditions().find((item) => item.ready);
  if (!condition) return;
  triggerVictory(condition.id, condition.title.toUpperCase(), `${condition.title} achieved. ${condition.text}`);
}

function triggerVictory(type, title, text, options = {}) {
  state.won = true;
  state.victoryType = type;
  setMessage(`${title}!`);
  openModal(title, text, [
    { label: "Continue Realm", action: () => resolvePostBattleProgression() },
    { label: "New Campaign", secondary: true, action: () => resetGame() },
  ], { html: Boolean(options.html), className: options.className || "" });
  renderAll();
}

function gateAftermathMarkup(reward, xp) {
  return `
    <div class="boss-aftermath">
      <div class="boss-aftermath-hero">
        <strong>Black Gate Broken</strong>
        <p>The Warden collapses in the pass and the road into the fortress finally clears. The campaign state changes here: the march is over, and the siege begins.</p>
      </div>
      <div class="boss-aftermath-grid">
        <article><small>Reward</small><strong>${reward} gold</strong><p>The pass guardian's stores and escort coin fall into your hands.</p></article>
        <article><small>Experience</small><strong>${xp} XP</strong><p>Your warband has survived the fortress threshold and hardens for the last push.</p></article>
        <article><small>Campaign State</small><strong>Fortress Open</strong><p>Orius is no longer behind rumor or roadblocks. You can enter the northeast fortress now.</p></article>
      </div>
    </div>
  `;
}

function finalVictoryMarkup(enemyLabel, reward, xp) {
  return `
    <div class="boss-aftermath">
      <div class="boss-aftermath-hero">
        <strong>Orius Defeated</strong>
        <p>${escapeHtml(enemyLabel)} falls inside the fortress and the whole northeast line breaks with him. The campaign resolves as a conquest, not just another cleared encounter.</p>
      </div>
      <div class="boss-aftermath-grid">
        <article><small>Reward</small><strong>${reward} gold</strong><p>The fortress treasury and war stores are seized at first light.</p></article>
        <article><small>Experience</small><strong>${xp} XP</strong><p>Your army earns the final lessons of the campaign in the fortress heart.</p></article>
        <article><small>Outcome</small><strong>Daylight Victory</strong><p>The road network, towns, and marches now answer to your banner.</p></article>
      </div>
    </div>
  `;
}

function gainXp(amount) {
  let heroLevels = 0;
  const unitLevelUps = [];
  state.hero.xp += amount;
  state.party.forEach((unit) => {
    unit.xp = (unit.xp || 0) + amount;
    while (unit.xp >= xpToNext(unit)) {
      unit.xp -= xpToNext(unit);
      const summary = applyUnitLevelGrowth(unit);
      unitLevelUps.push(summary);
    }
  });
  while (state.hero.xp >= xpToNext(state.hero)) {
    state.hero.xp -= xpToNext(state.hero);
    applyHeroLevelGrowth();
    heroLevels += 1;
  }
  pendingLevelUps += heroLevels;
  return { amount, heroLevels, unitLevelUps };
}

function xpToNext(unit) {
  const level = Math.max(1, unit.level || 1);
  return Math.round(42 + level * 38 + Math.max(0, level - 1) * 8);
}

function applyHeroLevelGrowth() {
  state.hero.level += 1;
  state.hero.maxHp += state.hero.level % 2 === 0 ? 7 : 5;
  state.hero.atk += state.hero.level % 2 === 0 ? 2 : 1;
  state.hero.def += state.hero.level % 3 === 0 ? 2 : 1;
  if (state.hero.level % 4 === 0) state.hero.speed += 1;
  state.hero.hp = state.hero.maxHp;
}

function applyUnitLevelGrowth(unit) {
  unit.level += 1;
  const hpGain = unit.level % 2 === 0 ? 5 : 3;
  const atkGain = unit.attackType === "ranged" ? (unit.level % 2 === 0 ? 1 : 0) : 1;
  const defGain = unit.level % 3 === 0 ? 1 : 0;
  const powerGain = unit.attackType === "ranged" || unit.moveType === "flying" ? 1 : unit.level % 2;
  unit.maxHp += hpGain;
  unit.atk += atkGain;
  unit.def += defGain;
  unit.power += powerGain;
  unit.hp = unit.maxHp;
  return { name: unit.name, level: unit.level, text: `+${hpGain} HP, +${atkGain} attack, +${defGain} defense, +${powerGain} power` };
}

function heroLevelSummary() {
  const next = xpToNext(state.hero);
  const current = Math.max(0, state.hero.xp || 0);
  return `Level ${state.hero.level} grants base stats automatically. XP to next: ${current}/${next}. Skill choices are permanent passives or stat upgrades.`;
}

function resolvePostBattleProgression(afterAction = null) {
  if (afterAction) pendingPostBattleAction = afterAction;
  if (pendingLevelUps > 0) return openSkillChoice();
  if (activeNight?.awaitingResult) return continueNightAfterBattle();
  const nextAction = pendingPostBattleAction;
  pendingPostBattleAction = null;
  if (nextAction) return nextAction();
  renderAll();
}

function openSkillChoice() {
  const choices = heroSkillChoicesForLevel();
  const available = choices.length ? choices : [{ name: "Veteran", text: "+1 attack and +1 defense.", apply: () => { state.hero.atk += 1; state.hero.def += 1; } }];
  openModal("Level Up", `${championName()} reached level ${state.hero.level}. Choose a skill.`, available.map((choice) => ({
    label: choice.name,
    action: () => {
      choice.apply();
      state.hero.skills.push(choice.name);
      pendingLevelUps -= 1;
      setMessage(`Learned ${choice.name}.`);
      resolvePostBattleProgression();
    },
  })));
  modalText.innerHTML = `<p>${escapeHtml(championName())} reached level ${state.hero.level}. ${heroLevelSummary()}</p><div class="skill-choice-list">${available.map((choice) => `<div><strong>${choice.name}</strong><em>${choice.type || "Veteran"}</em><span>${choice.text}</span></div>`).join("")}</div>`;
}

function heroSkillChoicesForLevel() {
  const unlocked = heroSkillCatalog.filter((choice) => !state.hero.skills.includes(choice.name));
  if (unlocked.length <= 4) return unlocked;
  const offset = Math.max(0, (state.hero.level - 2) % unlocked.length);
  return [...unlocked.slice(offset), ...unlocked.slice(0, offset)].slice(0, 4);
}

function openModal(title, text, actions, options = {}) {
  const alreadyOpen = modal.open;
  modalOpen = true;
  modal.className = "";
  modal.classList.toggle("victory-modal", title.includes("VICTORY"));
  if (options.className) modal.classList.add(...String(options.className).split(/\s+/).filter(Boolean));
  modalTitle.textContent = title;
  if (options.html) modalText.innerHTML = text;
  else modalText.textContent = text;
  modalActions.innerHTML = "";
  modalActions.hidden = false;
  actions.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.label;
    if (item.secondary) button.className = "secondary";
    button.addEventListener("click", () => {
      if (!item.keepOpen) {
        if (modal.open) modal.close();
        modalOpen = false;
      }
      item.action?.();
      if (state.nightReady && !modalOpen && !activeBattle && !activeNight && !state.won) beginNight();
    });
    modalActions.appendChild(button);
  });
  if (!alreadyOpen) modal.showModal();
  options.onRender?.();
}

function renderAll() {
  renderSidebar();
  renderTopbarStats();
  statusLine.textContent = message;
  if (objectiveHintLine) objectiveHintLine.textContent = campaignHint();
  window.setTimeout(checkVictoryConditions, 0);
}

function renderTopbarStats() {
  if (topDay) topDay.textContent = `Day ${state.day}`;
  if (topLight) {
    const progress = dayProgressPercent();
    topLight.innerHTML = `<b>${state.nightReady ? "Night camp ready" : "Daylight"}</b><i style="--fill:${progress}%"><em></em></i><small>${progress}%</small>`;
    topLight.classList.toggle("night-ready", state.nightReady);
  }
  if (topGold) topGold.textContent = `Gold ${state.gold}`;
  updateMusicButton();
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
  drawWorldReadabilityOverlays();
  drawWorldEntities();
  drawObjectiveHint();
}

function campaignMainObjective() {
  if (state.won) return "Victory secured";
  if (!state.hero.nameChosen) return "Choose your champion";
  if (state.party.length < 2) return `Recruit a second creature (${state.party.length}/2)`;
  const mineCount = countVisitedEvents("mine");
  if (mineCount < 1) return `Claim your first mine (${mineCount}/1)`;
  const elderStatus = state.quests?.elder || "new";
  if (elderStatus === "new") return "Meet Elder Mira at 5,3";
  const townCount = ownedTownEntries().length;
  if (townCount < 2) return `Claim a second town (${townCount}/2)`;
  if (state.day === 1 && !state.nightReady) return "Prepare for your first nightfall";
  if (state.nightReady) return "Make camp and survive the night";
  const relicCount = uniqueRelicCount();
  if (relicCount < 2) return `Recover more relics (${relicCount}/2)`;
  if (!finalGateCleared()) return "Push northeast and defeat the Black Gate Warden";
  return "Enter the northeast fortress and defeat Rival Mage Orius";
}

function campaignSideObjective() {
  if (state.won || !state.hero.nameChosen) return "";
  const unclaimedQuest = Object.entries(npcQuests).find(([id]) => !state.quests?.[id]);
  if (unclaimedQuest) return `Side objective: meet ${unclaimedQuest[1].name}`;
  const activeNpcQuest = Object.entries(npcQuests).find(([id]) => state.quests?.[id] === "accepted" && !npcQuests[id].complete());
  if (activeNpcQuest) return `Side objective: ${activeNpcQuest[1].title} (${activeNpcQuest[1].objective})`;
  const relicCount = uniqueRelicCount();
  if (relicCount < 4) return `Side objective: recover relic chests (${relicCount}/4)`;
  const battleCount = countVisitedEvents("battle");
  if (battleCount < 8) return `Side objective: clear outposts (${battleCount}/8)`;
  return scoutingHintText();
}

function campaignHint() {
  const main = campaignMainObjective();
  const side = campaignSideObjective();
  return side ? `Main: ${main}  |  ${side}` : `Main: ${main}`;
}

function drawObjectiveHint() {
  const hint = campaignHint();
  ctx.save();
  ctx.font = "700 13px Trebuchet MS";
  const width = Math.min(canvas.width - 24, Math.max(240, ctx.measureText(hint).width + 28));
  const x = canvas.width - width - 12;
  const y = 12;
  ctx.fillStyle = "rgba(15,18,25,0.76)";
  ctx.fillRect(x, y, width, 28);
  ctx.strokeStyle = "rgba(240,193,91,0.72)";
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, 27);
  ctx.fillStyle = "#fff2b6";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(hint, x + 14, y + 14);
  ctx.restore();
}

function currentRegionId() {
  if (state.x >= 66 && state.y <= 8) return "black_gate_approach";
  if (state.x >= 56 && state.y >= 28) return "southern_wilds";
  if (state.x >= 56 && state.y <= 14) return "high_march";
  if (state.y >= 28) return "low_roads";
  if (state.x <= 18 && state.y <= 12) return "dawnhaven_march";
  return "central_kingdom";
}

function regionFlavorText(regionId) {
  return {
    dawnhaven_march: "Soft roads, small banners, and early patrol routes make this the safest part of the realm.",
    central_kingdom: "Trade roads and broken outposts cross here. The realm opens up and so do the risks.",
    high_march: "The air thins and the road hardens. Every mile northeast feels closer to the fortress war.",
    low_roads: "Merchants, scouts, and raiders all cut through these lower roads. Wealth and danger travel together here.",
    southern_wilds: "Sparse banners and long distances turn the south into a harsher frontier.",
    black_gate_approach: "The mountains choke the road into a killing pass. The fortress is no longer a rumor.",
  }[regionId] || "Another stretch of contested road lies ahead.";
}

function checkRegionDiscovery() {
  state.discoveredRegions ??= {};
  const regionId = currentRegionId();
  if (state.discoveredRegions[regionId]) return;
  state.discoveredRegions[regionId] = true;
  if (modalOpen) return;
  const name = currentRegionName();
  setMessage(`Entered ${name}.`);
  openModal(name, regionFlavorText(regionId), [
    { label: "Travel On", action: () => renderAll() },
  ]);
}

function drawWorldReadabilityOverlays() {
  drawTownInfluenceOverlays();
  drawThreatOverlays();
  drawScoutMarkerOverlay();
  drawLocationBanner();
}

function factionOverlayColor(faction) {
  if (faction === "grove") return "rgba(104, 179, 107, 0.16)";
  if (faction === "forge") return "rgba(217, 149, 93, 0.16)";
  if (faction === "tide") return "rgba(102, 167, 216, 0.16)";
  if (faction === "dusk") return "rgba(170, 128, 214, 0.16)";
  return "rgba(244, 234, 215, 0.08)";
}

function townInfluenceRadius(event) {
  return event.faction === "dusk" ? 80 : event.faction === "tide" ? 76 : event.faction === "forge" ? 72 : 68;
}

function drawTownInfluenceOverlays() {
  events.forEach((event, key) => {
    if (event.type !== "town") return;
    const [x, y] = key.split(",").map(Number);
    if (!isOnScreen(x, y, 4)) return;
    const px = screenTileX(x) + 16;
    const py = screenTileY(y) + 22;
    const color = factionOverlayColor(event.faction);
    const radius = townInfluenceRadius(event);
    ctx.save();
    const glow = ctx.createRadialGradient(px, py, 6, px, py, radius);
    glow.addColorStop(0, color.replace("0.16", "0.28"));
    glow.addColorStop(0.5, color);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function threatOverlayForEvent(event) {
  if (event.type === "final") return { color: "rgba(122, 75, 181, 0.18)", radius: 116, label: "Fortress" };
  if (event.gate) return { color: "rgba(217, 93, 93, 0.18)", radius: 74, label: "Pass Guardian" };
  if (event.type === "battle") return { color: "rgba(217, 93, 93, 0.12)", radius: 42, label: "" };
  return null;
}

function drawThreatOverlays() {
  events.forEach((event, key) => {
    if (state.visited[key]) return;
    const threat = threatOverlayForEvent(event);
    if (!threat) return;
    const [x, y] = key.split(",").map(Number);
    if (!isOnScreen(x, y, 5)) return;
    drawThreatHalo(screenTileX(x) + 16, screenTileY(y) + 18, threat.color, threat.radius, threat.label);
  });
  (state.enemyHeroes || []).forEach((hero) => {
    if (hero.defeated || !isOnScreen(hero.x, hero.y, 4)) return;
    drawThreatHalo(screenTileX(hero.x) + 16, screenTileY(hero.y) + 18, "rgba(217, 93, 93, 0.14)", 48, "Hunter");
  });
}

function drawThreatHalo(cx, cy, color, radius, label = "") {
  ctx.save();
  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius);
  glow.addColorStop(0, color.replace(/0\.\d+\)/, "0.26)"));
  glow.addColorStop(0.45, color);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  if (label) {
    ctx.fillStyle = "rgba(15,18,25,0.7)";
    ctx.fillRect(cx - 30, cy - radius + 8, 60, 16);
    ctx.fillStyle = "#fff2b6";
    ctx.font = "700 10px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, cx, cy - radius + 16);
  }
  ctx.restore();
}

function drawScoutMarkerOverlay() {
  if (!state.scoutMarker) return;
  if (state.visited[state.scoutMarker] || !events.has(state.scoutMarker)) {
    state.scoutMarker = "";
    return;
  }
  const [x, y] = state.scoutMarker.split(",").map(Number);
  if (!isOnScreen(x, y, 3)) return;
  const cx = screenTileX(x) + 16;
  const cy = screenTileY(y) + 18;
  ctx.save();
  ctx.strokeStyle = "rgba(194, 146, 232, 0.95)";
  ctx.fillStyle = "rgba(194, 146, 232, 0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 19, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 11, cy);
  ctx.lineTo(cx + 11, cy);
  ctx.moveTo(cx, cy - 11);
  ctx.lineTo(cx, cy + 11);
  ctx.stroke();
  ctx.fillStyle = "rgba(15,18,25,0.76)";
  ctx.fillRect(cx - 33, cy - 34, 66, 16);
  ctx.fillStyle = "#f7dcff";
  ctx.font = "700 10px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Moon Mark", cx, cy - 26);
  ctx.restore();
}

function currentRegionName() {
  return {
    black_gate_approach: "Black Gate Approach",
    southern_wilds: "Southern Wilds",
    high_march: "High March",
    low_roads: "Low Roads",
    dawnhaven_march: "Dawnhaven March",
    central_kingdom: "Central Kingdom",
  }[currentRegionId()] || "Central Kingdom";
}

function drawLocationBanner() {
  const region = currentRegionName();
  ctx.save();
  ctx.font = "700 12px Trebuchet MS";
  const width = Math.max(120, ctx.measureText(region).width + 24);
  const x = 12;
  const y = canvas.height - 36;
  ctx.fillStyle = "rgba(15,18,25,0.7)";
  ctx.fillRect(x, y, width, 22);
  ctx.strokeStyle = "rgba(244,234,215,0.2)";
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, 21);
  ctx.fillStyle = "#f4ead7";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(region, x + 12, y + 11);
  ctx.restore();
}

function updateCamera() {
  const maxX = Math.max(0, map[0].length - VIEW_W);
  const maxY = Math.max(0, map.length - VIEW_H);
  const targetX = Math.max(0, Math.min(maxX, visual.x - (VIEW_W - 1) / 2));
  const targetY = Math.max(0, Math.min(maxY, visual.y - (VIEW_H - 1) / 2));
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
      if (data[i + 3] > 0) data[i + 3] = 255;
      if (data[i + 3] > 20) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  pruneEdgeFragments(data, source.width, source.height);
  sourceCtx.putImageData(image, 0, 0);

  const bounds = alphaBounds(data, source.width, source.height);
  const hasPixels = bounds.minX <= bounds.maxX;
  const cutout = { canvas: source, bounds: hasPixels ? { minX, minY, maxX, maxY } : { minX: 0, minY: 0, maxX: source.width - 1, maxY: source.height - 1 } };
  if (hasPixels) cutout.bounds = bounds;
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
  Object.values(enemySpriteVisuals).filter((visual) => visual.source === "enemy").forEach((visual) => {
    for (let frame = 0; frame < 4; frame += 1) getEnemyCutout(`${visual.id}:${frame}`);
  });
}

function heroDirectionCell(key) {
  const directions = ["down", "left", "right", "up"];
  const [direction, frameText = "0"] = key.split(":");
  const row = directions.indexOf(direction);
  const col = Math.max(0, Math.min(3, Number(frameText) || 0));
  if (!heroDirectionSheetReady || row < 0) return null;
  return atlasGridCell(heroDirectionSheet, 4, 4, col, row);
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
  return atlasGridCell(characterSheet, 4, order.length, col, row);
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
  const [rawName, frameText = "0"] = key.split(":");
  const name = rawName;
  const row = order.indexOf(name);
  const col = Math.max(0, Math.min(3, Number(frameText) || 0));
  if (!enemySheetReady || row < 0) return null;
  return atlasGridCell(enemySheet, 4, order.length, col, row);
}

function getEnemyCutout(key) {
  if (enemyCutoutCache.has(key)) return enemyCutoutCache.get(key);
  const rect = enemyCell(key);
  if (!rect) return null;
  const cutout = buildChromaCutout(enemySheet, rect);
  enemyCutoutCache.set(key, cutout);
  return cutout;
}

function townCell(name) {
  const order = ["neutralTown", "ownedTown", "market", "caravanPost", "barracks", "trainingYard", "mineOutpost", "upgradedTown"];
  const index = order.indexOf(name);
  if (!townSheetReady || index < 0) return null;
  const col = index % 4;
  const row = Math.floor(index / 4);
  return atlasGridCell(townSheet, 4, 2, col, row);
}

function getTownCutout(name) {
  if (townCutoutCache.has(name)) return townCutoutCache.get(name);
  const rect = townCell(name);
  if (!rect) return null;
  const cutout = buildChromaCutout(townSheet, rect);
  townCutoutCache.set(name, cutout);
  return cutout;
}

function castleCell(name) {
  const order = ["keep", "wall", "gate"];
  const index = order.indexOf(name);
  if (!castleSheetReady || index < 0) return null;
  return atlasGridCell(castleSheet, 3, 1, index, 0);
}

function getCastleCutout(name) {
  if (castleCutoutCache.has(name)) return castleCutoutCache.get(name);
  const rect = castleCell(name);
  if (!rect) return null;
  const cutout = buildChromaCutout(castleSheet, rect, { transparentThreshold: 82 });
  castleCutoutCache.set(name, cutout);
  return cutout;
}

function drawCastleCutout(name, cx, footY, options = {}) {
  const cutout = getCastleCutout(name);
  if (!cutout) return false;
  return drawPreparedCutout(cutout, cx, footY, options);
}

function castleWallCell(name) {
  const order = ["horizontal", "vertical", "corner", "gate"];
  const index = order.indexOf(name);
  if (!castleWallSheetReady || index < 0) return null;
  return atlasGridCell(castleWallSheet, 4, 1, index, 0);
}

function getCastleWallCutout(name) {
  if (castleWallCutoutCache.has(name)) return castleWallCutoutCache.get(name);
  const rect = castleWallCell(name);
  if (!rect) return null;
  const cutout = buildChromaCutout(castleWallSheet, rect, { transparentThreshold: 82 });
  castleWallCutoutCache.set(name, cutout);
  return cutout;
}

function drawCastleWallCutout(name, cx, footY, options = {}) {
  const cutout = getCastleWallCutout(name);
  if (!cutout) return false;
  return drawPreparedCutout(cutout, cx, footY, options);
}

function getCastleWallFrameCutout() {
  if (castleWallFrameCutout) return castleWallFrameCutout;
  if (!castleWallFrameReady || !castleWallFrame.naturalWidth || !castleWallFrame.naturalHeight) return null;
  castleWallFrameCutout = buildChromaCutout(castleWallFrame, { x: 0, y: 0, w: castleWallFrame.naturalWidth, h: castleWallFrame.naturalHeight }, { transparentThreshold: 82, removeAllChroma: true });
  return castleWallFrameCutout;
}

function drawCastleWallFrame(cx, footY, options = {}) {
  const cutout = getCastleWallFrameCutout();
  if (!cutout) return false;
  return drawPreparedCutout(cutout, cx, footY, options);
}

function tradeCartCell(frame) {
  if (!tradeCartSheetReady) return null;
  const col = Math.max(0, Math.min(3, frame || 0));
  return atlasGridCell(tradeCartSheet, 4, 1, col, 0);
}

function getTradeCartCutout(frame) {
  const key = `cart:${frame}`;
  if (tradeCartCutoutCache.has(key)) return tradeCartCutoutCache.get(key);
  const rect = tradeCartCell(frame);
  if (!rect) return null;
  const cutout = buildChromaCutout(tradeCartSheet, rect);
  tradeCartCutoutCache.set(key, cutout);
  return cutout;
}

function questGiverCell(questId, frame) {
  const order = ["elder", "ranger", "archivist"];
  const spriteId = npcSpriteVisuals[questId] || questId;
  const row = order.indexOf(spriteId);
  const col = Math.max(0, Math.min(3, frame || 0));
  if (!questGiverSheetReady || row < 0) return null;
  return atlasGridCell(questGiverSheet, 4, order.length, col, row);
}

function getQuestGiverCutout(questId, frame) {
  const key = `quest:${questId}:${frame}`;
  if (questGiverCutoutCache.has(key)) return questGiverCutoutCache.get(key);
  const rect = questGiverCell(questId, frame);
  if (!rect) return null;
  const cutout = buildChromaCutout(questGiverSheet, rect, { transparentThreshold: 72 });
  questGiverCutoutCache.set(key, cutout);
  return cutout;
}

function drawQuestGiverCutout(questId, frame, cx, footY, options = {}) {
  const cutout = getQuestGiverCutout(questId, frame);
  if (!cutout) return false;
  return drawPreparedCutout(cutout, cx, footY, options);
}

function unitCell(unitId, frame) {
  const spriteId = creatureBook[unitId]?.spriteId || unitId;
  const order = ["leafFox", "emberGolem", "tideWisp", "duskMoth", "thornArcher", "ironPikeman", "reefGuard", "moonSeer"];
  const row = order.indexOf(spriteId);
  const col = Math.max(0, Math.min(3, frame || 0));
  if (!unitSheetReady || row < 0) return null;
  return atlasGridCell(unitSheet, 4, order.length, col, row);
}

function atlasGridCell(image, cols, rows, col, row) {
  const x0 = Math.floor((image.width * col) / cols);
  const x1 = Math.floor((image.width * (col + 1)) / cols);
  const y0 = Math.floor((image.height * row) / rows);
  const y1 = Math.floor((image.height * (row + 1)) / rows);
  return [x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0)];
}

function getUnitCutout(unitId, frame) {
  const key = `unit:${unitId}:${frame}`;
  if (unitCutoutCache.has(key)) return unitCutoutCache.get(key);
  const rect = unitCell(unitId, frame);
  if (!rect) return null;
  const cutout = buildChromaCutout(unitSheet, rect, { transparentThreshold: 72 });
  unitCutoutCache.set(key, cutout);
  return cutout;
}

function drawUnitCutout(unitId, frame, cx, footY, options = {}) {
  const cutout = getUnitCutout(unitId, frame);
  if (!cutout) return false;
  return drawPreparedCutout(cutout, cx, footY, options);
}

function buildAlphaCutout(sourceImage, rect) {
  const source = document.createElement("canvas");
  source.width = rect[2];
  source.height = rect[3];
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  sourceCtx.drawImage(sourceImage, rect[0], rect[1], rect[2], rect[3], 0, 0, rect[2], rect[3]);
  const imageData = sourceCtx.getImageData(0, 0, source.width, source.height);
  const data = imageData.data;
  let minX = source.width;
  let minY = source.height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const alpha = data[(y * source.width + x) * 4 + 3];
      if (alpha > 20) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return {
    canvas: source,
    bounds: minX <= maxX ? { minX, minY, maxX, maxY } : { minX: 0, minY: 0, maxX: source.width - 1, maxY: source.height - 1 },
  };
}

function buildChromaCutout(sourceImage, rect, options = {}) {
  const sourceRect = Array.isArray(rect) ? { x: rect[0], y: rect[1], w: rect[2], h: rect[3] } : rect;
  if (!sourceRect || sourceRect.w <= 0 || sourceRect.h <= 0) return null;
  const source = document.createElement("canvas");
  source.width = sourceRect.w;
  source.height = sourceRect.h;
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  sourceCtx.drawImage(sourceImage, sourceRect.x, sourceRect.y, sourceRect.w, sourceRect.h, 0, 0, sourceRect.w, sourceRect.h);

  const imageData = sourceCtx.getImageData(0, 0, source.width, source.height);
  const data = imageData.data;
  const chromaKey = options.keyColor || sampleBackgroundColor(data, source.width, source.height);
  const transparentThreshold = options.transparentThreshold ?? 72;
  const remove = new Uint8Array(source.width * source.height);
  const queue = [];
  let minX = source.width;
  let minY = source.height;
  let maxX = 0;
  let maxY = 0;
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= source.width || y >= source.height) return;
    const idx = y * source.width + x;
    if (remove[idx]) return;
    const i = idx * 4;
    if (colorDistance(data[i], data[i + 1], data[i + 2], chromaKey) >= transparentThreshold) return;
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

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const idx = y * source.width + x;
      const i = (y * source.width + x) * 4;
      if (options.removeAllChroma && colorDistance(data[i], data[i + 1], data[i + 2], chromaKey) < transparentThreshold) {
        data[i + 3] = 0;
        continue;
      }
      if (remove[idx]) {
        data[i + 3] = 0;
        continue;
      }
      if (data[i + 3] > 0) data[i + 3] = 255;
      if (data[i + 3] > 20) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  pruneEdgeFragments(data, source.width, source.height);
  sourceCtx.putImageData(imageData, 0, 0);

  const bounds = alphaBounds(data, source.width, source.height);
  const cutout = {
    canvas: source,
    bounds: bounds.minX <= bounds.maxX ? bounds : { minX: 0, minY: 0, maxX: source.width - 1, maxY: source.height - 1 },
  };
  return cutout;
}

function alphaBounds(data, width, height) {
  const bounds = { minX: width, minY: height, maxX: -1, maxY: -1 };
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] <= 20) continue;
      bounds.minX = Math.min(bounds.minX, x);
      bounds.minY = Math.min(bounds.minY, y);
      bounds.maxX = Math.max(bounds.maxX, x);
      bounds.maxY = Math.max(bounds.maxY, y);
    }
  }
  return bounds;
}

function pruneEdgeFragments(data, width, height) {
  const seen = new Uint8Array(width * height);
  const components = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const start = y * width + x;
      if (seen[start] || data[start * 4 + 3] === 0) continue;
      const pixels = [start];
      const component = { pixels, area: 0, touchesEdge: false };
      seen[start] = 1;
      for (let index = 0; index < pixels.length; index += 1) {
        const pixel = pixels[index];
        const px = pixel % width;
        const py = Math.floor(pixel / width);
        component.area += 1;
        if (px === 0 || py === 0 || px === width - 1 || py === height - 1) component.touchesEdge = true;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([ox, oy]) => {
          const nx = px + ox;
          const ny = py + oy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;
          const next = ny * width + nx;
          if (seen[next] || data[next * 4 + 3] === 0) return;
          seen[next] = 1;
          pixels.push(next);
        });
      }
      components.push(component);
    }
  }
  if (components.length <= 1) return;
  const largest = components.reduce((best, component) => (component.area > best.area ? component : best), components[0]);
  components.forEach((component) => {
    if (component === largest) return;
    if (component.area > 12 && (!component.touchesEdge || component.area > largest.area * 0.25)) return;
    component.pixels.forEach((pixel) => {
      data[pixel * 4 + 3] = 0;
    });
  });
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

function getHeroBattlePortraitDataUrl(direction) {
  const cacheKey = `battle-hero:${direction}`;
  if (portraitCache.has(cacheKey)) return portraitCache.get(cacheKey);
  const cutout = getHeroDirectionCutout(`${direction}:0`) || getPortraitDataUrl("hero");
  if (typeof cutout === "string") return cutout;
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
  portraitCache.set(cacheKey, url);
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

function getUnitPortraitDataUrl(unitId) {
  const spriteId = creatureBook[unitId]?.spriteId || unitId;
  const cacheKey = `unit-portrait:${unitId}:${spriteId}`;
  if (portraitCache.has(cacheKey)) return portraitCache.get(cacheKey);
  const cutout = getUnitCutout(unitId, 0);
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
  const scale = Math.min(64 / sw, 64 / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  portraitCtx.drawImage(source, bounds.minX, bounds.minY, sw, sh, (portrait.width - dw) / 2, portrait.height - dh - 4, dw, dh);
  const url = portrait.toDataURL("image/png");
  portraitCache.set(cacheKey, url);
  return url;
}

function spriteNameForUnit(unit) {
  if (!unit.id) return "hero";
  if (unit.spriteId && unit.spriteId !== unit.id) return unit.spriteId;
  if (unit.id === "leafFox") return "leafFox";
  if (unit.id === "emberGolem") return "emberGolem";
  if (unit.id === "tideWisp") return "tideWisp";
  return "";
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
    ctx.globalAlpha = 1;
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, dw, dh);
  } else {
    ctx.globalAlpha = 1;
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

function drawTownCutout(name, cx, footY, options = {}) {
  const cutout = getTownCutout(name);
  if (!cutout) return false;
  return drawPreparedCutout(cutout, cx, footY, options);
}

function drawTradeCartCutout(frame, cx, footY, options = {}) {
  const cutout = getTradeCartCutout(frame);
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
    ctx.globalAlpha = 1;
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, dw, dh);
  } else {
    ctx.globalAlpha = 1;
    ctx.drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh);
  }
  ctx.restore();
  return true;
}

function drawTileAtPixel(px, py, tile, targetCtx = ctx) {
  const spriteName = tile === "W" ? "water" : tile === "B" ? "bridge" : tile === "F" ? "forest" : tile === "M" ? "mountain" : tile === "R" ? "road" : "grass";
  const color = tile === "W" ? palette.water : tile === "B" ? palette.bridge : tile === "F" ? palette.forest : tile === "M" ? palette.mountain : tile === "R" ? palette.road : palette.grass;
  targetCtx.fillStyle = color;
  targetCtx.fillRect(px, py, TILE, TILE);
  const tileX = Math.round(px / TILE);
  const tileY = Math.round(py / TILE);
  if (drawAtlas(spriteName, px, py, TILE, TILE, { alpha: tile === "G" ? 0.7 : 0.86, inset: tile === "W" ? 10 : 8 }, targetCtx)) {
    if (tile === "G" && (tileX + tileY) % 3 !== 0) {
      targetCtx.fillStyle = "rgba(95, 174, 93, 0.28)";
      targetCtx.fillRect(px, py, TILE, TILE);
    }
    return;
  }
  targetCtx.fillStyle = tile === "G" ? palette.grass2 : "rgba(255,255,255,0.08)";
  if ((tileX + tileY) % 2 === 0) targetCtx.fillRect(px + 3, py + 24, 7, 3);
  if (tile === "F") drawTree(px, py);
  if (tile === "M") drawMountain(px, py);
  if (tile === "W") drawWater(px, py, tileX, tileY);
  if (tile === "B") drawBridge(px, py, targetCtx);
}

function drawTile(x, y, tile, targetCtx = ctx) {
  drawTileAtPixel(x * TILE, y * TILE, tile, targetCtx);
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

function drawBridge(px, py, targetCtx = ctx) {
  targetCtx.fillStyle = "#9b673a";
  targetCtx.fillRect(px + 2, py + 9, TILE - 4, 14);
  targetCtx.fillStyle = "#d6a46b";
  for (let offset = 5; offset < TILE - 4; offset += 7) {
    targetCtx.fillRect(px + offset, py + 8, 3, 16);
  }
  targetCtx.fillStyle = "rgba(61, 35, 20, 0.45)";
  targetCtx.fillRect(px + 2, py + 15, TILE - 4, 2);
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
    if (x === state.x && y === state.y && ["battle", "final", "npc"].includes(event.type)) return;
    drawEventEntity(key, event, x, y);
  });
}

function drawWorldEntities() {
  const entities = [];
  events.forEach((event, key) => {
    const [x, y] = key.split(",").map(Number);
    if (!isOnScreen(x, y)) return;
    if (x === state.x && y === state.y && ["battle", "final"].includes(event.type)) return;
    entities.push({ y: y + 0.82, x, draw: () => drawEventEntity(key, event, x, y) });
  });
  tradeCartEntities().forEach((cart) => entities.push(cart));
  (state.enemyHeroes || []).forEach((hero) => {
    if (hero.defeated || !isOnScreen(hero.x, hero.y, 2)) return;
    entities.push({ y: hero.y + 0.88, x: hero.x, draw: () => drawRoamingHero(hero) });
  });
  entities.push({ y: visual.y + 0.9, x: visual.x, draw: () => drawHero(visual.x, visual.y) });
  entities
    .sort((a, b) => (a.y - b.y) || (a.x - b.x))
    .forEach((entity) => entity.draw());
}

function drawEventEntity(key, event, x, y) {
  const px = screenTileX(x);
  const py = screenTileY(y);
  if (event.type === "landmark") drawLandmark(px, py, event);
  if (event.type === "town") drawBuilding(px, py, key, event);
  if (event.type === "npc") drawNpc(px, py, event);
  if (event.type === "mine") drawMine(px, py);
  if (event.type === "chest") drawChest(px, py, state.visited[key]);
  if (event.type === "battle" && event.gate) {
    drawMonster(encounters[event.encounter].color, x, y, event.encounter);
    if (!state.visited[key]) drawEnemyHeroMarker(px, py - 10);
  }
  if (event.type === "battle" && !state.visited[key] && !event.gate) drawMonster(encounters[event.encounter].color, x, y, event.encounter);
  if (event.type === "final") drawTower(px, py);
  if (state.visited[key] && shouldFlagEvent(event)) drawPlayerFlag(px, py);
}

function drawRoamingHero(hero) {
  const definition = roamingHeroDefinitions[hero.id];
  if (!definition) return;
  const bob = Math.sin(animationTime / 330 + hero.x * 0.2) * 1.2;
  const frame = frameForWorldSprite(false, hero.x * 0.1 + hero.y * 0.07);
  const px = screenTileX(hero.x);
  const py = screenTileY(hero.y);
  const footY = py + 35;
  const flip = hero.facing === "left";
  drawGrounding(px + 16, py + 29, hero.x, hero.y, 26, 8);
  const visual = enemyVisualForEncounter(definition.encounter);
  if (drawEnemyVisual(visual, frame, px + 16, footY, { targetHeight: NPC_WORLD_HEIGHT, offsetY: bob, flip })) {
    drawFootTint(px, py, hero.x, hero.y);
  } else {
    drawMonster(encounters[definition.encounter].color, hero.x, hero.y, definition.encounter);
  }
  drawEnemyHeroMarker(px, py);
}

function drawEnemyHeroMarker(px, py) {
  ctx.save();
  ctx.fillStyle = "rgba(15,18,25,0.78)";
  ctx.beginPath();
  ctx.arc(px + 16, py - 14, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d95d5d";
  ctx.font = "700 12px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("!", px + 16, py - 14);
  ctx.restore();
}

function drawTradeCarts() {
  tradeCartEntities().forEach((entity) => entity.draw());
}

function tradeCartEntities() {
  const towns = ownedTownEntries();
  const caravanTowns = towns.filter(([, town]) => town.buildings.includes("caravanPost"));
  if (!caravanTowns.length) return [];
  const targets = towns.length > 1 ? towns : Array.from(events.entries()).filter(([, event]) => event.type === "town");
  return caravanTowns.map(([fromKey], index) => {
    const target = targets[(index + 1) % targets.length];
    if (!target || target[0] === fromKey) return null;
    const from = pointFromKey(fromKey);
    const to = pointFromKey(target[0]);
    const loop = (animationTime / 24000 + index * 0.31) % 2;
    const returning = loop > 1;
    const progress = returning ? 2 - loop : loop;
    const x = from.x + (to.x - from.x) * progress;
    const y = from.y + (to.y - from.y) * progress;
    if (!isOnScreen(x, y, 2)) return null;
    const direction = returning ? (from.x >= to.x ? 1 : -1) : (to.x >= from.x ? 1 : -1);
    return { y: y + 0.8, x, draw: () => drawTradeCart(screenTileX(x), screenTileY(y), direction, index) };
  }).filter(Boolean);
}

function pointFromKey(key) {
  const [x, y] = key.split(",").map(Number);
  return { x, y };
}

function drawTradeCart(px, py, direction = 1, offset = 0) {
  const frame = Math.floor(animationTime / 220 + offset) % 4;
  if (drawTradeCartCutout(frame, px + 16, py + 32, { targetHeight: 24, flip: direction < 0 })) return;
  ctx.save();
  ctx.translate(px + 16, py + 21);
  ctx.scale(direction, 1);
  drawShadow(-1, 8, 20, 5);
  ctx.fillStyle = "#9b5f36";
  ctx.fillRect(-9, -3, 18, 9);
  ctx.fillStyle = "#d6aa62";
  ctx.fillRect(-6, -7, 12, 5);
  ctx.fillStyle = "#17120a";
  ctx.beginPath();
  ctx.arc(-6, 7, 3, 0, Math.PI * 2);
  ctx.arc(7, 7, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLandmark(px, py, event) {
  if (event.landmark === "signpost") return drawSignpost(px, py);
  if (event.landmark === "ruins") return drawRuins(px, py);
  if (event.landmark === "camp") return drawRoadCamp(px, py);
  if (event.landmark === "statue") return drawMonument(px, py);
}

function drawSignpost(px, py) {
  drawShadow(px + 16, py + 27, 18, 6);
  ctx.save();
  ctx.fillStyle = "#6b4735";
  ctx.fillRect(px + 14, py + 10, 4, 18);
  ctx.fillStyle = "#d6aa62";
  ctx.fillRect(px + 7, py + 8, 18, 9);
  ctx.strokeStyle = "#51341f";
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 7.5, py + 8.5, 17, 8);
  ctx.fillStyle = "#51341f";
  ctx.fillRect(px + 10, py + 11, 10, 2);
  ctx.restore();
}

function drawRuins(px, py) {
  drawShadow(px + 16, py + 28, 26, 7);
  ctx.save();
  ctx.fillStyle = "#6b707d";
  ctx.fillRect(px + 6, py + 16, 7, 12);
  ctx.fillRect(px + 18, py + 12, 8, 16);
  ctx.fillRect(px + 12, py + 20, 5, 8);
  ctx.fillStyle = "#a7adb8";
  ctx.fillRect(px + 7, py + 17, 5, 2);
  ctx.fillRect(px + 19, py + 13, 6, 2);
  ctx.restore();
}

function drawRoadCamp(px, py) {
  drawShadow(px + 16, py + 28, 28, 8);
  ctx.save();
  ctx.fillStyle = "#8a5937";
  ctx.beginPath();
  ctx.moveTo(px + 16, py + 8);
  ctx.lineTo(px + 7, py + 25);
  ctx.lineTo(px + 25, py + 25);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#d6aa62";
  ctx.fillRect(px + 6, py + 22, 20, 4);
  ctx.fillStyle = "#f0c15b";
  ctx.beginPath();
  ctx.arc(px + 23, py + 22, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(240,193,91,0.3)";
  ctx.beginPath();
  ctx.arc(px + 23, py + 22, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMonument(px, py) {
  drawShadow(px + 16, py + 28, 24, 7);
  ctx.save();
  ctx.fillStyle = "#b8bfca";
  ctx.fillRect(px + 12, py + 8, 8, 17);
  ctx.fillRect(px + 9, py + 23, 14, 5);
  ctx.fillStyle = "#fff2b6";
  ctx.beginPath();
  ctx.moveTo(px + 16, py + 4);
  ctx.lineTo(px + 19, py + 10);
  ctx.lineTo(px + 16, py + 9);
  ctx.lineTo(px + 13, py + 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function shouldFlagEvent(event) {
  return event.type === "mine" || event.type === "battle" || event.type === "town";
}

function drawBuilding(px, py, key, event) {
  const town = getTownState(key);
  const owned = town.owner === "player";
  const baseName = owned && town.buildings.length >= 3 ? "upgradedTown" : owned ? "ownedTown" : "neutralTown";
  const townHeight = owned ? 54 : 44;
  drawShadow(px + 16, py + 30, owned ? 48 : 34, 10);
  if (owned) drawOwnedTownMarker(px, py, town);
  if (drawTownCutout(baseName, px + 16, py + 38, { targetHeight: townHeight })) {
    if (owned) drawOwnedTownBanner(px, py, town);
    return;
  }
  if (drawAtlas("town", px - 10, py - 14, owned ? 54 : 48, owned ? 48 : 42)) {
    if (owned) drawOwnedTownBanner(px, py, town);
    return;
  }
  const color = owned ? palette.playerFlag : palette.town;
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
  if (owned) drawOwnedTownBanner(px, py, town);
}

function drawOwnedTownMarker(px, py, town) {
  const rank = Math.min(4, 1 + Math.floor((town.buildings?.length || 0) / 2));
  ctx.save();
  ctx.strokeStyle = palette.ownedTownRing;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.82;
  ctx.beginPath();
  ctx.ellipse(px + 16, py + 27, 19 + rank * 2, 8 + rank, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = palette.ownedTownGlow;
  ctx.fill();
  ctx.restore();
}

function drawOwnedTownBanner(px, py, town) {
  const bannerWidth = Math.min(28, 14 + (town.buildings?.length || 0) * 3);
  ctx.save();
  ctx.fillStyle = palette.playerFlag;
  ctx.strokeStyle = "#0f1219";
  ctx.lineWidth = 2;
  ctx.fillRect(px + 2, py + 1, 3, 26);
  ctx.strokeRect(px + 2, py + 1, 3, 26);
  ctx.fillStyle = palette.ownedTownRing;
  ctx.beginPath();
  ctx.moveTo(px + 5, py + 2);
  ctx.lineTo(px + 5 + bannerWidth, py + 2);
  ctx.lineTo(px + 5 + bannerWidth - 5, py + 10);
  ctx.lineTo(px + 5, py + 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawMine(px, py) {
  drawShadow(px + 16, py + 27, 26, 8);
  if (drawTownCutout("mineOutpost", px + 16, py + 35, { targetHeight: 42 })) return;
  if (drawAtlas("mine", px - 4, py - 8, 42, 42)) return;
  ctx.fillStyle = palette.mine;
  ctx.fillRect(px + 6, py + 17, 20, 11);
  ctx.fillStyle = "#241914";
  ctx.fillRect(px + 11, py + 13, 10, 15);
  ctx.strokeStyle = "#d6aa62";
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 8, py + 15, 16, 13);
}

function drawNpc(px, py, event) {
  const quest = npcQuests[event.quest];
  if (!quest) return;
  const status = state.quests?.[event.quest] || "new";
  const ready = status === "accepted" && quest?.complete?.();
  const phase = Math.floor(animationTime / 180) % 4;
  const bob = Math.sin(animationTime / 360 + px * 0.03) * 0.7;
  drawShadow(px + 16, py + 30, 22, 7);
  if (drawQuestGiverCutout(event.quest, phase, px + 16, py + 35, { targetHeight: 44, offsetY: bob })) {
    drawNpcQuestMarker(px, py, ready, status);
    return;
  }
  const cloak = event.quest === "elder" ? "#66a7d8" : event.quest === "ranger" ? "#68b36b" : "#b88ce6";
  const trim = ready ? "#fff2b6" : status === "claimed" ? "#68b36b" : "#f0c15b";
  const hood = event.quest === "ranger";
  const book = event.quest === "archivist";
  const staff = event.quest === "elder";
  ctx.save();
  ctx.translate(0, bob);
  if (staff) {
    ctx.fillStyle = "#6b4735";
    ctx.fillRect(px + 7 + (phase % 2), py + 7, 3, 22);
    ctx.fillStyle = "#f0c15b";
    ctx.fillRect(px + 6 + (phase % 2), py + 5, 5, 5);
  }
  ctx.fillStyle = cloak;
  ctx.beginPath();
  ctx.moveTo(px + 16, py + 8);
  ctx.lineTo(px + 8, py + 29);
  ctx.lineTo(px + 24, py + 29);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shadeColor(cloak, -26);
  ctx.fillRect(px + 11, py + 14, 10, 14);
  ctx.fillStyle = trim;
  ctx.fillRect(px + 10, py + 25, 12, 3);
  ctx.fillStyle = "#f4ead7";
  ctx.fillRect(px + 12, py + 5, 8, 8);
  if (hood) {
    ctx.fillStyle = shadeColor(cloak, -20);
    ctx.beginPath();
    ctx.arc(px + 16, py + 8, 8, Math.PI, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#151a24";
  ctx.fillRect(px + 13, py + 8, 2, 2);
  ctx.fillRect(px + 18, py + 8, 2, 2);
  if (book) {
    ctx.fillStyle = "#d6aa62";
    ctx.fillRect(px + 20, py + 15, 6, 8);
    ctx.strokeStyle = "#51341f";
    ctx.strokeRect(px + 20.5, py + 15.5, 5, 7);
  }
  ctx.fillStyle = "#0f1219";
  ctx.fillRect(px + 8 + (phase === 1 ? 1 : 0), py + 28, 7, 3);
  ctx.fillRect(px + 18 - (phase === 3 ? 1 : 0), py + 28, 7, 3);
  ctx.translate(0, -bob);
  ctx.restore();
  drawNpcQuestMarker(px, py, ready, status);
}

function shadeColor(hex, amount) {
  const value = hex.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(value.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(value.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(value.slice(4, 6), 16) + amount));
  return `rgb(${r},${g},${b})`;
}

function drawNpcQuestMarker(px, py, ready, status) {
  ctx.save();
  ctx.fillStyle = "rgba(15, 18, 25, 0.72)";
  ctx.beginPath();
  ctx.arc(px + 16, py + 1, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ready ? "#fff2b6" : status === "claimed" ? "#68b36b" : "#f0c15b";
  ctx.font = "700 13px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(ready ? "!" : status === "new" ? "?" : "...", px + 16, py + 1);
  ctx.restore();
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

function drawFinalFortress(px, py) {
  const centerX = px + 16;
  const keepX = centerX;
  let painted = false;

  drawFinalFortressGround(px, py);
  drawShadow(centerX, py + 80, 176, 18);
  ctx.save();
  ctx.fillStyle = "rgba(55, 49, 41, 0.18)";
  ctx.beginPath();
  ctx.ellipse(centerX, py + 52, 84, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  painted = drawCastleCutout("keep", keepX, py + 58, { targetHeight: 94 }) || painted;
  if (!painted) painted = drawAtlas("castle", px - 30, py - 48, 100, 82) || painted;
  return painted;
}

function drawFinalFortressGround(px, py) {
  for (let worldY = finalFortressTerrainBounds.minY; worldY <= finalFortressTerrainBounds.maxY; worldY += 1) {
    for (let worldX = finalFortressTerrainBounds.minX; worldX <= finalFortressTerrainBounds.maxX; worldX += 1) {
      const tile = worldX === finalFortressGateTile.x && worldY === finalFortressGateTile.y ? "R" : "G";
      const tilePx = px + (worldX - finalFortressAnchor.x) * TILE;
      const tilePy = py + (worldY - finalFortressAnchor.y) * TILE;
      drawTileAtPixel(tilePx, tilePy, tile);
    }
  }
}

function drawTower(px, py) {
  if (drawFinalFortress(px, py)) return;
  drawShadow(px + 16, py + 29, 40, 9);
  if (drawCastleCutout("keep", px + 16, py + 40, { targetHeight: 66 })) return;
  if (drawAtlas("castle", px - 18, py - 24, 70, 58)) return;
  ctx.fillStyle = palette.tower;
  ctx.fillRect(px + 10, py + 8, 13, 21);
  ctx.fillStyle = "#5b3b75";
  ctx.fillRect(px + 8, py + 5, 17, 7);
  ctx.fillStyle = "#d95d5d";
  ctx.fillRect(px + 15, py + 15, 4, 5);
}

function drawCastleWall(px, py) {
  drawShadow(px + 16, py + 29, 34, 8);
  if (drawCastleWallCutout("horizontal", px + 16, py + 34, { targetHeight: 30 })) return;
  if (drawCastleCutout("wall", px + 16, py + 34, { targetHeight: 34 })) return;
  ctx.save();
  ctx.fillStyle = "#555b6d";
  ctx.fillRect(px + 2, py + 12, 28, 18);
  ctx.fillStyle = "#747b8d";
  for (let x = 3; x < 30; x += 8) ctx.fillRect(px + x, py + 6, 5, 9);
  ctx.strokeStyle = "#272b37";
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 2.5, py + 12.5, 27, 17);
  ctx.strokeStyle = "rgba(244,234,215,0.22)";
  ctx.beginPath();
  ctx.moveTo(px + 5, py + 18);
  ctx.lineTo(px + 28, py + 18);
  ctx.moveTo(px + 8, py + 25);
  ctx.lineTo(px + 25, py + 25);
  ctx.stroke();
  ctx.restore();
}

function drawFortressWallSegment(px, py, x, y) {
  const left = x === 69;
  const right = x === 73;
  const top = y === 3;
  const bottom = y === 5;
  drawShadow(px + 16, py + 29, top || bottom ? 34 : 24, 8);
  if (left || right) {
    if (drawCastleWallCutout("vertical", px + 16, py + 36, { targetHeight: 38, flip: right })) return;
  } else if (top || bottom) {
    if (drawCastleWallCutout("horizontal", px + 16, py + 34, { targetHeight: 30 })) return;
  }
  ctx.save();
  ctx.fillStyle = "#555b6d";
  if (left || right) {
    ctx.fillRect(px + 9, py + 8, 14, 24);
    ctx.fillStyle = "#747b8d";
    for (let step = 0; step < 4; step += 1) ctx.fillRect(px + 8, py + 6 + step * 6, 16, 3);
  } else {
    ctx.fillRect(px + 2, py + 12, 28, 18);
    ctx.fillStyle = "#747b8d";
    for (let wallX = 3; wallX < 30; wallX += 8) ctx.fillRect(px + wallX, py + 6, 5, 9);
  }
  ctx.strokeStyle = "#272b37";
  ctx.lineWidth = 2;
  if (left || right) ctx.strokeRect(px + 9.5, py + 8.5, 13, 23);
  else ctx.strokeRect(px + 2.5, py + 12.5, 27, 17);
  ctx.restore();
}

function drawCastleGate(px, py) {
  drawShadow(px + 16, py + 30, 44, 10);
  if (drawCastleWallCutout("gate", px + 16, py + 47, { targetHeight: 58 })) return;
  if (drawCastleCutout("gate", px + 16, py + 41, { targetHeight: 52 })) return;
  drawCastleWall(px - 12, py + 1);
  drawCastleWall(px + 12, py + 1);
  ctx.save();
  ctx.fillStyle = "#4d5364";
  ctx.fillRect(px + 4, py + 5, 24, 27);
  ctx.fillStyle = "#2b1d1b";
  ctx.beginPath();
  ctx.moveTo(px + 8, py + 32);
  ctx.lineTo(px + 8, py + 18);
  ctx.quadraticCurveTo(px + 16, py + 10, px + 24, py + 18);
  ctx.lineTo(px + 24, py + 32);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = palette.ownedTownRing;
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 3.5, py + 4.5, 25, 27);
  ctx.fillStyle = "#d95d5d";
  ctx.fillRect(px + 14, py - 2, 4, 9);
  ctx.restore();
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
  if (drawUnitCutout(sprite, options.frame ?? animationFrame(false), px + 16, py + 35, { targetHeight: options.targetHeight || NPC_WORLD_HEIGHT, offsetY: bob, flip: options.flip })) {
    drawFootTint(px, py, tileX, tileY);
    return true;
  }
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
  const visual = enemyVisualForEncounter(encounterId);
  const px = screenTileX(tileX);
  const py = screenTileY(tileY);
  const footY = py + 35;
  if (drawEnemyVisual(visual, enemyFrame, px + 16, footY, { targetHeight: NPC_WORLD_HEIGHT, offsetY: bob, flip: true })) {
    drawFootTint(px, py, tileX, tileY);
    return;
  }
  const cx = px + 16;
  const cy = py + 16;
  drawGrounding(cx, cy + 12, tileX, tileY, 22, 7);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 14 + bob);
  ctx.lineTo(cx - 11, cy + 9 + bob);
  ctx.lineTo(cx + 11, cy + 9 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shadeColor(color, -35);
  ctx.fillRect(cx - 6, cy - 2 + bob, 12, 12);
  ctx.fillStyle = "#fff8df";
  ctx.fillRect(cx - 5, cy - 6 + bob, 3, 3);
  ctx.fillRect(cx + 3, cy - 6 + bob, 3, 3);
}

function drawEnemyVisual(visual, frame, cx, footY, options = {}) {
  if (!visual) return false;
  if (visual.source === "enemy") return drawEnemyCutout(visual.id, frame, cx, footY, options);
  if (visual.source === "unit") return drawUnitCutout(visual.id, frame, cx, footY, options);
  if (visual.source === "character") return drawCharacterCutout(visual.id, frame, cx, footY, options) || drawCutout(visual.id, cx, footY, 0, 0, { scale: 0.42, fullFrame: true, ...options });
  return false;
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
  const townCount = ownedTownEntries().length;
  const townTarget = countEvents("town");
  const relicCount = uniqueRelicCount();
  const incomePreview = townEconomyPreview().total;
  const formation = partyCompositionSummary();
  const immediateRows = [
    { text: `Main objective: ${campaignMainObjective()}`, done: state.won },
    { text: campaignSideObjective() || "Side objective: none", done: false },
  ];
  const npcQuestRows = Object.entries(npcQuests).map(([id, quest]) => {
    const status = state.quests?.[id] || "new";
    const ready = status === "accepted" && quest.complete();
    const done = status === "claimed";
    const label = done ? "Done" : ready ? "Return for reward" : status === "accepted" ? quest.objective : "Talk to NPC";
    return { text: `${quest.title}: ${label}`, done };
  });
  const townQuestRows = Object.entries(townCommissionDefinitions).map(([id, quest]) => {
    const status = state.quests?.[id] || "new";
    const ready = status === "accepted" && quest.complete();
    const done = status === "claimed";
    const label = done ? "Done" : ready ? "Claim at town" : status === "accepted" ? quest.objective : "Accept at town notice board";
    return { text: `${quest.title}: ${label}`, done };
  });
  heroStats.innerHTML =
    statSection("Champion") +
    stat("Name", championName()) +
    stat("Level", state.hero.level) +
    stat("HP", `${state.hero.hp}/${state.hero.maxHp}`) +
    stat("XP", `${state.hero.xp}/${xpToNext(state.hero)}`) +
    stat("Next", `${Math.max(0, xpToNext(state.hero) - (state.hero.xp || 0))} XP`) +
    statSection("Combat") +
    stat("Attack", state.hero.atk) +
    stat("Defense", state.hero.def) +
    stat("Speed", state.hero.speed) +
    stat("Range", rangeText(state.hero)) +
    statSection("Campaign") +
    stat("Gold", state.gold) +
    stat("Daylight", dayProgressMarkup()) +
    stat("Income", `${incomePreview}/day`) +
    stat("Relics", `${relicCount}/4`) +
    stat("Towns", `${townCount}/${townTarget}`) +
    stat("Mines", `${mineCount}/${mineTarget}`) +
    stat("Outposts", `${battleCount}/${battleTarget}`) +
    stat("Skills", state.hero.skills?.length ? state.hero.skills.join(", ") : "None");
  partyList.innerHTML = `<div class="unit"><div><div class="unit-name"><span>Warband Readout</span><span>${state.party.length + 1} units</span></div><div class="unit-stats">${formation.strengths}</div><div class="unit-skill">${formation.advice}</div></div></div>` + renderUnit(state.hero, -1) + state.party.map((unit, index) => renderUnit(unit, index)).join("");
  renderInventory();
  const storyQuests = [
    { text: `Build a four-unit warband (${state.party.length}/4)`, done: state.party.length >= 4 },
    { text: `Recover relic treasures (${relicCount}/4)`, done: relicCount >= 4 },
    { text: `Bring ${townTarget} towns under your banner`, done: townCount >= townTarget },
    { text: `Secure ${mineTarget} mines`, done: mineCount >= mineTarget },
    { text: `Break ${battleTarget} outposts`, done: battleCount >= battleTarget },
  ];
  const winRows = victoryConditions().map((condition) => ({ text: condition.text, done: condition.done || condition.ready || (state.won && state.victoryType === condition.id) }));
  questLog.innerHTML = questSection("Immediate Goals", immediateRows) + questSection("Win Conditions", winRows) + questSection("Story Goals", storyQuests) + questSection("NPC Quests", npcQuestRows) + questSection("Town Commissions", townQuestRows);
  renderMinimap();
}

function questSection(title, rows) {
  return `
    <section class="quest-section">
      <h3>${title}</h3>
      <ul>
        ${rows.map((quest) => `<li class="${quest.done ? "done" : ""}">${quest.text}</li>`).join("")}
      </ul>
    </section>
  `;
}

function uniqueRelicCount() {
  return new Set((state.relics || []).filter((item) => relicItems.has(item))).size;
}

function renderMinimap() {
  if (!minimap || !minimapCtx) return;
  const scaleX = minimap.width / MAP_W;
  const scaleY = minimap.height / MAP_H;
  minimapCtx.clearRect(0, 0, minimap.width, minimap.height);
  for (let y = 0; y < MAP_H; y += 1) {
    for (let x = 0; x < MAP_W; x += 1) {
      minimapCtx.fillStyle = minimapColorForTile(map[y]?.[x]);
      minimapCtx.fillRect(Math.floor(x * scaleX), Math.floor(y * scaleY), Math.ceil(scaleX), Math.ceil(scaleY));
    }
  }
  events.forEach((event, key) => {
    const [x, y] = key.split(",").map(Number);
    minimapCtx.fillStyle = state.visited[key] ? "#68b36b" : event.type === "battle" ? "#d95d5d" : "#f0c15b";
    minimapCtx.fillRect(Math.floor(x * scaleX) - 1, Math.floor(y * scaleY) - 1, 4, 4);
  });
  const px = Math.floor(state.x * scaleX);
  const py = Math.floor(state.y * scaleY);
  minimapCtx.fillStyle = "#ffffff";
  minimapCtx.fillRect(px - 2, py - 2, 5, 5);
  minimapCtx.strokeStyle = "#0f1219";
  minimapCtx.strokeRect(px - 2.5, py - 2.5, 5, 5);
}

function minimapColorForTile(tile) {
  if (tile === "W") return "#24547c";
  if (tile === "B") return "#c7945a";
  if (tile === "F") return "#245d38";
  if (tile === "M") return "#6f7075";
  if (tile === "R") return "#9b7449";
  if (tile === "T") return "#c99b4e";
  if (tile === "C") return "#9599a7";
  if (tile === "H") return "#d2a44f";
  return "#5fae5d";
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

function movePartyUnit(index, direction) {
  if (!Number.isInteger(index) || !Number.isInteger(direction)) return;
  const target = index + direction;
  if (index < 0 || target < 0 || index >= state.party.length || target >= state.party.length) return;
  const [unit] = state.party.splice(index, 1);
  state.party.splice(target, 0, unit);
  setMessage(`${unit.name} moves to formation slot ${target + 1}.`);
  renderAll();
}

function dismissPartyUnit(index) {
  if (!Number.isInteger(index) || index < 0 || index >= state.party.length) return;
  if (activeBattle || activeNight) {
    setMessage("You cannot dismiss units during battle or night watch.");
    return;
  }
  const unit = state.party[index];
  openModal("Dismiss Unit", `Dismiss ${unit.name}? This frees a party slot, but the unit leaves permanently.`, [
    { label: "Keep Unit", secondary: true, action: () => renderAll() },
    {
      label: "Dismiss",
      action: () => {
        state.party.splice(index, 1);
        setMessage(`${unit.name} leaves the party. A town can now recruit or train another unit.`);
        renderAll();
      },
    },
  ]);
}

function stat(label, value) {
  return `<div class="stat"><b>${label}</b><span>${value}</span></div>`;
}

function statSection(title) {
  return `<div class="stat-section">${title}</div>`;
}

function dayProgressMarkup() {
  const progress = dayProgressPercent();
  const label = state.nightReady ? "Camp" : `${state.dayProgress || 0}/${DAY_LENGTH_STEPS}`;
  return `<span class="day-progress-label">${label}</span><span class="day-progress" style="--fill:${progress}%"><i></i></span>`;
}

function renderUnit(unit, partyIndex = -1) {
  const fill = Math.max(0, Math.round((unit.hp / unit.maxHp) * 100));
  const xpFill = Math.max(0, Math.round(((unit.xp || 0) / xpToNext(unit)) * 100));
  const color = unit.color || "#f0c15b";
  const spriteClass = unit.id ? ` sprite-${unit.id}` : " sprite-hero";
  const portraitKey = spriteNameForUnit(unit);
  const portrait = unit.id && unitSheetReady && unitCell(unit.id, 0)
    ? getUnitPortraitDataUrl(unit.id)
    : portraitKey && (characterSheetReady || spriteSheetReady) ? getPortraitDataUrl(portraitKey) : "";
  const sprite = portrait
    ? `<img class="unit-sprite-img" src="${portrait}" alt="" />`
    : `<div class="unit-sprite${spriteClass}" style="--unit-color:${color}"></div>`;
  const controls = partyIndex >= 0 ? `<div class="unit-actions"><button type="button" data-party-move="${partyIndex}" data-dir="-1" aria-label="Move ${unit.name} up">Up</button><button type="button" data-party-move="${partyIndex}" data-dir="1" aria-label="Move ${unit.name} down">Down</button><button type="button" class="danger" data-party-dismiss="${partyIndex}" aria-label="Dismiss ${unit.name}">Dismiss</button></div>` : "";
  const role = unitRole(unit);
  const summary = unitRoleSummary(unit);
  const skill = unit.skill ? ` Skill: ${escapeHtml(unit.skill)}.` : "";
  return `<div class="unit">${sprite}<div><div class="unit-name"><span>${unit.name}</span><span>Lv ${unit.level}</span></div><div class="unit-stats">${role} / Atk ${unit.atk} / Def ${unit.def} / Spd ${unit.speed} / ${unit.moveType || "ground"} / ${rangeText(unit)}</div><div class="unit-skill">${summary}${skill}</div><div class="meter" style="--fill:${fill}%"><span></span></div><div class="meter xp-meter" title="Experience ${unit.xp || 0}/${xpToNext(unit)}" style="--fill:${xpFill}%"><span></span></div>${controls}</div></div>`;
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
  ensureHeldMovementLoop();
  if (!visual.moving) move(delta[0], delta[1]);
});

document.addEventListener("keyup", (event) => {
  if (!keyMap[event.key]) return;
  heldKeys.delete(event.key);
  if (!getHeldDirection()) stopHeldMovementLoop();
});

window.addEventListener("blur", () => {
  heldKeys.clear();
  clearHeldPadDirections();
  stopHeldMovementLoop();
});

document.querySelectorAll("[data-move]").forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const dir = button.dataset.move;
    if (!padDirectionMap[dir]) return;
    button.setPointerCapture?.(event.pointerId);
    heldPadDirections.delete(dir);
    heldPadDirections.add(dir);
    ensureHeldMovementLoop();
    button.classList.add("pressed");
    const delta = padDirectionMap[dir];
    if (!visual.moving) move(delta[0], delta[1]);
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => {
    button.addEventListener(eventName, () => releasePadButton(button));
  });
  button.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") releasePadButton(button);
  });
  button.addEventListener("contextmenu", (event) => event.preventDefault());
  button.addEventListener("click", (event) => {
    event.preventDefault();
  });
});

document.querySelectorAll("[data-panel-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.panelTab;
    document.querySelectorAll("[data-panel-tab]").forEach((tab) => tab.classList.toggle("active", tab === button));
    document.querySelectorAll("[data-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === target));
    if (target === "map") renderMinimap();
  });
});

function releasePadButton(button) {
  heldPadDirections.delete(button.dataset.move);
  button.classList.remove("pressed");
  if (!getHeldDirection()) stopHeldMovementLoop();
}

function clearHeldPadDirections() {
  heldPadDirections.clear();
  document.querySelectorAll("[data-move].pressed").forEach((button) => button.classList.remove("pressed"));
  if (!getHeldDirection()) stopHeldMovementLoop();
}

document.getElementById("saveBtn").addEventListener("click", saveGame);
document.getElementById("resetBtn").addEventListener("click", resetGame);
musicBtn?.addEventListener("click", toggleMusic);
document.addEventListener("pointerdown", startMusicFromFirstGesture, { once: true });
document.addEventListener("keydown", startMusicFromFirstGesture, { once: true });
modal.addEventListener("cancel", (event) => {
  if (battleModalLocked() || modal.classList.contains("name-modal")) event.preventDefault();
});
modal.addEventListener("close", () => {
  if (!battleModalLocked()) return;
  window.setTimeout(() => {
    if (battleModalLocked()) renderBattle();
  }, 0);
});
modal.addEventListener("close", () => {
  if (!battleModalLocked()) modalOpen = false;
});
inventoryList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-use-item]");
  if (!button) return;
  useInventoryItem(button.dataset.useItem);
});

partyList?.addEventListener("click", (event) => {
  const moveButton = event.target.closest("[data-party-move]");
  if (moveButton) {
    movePartyUnit(Number(moveButton.dataset.partyMove), Number(moveButton.dataset.dir));
    return;
  }
  const dismissButton = event.target.closest("[data-party-dismiss]");
  if (dismissButton) dismissPartyUnit(Number(dismissButton.dataset.partyDismiss));
});

renderAll();
window.setTimeout(openNamePrompt, 0);
requestAnimationFrame(animationLoop);
