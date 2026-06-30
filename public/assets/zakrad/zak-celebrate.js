/* ============================================================
   Zak Rad — per-game integration.
   Drop ONE tag into any game and Zak Rad comes along for the ride:

     <script src="../assets/zakrad/zak-celebrate.js" defer></script>

   It bootstraps the shared mascot module (zak-rad.js + zak-rad.css),
   then:
     • celebrates every win — wraps the game's burstConfetti() so a
       throttled Zak "thumbs up" pops up whenever confetti fires;
     • shows a short "start" encouragement when the game loads;
     • gently nudges with "idle" encouragement after a quiet stretch.

   Games can also trigger Zak explicitly (every current AND future game
   uses the same hook):
     ZakCelebrate.big('Level complete!')   // high five
     ZakCelebrate.small('Correct!')        // thumbs up
     ZakCelebrate.encourage('retry')       // gentle support
     document.dispatchEvent(new CustomEvent('zak:celebrate',
        { detail: { level: 'big', message: 'You win!' } }));

   Opt out of the automatic win hook with <body data-zak-autohook="off">.
   ============================================================ */
(function () {
  'use strict';
  if (window.__zakCelebrateLoaded) return;
  window.__zakCelebrateLoaded = true;

  var thisScript = document.currentScript ||
    (function () { var s = document.getElementsByTagName('script'); return s[s.length - 1]; })();
  var BASE = (function () {
    try { return new URL('.', thisScript.src).href; }
    catch (e) { return 'assets/zakrad/'; }
  })();

  // ---- Inject shared CSS + module once ----
  function injectCSS(href) {
    if (document.querySelector('link[data-zak-css]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href; l.setAttribute('data-zak-css', '1');
    document.head.appendChild(l);
  }
  function injectJS(src, cb) {
    if (window.ZakRad && window.ZakRad.__ready) { cb(); return; }
    var existing = document.querySelector('script[data-zak-js]');
    if (existing) { whenReady(cb); return; }
    var s = document.createElement('script');
    s.src = src; s.setAttribute('data-zak-js', '1');
    s.onload = function () { whenReady(cb); };
    document.head.appendChild(s);
  }
  function whenReady(cb) {
    var tries = 0;
    (function poll() {
      if (window.ZakRad && window.ZakRad.__ready) return cb();
      if (tries++ > 200) return; // ~5s safety stop
      setTimeout(poll, 25);
    })();
  }

  injectCSS(BASE + 'zak-rad.css');

  injectJS(BASE + 'zak-rad.js', function () {
    var Z = window.ZakRad;

    // ---- Public, game-facing helpers ----
    window.ZakCelebrate = {
      big: function (msg) { Z.celebrate({ level: 'big', message: msg }); resetIdle(); },
      small: function (msg) { Z.celebrate({ level: 'small', message: msg }); resetIdle(); },
      celebrate: function (o) { Z.celebrate(o || {}); resetIdle(); },
      encourage: function (ctx, msg) { Z.encourage(ctx || 'streak', msg ? { message: msg } : {}); resetIdle(); }
    };

    // ---- Throttled auto-celebration on win (wraps burstConfetti) ----
    var lastPop = 0;
    var THROTTLE = 2500;
    function autoPop() {
      var now = Date.now();
      if (now - lastPop < THROTTLE) return;
      lastPop = now;
      Z.celebrate({ level: 'small' });
      resetIdle();
    }

    var autohookOff = document.body && document.body.getAttribute('data-zak-autohook') === 'off';
    if (!autohookOff) {
      var hookTries = 0;
      (function hookConfetti() {
        if (typeof window.burstConfetti === 'function' && !window.burstConfetti.__zakWrapped) {
          var orig = window.burstConfetti;
          var wrapped = function () {
            var r;
            try { r = orig.apply(this, arguments); } finally { autoPop(); }
            return r;
          };
          wrapped.__zakWrapped = true;
          try { window.burstConfetti = wrapped; } catch (e) {}
          return;
        }
        if (hookTries++ < 80) setTimeout(hookConfetti, 50); // catch late definitions (~4s)
      })();
    }

    // ---- "Start" encouragement, once, shortly after load ----
    setTimeout(function () {
      if (document.visibilityState !== 'hidden') Z.encourage('start');
    }, 900);

    // ---- Gentle "idle" nudge after a quiet stretch ----
    var idleTimer = null, idleCount = 0;
    function resetIdle() {
      clearTimeout(idleTimer);
      if (idleCount >= 3) return; // don't nag
      idleTimer = setTimeout(function () {
        if (document.visibilityState !== 'hidden') { idleCount++; Z.encourage('idle'); }
        resetIdle();
      }, 50000);
    }
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
      document.addEventListener(ev, resetIdle, { passive: true });
    });
    resetIdle();
  });
})();
