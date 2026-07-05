# Claude Code Prompt — Add "Zak Rad the Graduate" mascot to Zak's Brain Games

Copy everything in the block below into a Claude Code session opened at the root of the `zaksbraingames.com` project.

---

## Your task

Integrate our brand mascot, **Zak Rad the Graduate**, throughout the Zak's Brain Games product — the website and the Xcode app — then commit and push to `main`.

Zak Rad is a friendly, cuddly cartoon fox in a navy graduation cap. He is the helpful guide of Zak's Brain Games: he shares interesting daily facts, encourages players, and celebrates when they do well. Personality: warm, upbeat, smart-but-never-condescending, playful, kid-friendly. He always speaks in short, encouraging, simple sentences.

## Mascot art assets (already created)

The artwork lives in this repo-adjacent folder:

```
Zak Rad Mascot/
├── transparent-cutouts/      ← USE THESE on web/app (transparent PNG, ~2000px)
│   ├── zakrad-hero.png        (confident, hands on hips — main/hero use)
│   ├── zakrad-pointing.png    (pointing — tips, "did you know", call-to-action)
│   ├── zakrad-walking.png     (walking — loaders, transitions, empty states)
│   ├── zakrad-highfive.png    (high five — big win / level complete celebration)
│   ├── zakrad-thumbsup.png    (thumbs up — correct answer / good progress)
│   └── zakrad-sitting.png     (sitting calmly — daily fact card, idle/helper)
├── full-background/           (same poses on cream background — print/social only)
└── branded/                   (logo lockups with wordmark — headers/footers/favicons)
    ├── zakrad-with-wordmark.png
    └── zakrad-the-graduate-badge.png
```

**Step 1 — bring the assets in.** Copy the `transparent-cutouts/` files into the website's image/assets directory and into the Xcode asset catalog (`Assets.xcassets`, as an image set per pose, with @1x/@2x/@3x as appropriate). Optimize for web: generate compressed PNGs and, ideally, WebP versions; produce smaller display sizes (e.g. 256px and 512px) rather than shipping the 2000px originals. Keep the originals in the repo under an `assets/source/` (or similar) path.

## Before you change anything — discover the stack

Do not assume the framework. First inspect the repo and report back briefly:

1. Identify the web stack (e.g. static HTML/CSS/JS, React/Next, Vue, Astro, etc.), the build tooling, and where shared UI components and images live.
2. Identify the games — how each game is implemented, and where "win" / "correct answer" / "score" logic lives, so you know where to fire celebration events.
3. Identify the Xcode project (Swift/SwiftUI or UIKit, or a wrapper around the web app) and how it shares code/assets with the web.
4. Check for any existing mascot, character, or "Zak" references to avoid duplication and to match existing naming conventions.

Then build a short implementation plan and proceed.

## What to build

Build a single, reusable mascot system — not one-off copies. Create one **`ZakRad` component/module** (web) and an equivalent reusable view (Xcode), with a `pose` prop/parameter (`hero | pointing | walking | highfive | thumbsup | sitting`) and an optional speech-bubble message. Reuse it everywhere below.

### 1. Daily interesting fact
- A "Did you know?" card featuring Zak Rad (use `sitting` or `pointing`) that shows one interesting, kid-appropriate fact per day.
- The fact should change daily and be deterministic per calendar day (same fact for everyone on a given day). Prefer a local curated facts list (create `zak-facts.json` with at least 60 fun, accurate, age-appropriate facts) selected by day-of-year, so it works offline and needs no API. If the project already has a backend/CMS, wire it there instead.
- Place this card prominently on the homepage and make it reusable so it can also appear on a games hub / dashboard.

### 2. Encouragement
- Zak Rad offers short rotating encouragement messages (e.g. "You've got this!", "Smart move!", "Keep going — your brain is getting stronger!").
- Show encouragement at sensible moments: when a player starts a game, when they're mid-game on a streak, and gently if they get something wrong (always supportive, never negative).
- Keep a small message bank (`zak-encouragement.json`) grouped by context: `start`, `streak`, `retry`, `idle`.

### 3. Game celebrations (pop-up)
- When a player does well — wins a game, completes a level, hits a high score, or gets a correct answer / streak — Zak Rad pops up to celebrate.
- Use `highfive` for big wins / level complete, `thumbsup` for smaller wins / correct answers.
- Implement as a lightweight, dismissible overlay/toast with a short celebratory line and a subtle entrance animation (slide/bounce/fade). It must auto-dismiss and never block gameplay.
- Wire it into each game's success path via a shared event (e.g. a `celebrate(level)` helper or a custom event/callback) so every current and future game can trigger it the same way.

### 4. Integrate in several places on the main site
At minimum:
- **Hero / header** of the homepage: `zakrad-hero` greeting the visitor, with a one-line welcome.
- **Daily fact card** (section 1).
- **Games hub / between sections**: `zakrad-walking` or `zakrad-pointing` guiding users toward games.
- **Footer or "About"**: small Zak Rad with a friendly sign-off; use the branded wordmark lockup where a logo fits.
- **Loading / empty / transition states**: `zakrad-walking`.
Use tasteful, non-intrusive placement — he should feel like a helpful companion, not clutter.

## Quality requirements (apply everywhere)
- **Responsive**: looks right on mobile, tablet, desktop. Don't let Zak overlap content or block tap targets on small screens.
- **Accessible**: every mascot image needs meaningful `alt` text (e.g. "Zak Rad the fox giving a thumbs up"); celebration pop-ups must be screen-reader friendly (`aria-live="polite"`) and keyboard-dismissible; decorative-only instances use empty alt.
- **Reduced motion**: respect `prefers-reduced-motion` — disable/replace bounce animations.
- **Performance**: lazy-load below-the-fold mascot images; serve appropriately sized/compressed assets; no layout shift.
- **Consistent**: all copy in Zak's voice (short, warm, encouraging, simple words). Centralize his messages in the JSON files above so they're easy to edit.
- **Match existing conventions**: follow the repo's component patterns, file structure, styling approach, and linting.

## Deliverables, commits, and push
1. Implement all of the above on the website **and** in the Xcode project, keeping assets in sync between them.
2. Make sure the project builds/lints/tests cleanly (run the web build and, if possible, the Xcode build). Fix anything that breaks.
3. Manually sanity-check: homepage shows hero + daily fact; playing a game and doing well triggers a celebration pop-up; encouragement appears; everything is responsive and accessible.
4. Use clear, conventional commit messages (e.g. `feat(mascot): add Zak Rad daily facts, encouragement, and game celebrations`).
5. Commit to the **local project folder**, then **push to `main`** on GitHub. Confirm the push succeeded and report the commit hash and a summary of every file added/changed.

## Guardrails
- If anything is ambiguous (stack, where win-logic lives, asset directory conventions), inspect the code and choose the option most consistent with the existing project; note your choices in your summary.
- Don't break existing functionality. If a change is risky, isolate it behind the reusable component and explain.
- Keep all facts accurate and age-appropriate; do not invent shaky "facts."

---

*End of prompt.*
