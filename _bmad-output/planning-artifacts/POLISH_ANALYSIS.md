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
- Added clearer claimed-mine ownership signalling.

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
- Replaced the dense Town Command info dump with an `Available now` panel.
- Moved lower-priority control, faction, barracks, and building details into a compact drawer.

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

### Battle Readability

- Added a unified Battle Focus panel for acting unit, target, and immediate tactical guidance.
- Removed the old mobile-only battle dashboard so mobile does not show duplicate combat instructions.
- Added enemy intent chips for active or selected enemies.
- Kept all explicit battle buttons available on mobile instead of collapsing them into a hidden smart action.
- Added a one-time first-battle hint explaining unit selection, target selection, action buttons, and enemy intent.

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

### Dawn Payoff

- Added a stronger Dawn modal with a visual sunrise treatment.
- Moved detailed accounting into a disclosure drawer so the player first sees outcomes, not raw bookkeeping.
- Surfaced tactic results, recovery, scouting, income, and camp status as clear payoff cards.

### Boss Presentation

- Added more specific boss structure to the gatekeeper and Orius.
- Improved pre-fight clarity for those encounters so they feel more like authored milestones.
- Strengthened the battle identity of the gate boss and final boss beyond simple stat inflation.
- Added bespoke sealed-gate, gate-victory, and final-victory presentations.
- Clarified that relic and outpost objectives unlock the gate boss, not victory itself.
- Changed the post-gate campaign objective to point directly at the fortress heart.
- Added visual state changes for the cleared gate and open fortress.

### Micro-Feedback

- Added snackbars only for meaningful actions such as rewards, blocked progress, level gains, equipment changes, and major campaign beats.
- Prevented snackbar spam from routine flavor text, saves, scouting hints, and passive status updates.
- Moved mobile snackbars away from walk controls.

### Quest and Post-Victory Polish

- Made secondary quest groups collapsible so the sidebar no longer gives optional work the same visual weight as the main objective.
- Added open-count summaries to collapsed quest groups.
- Changed the post-victory objective state into cleanup/exploration instead of continuing to point at the defeated fortress boss.
- Added cleanup guidance for remaining mines, towns, and outposts after campaign victory.

### Town Affordance Polish

- Converted actionable `Available now` town chips into real buttons.
- Kept non-actionable town chips passive so status summaries do not look like broken controls.
- Routed build, use, recruit, and faction-order chips to the same existing town systems as the square and command buttons.

## Current Result

The game now reads more like an authored campaign than a prototype sandbox. The biggest improvements are clearer campaign destination, stronger world readability, more distinctive town ownership and utility, better town interaction clarity, a more tactical night phase, more readable battles, and more legible roster-building decisions.

The strongest UX gains came from making systems explain themselves better in the UI instead of requiring the player to infer hidden rules.

## Remaining Low-Risk Polish Ideas

The high-value polish items from this analysis have been implemented. Remaining work is optional refinement rather than a clear blocker.

Possible next refinements:

- add a richer post-victory epilogue screen if the game needs a stronger ending beat
- add more unique landmark text variants if repeated playthroughs start feeling samey
- tune exact combat numbers from longer playtests rather than changing balance from short smoke tests

## Recommended Next Priority

If polish continues, the best order is:

1. `Longer balance playtest`
2. `Post-victory epilogue`
3. `More landmark variants`

## Notes

- This document reflects implemented polish through the current local state of `game.js` and `styles.css`.
- It does not attempt to catalog every single code edit line-by-line.
- It is intended as a design and UX progress log, not a changelog.
