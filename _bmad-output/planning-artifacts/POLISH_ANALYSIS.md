# Warriors of Daylight Polish Analysis

## Purpose

This document records the major polish work completed on the game so far, the player-facing impact of those changes, and the most meaningful remaining polish opportunities.

It is intentionally focused on gameplay presentation, UX clarity, and campaign readability rather than low-level code changes.

## Completed Polish

### Campaign Framing

- Unified the endgame destination around the northeast fortress instead of mixing tower, black tower, and fortress naming.
- Added a clearer campaign arc through staged objectives instead of a flat checklist.
- Improved the quest and objective presentation so the player sees a main objective and a side objective rather than equal-weight noise.
- Added a gate boss outside the fortress so the final area has a proper approach and escalation step before the last boss.

### Fortress and World Readability

- Surrounded the fortress with mountains so it reads as a defended final destination.
- Fixed fortress wall and gate rendering so the fortress silhouette is visible again.
- Removed the duplicated gate look and restored a clearer single entrance.
- Added region overlays, danger halos, and stronger destination presentation on the world map.
- Added region naming and first-entry flavor so world travel feels more authored.
- Added roadside landmarks such as signposts, ruins, camps, and monuments to make travel lanes feel deliberate instead of empty.

### Town Identity and Economy

- Added faction-specific town perks so towns matter mechanically:
  - `Grove`: recruit discount and blessing support
  - `Forge`: upgrade discount and drill support
  - `Tide`: trade income and levy payout
  - `Dusk`: scouting support and target marking
- Surfaced those perks in the town UI so faction identity is visible instead of hidden in backend rules.
- Moved building interaction onto the town square itself so town management feels spatial and direct.
- Added immediate build interaction from owned empty plots.

### Town Modal UX

- Reworked the town modal into a stronger management layout instead of a long stacked info dump.
- Reduced footer pressure by moving body-owned actions into the main content area.
- Removed the duplicate building panel from the default town view since the town square is the real building surface.
- Reworked the desktop layout so the town square sits beside the information column rather than above it on wider screens.
- Locked the desktop town modal to a more consistent height.
- Tightened spacing, typography, and card density to reduce wasted vertical space.
- Added clearer status treatment for `ready`, `used`, `built`, and `claim first` states.
- Restored full building names on town-square labels and adjusted the label container so names can wrap instead of being abbreviated.

### Town Interaction Feedback

- Added explicit feedback for faction actions, especially Grove Blessing.
- Fixed the Grove Blessing flow so it no longer silently closes or appears to do nothing.
- Rebuilt full modal refresh after town actions so button states and feedback remain in sync.
- Added selection persistence and stronger focus handling for town plots and recruit cards.
- Moved more detail into the feedback panel so the recruit list can be denser without losing clarity.

### Party Building Clarity

- Added clearer unit roles such as `Bulwark`, `Skirmisher`, `Artillery`, `Diver`, and `Vanguard`.
- Surfaced roles in recruit cards, party readouts, and combat-facing UI.
- Added a warband summary so the player can better understand current composition and missing roles.

### Night Cycle

- Turned the night cycle into a planning layer rather than just an interruption.
- Added three distinct night plans:
  - `Hold Fast`
  - `Night Raid`
  - `Scout Lines`
- Added camp upgrades with clearer tactical effects:
  - `Better Tent`
  - `Watchtower`
  - `Stake Traps`
  - `Healer Fire`
- Changed the night wave trigger so enemies do not start the battle until they actually reach the tent.
- Reworked the Nightfall menu into a control surface with body-owned plan and upgrade buttons.
- Fixed tactic selection so choosing a night plan actually updates and redraws the active Nightfall modal.
- Added a plan confirmation banner and stronger selected-state visuals.
- Added a camp-defense prep banner and tactical effect pills during the wave intro so the chosen plan carries into the actual encounter.

### Boss Presentation

- Added more specific boss structure to the gatekeeper and Orius.
- Improved pre-fight clarity for those encounters so they feel more like authored milestones.
- Strengthened the battle identity of the gate boss and final boss beyond simple stat inflation.

## Current Result

The game now reads more like an authored campaign than a prototype sandbox. The biggest improvements are:

- clearer campaign destination
- stronger world readability
- more distinctive town ownership and utility
- better town interaction clarity
- a more tactical night phase
- more legible roster-building decisions

The strongest UX gains came from making systems explain themselves better in the UI instead of requiring the player to infer hidden rules.

## Remaining High-Value Polish

### 1. Dawn Payoff Presentation

The night phase now has better planning and defense presentation, but the dawn aftermath still has room to feel more rewarding.

Best next improvements:

- a dawn summary panel showing what the chosen tactic did
- explicit breakdown of rewards, recovery, scouting, and surviving structures
- stronger emotional release after a successful night

### 2. Town Modal Final Trim

The town modal is much better, but still close to the content-density limit.

Best next improvements:

- collapse or progressively reveal recruit detail further
- combine Town Desk and Town Actions into an even tighter command column
- show stronger state badges for `used today`, `build now`, `needs barracks`, and `replace required`

### 3. Boss Aftermath and Victory Weight

Boss fights are more structured now, but their aftermath could feel more important.

Best next improvements:

- stronger pre-boss lead-in text
- more bespoke victory aftermath
- clearer sense that beating the gate boss changes the campaign state

### 4. More Authored World Moments

The map is more readable, but it can still become more memorable.

Best next improvements:

- more unique landmark interactions
- short route events or ambient discoveries
- stronger road identity near major destinations

### 5. Micro-Feedback Across Systems

Several systems are functional but still rely on the player noticing stat or gold changes.

Best next improvements:

- stronger feedback for healing, training, scouting, income, and faction perks
- clearer “what changed right now” messaging

## Recommended Next Priority

If polish continues, the best order is:

1. `Dawn payoff presentation`
2. `Final town modal trim`
3. `Boss aftermath presentation`
4. `More authored world moments`
5. `Extra micro-feedback across systems`

## Notes

- This document reflects implemented polish through the current local state of `game.js` and `styles.css`.
- It does not attempt to catalog every single code edit line-by-line.
- It is intended as a design and UX progress log, not a changelog.
