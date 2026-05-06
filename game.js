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
const mapCoordinates = document.getElementById("mapCoordinates");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const modalActions = document.getElementById("modalActions");
const snackbarStack = document.getElementById("snackbarStack");
const musicBtn = document.getElementById("musicBtn");
const musicVolumeSlider = document.getElementById("musicVolume");
const musicVolumeValue = document.getElementById("musicVolumeValue");

const TILE = 32;
const VIEW_W = 24;
const VIEW_H = 16;
const SAVE_KEY = "heroes-robin-era-save-v1";
const AUDIO_SETTINGS_KEY = "heroes-robin-era-audio-v1";
const MUSIC_VOLUME_MAX = 1;
const MUSIC_OUTPUT_BOOST = 3.1;
const HERO_WORLD_HEIGHT = 54;
const NPC_WORLD_HEIGHT = 52;
const BATTLE_COLS = 9;
const BATTLE_ROWS = 5;
const BATTLE_HIT_PAUSE_MS = 260;
const MOVE_DURATION_MS = 235;
const WALK_FRAME_MS = 76;
const IDLE_FRAME_MS = 620;
const DAY_LENGTH_STEPS = 56;
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
  renderAfterArtLoad();
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
  renderAfterArtLoad();
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
  renderAfterArtLoad();
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
  renderAfterArtLoad();
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

const itemIconSheet = new Image();
let itemIconSheetReady = false;
itemIconSheet.onload = () => {
  itemIconSheetReady = true;
  renderAll();
};
itemIconSheet.src = "assets/caravan-item-icons.png";

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
const extraUnitSheet = new Image();
let extraUnitSheetReady = false;
const unitCutoutCache = new Map();
unitSheet.onload = () => {
  unitSheetReady = true;
  unitCutoutCache.clear();
  portraitCache.clear();
  renderAfterArtLoad();
};
unitSheet.src = "assets/creature-unit-sheet.png?v=4";
extraUnitSheet.onload = () => {
  extraUnitSheetReady = true;
  unitCutoutCache.clear();
  portraitCache.clear();
  renderAfterArtLoad();
};
extraUnitSheet.src = "assets/creature-unit-sheet-extra.png?v=2";

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
  { name: "Command", type: "Offense", icon: "command", text: "+2 attack. All your direct strikes hit harder.", apply: () => (state.hero.atk += 2) },
  { name: "Fortitude", type: "Survival", icon: "fortitude", text: "+10 max HP and full heal. Best when fights run long.", apply: () => { state.hero.maxHp += 10; state.hero.hp = state.hero.maxHp; } },
  { name: "Tactics", type: "Defense", icon: "tactics", text: "+2 defense. Reduces most incoming melee and ranged damage.", apply: () => (state.hero.def += 2) },
  { name: "Skirmisher", type: "Mobility", icon: "skirmisher", text: "+1 speed. Move earlier and reach better tiles in battle.", apply: () => (state.hero.speed += 1) },
  { name: "Battle Standard", type: "Morale", icon: "battleStandard", text: "+2 morale. Improves damage consistency for the whole campaign leader.", apply: () => (state.hero.morale += 2) },
  { name: "Power Channel", type: "Magic", icon: "powerChannel", text: "+2 power and ranged attack. Turns the champion into a flexible back-line threat.", apply: () => { state.hero.power += 2; state.hero.attackType = "ranged"; state.hero.attackRange = Math.max(state.hero.attackRange || 1, 5); } },
  { name: "Field Medic", type: "Support", icon: "fieldMedic", text: "+6 max HP and +1 defense. Also fully heals the party now.", apply: () => { state.hero.maxHp += 6; state.hero.def += 1; state.hero.hp = state.hero.maxHp; state.party.forEach((unit) => (unit.hp = unit.maxHp)); } },
  { name: "Quartermaster", type: "Economy", icon: "quartermaster", text: "+80 gold and +1 morale. Helps recover from expensive recruitment turns.", apply: () => { state.gold += 80; state.hero.morale += 1; } },
];

const encounters = {
  goblin: { name: "Hill Bandit", color: "#ab7048", hp: 27, atk: 6, def: 1, speed: 5, power: 3, morale: 5, moveType: "ground", attackType: "melee", attackRange: 1, reward: 34 },
  basilisk: { name: "Mire Basilisk", color: "#568d55", hp: 35, atk: 8, def: 3, speed: 5, power: 4, morale: 5, moveType: "ground", attackType: "melee", attackRange: 1, reward: 43 },
  raiders: { name: "Cinder Raiders", color: "#bd5f45", hp: 39, atk: 9, def: 3, speed: 6, power: 5, morale: 6, moveType: "ground", attackType: "ranged", attackRange: 6, reward: 52 },
  wyvern: { name: "Glasswing Wyvern", color: "#5aa6c8", hp: 44, atk: 10, def: 4, speed: 8, power: 6, morale: 6, moveType: "flying", attackType: "melee", attackRange: 1, reward: 62 },
  knight: { name: "Clockwork Knight", color: "#9fa7b7", hp: 46, atk: 10, def: 5, speed: 3, power: 6, morale: 6, moveType: "ground", attackType: "melee", attackRange: 1, reward: 58 },
  tideGuard: { name: "Harbor Guard", color: "#6aa7bf", hp: 41, atk: 8, def: 5, speed: 5, power: 5, morale: 6, moveType: "ground", attackType: "melee", attackRange: 1, reward: 54 },
  warlock: { name: "Ashen Warlock", color: "#8b5fbf", hp: 60, atk: 12, def: 4, speed: 6, power: 8, morale: 7, moveType: "flying", attackType: "ranged", attackRange: 7, reward: 70 },
  gatekeeper: { name: "Black Gate Warden", color: "#646b7d", hp: 94, atk: 14, def: 8, speed: 5, power: 8, morale: 8, moveType: "ground", attackType: "melee", attackRange: 1, reward: 115 },
  rival: { name: "Rival Mage Orius", color: "#7a4bb5", hp: 126, atk: 17, def: 8, speed: 8, power: 12, morale: 9, moveType: "flying", attackType: "ranged", attackRange: 7, reward: 220 },
};

const roamingHeroDefinitions = {
  sableKnight: { name: "Sable Knight", encounter: "knight", x: 18, y: 13, patrol: [[18, 13], [23, 13], [23, 17], [18, 17]], reward: 75 },
  cinderDuke: { name: "Cinder Duke", encounter: "raiders", x: 41, y: 9, patrol: [[41, 9], [46, 9], [46, 13], [41, 13]], reward: 90 },
  moonRider: { name: "Moon Rider", encounter: "warlock", x: 62, y: 21, patrol: [[62, 21], [69, 21], [69, 28], [62, 28]], reward: 120 },
  roadMarshal: { name: "Road Marshal", encounter: "knight", x: 32, y: 17, patrol: [[32, 17], [37, 17], [37, 22], [32, 22]], reward: 85, chaseRadius: 6 },
  gravewing: { name: "Gravewing", encounter: "wyvern", x: 39, y: 34, patrol: [[39, 34], [45, 34], [45, 38], [39, 38]], reward: 115, chaseRadius: 6 },
};

const nightEncounterPool = ["goblin", "basilisk", "raiders", "wyvern", "knight", "warlock"];

const enemySpriteVisuals = {
  goblin: { source: "enemy", id: "goblin" },
  basilisk: { source: "enemy", id: "basilisk" },
  raiders: { source: "enemy", id: "goblin", flipInBattle: true },
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
  market: { name: "Market", cost: 70, income: 10, text: "+10 gold each dawn." },
  caravanPost: { name: "Caravan Post", cost: 125, income: 5, text: "Shop stays open. Trade carts dispatch automatically and earn more with each owned town." },
  barracks: { name: "Barracks", cost: 95, income: 0, text: "Lets this town raise and train its local unit." },
  trainingYard: { name: "Training Yard", cost: 115, income: 0, text: "Owned town visits grant +1 attack once." },
};

const npcQuests = {
  elder: {
    name: "Elder Mira",
    title: "Elder's Request",
    dialogue: "The roads are waking, but our scouts need proof you can hold them. Claim two mines and I will fund your march.",
    objective: "After accepting: claim 2 new mines",
    rewardText: "90 gold and a Healing Draught",
    complete: () => questMinesClaimedSince("elder", 2),
    reward: () => {
      state.gold += 90;
      addInventoryItem("healingDraught", 1);
    },
  },
  ranger: {
    name: "Ranger Sol",
    title: "Road Patrol",
    dialogue: "Bandits shadow every road marker. Clear three outposts and the rangers will teach your army field tactics.",
    objective: "After accepting: clear 3 new outposts",
    rewardText: "60 gold and +1 attack",
    complete: () => questBattlesClearedSince("ranger", 3),
    reward: () => {
      state.gold += 60;
      state.hero.atk += 1;
    },
  },
  archivist: {
    name: "Archivist Nara",
    title: "Relic Ledger",
    dialogue: "Bring me two true relics from the old chests. I can identify which banners still hold power.",
    objective: "After accepting: recover 1 new relic",
    rewardText: "120 gold and +1 defense",
    complete: () => questRelicsFoundSince("archivist", 1),
    reward: () => {
      state.gold += 120;
      state.hero.def += 1;
    },
  },
  wayfinder: {
    name: "Wayfinder Toma",
    title: "Southern Survey",
    dialogue: "The southern road is mapped in guesses and old rumors. Raise banners over four landmarks down there and I will open our reserve stores.",
    objective: "After accepting: visit 2 southern landmarks",
    rewardText: "140 gold and +1 speed",
    complete: () => questVisitedSince("wayfinder", ["41,21", "60,30", "67,17", "33,34"], 2),
    reward: () => {
      state.gold += 140;
      state.hero.speed += 1;
    },
  },
};

const townCommissionDefinitions = {
  dawnhavenPatrol: {
    title: "Dawnhaven Patrol",
    towns: ["Dawnhaven"],
    targetKeys: ["7,7"],
    objective: "After accepting: clear the Hill Bandit camp at 7,7",
    rewardText: "55 gold and a Healing Draught",
    complete: () => questVisitedSince("dawnhavenPatrol", ["7,7"]),
    reward: () => {
      state.gold += 55;
      addInventoryItem("healingDraught", 1);
    },
  },
  dawnRoadSurvey: {
    title: "Dawn Road Survey",
    towns: ["Dawnhaven"],
    targetKeys: ["8,5", "18,11"],
    requiredTargets: 2,
    objective: "After accepting: visit Dawnhaven Crossing and Broken Watch",
    rewardText: "35 gold and 24 XP",
    complete: () => questVisitedSince("dawnRoadSurvey", ["8,5", "18,11"], 2),
    reward: () => {
      state.gold += 35;
      gainXp(24);
    },
  },
  ashbellOreRun: {
    title: "Ore for the Ridge",
    towns: ["Ashbell"],
    targetKeys: ["20,2", "21,9"],
    objective: "After accepting: claim either nearby Ashbell mine",
    rewardText: "45 gold and +1 defense",
    complete: () => questVisitedSince("ashbellOreRun", ["20,2", "21,9"]),
    reward: () => {
      state.gold += 45;
      state.hero.def += 1;
    },
  },
  ashbellRidgeWarden: {
    title: "Ridge Warden Writ",
    towns: ["Ashbell"],
    targetKeys: ["22,6"],
    objective: "After accepting: defeat the Ashbell Ridge Warden at 22,6",
    rewardText: "75 gold and 30 XP",
    complete: () => questVisitedSince("ashbellRidgeWarden", ["22,6"]),
    reward: () => {
      state.gold += 75;
      gainXp(30);
    },
  },
  mistfenRemedy: {
    title: "Mistfen Remedy",
    towns: ["Mistfen"],
    targetKeys: ["6,4", "12,6", "14,4"],
    objective: "After accepting: recover one remedy from shrine or supply cache",
    rewardText: "1 Healing Draught and 20 XP",
    complete: () => questVisitedSince("mistfenRemedy", ["6,4", "12,6", "14,4"]),
    reward: () => {
      addInventoryItem("healingDraught", 1);
      gainXp(20);
    },
  },
  mistfenFangProof: {
    title: "Fang Proof",
    towns: ["Mistfen"],
    targetKeys: ["13,9"],
    objective: "After accepting: clear the Mire Basilisk at 13,9",
    rewardText: "65 gold and +1 morale",
    complete: () => questVisitedSince("mistfenFangProof", ["13,9"]),
    reward: () => {
      state.gold += 65;
      state.hero.morale += 1;
    },
  },
  moonbarrowCompass: {
    title: "Moonlit Compass",
    towns: ["Moonbarrow"],
    targetKeys: ["35,13"],
    objective: "After accepting: recover the Starlit Compass cache at 35,13",
    rewardText: "80 gold and 32 XP",
    complete: () => questVisitedSince("moonbarrowCompass", ["35,13"]),
    reward: () => {
      state.gold += 80;
      gainXp(32);
    },
  },
  moonbarrowWingWatch: {
    title: "Wing Watch",
    towns: ["Moonbarrow"],
    targetKeys: ["31,11"],
    objective: "After accepting: drive off the Glasswing Wyvern at 31,11",
    rewardText: "95 gold",
    complete: () => questVisitedSince("moonbarrowWingWatch", ["31,11"]),
    reward: () => {
      state.gold += 95;
    },
  },
  southwatchMonument: {
    title: "Sunfall Memorial",
    towns: ["Southwatch"],
    targetKeys: ["41,21"],
    objective: "After accepting: visit Sunfall Monument at 41,21",
    rewardText: "55 gold and +1 speed",
    complete: () => questVisitedSince("southwatchMonument", ["41,21"]),
    reward: () => {
      state.gold += 55;
      state.hero.speed += 1;
    },
  },
  southwatchGap: {
    title: "Hold Sunfall Gap",
    towns: ["Southwatch"],
    targetKeys: ["38,24"],
    objective: "After accepting: defeat the Sunfall Gap Raiders at 38,24",
    rewardText: "110 gold and 28 XP",
    complete: () => questVisitedSince("southwatchGap", ["38,24"]),
    reward: () => {
      state.gold += 110;
      gainXp(28);
    },
  },
  eastmereBowCache: {
    title: "Bow Cache Escort",
    towns: ["Eastmere"],
    targetKeys: ["41,10"],
    objective: "After accepting: open the guarded bow cache at 41,10",
    rewardText: "85 gold and a Healing Draught",
    complete: () => questVisitedSince("eastmereBowCache", ["41,10"]),
    reward: () => {
      state.gold += 85;
      addInventoryItem("healingDraught", 1);
    },
  },
  eastmereGlassroad: {
    title: "Glass Road Marker",
    towns: ["Eastmere"],
    targetKeys: ["57,12"],
    objective: "After accepting: visit High March Road at 57,12 and scout the road held by the Black Gate Warden",
    rewardText: "70 gold and 22 XP",
    complete: () => questVisitedSince("eastmereGlassroad", ["57,12"]),
    reward: () => {
      revealGateIntel();
      state.gold += 70;
      gainXp(22);
    },
  },
  sunforgeRelicRun: {
    title: "Twin Relic Run",
    towns: ["Sunforge"],
    targetKeys: ["48,26", "49,26"],
    objective: "After accepting: recover either Sunforge relic at 48,26 or 49,26",
    rewardText: "100 gold and +1 attack",
    complete: () => questVisitedSince("sunforgeRelicRun", ["48,26", "49,26"]),
    reward: () => {
      state.gold += 100;
      state.hero.atk += 1;
    },
  },
  sunforgeMineQuota: {
    title: "Forge Quota",
    towns: ["Sunforge"],
    targetKeys: ["42,14", "46,20", "47,27"],
    objective: "After accepting: claim one Sunforge ore site",
    rewardText: "75 gold and 25 XP",
    complete: () => questVisitedSince("sunforgeMineQuota", ["42,14", "46,20", "47,27"]),
    reward: () => {
      state.gold += 75;
      gainXp(25);
    },
  },
  amberwatchSupply: {
    title: "Amber Supply Vault",
    towns: ["Amberwatch"],
    targetKeys: ["27,23", "28,23"],
    objective: "After accepting: open the guarded supply at 27,23 or 28,23",
    rewardText: "90 gold and a Healing Draught",
    complete: () => questVisitedSince("amberwatchSupply", ["27,23", "28,23"]),
    reward: () => {
      state.gold += 90;
      addInventoryItem("healingDraught", 1);
    },
  },
  amberwatchWarlock: {
    title: "Ashen Road Ban",
    towns: ["Amberwatch"],
    targetKeys: ["51,25"],
    objective: "After accepting: defeat the Ashen Warlock at 51,25",
    rewardText: "125 gold",
    complete: () => questVisitedSince("amberwatchWarlock", ["51,25"]),
    reward: () => {
      state.gold += 125;
    },
  },
  highglassTollGuard: {
    title: "Glassroad Toll Guard",
    towns: ["Highglass"],
    targetKeys: ["61,6"],
    objective: "After accepting: break the Glassroad Toll Guard at 61,6",
    rewardText: "130 gold and 35 XP",
    complete: () => questVisitedSince("highglassTollGuard", ["61,6"]),
    reward: () => {
      state.gold += 130;
      gainXp(35);
    },
  },
  highglassWyvern: {
    title: "Highglass Sky Hunt",
    towns: ["Highglass"],
    targetKeys: ["70,9"],
    objective: "After accepting: defeat the wyvern at 70,9",
    rewardText: "120 gold and +1 defense",
    complete: () => questVisitedSince("highglassWyvern", ["70,9"]),
    reward: () => {
      state.gold += 120;
      state.hero.def += 1;
    },
  },
  greenmarchTollhouse: {
    title: "Sunken Tollhouse",
    towns: ["Greenmarch"],
    targetKeys: ["67,17"],
    objective: "After accepting: inspect the Sunken Tollhouse at 67,17",
    rewardText: "85 gold and 30 XP",
    complete: () => questVisitedSince("greenmarchTollhouse", ["67,17"]),
    reward: () => {
      state.gold += 85;
      gainXp(30);
    },
  },
  greenmarchHunt: {
    title: "Greenmarch Hunt",
    towns: ["Greenmarch"],
    targetKeys: ["70,9", "59,20"],
    objective: "After accepting: clear either nearby eastern threat",
    rewardText: "115 gold and a Healing Draught",
    complete: () => questVisitedSince("greenmarchHunt", ["70,9", "59,20"]),
    reward: () => {
      state.gold += 115;
      addInventoryItem("healingDraught", 1);
    },
  },
  starfenRelics: {
    title: "Starfen Relic Pair",
    towns: ["Starfen"],
    targetKeys: ["57,36", "58,36"],
    objective: "After accepting: recover one relic from the Starfen guarded cache",
    rewardText: "130 gold and +1 morale",
    complete: () => questVisitedSince("starfenRelics", ["57,36", "58,36"]),
    reward: () => {
      state.gold += 130;
      state.hero.morale += 1;
    },
  },
  starfenSouthRoad: {
    title: "South Road Watch",
    towns: ["Starfen"],
    targetKeys: ["60,30"],
    objective: "After accepting: visit South Road Camp at 60,30",
    rewardText: "80 gold and 28 XP",
    complete: () => questVisitedSince("starfenSouthRoad", ["60,30"]),
    reward: () => {
      state.gold += 80;
      gainXp(28);
    },
  },
  lowmarketCauseway: {
    title: "Causeway Breaker",
    towns: ["Lowmarket"],
    targetKeys: ["13,36"],
    objective: "After accepting: defeat the Lowmarket Causeway Raiders at 13,36",
    rewardText: "125 gold and a Healing Draught",
    complete: () => questVisitedSince("lowmarketCauseway", ["13,36"]),
    reward: () => {
      state.gold += 125;
      addInventoryItem("healingDraught", 1);
    },
  },
  lowmarketCairn: {
    title: "Wayfinder Cairn",
    towns: ["Lowmarket"],
    targetKeys: ["33,34"],
    objective: "After accepting: visit Wayfinder Cairn at 33,34",
    rewardText: "90 gold and 30 XP",
    complete: () => questVisitedSince("lowmarketCairn", ["33,34"]),
    reward: () => {
      state.gold += 90;
      gainXp(30);
    },
  },
  groveAid: {
    title: "Grove Aid",
    objective: "After accepting: recruit one new creature unit",
    rewardText: "70 gold and +1 morale",
    complete: () => questPartyGainedSince("groveAid", 1),
    reward: () => {
      state.gold += 70;
      state.hero.morale += 1;
    },
  },
  roadTithe: {
    title: "Road Tithe",
    objective: "After accepting: build one new Caravan Post",
    rewardText: "90 gold",
    complete: () => questCaravanPostsBuiltSince("roadTithe", 1),
    reward: () => {
      state.gold += 90;
    },
  },
  musterCall: {
    title: "Muster Call",
    objective: "After accepting: bring one new town under your banner",
    rewardText: "120 gold and a Healing Draught",
    complete: () => questTownsClaimedSince("musterCall", 1),
    reward: () => {
      state.gold += 120;
      addInventoryItem("healingDraught", 1);
    },
  },
};

function countVisitedKeys(keys) {
  return keys.filter((key) => state.visited?.[key]).length;
}

function startQuestSnapshot(id) {
  state.questStarts ??= {};
  state.questStarts[id] = {
    visited: Object.keys(state.visited || {}).filter((key) => state.visited[key]),
    partyLength: state.party.length,
    townCount: ownedTownEntries().length,
    caravanPostCount: caravanPostCount(),
    mineCount: countVisitedEvents("mine"),
    battleCount: countVisitedEvents("battle"),
    relicCount: uniqueRelicCount(),
  };
}

function startTownCommission(id) {
  startQuestSnapshot(id);
}

function questStart(id) {
  return state.questStarts?.[id] || null;
}

function questVisitedSince(id, keys, required = 1) {
  const start = questStart(id);
  if (!start) return false;
  const alreadyVisited = new Set(start.visited || []);
  return keys.filter((key) => state.visited?.[key] && !alreadyVisited.has(key)).length >= required;
}

function questPartyGainedSince(id, required = 1) {
  const start = questStart(id);
  return Boolean(start && state.party.length - (start.partyLength || 0) >= required);
}

function questTownsClaimedSince(id, required = 1) {
  const start = questStart(id);
  return Boolean(start && ownedTownEntries().length - (start.townCount || 0) >= required);
}

function questCaravanPostsBuiltSince(id, required = 1) {
  const start = questStart(id);
  return Boolean(start && caravanPostCount() - (start.caravanPostCount || 0) >= required);
}

function questMinesClaimedSince(id, required = 1) {
  const start = questStart(id);
  return Boolean(start && countVisitedEvents("mine") - (start.mineCount || 0) >= required);
}

function questBattlesClearedSince(id, required = 1) {
  const start = questStart(id);
  return Boolean(start && countVisitedEvents("battle") - (start.battleCount || 0) >= required);
}

function questRelicsFoundSince(id, required = 1) {
  const start = questStart(id);
  return Boolean(start && uniqueRelicCount() - (start.relicCount || 0) >= required);
}

function caravanPostCount() {
  return ownedTownEntries().filter(([, town]) => town.buildings.includes("caravanPost")).length;
}

const campUpgradeDefinitions = {
  betterTent: { name: "Better Tent", cost: 120, text: "Turns dawn into a real recovery window with stronger healing after the watch." },
  watchtower: { name: "Watchtower", cost: 160, text: "Reveals incoming wave details before battle and can cut one wave when the camp spots a weak flank." },
  traps: { name: "Stake Traps", cost: 140, text: "The first enemy in every wave reaches camp already bloodied by hidden stakes." },
  healerFire: { name: "Healer Fire", cost: 180, text: "Restores the party before each wave so a rough first fight does not snowball." },
};

const nightPlanDefinitions = {
  holdfast: {
    name: "Hold Fast",
    text: "Safer rest. Fewer risks, steadier recovery, and slightly weaker night waves.",
    risk: "Low",
    reward: "Lower gold and XP, but the safest sustain.",
    waveBias: "Usually 1-2 lighter waves.",
    tacticalAsk: "Play compact and let sustain win the night.",
  },
  nightRaid: {
    name: "Night Raid",
    text: "Press the dark for extra dawn gold, but draw a harder night response.",
    risk: "High",
    reward: "More gold, more XP, and a chance to recover an item.",
    waveBias: "Usually 2-3 harder waves.",
    tacticalAsk: "Bring burst damage and do not let ranged threats live.",
  },
  scoutLines: {
    name: "Scout Lines",
    text: "Keep outriders moving. Dawn reveals the next major target on the overworld.",
    risk: "Medium",
    reward: "Balanced payout and a marked lead for the next day.",
    waveBias: "Usually 1-2 standard waves.",
    tacticalAsk: "Stable all-round defense works best here.",
  },
};

const nightCampEvents = [
  {
    id: "woundedTrader",
    title: "A wounded trader reaches camp.",
    text: "His cart is broken, but his satchel still holds route notes and a little medicine.",
    options: [
      {
        id: "aid",
        label: "Treat his wounds",
        summary: "+1 camp morale, but less dawn healing.",
        apply: (report) => {
          state.campMorale = Math.min(5, (state.campMorale || 0) + 1);
          report.eventOutcome = "The trader spreads word that your camp protects the road.";
          report.eventMoraleDelta = 1;
          report.eventHealingPenalty = 5;
        },
      },
      {
        id: "keepSupplies",
        label: "Keep your stores",
        summary: "+25 gold and no healing penalty.",
        apply: (report) => {
          state.gold += 25;
          report.eventOutcome = "The quartermaster keeps every bandage and the camp stays materially stronger.";
          report.eventGoldDelta = 25;
        },
      },
    ],
  },
  {
    id: "strangeTracks",
    title: "Scouts find fresh tracks past the firelight.",
    text: "Something is circling wide around camp and could either be bait or a hidden approach.",
    options: [
      {
        id: "sendRiders",
        label: "Send riders out",
        summary: "Reveal the next target now, but face a harsher response.",
        apply: (report) => {
          const target = nearestScoutingTarget();
          if (target) {
            state.scoutMarker = target.key;
            report.scoutingTarget = { key: target.key, label: scoutingTargetLabel(target), x: target.x, y: target.y };
            report.scoutingText = `Night scouts already marked ${report.scoutingTarget.label} at ${target.x},${target.y}.`;
          }
          report.eventOutcome = "The riders return with a route sketch, but the enemy now knows your camp is alert.";
          report.eventDifficultyBias = 0.35;
        },
      },
      {
        id: "pullBack",
        label: "Pull them back",
        summary: "Safer watch and a little pre-wave recovery.",
        apply: (report) => {
          report.eventOutcome = "The outriders stay close and the camp settles into a more disciplined perimeter.";
          report.eventPreWaveRecovery = 6;
        },
      },
    ],
  },
  {
    id: "embersLow",
    title: "The healer fire burns low in the wind.",
    text: "You can feed it precious supplies or save the fuel and accept a dimmer camp.",
    options: [
      {
        id: "feedFire",
        label: "Feed the fire",
        summary: "Spend 20 gold for stronger pre-wave healing.",
        apply: (report) => {
          if (state.gold >= 20) {
            state.gold -= 20;
            report.eventOutcome = "The fire burns high and the healers work in clear light.";
            report.eventGoldDelta = -20;
            report.eventPreWaveRecovery = 10;
          } else {
            report.eventOutcome = "There was not enough coin to buy extra fuel, so the camp keeps watch the hard way.";
          }
        },
      },
      {
        id: "saveFuel",
        label: "Save the fuel",
        summary: "No cost, but the first wave hits harder.",
        apply: (report) => {
          report.eventOutcome = "The camp saves its stores, but the dark gives the first attackers better cover.";
          report.eventFirstWaveThreat = 1;
        },
      },
    ],
  },
];

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
    description: "Equip: your champion gains +1 attack.",
    use: () => {
      state.hero.atk += 1;
      return `${championName()} equips the Banner of Luck and gains +1 attack.`;
    },
    unequip: () => {
      state.hero.atk -= 1;
      return `${championName()} lowers the Banner of Luck and loses its +1 attack.`;
    },
  },
  dawnwoodBow: {
    name: "Dawnwood Bow",
    type: "equipment",
    description: "Equip: your champion becomes ranged, gains +1 power, and shoots best within 6 tiles.",
    use: () => {
      state.hero.power += 1;
      state.hero.attackType = "ranged";
      state.hero.attackRange = Math.max(state.hero.attackRange || 1, 6);
      return `${championName()} equips the Dawnwood Bow and can now attack from range.`;
    },
    unequip: () => {
      state.hero.power -= 1;
      state.hero.attackType = heroBaseStats.attackType;
      state.hero.attackRange = heroBaseStats.attackRange;
      return `${championName()} slings the Dawnwood Bow and returns to melee fighting.`;
    },
  },
  silverBridle: {
    name: "Silver Bridle",
    type: "equipment",
    description: "Equip: your champion gains +1 defense.",
    use: () => {
      state.hero.def += 1;
      return `${championName()} equips the Silver Bridle and gains +1 defense.`;
    },
    unequip: () => {
      state.hero.def -= 1;
      return `${championName()} removes the Silver Bridle and loses its +1 defense.`;
    },
  },
  starlitCompass: {
    name: "Starlit Compass",
    type: "equipment",
    description: "Equip: your champion gains +1 speed.",
    use: () => {
      state.hero.speed += 1;
      return `${championName()} equips the Starlit Compass and gains +1 speed.`;
    },
    unequip: () => {
      state.hero.speed -= 1;
      return `${championName()} packs away the Starlit Compass and loses its +1 speed.`;
    },
  },
  forgeCharm: {
    name: "Forge Charm",
    type: "equipment",
    description: "Equip: your champion gains +6 max HP and fully heals.",
    use: () => {
      state.hero.maxHp += 6;
      state.hero.hp = state.hero.maxHp;
      return `${championName()} equips the Forge Charm and gains +6 max HP.`;
    },
    unequip: () => {
      state.hero.maxHp -= 6;
      state.hero.hp = Math.min(state.hero.hp, state.hero.maxHp);
      return `${championName()} removes the Forge Charm and loses its +6 max HP.`;
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

const guardedCachePassages = [
  { guard: "10,2", tiles: ["11,2", "11,3"], encounter: "goblin", guardName: "Dawnhaven Vault Guard" },
  { guard: "10,13", tiles: ["11,13", "11,14"], encounter: "basilisk", guardName: "Mistfen Cache Beast" },
  { guard: "34,13", tiles: ["35,13", "36,13"], encounter: "raiders", guardName: "Glass Road Blockade" },
  { guard: "3,20", tiles: ["4,20", "4,21"], encounter: "knight", guardName: "Forge Pass Sentinel" },
  { guard: "40,10", tiles: ["41,10", "42,10"], encounter: "wyvern", guardName: "Bow Cache Wyvern" },
  { guard: "26,23", tiles: ["27,23", "28,23"], encounter: "warlock", guardName: "Cinder Vault Warlock" },
  { guard: "47,26", tiles: ["48,26", "49,26", "49,27"], encounter: "warlock", guardName: "River Cache Warlock" },
  { guard: "56,35", tiles: ["57,35", "57,36", "58,36"], roads: ["55,35"], encounter: "warlock", guardName: "Starfen Relic Guard" },
  { guard: "35,37", tiles: ["36,37", "37,37"], encounter: "knight", guardName: "Wayfinder Ridge Sentinel" },
  { guard: "53,24", tiles: ["54,24", "55,24"], encounter: "raiders", guardName: "Greenmarch Cache Raiders" },
  { guard: "48,33", tiles: ["49,33", "50,33"], encounter: "warlock", guardName: "Southern Vault Warlock" },
  { guard: "39,30", tiles: ["40,30", "41,30"], encounter: "basilisk", guardName: "Fen Cache Basilisk" },
  { guard: "19,35", tiles: ["20,35", "21,35"], encounter: "knight", guardName: "Low Road Chest Sentinel" },
];

const biomePassages = [
  {
    guard: "22,6",
    name: "Ashbell Ridge",
    axis: "x",
    line: 22,
    min: 1,
    max: 18,
    blockers: ["21,5", "22,5", "23,5", "21,7", "22,7", "23,7"],
    roads: ["21,6", "22,6", "23,6"],
  },
  {
    guard: "24,18",
    name: "Cinderfen Cut",
    axis: "y",
    line: 18,
    min: 1,
    max: 37,
    blockers: ["23,17", "25,17", "23,18", "25,18", "23,19", "25,19"],
    roads: ["24,17", "24,18", "24,19"],
  },
  {
    guard: "38,24",
    name: "Sunfall Gap",
    axis: "x",
    line: 38,
    min: 1,
    max: 38,
    blockers: ["37,23", "38,23", "39,23", "37,25", "38,25", "39,25"],
    roads: ["37,24", "38,24", "39,24"],
  },
  {
    guard: "61,6",
    name: "Glassroad Pass",
    axis: "x",
    line: 61,
    min: 1,
    max: 38,
    blockers: ["60,5", "61,5", "62,5", "60,7", "61,7", "62,7"],
    roads: ["60,6", "61,6", "62,6"],
  },
  {
    guard: "13,36",
    name: "Lowmarket Causeway",
    axis: "x",
    line: 13,
    min: 30,
    max: 38,
    blockers: ["12,35", "13,35", "14,35", "12,37", "13,37", "14,37"],
    roads: ["12,36", "13,36", "14,36"],
  },
];

function pointFromKeyString(key) {
  const [x, y] = key.split(",").map(Number);
  return { x, y };
}

function guardForCache(chestKey) {
  return guardedCachePassages.find((passage) => passage.tiles.includes(chestKey)) || null;
}

function applyGuardedCacheTerrain() {
  guardedCachePassages.forEach(({ tiles, roads = [], guard }) => {
    const guardPoint = pointFromKeyString(guard);
    const openKeys = new Set([guard, ...tiles, ...roads]);
    if (map[guardPoint.y]?.[guardPoint.x]) map[guardPoint.y][guardPoint.x] = "R";
    roads.forEach((tileKey) => {
      const point = pointFromKeyString(tileKey);
      if (map[point.y]?.[point.x]) map[point.y][point.x] = "R";
    });
    tiles.forEach((tileKey) => {
      const tilePoint = pointFromKeyString(tileKey);
      if (map[tilePoint.y]?.[tilePoint.x]) map[tilePoint.y][tilePoint.x] = "G";
    });
    tiles.forEach((tileKey) => {
      const tilePoint = pointFromKeyString(tileKey);
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const x = tilePoint.x + dx;
        const y = tilePoint.y + dy;
        if (openKeys.has(`${x},${y}`)) return;
        if (!map[y]?.[x] || map[y][x] === "W") return;
        map[y][x] = "M";
      });
    });
  });
}

function applyBiomePassageTerrain() {
  biomePassages.forEach(({ blockers, roads, guard, axis, line, min, max }) => {
    const openKeys = new Set([guard, ...roads]);
    for (let value = min; value <= max; value += 1) {
      const key = axis === "x" ? `${line},${value}` : `${value},${line}`;
      if (openKeys.has(key)) continue;
      const point = pointFromKeyString(key);
      if (map[point.y]?.[point.x] && map[point.y][point.x] !== "W") map[point.y][point.x] = "M";
    }
    blockers.forEach((tileKey) => {
      const point = pointFromKeyString(tileKey);
      if (openKeys.has(tileKey)) return;
      if (map[point.y]?.[point.x] && map[point.y][point.x] !== "W") map[point.y][point.x] = "M";
    });
    openKeys.forEach((tileKey) => {
      const point = pointFromKeyString(tileKey);
      if (map[point.y]?.[point.x]) map[point.y][point.x] = "R";
    });
  });
}

function guardedCacheBattleEntries() {
  return guardedCachePassages.map(({ tiles, guard, encounter, guardName }) => [
    guard,
    { type: "battle", encounter, guardName, guards: tiles },
  ]);
}

applyBiomePassageTerrain();
applyGuardedCacheTerrain();
const events = new Map([
  ["3,2", { type: "town", name: "Dawnhaven", creature: "leafFox", faction: "grove" }],
  ["16,5", { type: "town", name: "Ashbell", creature: "emberGolem", faction: "forge" }],
  ["9,10", { type: "town", name: "Mistfen", creature: "tideWisp", faction: "tide" }],
  ["35,7", { type: "town", name: "Moonbarrow", creature: "duskMoth", faction: "dusk" }],
  ["36,20", { type: "town", name: "Southwatch", creature: "tideWisp", faction: "tide" }],
  ["47,7", { type: "town", name: "Eastmere", creature: "leafFox", faction: "grove" }],
  ["44,16", { type: "town", name: "Sunforge", creature: "emberGolem", faction: "forge" }],
  ["44,23", { type: "town", name: "Amberwatch", creature: "duskMoth", faction: "dusk" }],
  ["11,2", { type: "artifact", item: "Banner of Luck", gold: 55, guardedBy: "10,2" }],
  ["11,3", { type: "supply", item: "Healing Draught", qty: 2, gold: 20, guardedBy: "10,2" }],
  ["11,13", { type: "chest", gold: 70, item: "Silver Bridle", guardedBy: "10,13" }],
  ["11,14", { type: "supply", item: "Healing Draught", qty: 1, gold: 25, guardedBy: "10,13" }],
  ["35,13", { type: "artifact", item: "Starlit Compass", gold: 85, guardedBy: "34,13" }],
  ["36,13", { type: "supply", item: "Healing Draught", qty: 1, gold: 35, guardedBy: "34,13" }],
  ["4,20", { type: "chest", gold: 95, item: "Forge Charm", guardedBy: "3,20" }],
  ["4,21", { type: "supply", item: "Healing Draught", qty: 1, gold: 30, guardedBy: "3,20" }],
  ["41,10", { type: "chest", gold: 115, item: "Dawnwood Bow", guardedBy: "40,10" }],
  ["42,10", { type: "supply", item: "Healing Draught", qty: 1, gold: 40, guardedBy: "40,10" }],
  ["27,23", { type: "chest", gold: 130, item: "Forge Charm", guardedBy: "26,23" }],
  ["28,23", { type: "supply", item: "Healing Draught", qty: 1, gold: 35, guardedBy: "26,23" }],
  ["48,26", { type: "artifact", item: "Starlit Compass", gold: 150, guardedBy: "47,26" }],
  ["49,26", { type: "artifact", item: "Silver Bridle", gold: 40, guardedBy: "47,26" }],
  ["49,27", { type: "supply", item: "Healing Draught", qty: 1, guardedBy: "47,26" }],
  ["7,7", { type: "battle", encounter: "goblin" }],
  ["13,9", { type: "battle", encounter: "basilisk" }],
  ["29,6", { type: "battle", encounter: "raiders" }],
  ["31,11", { type: "battle", encounter: "wyvern" }],
  ["22,6", { type: "battle", encounter: "knight", guardName: "Ashbell Ridge Warden", passName: "Ashbell Ridge" }],
  ["24,18", { type: "battle", encounter: "warlock", guardName: "Cinderfen Hexguard", passName: "Cinderfen Cut" }],
  ["34,20", { type: "battle", encounter: "knight" }],
  ["42,12", { type: "battle", encounter: "basilisk" }],
  ["45,18", { type: "battle", encounter: "wyvern" }],
  ["38,24", { type: "battle", encounter: "raiders", guardName: "Sunfall Gap Raiders", passName: "Sunfall Gap" }],
  ["51,25", { type: "battle", encounter: "warlock" }],
  ...guardedCacheBattleEntries(),
  ["71,5", { type: "battle", encounter: "gatekeeper", gate: true }],
  ["71,4", { type: "final", encounter: "rival" }],
  ["5,6", { type: "mine", gold: 20 }],
  ["20,2", { type: "mine", gold: 25 }],
  ["21,9", { type: "mine", gold: 25 }],
  ["30,10", { type: "mine", gold: 30 }],
  ["7,16", { type: "mine", gold: 35 }],
  ["31,19", { type: "mine", gold: 40 }],
  ["42,14", { type: "mine", gold: 45 }],
  ["46,20", { type: "mine", gold: 50 }],
  ["30,26", { type: "mine", gold: 55 }],
  ["47,27", { type: "mine", gold: 60 }],
  ["5,3", { type: "npc", quest: "elder" }],
  ["18,7", { type: "npc", quest: "ranger" }],
  ["39,14", { type: "npc", quest: "archivist" }],
  ["6,4", { type: "landmark", landmark: "shrine", title: "Dawn Shrine", reward: { heal: 18, morale: 1 }, hint: "The ridge guard expects a fresh army. Recruit, carry a draught, and claim a mine before crossing." }],
  ["12,6", { type: "supply", item: "Healing Draught", qty: 1, gold: 18 }],
  ["17,3", { type: "chest", gold: 42, item: "Healing Draught" }],
  ["63,4", { type: "town", name: "Highglass", creature: "emberGolem", faction: "forge" }],
  ["68,12", { type: "town", name: "Greenmarch", creature: "leafFox", faction: "grove" }],
  ["60,33", { type: "town", name: "Starfen", creature: "duskMoth", faction: "dusk" }],
  ["9,31", { type: "town", name: "Lowmarket", creature: "reefGuard", faction: "tide" }],
  ["61,6", { type: "battle", encounter: "raiders", guardName: "Glassroad Toll Guard", passName: "Glassroad Pass" }],
  ["70,9", { type: "battle", encounter: "wyvern" }],
  ["59,20", { type: "battle", encounter: "warlock" }],
  ["60,31", { type: "battle", encounter: "knight" }],
  ["59,35", { type: "battle", encounter: "warlock" }],
  ["13,36", { type: "battle", encounter: "raiders", guardName: "Lowmarket Causeway Raiders", passName: "Lowmarket Causeway" }],
  ["43,36", { type: "battle", encounter: "wyvern" }],
  ["8,5", { type: "landmark", landmark: "signpost", title: "Dawnhaven Crossing" }],
  ["18,11", { type: "landmark", landmark: "ruins", title: "Broken Watch" }],
  ["33,8", { type: "landmark", landmark: "camp", title: "Cinder Road Camp" }],
  ["41,21", { type: "landmark", landmark: "statue", title: "Sunfall Monument" }],
  ["57,12", { type: "landmark", landmark: "signpost", title: "High March Road" }],
  ["60,30", { type: "landmark", landmark: "camp", title: "South Road Camp" }],
  ["25,3", { type: "landmark", landmark: "ruins", title: "Old Banner Vault" }],
  ["52,5", { type: "landmark", landmark: "statue", title: "Glass Road Shrine" }],
  ["67,17", { type: "landmark", landmark: "ruins", title: "Sunken Tollhouse" }],
  ["22,32", { type: "landmark", landmark: "signpost", title: "Low Road Split" }],
  ["33,34", { type: "landmark", landmark: "statue", title: "Wayfinder Cairn" }],
  ["19,31", { type: "chest", gold: 105, item: "Healing Draught", guardian: "raiders" }],
  ["65,16", { type: "chest", gold: 175, item: "Healing Draught", guardian: "wyvern" }],
  ["57,35", { type: "supply", item: "Healing Draught", qty: 2, guardedBy: "56,35" }],
  ["57,36", { type: "artifact", item: "Banner of Luck", gold: 190, guardedBy: "56,35" }],
  ["58,36", { type: "artifact", item: "Forge Charm", gold: 30, guardedBy: "56,35" }],
  ["36,37", { type: "chest", gold: 170, item: "Silver Bridle", guardedBy: "35,37" }],
  ["37,37", { type: "supply", item: "Healing Draught", qty: 1, gold: 40, guardedBy: "35,37" }],
  ["54,24", { type: "chest", gold: 160, item: "Dawnwood Bow", guardedBy: "53,24" }],
  ["55,24", { type: "supply", item: "Healing Draught", qty: 1, gold: 45, guardedBy: "53,24" }],
  ["49,33", { type: "artifact", item: "Forge Charm", gold: 185, guardedBy: "48,33" }],
  ["50,33", { type: "artifact", item: "Starlit Compass", gold: 45, guardedBy: "48,33" }],
  ["40,30", { type: "chest", gold: 120, item: "Starlit Compass", guardedBy: "39,30" }],
  ["41,30", { type: "supply", item: "Healing Draught", qty: 1, gold: 30, guardedBy: "39,30" }],
  ["20,35", { type: "chest", gold: 135, item: "Healing Draught", guardedBy: "19,35" }],
  ["21,35", { type: "artifact", item: "Banner of Luck", gold: 25, guardedBy: "19,35" }],
  ["14,4", { type: "chest", gold: 45, item: "Healing Draught" }],
  ["32,32", { type: "chest", gold: 85, item: "Healing Draught" }],
  ["56,31", { type: "chest", gold: 110, item: "Healing Draught" }],
  ["66,25", { type: "chest", gold: 125, item: "Silver Bridle", guardian: "wyvern" }],
  ["3,35", { type: "supply", item: "Healing Draught", qty: 2, gold: 60 }],
  ["4,35", { type: "artifact", item: "Banner of Luck", gold: 20 }],
  ["14,28", { type: "supply", item: "Healing Draught", qty: 1, gold: 80 }],
  ["15,28", { type: "artifact", item: "Dawnwood Bow", gold: 25 }],
  ["62,28", { type: "mine", gold: 65 }],
  ["6,33", { type: "mine", gold: 70 }],
  ["58,34", { type: "mine", gold: 75 }],
  ["28,38", { type: "npc", quest: "wayfinder" }],
]);

const defaultState = () => ({
  worldSeed: Math.floor(Math.random() * 1000000000),
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
  questStarts: {},
  tradeLedger: [],
  campUpgrades: {},
  campMorale: 0,
  nightStreak: 0,
  won: false,
  visited: {},
  revealed: {},
  discoveredRegions: {},
  storyFlags: {
    gateIntelKnown: false,
    gateRequirementsKnown: false,
  },
  chestRolls: {},
  lastTravelPosition: null,
  lastRespawn: { key: "3,2", x: 3, y: 2, name: "Dawnhaven" },
  scoutMarker: "",
  activeQuest: "",
  tutorial: {},
  nightPlan: "holdfast",
  hero: { ...heroBaseStats, nameChosen: false, skills: [] },
  startingBonus: "",
  party: [makeCreature("leafFox")],
  log: ["Reach the northeast fortress.", "Gather four creatures.", "Survey the southern road.", "Claim the scattered relics."],
});

const loadedState = loadGame();
const loadedAudioSettings = loadAudioSettings();
let state = loadedState || defaultState();
revealAroundPlayer();
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
let barracksFeedback = { text: "", type: "info" };
let camera = { x: 0, y: 0, originX: 0, originY: 0, key: "" };
let audioContext = null;
let musicEnabled = false;
let musicVolume = loadedAudioSettings.musicVolume;
let musicTimer = 0;
let musicStep = 0;
let musicGain = null;
let musicMode = "field";
let musicTransitionTimer = 0;
let autoBattleTimer = 0;
let battleEffectId = 0;
let lastStepSoundAt = 0;
let lastSnackbarText = "";
let lastSnackbarAt = 0;
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

function isEditableInputTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true'], [contenteditable='']"));
}

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
    mode: "patrol",
    pauseLeft: definition.pauseTurns ?? 0,
    lastSeenX: definition.x,
    lastSeenY: definition.y,
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

function loadAudioSettings() {
  try {
    const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
    if (!raw) return { musicVolume: 1 };
    const parsed = JSON.parse(raw);
    const musicVolumeValue = Number(parsed?.musicVolume);
    return {
      musicVolume: Number.isFinite(musicVolumeValue) ? Math.max(0, Math.min(MUSIC_VOLUME_MAX, musicVolumeValue)) : 1,
    };
  } catch {
    return { musicVolume: 1 };
  }
}

function saveAudioSettings() {
  localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify({ musicVolume }));
}

function normalizeState(saved) {
  saved.worldSeed = Number.isFinite(saved.worldSeed) ? saved.worldSeed : Math.floor(Math.random() * 1000000000);
  saved.steps ??= 0;
  saved.dayProgress = Number.isFinite(saved.dayProgress) ? Math.max(0, Math.min(DAY_LENGTH_STEPS, saved.dayProgress)) : (saved.steps || 0) % DAY_LENGTH_STEPS;
  saved.nightReady ??= saved.dayProgress >= DAY_LENGTH_STEPS;
  saved.relics ??= [];
  saved.chestRolls = saved.chestRolls && typeof saved.chestRolls === "object" ? saved.chestRolls : {};
  saved.lastTravelPosition = saved.lastTravelPosition && Number.isFinite(saved.lastTravelPosition.x) && Number.isFinite(saved.lastTravelPosition.y)
    ? { x: saved.lastTravelPosition.x, y: saved.lastTravelPosition.y }
    : null;
  saved.lastRespawn = saved.lastRespawn && Number.isFinite(saved.lastRespawn.x) && Number.isFinite(saved.lastRespawn.y)
    ? { key: saved.lastRespawn.key || tileKey(saved.lastRespawn.x, saved.lastRespawn.y), x: saved.lastRespawn.x, y: saved.lastRespawn.y, name: saved.lastRespawn.name || "Dawnhaven" }
    : { key: "3,2", x: 3, y: 2, name: "Dawnhaven" };
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
  saved.campMorale = Number.isFinite(saved.campMorale) ? Math.max(0, Math.min(5, saved.campMorale)) : 0;
  saved.nightStreak = Number.isFinite(saved.nightStreak) ? Math.max(0, saved.nightStreak) : 0;
  saved.revealed = saved.revealed && typeof saved.revealed === "object" ? saved.revealed : {};
  saved.discoveredRegions = saved.discoveredRegions && typeof saved.discoveredRegions === "object" ? saved.discoveredRegions : {};
  saved.storyFlags = saved.storyFlags && typeof saved.storyFlags === "object" ? saved.storyFlags : {};
  saved.storyFlags.gateIntelKnown ??= false;
  saved.storyFlags.gateRequirementsKnown ??= false;
  saved.scoutMarker = typeof saved.scoutMarker === "string" ? saved.scoutMarker : "";
  saved.activeQuest = typeof saved.activeQuest === "string" ? saved.activeQuest : "";
  saved.tutorial = saved.tutorial && typeof saved.tutorial === "object" ? saved.tutorial : {};
  saved.nightPlan = nightPlanDefinitions[saved.nightPlan] ? saved.nightPlan : "holdfast";
  saved.enemyHeroes = normalizeEnemyHeroes(saved.enemyHeroes);
  saved.quests = saved.quests && typeof saved.quests === "object" ? saved.quests : {};
  saved.questStarts = saved.questStarts && typeof saved.questStarts === "object" ? saved.questStarts : {};
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
    unit.spriteId = creatureBook[unit.id]?.spriteId || unit.id;
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
      mode: saved.mode || hero.mode,
      pauseLeft: Number.isFinite(saved.pauseLeft) ? saved.pauseLeft : hero.pauseLeft,
      lastSeenX: Number.isFinite(saved.lastSeenX) ? saved.lastSeenX : hero.lastSeenX,
      lastSeenY: Number.isFinite(saved.lastSeenY) ? saved.lastSeenY : hero.lastSeenY,
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
  revealAroundPlayer();
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
  showSnackbar(text);
}

function renderAfterArtLoad() {
  if (activeBattle) {
    renderBattle();
    return;
  }
  renderAll();
}

function showSnackbar(text, type = snackbarTypeForMessage(text)) {
  if (!snackbarStack || !text || !type) return;
  syncSnackbarHost();
  const now = performance.now();
  if (text === lastSnackbarText && now - lastSnackbarAt < 2000) return;
  lastSnackbarText = text;
  lastSnackbarAt = now;
  while (snackbarStack.children.length >= 2) snackbarStack.firstElementChild?.remove();
  const toast = document.createElement("div");
  toast.className = `snackbar ${type}`;
  toast.innerHTML = `<i aria-hidden="true"></i><span>${escapeHtml(text)}</span>`;
  snackbarStack.appendChild(toast);
  window.setTimeout(() => toast.classList.add("show"), 20);
  window.setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("leaving");
  }, 3200);
  window.setTimeout(() => toast.remove(), 3800);
}

function syncSnackbarHost() {
  if (!snackbarStack) return;
  const host = modal?.open ? modal : document.body;
  if (snackbarStack.parentElement !== host) host.appendChild(snackbarStack);
}

function snackbarTypeForMessage(text) {
  const value = String(text).toLowerCase();
  if (/(victory|learned|gained \d|reward:|built|claimed|completed|complete\.|recruits|upgrades|equips|unequipped|defeated|falls|cleared|is clear|is open|joins the party|leaves the party)/.test(value)) return "good";
  if (/found .*(gold|draught|relic|banner|bow|charm|bridle|compass)/.test(value)) return "good";
  if (/(defeat|cannot|blocked|requires|costs|not enough|still guards|still holds|impassable|sealed)/.test(value)) return "warn";
  if (/(dusk falls|dawn breaks)/.test(value)) return "info";
  return "";
}

function ensureAudioContext() {
  if (audioContext) return audioContext;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  audioContext = new AudioCtx();
  musicGain = audioContext.createGain();
  musicGain.gain.value = 0.0001;
  musicGain.connect(audioContext.destination);
  return audioContext;
}

function musicRoleLevel(role = "lead", mode = musicMode) {
  const battle = mode.startsWith("battle");
  if (role === "bass") return battle ? 0.76 : 1.12;
  if (role === "bassPulse") return battle ? 0.72 : 1.06;
  if (role === "pad") return battle ? 0.8 : 1.08;
  if (role === "accent") return battle ? 0.74 : 1.04;
  if (role === "spark") return battle ? 0.62 : 0.92;
  if (role === "turnaround") return battle ? 0.7 : 0.98;
  if (role === "cue") return 0.86;
  return battle ? 0.7 : 1.14;
}

function musicNoiseLevel(mode = musicMode, filterType = "bandpass") {
  let level = mode.startsWith("battle") ? 0.68 : 1.02;
  if (filterType === "highpass") level *= 0.84;
  if (mode.startsWith("modal:caravan")) level *= 0.92;
  return level;
}

function updateMusicVolumeUi() {
  const percent = Math.round(musicVolume * 100);
  if (musicVolumeSlider) musicVolumeSlider.value = String(percent);
  if (musicVolumeValue) musicVolumeValue.textContent = `${percent}%`;
}

function setMusicVolume(value, persist = true) {
  const nextValue = Math.max(0, Math.min(MUSIC_VOLUME_MAX, Number(value)));
  musicVolume = Number.isFinite(nextValue) ? nextValue : 1;
  updateMusicVolumeUi();
  updateMusicButton();
  if (persist) saveAudioSettings();
  if (musicEnabled && musicGain && audioContext) applyMusicGain(currentMusicMode(), currentMusicState(currentMusicMode()), true);
}

function playTone(frequency, duration = 0.1, type = "square", volume = 0.05, destination = null, options = {}) {
  const ctxAudio = ensureAudioContext();
  if (!ctxAudio) return;
  const osc = ctxAudio.createOscillator();
  const oscB = options.detuneCents ? ctxAudio.createOscillator() : null;
  const gain = ctxAudio.createGain();
  const filter = options.filterType ? ctxAudio.createBiquadFilter() : null;
  const pan = typeof options.pan === "number" && ctxAudio.createStereoPanner ? ctxAudio.createStereoPanner() : null;
  const attack = options.attack ?? 0.012;
  const release = options.release ?? duration;
  const peak = Math.max(0.0001, volume);
  osc.type = type;
  osc.frequency.value = frequency;
  if (options.detuneCents) osc.detune.value = -Math.abs(options.detuneCents) * 0.5;
  gain.gain.setValueAtTime(0.0001, ctxAudio.currentTime);
  gain.gain.exponentialRampToValueAtTime(peak, ctxAudio.currentTime + Math.max(0.004, attack));
  gain.gain.exponentialRampToValueAtTime(0.0001, ctxAudio.currentTime + Math.max(attack + 0.02, release));
  let node = gain;
  if (filter) {
    filter.type = options.filterType;
    filter.frequency.value = options.filterFrequency || 1800;
    filter.Q.value = options.filterQ || 0.7;
    osc.connect(filter);
    if (oscB) oscB.connect(filter);
    filter.connect(gain);
  } else {
    osc.connect(gain);
    if (oscB) oscB.connect(gain);
  }
  if (oscB) {
    oscB.type = options.secondaryType || type;
    oscB.frequency.value = frequency;
    oscB.detune.value = Math.abs(options.detuneCents);
  }
  if (pan) {
    pan.pan.value = Math.max(-1, Math.min(1, options.pan));
    gain.connect(pan);
    node = pan;
  }
  node.connect(destination || ctxAudio.destination);
  osc.start();
  osc.stop(ctxAudio.currentTime + Math.max(release, duration) + 0.02);
  if (oscB) {
    oscB.start();
    oscB.stop(ctxAudio.currentTime + Math.max(release, duration) + 0.02);
  }
}

function playNoise(duration = 0.06, volume = 0.03, destination = null, filterFrequency = 900, filterType = "bandpass", options = {}) {
  const ctxAudio = ensureAudioContext();
  if (!ctxAudio) return;
  const length = Math.max(1, Math.floor(ctxAudio.sampleRate * duration));
  const buffer = ctxAudio.createBuffer(1, length, ctxAudio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1;
  const source = ctxAudio.createBufferSource();
  const filter = ctxAudio.createBiquadFilter();
  const gain = ctxAudio.createGain();
  const pan = typeof options.pan === "number" && ctxAudio.createStereoPanner ? ctxAudio.createStereoPanner() : null;
  source.buffer = buffer;
  filter.type = filterType;
  filter.frequency.value = filterFrequency;
  filter.Q.value = options.filterQ || 0.6;
  const peak = destination === musicGain ? Math.max(0.0001, volume * musicNoiseLevel(musicMode, filterType)) : volume;
  gain.gain.setValueAtTime(peak, ctxAudio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctxAudio.currentTime + duration);
  source.connect(filter);
  filter.connect(gain);
  if (pan) {
    pan.pan.value = Math.max(-1, Math.min(1, options.pan));
    gain.connect(pan);
    pan.connect(destination || ctxAudio.destination);
  } else {
    gain.connect(destination || ctxAudio.destination);
  }
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
    slash: [132, 0.09, "sawtooth", 0.14],
    shot: [920, 0.06, "square", 0.11],
    spell: [620, 0.12, "triangle", 0.095],
    guard: [520, 0.12, "triangle", 0.07],
    win: [660, 0.16, "square", 0.08],
  };
  const sound = sounds[kind];
  if (!sound) return;
  playTone(sound[0], sound[1], sound[2], sound[3]);
  if (kind === "coin") window.setTimeout(() => playTone(1175, 0.08, "square", 0.035), 70);
  if (kind === "shot") {
    window.setTimeout(() => playTone(1240, 0.05, "square", 0.07), 34);
    window.setTimeout(() => playTone(760, 0.035, "triangle", 0.04), 86);
  }
  if (kind === "spell") {
    window.setTimeout(() => playTone(880, 0.11, "sine", 0.06), 42);
    window.setTimeout(() => playTone(1160, 0.09, "triangle", 0.05), 96);
  }
  if (kind === "slash") {
    window.setTimeout(() => playTone(96, 0.05, "square", 0.09), 22);
    window.setTimeout(() => playTone(182, 0.045, "triangle", 0.05), 72);
  }
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
  if (event?.target?.closest?.("#musicBtn, #musicVolume")) return;
  if (!musicEnabled) setMusicEnabled(true);
}

function startMusic() {
  stopMusic();
  musicStep = 0;
  musicMode = currentMusicMode();
  primeMusicTransition(musicMode, true);
  scheduleMusicBeat();
}

function stopMusic() {
  if (musicTimer) window.clearTimeout(musicTimer);
  musicTimer = 0;
  if (musicTransitionTimer) window.clearTimeout(musicTransitionTimer);
  musicTransitionTimer = 0;
  if (musicGain && audioContext) {
    musicGain.gain.cancelScheduledValues(audioContext.currentTime);
    musicGain.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.05);
  }
}

function currentTownMusicFaction() {
  const event = events.get(tileKey(state.x, state.y));
  if (event?.type === "town") return event.faction || "";
  return "";
}

function currentMusicState(mode = currentMusicMode()) {
  const mineCount = countVisitedEvents("mine");
  const townCount = ownedTownEntries().length;
  const battleCount = countVisitedEvents("battle");
  const prosperity = Math.min(1, (mineCount + townCount * 1.5) / 10);
  const hpRatio = (state.hero.hp || 1) / Math.max(1, state.hero.maxHp || 1);
  const danger = Math.min(1, Math.max((1 - hpRatio) * 0.8, regionalThreatRank() / 4, state.nightReady ? 0.4 : 0, mode.startsWith("battle") ? 0.55 : 0));
  const moraleLift = Math.min(1, ((state.campMorale || 0) + (state.nightStreak || 0) * 0.5 + Math.max(0, state.hero.morale - 5) * 0.25) / 6);
  const lift = Math.max(0, Math.min(1, prosperity * 0.45 + moraleLift * 0.55));
  const panSeed = Math.sin((state.day + mineCount + battleCount) * 0.7) * 0.24;
  return {
    prosperity,
    tension: danger,
    lift,
    panSeed,
  };
}

function targetMusicGainForMode(mode, musicState = currentMusicState(mode)) {
  const base = mode.startsWith("battle")
    ? 0.145
    : mode.startsWith("modal:caravan")
      ? 0.255
      : mode.startsWith("modal:")
        ? 0.245
        : mode === "night"
          ? 0.27
          : mode === "victory"
            ? 0.285
            : 0.275;
  const leveled = Math.max(0.13, base + musicState.lift * 0.02 - musicState.tension * (mode.startsWith("modal:") ? 0.007 : 0.01));
  return Math.max(0.0001, leveled * musicVolume * MUSIC_OUTPUT_BOOST);
}

function applyMusicGain(mode, musicState = currentMusicState(mode), quick = false) {
  if (!musicGain || !audioContext) return;
  const target = targetMusicGainForMode(mode, musicState);
  musicGain.gain.cancelScheduledValues(audioContext.currentTime);
  musicGain.gain.setTargetAtTime(target, audioContext.currentTime, quick ? 0.045 : 0.12);
}

function playMusicModeCue(mode) {
  if (!musicGain || !audioContext) return;
  if (mode.startsWith("modal:caravan")) {
    playMusicVoice(294, 0.11, "triangle", 0.03, "cue", { mode, pan: -0.15 });
    window.setTimeout(() => playMusicVoice(392, 0.14, "sine", 0.026, "cue", { mode, pan: 0.15 }), 65);
    return;
  }
  if (mode.startsWith("modal:")) {
    playMusicVoice(330, 0.08, "triangle", 0.026, "cue", { mode });
    window.setTimeout(() => playMusicVoice(440, 0.1, "sine", 0.02, "cue", { mode }), 52);
    return;
  }
  if (mode.startsWith("battle")) {
    playMusicVoice(98, 0.12, "sawtooth", 0.05, "cue", { mode });
    window.setTimeout(() => playMusicVoice(147, 0.08, "square", 0.028, "cue", { mode }), 58);
    return;
  }
  if (mode === "night") {
    playMusicVoice(165, 0.14, "sine", 0.028, "cue", { mode });
    return;
  }
  playMusicVoice(262, 0.08, "triangle", 0.024, "cue", { mode });
}

function primeMusicTransition(mode, quick = false) {
  if (!musicGain || !audioContext) {
    musicMode = mode;
    musicStep = 0;
    return;
  }
  if (musicTransitionTimer) window.clearTimeout(musicTransitionTimer);
  const now = audioContext.currentTime;
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setTargetAtTime(0.04, now, quick ? 0.03 : 0.06);
  musicMode = mode;
  musicStep = 0;
  playMusicModeCue(mode);
  musicTransitionTimer = window.setTimeout(() => {
    applyMusicGain(mode, currentMusicState(mode), true);
    musicTransitionTimer = 0;
  }, quick ? 40 : 120);
}

function musicRoleShape(role = "lead", mode = "field", options = {}) {
  const modal = mode.startsWith("modal:");
  const battle = mode.startsWith("battle");
  const caravan = mode.startsWith("modal:caravan");
  if (role === "bass") return { attack: 0.01, release: 0.18, filterType: "lowpass", filterFrequency: battle ? 520 : caravan ? 760 : 680, detuneCents: battle ? 4 : 2, pan: options.pan ?? 0 };
  if (role === "bassPulse") return { attack: 0.008, release: 0.14, filterType: "lowpass", filterFrequency: battle ? 460 : 620, pan: options.pan ?? 0 };
  if (role === "pad") return { attack: 0.022, release: 0.24, filterType: "lowpass", filterFrequency: caravan ? 2100 : 1800, detuneCents: modal ? 3 : 5, pan: options.pan ?? 0 };
  if (role === "accent") return { attack: 0.006, release: 0.11, filterType: "bandpass", filterFrequency: caravan ? 1850 : modal ? 2200 : 2600, pan: options.pan ?? 0.1 };
  if (role === "spark") return { attack: 0.004, release: 0.08, filterType: "highpass", filterFrequency: modal ? 1800 : 2200, pan: options.pan ?? -0.1 };
  if (role === "turnaround") return { attack: 0.008, release: 0.19, filterType: "bandpass", filterFrequency: battle ? 1100 : 1450, detuneCents: 4, pan: options.pan ?? 0 };
  if (role === "cue") return { attack: 0.005, release: 0.12, filterType: "bandpass", filterFrequency: modal ? 1800 : 1400, pan: options.pan ?? 0 };
  return { attack: 0.01, release: modal ? 0.12 : 0.15, filterType: modal ? "bandpass" : "lowpass", filterFrequency: battle ? 1600 : caravan ? 1850 : 2100, detuneCents: modal ? 2 : 4, pan: options.pan ?? 0 };
}

function playMusicVoice(frequency, duration, wave, volume, role = "lead", options = {}) {
  const shape = musicRoleShape(role, options.mode || musicMode, options);
  playTone(frequency, duration, wave, volume * musicRoleLevel(role, options.mode || musicMode), musicGain, shape);
}

function scheduleMusicBeat() {
  if (!musicEnabled || !musicGain || !audioContext) return;
  const mode = currentMusicMode();
  if (mode !== musicMode) {
    primeMusicTransition(mode);
  }
  const musicState = currentMusicState(mode);
  const patterns = {
    field: {
      intro: [196, 247, 294, 330, 392, 440, 494, 523],
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
      turnaroundSteps: [15, 31],
    },
    night: {
      intro: [147, 165, 196, 220, 247, 220, 196, 165],
      variations: [
        [147, 196, 220, 247, 294, 247, 220, 196, 165, 220, 247, 330, 294, 247, 220, 196, 147, 165, 196, 247, 294, 330, 294, 247, 220, 196, 165, 220, 247, 294, 247, 196],
        [165, 220, 247, 294, 330, 294, 247, 220, 196, 247, 294, 392, 330, 294, 247, 220, 185, 220, 247, 277, 330, 392, 330, 294, 247, 220, 196, 165, 196, 220, 247, 196],
        [147, 185, 196, 220, 247, 294, 247, 220, 196, 220, 247, 294, 330, 294, 247, 220, 165, 196, 220, 247, 294, 247, 220, 196, 185, 220, 247, 330, 294, 247, 220, 196],
      ],
      bass: [73, 73, 98, 98, 82, 82, 110, 98, 65, 65, 98, 98, 82, 110, 98, 82, 73, 73, 98, 98, 82, 82, 123, 110, 65, 65, 98, 98, 82, 98, 73, 65],
      tempo: 0.27,
      delay: 300,
      sectionLength: 32,
      turnaroundSteps: [15, 31],
    },
    victory: {
      variations: [
        [330, 392, 494, 659, 587, 523, 494, 392, 440, 523, 659, 784, 740, 659, 587, 523, 494, 587, 659, 880, 784, 740, 659, 587, 523, 494, 440, 523, 587, 659, 587, 523],
        [392, 494, 587, 784, 740, 659, 587, 494, 523, 659, 784, 988, 880, 784, 740, 659, 587, 659, 784, 1047, 988, 880, 784, 740, 659, 587, 523, 659, 740, 784, 740, 659],
      ],
      bass: [98, 98, 147, 147, 123, 123, 196, 147, 110, 110, 165, 165, 147, 196, 165, 123, 98, 98, 147, 147, 165, 165, 196, 165, 123, 123, 165, 165, 147, 196, 165, 147],
      tempo: 0.24,
      delay: 255,
      sectionLength: 32,
      wave: "triangle",
      accentWave: "sine",
      drumStyle: "victory",
    },
    "modal:town": {
      variations: [
        [330, 392, 440, 523, 494, 440, 392, 330, 349, 440, 494, 587, 523, 494, 440, 392, 330, 392, 523, 659, 587, 523, 494, 440],
        [392, 440, 523, 587, 659, 587, 523, 440, 392, 494, 587, 659, 740, 659, 587, 494, 440, 523, 659, 784, 740, 659, 587, 523],
      ],
      bass: [82, 82, 123, 123, 110, 110, 147, 123, 98, 98, 147, 147, 123, 165, 147, 123, 82, 82, 123, 123, 147, 147, 165, 147],
      tempo: 0.26,
      delay: 280,
      sectionLength: 24,
      wave: "triangle",
      accentWave: "sine",
      drumStyle: "town",
    },
    "modal:town:grove": {
      variations: [
        [330, 392, 440, 494, 523, 494, 440, 392, 349, 440, 494, 587, 523, 494, 440, 392],
        [392, 440, 494, 523, 587, 523, 494, 440, 392, 494, 523, 659, 587, 523, 494, 440],
      ],
      bass: [82, 82, 110, 110, 98, 98, 147, 110, 82, 82, 123, 123, 110, 147, 123, 98],
      tempo: 0.25,
      delay: 270,
      sectionLength: 16,
      wave: "triangle",
      accentWave: "sine",
      drumStyle: "groveTown",
      turnaroundSteps: [15],
    },
    "modal:town:forge": {
      variations: [
        [294, 330, 392, 440, 392, 330, 294, 262, 294, 349, 392, 494, 440, 392, 349, 294],
        [330, 392, 440, 523, 494, 440, 392, 349, 330, 392, 494, 587, 523, 494, 440, 392],
      ],
      bass: [73, 73, 110, 110, 98, 98, 147, 110, 73, 73, 123, 123, 110, 147, 123, 98],
      tempo: 0.23,
      delay: 248,
      sectionLength: 16,
      wave: "square",
      accentWave: "triangle",
      drumStyle: "forgeTown",
      turnaroundSteps: [15],
    },
    "modal:town:tide": {
      variations: [
        [349, 392, 440, 523, 587, 523, 440, 392, 370, 440, 494, 587, 659, 587, 494, 440],
        [330, 392, 440, 494, 523, 494, 440, 392, 349, 392, 440, 523, 587, 523, 494, 440],
      ],
      bass: [82, 82, 123, 123, 110, 110, 165, 123, 98, 98, 147, 147, 123, 165, 147, 110],
      tempo: 0.24,
      delay: 262,
      sectionLength: 16,
      wave: "sine",
      accentWave: "triangle",
      drumStyle: "tideTown",
      turnaroundSteps: [15],
    },
    "modal:town:dusk": {
      variations: [
        [294, 370, 440, 494, 554, 494, 440, 370, 311, 392, 466, 554, 622, 554, 466, 392],
        [330, 392, 466, 554, 622, 554, 494, 392, 349, 440, 494, 587, 659, 587, 494, 440],
      ],
      bass: [69, 69, 104, 104, 93, 93, 139, 104, 83, 83, 124, 124, 104, 156, 124, 93],
      tempo: 0.22,
      delay: 245,
      sectionLength: 16,
      wave: "sine",
      accentWave: "triangle",
      drumStyle: "duskTown",
      turnaroundSteps: [15],
    },
    "modal:shop": {
      variations: [
        [392, 494, 587, 494, 659, 587, 494, 392, 440, 523, 659, 523, 740, 659, 523, 440],
        [330, 392, 494, 392, 587, 494, 392, 330, 349, 440, 523, 440, 659, 587, 523, 440],
      ],
      bass: [98, 147, 98, 165, 110, 165, 110, 196, 98, 147, 98, 165, 123, 185, 123, 196],
      tempo: 0.18,
      delay: 190,
      sectionLength: 16,
      wave: "square",
      accentWave: "triangle",
      drumStyle: "shop",
    },
    "modal:caravan": {
      intro: [247, 294, 330, 392, 440, 392, 330, 294],
      variations: [
        [294, 330, 392, 440, 392, 330, 294, 262, 294, 330, 392, 494, 440, 392, 330, 294, 262, 294, 330, 392, 440, 392, 330, 294],
        [330, 392, 440, 494, 440, 392, 330, 294, 330, 392, 494, 587, 494, 440, 392, 330, 294, 330, 392, 440, 392, 330, 294, 262],
      ],
      bass: [73, 73, 98, 98, 82, 82, 110, 98, 73, 73, 123, 123, 98, 110, 98, 82, 73, 73, 98, 98, 82, 82, 110, 98],
      tempo: 0.25,
      delay: 275,
      sectionLength: 24,
      wave: "triangle",
      accentWave: "sine",
      drumStyle: "caravan",
      turnaroundSteps: [11, 23],
    },
    "modal:caravan:grove": {
      variations: [
        [330, 392, 440, 494, 440, 392, 330, 294, 330, 392, 494, 523, 494, 440, 392, 330, 294, 330, 392, 440, 392, 330, 294, 262],
        [294, 330, 392, 440, 494, 440, 392, 330, 349, 392, 440, 523, 494, 440, 392, 330, 294, 330, 392, 494, 440, 392, 330, 294],
      ],
      bass: [82, 82, 110, 110, 98, 98, 147, 110, 82, 82, 123, 123, 110, 147, 123, 98, 82, 82, 110, 110, 98, 98, 123, 110],
      tempo: 0.25,
      delay: 278,
      sectionLength: 24,
      wave: "triangle",
      accentWave: "sine",
      drumStyle: "caravanGrove",
      turnaroundSteps: [11, 23],
    },
    "modal:caravan:forge": {
      variations: [
        [262, 330, 392, 440, 392, 330, 294, 262, 294, 349, 392, 494, 440, 392, 349, 294, 262, 294, 330, 392, 349, 330, 294, 262],
        [294, 349, 392, 494, 440, 392, 349, 294, 330, 392, 440, 523, 494, 440, 392, 349, 294, 330, 392, 440, 392, 349, 330, 294],
      ],
      bass: [65, 65, 98, 98, 82, 82, 123, 98, 73, 73, 110, 110, 98, 123, 110, 82, 65, 65, 98, 98, 82, 82, 110, 98],
      tempo: 0.24,
      delay: 266,
      sectionLength: 24,
      wave: "square",
      accentWave: "triangle",
      drumStyle: "caravanForge",
      turnaroundSteps: [11, 23],
    },
    "modal:caravan:tide": {
      variations: [
        [349, 392, 440, 523, 494, 440, 392, 349, 392, 440, 494, 587, 523, 494, 440, 392, 349, 392, 440, 523, 494, 440, 392, 349],
        [330, 392, 440, 494, 440, 392, 349, 330, 370, 440, 494, 587, 523, 494, 440, 392, 349, 392, 440, 494, 440, 392, 349, 330],
      ],
      bass: [82, 82, 123, 123, 110, 110, 165, 123, 98, 98, 147, 147, 123, 165, 147, 110, 82, 82, 123, 123, 110, 110, 147, 123],
      tempo: 0.24,
      delay: 272,
      sectionLength: 24,
      wave: "sine",
      accentWave: "triangle",
      drumStyle: "caravanTide",
      turnaroundSteps: [11, 23],
    },
    "modal:caravan:dusk": {
      variations: [
        [294, 370, 440, 494, 440, 392, 370, 330, 370, 440, 494, 554, 494, 440, 392, 370, 330, 370, 440, 494, 440, 392, 370, 330],
        [330, 392, 466, 554, 494, 440, 392, 349, 392, 466, 554, 622, 554, 494, 440, 392, 349, 392, 466, 554, 494, 440, 392, 349],
      ],
      bass: [69, 69, 104, 104, 93, 93, 139, 104, 83, 83, 124, 124, 104, 139, 124, 93, 69, 69, 104, 104, 93, 93, 124, 104],
      tempo: 0.23,
      delay: 258,
      sectionLength: 24,
      wave: "sine",
      accentWave: "triangle",
      drumStyle: "caravanDusk",
      turnaroundSteps: [11, 23],
    },
    "modal:notice": {
      variations: [
        [247, 294, 349, 440, 392, 349, 294, 247, 262, 330, 392, 494, 440, 392, 330, 262],
        [220, 277, 330, 415, 392, 330, 277, 220, 247, 294, 370, 440, 415, 370, 294, 247],
      ],
      bass: [55, 55, 82, 82, 73, 73, 110, 82, 62, 62, 92, 92, 82, 123, 92, 73],
      tempo: 0.24,
      delay: 255,
      sectionLength: 16,
      wave: "sine",
      accentWave: "triangle",
      drumStyle: "notice",
    },
    "modal:barracks": {
      variations: [
        [196, 247, 294, 349, 330, 294, 247, 220, 196, 247, 294, 392, 349, 330, 294, 247],
        [220, 262, 330, 392, 370, 330, 294, 262, 247, 294, 349, 440, 392, 349, 330, 294],
      ],
      bass: [49, 49, 73, 73, 65, 65, 98, 73, 55, 55, 82, 82, 73, 98, 82, 65],
      tempo: 0.24,
      delay: 255,
      sectionLength: 16,
      wave: "triangle",
      accentWave: "sine",
      drumStyle: "barracks",
    },
    "modal:night": {
      variations: [
        [165, 220, 247, 330, 294, 247, 220, 165, 196, 247, 294, 392, 330, 294, 247, 196],
        [147, 196, 247, 294, 330, 294, 247, 196, 165, 220, 277, 330, 392, 330, 277, 220],
      ],
      bass: [41, 41, 62, 62, 55, 55, 82, 62, 46, 46, 69, 69, 62, 92, 69, 55],
      tempo: 0.3,
      delay: 320,
      sectionLength: 16,
      wave: "sine",
      accentWave: "triangle",
      drumStyle: "modalNight",
    },
    "modal:level": {
      variations: [
        [523, 659, 784, 1047, 988, 880, 784, 659, 587, 740, 880, 1175, 1047, 988, 880, 784],
        [392, 523, 659, 784, 880, 784, 659, 523, 440, 587, 740, 880, 988, 880, 740, 587],
      ],
      bass: [98, 98, 147, 147, 123, 123, 196, 147, 110, 110, 165, 165, 147, 196, 165, 123],
      tempo: 0.2,
      delay: 210,
      sectionLength: 16,
      wave: "triangle",
      accentWave: "sine",
      drumStyle: "level",
    },
    "modal:story": {
      variations: [
        [294, 349, 392, 494, 440, 392, 349, 294, 330, 392, 440, 523, 494, 440, 392, 330],
        [262, 330, 392, 440, 523, 494, 440, 392, 294, 349, 440, 494, 587, 523, 494, 440],
      ],
      bass: [65, 65, 98, 98, 82, 82, 123, 98, 73, 73, 110, 110, 98, 147, 110, 82],
      tempo: 0.28,
      delay: 300,
      sectionLength: 16,
      wave: "triangle",
      accentWave: "sine",
      drumStyle: "story",
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
    "battle:skirmish": {
      variations: [
        [247, 294, 330, 392, 330, 294, 247, 220, 247, 294, 349, 392, 349, 294, 262, 247],
        [294, 330, 392, 440, 392, 330, 294, 262, 294, 349, 392, 494, 440, 392, 330, 294],
      ],
      bass: [55, 55, 82, 82, 73, 73, 98, 82, 55, 55, 82, 98, 73, 98, 82, 73],
      tempo: 0.15,
      delay: 155,
      sectionLength: 16,
      wave: "square",
      accentWave: "sawtooth",
      drumStyle: "march",
    },
    "battle:beast": {
      variations: [
        [196, 247, 294, 247, 330, 294, 247, 196, 220, 262, 330, 294, 392, 330, 294, 247],
        [220, 277, 330, 277, 415, 370, 330, 277, 247, 294, 370, 330, 440, 392, 330, 294],
      ],
      bass: [49, 49, 73, 49, 82, 82, 73, 49, 55, 55, 82, 55, 98, 82, 73, 55],
      tempo: 0.19,
      delay: 205,
      sectionLength: 16,
      wave: "sawtooth",
      accentWave: "triangle",
      drumStyle: "stomp",
    },
    "battle:arcane": {
      variations: [
        [277, 330, 415, 494, 554, 494, 415, 330, 311, 370, 466, 554, 622, 554, 466, 370],
        [247, 311, 370, 466, 554, 622, 554, 466, 415, 370, 311, 370, 466, 554, 494, 415],
      ],
      bass: [62, 62, 93, 93, 74, 74, 111, 93, 69, 69, 104, 104, 83, 111, 104, 74],
      tempo: 0.18,
      delay: 190,
      sectionLength: 16,
      wave: "triangle",
      accentWave: "sine",
      drumStyle: "arcane",
    },
    "battle:guardian": {
      variations: [
        [165, 220, 247, 294, 330, 294, 247, 220, 196, 247, 294, 349, 392, 349, 294, 247],
        [196, 247, 294, 330, 392, 330, 294, 247, 220, 262, 330, 392, 440, 392, 330, 294],
      ],
      bass: [41, 41, 62, 62, 55, 55, 82, 62, 49, 49, 73, 73, 62, 82, 73, 55],
      tempo: 0.2,
      delay: 220,
      sectionLength: 16,
      wave: "square",
      accentWave: "square",
      drumStyle: "siege",
    },
    "battle:boss": {
      variations: [
        [147, 196, 247, 294, 392, 370, 294, 247, 165, 220, 262, 330, 440, 415, 330, 262],
        [196, 247, 294, 392, 494, 440, 392, 294, 220, 262, 330, 440, 523, 494, 392, 330],
      ],
      bass: [37, 37, 55, 55, 49, 49, 73, 55, 41, 41, 62, 62, 55, 82, 73, 55],
      tempo: 0.22,
      delay: 235,
      sectionLength: 16,
      wave: "sawtooth",
      accentWave: "square",
      drumStyle: "boss",
    },
    "battle:night": {
      variations: [
        [165, 196, 247, 294, 247, 196, 185, 165, 196, 247, 330, 294, 247, 220, 196, 165],
        [147, 185, 220, 277, 330, 277, 247, 220, 185, 220, 277, 330, 392, 330, 277, 220],
      ],
      bass: [37, 37, 55, 55, 46, 46, 73, 55, 41, 41, 62, 62, 55, 73, 62, 46],
      tempo: 0.21,
      delay: 230,
      sectionLength: 16,
      wave: "triangle",
      accentWave: "sine",
      drumStyle: "nightBattle",
    },
  };
  const fieldPatterns = {
    "field:dawnhaven_march": {
      intro: [262, 294, 330, 392, 440, 392, 330, 294],
      variations: [
        [262, 330, 392, 523, 494, 392, 330, 392, 262, 330, 392, 587, 523, 494, 392, 330],
        [294, 330, 392, 440, 523, 494, 392, 330, 294, 392, 440, 523, 587, 523, 440, 392],
      ],
      bass: [65, 65, 98, 98, 82, 82, 110, 98, 65, 65, 98, 98, 110, 98, 82, 65],
      tempo: 0.24,
      delay: 260,
      sectionLength: 16,
      wave: "triangle",
      accentWave: "sine",
      drumStyle: "light",
      turnaroundSteps: [15],
    },
    "field:central_kingdom": { ...patterns.field, wave: "sawtooth", accentWave: "triangle", drumStyle: "road" },
    "field:high_march": {
      intro: [330, 392, 440, 494, 587, 659, 587, 494],
      variations: [
        [392, 494, 587, 740, 659, 587, 494, 587, 440, 523, 659, 784, 740, 659, 587, 494],
        [330, 392, 494, 587, 740, 659, 587, 523, 494, 587, 659, 880, 784, 740, 659, 587],
      ],
      bass: [98, 98, 147, 147, 123, 123, 196, 147, 110, 110, 165, 165, 147, 196, 165, 123],
      tempo: 0.2,
      delay: 225,
      sectionLength: 16,
      wave: "square",
      accentWave: "triangle",
      drumStyle: "high",
      turnaroundSteps: [15],
    },
    "field:low_roads": {
      intro: [196, 220, 247, 294, 330, 294, 247, 220],
      variations: [
        [196, 247, 294, 330, 294, 247, 220, 247, 196, 220, 247, 330, 294, 247, 220, 196],
        [220, 247, 294, 370, 330, 294, 247, 220, 196, 247, 294, 392, 370, 330, 294, 247],
      ],
      bass: [49, 49, 73, 73, 65, 65, 98, 73, 55, 55, 82, 82, 73, 98, 82, 65],
      tempo: 0.27,
      delay: 285,
      sectionLength: 16,
      wave: "triangle",
      accentWave: "sine",
      drumStyle: "low",
      turnaroundSteps: [15],
    },
    "field:southern_wilds": {
      intro: [220, 247, 294, 330, 392, 330, 294, 247],
      variations: [
        [220, 277, 330, 392, 440, 392, 330, 277, 247, 294, 349, 440, 392, 349, 294, 247],
        [247, 294, 349, 415, 494, 415, 349, 294, 277, 330, 392, 494, 440, 392, 330, 277],
      ],
      bass: [55, 55, 82, 82, 69, 69, 110, 82, 62, 62, 92, 92, 82, 110, 92, 69],
      tempo: 0.25,
      delay: 270,
      sectionLength: 16,
      wave: "sawtooth",
      accentWave: "square",
      drumStyle: "wild",
      turnaroundSteps: [15],
    },
    "field:black_gate_approach": {
      intro: [147, 165, 196, 220, 247, 220, 196, 165],
      variations: [
        [147, 185, 220, 277, 247, 220, 185, 165, 147, 165, 196, 247, 220, 196, 185, 147],
        [165, 196, 247, 294, 277, 247, 220, 196, 165, 185, 220, 277, 247, 220, 196, 165],
      ],
      bass: [37, 37, 55, 55, 46, 46, 73, 55, 41, 41, 62, 62, 55, 73, 62, 46],
      tempo: 0.29,
      delay: 315,
      sectionLength: 16,
      wave: "sine",
      accentWave: "triangle",
      drumStyle: "gate",
      turnaroundSteps: [15],
    },
  };
  const pattern = patterns[mode] || fieldPatterns[mode] || patterns.field;
  applyMusicGain(mode, musicState);
  const sectionLength = pattern.sectionLength || 16;
  const sectionIndex = Math.floor(musicStep / sectionLength);
  const stepInSection = musicStep % sectionLength;
  const phrase = pattern.variations?.[sectionIndex % pattern.variations.length] || pattern.variations?.[0] || [];
  const introLength = pattern.intro?.length || 0;
  const note = introLength && musicStep < introLength ? pattern.intro[musicStep] : phrase[stepInSection % phrase.length];
  const root = pattern.bass[Math.floor(musicStep / 2) % pattern.bass.length];
  const field = mode.startsWith("field");
  const battle = mode.startsWith("battle");
  const modalMusic = mode.startsWith("modal:");
  const night = mode === "night";
  const victory = mode === "victory";
  const leadWave = pattern.wave || (battle ? "square" : field ? "sawtooth" : "triangle");
  const accentWave = pattern.accentWave || (battle ? "sawtooth" : "triangle");
  const leadVolume = (battle ? 0.074 : modalMusic ? 0.04 : field ? 0.046 : 0.05) + musicState.lift * 0.006;
  const bassVolume = (battle ? 0.128 : modalMusic ? 0.066 : field ? 0.096 : 0.09) + musicState.tension * 0.01;
  playMusicVoice(note, pattern.tempo, leadWave, leadVolume, "lead", { mode, pan: musicState.panSeed });
  if (field && musicStep % 4 === 0) playMusicVoice(note * 2, 0.1, accentWave, 0.022 + musicState.prosperity * 0.008, "accent", { mode, pan: -musicState.panSeed });
  if (field && [7, 15, 23, 31].includes(stepInSection)) playMusicVoice(note * (pattern.drumStyle === "low" ? 1.25 : 1.5), 0.12, accentWave, 0.02 + musicState.lift * 0.006, "spark", { mode });
  if (field && [12, 28].includes(stepInSection)) playMusicVoice(note * 0.75, 0.18, pattern.drumStyle === "gate" ? "sine" : "triangle", 0.018 + musicState.prosperity * 0.005, "pad", { mode });
  if (modalMusic && musicStep % 4 === 0) playMusicVoice(note * (pattern.drumStyle.includes("caravan") ? 1.5 : pattern.drumStyle === "shop" ? 2 : 1.5), pattern.drumStyle.includes("caravan") ? 0.12 : 0.085, accentWave, pattern.drumStyle.includes("caravan") ? 0.016 : 0.02, "accent", { mode });
  if (modalMusic && [6, 14, 22, 30].includes(stepInSection) && !pattern.drumStyle.includes("caravan")) playMusicVoice(note * 0.75, 0.13, pattern.drumStyle === "notice" ? "sine" : "triangle", 0.016, "spark", { mode });
  if (battle && musicStep % 4 === 1) playMusicVoice(note * 2, 0.06, accentWave, 0.033 + musicState.tension * 0.005, "accent", { mode });
  if (battle && [6, 14].includes(stepInSection)) playMusicVoice(note * 1.5, 0.08, pattern.drumStyle === "arcane" ? "sine" : "sawtooth", 0.028 + musicState.tension * 0.005, "spark", { mode });
  if (night && musicStep % 8 === 5) playMusicVoice(note * 1.5, 0.14, "sine", 0.024 + musicState.lift * 0.004, "spark", { mode });
  if (night && [10, 26].includes(stepInSection)) playMusicVoice(note * 2, 0.18, "triangle", 0.018, "pad", { mode });
  if (musicStep % 2 === 0) playMusicVoice(root, pattern.tempo + 0.1, pattern.drumStyle === "high" ? "square" : "sine", bassVolume, "bass", { mode, pan: musicState.panSeed * -0.25 });
  if (field && musicStep % 4 === 2) playMusicVoice(root / 2, 0.14, pattern.drumStyle === "gate" ? "sine" : "triangle", (pattern.drumStyle === "light" ? 0.038 : 0.062) + musicState.tension * 0.004, "bassPulse", { mode });
  if (battle && musicStep % 4 === 2) playMusicVoice(pattern.drumStyle === "boss" ? 37 : 55, 0.1, "sawtooth", pattern.drumStyle === "arcane" ? 0.07 : 0.1, "bassPulse", { mode });
  if (!battle && !field && !modalMusic && musicStep % 8 === 6) playMusicVoice(note * 1.5, 0.14, "sine", 0.03, "spark", { mode });
  if ((pattern.turnaroundSteps || []).includes(stepInSection)) playMusicVoice(root * 2, 0.18, battle ? "square" : "triangle", battle ? 0.03 : 0.02 + musicState.lift * 0.004, "turnaround", { mode });
  playMusicArrangement(mode, pattern, { note, root, step: musicStep, beat: stepInSection, field, battle, modalMusic, night, victory, musicState });
  if (field) playFieldDrums(musicStep, pattern.drumStyle || "road");
  if (modalMusic) playModalDrums(musicStep, pattern.drumStyle || "story");
  if (mode === "night") playNightDrums(musicStep);
  if (victory) playVictoryDrums(musicStep);
  if (battle) playBattleDrums(musicStep, pattern.drumStyle || "march");
  musicStep += 1;
  musicTimer = window.setTimeout(scheduleMusicBeat, pattern.delay);
}

function playChord(root, ratios, duration, wave, volume) {
  ratios.forEach((ratio, index) => {
    window.setTimeout(
      () => playMusicVoice(root * ratio, duration, wave, volume, "pad", { mode: musicMode, pan: (index - (ratios.length - 1) / 2) * 0.1 }),
      index * 18
    );
  });
}

function chordRatiosForStyle(style = "road") {
  if (["low", "gate", "nightBattle", "boss"].includes(style)) return [1, 1.189, 1.498];
  if (style === "arcane") return [1, 1.26, 1.414, 1.782];
  if (style === "victory" || style === "light" || style === "high") return [1, 1.26, 1.5, 2];
  return [1, 1.25, 1.5];
}

function playMusicArrangement(mode, pattern, context) {
  const { note, root, step, beat, field, battle, modalMusic, night, victory, musicState } = context;
  const style = pattern.drumStyle || "road";
  const leadVolume = (modalMusic ? 0.014 : battle ? 0.02 : 0.017) + musicState.lift * 0.006 - musicState.tension * 0.003;
  const accentVolume = (modalMusic ? 0.014 : 0.018) + musicState.lift * 0.004;
  const padVolume = (modalMusic ? 0.011 : 0.013) + musicState.lift * 0.004;
  const bassVolume = (battle ? 0.05 : night ? 0.043 : 0.038) + musicState.tension * 0.012;
  const ambientPan = Math.max(-0.35, Math.min(0.35, musicState.panSeed || 0));
  if (field) {
    if (beat % 8 === 0) playChord(root * 2, chordRatiosForStyle(style), 0.44, style === "gate" ? "sine" : "triangle", padVolume);
    if ([2, 6, 10, 14].includes(beat)) {
      playMusicVoice(note * (style === "low" || style === "gate" ? 0.5 : 1.5), 0.08, style === "high" ? "square" : "sine", accentVolume, "accent", {
        mode,
        pan: ambientPan * 0.7,
      });
    }
    if (style === "wild" && [5, 13].includes(beat)) playMusicVoice(note * 0.75, 0.11, "sawtooth", leadVolume + 0.004, "lead", { mode, pan: -ambientPan });
    if (style === "gate" && beat === 0) playMusicVoice(root / 2, 0.62, "sine", bassVolume + 0.01, "bass", { mode });
    return;
  }
  if (night) {
    if ([0, 16].includes(beat)) playChord(root * 2, chordRatiosForStyle("gate"), 0.62, "sine", padVolume + 0.002);
    if ([3, 11, 19, 27].includes(beat)) playMusicVoice(note * 2, 0.12, "sine", leadVolume + 0.004, "lead", { mode, pan: ambientPan });
    if (step % 16 === 8) playMusicVoice(root / 2, 0.8, "triangle", bassVolume + 0.004, "bass", { mode });
    if (musicState.tension > 0.58 && [7, 23].includes(beat)) playMusicVoice(note * 1.5, 0.16, "triangle", 0.015 + musicState.tension * 0.007, "turnaround", { mode, pan: -ambientPan });
    return;
  }
  if (modalMusic) {
    const modalRoot = style.includes("caravan") ? 1.75 : style === "shop" ? 2 : 1.5;
    if (beat % 8 === 0) {
      playChord(
        root * modalRoot,
        chordRatiosForStyle(style),
        style === "notice" ? 0.54 : style.includes("caravan") ? 0.42 : 0.34,
        style === "shop" ? "square" : "triangle",
        style === "barracks" ? padVolume + 0.004 : padVolume
      );
    }
    if (["town", "story", "groveTown", "forgeTown", "tideTown", "duskTown"].includes(style) && [3, 11, 19].includes(beat)) {
      playMusicVoice(note * 2, 0.1, "sine", accentVolume, "accent", { mode, pan: ambientPan });
    }
    if (["shop", "caravan", "caravanGrove", "caravanForge", "caravanTide", "caravanDusk"].includes(style) && [1, 5, 9, 13, 17, 21].includes(beat)) {
      playMusicVoice(note * 1.25, style.includes("caravan") ? 0.06 : 0.045, style.includes("caravan") ? "triangle" : "square", accentVolume + 0.002, "spark", {
        mode,
        pan: beat % 4 === 1 ? -0.22 : 0.22,
      });
    }
    if (style === "notice" && [4, 12].includes(beat)) playMusicVoice(root * 3, 0.16, "triangle", accentVolume, "accent", { mode });
    if (style === "barracks" && [2, 6, 10, 14].includes(beat)) playMusicVoice(root, 0.055, "square", bassVolume * 0.8, "bassPulse", { mode });
    if (style === "level" && [0, 4, 8, 12].includes(beat)) playChord(root * 2, [1, 1.26, 1.5, 2], 0.2, "triangle", padVolume + 0.003);
    if (style === "modalNight" && step % 16 === 8) playMusicVoice(root / 2, 0.72, "sine", bassVolume, "bass", { mode });
    if (style.includes("caravan") && [6, 14, 22].includes(beat)) playMusicVoice(root * 0.75, 0.12, "triangle", bassVolume * 0.75, "bassPulse", { mode, pan: -ambientPan * 0.5 });
    return;
  }
  if (victory) {
    if (beat % 8 === 0) playChord(root * 2, chordRatiosForStyle("victory"), 0.52, "triangle", padVolume + 0.005);
    if ([4, 12, 20, 28].includes(beat)) playMusicVoice(note * 2, 0.1, "sine", leadVolume + 0.01, "lead", { mode, pan: ambientPan });
    if ([15, 31].includes(beat)) playChord(root * 4, [1, 1.26, 1.5], 0.22, "square", padVolume);
    return;
  }
  if (battle) {
    if (beat % 8 === 0) playChord(root, chordRatiosForStyle(style), style === "boss" ? 0.34 : 0.24, style === "arcane" ? "sine" : "sawtooth", style === "boss" ? padVolume + 0.008 : padVolume + 0.003);
    if ([1, 5, 9, 13].includes(beat)) playMusicVoice(note * 0.5, 0.06, "square", bassVolume * 0.6, "bassPulse", { mode, pan: ambientPan * 0.3 });
    if (style === "arcane" && [3, 7, 11, 15].includes(beat)) playMusicVoice(note * 2.5, 0.08, "sine", leadVolume + 0.008, "spark", { mode, pan: -ambientPan });
    if (style === "boss" && beat === 0) playMusicVoice(root / 2, 0.5, "sawtooth", bassVolume + 0.02, "bass", { mode });
  }
}

function playFieldDrums(step, style = "road") {
  const beat = step % 16;
  if (style === "light") {
    if ([0, 8].includes(beat)) playMusicVoice(82, 0.08, "triangle", 0.07, "bassPulse", { mode: musicMode });
    if ([4, 12].includes(beat)) playNoise(0.04, 0.022, musicGain, 3600, "highpass", { pan: 0.08 });
    if ([3, 7, 11, 15].includes(beat)) playMusicVoice(2349, 0.018, "sine", 0.012, "spark", { mode: musicMode, pan: 0.14 });
    return;
  }
  if (style === "low") {
    if ([0, 7, 12].includes(beat)) playMusicVoice(41, 0.16, "sine", 0.105, "bass", { mode: musicMode });
    if ([5, 13].includes(beat)) playNoise(0.075, 0.035, musicGain, 460, "bandpass", { pan: -0.05 });
    if (step % 4 === 2) playMusicVoice(98, 0.05, "triangle", 0.025, "accent", { mode: musicMode });
    return;
  }
  if (style === "high") {
    if ([0, 4, 8, 12].includes(beat)) playMusicVoice(98, 0.06, "square", 0.08, "bassPulse", { mode: musicMode });
    if ([2, 6, 10, 14].includes(beat)) playNoise(0.026, 0.02, musicGain, 5200, "highpass", { pan: 0.12 });
    if ([7, 15].includes(beat)) playMusicVoice(1760, 0.035, "triangle", 0.018, "spark", { mode: musicMode, pan: -0.12 });
    return;
  }
  if (style === "wild") {
    if ([0, 3, 8, 11].includes(beat)) playMusicVoice(55, 0.09, "sawtooth", 0.105, "bassPulse", { mode: musicMode });
    if ([5, 12].includes(beat)) playNoise(0.085, 0.045, musicGain, 620, "bandpass", { pan: -0.16 });
    if (step % 2 === 1) playNoise(0.018, 0.018, musicGain, 4300, "highpass", { pan: 0.15 });
    return;
  }
  if (style === "gate") {
    if ([0, 8].includes(beat)) playMusicVoice(37, 0.2, "sine", 0.115, "bass", { mode: musicMode });
    if ([6, 14].includes(beat)) playNoise(0.11, 0.028, musicGain, 320, "lowpass", { pan: -0.08, filterQ: 0.9 });
    if ([3, 11].includes(beat)) playMusicVoice(740, 0.09, "triangle", 0.014, "accent", { mode: musicMode, pan: 0.1 });
    return;
  }
  if ([0, 6, 8, 14].includes(beat)) {
    playMusicVoice(54, 0.095, "sine", 0.13, "bassPulse", { mode: musicMode });
    playMusicVoice(82, 0.045, "triangle", 0.05, "accent", { mode: musicMode });
  }
  if ([4, 12].includes(beat)) {
    playNoise(0.07, 0.052, musicGain, 520, "bandpass", { pan: -0.06 });
    playMusicVoice(176, 0.035, "triangle", 0.036, "accent", { mode: musicMode, pan: 0.08 });
  }
  if (step % 2 === 1) playNoise(0.024, 0.018, musicGain, 5200, "highpass", { pan: 0.11 });
  if ([3, 7, 11, 15].includes(beat)) playMusicVoice(1760, 0.025, "square", 0.014, "spark", { mode: musicMode, pan: -0.12 });
}

function playNightDrums(step) {
  const beat = step % 16;
  if ([0, 8].includes(beat)) {
    playMusicVoice(44, 0.14, "sine", 0.12, "bass", { mode: musicMode });
    playMusicVoice(66, 0.06, "triangle", 0.04, "accent", { mode: musicMode });
  }
  if ([5, 12].includes(beat)) playNoise(0.08, 0.036, musicGain, 420, "bandpass", { pan: -0.09 });
  if ([3, 7, 11, 15].includes(beat)) playMusicVoice(130, 0.04, "sawtooth", 0.024, "accent", { mode: musicMode, pan: 0.08 });
  if (step % 2 === 1) playNoise(0.02, 0.01, musicGain, 3400, "highpass", { pan: 0.1 });
}

function playModalDrums(step, style = "story") {
  const beat = step % 16;
  if (style === "shop") {
    if ([0, 4, 8, 12].includes(beat)) playMusicVoice(156, 0.035, "triangle", 0.045, "accent", { mode: musicMode });
    if ([2, 6, 10, 14].includes(beat)) playMusicVoice(2349, 0.014, "sine", 0.012, "spark", { mode: musicMode, pan: 0.12 });
    if ([7, 15].includes(beat)) playNoise(0.018, 0.012, musicGain, 5200, "highpass", { pan: -0.08 });
    return;
  }
  if (style === "caravan" || style === "caravanGrove" || style === "caravanForge" || style === "caravanTide" || style === "caravanDusk") {
    if ([0, 6, 8, 14].includes(beat)) playMusicVoice(62, 0.08, "triangle", 0.065, "bassPulse", { mode: musicMode });
    if ([3, 11].includes(beat)) playNoise(0.04, 0.022, musicGain, style === "caravanForge" ? 820 : 620, "bandpass", { pan: -0.08 });
    if ([5, 13].includes(beat)) playMusicVoice(style === "caravanTide" ? 988 : style === "caravanGrove" ? 1175 : 784, 0.03, style === "caravanDusk" ? "triangle" : "sine", 0.014, "spark", {
      mode: musicMode,
      pan: 0.14,
    });
    if ([1, 9].includes(beat)) playMusicVoice(style === "caravanForge" ? 131 : 98, 0.05, "triangle", 0.028, "accent", { mode: musicMode, pan: -0.05 });
    return;
  }
  if (style === "notice") {
    if ([0, 8].includes(beat)) playMusicVoice(62, 0.09, "sine", 0.058, "bassPulse", { mode: musicMode });
    if ([5, 13].includes(beat)) playNoise(0.045, 0.022, musicGain, 760, "bandpass", { pan: -0.08 });
    if ([3, 11].includes(beat)) playMusicVoice(988, 0.04, "triangle", 0.013, "accent", { mode: musicMode, pan: 0.12 });
    return;
  }
  if (style === "barracks") {
    if ([0, 8].includes(beat)) playMusicVoice(49, 0.09, "triangle", 0.062, "bassPulse", { mode: musicMode });
    if ([4, 12].includes(beat)) playNoise(0.022, 0.012, musicGain, 3200, "highpass", { pan: 0.06 });
    if ([7, 15].includes(beat)) playMusicVoice(587, 0.045, "sine", 0.012, "accent", { mode: musicMode, pan: -0.08 });
    return;
  }
  if (style === "town") {
    if ([0, 8].includes(beat)) playMusicVoice(82, 0.07, "triangle", 0.06, "bassPulse", { mode: musicMode });
    if ([4, 12].includes(beat)) playNoise(0.032, 0.018, musicGain, 3200, "highpass", { pan: 0.07 });
    if ([3, 7, 11, 15].includes(beat)) playMusicVoice(1568, 0.022, "sine", 0.012, "spark", { mode: musicMode, pan: -0.09 });
    return;
  }
  if (style === "groveTown" || style === "forgeTown" || style === "tideTown" || style === "duskTown") {
    if ([0, 8].includes(beat)) playMusicVoice(style === "forgeTown" ? 74 : style === "tideTown" ? 88 : 82, 0.08, "triangle", 0.062, "bassPulse", { mode: musicMode });
    if ([4, 12].includes(beat)) playNoise(0.03, 0.018, musicGain, style === "forgeTown" ? 1800 : style === "tideTown" ? 4200 : 3000, style === "forgeTown" ? "bandpass" : "highpass", {
      pan: style === "duskTown" ? -0.1 : 0.08,
    });
    if ([3, 7, 11, 15].includes(beat)) {
      const tone = style === "groveTown" ? 1318 : style === "forgeTown" ? 1047 : style === "tideTown" ? 1760 : 1175;
      const wave = style === "forgeTown" ? "triangle" : "sine";
      playMusicVoice(tone, 0.024, wave, 0.013, "spark", { mode: musicMode, pan: style === "tideTown" ? 0.15 : -0.1 });
    }
    return;
  }
  if (style === "level") {
    if ([0, 8].includes(beat)) playMusicVoice(98, 0.06, "triangle", 0.072, "bassPulse", { mode: musicMode });
    if ([4, 12].includes(beat)) playNoise(0.032, 0.018, musicGain, 5200, "highpass", { pan: 0.1 });
    if ([2, 6, 10, 14].includes(beat)) playMusicVoice(1976, 0.02, "sine", 0.018, "spark", { mode: musicMode, pan: -0.12 });
    return;
  }
  if (style === "modalNight") {
    if ([0, 8].includes(beat)) playMusicVoice(41, 0.12, "sine", 0.08, "bass", { mode: musicMode });
    if ([5, 12].includes(beat)) playNoise(0.058, 0.024, musicGain, 420, "bandpass", { pan: -0.08 });
    if ([3, 11].includes(beat)) playMusicVoice(130, 0.035, "triangle", 0.014, "accent", { mode: musicMode, pan: 0.08 });
    return;
  }
  if ([0, 8].includes(beat)) playMusicVoice(65, 0.07, "triangle", 0.055, "bassPulse", { mode: musicMode });
  if ([4, 12].includes(beat)) playNoise(0.028, 0.014, musicGain, 3600, "highpass", { pan: 0.06 });
}

function playBattleDrums(step, style = "march") {
  const beat = step % 16;
  if (style === "stomp") {
    if ([0, 5, 8, 13].includes(beat)) playMusicVoice(41, 0.13, "sawtooth", 0.16, "bassPulse", { mode: musicMode });
    if ([3, 11].includes(beat)) playNoise(0.09, 0.05, musicGain, 520, "bandpass", { pan: -0.08 });
    if ([7, 15].includes(beat)) playMusicVoice(123, 0.045, "square", 0.03, "accent", { mode: musicMode, pan: 0.08 });
    return;
  }
  if (style === "arcane") {
    if ([0, 8].includes(beat)) playMusicVoice(62, 0.1, "sine", 0.095, "bassPulse", { mode: musicMode });
    if ([4, 10, 14].includes(beat)) playMusicVoice(988, 0.04, "sine", 0.028, "spark", { mode: musicMode, pan: 0.12 });
    if (step % 2 === 1) playNoise(0.018, 0.012, musicGain, 6400, "highpass", { pan: -0.12 });
    return;
  }
  if (style === "siege") {
    if ([0, 4, 8, 12].includes(beat)) playMusicVoice(46, 0.12, "square", 0.14, "bassPulse", { mode: musicMode });
    if ([6, 14].includes(beat)) playNoise(0.11, 0.052, musicGain, 420, "bandpass", { pan: -0.06 });
    if ([2, 10].includes(beat)) playMusicVoice(92, 0.06, "sawtooth", 0.04, "accent", { mode: musicMode, pan: 0.06 });
    return;
  }
  if (style === "boss") {
    if ([0, 3, 8, 11].includes(beat)) {
      playMusicVoice(37, 0.14, "sawtooth", 0.18, "bass", { mode: musicMode });
      playMusicVoice(55, 0.08, "square", 0.07, "bassPulse", { mode: musicMode });
    }
    if ([4, 12].includes(beat)) playNoise(0.12, 0.065, musicGain, 360, "bandpass", { pan: -0.08, filterQ: 1.1 });
    if ([7, 15].includes(beat)) playMusicVoice(1480, 0.035, "square", 0.022, "spark", { mode: musicMode, pan: 0.12 });
    return;
  }
  if (style === "nightBattle") {
    if ([0, 8].includes(beat)) playMusicVoice(44, 0.14, "sine", 0.13, "bass", { mode: musicMode });
    if ([5, 12].includes(beat)) playNoise(0.075, 0.038, musicGain, 520, "bandpass", { pan: -0.06 });
    if ([3, 7, 11, 15].includes(beat)) playMusicVoice(196, 0.035, "triangle", 0.024, "accent", { mode: musicMode, pan: 0.08 });
    return;
  }
  if ([0, 3, 8, 11].includes(beat)) {
    playMusicVoice(46, 0.085, "sine", 0.15, "bassPulse", { mode: musicMode });
    playMusicVoice(69, 0.04, "triangle", 0.06, "accent", { mode: musicMode });
  }
  if ([4, 12].includes(beat)) {
    playNoise(0.075, 0.06, musicGain, 760, "bandpass", { pan: -0.06 });
    playMusicVoice(155, 0.03, "sawtooth", 0.035, "accent", { mode: musicMode, pan: 0.08 });
  }
  if (step % 2 === 1) playNoise(0.018, 0.02, musicGain, 6200, "highpass", { pan: 0.1 });
  if ([2, 6, 10, 14].includes(beat)) playMusicVoice(2200, 0.018, "square", 0.013, "spark", { mode: musicMode, pan: -0.1 });
}

function playVictoryDrums(step) {
  const beat = step % 16;
  if ([0, 8].includes(beat)) {
    playMusicVoice(65, 0.08, "triangle", 0.085, "bassPulse", { mode: musicMode });
    playMusicVoice(131, 0.04, "sine", 0.04, "accent", { mode: musicMode });
  }
  if ([4, 12].includes(beat)) playNoise(0.045, 0.025, musicGain, 4200, "highpass", { pan: 0.08 });
  if ([3, 7, 11, 15].includes(beat)) playMusicVoice(1976, 0.03, "sine", 0.018, "spark", { mode: musicMode, pan: -0.08 });
}

function currentMusicMode() {
  if (activeBattle) return currentBattleMusicMode();
  if (state.won) return "victory";
  const modalMode = currentModalMusicMode();
  if (modalMode) return modalMode;
  if (activeNight || state.nightReady) return "night";
  return `field:${currentRegionId()}`;
}

function currentModalMusicMode() {
  if (!modal?.open) return "";
  if (modal.classList.contains("caravan-modal")) {
    const faction = currentTownMusicFaction();
    return faction ? `modal:caravan:${faction}` : "modal:caravan";
  }
  if (modal.classList.contains("trade-modal")) return "modal:shop";
  if (modal.classList.contains("notice-modal")) return "modal:notice";
  if (modal.classList.contains("barracks-modal")) return "modal:barracks";
  if (modal.classList.contains("town-modal")) {
    const faction = currentTownMusicFaction();
    return faction ? `modal:town:${faction}` : "modal:town";
  }
  if (modal.classList.contains("night-modal")) return "modal:night";
  if (modal.classList.contains("level-up-modal")) return "modal:level";
  if (modal.classList.contains("name-modal") || modal.classList.contains("boss-preview-modal") || modal.classList.contains("boss-aftermath-modal")) return "modal:story";
  return modalOpen ? "modal:story" : "";
}

function refreshMusicMode() {
  if (!musicEnabled || !musicGain || !audioContext) return;
  const mode = currentMusicMode();
  if (mode === musicMode) return;
  primeMusicTransition(mode);
}

function currentBattleMusicMode() {
  const event = activeBattle?.event || {};
  const encounterId = event.encounter || activeBattle?.enemies?.[0]?.sourceEncounter || "";
  if (event.type === "night") return "battle:night";
  if (event.type === "final" || event.gate || encounterId === "rival" || encounterId === "gatekeeper") return "battle:boss";
  if (event.passName || event.type === "townClaim" || event.type === "chestGuard") return "battle:guardian";
  if (encounterId === "warlock") return "battle:arcane";
  if (encounterId === "basilisk" || encounterId === "wyvern") return "battle:beast";
  return "battle:skirmish";
}

function updateMusicButton() {
  if (!musicBtn) return;
  musicBtn.textContent = musicEnabled ? "Music On" : "Music";
  musicBtn.classList.toggle("active", musicEnabled);
  musicBtn.title = `Toggle music (${Math.round(musicVolume * 100)}%)`;
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

function blocksBiomePassageMove(ox, oy, nx, ny) {
  return biomePassages.some((passage) => {
    if (state.visited?.[passage.guard]) return false;
    const targetKey = `${nx},${ny}`;
    const fromKey = `${ox},${oy}`;
    if (targetKey === passage.guard) return false;
    if (fromKey === passage.guard) return true;
    if (passage.axis === "x") {
      if (ny < passage.min || ny > passage.max) return false;
      return (ox < passage.line && nx >= passage.line) || (ox > passage.line && nx <= passage.line);
    }
    if (nx < passage.min || nx > passage.max) return false;
    return (oy < passage.line && ny >= passage.line) || (oy > passage.line && ny <= passage.line);
  });
}

function blockingBiomePassageName(ox, oy, nx, ny) {
  const passage = biomePassages.find((entry) => {
    if (state.visited?.[entry.guard] || `${nx},${ny}` === entry.guard) return false;
    if (`${ox},${oy}` === entry.guard) return true;
    if (entry.axis === "x") {
      if (ny < entry.min || ny > entry.max) return false;
      return (ox < entry.line && nx >= entry.line) || (ox > entry.line && nx <= entry.line);
    }
    if (nx < entry.min || nx > entry.max) return false;
    return (oy < entry.line && ny >= entry.line) || (oy > entry.line && ny <= entry.line);
  });
  return passage?.name || "the guarded pass";
}

function finalGateCleared() {
  return Boolean(state.visited[`${finalFortressGateTile.x},${finalFortressGateTile.y}`]);
}

function fortressGateRequirements() {
  const relicCount = uniqueRelicCount();
  const outpostCount = countVisitedEvents("battle");
  return {
    relicCount,
    outpostCount,
    relicTarget: 4,
    outpostTarget: 8,
    ready: relicCount >= 4 && outpostCount >= 8,
  };
}

function gateIntelKnown() {
  return Boolean(state.storyFlags?.gateIntelKnown);
}

function gateRequirementsKnown() {
  return Boolean(state.storyFlags?.gateRequirementsKnown);
}

function revealGateIntel(source = "") {
  state.storyFlags ??= {};
  if (state.storyFlags.gateIntelKnown) return false;
  state.storyFlags.gateIntelKnown = true;
  if (source === "high_march") {
    setMessage("High March rumor: a Black Gate Warden bars the road to Orius.");
  }
  return true;
}

function revealGateRequirements() {
  state.storyFlags ??= {};
  state.storyFlags.gateIntelKnown = true;
  if (state.storyFlags.gateRequirementsKnown) return false;
  state.storyFlags.gateRequirementsKnown = true;
  return true;
}

function fortressGateRequirementText() {
  const gate = fortressGateRequirements();
  return `Recover 4 relics and clear 8 outposts before challenging the Black Gate Warden (${gate.relicCount}/${gate.relicTarget} relics, ${gate.outpostCount}/${gate.outpostTarget} outposts).`;
}

function move(dx, dy) {
  if (modalOpen || visual.moving) return;
  if (!state.won && (state.nightReady || activeNight)) return beginNight();
  const ox = state.x;
  const oy = state.y;
  const nx = state.x + dx;
  const ny = state.y + dy;
  facing = dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down";
  if (isBlocked(nx, ny)) {
    setMessage("Impassable terrain blocks the route.");
    renderMinimap();
    return;
  }
  if (blocksBiomePassageMove(ox, oy, nx, ny)) {
    setMessage(`${blockingBiomePassageName(ox, oy, nx, ny)} is guarded. Defeat the pass guardian before crossing this biome boundary.`);
    renderMinimap();
    return;
  }
  if (nx === finalFortressAnchor.x && ny === finalFortressAnchor.y && !finalGateCleared()) {
    setMessage("The mountain pass is still guarded. Defeat the warden in the gap before entering the fortress.");
    renderMinimap();
    return;
  }
  state.lastTravelPosition = { x: ox, y: oy };
  state.x = nx;
  state.y = ny;
  revealAroundPlayer();
  state.steps = (state.steps || 0) + 1;
  advanceDayProgress();
  recoverParty(1);
  playSfx("step");
  startMoveAnimation(ox, oy, nx, ny);
  renderAll();
}

function tileKey(x, y) {
  return `${x},${y}`;
}

function rememberRespawnPoint(key, event) {
  if (!event || event.type !== "town") return;
  const point = pointFromKeyString(key);
  if (!point) return;
  state.lastRespawn = { key, x: point.x, y: point.y, name: event.name || "Town" };
}

function currentRespawnPoint() {
  const saved = state.lastRespawn;
  if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) return saved;
  const owned = ownedTownEntries()
    .map(([key, town, event]) => ({ key, event, point: pointFromKeyString(key) }))
    .filter((item) => item.point)
    .sort((a, b) => Math.abs(a.point.x - state.x) + Math.abs(a.point.y - state.y) - (Math.abs(b.point.x - state.x) + Math.abs(b.point.y - state.y)))[0];
  if (owned) return { key: owned.key, x: owned.point.x, y: owned.point.y, name: owned.event?.name || "Town" };
  return { key: "3,2", x: 3, y: 2, name: "Dawnhaven" };
}

function revealAroundPlayer(radius = 4) {
  state.revealed ??= {};
  revealAround(state.x, state.y, radius);
  revealAround(state.x, state.y, radius + 2, { roadsOnly: true });
  state.revealed[tileKey(state.x, state.y)] = true;
}

function revealAround(cx, cy, radius, options = {}) {
  for (let y = cy - radius; y <= cy + radius; y += 1) {
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) continue;
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      if (Math.max(dx, dy) > radius) continue;
      if (dx + dy > radius + 2) continue;
      if (options.roadsOnly && map[y]?.[x] !== "R") continue;
      state.revealed[tileKey(x, y)] = true;
    }
  }
}

function isTileRevealed(x, y) {
  return Boolean(state.revealed?.[tileKey(x, y)]);
}

function isTileCurrentlyVisible(x, y, radius = 4) {
  const dx = Math.abs(x - state.x);
  const dy = Math.abs(y - state.y);
  return Math.max(dx, dy) <= radius && dx + dy <= radius + 2;
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
    const steppedOntoEvent = Boolean(events.get(`${toX},${toY}`));
    triggerEvent();
    checkRegionDiscovery();
    if (!modalOpen && !activeBattle && !activeNight) {
      if (!steppedOntoEvent) maybeSetAmbientTravelMessage();
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
  if (modalOpen || visual.moving) return;
  if (!state.won && (state.nightReady || activeNight)) return beginNight();
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
    if (!modalOpen && !visual.moving) {
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
  if (state.won && event.type === "final") {
    setMessage("Orius is already defeated. The fortress is yours to leave behind.");
    return;
  }
  if (event.type === "town") return townEvent(key, event);
  if (event.type === "npc") return npcEvent(key, event);
  if (event.type === "mine") return mineEvent(key, event);
  if (["chest", "cache", "artifact", "supply"].includes(event.type)) return chestEvent(key, event);
  if (event.type === "landmark") return landmarkEvent(key, event);
  if (event.type === "battle" || event.type === "final") return battleEvent(key, event);
}

function advanceRoamingHeroes() {
  state.enemyHeroes ??= createDefaultEnemyHeroes();
  state.enemyHeroes.forEach((hero) => {
    const definition = roamingHeroDefinitions[hero.id];
    if (!definition || hero.defeated) return;
    const chaseRadius = definition.chaseRadius || 5;
    const distance = Math.abs(hero.x - state.x) + Math.abs(hero.y - state.y);
    if (distance <= chaseRadius) {
      hero.mode = "hunt";
      hero.lastSeenX = state.x;
      hero.lastSeenY = state.y;
      stepRoamingHeroToward(hero, state.x, state.y);
      return;
    }
    if (hero.mode === "hunt") hero.mode = "search";
    if (hero.mode === "search") {
      if (hero.x === hero.lastSeenX && hero.y === hero.lastSeenY) {
        hero.mode = "patrol";
        hero.pauseLeft = Math.max(hero.pauseLeft || 0, definition.pauseTurns ?? 1);
      } else if (stepRoamingHeroToward(hero, hero.lastSeenX, hero.lastSeenY)) {
        return;
      } else {
        hero.mode = "patrol";
      }
    }
    if ((hero.pauseLeft || 0) > 0) {
      hero.pauseLeft -= 1;
      return;
    }
    const patrol = definition.patrol || [[definition.x, definition.y]];
    const target = patrol[hero.patrolIndex % patrol.length];
    if (hero.x === target[0] && hero.y === target[1]) {
      hero.patrolIndex = (hero.patrolIndex + 1) % patrol.length;
      hero.pauseLeft = definition.pauseTurns ?? 1;
      return;
    }
    const next = patrol[hero.patrolIndex % patrol.length];
    hero.mode = "patrol";
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
    const occupiedByRoamer = state.enemyHeroes?.some((other) => other !== hero && !other.defeated && other.x === nx && other.y === ny);
    if (!occupiedByRoamer && !isBlocked(nx, ny) && !events.has(`${nx},${ny}`)) {
      if (dx < 0) hero.facing = "left";
      if (dx > 0) hero.facing = "right";
      hero.x = nx;
      hero.y = ny;
      return true;
    }
  }
  return false;
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
  const regionalLines = {
    dawnhaven_march: [
      "Farm smoke curls over Dawnhaven March while your banner stirs beside the road.",
      "A friendly patrol taps spear-butts in greeting, then points you toward the next ridge.",
      "Leaf shadows move in the hedges. Your creatures seem calmer on these softer roads.",
    ],
    central_kingdom: [
      "Cart tracks split across the central road. One trail smells of coin, the other of trouble.",
      "Crows lift from an old battlefield as your warband passes the marker stones.",
      "A runner from a nearby town waves once, then vanishes back into the trade road dust.",
    ],
    high_march: [
      "Cold wind scrapes across High March. The fortress road feels closer with every step.",
      "Loose stones skitter down the slope. Something large moved above the pass recently.",
      "Your banner snaps hard in the thin air, loud enough to answer the distant war drums.",
    ],
    low_roads: [
      "The Low Roads smell of wet wood, mule sweat, and hidden toll knives.",
      "A merchant caravan has passed recently. Its wheel ruts are fresh and hurried.",
      "Lantern hooks hang from the roadside posts, but most of them are empty.",
    ],
    southern_wilds: [
      "Grass leans away from the southern wind. The frontier feels wider than the map admits.",
      "A broken campfire smokes under thorn scrub. Someone left in a hurry.",
      "The road thins into a hunter's path and every sound carries too far.",
    ],
    black_gate_approach: [
      "The Black Gate mountains swallow sound. Even your party lowers its voice here.",
      "Iron-black banners flicker ahead between the rocks.",
      "The road narrows into a place built for ambush, not travel.",
    ],
  };
  const lines = regionalLines[currentRegionId()] || ["The road changes underfoot."];
  return lines[(state.day + state.x + state.y) % lines.length];
}

function nearbyWorldHint() {
  const nearby = Array.from(events.entries())
    .map(([key, event]) => ({ key, event, point: pointFromKeyString(key) }))
    .filter(({ key, event, point }) => !state.visited[key] && Math.abs(point.x - state.x) + Math.abs(point.y - state.y) <= 4 && !["landmark", "final"].includes(event.type))
    .sort((a, b) => (Math.abs(a.point.x - state.x) + Math.abs(a.point.y - state.y)) - (Math.abs(b.point.x - state.x) + Math.abs(b.point.y - state.y)))[0];
  if (!nearby) return "";
  const label = scoutingTargetLabel(nearby);
  return ` Nearby: ${label} at ${nearby.point.x},${nearby.point.y}.`;
}

function maybeSetAmbientTravelMessage() {
  if (state.steps % 5 !== 0) return;
  setMessage(`${randomTravelLine()}${nearbyWorldHint()}`);
}

function npcEvent(key, event) {
  const quest = npcQuests[event.quest];
  if (!quest) return;
  state.quests ??= {};
  const status = state.quests[event.quest] || "new";
  if (status === "accepted" && !questStart(event.quest)) startQuestSnapshot(event.quest);
  if (status === "new" && !npcQuestAvailable(event.quest, quest)) {
    setMessage(`${quest.name} is still gathering a better lead for you.`);
    openModal(quest.name, npcQuestLockedText(event.quest, quest), [
      { label: "Continue", action: () => renderAll() },
    ]);
    return;
  }
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
        startQuestSnapshot(event.quest);
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
    { label: "Start Night Watch", action: () => startNextNightEncounter() },
  ], { html: true, className: "night-modal", onRender: bindNightfallModal });
}

function createNightState(plan = "holdfast") {
  const encounters = buildNightEncounters(plan);
  const report = createNightReport(plan, encounters);
  const campEvent = createNightCampEvent(report);
  return {
    day: state.day,
    plan,
    encounters,
    index: 0,
    awaitingResult: false,
    report,
    campEvent,
    campEventResolved: false,
    commandStep: campEvent ? "plan" : "plan",
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
    todayLead: "",
    eventTitle: "",
    eventChoiceLabel: "",
    eventOutcome: "",
    eventGoldDelta: 0,
    eventMoraleDelta: 0,
    eventHealingPenalty: 0,
    eventPreWaveRecovery: 0,
    eventDifficultyBias: 0,
    eventFirstWaveThreat: 0,
    streakBefore: state.nightStreak || 0,
    streakAfter: state.nightStreak || 0,
    moraleBefore: state.campMorale || 0,
    moraleAfter: state.campMorale || 0,
    itemDrop: "",
    nightRewardGold: 0,
    nightRewardXp: 0,
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
  const nextStep = activeNight?.campEvent ? "event" : "forecast";
  state.nightPlan = id;
  activeNight = createNightState(id);
  activeNight.commandStep = nextStep;
  setMessage(`Night plan set: ${nightPlanDefinitions[id].name}.`);
  beginNight();
}

function buildNightEncounters(planId = currentNightPlanId()) {
  const tier = campaignDifficultyTier();
  const watchtowerReduction = state.campUpgrades?.watchtower ? 1 : 0;
  const nightRaid = planId === "nightRaid" ? 1 : 0;
  const holdfastReduction = planId === "holdfast" ? 1 : 0;
  const waveCap = planId === "nightRaid" ? 3 : 2;
  const latePressure = tier.rank >= 2 && state.day >= 5 && planId !== "holdfast" ? 1 : 0;
  const count = Math.max(1, Math.min(waveCap, NIGHT_ENCOUNTER_MIN + Math.floor(Math.random() * (NIGHT_ENCOUNTER_MAX - NIGHT_ENCOUNTER_MIN + 1)) + latePressure + nightRaid - watchtowerReduction - holdfastReduction));
  const partyLevel = averagePartyLevel();
  return Array.from({ length: count }, (_, index) => {
    const eventBias = activeNight?.report?.eventDifficultyBias || 0;
    const firstWaveThreat = index === 0 ? activeNight?.report?.eventFirstWaveThreat || 0 : 0;
    const difficulty = partyLevel + Math.floor((state.day - 1) / 3) * 0.65 + tier.rank * 0.75 + index * 0.55 + (planId === "nightRaid" ? 0.75 : 0) - (planId === "holdfast" ? 0.75 : 0) + eventBias + firstWaveThreat;
    const level = Math.max(1, Math.round(difficulty));
    const maxPoolByTier = tier.rank <= 0 ? 1 : tier.rank === 1 ? 3 : nightEncounterPool.length - 1;
    const poolIndex = Math.min(maxPoolByTier, nightEncounterPool.length - 1, Math.max(0, Math.floor((level - 1) / 2.5) + (Math.random() < 0.3 ? 1 : 0)));
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
  const hp = base.hp + scale * 3 + index * 2;
  return {
    ...base,
    name: `${base.name} Night Raid`,
    hp,
    maxHp: hp,
    atk: base.atk + Math.floor(scale * 0.55),
    def: base.def + Math.floor(scale * 0.3),
    speed: base.speed + Math.floor(scale * 0.2),
    power: (base.power ?? 3) + Math.floor(scale * 0.3),
    morale: (base.morale ?? 4) + Math.floor(scale * 0.25),
    reward: Math.round(base.reward * 0.45 + level * 6),
    nightLevel: level,
    partySize: desiredEnemyPartySize(encounterId, { night: true, tier, nightPlan: currentNightPlanId() }),
    difficultyTier: tier,
    sourceEncounter: encounterId,
  };
}

function startNextNightEncounter() {
  if (!activeNight) return beginNight();
  if (!activeNight.campEventResolved) {
    setMessage("Resolve the camp event before starting the watch.");
    return beginNight();
  }
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
  if (activeNight?.report?.eventPreWaveRecovery) {
    const restored = recoverPartyDetailed(activeNight.report.eventPreWaveRecovery);
    activeNight.report.healerFireRecovery += restored;
    activeNight.report.eventPreWaveRecovery = 0;
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
  const effects = nightDefenseEffectPills();
  const event = activeNight?.campEvent;
  const report = activeNight?.report;
  const steps = nightCommandSteps();
  const currentStepId = currentNightCommandStep();
  const currentStep = steps.find((step) => step.id === currentStepId) || steps[0];
  const currentIndex = Math.max(0, steps.findIndex((step) => step.id === currentStep.id));
  return `
    <div class="night-wave">
      <div class="nightfall-head">
        <div class="night-watch-crest" aria-hidden="true"><i></i></div>
        <div>
          <strong>Camp Command</strong>
          <p>Pick, resolve, review, stand guard.</p>
        </div>
      </div>
      <div class="night-summary-bar">
        <span><small>Waves</small><strong>${activeNight.encounters.length}</strong></span>
        <span><small>Chosen</small><strong>${currentPlan.name}</strong></span>
        <span><small>Morale</small><strong>${campMoraleLabel()}</strong></span>
      </div>
      <div class="night-command-strip">
        <article><small>Risk</small><strong>${currentPlan.risk}</strong><p>${escapeHtml(nightPlanRiskShort(currentPlanId))}</p></article>
        <article><small>Reward</small><strong>${escapeHtml(nightRewardHeadline(currentPlanId))}</strong><p>${escapeHtml(nightPlanRewardShort(currentPlanId))}</p></article>
        <article><small>Streak</small><strong>${state.nightStreak || 0} nights</strong><p>${escapeHtml(nightStreakBonusText())}</p></article>
      </div>
      <div class="night-stepper" role="tablist" aria-label="Night watch steps">
        ${steps.map((step, index) => `
          <button
            type="button"
            class="night-stepper-tab ${step.id === currentStep.id ? "active" : ""} ${step.complete ? "complete" : ""}"
            data-night-step="${step.id}"
            ${index > currentIndex + 1 || !step.unlocked ? "disabled" : ""}
            aria-selected="${step.id === currentStep.id ? "true" : "false"}"
          >
            <span>${index + 1}</span>
            <strong>${escapeHtml(step.label)}</strong>
          </button>
        `).join("")}
      </div>
      <div class="night-step-callout ${currentStep.optional ? "optional" : ""}">
        <span>${currentIndex + 1}</span>
        <strong>${escapeHtml(currentStep.title)}</strong>
        <small>${escapeHtml(currentStep.note)}</small>
      </div>
      ${currentStep.id === "plan" ? `
        <div class="night-section">
          <div class="night-section-head">
            <h3>Tactics</h3>
            <p class="night-section-note">Pick one. We move on.</p>
          </div>
          ${nightRecommendationBanner()}
          <div class="camp-upgrade-list night-plan-list">${Object.entries(nightPlanDefinitions).map(([id, plan]) => nightPlanCard(id, plan, currentPlanId)).join("")}</div>
        </div>
      ` : ""}
      ${currentStep.id === "event" ? `
        <div class="night-section">
          <div class="night-section-head">
            <h3>Camp Event</h3>
            <p class="night-section-note">One choice. One tradeoff.</p>
          </div>
          ${campEventMarkup(event)}
        </div>
      ` : ""}
      ${currentStep.id === "forecast" ? `
        <div class="night-section">
          <div class="night-section-head">
            <h3>Tonight</h3>
            <p class="night-section-note">${state.campUpgrades?.watchtower ? "Full read ready." : "Threat read only."}</p>
          </div>
          ${nightForecastSummaryMarkup()}
          ${nightCampLineMarkup()}
          <details class="night-forecast-details">
            <summary>${state.campUpgrades?.watchtower ? "View wave details" : "View threat details"}</summary>
            <div class="night-preview-grid">${nightWavePreviewCards(activeNight.encounters).join("")}</div>
          </details>
          <div class="night-defense-strip night-active-effects">
            ${effects.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
          </div>
        </div>
      ` : ""}
      ${currentStep.id === "prep" ? `
        <div class="night-section">
          <div class="night-section-head">
            <h3>Camp Prep</h3>
            <p class="night-section-note">Optional builds.</p>
          </div>
          ${nightCampLineMarkup(true)}
          <div class="camp-upgrade-list">${Object.entries(campUpgradeDefinitions).map(([id, upgrade]) => campUpgradeCard(id, upgrade)).join("")}</div>
        </div>
      ` : ""}
      <div class="night-step-footer">
        <button type="button" class="secondary" data-night-nav="prev"${currentIndex <= 0 ? " disabled" : ""}>Previous</button>
        <div class="night-step-progress">
          <strong>Step ${currentIndex + 1} of ${steps.length}</strong>
          <span>${currentStep.id === "prep"
            ? escapeHtml(campBuilt.length ? `${campBuilt.join(", ")} ready.` : "No optional camp builds yet.")
            : currentStep.id === "forecast"
              ? "Start here if you're ready. Prep is optional."
              : currentStep.id === "event"
                ? escapeHtml(activeNight?.campEventResolved ? (report?.eventChoiceLabel ? `${report.eventChoiceLabel}: ${nightEventOutcomeShort(report)}` : "Event resolved.") : "Resolve this choice to continue.")
                : escapeHtml(nightTacticShortText(currentPlanId))
          }</span>
        </div>
        <button type="button" data-night-nav="next"${currentIndex >= steps.length - 1 || !currentStep.canAdvance ? " disabled" : ""}>${currentStep.id === "forecast" ? "Prep Camp" : "Next Step"}</button>
      </div>
    </div>
  `;
}

function nightCommandSteps() {
  const steps = [
    {
      id: "plan",
      label: "Tactic",
      title: "Choose tactic",
      note: nightTacticShortText(currentNightPlanId()),
      complete: true,
      unlocked: true,
      canAdvance: true,
    },
  ];
  if (activeNight?.campEvent) {
    steps.push({
      id: "event",
      label: "Event",
      title: "Resolve event",
      note: activeNight?.campEventResolved
        ? (activeNight?.report?.eventChoiceLabel ? `${activeNight.report.eventChoiceLabel}: ${nightEventOutcomeShort(activeNight.report)}` : "Event resolved.")
        : "Pick the tradeoff.",
      complete: Boolean(activeNight?.campEventResolved),
      unlocked: true,
      canAdvance: Boolean(activeNight?.campEventResolved),
    });
  }
  steps.push({
    id: "forecast",
    label: "Forecast",
    title: "Review tonight",
    note: state.campUpgrades?.watchtower
      ? "Waves, event impact, and threat."
      : "Waves, event impact, and rough threat.",
    complete: false,
    unlocked: !activeNight?.campEvent || Boolean(activeNight?.campEventResolved),
    canAdvance: !activeNight?.campEvent || Boolean(activeNight?.campEventResolved),
  });
  steps.push({
    id: "prep",
    label: "Prep",
    title: "Optional prep",
    note: Object.keys(state.campUpgrades || {}).length
      ? "Build more if you want."
      : "Skip if ready.",
    complete: false,
    unlocked: !activeNight?.campEvent || Boolean(activeNight?.campEventResolved),
    canAdvance: true,
    optional: true,
  });
  return steps;
}

function currentNightCommandStep() {
  const steps = nightCommandSteps();
  const ids = steps.map((step) => step.id);
  if (ids.includes(activeNight?.commandStep)) return activeNight.commandStep;
  return steps[0]?.id || "plan";
}

function setNightCommandStep(stepId) {
  if (!activeNight) return;
  const steps = nightCommandSteps();
  const targetIndex = steps.findIndex((step) => step.id === stepId);
  if (targetIndex === -1) return;
  const currentIndex = steps.findIndex((step) => step.id === currentNightCommandStep());
  const target = steps[targetIndex];
  if (!target.unlocked) return;
  if (targetIndex > currentIndex + 1) return;
  activeNight.commandStep = target.id;
  beginNight();
}

function nightPlanCard(id, plan, currentPlanId = currentNightPlanId()) {
  const selected = currentPlanId === id;
  return `<article class="camp-upgrade night-plan-card ${selected ? "owned selected" : ""}" data-night-plan-card="${id}" tabindex="${selected ? "-1" : "0"}" aria-label="${selected ? `${plan.name} selected` : `Select ${plan.name}`}">
    <div class="night-card-main">
      <div class="night-card-icon plan-${id}" aria-hidden="true"><i></i></div>
      <div class="camp-upgrade-topline">
        <strong>${plan.name}</strong>
        <span>${selected ? "Current tactic" : `${plan.risk} risk`}</span>
      </div>
    </div>
    <p>${nightTacticShortText(id)}</p>
    <div class="night-card-tags">${nightPlanEffectTags(id).map((tag) => `<em>${escapeHtml(tag)}</em>`).join("")}</div>
    <button type="button" class="night-card-button ${selected ? "selected" : ""}" data-night-plan="${id}"${selected ? " disabled" : ""}>${selected ? "Selected" : "Select"}</button>
  </article>`;
}

function nightTacticShortText(id) {
  return {
    holdfast: "Safer. Fewer waves. Lower payout.",
    nightRaid: "Riskier. Bigger payout. Item chance.",
    scoutLines: "Balanced. Normal waves. Scout lead.",
  }[id] || nightPlanDefinitions[id]?.text || "";
}

function nightPlanRiskShort(id) {
  return {
    holdfast: "Fewer waves",
    nightRaid: "Harder waves",
    scoutLines: "Even pressure",
  }[id] || "";
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

function createNightCampEvent(report) {
  const seed = (state.day + (state.nightStreak || 0) + Math.max(0, state.gold % 3)) % nightCampEvents.length;
  const template = nightCampEvents[seed];
  if (!template) return null;
  report.eventTitle = template.title;
  return template;
}

function campEventMarkup(event) {
  if (!event) return "";
  if (activeNight?.campEventResolved) {
    return `
      <article class="camp-event-card resolved">
        <strong>${escapeHtml(event.title)}</strong>
        <p>${escapeHtml(nightEventOutcomeShort(activeNight?.report) || activeNight?.report?.eventOutcome || event.text)}</p>
        <div class="night-defense-strip">
          <span>${escapeHtml(activeNight?.report?.eventChoiceLabel || "Resolved")}</span>
          ${nightEventImpactPills(activeNight?.report).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
        </div>
      </article>
    `;
  }
  return `
    <article class="camp-event-card">
      <strong>${escapeHtml(event.title)}</strong>
      <p>${escapeHtml(event.text)}</p>
      <div class="camp-event-options">
        ${event.options.map((option) => `<button type="button" class="camp-event-button" data-camp-event-choice="${option.id}"><strong>${escapeHtml(option.label)}</strong><span>${escapeHtml(option.summary)}</span></button>`).join("")}
      </div>
    </article>
  `;
}

function resolveNightCampEvent(choiceId) {
  const event = activeNight?.campEvent;
  const report = activeNight?.report;
  if (!event || !report || activeNight?.campEventResolved) return;
  const choice = event.options.find((option) => option.id === choiceId);
  if (!choice) return;
  report.eventChoiceLabel = choice.label;
  choice.apply(report);
  activeNight.campEventResolved = true;
  activeNight.encounters = buildNightEncounters(activeNight.plan);
  report.wavesPlanned = activeNight.encounters.length;
  activeNight.commandStep = "forecast";
  setMessage(`Camp event resolved: ${choice.label}.`);
  beginNight();
}

function campMoraleLabel() {
  const morale = state.campMorale || 0;
  if (morale >= 4) return `High ${morale}`;
  if (morale >= 2) return `Steady ${morale}`;
  return `Low ${morale}`;
}

function nightStreakBonusText() {
  const streak = state.nightStreak || 0;
  if (!streak) return "No bonus yet.";
  return `+${streak * 4} gold, +${streak * 2} XP per wave.`;
}

function nightRewardHeadline(planId) {
  if (planId === "nightRaid") return "High gold and XP";
  if (planId === "scoutLines") return "Balanced payout";
  return "Safer recovery";
}

function nightPlanRewardShort(planId) {
  if (planId === "nightRaid") return "Gold, XP, item chance";
  if (planId === "scoutLines") return "Gold, XP, scout lead";
  return "Recovery and safety";
}

function recommendedNightPlan() {
  const morale = state.campMorale || 0;
  if (morale <= 1 || state.hero.hp < Math.round(state.hero.maxHp * 0.6)) {
    return { id: "holdfast", reason: "Low morale or a hurt party favors safer sustain." };
  }
  if (state.campUpgrades?.watchtower && state.campUpgrades?.traps) {
    return { id: "nightRaid", reason: "Your camp can handle pressure and cash in on a harder night." };
  }
  return { id: "scoutLines", reason: "Balanced watch is the default when no crisis is pushing you." };
}

function nightRecommendationBanner() {
  const recommended = recommendedNightPlan();
  const plan = nightPlanDefinitions[recommended.id];
  if (!plan) return "";
  return `
    <div class="night-plan-banner">
      <strong>Suggested: ${escapeHtml(plan.name)}</strong>
      <span>${escapeHtml(recommended.reason)}</span>
    </div>
  `;
}

function nightWaveThreatLabel(enemy) {
  const level = enemy?.nightLevel || 1;
  if (level >= 7) return "Severe";
  if (level >= 5) return "High";
  if (level >= 3) return "Medium";
  return "Low";
}

function nightWavePreviewCards(encounters) {
  return encounters.map((enemy, index) => {
    const known = Boolean(state.campUpgrades?.watchtower);
    const title = known ? enemy.name.replace(/ Night Raid$/, "") : `Unknown raiders ${index + 1}`;
    const trait = known ? enemyTraitText(enemy.sourceEncounter) : "Build a watchtower to identify exact wave types before the fight starts.";
    const icons = Array.from({ length: Math.min(3, enemy.partySize || 1) }, () => known
      ? enemyPreviewIconMarkup(enemy)
      : `<span class="enemy-icon melee" title="Unknown threat">?</span>`).join("");
    return `
      <article class="night-preview-card ${known ? "known" : "fogged"}">
        <div class="night-preview-topline">
          <strong>Wave ${index + 1}</strong>
          <span>${nightWaveThreatLabel(enemy)} threat</span>
        </div>
        <b>${escapeHtml(title)}</b>
        <div class="enemy-icon-row night-preview-icons">${icons}</div>
        <p><strong>Tactic</strong>: ${escapeHtml(trait)}</p>
      </article>
    `;
  });
}

function nightEventImpactPills(report) {
  if (!report) return [];
  const pills = [];
  if (report.eventMoraleDelta > 0) pills.push(`+${report.eventMoraleDelta} morale`);
  if (report.eventGoldDelta > 0) pills.push(`+${report.eventGoldDelta} gold`);
  if (report.eventGoldDelta < 0) pills.push(`${report.eventGoldDelta} gold`);
  if (report.eventHealingPenalty > 0) pills.push(`-${report.eventHealingPenalty} dawn heal`);
  if (report.eventPreWaveRecovery > 0) pills.push(`+${report.eventPreWaveRecovery} pre-wave heal`);
  if (report.eventDifficultyBias > 0) pills.push("Harder waves");
  if (report.eventFirstWaveThreat > 0) pills.push("Rough first wave");
  if (report.scoutingTarget?.label) pills.push(`Lead: ${report.scoutingTarget.label}`);
  return pills;
}

function nightEventOutcomeShort(report) {
  const pills = nightEventImpactPills(report);
  if (pills.length) return pills.join(", ");
  return report?.eventOutcome || "Event resolved.";
}

function nightForecastSummaryMarkup() {
  const encounters = activeNight?.encounters || [];
  const first = encounters[0];
  const report = activeNight?.report;
  const known = Boolean(state.campUpgrades?.watchtower);
  const eventPills = nightEventImpactPills(report);
  const recommended = recommendedNightPlan();
  return `
    <div class="night-command-strip night-forecast-strip">
      <article><small>Waves</small><strong>${encounters.length}</strong><p>${encounters.length === 1 ? "Short watch." : `${encounters.length} checks before dawn.`}</p></article>
      <article><small>First Threat</small><strong>${first ? nightWaveThreatLabel(first) : "Unknown"}</strong><p>${known && first ? escapeHtml(first.name.replace(/ Night Raid$/, "")) : "Exact enemy hidden."}</p></article>
      <article><small>Event Impact</small><strong>${eventPills.length ? escapeHtml(eventPills[0]) : "None"}</strong><p>${escapeHtml(eventPills.slice(1, 3).join(" • ") || "No extra shift to tonight's watch.")}</p></article>
      <article><small>Suggested</small><strong>${escapeHtml(nightPlanDefinitions[recommended.id]?.name || currentNightPlan().name)}</strong><p>${escapeHtml(recommended.id === currentNightPlanId() ? "Matches your current tactic." : "Quick fallback if you want the safer call.")}</p></article>
    </div>
  `;
}

function nightCampLineMarkup(prep = false) {
  const pieces = [
    { id: "watchtower", label: "Tower", built: Boolean(state.campUpgrades?.watchtower) },
    { id: "traps", label: "Traps", built: Boolean(state.campUpgrades?.traps) },
    { id: "healerFire", label: "Fire", built: Boolean(state.campUpgrades?.healerFire) },
    { id: "betterTent", label: "Tent", built: Boolean(state.campUpgrades?.betterTent) },
  ];
  return `
    <div class="night-camp-line ${prep ? "prep" : ""}">
      <strong>${prep ? "Camp Line" : "Defenses Ready"}</strong>
      <div class="night-camp-line-scene">
        ${pieces.map((piece) => `
          <span class="night-camp-piece ${piece.id} ${piece.built ? "built" : "missing"}" title="${escapeHtml(piece.label)}">
            <i aria-hidden="true"></i>
            <b>${escapeHtml(piece.label)}</b>
          </span>
        `).join("")}
      </div>
    </div>
  `;
}

function nightDefenseEffectPills() {
  const pills = [];
  if (currentNightPlanId() === "holdfast") pills.push("Hold Fast: extra recovery before battle");
  if (currentNightPlanId() === "nightRaid") pills.push("Night Raid: extra gold, XP, and item chance");
  if (currentNightPlanId() === "scoutLines") pills.push("Scout Lines: dawn reveals the next target");
  if (state.campUpgrades?.watchtower) pills.push("Watchtower: identifies wave threats and may cut one wave");
  if (state.campUpgrades?.traps) pills.push("Stake Traps: first raider starts damaged");
  if (state.campUpgrades?.healerFire) pills.push("Healer Fire: party restored before each wave");
  if (state.campUpgrades?.betterTent) pills.push("Better Tent: stronger dawn recovery");
  if (state.nightStreak) pills.push(`Night Streak: +${state.nightStreak * 4} gold on night wins`);
  if (!pills.length) pills.push("Basic camp: no extra defenses");
  return pills.slice(0, 5);
}

function campUpgradeCard(id, upgrade) {
  const owned = Boolean(state.campUpgrades?.[id]);
  const affordable = state.gold >= upgrade.cost;
  return `<div class="camp-upgrade ${owned ? "owned" : affordable ? "ready" : ""}">
    <div class="night-card-main">
      <div class="night-card-icon upgrade-${id}" aria-hidden="true"><i></i></div>
      <div class="camp-upgrade-topline">
        <strong>${upgrade.name}</strong>
        <span>${owned ? "Built" : `${upgrade.cost} gold`}</span>
      </div>
    </div>
    <small class="night-upgrade-effect">${campUpgradeShortText(id)}</small>
    <div class="night-card-tags">${campUpgradeEffectTags(id).map((tag) => `<em>${escapeHtml(tag)}</em>`).join("")}</div>
    <button type="button" class="night-card-button" data-camp-upgrade="${id}"${owned || !affordable ? " disabled" : ""}>${owned ? "Built" : affordable ? "Build" : `Need ${upgrade.cost}`}</button>
  </div>`;
}

function campUpgradeShortText(id) {
  return {
    betterTent: "More dawn recovery.",
    watchtower: "Shows threats early.",
    traps: "First raider starts hurt.",
    healerFire: "Heal before each wave.",
  }[id] || "";
}

function nightPlanEffectTags(id) {
  return {
    holdfast: ["Low risk", "Safer sustain", "Fewer waves"],
    nightRaid: ["High risk", "Extra gold and XP", "Item chance"],
    scoutLines: ["Medium risk", "Balanced payout", "Scout marker"],
  }[id] || [];
}

function campUpgradeEffectTags(id) {
  return {
    betterTent: ["More dawn healing", "Recovery spike"],
    watchtower: ["Wave forecast", "Possible wave cut"],
    traps: ["Damaged opener", "Every wave"],
    healerFire: ["Pre-wave healing", "Party sustain"],
  }[id] || [];
}

function bindNightfallModal() {
  const startButton = modalActions.querySelector("button");
  const steps = nightCommandSteps();
  const finalStepId = steps[steps.length - 1]?.id || "prep";
  if (startButton) {
    const readyStep = ["forecast", finalStepId].includes(currentNightCommandStep());
    const ready = readyStep && (!activeNight?.campEvent || activeNight?.campEventResolved);
    startButton.disabled = !ready;
    startButton.textContent = ready ? "Start Night Watch" : "Finish Steps First";
  }
  modalText.querySelectorAll("[data-night-step]").forEach((button) => {
    button.addEventListener("click", () => setNightCommandStep(button.dataset.nightStep));
  });
  modalText.querySelectorAll("[data-night-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const stepList = nightCommandSteps();
      const currentIndex = Math.max(0, stepList.findIndex((step) => step.id === currentNightCommandStep()));
      const nextIndex = button.dataset.nightNav === "prev" ? currentIndex - 1 : currentIndex + 1;
      if (nextIndex < 0 || nextIndex >= stepList.length) return;
      setNightCommandStep(stepList[nextIndex].id);
    });
  });
  modalText.querySelectorAll("[data-night-plan-card]").forEach((card) => {
    const choose = () => {
      const { nightPlanCard } = card.dataset;
      if (!nightPlanCard || card.classList.contains("selected")) return;
      setNightPlan(nightPlanCard);
    };
    card.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      choose();
    });
    card.addEventListener("keydown", (event) => {
      if (!["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      choose();
    });
  });
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
  modalText.querySelectorAll("[data-camp-event-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const { campEventChoice } = button.dataset;
      if (!campEventChoice || button.disabled) return;
      resolveNightCampEvent(campEventChoice);
    });
  });
}

function buildCampUpgrade(id) {
  const upgrade = campUpgradeDefinitions[id];
  if (!upgrade) return beginNight();
  if (state.gold < upgrade.cost) {
    setMessage(`${upgrade.name} costs ${upgrade.cost} gold.`);
    return beginNight();
  }
  state.gold -= upgrade.cost;
  state.campUpgrades ??= {};
  state.campUpgrades[id] = true;
  if (activeNight) {
    activeNight.encounters = buildNightEncounters(activeNight.plan);
    if (activeNight.report) activeNight.report.wavesPlanned = activeNight.encounters.length;
    activeNight.commandStep = "prep";
  }
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
  state.nightStreak = (state.nightStreak || 0) + 1;
  state.campMorale = Math.min(5, (state.campMorale || 0) + 1);
  report.streakAfter = state.nightStreak;
  report.moraleAfter = state.campMorale;
  const dawnRecovery = Math.max(4, Math.max(8, Math.round(state.hero.maxHp * (planId === "holdfast" ? 0.47 : 0.35))) + (state.campUpgrades?.betterTent ? 4 : 0) - (report.eventHealingPenalty || 0));
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
      const label = scoutingTargetLabel(target);
      report.scoutingTarget = { key: target.key, label, x: target.x, y: target.y };
      report.scoutingText = `Scouts marked ${label} at ${target.x},${target.y}.`;
    } else {
      report.scoutingText = "Scouts reported no urgent targets beyond your current map.";
    }
  }
  report.todayLead = dawnLeadObjectiveText(report);
  report.postDawnGold = state.gold;
  report.postDawnMissingHp = totalPartyMissingHp();
  setMessage(`Dawn breaks on day ${state.day}. Camp survived night ${completedDay} under the ${nightPlanDefinitions[planId].name} plan.`);
  openModal("Dawn", dawnMarkup(report), [
    { label: `Enter Day ${state.day}`, action: () => renderAll() },
  ], { html: true, className: "night-modal dawn-modal" });
}

function dawnMarkup(report) {
  const campNames = report.campBuilt.map((item) => item.name);
  const campStatus = campNames.length ? `${campNames.length} structures held through the night.` : "The basic camp held until sunrise.";
  const planPayoff = dawnPlanPayoffMarkup(report);
  const totalRecovery = report.healerFireRecovery + report.holdfastRecovery + report.dawnHealing;
  const outcomeRows = dawnOutcomeRows(report, totalRecovery, campNames);
  const economyCards = [
    { label: "Raid Spoils", value: `${report.raidBonus} gold`, note: report.raidBonus ? "Night riders returned with extra coin." : "No raid income this dawn." },
    { label: "Town Income", value: `${report.income.total} gold`, note: report.income.total ? `${report.income.mines} mines, ${report.income.towns} towns, ${report.income.routes} trade.` : "No realm income collected this dawn." },
    { label: "Recovery", value: `${totalRecovery} HP`, note: `${report.healerFireRecovery} pre-wave, ${report.holdfastRecovery} holdfast, ${report.dawnHealing} dawn rest.` },
    { label: "Camp Damage", value: `${report.trapDamageTotal} HP`, note: report.trapDamageTotal ? "Stake Traps bloodied the first raider in each wave." : "No trap damage contributed overnight." },
  ];
  return `
    <div class="night-wave dawn-report">
      <div class="dawn-hero">
        <div class="dawn-sunburst" aria-hidden="true"><i></i></div>
        <div>
          <strong>Dawn on Day ${state.day}</strong>
          <p>${escapeHtml(dawnLeadLine(report))}</p>
        </div>
      </div>
      <div class="night-summary-bar dawn-summary-bar">
        <span><small>Waves Held</small><strong>${report.wavesCleared}/${report.wavesPlanned}</strong></span>
        <span><small>Plan</small><strong>${escapeHtml(report.planName)}</strong></span>
        <span><small>Streak</small><strong>${report.streakAfter}</strong></span>
      </div>
      <div class="dawn-outcome-panel">
        <strong>What changed overnight</strong>
        <div class="dawn-outcome-list">
          ${outcomeRows.map((item) => `<article class="${item.kind}"><span aria-hidden="true"></span><div><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.text)}</small></div></article>`).join("")}
        </div>
      </div>
      <div class="dawn-payoff-panel">
        <strong>Plan Payoff</strong>
        <span>${planPayoff}</span>
      </div>
      <details class="dawn-detail-drawer">
        <summary>Detailed breakdown</summary>
        <div class="dawn-reward-grid">
          ${economyCards.map((item) => `<article><small>${item.label}</small><strong>${item.value}</strong><p>${item.note}</p></article>`).join("")}
        </div>
      </details>
      <div class="dawn-camp-state">
        <strong>Camp State</strong>
        <p>${campStatus}</p>
        <div class="night-defense-strip">
          ${(campNames.length ? campNames : ["Basic Tent"]).map((name) => `<span>${escapeHtml(name)}</span>`).join("")}
        </div>
      </div>
      ${report.eventTitle ? `<div class="dawn-scouting"><strong>Camp Event</strong><p>${escapeHtml(`${report.eventTitle}: ${report.eventChoiceLabel}. ${report.eventOutcome}`)}</p></div>` : ""}
      ${report.scoutingText ? `<div class="dawn-scouting"><strong>Scouting</strong><p>${escapeHtml(report.scoutingText)}</p></div>` : ""}
      <div class="dawn-scouting dawn-today-lead"><strong>Today's Lead</strong><p>${escapeHtml(report.todayLead)}</p></div>
      <p class="dawn-footer-state"><strong>Sunrise state</strong>: ${report.postDawnGold} gold, ${report.postDawnMissingHp} missing party HP.</p>
    </div>
  `;
}

function dawnOutcomeRows(report, totalRecovery, campNames) {
  const rows = [
    {
      kind: "dawn-outcome-waves",
      title: `${report.wavesCleared}/${report.wavesPlanned} waves held`,
      text: "The camp survived until sunrise.",
    },
  ];
  const goldDelta = Math.max(0, report.postDawnGold - report.preDawnGold);
  if (goldDelta) {
    rows.push({
      kind: "dawn-outcome-gold",
      title: `+${goldDelta} gold`,
      text: `${report.raidBonus} raid spoils, ${report.income.total} realm income.`,
    });
  }
  if (totalRecovery) {
    rows.push({
      kind: "dawn-outcome-heal",
      title: `${totalRecovery} HP restored`,
      text: `${report.healerFireRecovery} healer fire, ${report.holdfastRecovery} hold fast, ${report.dawnHealing} dawn rest.`,
    });
  }
  if (report.trapDamageTotal) {
    rows.push({
      kind: "dawn-outcome-traps",
      title: `${report.trapDamageTotal} trap damage`,
      text: "Stake Traps softened raiders before battle.",
    });
  }
  if (report.scoutingText) {
    rows.push({
      kind: "dawn-outcome-scout",
      title: "Scout lead marked",
      text: report.scoutingTarget ? `${report.scoutingTarget.label} is now marked on the map.` : report.scoutingText,
    });
  }
  if (campNames.length) {
    rows.push({
      kind: "dawn-outcome-camp",
      title: `${campNames.length} camp prep active`,
      text: campNames.join(", "),
    });
  }
  return rows.slice(0, 5);
}

function scoutingTargetLabel(target) {
  if (!target?.event) return "a road target";
  if (target.event.type === "town") return target.event.name;
  if (["chest", "cache", "artifact", "supply"].includes(target.event.type)) return target.event.item ? `${target.event.item}` : "a guarded cache";
  if (target.event.type === "mine") return "an unclaimed mine";
  if (target.event.type === "battle") return target.event.guardName || "a hostile outpost";
  return eventLabel(target.event).toLowerCase();
}

function dawnLeadObjectiveText(report) {
  if (report.scoutingTarget) return `Follow the scout marker toward ${report.scoutingTarget.label} at ${report.scoutingTarget.x},${report.scoutingTarget.y}.`;
  const target = nearestScoutingTarget();
  if (target) {
    const point = pointFromKeyString(target.key);
    return `Road gossip points toward ${scoutingTargetLabel(target)} near ${point.x},${point.y}.`;
  }
  return campaignMainObjective();
}

function dawnLeadLine(report) {
  if (report.planId === "nightRaid" && report.raidBonus) return `The warband broke the dark line and came home richer. ${report.raidBonus} gold arrived with the sunrise.`;
  if (report.planId === "scoutLines") return report.scoutingText || "Outriders kept the roads watched until first light.";
  if (report.planId === "holdfast") return `The camp held fast. ${report.holdfastRecovery + report.dawnHealing} HP came back through discipline and dawn rest.`;
  return "The camp held through the night and the army greets a steadier dawn.";
}

function dawnPlanPayoffMarkup(report) {
  if (report.planId === "nightRaid") return report.raidBonus ? `Night Raid paid off with <strong>${report.raidBonus} bonus gold</strong>${report.itemDrop ? ` and <strong>${escapeHtml(report.itemDrop)}</strong>` : ""} after the camp held.` : "Night Raid drew pressure, but no extra spoils arrived.";
  if (report.planId === "scoutLines") return escapeHtml(report.scoutingText || "Scout Lines kept the roads watched, but no clear target stood out.");
  if (report.planId === "holdfast") return `Hold Fast restored <strong>${report.holdfastRecovery}</strong> HP before the waves and <strong>${report.dawnHealing}</strong> more at dawn.`;
  return "The camp plan carried the warband safely into the next day.";
}

function abandonNightAfterDefeat() {
  state.nightStreak = 0;
  state.campMorale = Math.max(0, (state.campMorale || 0) - 1);
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
  if (event.type === "cache") return event.name || "This cache";
  if (event.type === "artifact") return event.item || "This artifact";
  if (event.type === "supply") return event.item || "These supplies";
  if (event.type === "battle") return "This outpost";
  if (event.type === "landmark") return event.title || "This landmark";
  return "This place";
}

function landmarkFlavor(event) {
  if (event.title === "High March Road") {
    return "The road marker warns that the Black Gate Warden holds the pass ahead and Orius waits beyond the fortress road. The seal is still a rumor, but the boss is not.";
  }
  if (event.landmark === "signpost") return `${event.title || "The signpost"} points the way ahead. Fresh paint marks the safer road and warns that the darker trail leads toward trouble.`;
  if (event.landmark === "ruins") return `${event.title || "The ruins"} still watch the road. Broken stone and old ash suggest this route has been contested for years.`;
  if (event.landmark === "camp") return `${event.title || "The camp"} is warm but abandoned. The embers are recent enough to suggest travelers or raiders passed through not long ago.`;
  if (event.landmark === "statue") return `${event.title || "The monument"} rises over the road, reminding every army marching past that someone else once tried to rule this ground.`;
  if (event.landmark === "shrine") return `${event.title || "The shrine"} glows with clean daylight. ${event.hint || "Old stones hum with a small blessing for the road ahead."}`;
  return `${event.title || "The landmark"} breaks the road's monotony.`;
}

function landmarkEvent(key, event) {
  const firstVisit = !state.visited[key];
  state.visited[key] = true;
  if (key === "57,12") revealGateIntel("high_march");
  const rewardText = firstVisit ? applyLandmarkReward(event) : "";
  setMessage(firstVisit ? `Discovered ${event.title || "a landmark"}.` : `${event.title || "This landmark"} is familiar now.`);
  openModal(event.title || "Landmark", landmarkMarkup(event, rewardText, firstVisit), [
    { label: firstVisit ? "Mark Route" : "Continue", action: () => renderAll() },
  ], { html: true, className: "landmark-modal" });
}

function applyLandmarkReward(event) {
  const reward = event.reward || defaultLandmarkReward(event);
  if (!reward) return "";
  const parts = [];
  if (reward.gold) {
    state.gold += reward.gold;
    parts.push(`${reward.gold} gold`);
  }
  if (reward.xp) {
    gainXp(reward.xp);
    parts.push(`${reward.xp} XP`);
  }
  if (reward.heal) {
    recoverParty(reward.heal);
    parts.push(`${reward.heal} HP restored`);
  }
  if (reward.morale) {
    state.hero.morale += reward.morale;
    parts.push(`+${reward.morale} morale`);
  }
  if (reward.item) {
    addInventoryItem(reward.item, reward.qty || 1);
    parts.push(`${reward.qty && reward.qty > 1 ? `${reward.qty}x ` : ""}${itemDefinitions[reward.item]?.name || reward.item}`);
  }
  if (reward.scout) {
    const target = nearestScoutingTarget();
    if (target) {
      const point = pointFromKeyString(target.key);
      state.scoutMarker = target.key;
      parts.push(`scouted ${scoutingTargetLabel(target)} at ${point.x},${point.y}`);
    } else {
      parts.push("roads confirmed clear nearby");
    }
  }
  if (!parts.length) return "";
  playSfx("coin");
  return `First visit reward: ${parts.join(", ")}.`;
}

function defaultLandmarkReward(event) {
  if (event.landmark === "signpost") return { scout: true };
  if (event.landmark === "camp") return { heal: 10 };
  if (event.landmark === "ruins") return { gold: 18 };
  if (event.landmark === "statue") return { morale: 1 };
  return null;
}

function landmarkMarkup(event, rewardText, firstVisit) {
  const typeLabel = {
    signpost: "Route Intel",
    ruins: "Old Stores",
    camp: "Warm Embers",
    statue: "Banner Memory",
    shrine: "Daylight Blessing",
  }[event.landmark] || "Road Moment";
  const effect = rewardText || (firstVisit ? "No supplies here, but the place is now marked on your route." : "Already marked and searched.");
  const lead = landmarkLeadText(event, firstVisit);
  return `
    <div class="landmark-card">
      <div class="landmark-hero ${event.landmark || "road"}">
        <span aria-hidden="true"></span>
        <div>
          <strong>${escapeHtml(event.title || "Landmark")}</strong>
          <p>${escapeHtml(landmarkFlavor(event))}</p>
        </div>
      </div>
      <div class="landmark-payoff-grid">
        <div class="landmark-payoff">
          <small>${escapeHtml(typeLabel)}</small>
          <span>${escapeHtml(effect)}</span>
        </div>
        <div class="landmark-payoff lead">
          <small>Route Lead</small>
          <span>${escapeHtml(lead)}</span>
        </div>
      </div>
    </div>
  `;
}

function landmarkLeadText(event, firstVisit) {
  if (event.landmark === "shrine" && event.hint) return event.hint;
  if (event.landmark === "signpost") return scoutingHintText();
  if (event.landmark === "camp") return firstVisit ? "The recovered warmth makes the next nearby fight safer." : "The camp is mapped; nearby travel stays familiar.";
  if (event.landmark === "ruins") return "Old stores usually sit near contested roads. Check nearby guarded caches.";
  if (event.landmark === "statue") return "The monument marks a route worth holding for the final fortress march.";
  return campaignMainObjective();
}

function townClaimCost(event) {
  const baseCost = 68 + (townFaction(event).units.length - 1) * 16 + state.hero.level * 8;
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
  if (town.owner === "player") rememberRespawnPoint(key, event);
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
        rememberRespawnPoint(key, event);
        setMessage(`${event.name} accepts your charter for ${claimCost} gold.`);
        renderAll();
        reopenTownModal(key, event);
      },
    });
    actions.push({
      label: "Fight Guard",
      action: () => startBattle(key, { type: "townClaim", encounter: townGuardEncounter(event), townKey: key, townName: event.name }, createEnemyParty(townGuardEncounter(event))),
    });
  } else if (isMobileTouchLayout()) {
    actions.push({
      label: "Rest",
      action: () => handleTownBodyAction(key, event, "rest"),
    });
    actions.push({
      label: "Notices",
      secondary: true,
      action: () => handleTownBodyAction(key, event, "notice"),
    });
    if (town.buildings.includes("barracks")) {
      actions.push({
        label: "Barracks",
        secondary: true,
        action: () => openBarracksModal(key, event),
      });
    }
    const actionId = townFactionActionId(event);
    if (!isTownActionUsed(town, actionId)) {
      actions.push({
        label: townFactionActionLabel(event),
        action: () => handleTownBodyAction(key, event, "faction"),
      });
    }
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
  const entries = townNoticeEntries(key, event);
  openModal("Town Notice Board", townNoticeBoardMarkup(event, entries), [
    { label: "Back", secondary: true, action: () => reopenTownModal(key, event) },
  ], { html: true, className: "notice-modal", onRender: () => bindTownNoticeBoard(key, event) });
}

function townNoticeEntries(key, event) {
  const local = [];
  const general = [];
  Object.entries(townCommissionDefinitions).forEach(([id, quest]) => {
    if (quest.towns && !quest.towns.includes(event.name) && !quest.towns.includes(key) && !quest.towns.includes(event.faction)) return;
    if (!townCommissionAvailable(id, quest)) return;
    (quest.towns ? local : general).push([id, quest]);
  });
  return [...local, ...general].slice(0, 5);
}

function townCommissionAvailable(id, quest) {
  const status = state.quests?.[id] || "new";
  if (status !== "new") return true;
  const targets = quest.targetKeys || [];
  if (!targets.length) return true;
  const required = quest.requiredTargets || 1;
  return countVisitedKeys(targets) <= targets.length - required;
}

function npcQuestAvailable(id, quest = npcQuests[id]) {
  if (!quest) return false;
  const status = state.quests?.[id] || "new";
  if (status !== "new") return true;
  if (id === "elder") return true;
  if (id === "ranger") return countVisitedEvents("mine") >= 1 || ownedTownEntries().length >= 2;
  if (id === "archivist") return countVisitedEvents("battle") >= 2 || uniqueRelicCount() >= 1 || currentRegionId() !== "dawnhaven_march";
  if (id === "wayfinder") return ownedTownEntries().length >= 4 || countVisitedEvents("mine") >= 3 || ["low_roads", "southern_wilds"].includes(currentRegionId());
  return true;
}

function npcQuestLockedText(id, quest = npcQuests[id]) {
  if (!quest) return "No work is ready yet.";
  if (id === "ranger") return `${quest.name} studies the roads, then shakes his head. "Claim another mine or secure a second town first. I need proof your banner can hold ground before I hand out patrol work."`;
  if (id === "archivist") return `${quest.name} closes the ledger. "Bring me signs of real war first. Clear a few outposts or recover a relic, then we can talk about deeper banners."`;
  if (id === "wayfinder") return `${quest.name} watches the southern dust. "You are not deep enough into the lower roads yet. Secure more territory before I ask you to map the south for me."`;
  return `${quest.name} is not ready to offer new work yet.`;
}

function townNoticeBoardMarkup(event, entries) {
  const cards = entries.map(([id, quest]) => {
    const status = state.quests?.[id] || "new";
    const ready = status === "accepted" && quest.complete();
    const claimed = status === "claimed";
    const tone = claimed ? "claimed" : ready ? "ready" : status === "accepted" ? "active" : "new";
    const label = claimed ? "Complete" : ready ? "Reward ready" : status === "accepted" ? "In progress" : "Available";
    const action = claimed ? "Already paid." : ready ? "Claim this reward now." : status === "accepted" ? "Tracked in your quest log." : "Accept this job now.";
    const buttonLabel = claimed ? "Done" : ready ? "Claim Reward" : "Accept Job";
    const actionControl = status === "accepted" && !ready
      ? `<span class="notice-job-pill">Tracked in Quest Log</span>`
      : `<button type="button" data-notice-job="${id}"${claimed ? " disabled" : ""}>${buttonLabel}</button>`;
    return `
      <article class="notice-job ${tone}">
        <span class="notice-pin"></span>
        <strong>${quest.title}</strong>
        <em>${label}</em>
        <p>${quest.objective}</p>
        <small>Reward: ${quest.rewardText}. ${action}</small>
        ${actionControl}
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
  if (status === "accepted" && !questStart(id)) startTownCommission(id);
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
  startTownCommission(id);
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
  modalText.querySelectorAll(".town-recruit-list").forEach((node) => {
    node.classList.toggle("selected", selection === "building:barracks");
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
            ${townNowMarkup(key, event, town, creature, cost, ownsCreature)}
            <details class="town-detail-drawer">
              <summary>Town details</summary>
              <span class="town-desk-line"><b>Control</b> ${owner}. ${town.owner === "player" ? "Your banner holds the square." : "The square is still neutral."}</span>
              <span class="town-desk-line"><b>Faction Perk</b> ${faction.perk}</span>
              <span class="town-desk-line"><b>Barracks</b> ${town.buildings.includes("barracks") ? `${faction.name} roster ready.` : `Build Barracks to unlock the full ${faction.name} roster.`}</span>
              <span class="town-desk-line"><b>Built</b> ${builtNames}</span>
            </details>
            ${town.owner === "player" ? townCommandRailMarkup(key, event, town) : `<div class="town-claim-note">Claim ${event.name} before issuing town orders, building, or training units.</div>`}
            <div id="townFeedback" class="town-feedback">Select a building plot to inspect it. Built plots act immediately, and empty owned plots can be purchased from the square.</div>
          </div>
          <div class="town-recruit-list town-panel${selection === "building:barracks" ? " selected" : ""}">
            <strong>Barracks Roster</strong>
            <p class="town-panel-note">${barracksIntro}</p>
            ${recruitableUnitsForTown(event).map((id) => townRecruitCard(key, event, town, id)).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function townNowMarkup(key, event, town, creature, cost, ownsCreature) {
  const rows = townNowRows(key, event, town, creature, cost, ownsCreature).slice(0, 5);
  return `
    <div class="town-now-panel">
      <span class="town-now-title">Available now</span>
      <div class="town-now-list">
        ${rows.map((row) => townNowChipMarkup(row)).join("")}
      </div>
    </div>
  `;
}

function townNowChipMarkup(row) {
  const content = `<b>${escapeHtml(row.label)}</b><small>${escapeHtml(row.text)}</small>`;
  if (!row.action) return `<span class="town-now-chip ${row.tone} passive">${content}</span>`;
  return `<button type="button" class="town-now-chip ${row.tone}" data-town-now="${escapeHtml(row.action)}"${row.target ? ` data-town-now-target="${escapeHtml(row.target)}"` : ""}>${content}</button>`;
}

function townNowRows(key, event, town, creature, cost, ownsCreature) {
  if (town.owner !== "player") return [{ label: "Claim town", text: `${townClaimCost(event)} gold or fight the guard`, tone: "warn", action: "claim" }];
  const rows = [];
  Object.entries(townBuildingDefinitions).forEach(([id, building]) => {
    const built = town.buildings.includes(id);
    const used = isTownActionUsed(town, id) && id !== "caravanPost";
    const price = townBuildingCost(building);
    if (built && !used) rows.push({ label: id === "caravanPost" ? "Shop open" : `${building.name} ready`, text: id === "barracks" ? "Enter roster modal" : building.text, tone: "good", action: "building", target: id });
    if (!built && state.gold >= price) rows.push({ label: `Build ${building.name}`, text: `${price} gold`, tone: "good", action: "building", target: id });
  });
  const actionId = townFactionActionId(event);
  rows.push(isTownActionUsed(town, actionId)
    ? { label: "Faction order used", text: "Ready again tomorrow", tone: "used" }
    : { label: townFactionActionLabel(event), text: townFactionActionDescription(event), tone: "info", action: "faction" });
  if (!ownsCreature && state.gold >= cost) rows.push({ label: `Recruit ${creature.name}`, text: `${cost} gold`, tone: "good", action: "recruit", target: creature.id });
  if (!town.buildings.includes("barracks")) rows.push({ label: "Roster locked", text: "Build Barracks for full recruits", tone: "warn" });
  if (!rows.length) rows.push({ label: "Town stable", text: "Check details or come back tomorrow", tone: "used" });
  return rows.sort((a, b) => ({ good: 0, info: 1, warn: 2, used: 3 }[a.tone] - { good: 0, info: 1, warn: 2, used: 3 }[b.tone]));
}

function townCommandRailMarkup(key, event, town) {
  const actionId = townFactionActionId(event);
  const factionUsed = isTownActionUsed(town, actionId);
  const faction = townFaction(event);
  return `
    <div class="town-faction-order ${event.faction || "grove"}">
      <strong>${townFactionActionLabel(event)}</strong>
      <span>${townFactionActionDescription(event)}</span>
      <em>${faction.name} town order${factionUsed ? " already used today" : " ready now"}</em>
    </div>
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
    if (!["chest", "cache", "artifact", "supply", "battle", "town"].includes(event.type)) return;
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

const npcQuestTargets = {
  elder: { new: "5,3", accepted: "5,6" },
  ranger: { new: "18,7", accepted: "7,7" },
  archivist: { new: "39,14", accepted: "11,2" },
  wayfinder: { new: "28,38", accepted: "9,31" },
};

const npcQuestSourceKeys = {
  elder: "5,3",
  ranger: "18,7",
  archivist: "39,14",
  wayfinder: "28,38",
};

const townQuestTargets = {
  dawnhavenPatrol: "7,7",
  dawnRoadSurvey: "8,5",
  ashbellOreRun: "20,2",
  ashbellRidgeWarden: "22,6",
  mistfenRemedy: "6,4",
  mistfenFangProof: "13,9",
  moonbarrowCompass: "35,13",
  moonbarrowWingWatch: "31,11",
  southwatchMonument: "41,21",
  southwatchGap: "38,24",
  eastmereBowCache: "41,10",
  eastmereGlassroad: "57,12",
  sunforgeRelicRun: "48,26",
  sunforgeMineQuota: "42,14",
  amberwatchSupply: "27,23",
  amberwatchWarlock: "51,25",
  highglassTollGuard: "61,6",
  highglassWyvern: "70,9",
  greenmarchTollhouse: "67,17",
  greenmarchHunt: "70,9",
  starfenRelics: "57,36",
  starfenSouthRoad: "60,30",
  lowmarketCauseway: "13,36",
  lowmarketCairn: "33,34",
  groveAid: "3,2",
  roadTithe: "3,2",
  musterCall: "16,5",
};

function questTrackTarget(type, id) {
  if (type === "npc") {
    const status = state.quests?.[id] || "new";
    if (status === "new" && !npcQuestDiscovered(id)) return null;
    const target = npcQuestTargets[id];
    if (!target) return null;
    return target[status] || target.accepted || target.new || null;
  }
  if (type === "town") return townQuestTargets[id] || null;
  if (type === "story") {
    return {
      warband: "3,2",
      towns: "16,5",
      mines: "5,6",
      outposts: "7,7",
      relics: "11,2",
      blackGate: "71,5",
      fortress: "71,4",
    }[id] || null;
  }
  return null;
}

function questTrackLabel(type, id) {
  const targetKey = questTrackTarget(type, id);
  if (!targetKey) return "";
  const point = pointFromKeyString(targetKey);
  const event = events.get(targetKey);
  const label = type === "npc"
    ? npcQuests[id]?.title || eventLabel(event || {})
    : type === "town"
      ? townCommissionDefinitions[id]?.title || eventLabel(event || {})
      : eventLabel(event || {});
  return `${label} at ${coordText(point.x, point.y)}`;
}

function activeQuestTarget() {
  if (!state.activeQuest) return null;
  const [type, id] = state.activeQuest.split(":");
  const key = questTrackTarget(type, id);
  if (!key || state.visited?.[key] && type !== "npc") {
    state.activeQuest = "";
    return null;
  }
  const point = pointFromKeyString(key);
  return {
    key,
    type,
    id,
    x: point.x,
    y: point.y,
    event: events.get(key),
    label: questTrackLabel(type, id),
  };
}

function setActiveQuest(type, id) {
  const target = questTrackTarget(type, id);
  if (!target) return;
  state.activeQuest = `${type}:${id}`;
  state.scoutMarker = target;
  setMessage(`Tracking ${questTrackLabel(type, id)}.`);
  renderAll();
}

function npcQuestDiscovered(id) {
  if (id === "elder") return true;
  const key = npcQuestSourceKeys[id];
  return Boolean(key && state.revealed?.[key]);
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
      messageText = `Grove Blessing used: ${event.name}'s wardens restore ${amount} HP across the party.${remaining > 0 ? ` ${remaining} HP still needs mending.` : " The warband is fully restored."}`;
    } else {
      addInventoryItem("healingDraught", 1);
      messageText = `Grove Blessing used: ${event.name}'s herbalists add a Healing Draught to your bag. You now carry ${inventoryCount("healingDraught")} draught${inventoryCount("healingDraught") === 1 ? "" : "s"}.`;
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
  const baseCost = 22 + (unit?.maxHp || 20) * 0.72 + (unit?.atk || 5) * 3 + state.hero.level * 4;
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
      ${townRecruitSpriteMarkup(id, unit)}
      <span class="town-recruit-main"><b>${unit.name}</b><small>${role} / ${rangeText(unit)}</small><span class="town-card-tags"><i class="town-state-badge ${tone}">${badge}</i>${existing ? `<i class="town-state-badge neutral">Veteran</i>` : ""}</span></span>
      <em>${note}</em>
    </button>
  `;
}

function townRecruitSpriteMarkup(id, unit) {
  const portrait = unitArtReady(id) ? getUnitPortraitDataUrl(id) : "";
  if (portrait) return `<span class="town-recruit-sprite" style="--unit-color:${unit.color}"><img src="${portrait}" alt="" /></span>`;
  return `<span class="town-recruit-sprite fallback" style="--unit-color:${unit.color}"><span class="recruit-dot"></span></span>`;
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
  modalText.querySelectorAll("[data-town-now]").forEach((button) => {
    button.addEventListener("click", () => handleTownNowAction(key, event, button.dataset.townNow, button.dataset.townNowTarget));
  });
  syncTownSelectionUi(getTownSelection(key, event));
  setTownSelection(key, event, getTownSelection(key, event));
}

function handleTownNowAction(key, event, action, target) {
  if (action === "claim") {
    setTownFeedback(`Claim ${event.name} with the footer claim button, or fight the town guard for control.`, "info");
    return;
  }
  if (action === "building" && target) {
    setTownSelection(key, event, `building:${target}`, false);
    handleTownBuildingClick(key, event, target);
    return;
  }
  if (action === "recruit" && target) {
    setTownSelection(key, event, `recruit:${target}`, false);
    recruitTownUnit(key, event, target);
    return;
  }
  if (action === "faction") handleTownBodyAction(key, event, "faction");
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

function barracksRecruitPreview(key, event, unitId) {
  const town = getTownState(key);
  const unit = creatureBook[unitId];
  if (!unit) return;
  setTownSelection(key, event, `recruit:${unitId}`, false);
  const primary = unitId === event.creature;
  const existing = partyUnitForId(unitId);
  const builtBarracks = town.buildings.includes("barracks");
  const baseStatus = town.owner !== "player"
    ? `Claim ${event.name} before this roster can drill.`
    : !primary && !builtBarracks
      ? `Needs Barracks before ${unit.name} can join.`
      : existing
        ? isTownActionUsed(town, `upgrade:${unitId}`)
          ? `${unit.name} already trained here today.`
          : `Upgrade for ${townUpgradeCostForUnit(unitId, event)} gold.`
        : !primary && isTownActionUsed(town, "barracks")
          ? "The Barracks has already raised a unit today."
          : state.party.length >= MAX_PARTY_UNITS
            ? `Party full. Replace a creature for ${recruitCostForTown(unitId, event)} gold.`
            : `Recruit for ${recruitCostForTown(unitId, event)} gold.`;
  setBarracksFeedback(`${unit.name}: ${unitRole(unit)}, ${rangeText(unit)}. ${unit.skill}. ${baseStatus}`, !primary && !builtBarracks ? "warn" : existing && isTownActionUsed(town, `upgrade:${unitId}`) ? "used" : "info");
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
    barracksFeedback = { text: `${event.name}'s Barracks is open. Select a roster card to recruit a new unit or train a veteran.`, type: "info" };
    openBarracksModal(key, event);
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

function openBarracksModal(key, event) {
  openModal("Barracks", barracksMarkup(key, event), [
    { label: "Back to Town", secondary: true, action: () => reopenTownModal(key, event) },
  ], { html: true, className: "barracks-modal", onRender: () => bindBarracksModal(key, event) });
}

function reopenBarracksModal(key, event) {
  window.setTimeout(() => {
    if (!activeBattle && !activeNight) openBarracksModal(key, event);
  }, 0);
}

function barracksMarkup(key, event) {
  const town = getTownState(key);
  const faction = townFaction(event);
  const roster = recruitableUnitsForTown(event).map((id) => townRecruitCard(key, event, town, id)).join("");
  const builtBarracks = town.buildings.includes("barracks");
  const recruitUsed = isTownActionUsed(town, "barracks");
  const available = recruitableUnitsForTown(event).filter((id) => {
    const primary = id === event.creature;
    const existing = partyUnitForId(id);
    if (!primary && !builtBarracks) return false;
    if (existing) return !isTownActionUsed(town, `upgrade:${id}`);
    if (!primary && recruitUsed) return false;
    return true;
  }).length;
  const feedback = barracksFeedback.text
    ? `<div id="barracksFeedback" class="barracks-feedback ${barracksFeedback.type}">${escapeHtml(barracksFeedback.text)}</div>`
    : `<div id="barracksFeedback" class="barracks-feedback info">Select a roster card to recruit, replace, or train a veteran.</div>`;
  const primaryUnit = creatureBook[event.creature];
  return `
    <div class="barracks-panel">
      <div class="barracks-hero">
        ${townSpriteDataUrl("barracks", true) ? `<img src="${townSpriteDataUrl("barracks", true)}" alt="" />` : ""}
        <div>
          <strong>${escapeHtml(event.name)} Barracks</strong>
          <span>${escapeHtml(faction.name)} drill hall. Recruit the local ${escapeHtml(primaryUnit?.name || "unit")} anytime, and use the built Barracks to raise one wider faction unit each day.</span>
        </div>
      </div>
      <div class="barracks-summary">
        <span><b>Gold</b>${state.gold}</span>
        <span><b>Party</b>${state.party.length}/${MAX_PARTY_UNITS}</span>
        <span><b>Roster</b>${faction.units.length} units</span>
        <span><b>Ready</b>${available}</span>
      </div>
      ${feedback}
      <section class="barracks-roster-panel">
        <h3><span>Barracks Roster</span><small>${recruitUsed ? "Daily recruit used" : "Daily recruit ready"}</small></h3>
        <div class="barracks-roster">${roster}</div>
      </section>
    </div>
  `;
}

function bindBarracksModal(key, event) {
  modalText.querySelectorAll("[data-town-recruit]").forEach((button) => {
    button.addEventListener("click", () => recruitTownUnit(key, event, button.dataset.townRecruit, { source: "barracks" }));
    button.addEventListener("focus", () => barracksRecruitPreview(key, event, button.dataset.townRecruit));
  });
  syncTownSelectionUi(getTownSelection(key, event));
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
  ], { html: true, className: "trade-modal caravan-modal", onRender: () => bindCaravanTradeModal(key, event) });
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
  const sellableQty = sellableInventoryCount(good.id);
  if (!definition || sellableQty <= 0) {
    const text = `You have no ${definition?.name || "item"} to sell.`;
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
  const sellRows = state.inventory.map((item) => {
        const definition = itemDefinitions[item.id];
        const tradeGood = caravanTradeGoods.find((good) => good.id === item.id);
        const sellableQty = sellableInventoryCount(item.id);
        if (sellableQty <= 0) return "";
        const equippedCopy = state.equipped[item.id] ? " + equipped" : "";
        const sellDisabled = !tradeGood ? " disabled" : "";
        return `
          <li class="trade-row ${definition?.type === "equipment" ? "artifact" : "supply"}">
            ${tradeItemIconMarkup(item.id)}
            <span class="trade-item"><strong>${escapeHtml(definition?.name || item.id)}</strong><em>x${sellableQty}${equippedCopy}</em></span>
            <span class="trade-price"><small>${tradeGood ? "Receive" : "Buyer"}</small><strong>${tradeGood ? `${tradeGood.sellPrice}g` : "None"}</strong></span>
            <button type="button" data-caravan-sell="${item.id}"${sellDisabled}>Sell</button>
          </li>
        `;
      }).join("");
  const inventory = sellRows || `<li class="trade-row empty"><span class="trade-icon">-</span><span class="trade-item"><strong>No spare items</strong><em>Equipped gear is kept safe</em></span><span class="trade-price"><small>Receive</small><strong>-</strong></span><button type="button" disabled>Sell</button></li>`;
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

function setBarracksFeedback(text, type = "info") {
  barracksFeedback = { text, type };
  const feedback = modalText.querySelector("#barracksFeedback");
  if (feedback) {
    feedback.textContent = text;
    feedback.className = `barracks-feedback ${type}`;
  }
  setMessage(text);
}

function setRecruitFeedback(key, event, text, type, source) {
  if (source === "barracks") {
    setBarracksFeedback(text, type);
    return;
  }
  setTownFeedback(text, type);
}

function refreshTownModal(key, event, feedbackText = "", feedbackType = "info") {
  townEvent(key, event);
  if (feedbackText) setTownFeedback(feedbackText, feedbackType);
  renderSidebar();
}

function recruitTownUnit(key, event, unitId, options = {}) {
  const source = options.source || "town";
  const town = getTownState(key);
  const unit = creatureBook[unitId];
  if (!unit) return;
  if (town.owner !== "player") {
    setRecruitFeedback(key, event, `Claim ${event.name} before recruiting or training units here.`, "warn", source);
    return;
  }
  const primary = unitId === event.creature;
  const existing = partyUnitForId(unitId);
  const actionId = existing ? `upgrade:${unitId}` : "barracks";
  if (!primary && !town.buildings.includes("barracks")) {
    setRecruitFeedback(key, event, `Build Barracks to recruit ${unit.name}.`, "warn", source);
    return;
  }
  if (existing && isTownActionUsed(town, actionId)) {
    setRecruitFeedback(key, event, `${unit.name} has already trained here today. Try again tomorrow.`, "used", source);
    return;
  }
  if (!existing && !primary && isTownActionUsed(town, "barracks")) {
    setRecruitFeedback(key, event, "Barracks has already raised a unit today. Try again tomorrow.", "used", source);
    return;
  }
  const cost = existing ? townUpgradeCostForUnit(unitId, event) : recruitCostForTown(unitId, event);
  if (state.gold < cost) {
    setRecruitFeedback(key, event, `${existing ? "Training" : unit.name} costs ${cost} gold.`, "warn", source);
    return;
  }
  if (!existing && state.party.length >= MAX_PARTY_UNITS) {
    openReplaceUnitModal(key, event, unitId, cost, source);
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
  const text = existing ? `${event.name} upgrades ${existing.name} to level ${existing.level}.` : `${event.name} recruits ${unit.name}.`;
  if (source === "barracks") {
    setBarracksFeedback(text, "good");
    renderAll();
    reopenBarracksModal(key, event);
    return;
  }
  refreshTownModal(key, event, text, "good");
}

function openReplaceUnitModal(key, event, unitId, cost, source = "town") {
  const unit = creatureBook[unitId];
  if (!unit) return;
  const reopenSourceModal = () => source === "barracks" ? reopenBarracksModal(key, event) : reopenTownModal(key, event);
  openModal(
    "Replace Unit",
    `Your party has ${MAX_PARTY_UNITS} creature units. Choose one to dismiss and recruit ${unit.name} for ${cost} gold.`,
    [
      ...state.party.map((member, index) => ({
        label: `Replace ${member.name}`,
        action: () => {
          if (state.gold < cost) {
            setMessage(`${unit.name} costs ${cost} gold.`);
            reopenSourceModal();
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
          if (source === "barracks") barracksFeedback = { text: `${removed.name} leaves. ${unit.name} joins the party.`, type: "good" };
          reopenSourceModal();
        },
      })),
      { label: "Cancel", secondary: true, action: () => reopenSourceModal() },
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
  return caravanCount ? caravanCount * Math.max(9, Math.min(36, townCount * 7)) : 0;
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
  const townGold = ownedTowns.length * 5;
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
    if (event.type === "mine" && state.visited[key]) total += Math.max(7, Math.round(event.gold * 0.38));
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

function chestGuardianKey(key) {
  return `guard:${key}`;
}

function isChestGuardianCleared(key) {
  return Boolean(state.visited?.[chestGuardianKey(key)]);
}

function isLinkedGuardCleared(event) {
  return Boolean(!event.guardedBy || state.visited?.[event.guardedBy]);
}

function isCacheGuarded(key, event) {
  if (event.guardedBy) return !isLinkedGuardCleared(event);
  return Boolean(event.guardian && !isChestGuardianCleared(key));
}

function chestGuardianName(event) {
  return encounters[event.guardian]?.name || "Treasure Guard";
}

function linkedGuardName(event) {
  const guard = events.get(event.guardedBy);
  return guard?.guardName || encounters[guard?.encounter]?.name || "Cache Guard";
}

function seededUnit(seedText) {
  let value = 2166136261;
  for (let i = 0; i < seedText.length; i += 1) {
    value ^= seedText.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  value += value << 13;
  value ^= value >>> 7;
  value += value << 3;
  value ^= value >>> 17;
  value += value << 5;
  return (value >>> 0) / 4294967295;
}

function baseTreasureRewards(event) {
  if (Array.isArray(event.rewards) && event.rewards.length) return event.rewards;
  return [{ item: event.item, gold: event.gold || 0, qty: event.qty || 1 }];
}

function rollChestRewards(key, event) {
  const rewards = baseTreasureRewards(event).map((reward) => ({ ...reward }));
  if (event.type !== "chest" || !key) return rewards;
  const seed = `${state.worldSeed || 0}:${key}`;
  const bonusA = seededUnit(`${seed}:a`);
  const bonusB = seededUnit(`${seed}:b`);
  const bonusC = seededUnit(`${seed}:c`);
  if (bonusA > 0.34) rewards.push({ gold: 14 + Math.floor(bonusA * 42) });
  if (bonusB > 0.46) rewards.push({ xp: 14 + Math.floor(bonusB * 34) });
  if (bonusC > 0.72) {
    const artifactPool = ["Banner of Luck", "Silver Bridle", "Starlit Compass", "Forge Charm"];
    rewards.push({ item: artifactPool[Math.floor(bonusC * artifactPool.length) % artifactPool.length], gold: 10 });
  } else if (bonusC > 0.34 && event.item !== "Healing Draught") {
    rewards.push({ item: "Healing Draught", qty: 1 });
  }
  return rewards;
}

function treasureRewards(event, key = "") {
  if (key && state.chestRolls?.[key]) return state.chestRolls[key];
  return rollChestRewards(key, event);
}

function treasurePrimaryItem(event) {
  return treasureRewards(event).find((reward) => reward.item)?.item || event.item || "treasure";
}

function treasureRewardSummary(event, key = "") {
  const rewards = treasureRewards(event, key);
  const itemText = rewards
    .filter((reward) => reward.item)
    .map((reward) => `${reward.qty && reward.qty > 1 ? `${reward.qty}x ` : ""}${reward.item}`)
    .join(", ");
  const totalGold = rewards.reduce((sum, reward) => sum + (reward.gold || 0), 0);
  const totalXp = rewards.reduce((sum, reward) => sum + (reward.xp || 0), 0);
  return [itemText, totalGold ? `${totalGold} gold` : "", totalXp ? `${totalXp} XP` : ""].filter(Boolean).join(" and ");
}

function chestEvent(key, event) {
  if (event.guardedBy && !isLinkedGuardCleared(event)) {
    const guardName = linkedGuardName(event);
    setMessage(`${guardName} blocks the way to ${treasurePrimaryItem(event)}.`);
    openModal("Guarded Cache", linkedGuardedChestMarkup(event, guardName), [
      {
        label: "Mark Guard",
        action: () => {
          state.scoutMarker = event.guardedBy;
          setMessage(`${guardName} marked on the overworld.`);
          renderAll();
        },
      },
      { label: "Leave Cache", secondary: true, action: () => renderAll() },
    ], { html: true });
    return;
  }
  if (event.guardian && !isChestGuardianCleared(key)) {
    const guardianName = chestGuardianName(event);
    setMessage(`${guardianName} guards ${treasurePrimaryItem(event)}.`);
    openModal("Guarded Treasure", guardedChestMarkup(event, guardianName), [
      { label: "Fight Guard", action: () => startBattle(chestGuardianKey(key), { type: "chestGuard", chestKey: key, encounter: event.guardian }, createEnemyParty(event.guardian)) },
      { label: "Retreat", secondary: true, action: () => setMessage(`${guardianName} still guards the cache.`) },
    ], { html: true });
    return;
  }
  let totalGold = 0;
  let totalXp = 0;
  const foundItems = [];
  let relicsFound = 0;
  const rewards = treasureRewards(event, key);
  state.chestRolls ??= {};
  if (event.type === "chest") state.chestRolls[key] = rewards.map((reward) => ({ ...reward }));
  rewards.forEach((reward) => {
    totalGold += reward.gold || 0;
    totalXp += reward.xp || 0;
    if (!reward.item) return;
    const qty = Math.max(1, reward.qty || 1);
    if (relicItems.has(reward.item) && !state.relics.includes(reward.item)) {
      state.relics.push(reward.item);
      relicsFound += 1;
    }
    const itemId = chestItemIds[reward.item];
    if (itemId) addInventoryItem(itemId, qty);
    foundItems.push(`${qty > 1 ? `${qty}x ` : ""}${reward.item}`);
  });
  state.gold += totalGold;
  const xpReport = totalXp ? gainXp(totalXp) : null;
  state.visited[key] = true;
  playSfx("coin");
  const foundText = [foundItems.join(", "), totalGold ? `${totalGold} gold` : "", totalXp ? `${totalXp} XP` : ""].filter(Boolean).join(" and ");
  const title = event.type === "cache" ? "Cache Opened" : event.type === "artifact" ? "Artifact Found" : event.type === "supply" ? "Supplies Found" : relicsFound ? "Relic Found" : "Treasure Found";
  setMessage(`Found ${foundText}.`);
  openModal(title, `You found ${foundText}.${relicsFound ? ` Relics: ${state.relics.length}/4.` : ""}${xpReport?.heroLevels ? ` ${championName()} reached level ${state.hero.level}.` : ""} The loot was added to your inventory.`, [
    { label: "Done", action: () => resolvePostBattleProgression() },
  ]);
}

function linkedGuardedChestMarkup(event, guardName) {
  const isRelic = treasureRewards(event).some((reward) => relicItems.has(reward.item));
  const guard = events.get(event.guardedBy);
  const guardReward = guard ? createEnemyParty(guard.encounter).reduce((sum, enemy) => sum + (enemy.reward || 0), 0) : 0;
  return `
    <div class="battle-preview">
      <p><strong>${escapeHtml(guardName)}</strong> holds the road before this cache. Defeat that visible outpost first, then return for the reward.</p>
      <div class="battle-reward-preview">
        <span>${isRelic ? "Artifacts" : "Loot"}: ${escapeHtml(treasureRewardSummary(event))}</span>
        ${guardReward ? `<span>Guard reward ${guardReward} gold</span>` : ""}
      </div>
      <p>This cache is intentionally guarded from the overworld, not by a hidden popup fight.</p>
    </div>
  `;
}

function guardedChestMarkup(event, guardianName) {
  const isRelic = treasureRewards(event).some((reward) => relicItems.has(reward.item));
  const rewardType = isRelic ? "Artifact" : itemDefinitions[chestItemIds[event.item]]?.type === "equipment" ? "Item" : "Supply";
  return `
    <div class="battle-preview">
      <p><strong>${escapeHtml(guardianName)}</strong> has made camp around a sealed cache.</p>
      <div class="battle-reward-preview">
        <span>${rewardType}: ${escapeHtml(treasureRewardSummary(event))}</span>
      </div>
      <p>Win the guard fight to open the cache. Retreating leaves the treasure marked on the overworld.</p>
    </div>
  `;
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

function sellableInventoryCount(id) {
  return Math.max(0, inventoryCount(id) - (state.equipped[id] ? 1 : 0));
}

function partyMissingHp() {
  return [state.hero, ...state.party].reduce((sum, unit) => sum + Math.max(0, (unit.maxHp || 0) - Math.max(0, unit.hp || 0)), 0);
}

function totalMissingPartyHealth() {
  return partyMissingHp();
}

function useInventoryItem(id) {
  if (modalOpen) return;
  const item = state.inventory.find((entry) => entry.id === id);
  const definition = itemDefinitions[id];
  if (!item || !definition) return;
  if (definition.type === "equipment" && state.equipped[id]) {
    return unequipInventoryItem(id);
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

function unequipInventoryItem(id) {
  const definition = itemDefinitions[id];
  if (!definition || definition.type !== "equipment" || !state.equipped[id]) return;
  const result = definition.unequip ? definition.unequip() : `${definition.name} unequipped.`;
  delete state.equipped[id];
  setMessage(result);
  renderAll();
}

function battleEvent(key, event) {
  if (event.gate && !fortressGateRequirements().ready) {
    revealGateRequirements();
    setMessage(fortressGateRequirementText());
    openModal("Black Gate Sealed", gateSealedMarkup(), [
      { label: "Continue", action: () => renderAll() },
    ], { html: true, className: "boss-preview-modal boss-aftermath-modal" });
    return;
  }
  const enemies = createBattleEnemyParty(event);
  const leader = enemies[0];
  const tier = { label: leader?.difficultyTier || campaignDifficultyTier().label };
  const leaderName = event.guardName || leader.name;
  const enemyText = enemies.length > 1 ? `${leaderName} and ${enemies.length - 1} ${enemies.length === 2 ? "ally" : "allies"} block the path.` : `${leaderName} blocks the path.`;
  openModal("Battle", battlePreviewMarkup(event, enemies, tier, enemyText), [
    { label: "Fight", action: () => startBattle(key, event, enemies) },
    { label: "Retreat", secondary: true, action: () => retreatFromBattlePreview(key, event) },
  ], { html: true, className: event.gate || event.passName || event.type === "final" ? "boss-preview-modal" : "" });
}

function retreatFromBattlePreview(key, event) {
  if (event.passName) {
    const fallback = state.lastTravelPosition;
    if (fallback && !isBlocked(fallback.x, fallback.y)) {
      state.x = fallback.x;
      state.y = fallback.y;
      visual = { x: state.x, y: state.y, fromX: state.x, fromY: state.y, toX: state.x, toY: state.y, moving: false, startedAt: 0, progress: 0 };
    }
    setMessage(`${event.guardName || "The pass guardian"} still holds ${event.passName}.`);
    renderAll();
    return;
  }
  if (event.guards?.length) {
    const guard = pointFromKeyString(key);
    const chest = pointFromKeyString(event.guards[0]);
    const fallback = { x: guard.x * 2 - chest.x, y: guard.y * 2 - chest.y };
    if (!isBlocked(fallback.x, fallback.y)) {
      state.x = fallback.x;
      state.y = fallback.y;
      visual = { x: state.x, y: state.y, fromX: state.x, fromY: state.y, toX: state.x, toY: state.y, moving: false, startedAt: 0, progress: 0 };
    }
    setMessage(`${event.guardName || "The guard"} still holds the pass.`);
    renderAll();
    return;
  }
  setMessage("You hold position and prepare.");
  renderAll();
}

function battlePreviewMarkup(event, enemies, tier, enemyText) {
  const reward = battleGoldReward(event, enemies);
  const icons = enemies.map((enemy) => enemyPreviewIconMarkup(enemy)).join("");
  const leadText = bossLeadText(event);
  const bossText = bossTraitText(event);
  const readinessText = passReadinessText(event);
  const guardedCaches = (event.guards || [])
    .map((key) => ({ key, event: events.get(key) }))
    .filter((entry) => entry.event)
    .map(({ event: cache }) => eventLabel(cache))
    .join(", ");
  return `
    <div class="battle-preview ${event.gate || event.passName || event.type === "final" ? "boss-preview" : ""}">
      ${leadText || event.passName ? `<div class="boss-preview-hero"><strong>${event.passName ? "Biome Boss" : event.gate ? "Fortress Approach" : event.type === "final" ? "Fortress Heart" : "Battle Readiness"}</strong><p>${escapeHtml(leadText || `${event.guardName || "The pass guardian"} is a mini-boss holding ${event.passName}. Bring extra units, healing, or upgrades before forcing the crossing.`)}</p></div>` : ""}
      <p>${escapeHtml(enemyText)} Threat: <strong>${tier.label}</strong>.</p>
      ${readinessText ? `<div class="boss-preview-panel ready-check"><strong>Ready Check</strong><p>${escapeHtml(readinessText)}</p></div>` : ""}
      <div class="boss-preview-panel"><strong>Tactical Ask</strong><p>${escapeHtml(enemyTraitText(enemies[0]?.sourceEncounter || event.encounter))}</p></div>
      ${event.passName ? `<div class="boss-preview-panel"><strong>Pass Guardian</strong><p>Defeat this guard to make ${escapeHtml(event.passName)} safe to cross. This fight controls movement between regions, not just loot.</p></div>` : ""}
      ${guardedCaches ? `<div class="boss-preview-panel"><strong>Guarding</strong><p>Clearing this outpost opens the ${escapeHtml(guardedCaches)} nearby.</p></div>` : ""}
      ${bossText ? `<div class="boss-preview-panel"><strong>Boss Trait</strong><p>${bossText}</p></div>` : ""}
      <div class="enemy-icon-row">${icons}</div>
      <div class="battle-reward-preview">
        <span>Reward ${reward} gold</span>
        <span>${event.type === "final" ? "Victory fight" : event.gate || event.passName ? "Pass guardian" : `${enemies.length} enemy unit${enemies.length === 1 ? "" : "s"}`}</span>
      </div>
    </div>
  `;
}

function enemyPreviewIconMarkup(enemy) {
  const portrait = battleEnemyPortrait(enemy);
  if (portrait) {
    return `<span class="enemy-icon portrait ${enemyArchetype(enemy)}" title="${escapeHtml(enemy.name)}"><img src="${portrait}" alt="" /></span>`;
  }
  return `<span class="enemy-icon ${enemyArchetype(enemy)}" title="${escapeHtml(enemy.name)}">${enemyArchetypeIcon(enemy)}</span>`;
}

function passReadinessText(event) {
  if (event.gate) {
    if (fortressGateRequirements().ready) return "Fortress gate requirements met. The road to Orius is almost open.";
    return gateRequirementsKnown()
      ? fortressGateRequirementText()
      : "High March scouts confirm one thing: the Black Gate Warden must fall before you can reach Orius.";
  }
  if (!event.passName) return "";
  if (event.passName === "Ashbell Ridge") {
    return "Recommended before crossing: champion level 2, one recruited creature, one Healing Draught, and at least one mine or shrine reward. Dawnhaven and Ashbell notice jobs point you toward those prep steps.";
  }
  return "Recommended before crossing: a filled front line, healing in the bag, and at least one recent town or cache upgrade.";
}

function enemyTraitText(encounterId) {
  return {
    goblin: "Bandits punish isolated units. Keep wounded allies near the line or they will be picked off.",
    basilisk: "Basilisks grind down guarded targets with venom. Do not rely on guarding alone.",
    raiders: "Raiders bring ranged pressure. Protect your backline or close the distance quickly.",
    wyvern: "Wyverns dive exposed targets and move fast. Spread carefully, but do not strand units.",
    knight: "Knights are armored anchors. Focus fire instead of trading single blows.",
    tideGuard: "Harbor guards hold formation. Bring damage or upgrades before forcing the claim.",
    warlock: "Warlocks punish unguarded backline units with long-range magic.",
    gatekeeper: "The Warden shields the first blow and enrages at half health.",
    rival: "Orius uses wards, blinks, and field-wide barrages. End the fight before attrition wins.",
  }[encounterId] || "This enemy controls a useful route or reward. Defeating it changes the map, not just your gold.";
}

function battleGoldReward(event, enemies) {
  const base = enemies.reduce((sum, enemy) => sum + (enemy.reward || 0), 0);
  if (event.type === "night") {
    const streakBonus = (state.nightStreak || 0) * 4;
    const moraleBonus = (state.campMorale || 0) * 3;
    const planBonus = activeNight?.plan === "nightRaid" ? 14 : activeNight?.plan === "holdfast" ? -6 : 4;
    return Math.max(12, base + streakBonus + moraleBonus + planBonus);
  }
  if (event.type === "final") return base + 80;
  if (event.gate) return base + 45;
  if (event.passName) return base + 48;
  if (event.guards?.length) return base + 18;
  if (event.type === "townClaim") return base + 12;
  if (event.type === "roamingHero") return base + 24;
  return base;
}

function battleXpReward(event, leader, enemies) {
  if (event.type === "night") {
    const streakBonus = (state.nightStreak || 0) * 2;
    const moraleBonus = state.campMorale || 0;
    const planBonus = activeNight?.plan === "nightRaid" ? 8 : activeNight?.plan === "holdfast" ? -4 : 2;
    return Math.max(18, 18 + (leader.nightLevel || state.hero.level) * 4 + streakBonus + moraleBonus + planBonus);
  }
  if (event.type === "final") return 80;
  if (event.gate) return 64;
  const tier = leader?.difficultyTier === "Hard" ? 2 : leader?.difficultyTier === "Medium" ? 1 : campaignDifficultyTier().rank;
  const partyBonus = Math.max(0, (enemies?.length || 1) - 2) * 3;
  if (event.passName) return 52 + tier * 8 + partyBonus;
  if (event.guards?.length || event.type === "chestGuard") return 32 + tier * 5 + partyBonus;
  if (event.type === "townClaim") return 30 + tier * 4 + partyBonus;
  if (event.type === "roamingHero") return 38 + tier * 5 + partyBonus;
  return 24 + tier * 4 + partyBonus;
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

function gateSealedMarkup() {
  const gate = fortressGateRequirements();
  const relicMissing = Math.max(0, gate.relicTarget - gate.relicCount);
  const outpostMissing = Math.max(0, gate.outpostTarget - gate.outpostCount);
  return `
    <div class="boss-aftermath gate-aftermath sealed-gate">
      <div class="boss-aftermath-hero">
        <div class="boss-aftermath-emblem gate" aria-hidden="true"><i></i></div>
        <div>
          <strong>Black Gate Sealed</strong>
          <p>The Warden refuses open battle while your supply line is still weak. Recover relic banners and break hostile outposts before forcing the fortress approach.</p>
        </div>
      </div>
      <ol class="boss-aftermath-progress" aria-label="Black Gate requirements">
        <li class="${gate.relicCount >= gate.relicTarget ? "done" : "current"}"><strong>${gate.relicCount}/${gate.relicTarget} relics</strong><span>${relicMissing ? `${relicMissing} more relic banner${relicMissing === 1 ? "" : "s"} needed.` : "Relic banners are ready."}</span></li>
        <li class="${gate.outpostCount >= gate.outpostTarget ? "done" : "current"}"><strong>${gate.outpostCount}/${gate.outpostTarget} outposts</strong><span>${outpostMissing ? `${outpostMissing} more outpost${outpostMissing === 1 ? "" : "s"} must fall.` : "Outpost pressure is broken."}</span></li>
        <li><strong>Gate boss locked</strong><span>Return when both requirements are complete.</span></li>
      </ol>
      <div class="boss-aftermath-grid">
        <article><small>Best Next Step</small><strong>${relicMissing ? "Find relic caches" : "Clear outposts"}</strong><p>${relicMissing ? "Relics are usually guarded or hidden in cache pockets." : "Look for red enemy markers and guarded road pockets."}</p></article>
        <article><small>Why It Matters</small><strong>Supply Line</strong><p>The final fortress fight only opens once your army has enough banners and safe routes to hold the siege.</p></article>
      </div>
    </div>
  `;
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

function createBattleEnemyParty(event) {
  if (event.passName) return createPassGuardianParty(event);
  return createEnemyParty(event.encounter);
}

function createPassGuardianParty(event) {
  const tier = campaignDifficultyTier();
  const firstRidge = event.passName === "Ashbell Ridge";
  const bossTier = firstRidge
    ? { ...tier, rank: Math.max(0, tier.rank), label: tier.rank >= 1 ? "Medium" : "Easy" }
    : { ...tier, rank: Math.max(1, tier.rank + 1), label: tier.rank >= 1 ? "Hard" : "Medium" };
  const minimumSize = firstRidge ? 2 : 3;
  const partySize = Math.min(BATTLE_ROWS, Math.max(minimumSize, desiredEnemyPartySize(event.encounter, { tier: bossTier })));
  const party = createEnemyParty(event.encounter, { ...encounters[event.encounter], difficultyTier: bossTier, partySize });
  party.forEach((unit, index) => {
    unit.passGuardian = true;
    unit.difficultyTier = bossTier.label;
    if (index === 0) {
      unit.name = event.guardName || `${unit.name} Warden`;
      unit.passBoss = true;
      unit.maxHp = Math.round(unit.maxHp * (firstRidge ? 1.04 : 1.42) + (firstRidge ? 2 : 8));
      unit.hp = unit.maxHp;
      unit.atk += firstRidge ? 0 : 2;
      unit.def += firstRidge ? -1 : 1;
      if (!firstRidge) unit.speed += 1;
      unit.reward = Math.round((unit.reward || 0) * (firstRidge ? 1.18 : 1.45));
    } else {
      unit.name = `${event.passName} ${unit.name}`;
      unit.maxHp = Math.round(unit.maxHp * (firstRidge ? 0.76 : 1.1));
      unit.hp = unit.maxHp;
      unit.atk += firstRidge ? -1 : 1;
      if (firstRidge) unit.def = Math.max(1, unit.def - 1);
      unit.reward = Math.round((unit.reward || 0) * (firstRidge ? 1.05 : 1.15));
    }
  });
  return party;
}

function createEnemyParty(encounterId, sourceEnemy = null) {
  const base = structuredClone(sourceEnemy || encounters[encounterId]);
  const campaignTier = campaignDifficultyTier();
  const regionRank = sourceEnemy ? 0 : regionalThreatRank();
  const effectiveRank = Math.max(campaignTier.rank, regionRank);
  const tier = sourceEnemy?.difficultyTier || { ...campaignTier, rank: effectiveRank, label: difficultyLabelForRank(effectiveRank) };
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
      const hpScale = index === 0 ? 1 + tier.rank * 0.12 : 0.76 + tier.rank * 0.1;
      unit.maxHp = Math.max(8, Math.round(unit.maxHp * hpScale));
      unit.hp = unit.maxHp;
      unit.atk = Math.max(2, unit.atk - (index === 0 ? 0 : 1) + tier.rank);
      unit.def = Math.max(0, unit.def - (index === 0 ? 0 : 1) + Math.ceil(tier.rank / 2));
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

function difficultyLabelForRank(rank) {
  if (rank >= 2) return "Hard";
  if (rank >= 1) return "Medium";
  return "Easy";
}

function regionalThreatRank(regionId = currentRegionId()) {
  return {
    dawnhaven_march: 0,
    central_kingdom: 0,
    low_roads: 1,
    high_march: 1,
    southern_wilds: 1,
    black_gate_approach: 2,
  }[regionId] || 0;
}

function desiredEnemyPartySize(encounterId, options = {}) {
  const tier = options.tier || campaignDifficultyTier();
  const base = { goblin: 2, basilisk: 2, raiders: 3, wyvern: 2, knight: 2, warlock: 2, tideGuard: 2, gatekeeper: 4, rival: 5 }[encounterId] || 2;
  const armyPressure = Math.max(0, Math.floor((state.party.length - 1) / 2));
  if (options.night) {
    const planId = options.nightPlan || currentNightPlanId();
    const nightBonus = planId === "nightRaid" ? 1 : 0;
    const nightCap = planId === "holdfast" ? 2 : planId === "nightRaid" ? Math.min(4, 2 + tier.rank) : Math.min(3, 2 + tier.rank);
    return Math.max(1, Math.min(BATTLE_ROWS, nightCap, base + Math.min(1, tier.rank) + Math.min(1, armyPressure) + nightBonus - 1));
  }
  const nightBonus = options.night ? 1 : 0;
  const cap = encounterId === "rival" || encounterId === "gatekeeper" ? 5 : tier.rank === 0 ? 3 : tier.rank === 1 ? 4 : 5;
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
  if (event.passName) {
    const firstRidge = event.passName === "Ashbell Ridge";
    return {
      kind: "passGuardian",
      shieldCharges: firstRidge ? 0 : 1,
      introPass: firstRidge,
      rallied: false,
    };
  }
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
  const showBattleHint = !state.tutorial?.battleBasics && event.type !== "night";
  state.tutorial ??= {};
  if (showBattleHint) state.tutorial.battleBasics = true;
  activeBattle = {
    key,
    event,
    enemies,
    reward: battleGoldReward(event, enemies),
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
    effects: [],
    log: [`${enemyNames} engage your party.${trapLine}`],
    bossState: createBossBattleState(event),
    usedSpecials: {},
    auto: false,
    showBattleHint,
  };
  clearAutoBattleTimer();
  buildBattleQueue();
  modal.classList.remove("victory-modal", "town-modal", "trade-modal", "barracks-modal", "notice-modal", "night-modal", "name-modal", "boss-preview-modal", "boss-aftermath-modal");
  modal.classList.add("battle-modal");
  advanceBattleTurn();
  renderBattle();
  if (!modal.open) modal.showModal();
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
      const special = playerSpecialDefinition(activeUnit, activeBattle.selectedIndex);
      if (special) {
        const specialButton = document.createElement("button");
        specialButton.type = "button";
        specialButton.className = "secondary battle-action battle-action-special";
        specialButton.disabled = !canUsePlayerSpecial(activeUnit, activeBattle.selectedIndex);
        specialButton.innerHTML = `<i class="battle-action-icon" aria-hidden="true"></i><span>${activeUnit.name}</span><b>${special.name}</b>`;
        specialButton.setAttribute("aria-label", `${activeUnit.name} uses ${special.name}`);
        specialButton.addEventListener("click", () => usePlayerSpecial(activeBattle.selectedIndex));
        modalActions.appendChild(specialButton);
      }
      const targetIndex = currentBattleTargetIndex();
      const target = activeBattle.enemies[targetIndex];
      const canAttack = Number.isInteger(targetIndex) && targetIndex >= 0 && canActiveUnitAttackEnemy(targetIndex);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "battle-action battle-action-attack";
      button.disabled = !canAttack;
      button.innerHTML = `<i class="battle-action-icon" aria-hidden="true"></i><span>${activeUnit.name}${target ? ` -> ${target.name}` : ""}</span><b>${battleAttackButtonText(activeUnit, targetIndex)}</b>`;
      button.setAttribute("aria-label", canAttack ? `${activeUnit.name} attacks ${target.name}` : `${activeUnit.name} has no enemy in attack range`);
      button.addEventListener("click", () => selectedBattleAttack());
      modalActions.appendChild(button);
    }
    const potionCount = inventoryCount("healingDraught");
    const injured = partyMissingHp();
    const potion = document.createElement("button");
    potion.type = "button";
    potion.className = "secondary battle-action battle-action-potion";
    potion.innerHTML = `<i class="battle-action-icon" aria-hidden="true"></i><span>x${potionCount}</span><b>Heal</b>`;
    potion.disabled = potionCount <= 0 || injured <= 0;
    potion.setAttribute("aria-label", `Use Healing Draught to heal the party for ${HEALING_DRAUGHT_AMOUNT}`);
    potion.addEventListener("click", useBattleHealingDraught);
    modalActions.appendChild(potion);
    const guard = document.createElement("button");
    guard.type = "button";
    guard.className = "secondary battle-action battle-action-guard";
    guard.innerHTML = `<i class="battle-action-icon" aria-hidden="true"></i><span>${activeUnit?.name || "Unit"}</span><b>Guard</b>`;
    guard.setAttribute("aria-label", "Current unit guards against the next enemy attack");
    guard.addEventListener("click", guardBattleAction);
    modalActions.appendChild(guard);
    const auto = document.createElement("button");
    auto.type = "button";
    auto.className = `${activeBattle.auto ? "secondary " : ""}battle-action battle-action-auto`;
    auto.innerHTML = activeBattle.auto
      ? `<i class="battle-action-icon" aria-hidden="true"></i><span>Auto</span><b>Stop</b>`
      : `<i class="battle-action-icon" aria-hidden="true"></i><span>${battleHasBoss() ? "Risky" : "Repeat"}</span><b>Auto</b>`;
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
      stopAuto.innerHTML = `<i class="battle-action-icon" aria-hidden="true"></i><span>Auto Battle</span><b>Stop Auto</b>`;
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
  const effects = battleEffectsMarkup();
  const log = activeBattle.log.slice(-5).map((line) => `<li>${line}</li>`).join("");
  const order = activeBattle.queue.map((actor, index) => `<span class="${index === activeBattle.queueIndex - 1 ? "active" : ""}">${actor.name} ${actor.speed}</span>`).join("");
  return `
    <div class="battle-board">
      ${battleIntroHintMarkup()}
      ${battleFocusMarkup()}
      <div class="turn-order"><b>Turn order</b>${order}</div>
      <div class="battle-layout">
        <div class="battle-arena" aria-label="Battle arena">
          ${battleCampSceneMarkup()}
          <div class="battle-grid">${cells}${teamRows}${enemyRows}${effects}${floaters}</div>
        </div>
        <div class="battle-roster">${battleRosterMarkup()}</div>
      </div>
      <ol class="battle-log">${log}</ol>
    </div>
  `;
}

function battleCampSceneMarkup() {
  if (activeBattle?.event?.type !== "night") return "";
  const props = [];
  if (state.campUpgrades?.watchtower) props.push(`<span class="battle-camp-prop tower" aria-hidden="true"></span>`);
  if (state.campUpgrades?.betterTent) props.push(`<span class="battle-camp-prop tent" aria-hidden="true"></span>`);
  if (state.campUpgrades?.healerFire) props.push(`<span class="battle-camp-prop fire" aria-hidden="true"></span>`);
  if (state.campUpgrades?.traps) props.push(`<span class="battle-camp-prop stakes" aria-hidden="true"></span>`);
  if (!props.length) return `<div class="battle-camp-scene base-only" aria-hidden="true"><span class="battle-camp-prop embers"></span></div>`;
  return `<div class="battle-camp-scene" aria-hidden="true">${props.join("")}</div>`;
}

function battleIntroHintMarkup() {
  if (!activeBattle?.showBattleHint) return "";
  return `
    <section class="battle-tutorial-hint" aria-label="Battle basics">
      <strong>First Battle</strong>
      <span>1. Select a unit. 2. Tap a red enemy or a highlighted lane. 3. Use Attack, Special, Heal, or Guard. Yellow enemy chips show what is coming next.</span>
    </section>
  `;
}

function battleFocusMarkup() {
  if (!activeBattle) return "";
  const activeUnit = selectedBattleUnit();
  const targetIndex = currentBattleTargetIndex();
  const target = activeBattle.enemies[targetIndex];
  const activeEnemy = activeBattle.turn === "enemy" ? activeBattle.enemies[activeBattle.activeActor?.index] : null;
  const actorName = activeBattle.turn === "player" ? activeUnit?.name || "Choose unit" : activeEnemy?.name || "Enemy";
  const actorState = activeBattle.turn === "player"
    ? activeUnit ? `HP ${Math.max(0, activeUnit.hp)}/${activeUnit.maxHp} | ${rangeText(activeUnit)}` : "No active unit"
    : activeEnemy ? `HP ${Math.max(0, activeEnemy.hp)}/${activeEnemy.maxHp} | ${enemyIntentLabel(activeEnemy, activeBattle.activeActor?.index)}` : "Enemy turn";
  const targetName = activeBattle.turn === "player" ? target?.name || "No target" : enemyTargetPreview(activeBattle.activeActor?.index)?.name || "Nearest unit";
  const targetState = activeBattle.turn === "player"
    ? target ? `HP ${Math.max(0, target.hp)}/${target.maxHp}` : "Tap an enemy"
    : enemyTargetPreview(activeBattle.activeActor?.index)?.summary || "Enemy is choosing a target";
  const guidance = activeBattle.turn === "player"
    ? playerBattleGuidance(activeUnit, targetIndex)
    : enemyBattleGuidance(activeBattle.activeActor?.index);
  return `
    <section class="battle-focus" aria-label="Battle focus">
      <article><small>Acting</small><strong>${escapeHtml(actorName)}</strong><span>${escapeHtml(actorState)}</span></article>
      <article><small>Target</small><strong>${escapeHtml(targetName)}</strong><span>${escapeHtml(targetState)}</span></article>
      <article class="battle-focus-guidance"><small>${activeBattle.turn === "player" ? "Your Call" : "Enemy Intent"}</small><strong>${escapeHtml(guidance.title)}</strong><span>${escapeHtml(guidance.text)}</span></article>
    </section>
  `;
}

function playerBattleGuidance(unit, targetIndex) {
  if (!unit) return { title: "Waiting", text: "Select a living unit to continue." };
  const target = activeBattle.enemies[targetIndex];
  if (!target) return { title: "Pick a target", text: "Tap an enemy to preview attack range." };
  if (canActiveUnitAttackEnemy(targetIndex)) return { title: "Attack ready", text: `${unit.name} can hit ${target.name} now.` };
  const pos = activeBattle.positions[activeBattle.selectedIndex];
  const enemyPos = activeBattle.enemyPositions[targetIndex];
  const distance = pos && enemyPos ? attackDistance(pos, enemyPos) : 0;
  return { title: "Reposition", text: `${target.name} is out of range${distance ? ` at distance ${distance}` : ""}. Move onto a blue/red lane first.` };
}

function enemyTargetPreview(enemyIndex) {
  const enemy = activeBattle?.enemies?.[enemyIndex];
  if (!enemy) return null;
  const target = nearestEnemyTarget(enemyIndex, livingTeam());
  if (!target) return null;
  return { name: target.name, summary: `HP ${Math.max(0, target.hp)}/${target.maxHp}` };
}

function enemyBattleGuidance(enemyIndex) {
  const enemy = activeBattle?.enemies?.[enemyIndex];
  if (!enemy) return { title: "Enemy turn", text: "The enemy is choosing an action." };
  if (enemy.sourceEncounter === "rival" && activeBattle.bossState?.kind === "rival" && activeBattle.round >= 2 && activeBattle.bossState.lastBarrageRound !== activeBattle.round) {
    return { title: "Arcane Barrage", text: "Orius is about to hit the whole party." };
  }
  if (shouldUseEnemySpecial(enemy, enemyIndex)) return { title: enemySpecialName(enemy), text: enemySpecialIntentText(enemy) };
  const target = nearestEnemyTarget(enemyIndex, livingTeam());
  const enemyPos = activeBattle.enemyPositions[enemyIndex];
  const targetIndex = [state.hero, ...state.party].indexOf(target);
  const targetPos = activeBattle.positions[targetIndex];
  if (target && enemyPos && targetPos && canAttackTarget(enemy, enemyPos, targetPos)) return { title: "Incoming attack", text: `${enemy.name} can strike ${target.name}. Guard can reduce the hit.` };
  return { title: "Advancing", text: `${enemy.name} is moving toward the nearest target.` };
}

function enemyIntentLabel(enemy, enemyIndex) {
  if (!enemy || enemy.hp <= 0) return "Defeated";
  if (activeBattle?.turn === "enemy" && activeBattle.activeActor?.index === enemyIndex) return enemyBattleGuidance(enemyIndex).title;
  if (enemy.attackType === "ranged") return `Ranged ${enemy.attackRange || 3}`;
  if ((enemy.def || 0) >= 7) return "Armored";
  return "Melee";
}

function enemySpecialName(enemy) {
  if (enemy.passBoss) return "Battle Ward";
  return {
    warlock: "Cinder Hex",
    raiders: "Volley Fire",
    basilisk: "Venom Bite",
    wyvern: "Sky Dive",
    knight: "Battle Ward",
    tideGuard: "Battle Ward",
  }[enemy.sourceEncounter] || "Power Strike";
}

function enemySpecialIntentText(enemy) {
  if (enemy.passBoss || ["knight", "tideGuard"].includes(enemy.sourceEncounter)) return "The enemy will rally, gaining stats and healing.";
  if (["warlock", "raiders"].includes(enemy.sourceEncounter)) return "The enemy will pressure multiple party members.";
  return "The enemy will use a stronger single-target attack.";
}

function battleFloatersMarkup() {
  return (activeBattle.floaters || []).slice(-4).map((floater) => `
    <span class="battle-floater ${floater.kind || ""}" style="grid-column:${floater.x + 1};grid-row:${floater.y + 1};--battle-layer:9">${floater.text}</span>
  `).join("");
}

function battleEffectsMarkup() {
  return (activeBattle.effects || []).map((effect) => {
    if (effect.kind === "slash" || effect.kind === "impact") {
      const target = effect.to || effect.from;
      if (!target) return "";
      const left = ((target.x + 0.5) / BATTLE_COLS) * 100;
      const top = ((target.y + 0.5) / BATTLE_ROWS) * 100;
      return `<span class="battle-effect ${effect.kind}" style="left:${left}%;top:${top}%;--battle-layer:8;">
        <img class="battle-effect-sprite melee" src="assets/vfx-melee-slash.svg" alt="" />
        <b></b>
      </span>`;
    }
    const from = effect.from;
    const to = effect.to;
    if (!from || !to) return "";
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const left = ((from.x + 0.5) / BATTLE_COLS) * 100;
    const top = ((from.y + 0.5) / BATTLE_ROWS) * 100;
    const width = (length / BATTLE_COLS) * 100;
    const sprite = effect.kind === "spell" ? "assets/vfx-spell-orb.svg" : "assets/vfx-ranged-bolt.svg";
    return `<span class="battle-effect ${effect.kind}" style="left:${left}%;top:${top}%;width:${Math.max(width, 4)}%;--angle:${angle}rad;--battle-layer:8;">
      <i class="trail"></i>
      <img class="battle-effect-sprite projectile ${effect.kind}" src="${sprite}" alt="" />
      <b class="impact"></b>
    </span>`;
  }).join("");
}

function randomBattleQuip(kind) {
  const lines = battleQuips[kind] || [];
  return lines[Math.floor(Math.random() * lines.length)] || "";
}

function addBattleFloater(x, y, text, kind = "") {
  if (!activeBattle) return;
  activeBattle.floaters = (activeBattle.floaters || []).concat({ x, y, text, kind }).slice(-4);
}

function queueBattleEffect(kind, from, to, duration = 340) {
  if (!activeBattle) return;
  battleEffectId += 1;
  const id = battleEffectId;
  activeBattle.effects = (activeBattle.effects || []).concat([{ id, kind, from, to }]).slice(-8);
  renderBattle();
  window.setTimeout(() => {
    if (!activeBattle?.effects?.length) return;
    activeBattle.effects = activeBattle.effects.filter((effect) => effect.id !== id);
    if (activeBattle) renderBattle();
  }, duration);
}

function queueBattleAttackEffect(attacker, from, to, styleOverride = "") {
  if (!from || !to) return;
  const mode = styleOverride || battleAttackEffectKind(attacker);
  queueBattleEffect(mode, from, to, mode === "slash" ? 620 : 780);
}

function battleAttackEffectKind(attacker) {
  if (!attacker) return "impact";
  if (attacker.attackType === "ranged") {
    return (attacker.power || 0) >= 7 ? "spell" : "shot";
  }
  return "slash";
}

function battleAttackFeedbackStyle(attacker, override = "") {
  if (override === "spell") return "spell";
  if (override === "shot") return "ranged";
  if (override === "slash") return "melee";
  if (!attacker) return "melee";
  return attacker.attackType === "ranged"
    ? ((attacker.power || 0) >= 7 ? "spell" : "ranged")
    : "melee";
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
  const spriteFacingClass = visual?.source === "enemy" && !visual.flipInBattle ? " enemy-faces-left" : " enemy-faces-right";
  const sprite = portrait
    ? `<img class="battle-sprite-img enemy${spriteFacingClass}" src="${portrait}" alt="" />`
    : `<div class="battle-token enemy sprite-${visual?.id || "enemy"}" style="--unit-color:${enemy.color || "#d95d5d"}"></div>`;
  const pos = activeBattle.enemyPositions[index];
  const selected = !defeated && activeBattle.selectedEnemyIndex === index;
  const intentChip = battleEnemyIntentChip(enemy, index, selected);
  return `
    <button type="button" class="battle-combatant battle-enemy battle-facing-left ${defeated ? "down" : ""} ${selected ? "selected" : ""} ${attackable ? "attackable" : ""} ${feedbackClass}" data-battle-enemy="${index}" style="grid-column:${pos.x + 1};grid-row:${pos.y + 1};--battle-layer:${pos.y + 2}" aria-label="${defeated ? `${enemy.name} defeated` : `Target ${enemy.name}`}" ${defeated ? "disabled" : ""}>
      <div class="battle-base">${sprite}</div>
      ${intentChip}
      ${attackable ? `<span class="battle-attack-icon" aria-hidden="true">&#9876;</span>` : ""}
      <div class="battle-mini-hp danger" style="--fill:${fill}%"><span></span></div>
    </button>
  `;
}

function battleEnemyIntentChip(enemy, index, selected) {
  if (!enemy || enemy.hp <= 0) return "";
  const active = activeBattle.turn === "enemy" && activeBattle.activeActor?.index === index;
  if (!active && !selected) return "";
  const label = active ? enemyIntentLabel(enemy, index) : "Target";
  return `<span class="battle-intent-chip ${active ? "active" : ""}">${escapeHtml(label)}</span>`;
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

function battleUnitKey(index) {
  return index === 0 ? "hero" : `party:${[state.hero, ...state.party][index]?.id || index}`;
}

function usedSpecialSet() {
  activeBattle.usedSpecials ??= {};
  return activeBattle.usedSpecials;
}

function specialUsed(key) {
  return Boolean(usedSpecialSet()[key]);
}

function markSpecialUsed(key) {
  usedSpecialSet()[key] = true;
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
  const special = playerSpecialDefinition(activeUnit, activeIndex);
  const autoSpecial = shouldAutoUsePlayerSpecial(activeUnit, activeIndex);
  if (autoSpecial && special?.type === "heal") {
    usePlayerSpecial(activeIndex);
    return;
  }
  if (emergencyHeal) {
    useBattleHealingDraught();
    return;
  }
  if (autoSpecial) {
    usePlayerSpecial(activeIndex);
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

function expectedPlayerSpecialDamage(unit, enemy, fromPos, enemyPos, special) {
  if (!unit || !enemy || !fromPos || !enemyPos || !special || ["heal", "guard"].includes(special.type)) return 0;
  const penalty = rangedDamagePenalty(unit, fromPos, enemyPos);
  const bonus = special.type === "magic" ? Math.ceil((unit.power || 0) * 0.9) + 3
    : special.type === "pierce" ? Math.ceil((unit.power || 0) * 0.5) + 4
      : Math.ceil((unit.power || 0) * 0.6) + 3;
  const defense = special.type === "pierce" ? Math.floor((enemy.def || 0) * 0.45) : Math.floor((enemy.def || 0) * 0.75);
  return Math.max(3, unit.atk + bonus + (unit.level || 1) - defense - penalty);
}

function shouldAutoUsePlayerSpecial(unit, unitIndex) {
  const special = playerSpecialDefinition(unit, unitIndex);
  if (!special || !canUsePlayerSpecial(unit, unitIndex)) return false;
  if (special.type === "heal") {
    const missing = partyMissingHp();
    return missing >= Math.max(10, Math.round(totalPartyMaxHp() * 0.22))
      || [state.hero, ...state.party].some((member) => member.hp > 0 && member.hp / member.maxHp <= 0.42);
  }
  if (special.type === "guard") {
    return battleHasBoss()
      || activeBattle.round >= 2 && livingEnemies().length >= 3
      || [state.hero, ...state.party].some((member) => member.hp > 0 && member.hp / member.maxHp <= 0.38);
  }
  const targetIndex = chooseAutoBattleTarget(unitIndex);
  if (targetIndex < 0) return false;
  const enemy = activeBattle.enemies[targetIndex];
  const enemyPos = activeBattle.enemyPositions[targetIndex];
  const fromPos = attackPositionForTarget(unit, unitIndex, enemyPos) || activeBattle.positions[unitIndex];
  const normalDamage = expectedPlayerDamage(unit, enemy, fromPos, enemyPos);
  const specialDamage = expectedPlayerSpecialDamage(unit, enemy, fromPos, enemyPos, special);
  if (specialDamage >= enemy.hp) return true;
  if (battleHasBoss() && specialDamage >= Math.max(5, normalDamage + 2)) return true;
  if (["magic", "pierce"].includes(special.type) && (enemy.def || 0) >= 4 && specialDamage >= normalDamage + 3) return true;
  return activeBattle.round >= 2 && livingEnemies().length >= 2 && specialDamage >= normalDamage + 5;
}

function totalPartyMaxHp() {
  return [state.hero, ...state.party].reduce((sum, unit) => sum + Math.max(0, unit.maxHp || 0), 0);
}

function playerSpecialDefinition(unit, unitIndex) {
  const id = unitIndex === 0 ? "hero" : unit.id;
  const definitions = {
    hero: { name: state.hero.attackType === "ranged" ? "Sun Bolt" : "Daylight Cleave", type: "strike" },
    leafFox: { name: "Vine Snap", type: "strike" },
    thornArcher: { name: "Briar Shot", type: "pierce" },
    emberGolem: { name: "Cinder Fist", type: "strike" },
    ironPikeman: { name: "Shield Wall", type: "guard" },
    tideWisp: { name: "Foam Guard", type: "heal" },
    reefGuard: { name: "Tide Spear", type: "pierce" },
    duskMoth: { name: "Moon Dust", type: "hex" },
    moonSeer: { name: "Star Bolt", type: "magic" },
    bloomStag: { name: "Antler Charge", type: "strike" },
    cinderMage: { name: "Coal Flare", type: "magic" },
    coralArcher: { name: "Reef Shot", type: "pierce" },
    nightblade: { name: "Shadow Dive", type: "strike" },
  };
  return definitions[id] || null;
}

function canUsePlayerSpecial(unit, unitIndex) {
  if (!activeBattle || activeBattle.turn !== "player" || activeBattle.activeActor?.index !== unitIndex) return false;
  const pos = activeBattle.positions[unitIndex];
  if (!unit || unit.hp <= 0 || !pos || pos.acted || specialUsed(battleUnitKey(unitIndex))) return false;
  const special = playerSpecialDefinition(unit, unitIndex);
  if (!special) return false;
  if (special.type === "heal" || special.type === "guard") return true;
  return chooseAutoBattleTarget(unitIndex) >= 0;
}

function usePlayerSpecial(unitIndex) {
  const unit = [state.hero, ...state.party][unitIndex];
  const special = playerSpecialDefinition(unit, unitIndex);
  if (!canUsePlayerSpecial(unit, unitIndex) || !special) return renderBattle();
  markSpecialUsed(battleUnitKey(unitIndex));
  if (special.type === "heal") return useSupportSpecial(unit, unitIndex, special);
  if (special.type === "guard") return useGuardSpecial(unit, unitIndex, special);
  const targetIndex = chooseAutoBattleTarget(unitIndex);
  if (targetIndex < 0) return renderBattle();
  activeBattle.selectedEnemyIndex = targetIndex;
  const enemy = activeBattle.enemies[targetIndex];
  const enemyPos = activeBattle.enemyPositions[targetIndex];
  const pos = activeBattle.positions[unitIndex];
  const attackPos = attackPositionForTarget(unit, unitIndex, enemyPos);
  if (attackPos && (attackPos.x !== pos.x || attackPos.y !== pos.y)) {
    pos.x = attackPos.x;
    pos.y = attackPos.y;
    activeBattle.log.push(`${unit.name} moves into special range.`);
  }
  const penalty = rangedDamagePenalty(unit, pos, enemyPos);
  const bonus = special.type === "magic" ? Math.ceil((unit.power || 0) * 0.9) + 3
    : special.type === "pierce" ? Math.ceil((unit.power || 0) * 0.5) + 4
      : Math.ceil((unit.power || 0) * 0.6) + 3;
  const defense = special.type === "pierce" ? Math.floor((enemy.def || 0) * 0.45) : Math.floor((enemy.def || 0) * 0.75);
  const damage = Math.max(3, unit.atk + bonus + (unit.level || 1) - defense - penalty);
  enemy.hp = Math.max(0, enemy.hp - damage);
  const effectStyle = special.type === "magic" ? "spell" : special.type === "pierce" ? "shot" : "";
  activeBattle.feedback = { type: "hit", unitIndex, enemyIndex: targetIndex, target: "enemy", style: battleAttackFeedbackStyle(unit, effectStyle) };
  queueBattleAttackEffect(unit, pos, enemyPos, effectStyle);
  addBattleFloater(enemyPos.x, enemyPos.y, `-${damage}`, special.type === "magic" ? "magic" : "damage");
  playSfx(special.type === "magic" ? "spell" : special.type === "pierce" ? "shot" : "slash");
  activeBattle.log.push(`${unit.name} uses ${special.name} on ${enemy.name} for ${damage}.`);
  if (enemy.hp <= 0) {
    enemy.hp = 0;
    activeBattle.log.push(`${enemy.name} falls.`);
    normalizeSelectedBattleEnemy();
  }
  renderBattle();
  if (!livingEnemies().length) return queueBattleFollowthrough(() => finishBattle(true));
  queueBattleFollowthrough(() => finishBattleUnitAction());
}

function useSupportSpecial(unit, unitIndex, special) {
  const amount = Math.max(8, Math.round((unit.power || 4) * 2.4));
  [state.hero, ...state.party].forEach((member, index) => {
    if (member.hp <= 0) return;
    const before = member.hp;
    member.hp = Math.min(member.maxHp, member.hp + amount);
    const healed = member.hp - before;
    const pos = activeBattle.positions[index];
    if (healed > 0 && pos) addBattleFloater(pos.x, pos.y, `+${healed}`, "heal");
  });
  activeBattle.feedback = { type: "guard", unitIndex };
  playSfx("coin");
  activeBattle.log.push(`${unit.name} casts ${special.name}. The party recovers.`);
  finishBattleUnitAction();
}

function useGuardSpecial(unit, unitIndex, special) {
  activeBattle.guarding = true;
  activeBattle.teamWard = Math.max(activeBattle.teamWard || 0, 2);
  const pos = activeBattle.positions[unitIndex];
  if (pos) addBattleFloater(pos.x, pos.y, "Ward", "guard");
  playSfx("guard");
  activeBattle.log.push(`${unit.name} uses ${special.name}. The line braces behind a ward.`);
  finishBattleUnitAction();
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
  if (feedback.type === "hit") {
    if (feedback.style === "spell") return "battle-feedback-spell";
    if (feedback.style === "ranged") return "battle-feedback-ranged";
    return "battle-feedback-attack";
  }
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
  if (unit.id && unitArtReady(unit.id) && unitCell(unit.id, 0)) return getUnitPortraitDataUrl(unit.id);
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
  if (visual?.source === "unit" && unitArtReady(visual.id)) return getUnitPortraitDataUrl(visual.id);
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

function queueBattleFollowthrough(callback, delay = BATTLE_HIT_PAUSE_MS) {
  window.setTimeout(() => {
    if (!activeBattle) return;
    callback();
  }, delay);
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
  if (enemy.passBoss && activeBattle.bossState?.kind === "passGuardian" && activeBattle.bossState.shieldCharges > 0) {
    const absorbed = Math.min(Math.max(0, damage - 1), 5);
    damage = Math.max(1, damage - absorbed);
    activeBattle.bossState.shieldCharges -= 1;
    bossNote = ` The pass ward absorbs ${absorbed}.`;
    addBattleFloater(enemyPos.x, enemyPos.y, "Ward", "guard");
  } else if (enemy.sourceEncounter === "gatekeeper" && activeBattle.bossState?.kind === "gatekeeper" && activeBattle.bossState.shieldCharges > 0) {
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
  const effectStyle = battleAttackFeedbackStyle(attacker);
  activeBattle.feedback = { type: "hit", unitIndex: attackerIndex, enemyIndex, target: "enemy", style: effectStyle };
  queueBattleAttackEffect(attacker, attackerPos, enemyPos);
  enemy.hp -= damage;
  addBattleFloater(enemyPos.x, enemyPos.y, `-${damage}`, "damage");
  playSfx(effectStyle === "spell" ? "spell" : effectStyle === "ranged" ? "shot" : "slash");
  activeBattle.log.push(`${attacker.name} hits ${enemy.name} for ${damage}${penalty ? ` (${penalty} range penalty)` : ""}.${bossNote} ${randomBattleQuip("playerHit")}`);
  if (enemy.hp > 0) maybeTriggerBossPhase(enemyIndex);
  if (enemy.hp <= 0) {
    enemy.hp = 0;
    activeBattle.log.push(`${enemy.name} falls. ${randomBattleQuip("enemyDown")}`);
    normalizeSelectedBattleEnemy();
  }
  renderBattle();
  if (!livingEnemies().length) return queueBattleFollowthrough(() => finishBattle(true));
  queueBattleFollowthrough(() => finishBattleUnitAction());
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
  if (enemy.passBoss && activeBattle.bossState?.kind === "passGuardian" && !activeBattle.bossState.introPass && !activeBattle.bossState.rallied && enemy.hp <= Math.ceil(enemy.maxHp * 0.5)) {
    activeBattle.bossState.rallied = true;
    enemy.atk += 2;
    enemy.def += 1;
    activeBattle.enemies.forEach((ally, index) => {
      if (index !== enemyIndex && ally.hp > 0) ally.atk += 1;
    });
    activeBattle.log.push(`${enemy.name} plants the pass banner and rallies the guard line.`);
    if (enemyPos) addBattleFloater(enemyPos.x, enemyPos.y, "Rally", "attack");
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
  if (shouldUseEnemySpecial(enemy, enemyIndex)) return performEnemySpecial(enemyIndex);
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
    if (enemyPos && targetPos) queueBattleEffect("spell", enemyPos, targetPos, 420);
    unit.hp = Math.max(0, unit.hp - damage);
    if (targetPos) addBattleFloater(targetPos.x, targetPos.y, `-${damage}`, "damage");
    if (unit.hp <= 0) activeBattle.log.push(`${unit.name} is blasted down by the barrage.`);
  });
  if (enemyPos) addBattleFloater(enemyPos.x, enemyPos.y, "Burst", "attack");
  playSfx("hit");
  activeBattle.guarding = false;
  renderBattle();
  if (!livingTeam().length) return queueBattleFollowthrough(() => finishBattle(false));
  queueBattleFollowthrough(() => {
    advanceBattleTurn();
    renderBattle();
  });
}

function shouldUseEnemySpecial(enemy, enemyIndex) {
  if (!enemy || enemy.hp <= 0 || specialUsed(`enemy:${enemyIndex}`)) return false;
  if (activeBattle.round < 2 && !enemy.passBoss) return false;
  const encounter = enemy.sourceEncounter;
  return ["basilisk", "raiders", "wyvern", "warlock", "knight", "tideGuard"].includes(encounter) || enemy.passBoss;
}

function performEnemySpecial(enemyIndex) {
  const enemy = activeBattle.enemies[enemyIndex];
  const encounter = enemy.sourceEncounter;
  markSpecialUsed(`enemy:${enemyIndex}`);
  if (enemy.passBoss) return enemyRallySpecial(enemyIndex);
  if (encounter === "warlock") return enemyAreaSpell(enemyIndex, "Cinder Hex", 0.62);
  if (encounter === "raiders") return enemyAreaSpell(enemyIndex, "Volley Fire", 0.48);
  if (encounter === "basilisk") return enemySingleSpecial(enemyIndex, "Venom Bite", 3, "fangs");
  if (encounter === "wyvern") return enemySingleSpecial(enemyIndex, "Sky Dive", 4, "dive");
  if (encounter === "knight" || encounter === "tideGuard" || enemy.passBoss) return enemyRallySpecial(enemyIndex);
  return enemySingleSpecial(enemyIndex, "Power Strike", 2, "strike");
}

function enemyAreaSpell(enemyIndex, name, powerScale) {
  const enemy = activeBattle.enemies[enemyIndex];
  const enemyPos = activeBattle.enemyPositions[enemyIndex];
  const targets = livingTeam();
  activeBattle.feedback = { type: "hit", enemyIndex, target: "enemy" };
  activeBattle.log.push(`${enemy.name} casts ${name} across the line.`);
  targets.forEach((unit) => {
    const targetIndex = [state.hero, ...state.party].indexOf(unit);
    const pos = activeBattle.positions[targetIndex];
    const ward = consumeTeamWard();
    const damage = Math.max(2, Math.round((enemy.power || 4) * powerScale + activeBattle.round - (unit.def || 0) * 0.25 - ward));
    if (enemyPos && pos) queueBattleEffect(enemy.sourceEncounter === "raiders" ? "shot" : "spell", enemyPos, pos, 400);
    unit.hp = Math.max(0, unit.hp - damage);
    if (pos) addBattleFloater(pos.x, pos.y, `-${damage}`, "magic");
    if (unit.hp <= 0) activeBattle.log.push(`${unit.name} falls to ${name}.`);
  });
  if (enemyPos) addBattleFloater(enemyPos.x, enemyPos.y, "Spell", "magic");
  playSfx("hit");
  activeBattle.guarding = false;
  renderBattle();
  if (!livingTeam().length) return queueBattleFollowthrough(() => finishBattle(false));
  queueBattleFollowthrough(() => {
    advanceBattleTurn();
    renderBattle();
  });
}

function enemySingleSpecial(enemyIndex, name, bonusDamage, note) {
  const targets = livingTeam();
  const target = nearestEnemyTarget(enemyIndex, targets);
  const targetIndex = [state.hero, ...state.party].indexOf(target);
  const enemy = activeBattle.enemies[enemyIndex];
  const moved = moveEnemyTowardTarget(enemyIndex, target);
  if (moved) activeBattle.log.push(`${enemy.name} dives toward ${target.name}.`);
  const enemyPos = activeBattle.enemyPositions[enemyIndex];
  const targetPos = activeBattle.positions[targetIndex];
  if (!canAttackTarget(enemy, enemyPos, targetPos)) {
    activeBattle.feedback = { type: "move", enemyIndex, target: "enemy" };
    activeBattle.log.push(`${enemy.name} prepares ${name} but cannot reach ${target.name} yet.`);
    advanceBattleTurn();
    return renderBattle();
  }
  activeBattle.enemySpecial = { bonusDamage, note: ` (${note})` };
  activeBattle.log.push(`${enemy.name} prepares ${name}.`);
  resolveEnemyAttack(enemyIndex, targetIndex);
}

function enemyRallySpecial(enemyIndex) {
  const enemy = activeBattle.enemies[enemyIndex];
  const pos = activeBattle.enemyPositions[enemyIndex];
  enemy.def += 1;
  enemy.atk += 1;
  enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.max(4, Math.round((enemy.power || 4) * 0.8)));
  activeBattle.feedback = { type: "guard", enemyIndex, target: "enemy" };
  if (pos) addBattleFloater(pos.x, pos.y, "Rally", "guard");
  playSfx("guard");
  activeBattle.log.push(`${enemy.name} rallies behind a battle ward: +1 attack, +1 defense, and a small heal.`);
  advanceBattleTurn();
  renderBattle();
}

function consumeTeamWard() {
  const ward = activeBattle.teamWard || 0;
  if (ward > 0) activeBattle.teamWard = Math.max(0, ward - 1);
  return ward;
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
  const guardReduction = activeBattle.guarding ? 2 : 0;
  const penalty = rangedDamagePenalty(enemy, enemyPos, targetPos);
  const partyCourage = Math.min(1, Math.floor(Math.max(0, livingTeam().length - 2) / 3));
  const gatekeeperCrush = enemy.sourceEncounter === "gatekeeper" && activeBattle.bossState?.kind === "gatekeeper" && activeBattle.bossState.enraged;
  const passBossCrush = enemy.passBoss && activeBattle.bossState?.kind === "passGuardian" && activeBattle.bossState.rallied;
  const trait = enemyAttackTraitBonus(enemy, targetIndex);
  const special = activeBattle.enemySpecial || { bonusDamage: 0, note: "" };
  activeBattle.enemySpecial = null;
  const ward = consumeTeamWard();
  const damage = Math.max(1, enemy.atk - (resolvedTarget.def || 1) - guardReduction - partyCourage - ward - penalty * 2 + (gatekeeperCrush ? 3 : 0) + (passBossCrush ? 2 : 0) + trait.damage + special.bonusDamage + Math.floor(Math.random() * 3));
  const effectStyle = special.note.includes("fangs") || special.note.includes("dive") || gatekeeperCrush || passBossCrush
    ? "slash"
    : battleAttackEffectKind(enemy);
  activeBattle.feedback = { type: "hit", unitIndex: targetIndex, enemyIndex, target: "unit", style: battleAttackFeedbackStyle(enemy, effectStyle) };
  queueBattleAttackEffect(enemy, enemyPos, targetPos, effectStyle);
  resolvedTarget.hp -= damage;
  if (resolvedTarget.hp <= 0) resolvedTarget.hp = 0;
  addBattleFloater(targetPos.x, targetPos.y, `-${damage}`, "damage");
  playSfx(effectStyle === "spell" ? "spell" : effectStyle === "shot" ? "shot" : "slash");
  activeBattle.log.push(`${enemy.name} ${gatekeeperCrush || passBossCrush ? "crushes" : "strikes"} ${resolvedTarget.name} for ${damage}${penalty ? ` (${penalty} range penalty)` : ""}${trait.note}${special.note}${ward ? " (warded)" : ""}. ${randomBattleQuip("enemyHit")}`);
  if (resolvedTarget.hp <= 0) activeBattle.log.push(`${resolvedTarget.name} falls.`);
  activeBattle.guarding = false;
  renderBattle();
  if (!livingTeam().length) return queueBattleFollowthrough(() => finishBattle(false));
  queueBattleFollowthrough(() => {
    advanceBattleTurn();
    renderBattle();
  });
}

function enemyAttackTraitBonus(enemy, targetIndex) {
  const encounter = enemy.sourceEncounter;
  const isolated = isBattleUnitIsolated(targetIndex);
  if ((encounter === "goblin" || encounter === "wyvern") && isolated) return { damage: 3, note: " (isolated)" };
  if (encounter === "basilisk") return { damage: activeBattle.round >= 2 ? 2 : 1, note: " (venom)" };
  if ((encounter === "raiders" || encounter === "warlock") && targetIndex > 0 && !activeBattle.guarding) return { damage: 3, note: " (backline pressure)" };
  if (encounter === "knight" || encounter === "tideGuard") return { damage: activeBattle.round >= 2 ? 1 : 0, note: activeBattle.round >= 2 ? " (formation grind)" : "" };
  return { damage: 0, note: "" };
}

function isBattleUnitIsolated(targetIndex) {
  const targetPos = activeBattle?.positions?.[targetIndex];
  if (!targetPos) return false;
  return activeBattle.positions.every((pos, index) => {
    if (index === targetIndex || !pos || [state.hero, ...state.party][index]?.hp <= 0) return true;
    return attackDistance(targetPos, pos) > 1;
  });
}

function nearestEnemyTarget(enemyIndex, targets) {
  const team = [state.hero, ...state.party];
  const enemy = activeBattle.enemies[enemyIndex];
  const enemyPos = activeBattle.enemyPositions[enemyIndex];
  return targets
    .map((unit) => {
      const index = team.indexOf(unit);
      const pos = activeBattle.positions[index];
      const distance = battleDistance(enemyPos, pos, enemy);
      const attackable = canAttackTarget(enemy, enemyPos, pos);
      const wounded = 1 - Math.max(0, unit.hp || 0) / Math.max(1, unit.maxHp || 1);
      return { unit, distance, attackable, wounded };
    })
    .sort((a, b) => Number(b.attackable) - Number(a.attackable) || a.distance - b.distance || b.wounded - a.wounded || a.unit.name.localeCompare(b.unit.name))[0].unit;
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
    const xpReport = gainXp(battleXpReward(event, leader, enemies));
    if (event.type !== "night") state.visited[key] = true;
    if (event.type === "townClaim" && event.townKey) {
      const town = getTownState(event.townKey);
      town.owner = "player";
      state.visited[event.townKey] = true;
      rememberRespawnPoint(event.townKey, events.get(event.townKey) || { type: "town", name: event.townName });
      setMessage(`${event.townName || "The town"} is claimed after battle.`);
      openModal("Town Claimed", `${event.townName || "The town"} raises your banner. Reward: ${reward} gold and ${xpReport.amount} XP.`, [{ label: "Enter Town", action: () => resolvePostBattleProgression(() => reopenTownModal(event.townKey, events.get(event.townKey) || event)) }]);
      return renderAll();
    }
    if (event.type === "roamingHero" && event.roamingHeroId) {
      const roamingHero = state.enemyHeroes?.find((hero) => hero.id === event.roamingHeroId);
      if (roamingHero) roamingHero.defeated = true;
    }
    if (event.type === "chestGuard" && event.chestKey) {
      state.visited[chestGuardianKey(event.chestKey)] = true;
      const chest = events.get(event.chestKey);
      const itemText = chest?.item ? ` The cache holding ${chest.item} can now be opened.` : "";
      setMessage(`${enemyLabel} defeated. The guarded cache is open.`);
      return resolvePostBattleProgression(() => openModal("Guard Broken", `${log.slice(-3).join(" ")} Reward: ${reward} gold and ${xpReport.amount} XP.${itemText}`, [
        { label: "Open Cache", action: () => chest ? chestEvent(event.chestKey, chest) : renderAll() },
        { label: "Leave It", secondary: true, action: () => renderAll() },
      ]));
    }
    if (event.type === "final") {
      return triggerVictory("military", "DAYLIGHT VICTORY", finalVictoryMarkup(enemyLabel, reward, xpReport.amount), { html: true, className: "victory-modal boss-aftermath-modal" });
    } else if (event.gate) {
      setMessage("The Black Gate Warden falls. The fortress pass is finally open.");
      openModal("Pass Cleared", gateAftermathMarkup(reward, xpReport.amount), [
        { label: "Stand Before Fortress", action: () => resolvePostBattleProgression() },
      ], { html: true, className: "boss-aftermath-modal" });
    } else if (event.passName) {
      setMessage(`${event.passName} is clear. The road through this biome is open.`);
      openModal("Pass Cleared", battleAftermathMarkup("Biome Pass Secured", log, reward, xpReport.amount, [
        ["Road Open", `${event.passName} is now safe to cross.`],
        ["Region Access", "The next biome is no longer gated by this guardian."],
      ]), [
        { label: "Continue", action: () => resolvePostBattleProgression() },
      ], { html: true, className: "boss-aftermath-modal" });
    } else if (event.type === "night") {
      if (activeNight?.report) {
        activeNight.report.nightRewardGold += reward;
        activeNight.report.nightRewardXp += xpReport.amount;
      }
      const lootDrop = maybeGrantNightRaidLoot();
      const holdText = lootDrop ? `The party survives this night wave, keeps its supplies, and recovers ${lootDrop}.` : "The party survives this night wave and keeps its supplies.";
      setMessage(`${enemyLabel} defeated before dawn.`);
      openModal("Camp Defended", battleAftermathMarkup("Night Threat Broken", log, reward, xpReport.amount, [
        ["Camp Holds", holdText],
        ["Watch Continues", "Any remaining night threats still need to be handled before dawn."],
      ]), [{ label: "Continue Watch", action: () => resolvePostBattleProgression() }], { html: true, className: "boss-aftermath-modal" });
    } else {
      setMessage(`${enemyLabel} defeated. Gained ${reward} gold.`);
      openModal("Victory", battleAftermathMarkup("Outpost Cleared", log, reward, xpReport.amount, battleChangeCards(event)), [{ label: "Done", action: () => resolvePostBattleProgression() }], { html: true, className: "boss-aftermath-modal" });
    }
  } else {
    const wasNightBattle = event.type === "night";
    const respawn = currentRespawnPoint();
    state.gold = Math.max(0, state.gold - 30);
    state.x = respawn.x;
    state.y = respawn.y;
    revealAroundPlayer();
    visual = { x: state.x, y: state.y, fromX: state.x, fromY: state.y, toX: state.x, toY: state.y, moving: false, startedAt: 0, progress: 0 };
    terrainCache = null;
    camera = { x: 0, y: 0, originX: 0, originY: 0, key: "" };
    state.hero.hp = Math.ceil(state.hero.maxHp / 2);
    state.party.forEach((unit) => (unit.hp = Math.ceil(unit.maxHp / 2)));
    if (wasNightBattle) abandonNightAfterDefeat();
    setMessage(wasNightBattle ? `Night defeat. You retreat to ${respawn.name} by dawn and lose 30 gold.` : `Defeat. You retreat to ${respawn.name} and lose 30 gold.`);
    openModal("Defeat", wasNightBattle ? `Your camp breaks before dawn. The party retreats to ${respawn.name} and loses 30 gold.` : `Your party collapses and retreats to ${respawn.name}. You lose 30 gold.`, [{ label: "Recover", action: () => renderAll() }]);
  }
  renderAll();
}

function maybeGrantNightRaidLoot() {
  if (!activeNight || activeNight.plan !== "nightRaid") return "";
  const chance = Math.min(0.45, 0.18 + (state.nightStreak || 0) * 0.05);
  if (Math.random() > chance) return "";
  addInventoryItem("healingDraught", 1);
  if (activeNight.report && !activeNight.report.itemDrop) activeNight.report.itemDrop = "a Healing Draught";
  return "a Healing Draught";
}

function battleChangeCards(event) {
  if (event.guards?.length) return [["Guard Removed", "Nearby loot is now reachable."], ["Map Progress", "This guarded pocket no longer blocks the cache."]];
  if (event.type === "roamingHero") return [["Rival Removed", "This roaming hero will no longer patrol the map."], ["Safer Travel", "Nearby routes are less contested."]];
  if (event.type === "townClaim") return [["Town Claimed", "Your banner now controls this town."], ["New Services", "Town actions, buildings, and recruitment are unlocked here."]];
  return [["Outpost Cleared", "This enemy is removed from the map."], ["Fortress Progress", "Cleared outposts count toward opening the Black Gate Warden fight."]];
}

function battleAftermathMarkup(title, log, reward, xp, cards) {
  const changes = cards.map(([label, text]) => `<article><small>${escapeHtml(label)}</small><strong>${escapeHtml(text)}</strong></article>`).join("");
  return `
    <div class="boss-aftermath">
      <div class="boss-aftermath-hero">
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(log.slice(-3).join(" "))}</p>
      </div>
      <div class="boss-aftermath-grid">
        <article><small>Reward</small><strong>${reward} gold</strong><p>Immediate resources for recruiting, building, and recovery.</p></article>
        <article><small>Experience</small><strong>${xp} XP</strong><p>Your warband grows stronger from the fight.</p></article>
        ${changes}
      </div>
    </div>
  `;
}

function victoryConditions() {
  return [
    { id: "military", title: "Fortress Victory", text: "Defeat Rival Mage Orius inside the northeast fortress.", done: state.won && state.victoryType === "military" },
  ];
}

function checkVictoryConditions() {
  if (state.won) return;
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
    <div class="boss-aftermath gate-aftermath">
      <div class="boss-aftermath-hero">
        <div class="boss-aftermath-emblem gate" aria-hidden="true"><i></i></div>
        <div>
          <strong>Black Gate Broken</strong>
          <p>The Warden collapses in the pass and the road into the fortress finally clears. The campaign state changes here: the march is over, and the siege begins.</p>
        </div>
      </div>
      <ol class="boss-aftermath-progress" aria-label="Fortress campaign progress">
        <li class="done"><strong>Requirements met</strong><span>Relics recovered and outposts cleared.</span></li>
        <li class="done"><strong>Gate boss defeated</strong><span>The Black Gate no longer blocks the road.</span></li>
        <li class="current"><strong>Final fight unlocked</strong><span>Step north into the fortress heart to challenge Orius.</span></li>
      </ol>
      <div class="boss-aftermath-grid">
        <article><small>Reward</small><strong>${reward} gold</strong><p>The pass guardian's stores and escort coin fall into your hands.</p></article>
        <article><small>Experience</small><strong>${xp} XP</strong><p>Your warband has survived the fortress threshold and hardens for the last push.</p></article>
        <article><small>Campaign State</small><strong>Fortress Open</strong><p>Orius is no longer behind rumor or roadblocks. Move one tile north to enter the fortress heart.</p></article>
        <article><small>Objective Changed</small><strong>Defeat Orius</strong><p>The victory condition is now direct: break Rival Mage Orius inside the northeast fortress.</p></article>
      </div>
    </div>
  `;
}

function finalVictoryMarkup(enemyLabel, reward, xp) {
  return `
    <div class="boss-aftermath final-aftermath">
      <div class="boss-aftermath-hero">
        <div class="boss-aftermath-emblem final" aria-hidden="true"><i></i></div>
        <div>
          <strong>Orius Defeated</strong>
          <p>${escapeHtml(enemyLabel)} falls inside the fortress and the whole northeast line breaks with him. The campaign resolves as a conquest, not just another cleared encounter.</p>
        </div>
      </div>
      <ol class="boss-aftermath-progress" aria-label="Final campaign progress">
        <li class="done"><strong>Black Gate opened</strong><span>The fortress approach was broken.</span></li>
        <li class="done"><strong>Orius defeated</strong><span>The fortress heart is yours.</span></li>
        <li class="current"><strong>Realm secured</strong><span>You may continue exploring, but the campaign victory is complete.</span></li>
      </ol>
      <div class="boss-aftermath-grid">
        <article><small>Reward</small><strong>${reward} gold</strong><p>The fortress treasury and war stores are seized at first light.</p></article>
        <article><small>Experience</small><strong>${xp} XP</strong><p>Your army earns the final lessons of the campaign in the fortress heart.</p></article>
        <article><small>Outcome</small><strong>Daylight Victory</strong><p>The road network, towns, and marches now answer to your banner.</p></article>
        <article><small>Campaign State</small><strong>Fortress Claimed</strong><p>Final victory is locked in; remaining exploration is post-campaign cleanup.</p></article>
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
  const available = choices.length ? choices : [{ name: "Veteran", type: "Veteran", icon: "veteran", text: "+1 attack and +1 defense.", apply: () => { state.hero.atk += 1; state.hero.def += 1; } }];
  const cards = available.map((choice, index) => `
    <article class="skill-choice-card skill-${escapeHtml(choice.icon || skillIconKey(choice.name))}">
      <div class="skill-choice-icon" aria-hidden="true"><i></i></div>
      <div>
        <strong>${escapeHtml(choice.name)}</strong>
        <em>${escapeHtml(choice.type || "Veteran")}</em>
        <span>${escapeHtml(choice.text)}</span>
      </div>
      <button type="button" data-skill-choice="${index}">Take ${escapeHtml(choice.name)}</button>
    </article>
  `).join("");
  openModal("Level Up", `<p>${escapeHtml(championName())} reached level ${state.hero.level}. ${escapeHtml(heroLevelSummary())}</p><div class="skill-choice-list">${cards}</div>`, [], { html: true, className: "level-up-modal" });
  modalActions.hidden = true;
  modalText.querySelectorAll("[data-skill-choice]").forEach((button) => {
    button.addEventListener("click", () => learnHeroSkill(available[Number(button.dataset.skillChoice)]));
  });
}

function skillIconKey(name = "") {
  return name.replace(/[^a-z0-9]+/gi, " ").trim().replace(/\s+([a-z0-9])/gi, (_, letter) => letter.toUpperCase()).replace(/^./, (letter) => letter.toLowerCase()) || "veteran";
}

function learnHeroSkill(choice) {
  if (!choice || pendingLevelUps <= 0) return;
  if (modal.open) modal.close();
  modalOpen = false;
  refreshMusicMode();
  choice.apply();
  state.hero.skills.push(choice.name);
  pendingLevelUps -= 1;
  setMessage(`Learned ${choice.name}.`);
  resolvePostBattleProgression();
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
        refreshMusicMode();
      }
      item.action?.();
      if (state.nightReady && !modalOpen && !activeBattle && !activeNight && !state.won) beginNight();
    });
    modalActions.appendChild(button);
  });
  if (!alreadyOpen) modal.showModal();
  options.onRender?.();
  refreshMusicMode();
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
  const zoom = mobileWorldZoom();
  ctx.save();
  ctx.scale(zoom, zoom);
  ctx.fillStyle = "#1e342b";
  ctx.fillRect(0, 0, canvas.width / zoom, canvas.height / zoom);
  drawTerrain();
  drawWorldAtmosphere();
  drawWorldReadabilityOverlays();
  drawWorldEntities();
  drawLocationBanner();
  drawFogOfWar();
  ctx.restore();
  drawObjectiveHint();
}

function mobileWorldZoom() {
  if (!document.documentElement.classList.contains("mobile-touch")) return 1;
  if (window.matchMedia?.("(max-width: 640px)")?.matches) return 1.45;
  if (window.matchMedia?.("(max-width: 900px) and (orientation: landscape)")?.matches) return 1.25;
  return 1;
}

function isMobileTouchLayout() {
  return document.documentElement.classList.contains("mobile-touch")
    && Boolean(window.matchMedia?.("(max-width: 900px)")?.matches);
}

function cameraViewWidth() {
  return VIEW_W / mobileWorldZoom();
}

function cameraViewHeight() {
  return VIEW_H / mobileWorldZoom();
}

function campaignMainObjective() {
  if (state.won) return "Realm secured: explore remaining roads or finish cleanup";
  if (!state.hero.nameChosen) return "Choose your champion";
  if (state.party.length < 2) return `Recruit a second creature (${state.party.length}/2)`;
  const mineCount = countVisitedEvents("mine");
  if (mineCount < 1) return `Claim your first mine (${mineCount}/1)`;
  const elderStatus = state.quests?.elder || "new";
  if (elderStatus === "new") return `Meet Elder Mira at ${coordText(5, 3)}`;
  const townCount = ownedTownEntries().length;
  if (townCount < 2) return `Claim a second town (${townCount}/2)`;
  if (state.day === 1 && !state.nightReady) return "Prepare for your first nightfall";
  if (state.nightReady) return "Make camp and survive the night";
  const gate = fortressGateRequirements();
  if (!gateIntelKnown()) return "Push northeast and ask around High March";
  if (!gate.ready) {
    return gateRequirementsKnown()
      ? `Open Black Gate: ${gate.relicCount}/${gate.relicTarget} relics, ${gate.outpostCount}/${gate.outpostTarget} outposts`
      : "The Black Gate Warden bars the road to Orius";
  }
  if (!finalGateCleared()) return "Push northeast and defeat the Black Gate Warden";
  if (!state.won) return "Fortress open: enter the heart and defeat Orius";
  return "Realm secured: explore remaining roads or finish cleanup";
}

function campaignMainObjectiveShort() {
  if (state.won) return "Finish cleanup";
  if (!state.hero.nameChosen) return "Choose a champion";
  if (state.party.length < 2) return "Recruit one unit";
  const mineCount = countVisitedEvents("mine");
  if (mineCount < 1) return "Claim a mine";
  const elderStatus = state.quests?.elder || "new";
  if (elderStatus === "new") return "Meet Elder Mira";
  const townCount = ownedTownEntries().length;
  if (townCount < 2) return "Claim another town";
  if (state.day === 1 && !state.nightReady) return "Prepare for nightfall";
  if (state.nightReady) return "Start night watch";
  const gate = fortressGateRequirements();
  if (!gateIntelKnown()) return "Reach High March";
  if (!gate.ready) return gateRequirementsKnown() ? "Open Black Gate" : "Learn how to break the Black Gate";
  if (!finalGateCleared()) return "Defeat the gate warden";
  if (!state.won) return "Defeat Orius";
  return "Finish cleanup";
}

function campaignSideObjective() {
  if (state.won) return postVictoryCleanupObjective();
  if (!state.hero.nameChosen) return "";
  const unclaimedQuest = Object.entries(npcQuests).find(([id, quest]) => !state.quests?.[id] && npcQuestAvailable(id, quest) && npcQuestDiscovered(id));
  if (unclaimedQuest) return `Side objective: meet ${unclaimedQuest[1].name}`;
  const activeNpcQuest = Object.entries(npcQuests).find(([id]) => state.quests?.[id] === "accepted" && !npcQuests[id].complete());
  if (activeNpcQuest) return `Side objective: ${activeNpcQuest[1].title} (${activeNpcQuest[1].objective})`;
  const gate = fortressGateRequirements();
  if (!gateIntelKnown()) return scoutingHintText();
  if (gateIntelKnown() && !gateRequirementsKnown()) return "Side objective: scout High March for a way past the warden";
  if (gate.relicCount < gate.relicTarget) return `Side objective: recover relic chests (${gate.relicCount}/${gate.relicTarget})`;
  if (gate.outpostCount < gate.outpostTarget) return `Side objective: clear outposts (${gate.outpostCount}/${gate.outpostTarget})`;
  return scoutingHintText();
}

function campaignSideObjectiveShort() {
  if (state.won) return postVictoryCleanupObjective().replace(/^Cleanup:\s*/i, "");
  if (!state.hero.nameChosen) return "";
  const unclaimedQuest = Object.entries(npcQuests).find(([id, quest]) => !state.quests?.[id] && npcQuestAvailable(id, quest) && npcQuestDiscovered(id));
  if (unclaimedQuest) return `Meet ${unclaimedQuest[1].name}`;
  const activeNpcQuest = Object.entries(npcQuests).find(([id]) => state.quests?.[id] === "accepted" && !npcQuests[id].complete());
  if (activeNpcQuest) return activeNpcQuest[1].title;
  const gate = fortressGateRequirements();
  if (!gateIntelKnown()) return "Follow scout lead";
  if (gateIntelKnown() && !gateRequirementsKnown()) return "Scout High March";
  if (gate.relicCount < gate.relicTarget) return `Recover relics ${gate.relicCount}/${gate.relicTarget}`;
  if (gate.outpostCount < gate.outpostTarget) return `Clear outposts ${gate.outpostCount}/${gate.outpostTarget}`;
  return "Follow scout lead";
}

function postVictoryCleanupObjective() {
  const mineCount = countVisitedEvents("mine");
  const mineTarget = countEvents("mine");
  if (mineCount < mineTarget) return `Cleanup: secure remaining mines (${mineCount}/${mineTarget})`;
  const townCount = ownedTownEntries().length;
  const townTarget = countEvents("town");
  if (townCount < townTarget) return `Cleanup: claim remaining towns (${townCount}/${townTarget})`;
  const battleCount = countVisitedEvents("battle");
  const battleTarget = countEvents("battle");
  if (battleCount < battleTarget) return `Cleanup: clear remaining outposts (${battleCount}/${battleTarget})`;
  return "Cleanup: the realm is fully secured";
}

function campaignHint() {
  const focus = activeFocusObjective();
  return focus.detail ? `Next: ${focus.title} | ${focus.detail}` : `Next: ${focus.title}`;
}

function coordText(x, y) {
  return `${x},${y}`;
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
  ctx.fillText(hint, x + 14, y + 14, width - 28);
  ctx.restore();
}

const worldRegions = [
  {
    id: "black_gate_approach",
    name: "Black Gate Approach",
    contains: (x, y) => x >= 66 && y <= 8,
  },
  {
    id: "high_march",
    name: "High March",
    contains: (x, y) => x >= 62 && y <= 17,
  },
  {
    id: "southern_wilds",
    name: "Southern Wilds",
    contains: (x, y) => x >= 39 && y >= 24,
  },
  {
    id: "low_roads",
    name: "Low Roads",
    contains: (x, y) => y >= 19 && x <= 37,
  },
  {
    id: "dawnhaven_march",
    name: "Dawnhaven March",
    contains: (x, y) => x <= 21 && y <= 17,
  },
  {
    id: "central_kingdom",
    name: "Central Kingdom",
    contains: () => true,
  },
];

function currentRegionId() {
  return worldRegions.find((region) => region.contains(state.x, state.y))?.id || "central_kingdom";
}

function regionFlavorText(regionId) {
  return {
    dawnhaven_march: "Soft roads, small banners, and early patrol routes make this the safest part of the realm.",
    central_kingdom: "Trade roads and broken outposts cross here. The realm opens up and so do the risks.",
    high_march: "The air thins and the road hardens. Rumors here all point to a Black Gate Warden blocking the road to Orius.",
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
  if (regionId === "high_march" || regionId === "black_gate_approach") revealGateIntel("high_march");
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
  return worldRegions.find((region) => region.id === currentRegionId())?.name || "Central Kingdom";
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

function drawWorldAtmosphere() {
  ctx.save();
  const dawn = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  dawn.addColorStop(0, "rgba(255, 220, 132, 0.09)");
  dawn.addColorStop(0.42, "rgba(105, 166, 216, 0.03)");
  dawn.addColorStop(1, "rgba(15, 18, 25, 0.18)");
  ctx.fillStyle = dawn;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const vignette = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.44, canvas.width * 0.25, canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.72);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(0.72, "rgba(0,0,0,0.04)");
  vignette.addColorStop(1, "rgba(0,0,0,0.24)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function updateCamera() {
  const viewW = cameraViewWidth();
  const viewH = cameraViewHeight();
  const mobileCentered = mobileWorldZoom() > 1;
  const minX = mobileCentered ? -(viewW - 1) / 2 : 0;
  const minY = mobileCentered ? -(viewH - 1) / 2 : 0;
  const maxX = mobileCentered ? map[0].length - (viewW + 1) / 2 : Math.max(0, map[0].length - viewW);
  const maxY = mobileCentered ? map.length - (viewH + 1) / 2 : Math.max(0, map.length - viewH);
  const targetX = Math.max(minX, Math.min(maxX, visual.x - (viewW - 1) / 2));
  const targetY = Math.max(minY, Math.min(maxY, visual.y - (viewH - 1) / 2));
  if (!Number.isFinite(camera.x) || !Number.isFinite(camera.y)) {
    camera.x = targetX;
    camera.y = targetY;
  }
  camera.x += (targetX - camera.x) * 0.18;
  camera.y += (targetY - camera.y) * 0.18;
  if (Math.abs(targetX - camera.x) < 0.01) camera.x = targetX;
  if (Math.abs(targetY - camera.y) < 0.01) camera.y = targetY;
  const originX = Math.max(0, Math.min(map[0].length - VIEW_W, Math.floor(camera.x)));
  const originY = Math.max(0, Math.min(map.length - VIEW_H, Math.floor(camera.y)));
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

function drawFogOfWar() {
  const startX = Math.max(0, Math.floor(camera.x) - 1);
  const startY = Math.max(0, Math.floor(camera.y) - 1);
  const endX = Math.min(MAP_W - 1, Math.ceil(camera.x + cameraViewWidth()) + 1);
  const endY = Math.min(MAP_H - 1, Math.ceil(camera.y + cameraViewHeight()) + 1);
  ctx.save();
  for (let y = startY; y <= endY; y += 1) {
    for (let x = startX; x <= endX; x += 1) {
      const px = screenTileX(x);
      const py = screenTileY(y);
      if (!isTileRevealed(x, y)) {
        ctx.fillStyle = "#06090f";
        ctx.fillRect(px, py, TILE + 0.8, TILE + 0.8);
        drawFogTexture(px, py, x, y, 0.42);
        continue;
      }
      if (!isTileCurrentlyVisible(x, y)) {
        ctx.fillStyle = "rgba(6, 9, 15, 0.38)";
        ctx.fillRect(px, py, TILE + 0.8, TILE + 0.8);
      }
    }
  }
  drawFogFrontier(startX, startY, endX, endY);
  ctx.restore();
}

function drawFogTexture(px, py, x, y, alpha) {
  const hash = terrainHash(x, y, 73);
  ctx.fillStyle = `rgba(49, 58, 76, ${alpha})`;
  ctx.beginPath();
  ctx.arc(px + 8 + (hash % 12), py + 9 + ((hash >> 3) % 12), 2 + (hash % 3), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(15, 18, 25, ${alpha * 0.7})`;
  ctx.fillRect(px + ((hash >> 5) % 20), py + 22, 10 + ((hash >> 7) % 8), 2);
}

function drawFogFrontier(startX, startY, endX, endY) {
  ctx.strokeStyle = "rgba(102, 167, 216, 0.18)";
  ctx.lineWidth = 2;
  for (let y = startY; y <= endY; y += 1) {
    for (let x = startX; x <= endX; x += 1) {
      if (!isTileRevealed(x, y)) continue;
      const px = screenTileX(x);
      const py = screenTileY(y);
      if (!isTileRevealed(x - 1, y)) {
        ctx.beginPath();
        ctx.moveTo(px + 1, py + 3);
        ctx.lineTo(px + 1, py + TILE - 3);
        ctx.stroke();
      }
      if (!isTileRevealed(x + 1, y)) {
        ctx.beginPath();
        ctx.moveTo(px + TILE - 1, py + 3);
        ctx.lineTo(px + TILE - 1, py + TILE - 3);
        ctx.stroke();
      }
      if (!isTileRevealed(x, y - 1)) {
        ctx.beginPath();
        ctx.moveTo(px + 3, py + 1);
        ctx.lineTo(px + TILE - 3, py + 1);
        ctx.stroke();
      }
      if (!isTileRevealed(x, y + 1)) {
        ctx.beginPath();
        ctx.moveTo(px + 3, py + TILE - 1);
        ctx.lineTo(px + TILE - 3, py + TILE - 1);
        ctx.stroke();
      }
    }
  }
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
      drawTile(x, y, map[worldY]?.[worldX] || "W", cacheCtx, worldX, worldY);
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
  return worldX >= camera.x - pad && worldY >= camera.y - pad && worldX < camera.x + cameraViewWidth() + pad && worldY < camera.y + cameraViewHeight() + pad;
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

function extraUnitSpriteRow(unitId) {
  return ["bloomStag", "cinderMage", "coralArcher", "nightblade"].indexOf(unitId);
}

function unitSpriteSource(unitId, frame) {
  const extraRow = extraUnitSpriteRow(unitId);
  const col = Math.max(0, Math.min(3, frame || 0));
  if (extraRow >= 0) {
    if (!extraUnitSheetReady) return null;
    return { image: extraUnitSheet, rect: atlasGridCell(extraUnitSheet, 4, 4, col, extraRow) };
  }
  const spriteId = creatureBook[unitId]?.spriteId || unitId;
  const order = ["leafFox", "emberGolem", "tideWisp", "duskMoth", "thornArcher", "ironPikeman", "reefGuard", "moonSeer"];
  const row = order.indexOf(spriteId);
  if (!unitSheetReady || row < 0) return null;
  return { image: unitSheet, rect: atlasGridCell(unitSheet, 4, order.length, col, row) };
}

function unitCell(unitId, frame) {
  return unitSpriteSource(unitId, frame)?.rect || null;
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
  const source = unitSpriteSource(unitId, frame);
  if (!source) return null;
  const cutout = buildChromaCutout(source.image, source.rect, { transparentThreshold: 72 });
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
  const cacheKey = `unit-portrait:${unitId}:${spriteId}:${extraUnitSpriteRow(unitId) >= 0 ? "extra" : "base"}`;
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

function unitArtReady(unitId) {
  return extraUnitSpriteRow(unitId) >= 0 ? extraUnitSheetReady : unitSheetReady;
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
  if (options.outline) {
    ctx.globalAlpha = 0.78;
    ctx.filter = "brightness(0)";
    const outlineOffset = options.outlineOffset || 1.4;
    [
      [-outlineOffset, 0],
      [outlineOffset, 0],
      [0, -outlineOffset],
      [0, outlineOffset],
    ].forEach(([ox, oy]) => {
      if (options.flip) {
        ctx.save();
        ctx.translate(dx + dw + ox, dy + oy);
        ctx.scale(-1, 1);
        ctx.drawImage(source, sx, sy, sw, sh, 0, 0, dw, dh);
        ctx.restore();
      } else {
        ctx.drawImage(source, sx, sy, sw, sh, dx + ox, dy + oy, dw, dh);
      }
    });
    ctx.globalAlpha = 1;
    ctx.filter = options.filter || "none";
  } else if (options.filter) {
    ctx.filter = options.filter;
  }
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
  if (options.outline) {
    ctx.globalAlpha = 0.78;
    ctx.filter = "brightness(0)";
    const outlineOffset = options.outlineOffset || 1.4;
    [
      [-outlineOffset, 0],
      [outlineOffset, 0],
      [0, -outlineOffset],
      [0, outlineOffset],
    ].forEach(([ox, oy]) => {
      if (options.flip) {
        ctx.save();
        ctx.translate(dx + dw + ox, dy + oy);
        ctx.scale(-1, 1);
        ctx.drawImage(source, sx, sy, sw, sh, 0, 0, dw, dh);
        ctx.restore();
      } else {
        ctx.drawImage(source, sx, sy, sw, sh, dx + ox, dy + oy, dw, dh);
      }
    });
    ctx.globalAlpha = 1;
    ctx.filter = options.filter || "none";
  } else if (options.filter) {
    ctx.filter = options.filter;
  }
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

function terrainHash(x, y, salt = 0) {
  let value = Math.imul(x + 101 + salt * 17, 374761393) ^ Math.imul(y + 211 + salt * 31, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function nearbyTravelTile(x, y) {
  return ["R", "B"].includes(map[y]?.[x]);
}

function drawTileAtPixel(px, py, tile, targetCtx = ctx, worldX = Math.round(px / TILE), worldY = Math.round(py / TILE)) {
  const spriteName = tile === "W" ? "water" : tile === "B" ? "bridge" : tile === "F" ? "forest" : tile === "M" ? "mountain" : tile === "R" ? "road" : "grass";
  const color = tile === "W" ? palette.water : tile === "B" ? palette.bridge : tile === "F" ? palette.forest : tile === "M" ? palette.mountain : tile === "R" ? palette.road : palette.grass;
  targetCtx.fillStyle = color;
  targetCtx.fillRect(px, py, TILE, TILE);
  const spriteDrawn = drawAtlas(spriteName, px, py, TILE, TILE, { alpha: tile === "G" ? 0.72 : 0.88, inset: tile === "W" ? 10 : 8 }, targetCtx);
  if (spriteDrawn) {
    if (tile === "G" && terrainHash(worldX, worldY, 1) > 0.32) {
      targetCtx.fillStyle = "rgba(95, 174, 93, 0.28)";
      targetCtx.fillRect(px, py, TILE, TILE);
    }
  } else {
    targetCtx.fillStyle = tile === "G" ? palette.grass2 : "rgba(255,255,255,0.08)";
    if ((worldX + worldY) % 2 === 0) targetCtx.fillRect(px + 3, py + 24, 7, 3);
    if (tile === "F") drawTree(px, py, targetCtx);
    if (tile === "M") drawMountain(px, py, targetCtx);
    if (tile === "W") drawWater(px, py, worldX, worldY, targetCtx);
    if (tile === "B") drawBridge(px, py, targetCtx);
  }
  drawTilePolish(px, py, tile, targetCtx, worldX, worldY);
}

function drawTile(x, y, tile, targetCtx = ctx, worldX = x, worldY = y) {
  drawTileAtPixel(x * TILE, y * TILE, tile, targetCtx, worldX, worldY);
}

function drawTilePolish(px, py, tile, targetCtx, worldX, worldY) {
  const shade = terrainHash(worldX, worldY, 2);
  targetCtx.save();
  targetCtx.fillStyle = shade > 0.5 ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.045)";
  targetCtx.fillRect(px, py, TILE, TILE);

  if (tile === "G") {
    const tuftCount = shade > 0.72 ? 3 : shade > 0.38 ? 2 : 1;
    targetCtx.strokeStyle = "rgba(214, 226, 167, 0.32)";
    targetCtx.lineWidth = 1;
    for (let i = 0; i < tuftCount; i += 1) {
      const tx = px + 6 + terrainHash(worldX, worldY, 10 + i) * 20;
      const ty = py + 9 + terrainHash(worldX, worldY, 20 + i) * 17;
      targetCtx.beginPath();
      targetCtx.moveTo(tx, ty + 4);
      targetCtx.lineTo(tx + 2, ty);
      targetCtx.lineTo(tx + 5, ty + 4);
      targetCtx.stroke();
    }
    if (terrainHash(worldX, worldY, 30) > 0.93) {
      targetCtx.fillStyle = "rgba(255, 229, 122, 0.78)";
      targetCtx.fillRect(px + 11, py + 13, 2, 2);
      targetCtx.fillRect(px + 20, py + 21, 2, 2);
    }
  }

  if (tile === "F") {
    targetCtx.fillStyle = "rgba(14, 50, 30, 0.18)";
    targetCtx.fillRect(px, py + 20, TILE, 12);
    targetCtx.fillStyle = "rgba(133, 204, 106, 0.24)";
    targetCtx.fillRect(px + 7 + Math.floor(terrainHash(worldX, worldY, 3) * 10), py + 6, 4, 3);
  }

  if (tile === "R") {
    targetCtx.fillStyle = "rgba(89, 54, 33, 0.18)";
    if (!nearbyTravelTile(worldX - 1, worldY)) targetCtx.fillRect(px, py, 4, TILE);
    if (!nearbyTravelTile(worldX + 1, worldY)) targetCtx.fillRect(px + TILE - 4, py, 4, TILE);
    if (!nearbyTravelTile(worldX, worldY - 1)) targetCtx.fillRect(px, py, TILE, 4);
    if (!nearbyTravelTile(worldX, worldY + 1)) targetCtx.fillRect(px, py + TILE - 4, TILE, 4);
    targetCtx.fillStyle = "rgba(255, 231, 168, 0.16)";
    targetCtx.fillRect(px + 6, py + 15, TILE - 12, 2);
  }

  if (tile === "W") {
    targetCtx.strokeStyle = "rgba(190, 231, 245, 0.32)";
    targetCtx.lineWidth = 1;
    const waveY = py + 9 + Math.floor(terrainHash(worldX, worldY, 4) * 12);
    targetCtx.beginPath();
    targetCtx.moveTo(px + 5, waveY);
    targetCtx.lineTo(px + 13, waveY - 2);
    targetCtx.lineTo(px + 23, waveY);
    targetCtx.stroke();
  }

  if (tile === "M") {
    targetCtx.fillStyle = "rgba(255, 255, 255, 0.18)";
    targetCtx.fillRect(px + 10 + Math.floor(terrainHash(worldX, worldY, 5) * 7), py + 8, 4, 7);
    targetCtx.fillStyle = "rgba(0, 0, 0, 0.14)";
    targetCtx.fillRect(px + 3, py + 24, TILE - 6, 4);
  }

  targetCtx.restore();
}

function drawTree(px, py, targetCtx = ctx) {
  targetCtx.fillStyle = "#164d2e";
  targetCtx.fillRect(px + 13, py + 18, 6, 9);
  targetCtx.fillStyle = "#2f8650";
  targetCtx.fillRect(px + 8, py + 8, 16, 14);
  targetCtx.fillStyle = "#3fa35d";
  targetCtx.fillRect(px + 12, py + 5, 10, 7);
}

function drawMountain(px, py, targetCtx = ctx) {
  targetCtx.fillStyle = "#535761";
  targetCtx.beginPath();
  targetCtx.moveTo(px + 4, py + 27);
  targetCtx.lineTo(px + 16, py + 6);
  targetCtx.lineTo(px + 29, py + 27);
  targetCtx.fill();
  targetCtx.fillStyle = "#d9dde4";
  targetCtx.fillRect(px + 14, py + 10, 4, 4);
}

function drawWater(px, py, x, y, targetCtx = ctx) {
  targetCtx.fillStyle = "#7fc4df";
  targetCtx.fillRect(px + ((x + y) % 3) * 4 + 4, py + 13, 12, 3);
  targetCtx.fillRect(px + 17, py + 22, 9, 2);
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
    if (!isTileRevealed(x, y)) return;
    if (x === state.x && y === state.y && ["battle", "final"].includes(event.type)) return;
    entities.push({ y: y + 0.82, x, draw: () => drawEventEntity(key, event, x, y) });
  });
  tradeCartEntities().filter((cart) => isTileRevealed(Math.round(cart.x), Math.round(cart.y))).forEach((cart) => entities.push(cart));
  (state.enemyHeroes || []).forEach((hero) => {
    if (hero.defeated || !isOnScreen(hero.x, hero.y, 2)) return;
    if (!isTileRevealed(hero.x, hero.y)) return;
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
  if (event.type === "mine") drawMine(px, py, state.visited[key]);
  if (event.type === "chest") drawChest(px, py, state.visited[key], isCacheGuarded(key, event));
  if (event.type === "cache") drawTreasureCache(px, py, state.visited[key], isCacheGuarded(key, event), event);
  if (event.type === "artifact") drawArtifactPickup(px, py, state.visited[key], isCacheGuarded(key, event), event);
  if (event.type === "supply") drawSupplyPickup(px, py, state.visited[key], isCacheGuarded(key, event), event);
  if (event.type === "battle" && event.gate) {
    if (state.visited[key]) drawGateClearedMarker(px, py);
    else drawMonster(encounters[event.encounter].color, x, y, event.encounter);
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
  if (event.landmark === "shrine") return drawDawnShrine(px, py);
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

function drawDawnShrine(px, py) {
  drawShadow(px + 16, py + 28, 24, 7);
  ctx.save();
  const pulse = 0.55 + Math.sin(animationTime / 360) * 0.16;
  ctx.fillStyle = `rgba(240,193,91,${pulse * 0.22})`;
  ctx.beginPath();
  ctx.arc(px + 16, py + 16, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8d9ab0";
  ctx.fillRect(px + 9, py + 17, 14, 10);
  ctx.fillStyle = "#c7d5e8";
  ctx.fillRect(px + 11, py + 12, 10, 7);
  ctx.fillStyle = "#fff2b6";
  ctx.beginPath();
  ctx.moveTo(px + 16, py + 5);
  ctx.lineTo(px + 20, py + 14);
  ctx.lineTo(px + 16, py + 12);
  ctx.lineTo(px + 12, py + 14);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function shouldFlagEvent(event) {
  return event.type === "town" || event.type === "mine" || event.gate || event.type === "final";
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
  ctx.fillStyle = "#f4ead7";
  ctx.strokeStyle = "#0f1219";
  ctx.lineWidth = 2;
  ctx.fillRect(px + 2, py + 1, 3, 26);
  ctx.strokeRect(px + 2, py + 1, 3, 26);
  ctx.fillStyle = palette.playerFlag;
  ctx.beginPath();
  ctx.moveTo(px + 5, py + 2);
  ctx.lineTo(px + 5 + bannerWidth, py + 2);
  ctx.lineTo(px + 5 + bannerWidth - 5, py + 10);
  ctx.lineTo(px + 5, py + 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = palette.ownedTownRing;
  ctx.fillRect(px + 7, py + 4, Math.max(4, bannerWidth - 11), 2);
  ctx.restore();
}

function drawMine(px, py, owned = false) {
  drawShadow(px + 16, py + 27, 26, 8);
  if (owned) drawMineClaimMarker(px, py);
  if (drawTownCutout("mineOutpost", px + 16, py + 35, { targetHeight: 42 })) {
    if (owned) drawMineBanner(px, py);
    return;
  }
  if (drawAtlas("mine", px - 4, py - 8, 42, 42)) {
    if (owned) drawMineBanner(px, py);
    return;
  }
  ctx.fillStyle = palette.mine;
  ctx.fillRect(px + 6, py + 17, 20, 11);
  ctx.fillStyle = "#241914";
  ctx.fillRect(px + 11, py + 13, 10, 15);
  ctx.strokeStyle = "#d6aa62";
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 8, py + 15, 16, 13);
  if (owned) drawMineBanner(px, py);
}

function drawMineClaimMarker(px, py) {
  ctx.save();
  ctx.strokeStyle = "rgba(102, 167, 216, 0.9)";
  ctx.fillStyle = "rgba(102, 167, 216, 0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(px + 16, py + 28, 22, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawMineBanner(px, py) {
  ctx.save();
  ctx.fillStyle = "#f4ead7";
  ctx.strokeStyle = "#0f1219";
  ctx.lineWidth = 1.5;
  ctx.fillRect(px + 3, py + 4, 3, 22);
  ctx.strokeRect(px + 3, py + 4, 3, 22);
  ctx.fillStyle = palette.playerFlag;
  ctx.beginPath();
  ctx.moveTo(px + 6, py + 5);
  ctx.lineTo(px + 22, py + 8);
  ctx.lineTo(px + 17, py + 16);
  ctx.lineTo(px + 6, py + 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#f0c15b";
  ctx.beginPath();
  ctx.arc(px + 25, py + 25, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawNpc(px, py, event) {
  const quest = npcQuests[event.quest];
  if (!quest) return;
  const status = state.quests?.[event.quest] || "new";
  const ready = status === "accepted" && quest?.complete?.();
  const phase = Math.floor(animationTime / 180) % 4;
  const bob = Math.sin(animationTime / 360 + px * 0.03) * 0.7;
  drawShadow(px + 16, py + 30, 22, 7);
  if (drawQuestGiverCutout(event.quest, phase, px + 16, py + 35, { targetHeight: 44, offsetY: bob, outline: true, filter: "contrast(1.12) saturate(1.1)" })) {
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

function drawChest(px, py, opened = false, guarded = false) {
  drawShadow(px + 17, py + 27, 19, 5);
  const painted = drawAtlas(opened ? "chestOpen" : "chest", px + 5, py + 5, 24, 24);
  if (!painted) {
    ctx.fillStyle = palette.chest;
    ctx.fillRect(px + 8, py + 14, 17, 12);
    ctx.fillStyle = "#6f3c28";
    ctx.fillRect(px + 8, py + 19, 17, 3);
    ctx.fillStyle = "#fff0a3";
    ctx.fillRect(px + 15, py + 18, 3, 5);
  }
  if (guarded && !opened) drawGuardedCacheMarker(px, py);
}

function drawTreasureCache(px, py, opened = false, guarded = false, event = {}) {
  drawShadow(px + 16, py + 29, 30, 7);
  if (opened) {
    drawChest(px - 2, py + 1, true, false);
    drawOpenedPickupMarker(px, py);
    return;
  }
  drawChest(px - 5, py + 2, false, false);
  drawChest(px + 7, py + 6, false, false);
  const rewards = treasureRewards(event);
  const hasRelic = rewards.some((reward) => relicItems.has(reward.item));
  const hasPotion = rewards.some((reward) => reward.item === "Healing Draught");
  if (hasRelic) drawLooseArtifact(px + 15, py + 7);
  if (hasPotion) drawPotionPickup(px + 7, py + 10);
  if (guarded) drawGuardedCacheMarker(px, py - 2);
}

function drawArtifactPickup(px, py, opened = false, guarded = false, event = {}) {
  drawShadow(px + 16, py + 27, 18, 6);
  if (opened) {
    drawOpenedPickupMarker(px, py);
    return;
  }
  if (!drawWorldItemIcon(event.item || "Banner of Luck", px + 16, py + 18, 25)) drawLooseArtifact(px + 16, py + 8);
  if (guarded) drawGuardedCacheMarker(px, py - 2);
}

function drawSupplyPickup(px, py, opened = false, guarded = false, event = {}) {
  drawShadow(px + 16, py + 28, 20, 6);
  if (opened) {
    drawOpenedPickupMarker(px, py);
    return;
  }
  if (!drawWorldItemIcon(event.item || "Healing Draught", px + 16, py + 19, 24)) drawPotionPickup(px + 16, py + 10);
  if ((event.qty || 1) > 1) {
    ctx.save();
    ctx.fillStyle = "rgba(15,18,25,0.74)";
    ctx.fillRect(px + 18, py + 18, 13, 11);
    ctx.fillStyle = "#fff2b6";
    ctx.font = "700 9px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`x${event.qty}`, px + 24.5, py + 23.5);
    ctx.restore();
  }
  if (guarded) drawGuardedCacheMarker(px, py - 2);
}

function drawOpenedPickupMarker(px, py) {
  ctx.save();
  ctx.fillStyle = "rgba(244, 234, 215, 0.42)";
  ctx.beginPath();
  ctx.ellipse(px + 16, py + 27, 10, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function itemIconIndex(id) {
  return {
    healingDraught: 0,
    bannerOfLuck: 1,
    dawnwoodBow: 2,
    silverBridle: 3,
    starlitCompass: 4,
    forgeCharm: 5,
    supplyCrate: 6,
    coinPouch: 7,
  }[id] ?? 6;
}

function drawWorldItemIcon(itemNameOrId, cx, cy, size = 24) {
  if (!itemIconSheetReady || !itemIconSheet.naturalWidth || !itemIconSheet.naturalHeight) return false;
  const id = chestItemIds[itemNameOrId] || itemNameOrId || "supplyCrate";
  const index = itemIconIndex(id);
  const cols = 4;
  const rows = 2;
  const sw = itemIconSheet.naturalWidth / cols;
  const sh = itemIconSheet.naturalHeight / rows;
  const sx = (index % cols) * sw;
  const sy = Math.floor(index / cols) * sh;
  ctx.save();
  ctx.fillStyle = "rgba(15,18,25,0.34)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + size * 0.36, size * 0.48, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 231, 138, 0.18)";
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.58, 0, Math.PI * 2);
  ctx.fill();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(itemIconSheet, sx, sy, sw, sh, cx - size / 2, cy - size / 2, size, size);
  ctx.restore();
  return true;
}

function drawLooseArtifact(cx, cy) {
  const pulse = 0.72 + Math.sin(animationTime / 240) * 0.18;
  ctx.save();
  ctx.fillStyle = `rgba(255, 231, 138, ${0.3 + pulse * 0.25})`;
  ctx.beginPath();
  ctx.arc(cx, cy + 8, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff2b6";
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + 5, cy + 7);
  ctx.lineTo(cx, cy + 15);
  ctx.lineTo(cx - 5, cy + 7);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#8a5f21";
  ctx.stroke();
  ctx.restore();
}

function drawPotionPickup(cx, cy) {
  ctx.save();
  ctx.fillStyle = "#66a7d8";
  ctx.fillRect(cx - 3, cy + 6, 7, 9);
  ctx.fillStyle = "#f4ead7";
  ctx.fillRect(cx - 1, cy + 3, 3, 4);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(cx - 2, cy + 7, 2, 5);
  ctx.strokeStyle = "#0f1219";
  ctx.strokeRect(cx - 3.5, cy + 5.5, 7, 9);
  ctx.restore();
}

function drawGuardedCacheMarker(px, py) {
  const pulse = 0.75 + Math.sin(animationTime / 260) * 0.25;
  ctx.save();
  ctx.fillStyle = "rgba(15, 18, 25, 0.78)";
  ctx.beginPath();
  ctx.arc(px + 25, py + 7, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgba(217, 93, 93, ${0.65 + pulse * 0.25})`;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = "#fff2b6";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(px + 20, py + 4);
  ctx.lineTo(px + 30, py + 10);
  ctx.moveTo(px + 30, py + 4);
  ctx.lineTo(px + 20, py + 10);
  ctx.stroke();
  ctx.restore();
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
  drawShadow(centerX, py + 91, 214, 24);
  ctx.save();
  ctx.fillStyle = "rgba(55, 49, 41, 0.18)";
  ctx.beginPath();
  ctx.ellipse(centerX, py + 58, 102, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 242, 182, 0.16)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  painted = drawCastleCutout("keep", keepX, py + 70, { targetHeight: 124 }) || painted;
  if (!painted) painted = drawAtlas("castle", px - 46, py - 70, 132, 108) || painted;
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
  if (finalGateCleared()) {
    drawCastleWall(px - 12, py + 1);
    drawCastleWall(px + 12, py + 1);
    drawOpenCastleGate(px, py);
    return;
  }
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

function drawOpenCastleGate(px, py) {
  ctx.save();
  const pulse = 0.5 + Math.sin(animationTime / 420) * 0.16;
  ctx.fillStyle = `rgba(240,193,91,${0.16 + pulse * 0.16})`;
  ctx.beginPath();
  ctx.ellipse(px + 16, py + 24, 18, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4d5364";
  ctx.fillRect(px + 4, py + 5, 24, 27);
  ctx.fillStyle = "#141820";
  ctx.beginPath();
  ctx.moveTo(px + 9, py + 32);
  ctx.lineTo(px + 9, py + 19);
  ctx.quadraticCurveTo(px + 16, py + 11, px + 23, py + 19);
  ctx.lineTo(px + 23, py + 32);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#fff2b6";
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 3.5, py + 4.5, 25, 27);
  ctx.fillStyle = palette.playerFlag;
  ctx.fillRect(px + 14, py - 2, 4, 9);
  ctx.restore();
}

function drawGateClearedMarker(px, py) {
  drawShadow(px + 16, py + 28, 34, 8);
  ctx.save();
  ctx.fillStyle = "rgba(240,193,91,0.18)";
  ctx.beginPath();
  ctx.arc(px + 16, py + 16, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4d5364";
  ctx.fillRect(px + 7, py + 18, 18, 8);
  ctx.fillStyle = "#d95d5d";
  ctx.fillRect(px + 9, py + 23, 16, 4);
  ctx.fillStyle = palette.playerFlag;
  ctx.fillRect(px + 14, py + 7, 4, 13);
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
  const questData = buildQuestCollections();
  const mineCount = countVisitedEvents("mine");
  const battleCount = countVisitedEvents("battle");
  const mineTarget = countEvents("mine");
  const battleTarget = countEvents("battle");
  const townCount = ownedTownEntries().length;
  const townTarget = countEvents("town");
  const relicCount = uniqueRelicCount();
  const incomePreview = townEconomyPreview().total;
  const formation = partyCompositionSummary();
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
    stat("Position", coordText(state.x, state.y)) +
    stat("Relics", `${relicCount}/4`) +
    stat("Towns", `${townCount}/${townTarget}`) +
    stat("Mines", `${mineCount}/${mineTarget}`) +
    stat("Outposts", `${battleCount}/${battleTarget}`) +
    stat("Skills", state.hero.skills?.length ? state.hero.skills.join(", ") : "None");
  partyList.innerHTML = `<div class="unit"><div><div class="unit-name"><span>Warband Readout</span><span>${state.party.length + 1} units</span></div><div class="unit-stats">${formation.strengths}</div><div class="unit-skill">${formation.advice}</div></div></div>` + renderUnit(state.hero, -1) + state.party.map((unit, index) => renderUnit(unit, index)).join("");
  renderInventory();
  questLog.innerHTML =
    activeFocusMarkup(questData.focus) +
    questSection("Now", questData.nowRows, "priority") +
    questSection("Soon", questData.soonRows, "compact") +
    questSection("Done", questData.doneRows, "compact");
  renderMinimap();
}

function buildQuestCollections() {
  const mineCount = countVisitedEvents("mine");
  const battleCount = countVisitedEvents("battle");
  const mineTarget = countEvents("mine");
  const battleTarget = countEvents("battle");
  const townCount = ownedTownEntries().length;
  const townTarget = countEvents("town");
  const gate = fortressGateRequirements();
  const immediateRows = state.won
    ? [
        { text: "Orius defeated", done: true, tag: "Win" },
        { text: postVictoryCleanupObjective().replace(/^Cleanup:\s*/i, ""), done: postVictoryCleanupObjective().includes("fully secured"), tag: "Cleanup" },
      ]
    : [
        { text: campaignMainObjectiveShort(), detail: campaignMainObjective(), done: false, tag: "Main" },
        ...(campaignSideObjectiveShort() ? [{ text: campaignSideObjectiveShort(), detail: campaignSideObjective(), done: false, tag: "Side" }] : []),
      ];
  const npcQuestRows = Object.entries(npcQuests)
    .filter(([id]) => (state.quests?.[id] || "new") !== "new")
    .map(([id, quest]) => {
      const status = state.quests?.[id] || "new";
      const ready = status === "accepted" && quest.complete();
      const done = status === "claimed";
      const label = done ? "Done" : ready ? "Turn in" : status === "accepted" ? quest.objective : "Talk to NPC";
      return { text: quest.title, detail: label, done, tag: done ? "Done" : ready ? "Ready" : "Quest", trackType: "npc", trackId: id, trackLabel: questTrackLabel("npc", id) };
    });
  const townQuestRows = Object.entries(townCommissionDefinitions)
    .filter(([id]) => (state.quests?.[id] || "new") !== "new")
    .map(([id, quest]) => {
      const status = state.quests?.[id] || "new";
      const ready = status === "accepted" && quest.complete();
      const done = status === "claimed";
      const label = done ? "Done" : ready ? "Claim at town" : status === "accepted" ? quest.objective : "Accept at notice board";
      return { text: quest.title, detail: label, done, tag: done ? "Done" : ready ? "Ready" : "Quest", trackType: "town", trackId: id, trackLabel: questTrackLabel("town", id) };
    });
  const storyRows = [
    { text: "Build a four-unit warband", detail: `${state.party.length}/4 ready`, done: state.party.length >= 4, tag: "Story", trackType: "story", trackId: "warband", trackLabel: questTrackLabel("story", "warband") },
    { text: "Claim towns", detail: `${townCount}/${townTarget}`, done: townCount >= townTarget, tag: "Story", trackType: "story", trackId: "towns", trackLabel: questTrackLabel("story", "towns") },
    ...(townCount >= 2 || mineCount >= 2 || battleCount >= 1 ? [
      { text: "Secure mines", detail: `${mineCount}/${mineTarget}`, done: mineCount >= mineTarget, tag: "Story", trackType: "story", trackId: "mines", trackLabel: questTrackLabel("story", "mines") },
      { text: "Clear outposts", detail: `${battleCount}/${battleTarget}`, done: battleCount >= battleTarget, tag: "Story", trackType: "story", trackId: "outposts", trackLabel: questTrackLabel("story", "outposts") },
    ] : []),
  ];
  const gateRows = [
    { text: gateRequirementsKnown() ? "Recover relics" : "Learn the seal", detail: gateRequirementsKnown() ? `${gate.relicCount}/${gate.relicTarget}` : "High March rumors point northeast", done: gateRequirementsKnown() ? gate.relicCount >= gate.relicTarget : false, tag: "Gate", trackType: "story", trackId: "relics", trackLabel: questTrackLabel("story", "relics") },
    { text: gateRequirementsKnown() ? "Clear outposts" : "Break the warden", detail: gateRequirementsKnown() ? `${gate.outpostCount}/${gate.outpostTarget}` : "The Black Gate Warden bars Orius's road", done: gateRequirementsKnown() ? gate.outpostCount >= gate.outpostTarget : false, tag: "Gate", trackType: "story", trackId: "outposts", trackLabel: questTrackLabel("story", "outposts") },
    { text: finalGateCleared() ? "Gate warden defeated" : gate.ready ? "Challenge gate warden" : gateIntelKnown() ? "Gate remains sealed" : "Fortress rumor", detail: "", done: finalGateCleared(), tag: "Gate", trackType: "story", trackId: "blackGate", trackLabel: questTrackLabel("story", "blackGate") },
    { text: state.won ? "Fortress claimed" : finalGateCleared() ? "Enter fortress heart" : "Fortress locked", detail: "", done: state.won, tag: "Gate", trackType: "story", trackId: "fortress", trackLabel: questTrackLabel("story", "fortress") },
  ];
  const showGateRows = gateIntelKnown() || gateRequirementsKnown() || finalGateCleared();
  const readyRows = [...npcQuestRows, ...townQuestRows].filter((row) => !row.done && row.tag === "Ready");
  const nowRows = [
    ...immediateRows,
    ...readyRows,
  ];
  const soonRows = [
    ...storyRows.filter((row) => !row.done),
    ...(showGateRows ? gateRows.filter((row) => !row.done) : []),
    ...npcQuestRows.filter((row) => !row.done && row.tag !== "Ready"),
    ...townQuestRows.filter((row) => !row.done && row.tag !== "Ready"),
  ];
  const doneRows = [
    ...storyRows.filter((row) => row.done),
    ...(showGateRows ? gateRows.filter((row) => row.done) : []),
    ...npcQuestRows.filter((row) => row.done),
    ...townQuestRows.filter((row) => row.done),
  ];
  return {
    focus: activeFocusObjective(nowRows, soonRows),
    nowRows,
    soonRows,
    doneRows,
  };
}

function activeFocusObjective(nowRows = [], soonRows = []) {
  const actionable = [...nowRows, ...soonRows].find((row) => !row.done && row.text);
  if (actionable) {
    return {
      title: actionable.text,
      detail: actionable.detail || "",
      tag: actionable.tag || "Focus",
      trackType: actionable.trackType || "",
      trackId: actionable.trackId || "",
      trackLabel: actionable.trackLabel || "",
    };
  }
  return {
    title: campaignMainObjectiveShort(),
    detail: campaignSideObjectiveShort(),
    tag: "Focus",
    trackType: "",
    trackId: "",
    trackLabel: "",
  };
}

function activeFocusMarkup(focus) {
  if (!focus?.title) return "";
  const trackButton = focus.trackType && focus.trackId && focus.trackLabel
    ? `<button type="button" class="quest-track active-focus-track" data-track-quest="${focus.trackType}:${focus.trackId}" title="Mark ${escapeHtml(focus.trackLabel)} on the minimap">Track</button>`
    : "";
  return `
    <section class="quest-focus-card">
      <div class="quest-focus-head">
        <span>${escapeHtml(focus.tag || "Focus")}</span>
        ${trackButton}
      </div>
      <strong>${escapeHtml(focus.title)}</strong>
      ${focus.detail ? `<small>${escapeHtml(focus.detail)}</small>` : ""}
    </section>
  `;
}

function questSection(title, rows, variant = "") {
  if (!rows.length) return "";
  if (variant === "compact") {
    const remaining = rows.filter((quest) => !quest.done).length;
    return `
      <details class="quest-section compact">
        <summary><h3>${title}</h3><span>${remaining ? `${remaining} open` : "complete"}</span></summary>
        <ul>
          ${rows.map(questRowMarkup).join("")}
        </ul>
      </details>
    `;
  }
  return `
    <section class="quest-section ${variant}">
      <h3>${title}</h3>
      <ul>
        ${rows.map(questRowMarkup).join("")}
      </ul>
    </section>
  `;
}

function questRowMarkup(quest) {
  const active = quest.trackType && state.activeQuest === `${quest.trackType}:${quest.trackId}`;
  const trackButton = !quest.done && quest.trackType && quest.trackId && quest.trackLabel
    ? `<button type="button" class="quest-track ${active ? "active" : ""}" data-track-quest="${quest.trackType}:${quest.trackId}" title="Mark ${escapeHtml(quest.trackLabel)} on the minimap">${active ? "Tracking" : "Track"}</button>`
    : "";
  return `<li class="${quest.done ? "done" : ""} ${active ? "tracked" : ""}">${quest.tag ? `<em class="quest-chip">${escapeHtml(quest.tag)}</em>` : ""}<span><b>${escapeHtml(quest.text)}</b>${quest.detail ? `<small>${escapeHtml(quest.detail)}</small>` : ""}</span>${trackButton}</li>`;
}

function uniqueRelicCount() {
  return new Set((state.relics || []).filter((item) => relicItems.has(item))).size;
}

function renderMinimap() {
  if (!minimap || !minimapCtx) return;
  const scaleX = minimap.width / MAP_W;
  const scaleY = minimap.height / MAP_H;
  minimapCtx.clearRect(0, 0, minimap.width, minimap.height);
  minimapCtx.fillStyle = "#0d1219";
  minimapCtx.fillRect(0, 0, minimap.width, minimap.height);
  for (let y = 0; y < MAP_H; y += 1) {
    for (let x = 0; x < MAP_W; x += 1) {
      minimapCtx.fillStyle = isTileRevealed(x, y) ? minimapColorForTile(map[y]?.[x]) : "#05080d";
      minimapCtx.fillRect(Math.floor(x * scaleX), Math.floor(y * scaleY), Math.ceil(scaleX), Math.ceil(scaleY));
    }
  }
  drawMinimapCoordinates(scaleX, scaleY);
  events.forEach((event, key) => {
    const [x, y] = key.split(",").map(Number);
    if (!isTileRevealed(x, y)) return;
    drawMinimapEventMarker(x, y, event, Boolean(state.visited[key]), scaleX, scaleY);
  });
  drawMinimapScoutMarker(scaleX, scaleY);
  drawMinimapPlayer(scaleX, scaleY);
  drawMinimapFrame();
  if (mapCoordinates) mapCoordinates.textContent = `You: ${coordText(state.x, state.y)} | Lead: ${minimapTargetText()} | Explored: ${exploredMapPercent()}%`;
}

function exploredMapPercent() {
  const total = MAP_W * MAP_H;
  const revealed = Object.keys(state.revealed || {}).length;
  return Math.max(1, Math.min(100, Math.round((revealed / total) * 100)));
}

function drawMinimapEventMarker(x, y, event, visited, scaleX, scaleY) {
  const px = Math.floor(x * scaleX);
  const py = Math.floor(y * scaleY);
  const color = minimapColorForEvent(event, visited);
  minimapCtx.save();
  minimapCtx.fillStyle = color;
  minimapCtx.strokeStyle = visited ? "rgba(15,18,25,0.78)" : "rgba(255,242,182,0.72)";
  minimapCtx.lineWidth = 1;
  if (event.type === "battle" || event.type === "final") {
    minimapCtx.beginPath();
    minimapCtx.moveTo(px + 1, py - 2);
    minimapCtx.lineTo(px + 5, py + 2);
    minimapCtx.lineTo(px + 1, py + 6);
    minimapCtx.lineTo(px - 3, py + 2);
    minimapCtx.closePath();
    minimapCtx.fill();
    minimapCtx.stroke();
  } else if (event.type === "town") {
    minimapCtx.fillRect(px - 2, py - 2, 6, 6);
    minimapCtx.strokeRect(px - 2.5, py - 2.5, 6, 6);
  } else {
    minimapCtx.beginPath();
    minimapCtx.arc(px + 1, py + 1, 2.4, 0, Math.PI * 2);
    minimapCtx.fill();
    minimapCtx.stroke();
  }
  minimapCtx.restore();
}

function drawMinimapPlayer(scaleX, scaleY) {
  const px = Math.floor(state.x * scaleX);
  const py = Math.floor(state.y * scaleY);
  const angle = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 }[facing] || 0;
  minimapCtx.save();
  minimapCtx.fillStyle = "rgba(255,255,255,0.22)";
  minimapCtx.beginPath();
  minimapCtx.arc(px, py, 7, 0, Math.PI * 2);
  minimapCtx.fill();
  minimapCtx.translate(px, py);
  minimapCtx.rotate(angle);
  minimapCtx.fillStyle = "#ffffff";
  minimapCtx.strokeStyle = "#0f1219";
  minimapCtx.lineWidth = 1.5;
  minimapCtx.beginPath();
  minimapCtx.moveTo(0, -5);
  minimapCtx.lineTo(5, 5);
  minimapCtx.lineTo(0, 3);
  minimapCtx.lineTo(-5, 5);
  minimapCtx.closePath();
  minimapCtx.fill();
  minimapCtx.stroke();
  minimapCtx.restore();
}

function drawMinimapScoutMarker(scaleX, scaleY) {
  const activeTarget = activeQuestTarget();
  const key = activeTarget?.key || state.scoutMarker || nearestScoutingTarget()?.key;
  if (!key) return;
  const [x, y] = key.split(",").map(Number);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  if (!isTileRevealed(x, y)) return;
  const px = Math.floor(x * scaleX);
  const py = Math.floor(y * scaleY);
  minimapCtx.save();
  minimapCtx.strokeStyle = "#fff2b6";
  minimapCtx.lineWidth = 2;
  minimapCtx.beginPath();
  minimapCtx.arc(px + 1, py + 1, 6, 0, Math.PI * 2);
  minimapCtx.stroke();
  minimapCtx.beginPath();
  minimapCtx.moveTo(px - 7, py + 1);
  minimapCtx.lineTo(px + 9, py + 1);
  minimapCtx.moveTo(px + 1, py - 7);
  minimapCtx.lineTo(px + 1, py + 9);
  minimapCtx.stroke();
  minimapCtx.restore();
}

function minimapTargetText() {
  const activeTarget = activeQuestTarget();
  if (activeTarget) return isTileRevealed(activeTarget.x, activeTarget.y) ? activeTarget.label : "active quest beyond explored map";
  const key = state.scoutMarker || nearestScoutingTarget()?.key;
  if (!key) return "none";
  const [x, y] = key.split(",").map(Number);
  if (!isTileRevealed(x, y)) return "unexplored lead";
  const event = events.get(key);
  return `${scoutingTargetLabel({ event })} at ${coordText(x, y)}`;
}

function drawMinimapCoordinates(scaleX, scaleY) {
  minimapCtx.save();
  minimapCtx.font = "700 8px Trebuchet MS";
  minimapCtx.textBaseline = "top";
  minimapCtx.lineWidth = 1;
  minimapCtx.strokeStyle = "rgba(255,242,182,0.11)";
  minimapCtx.fillStyle = "rgba(255,242,182,0.74)";
  for (let x = 0; x < MAP_W; x += 10) {
    const px = Math.floor(x * scaleX);
    minimapCtx.beginPath();
    minimapCtx.moveTo(px + 0.5, 0);
    minimapCtx.lineTo(px + 0.5, minimap.height);
    minimapCtx.stroke();
    minimapCtx.fillText(String(x), px + 2, 2);
  }
  for (let y = 0; y < MAP_H; y += 10) {
    const py = Math.floor(y * scaleY);
    minimapCtx.beginPath();
    minimapCtx.moveTo(0, py + 0.5);
    minimapCtx.lineTo(minimap.width, py + 0.5);
    minimapCtx.stroke();
    minimapCtx.fillText(String(y), 2, py + 2);
  }
  minimapCtx.fillStyle = "#ffffff";
  minimapCtx.textAlign = "center";
  minimapCtx.fillText("N", Math.floor(minimap.width / 2), 2);
  minimapCtx.textAlign = "right";
  minimapCtx.textBaseline = "middle";
  minimapCtx.fillText("E", minimap.width - 3, Math.floor(minimap.height / 2));
  minimapCtx.textAlign = "center";
  minimapCtx.textBaseline = "bottom";
  minimapCtx.fillText("S", Math.floor(minimap.width / 2), minimap.height - 2);
  minimapCtx.textAlign = "left";
  minimapCtx.textBaseline = "middle";
  minimapCtx.fillText("W", 3, Math.floor(minimap.height / 2));
  minimapCtx.restore();
}

function drawMinimapFrame() {
  minimapCtx.save();
  minimapCtx.strokeStyle = "rgba(15,18,25,0.92)";
  minimapCtx.lineWidth = 4;
  minimapCtx.strokeRect(1, 1, minimap.width - 2, minimap.height - 2);
  minimapCtx.strokeStyle = "rgba(240,193,91,0.68)";
  minimapCtx.lineWidth = 1;
  minimapCtx.strokeRect(3.5, 3.5, minimap.width - 7, minimap.height - 7);
  minimapCtx.restore();
}

function minimapColorForEvent(event, visited) {
  if (event.type === "town") return visited ? "#68b36b" : "#f0c15b";
  if (event.type === "mine") return visited ? "#66a7d8" : "#f0c15b";
  if (event.type === "battle" || event.type === "gate" || event.type === "final") return visited ? "#4f5664" : "#d95d5d";
  if (["chest", "cache", "artifact", "supply"].includes(event.type)) return visited ? "#6f7075" : "#fff2b6";
  if (event.type === "npc") return visited ? "#8d6ea9" : "#c392e8";
  return visited ? "#6f7075" : "#f0c15b";
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
  const action = definition.type === "consumable" ? "Use" : equipped ? "Unequip" : "Equip";
  return `
    <div class="inventory-item">
      ${tradeItemIconMarkup(entry.id)}
      <div>
        <div class="item-name"><span>${definition.name}</span><span>x${entry.qty}</span></div>
        <p>${definition.description}</p>
      </div>
      <button type="button" data-use-item="${entry.id}">${action}</button>
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
  const portrait = unit.id && unitArtReady(unit.id) && unitCell(unit.id, 0)
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

function updateMobileTouchClass() {
  const hasTouch = navigator.maxTouchPoints > 0;
  document.documentElement.classList.toggle("mobile-touch", hasTouch);
}

updateMobileTouchClass();
window.addEventListener("resize", updateMobileTouchClass);

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !battleModalLocked()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);

document.addEventListener("keydown", (event) => {
  if (isEditableInputTarget(event.target)) return;
  const delta = keyMap[event.key];
  if (!delta) return;
  event.preventDefault();
  if (event.repeat) return;
  heldKeys.add(event.key);
  ensureHeldMovementLoop();
  if (!visual.moving) move(delta[0], delta[1]);
});

document.addEventListener("keyup", (event) => {
  if (isEditableInputTarget(event.target)) return;
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
musicVolumeSlider?.addEventListener("input", () => setMusicVolume(Number(musicVolumeSlider.value) / 100));
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
  refreshMusicMode();
  syncSnackbarHost();
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

questLog?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-track-quest]");
  if (!button) return;
  const [type, id] = button.dataset.trackQuest.split(":");
  setActiveQuest(type, id);
});

updateMusicVolumeUi();
renderAll();
window.setTimeout(openNamePrompt, 0);
requestAnimationFrame(animationLoop);
