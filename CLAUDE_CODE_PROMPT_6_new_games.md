# Claude Code Build Prompt — Add 6 New Games to Zak's Brain Games

> **How to use:** Open Claude Code in the `Zak's Brain Games` project folder and paste everything below the line as a single prompt.

---

You are working in the **Zak's Brain Games** repo (the website + iOS app live together here). Build **6 new educational games** for kids and integrate each one fully into the site and app, following the EXISTING conventions exactly. Do all 6 in this one task.

## Critical architecture facts (read first — do not deviate)

- **`public/` is the single source of truth.** The website is the static site in `public/`. The iOS app (`Zak's Brain Games.xcodeproj`) bundles `public/` via an Xcode **folder reference**, so anything I add to `public/` automatically ships in the app at build time. **Do NOT edit the `.xcodeproj`, do NOT add files to Xcode manually, and do NOT touch `Site.bundle`** (it's legacy and unused by the current app). Just work in `public/` (+ `server.js`, `public/sitemap.xml`).
- **Each game is one self-contained folder** `public/<slug>/index.html` — a single HTML file with inline CSS + JS. **Fully offline: no external network requests, no CDNs, no trackers, no ads, no analytics.** Match the existing games (look at `public/carmath/index.html`, `public/coincountercafe/index.html`, `public/animalkingdomsort/index.html` as references for structure, nav, modal, and style).
- **Fonts** are self-hosted at `public/fonts/` (`Fredoka`, `Bubblegum Sans`) — reference them the same way existing games do (relative path `../fonts/...`). No Google Fonts.
- **Audio is required** because many players can't read yet. Use the Web Speech API (`speechSynthesis`) for spoken instructions/feedback like the existing games, and the Web Audio API for sound effects/music. Wrap all audio in try/catch and a user-gesture unlock so it degrades gracefully.
- Read the current `public/index.html` carefully before editing — you must add to the `PREVIEWS` object, the `GAMES` array, and the JSON-LD `Game` list, all in the right places.

## The 6 games, slugs, and metadata

| Game | Slug (folder) | Emoji | Age badge | `theme` | `badge` (category) |
|------|---------------|-------|-----------|---------|--------------------|
| Robo Recess | `roborecess` | 🤖 | `Ages 4+` | `card-blue` | `🧩 Logic & Coding` |
| Sound Soup | `soundsoup` | 🔤 | `Ages 4+` | `card-coral` | `📖 Words & Reading` |
| Pattern Express | `patternexpress` | 🚂 | `Ages 4+` | `card-yellow` | `🔢 Patterns & Math` |
| Dino Don't! | `dinodont` | 🦖 | `Ages 5+` | `card-orange` | `⚡ Focus & Self-Control` |
| Mailbot Maze | `mailbotmaze` | 🗺️ | `Ages 5+` | `card-mint` | `🧭 Mazes & Maps` |
| Echo Beats | `echobeats` | 🥁 | `Ages 6+` | `card-purple` | `🎵 Music & Memory` |

(If any `theme` color is already heavily used near where you insert, pick another existing `.card-*` class — available: `card-blue, card-coral, card-mint, card-orange, card-pink, card-purple, card-yellow`.)

---

## SHARED requirements for EVERY game (apply to all 6)

**Structure & navigation (copy the existing pattern from `public/carmath/index.html`):**
- A top nav with three buttons styled like the existing `.nav-btn`s:
  - `🏠 Game Home` → resets the game to its own start/home screen (`goHome()`).
  - `🧠 More Brain Games` → links to `../index.html` (back to zaksbraingames home).
  - `❓ How to Play` → opens a `How to Play` modal (reuse the existing `#how-modal` / `openHowTo()` pattern).
- A **home/start screen** inside the game with the title, a one-line tagline, a big **Play** button, and an age/skill note.
- A **How to Play modal** with clear, kid-parent-friendly rules written as short steps (see each game's "How to Play text" below — use that copy).
- An **end-of-round / win celebration** with confetti (match the confetti the other games use) plus a "Play Again" and "Game Home" option.

**Gameplay feel (every game):**
- **Low floor, high ceiling + adaptive difficulty:** the first round must be winnable by a 4–6 year old; difficulty ramps automatically as the child succeeds and eases if they struggle. No "Game Over" — mistakes are gentle, reversible, and encourage retry.
- **Immediate multisensory feedback** on every tap/drag: visual reaction + sound + (where natural) a spoken word.
- **Big touch targets**, generous spacing, works with touch and mouse, responsive from phone to iPad. Test that it's playable one-handed on a phone-width screen.
- **No reading required to start:** spoken instructions on the home screen and at the start of each round.
- **Short rounds** (~1–3 min) with a clear, satisfying stopping point.
- Bright, rounded, playful visuals consistent with the site (Fredoka/Bubblegum Sans, soft shadows, pastel/jewel palette, friendly characters via emoji or inline SVG).
- Keep everything in ONE `index.html` per game. No build step.

**Accessibility:** `aria-label`s on interactive elements (match existing games), keyboard focusable controls, sufficient contrast, captions/text alongside audio.

---

## SITE & APP INTEGRATION — do this for all 6 (this is mandatory, not optional)

For **each** game, after building `public/<slug>/index.html`:

1. **`public/index.html` → `PREVIEWS` object:** add an inline-SVG preview thumbnail keyed in camelCase (e.g. `roboRecess`, `soundSoup`, `patternExpress`, `dinoDont`, `mailbotMaze`, `echoBeats`). Match the existing previews: `viewBox="0 0 320 200"`, `preserveAspectRatio="xMidYMid slice"`, bright art that visually hints at the game (a robot on a grid, letter tiles in a pot, a pattern train, a green/red dino, a maze with a mail truck, drums/notes). Keep them lightweight inline SVG like the others.

2. **`public/index.html` → `GAMES` array:** add an entry with this exact shape, placed **in age order** (the array is grouped roughly by age 3+ → 4+ → 5+ → 6+ → 10+; insert each new game next to others of the same age badge so the grid stays organized by age):
   ```js
   {
     name: 'Robo Recess',
     url: 'roborecess/index.html',
     emoji: '🤖',
     preview: PREVIEWS.roboRecess,
     desc: '<one or two playful sentences — see per-game desc below>',
     badge: '🧩 Logic & Coding',
     age: 'Ages 4+',
     theme: 'card-blue'
   },
   ```

3. **`public/index.html` → JSON-LD structured data:** add a matching entry to the `@type: "Game"` list near the top, in the same age order:
   ```json
   { "@type": "Game", "name": "Robo Recess", "url": "roborecess/index.html", "typicalAgeRange": "4-" },
   ```
   (Use `4-`, `5-`, or `6-` to match the age badge.)

4. **`public/sitemap.xml`:** add a `<url>` block for each game folder, matching the existing entries:
   ```xml
   <url><loc>https://zaksbraingames.app/roborecess/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
   ```

5. **`server.js`:** add a friendly folder route for each game **before** the `app.get('*', ...)` fallback, matching the existing pattern:
   ```js
   // Robo Recess game page (folder-based: /roborecess/index.html)
   app.get(['/roborecess', '/roborecess/'], (req, res) => {
     res.sendFile(path.join(__dirname, 'public', 'roborecess', 'index.html'));
   });
   ```

**Do NOT modify the Xcode project or Site.bundle** — the app picks up `public/` automatically.

---

## PER-GAME SPECS

For each game below: build the mechanic exactly as described, make it genuinely fun AND educational, and use the provided description + How-to-Play copy.

---

### 1. 🤖 Robo Recess — `roborecess` — Ages 4+ — Logic & Coding
**Learning goal:** computational thinking (sequencing, planning, debugging) + spatial reasoning (direction & mental rotation).

**Card desc (use in GAMES array):** `Program a friendly robot to reach its star! Drag arrow steps, press GO, and watch your plan come to life. A first taste of coding and planning.`

**Mechanic:**
- A grid (start small, e.g. 3×3, growing to ~5×5) with the robot at a start cell facing a direction, and a goal (⭐) cell. Optional collectibles and simple walls/obstacles on later levels.
- The child builds a **program** by dragging/tapping picture-blocks into a horizontal "command strip": **Forward (⬆️)**, **Turn Left (↩️)**, **Turn Right (↪️)**. (Add a **Repeat ×2/×3 loop block** only from the harder levels, for the 6–7 crowd.)
- Big green **GO** button runs the program: the robot animates **one block per step** with a beep per step so non-readers can follow. It executes literally — this is the lesson.
- **Success:** robot lands on the star → confetti + spoken praise + collect the star. **Miss / bump a wall:** robot waddles back to start with a gentle "oops, let's fix it!" so the child can edit the sequence (debugging, no penalty).
- A "Step" / "Clear" button to remove blocks. Show the program clearly so kids connect plan → action.

**Progression (auto-adaptive):** L1 = 1–2 forward steps, no turns. Then a single turn. Then obstacles. Then "collect all stars then reach goal." Then loop block. Optional "do it in N steps or fewer" star challenge for a high ceiling.

**How to Play text (modal):**
- "🤖 Your robot wants to reach the ⭐ star!"
- "1. Tap the arrow blocks to add steps: go forward, turn left, or turn right."
- "2. Press the big GO button and watch your robot follow your plan."
- "3. Didn't make it? No problem — fix your steps and try again!"
- "Tip: think about which way the robot is facing before you turn."

---

### 2. 🔤 Sound Soup — `soundsoup` — Ages 4+ — Words & Reading
**Learning goal:** phonics — hearing individual letter-sounds and **blending** them into a word (the skill that unlocks reading). Pure CVC (consonant-vowel-consonant) words.

**Card desc:** `Drop letters in the pot, hear each sound, then BLEND them to make a word — and a silly creature pops out! A playful first step into sounding out words.`

**Mechanic:**
- Three letter-tiles drop into a bubbling cartoon pot, e.g. **c · a · t**.
- Tapping a tile plays that letter's **phoneme** (the sound, e.g. "kuh", "aa", "tuh") — NOT the letter name. (Important: record/define clean per-letter phoneme audio; if using `speechSynthesis`, approximate sounds with short utterances and slow rate, and prefer a small set of well-tested CVC words so the audio sounds right.)
- Tap the pot to **blend**: the three sounds animate together, speeding up and merging ("c-a-t… cat!"), and the matching **creature/object** (a 🐱 CAT) pops out of the soup with a spoken word + picture.
- Child collects each made word into a **"Recipe Book / Creature Cookbook"** (a simple gallery) — the collection drives replay.

**Content:** Curated CVC word lists grouped by **word family / vowel** (e.g. -at: cat, hat, bat, mat; -ig: pig, wig, dig; -un: sun, bun, run), each with a clear picture/emoji. Keep words concrete and picturable.

**Progression:** (a) Picture shown + sounds auto-played, child just taps blend (recognition). (b) Child taps each sound themselves, then blends. (c) "Build the word for this picture" — choose the right tiles from a small set. (d) Later: simple digraphs (sh, ch) and 4-sound words.

**How to Play text (modal):**
- "🔤 Let's cook up a word!"
- "1. Tap each letter to hear its sound."
- "2. Tap the pot to blend the sounds together."
- "3. Listen as the sounds become a word — and meet the creature that pops out!"
- "4. Collect every word in your Recipe Book."

---

### 3. 🚂 Pattern Express — `patternexpress` — Ages 4+ — Patterns & Math
**Learning goal:** patterning / early algebra — recognizing, extending, and creating repeating and growing patterns.

**Card desc:** `Keep the train rolling! Spot the pattern and pick the next car. A fun way to build the pattern-and-logic skills that lead to math.`

**Mechanic:**
- A train is being assembled; its cars follow a pattern (color, shape, animal, or size), e.g. 🔴🔵🔴🔵❓.
- Child taps the correct next car from 2–3 choices. Correct → the car snaps on and the train chugs forward a bit with a happy choo-choo + sound; wrong → the car gently bounces back with a hint (briefly highlight the repeating unit).
- Complete the pattern → train rolls off the screen with confetti, next pattern loads.

**Content & progression:** AB (red-blue…) → AABB → ABC → ABB → **growing patterns** (1 block, 2 blocks, 3 blocks…) → fill a gap in the **middle** of the pattern (harder than the end) → **"Make your own pattern" creative mode** where the child builds a pattern and the train tests it. Vary the dimension (color/shape/size/animal) to build abstraction.

**How to Play text (modal):**
- "🚂 The train needs its next car!"
- "1. Look at the pattern of cars already on the train."
- "2. Tap the car that comes next to keep the pattern going."
- "3. Finish the pattern and watch the train roll away!"
- "Tip: say the pattern out loud — 'red, blue, red, blue…' — to hear what comes next."

---

### 4. 🦖 Dino Don't! — `dinodont` — Ages 5+ — Focus & Self-Control
**Learning goal:** inhibitory control (a core executive function) — a Go/No-Go task: act on "go" cues, **resist** acting on "no-go" cues.

**Card desc:** `Feed the hungry green dinos — but DON'T tap the full red ones! A giggly test of focus and self-control that strengthens the "thinking brain".`

**Mechanic:**
- Friendly dinos pop up one at a time in a picnic scene.
- **Green dinos = hungry:** tap to feed → "yum!" + point. **Red dinos = full/grumpy:** do NOT tap; if the child correctly waits the short window out → "phew!" + point. Tapping a red dino → gentle giggle/"he was full!" with no harsh penalty (just no point), and a quick encouraging line.
- Each dino is on screen for a short window (~1.2–1.8s) that shortens as the child improves. Light, celebratory time pressure — never stressful.
- Track a streak and a friendly score (e.g. "happy dinos fed").

**Progression:** Start mostly green (easy go-trials) → increase red frequency → speed up the spawn → for the 6–7 crowd add a **rule-flip twist** ("Now feed the RED ones!") which also exercises cognitive flexibility. Keep the response window age-appropriate (5-year-olds need more time).

**How to Play text (modal):**
- "🦖 The dinos are at a picnic!"
- "1. Tap the GREEN dinos — they're hungry and want food!"
- "2. DON'T tap the RED dinos — they're full and grumpy."
- "3. Watch closely and only tap when you should. Can you keep your streak going?"

---

### 5. 🗺️ Mailbot Maze — `mailbotmaze` — Ages 5+ — Mazes & Maps
**Learning goal:** spatial navigation, route planning, and early map reading.

**Card desc:** `Help the mail truck deliver the letter! Trace a path through the streets, dodge dead ends, and plan the perfect route. Builds spatial smarts.`

**Mechanic:**
- A top-down town/maze with a **mail truck** at start and a destination (🏠 house / 🐶 puppy waiting for mail). The child traces a route by **finger-drag** (snapping to the path), avoiding walls/dead-ends and optional puddles.
- A clear **GO** option drives the truck along the chosen route (encourage *planning first* on later levels rather than pure trial-and-error). Reaching the goal → delivery celebration + confetti + spoken praise.
- Optional **packages** to pick up en route add a collection/route-optimization goal.

**Progression:** Big simple mazes with wide paths → tighter mazes → "collect all 3 packages, then deliver" (planning a route that hits multiple points) → introduce a small **map/legend** the child reads to choose turns (map literacy). For 6–7: "find the shortest path" star challenges.

**How to Play text (modal):**
- "🗺️ The mail truck has a letter to deliver!"
- "1. Find the truck and the house it needs to reach."
- "2. Drag your finger to draw a path through the streets."
- "3. Avoid dead ends — then press GO and watch the delivery!"
- "Tip: plan your whole route before you start driving."

---

### 6. 🥁 Echo Beats — `echobeats` — Ages 6+ — Music & Memory
**Learning goal:** auditory sequence memory (working memory) + rhythm/timing. (A musical "Simon" — also supports the sound-awareness that helps reading.)

**Card desc:** `Listen to the animal band's beat, then tap it back! Each round adds a sound and builds your own song. Grows your memory and your sense of rhythm.`

**Mechanic:**
- A band of animal-instrument pads (e.g. 🐸 frog-drum, 🐤 bird-chime, 🐱 cat-bongo, 🐘 elephant-bass) — each pad has a distinct sound + color + animation.
- The band **plays a short sequence** (lights up pads in order with sound). The child **taps the pads back in the same order**. Correct → the sequence grows by one and the backing groove gets richer; a miss → friendly "hiccup," replay the same sequence (no harsh fail).
- Each successful round literally **builds a little song**, so by round 5 the child has made a jam — strong intrinsic reward.

**Progression:** Start at 2 in the sequence, grow by one per success (classic memory span). Increase the number of pads (more choices = harder). For older/advanced play, add a **rhythm/timing layer** (tap roughly *in time*, not just in order) and a "compose your own loop" free-play mode. Audio-driven so it works for all reading levels.

**Technical note:** Use the Web Audio API to synthesize the pad tones/percussion (no audio files needed) so it stays offline and lightweight. Provide a visual cue on every sound for kids who play with sound off.

**How to Play text (modal):**
- "🥁 The animal band wants to play with you!"
- "1. Watch and listen as the band plays a beat."
- "2. Tap the same animals in the same order to play it back."
- "3. Get it right and the beat grows — build your own song!"
- "Tip: hum or say the sounds in order to help you remember."

---

## FINISH-UP CHECKLIST (do all of these before you're done)

1. ✅ Built all 6 self-contained games at `public/<slug>/index.html`, offline, with nav buttons (Game Home / More Brain Games / How to Play), home screen, How-to modal with the provided copy, adaptive difficulty, audio + confetti.
2. ✅ For each game: added `PREVIEWS.<camelCaseKey>` inline-SVG thumbnail, a `GAMES` array entry **in age order**, and a JSON-LD `Game` entry — all in `public/index.html`.
3. ✅ Added `<url>` entries to `public/sitemap.xml` and folder routes to `server.js` (before the `*` fallback) for all 6.
4. ✅ Did NOT touch the Xcode project or `Site.bundle`.
5. ✅ **Verify:** run `node server.js` locally, open `http://localhost:3000`, confirm all 6 new cards appear in the grid grouped by age, each thumbnail loads, clicking a card opens the game, "More Brain Games" returns to the home page, and each game is playable start-to-finish on a phone-width viewport with audio working. Fix anything broken.
6. ✅ Sanity-check the JS console for errors on the home page and in each game.
7. Then summarize what you built and what I should do next (commit & push → Vercel auto-deploys the site; open Xcode → Build/Archive to ship the app update).
