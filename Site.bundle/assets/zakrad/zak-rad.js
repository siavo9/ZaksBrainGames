/* ============================================================
   Zak Rad — the friendly fox guide of Zak's Brain Games.
   ONE reusable mascot module for the whole website.

   Provides:
     • <zak-rad pose="hero|pointing|walking|highfive|thumbsup|sitting"
                message="..." size="160" bob bubble="below|side">
       A reusable mascot element with an optional speech bubble.
     • window.ZakRad API:
         ZakRad.dailyFact()                -> today's fact (deterministic per day)
         ZakRad.encouragement(context)     -> a line from start|streak|retry|idle|win
         ZakRad.celebrate({level,message,pose})  -> celebration toast
         ZakRad.encourage(context,{message})     -> gentle encouragement toast
         ZakRad.poseUrl(name)              -> URL to a pose SVG
         ZakRad.mountFactCard(el)          -> fills a daily "Did you know?" card

   No build step, no framework. Works offline (data is embedded and also
   refreshed from the JSON files when fetch is available).
   ============================================================ */
(function () {
  'use strict';
  if (window.ZakRad && window.ZakRad.__ready) return; // singleton

  // ---- Locate sibling assets from this script's own URL ----
  var thisScript = document.currentScript ||
    (function () { var s = document.getElementsByTagName('script'); return s[s.length - 1]; })();
  var BASE = (function () {
    try { return new URL('.', thisScript.src).href; }
    catch (e) { return 'assets/zakrad/'; }
  })();

  var POSES = ['hero', 'pointing', 'walking', 'highfive', 'thumbsup', 'sitting'];
  var ALT = {
    hero: 'Zak Rad the fox standing proudly',
    pointing: 'Zak Rad the fox pointing with a helpful idea',
    walking: 'Zak Rad the fox walking along',
    highfive: 'Zak Rad the fox raising a paw for a high five',
    thumbsup: 'Zak Rad the fox giving a thumbs up',
    sitting: 'Zak Rad the fox sitting calmly'
  };

  // ---- Embedded data (canonical files: zak-facts.json / zak-encouragement.json).
  //      Embedded here so the mascot always works offline (e.g. inside the iOS
  //      web-view where file:// fetch can be restricted). Refreshed from JSON below. ----
  var FACTS = [
    "A group of flamingos is called a flamboyance. What a fancy name!",
    "Honey never goes bad. People have found honey in old tombs that's still good to eat!",
    "Octopuses have three hearts and blue blood.",
    "A bolt of lightning is hotter than the surface of the Sun.",
    "Butterflies taste with their feet.",
    "Your brain has about 86 billion tiny helpers called neurons.",
    "A cloud can weigh as much as 100 elephants, but it still floats!",
    "Sea otters hold hands while they sleep so they don't float away.",
    "The longest word you can type using only your left hand is 'stewardesses'.",
    "Sharks are older than trees. They've been around for over 400 million years!",
    "A snail can sleep for up to three years.",
    "Cows have best friends and feel happier when they're together.",
    "The Eiffel Tower can grow about 15 centimeters taller on a hot day.",
    "Hummingbirds are the only birds that can fly backwards.",
    "Bananas are berries, but strawberries are not!",
    "A jiffy is a real unit of time — it's about one hundredth of a second.",
    "Your heart beats around 100,000 times every single day.",
    "Wombats make poop shaped like cubes.",
    "There are more stars in the sky than grains of sand on all the world's beaches.",
    "A day on Venus is longer than a year on Venus.",
    "Penguins propose to each other with a pebble.",
    "Some turtles can breathe through their bottoms!",
    "The dot over a lowercase 'i' or 'j' is called a tittle.",
    "Elephants are the only animals that can't jump — but they're amazing swimmers.",
    "Rain has a smell. It's called petrichor.",
    "A shrimp's heart is in its head.",
    "Tigers have striped skin, not just striped fur.",
    "The Sun is so big that about one million Earths could fit inside it.",
    "Frogs drink water through their skin instead of their mouths.",
    "Your nose can remember about 50,000 different smells.",
    "Polar bears have black skin under their white fur.",
    "A group of owls is called a parliament.",
    "Sound can't travel in space because there's no air to carry it.",
    "Sloths can hold their breath longer than dolphins can.",
    "The smallest bone in your body is in your ear. It's the size of a grain of rice.",
    "Spiders can't fly, but baby spiders can float on silk threads in the wind.",
    "Carrots were originally purple, not orange.",
    "A blue whale's heart is so big a small child could crawl through its blood vessels.",
    "Ants never sleep, and they can carry things 50 times their own weight.",
    "There's enough water in a single cloud to fill thousands of bathtubs.",
    "The fastest land animal is the cheetah — it can run as fast as a car on the highway.",
    "Your bones are about four times stronger than concrete.",
    "Dolphins give each other names using special whistles.",
    "A rainbow is actually a full circle — we usually only see half of it from the ground.",
    "Bees can recognize human faces.",
    "The Great Wall of China is so long it would stretch across many countries.",
    "Kangaroos can't walk backwards.",
    "Lightning strikes the Earth about 8 million times a day.",
    "A teaspoon of soil has more living things in it than there are people on Earth.",
    "Giraffes only need about 30 minutes of sleep a day.",
    "Your fingernails grow faster than your toenails.",
    "Some frogs can freeze solid in winter and hop away in spring, good as new.",
    "An ostrich's eye is bigger than its brain.",
    "Pineapples take about two years to grow.",
    "The Moon is slowly drifting a little farther from Earth every year.",
    "Starfish don't have brains, but they can grow back a lost arm.",
    "A group of jellyfish is called a smack.",
    "The human body has enough water to fill about 40 large drinking glasses.",
    "Crocodiles have been around since the time of the dinosaurs.",
    "When you laugh, your brain gives your body a little burst of happy energy.",
    "Reading just 20 minutes a day helps your brain grow stronger and smarter.",
    "Mushrooms are more closely related to animals than to plants.",
    "A baby kangaroo is about the size of a jellybean when it's born.",
    "The tongue is the strongest muscle in your body for its size.",
    "Trees talk to each other through tiny underground threads.",
    "Camels store fat, not water, in their humps.",
    "Snowflakes always have six sides, and no two are exactly alike."
  ];
  var ENCOURAGEMENT = {
    start: ["You've got this!", "Let's have some fun!", "Ready, set, brain power!", "Time to shine!",
            "Your brain is warming up!", "Let's go, friend!", "I believe in you!", "Big fun ahead!"],
    streak: ["Smart move!", "You're on fire!", "Wow, keep going!", "Your brain is getting stronger!",
             "Amazing work!", "You're a star!", "Look at you go!", "Brilliant!"],
    retry: ["Almost! Try again.", "Good try! You can do it.", "Oops — let's give it another go!",
            "Mistakes help us learn. Keep going!", "So close! One more try.", "No worries, you're learning!",
            "Brave try! Let's try again together.", "Every try makes you smarter!"],
    idle: ["Still here? Let's play!", "Ready when you are!", "Take your time, friend.",
           "Need a hint? Just keep trying!", "I'm cheering for you!", "Let's get those brain muscles moving!"],
    win: ["You did it! High five!", "Hooray! Super job!", "Way to go, champion!", "Your brain rocks!",
          "Fantastic! I'm so proud!", "Yes! You're amazing!", "Woohoo! Brain power!", "Brilliant work, friend!"]
  };

  // ---- Helpers ----
  function poseUrl(name) {
    if (POSES.indexOf(name) === -1) name = 'hero';
    return BASE + 'zakrad-' + name + '.svg';
  }
  function wordmarkUrl() { return BASE + 'zakrad-wordmark.svg'; }
  function altFor(name) { return ALT[name] || 'Zak Rad the fox'; }

  function dayOfYear(d) {
    d = d || new Date();
    var start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
  }
  function dailyFact(date) {
    if (!FACTS.length) return '';
    return FACTS[dayOfYear(date) % FACTS.length];
  }
  function pick(arr, seed) {
    if (!arr || !arr.length) return '';
    if (typeof seed === 'number') return arr[Math.abs(seed) % arr.length];
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function encouragement(context) {
    var bank = ENCOURAGEMENT[context] || ENCOURAGEMENT.start;
    return pick(bank);
  }
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ---- Custom element <zak-rad> ----
  function buildFigure(opts) {
    var pose = opts.pose || 'hero';
    var fig = document.createElement('span');
    fig.className = 'zak-figure';
    if (opts.bubble === 'side') fig.setAttribute('data-bubble', 'side');

    var img = document.createElement('img');
    img.className = 'zak-img' + (opts.bob ? ' zak-bob' : '');
    img.src = poseUrl(pose);
    img.alt = opts.alt != null ? opts.alt : altFor(pose);
    if (opts.lazy) { img.loading = 'lazy'; img.decoding = 'async'; }
    if (opts.size) { img.style.width = (/^\d+$/.test(String(opts.size)) ? opts.size + 'px' : opts.size); }

    if (opts.message) {
      var bubble = document.createElement('span');
      bubble.className = 'zak-bubble';
      bubble.textContent = opts.message;
      if (opts.bubble === 'side') { fig.appendChild(img); fig.appendChild(bubble); }
      else { fig.appendChild(bubble); fig.appendChild(img); }
    } else {
      fig.appendChild(img);
    }
    return fig;
  }

  if ('customElements' in window && !customElements.get('zak-rad')) {
    var ZakRadElement = function () { return Reflect.construct(HTMLElement, [], ZakRadElement); };
    ZakRadElement.prototype = Object.create(HTMLElement.prototype);
    ZakRadElement.prototype.constructor = ZakRadElement;
    ZakRadElement.prototype.connectedCallback = function () {
      if (this.__built) return; this.__built = true;
      var pose = this.getAttribute('pose') || 'hero';
      this.appendChild(buildFigure({
        pose: pose,
        message: this.getAttribute('message'),
        size: this.getAttribute('size'),
        bob: this.hasAttribute('bob'),
        bubble: this.getAttribute('bubble') || 'below',
        lazy: this.hasAttribute('lazy'),
        alt: this.getAttribute('alt')
      }));
    };
    try { customElements.define('zak-rad', ZakRadElement); }
    catch (e) { /* older browsers: degrade gracefully */ }
  }

  // ---- Celebration / encouragement toast engine ----
  var layer = null, current = null, hideTimer = null;
  function ensureLayer() {
    if (layer && document.body.contains(layer)) return layer;
    layer = document.createElement('div');
    layer.className = 'zak-toast-layer';
    layer.setAttribute('aria-live', 'polite');
    layer.setAttribute('role', 'status');
    document.body.appendChild(layer);
    return layer;
  }
  function dismiss(toast) {
    if (!toast || toast.__leaving) return;
    toast.__leaving = true;
    clearTimeout(hideTimer);
    toast.classList.add('zak-leaving');
    var remove = function () { if (toast.parentNode) toast.parentNode.removeChild(toast); if (current === toast) current = null; };
    if (prefersReducedMotion()) setTimeout(remove, 220); else setTimeout(remove, 320);
  }
  function showToast(opts) {
    ensureLayer();
    if (current) dismiss(current);
    var toast = document.createElement('div');
    toast.className = 'zak-toast ' + (opts.toastClass || '');
    toast.setAttribute('role', 'status');

    var img = document.createElement('img');
    img.className = 'zak-toast-art';
    img.src = poseUrl(opts.pose);
    img.alt = altFor(opts.pose);
    img.decoding = 'async';

    var msg = document.createElement('span');
    msg.className = 'zak-toast-msg';
    msg.textContent = opts.message;

    var close = document.createElement('button');
    close.className = 'zak-toast-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Dismiss message from Zak Rad');
    close.textContent = '×';
    close.addEventListener('click', function () { dismiss(toast); });

    toast.appendChild(img);
    toast.appendChild(msg);
    toast.appendChild(close);
    layer.appendChild(toast);
    current = toast;

    var dur = opts.duration || 3200;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () { dismiss(toast); }, dur);
    // Keyboard dismiss (Escape) while a toast is visible
    var onKey = function (e) { if (e.key === 'Escape') { dismiss(toast); document.removeEventListener('keydown', onKey); } };
    document.addEventListener('keydown', onKey);
    return toast;
  }

  function celebrate(opts) {
    opts = opts || {};
    var level = opts.level === 'big' ? 'big' : 'small';
    var pose = opts.pose || (level === 'big' ? 'highfive' : 'thumbsup');
    var message = opts.message || encouragement(level === 'big' ? 'win' : 'streak');
    return showToast({
      pose: pose,
      message: message,
      toastClass: level === 'big' ? '' : 'zak-toast-small',
      duration: opts.duration || (level === 'big' ? 3600 : 2800)
    });
  }
  function encourage(context, opts) {
    opts = opts || {};
    var poseByCtx = { start: 'walking', streak: 'thumbsup', retry: 'pointing', idle: 'sitting', win: 'highfive' };
    return showToast({
      pose: opts.pose || poseByCtx[context] || 'pointing',
      message: opts.message || encouragement(context),
      toastClass: 'zak-toast-encourage',
      duration: opts.duration || 2600
    });
  }

  // ---- Daily fact card filler ----
  function mountFactCard(el) {
    if (!el) return;
    var textEl = el.querySelector('.zak-fact-text');
    if (textEl) textEl.textContent = dailyFact();
  }

  // ---- Public API ----
  var api = {
    __ready: true,
    base: BASE,
    poses: POSES.slice(),
    poseUrl: poseUrl,
    wordmarkUrl: wordmarkUrl,
    altFor: altFor,
    figure: buildFigure,
    dayOfYear: dayOfYear,
    dailyFact: dailyFact,
    encouragement: encouragement,
    celebrate: celebrate,
    encourage: encourage,
    toast: showToast,
    dismiss: function () { dismiss(current); },
    mountFactCard: mountFactCard,
    facts: FACTS,
    encouragementBank: ENCOURAGEMENT
  };
  window.ZakRad = api;

  // ---- Try to refresh data from the canonical JSON (web / when fetch allowed) ----
  // Skipped under file:// (e.g. the offline iOS web-view), where cross-origin
  // file fetch is blocked — the embedded data above is used instead.
  function tryLoad(file, onOk) {
    if (location.protocol === 'file:' || typeof fetch !== 'function') return;
    try {
      fetch(BASE + file, { cache: 'no-cache' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { if (j) onOk(j); })
        .catch(function () {});
    } catch (e) {}
  }
  tryLoad('zak-facts.json', function (j) { if (Array.isArray(j.facts) && j.facts.length) { FACTS.length = 0; Array.prototype.push.apply(FACTS, j.facts); } });
  tryLoad('zak-encouragement.json', function (j) {
    ['start', 'streak', 'retry', 'idle', 'win'].forEach(function (k) {
      if (Array.isArray(j[k]) && j[k].length) ENCOURAGEMENT[k] = j[k];
    });
  });

  // ---- Listen for celebration events from any game ----
  document.addEventListener('zak:celebrate', function (e) { celebrate((e && e.detail) || {}); });
  document.addEventListener('zak:encourage', function (e) {
    var d = (e && e.detail) || {}; encourage(d.context || 'streak', d);
  });
})();
