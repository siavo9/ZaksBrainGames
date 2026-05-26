/* empty css              */(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function n(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(r){if(r.ep)return;r.ep=!0;const i=n(r);fetch(r.href,i)}})();const B=new Date("2026-01-01T00:00:00");function h(t=new Date){const e=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),s=String(t.getDate()).padStart(2,"0");return`${e}-${n}-${s}`}function M(t=new Date){const n=new Date(t.getFullYear(),t.getMonth(),t.getDate())-B;return Math.floor(n/(1e3*60*60*24))+1}function L(t){let e=t|0||1;return()=>(e^=e<<13,e^=e>>>17,e^=e<<5,(e>>>0)/4294967295)}function A(t){let e=2166136261;for(let n=0;n<t.length;n++)e^=t.charCodeAt(n),e=Math.imul(e,16777619);return e>>>0}function E(t=new Date){const e=L(A("hue:"+h(t))),n=()=>{const s=e();return s<.5?Math.floor(s*2*80):175+Math.floor((s-.5)*2*80)};return[n(),n(),n()]}function z(t=new Date){const e=L(A("hue-avg:"+h(t)));return Math.round((62+e()*20)*10)/10}function T(){const t=()=>{const e=Math.random();return e<.5?Math.floor(e*2*80):175+Math.floor((e-.5)*2*80)};return[t(),t(),t()]}const C="hue.stats.v1",w={currentStreak:0,longestStreak:0,bestAccuracy:0,puzzlesPlayed:0,lastPlayedDate:null,muted:!1,tutorialSeen:!1,todayResult:null};function u(){try{const t=localStorage.getItem(C);return t?{...w,...JSON.parse(t)}:{...w}}catch{return{...w}}}function p(t){try{localStorage.setItem(C,JSON.stringify(t))}catch{}}function V(t,e){if(!t||!e)return 1/0;const n=new Date(t+"T00:00:00"),s=new Date(e+"T00:00:00");return Math.round((s-n)/(1e3*60*60*24))}function W(t,e,n,s,r,i){const o=V(t.lastPlayedDate,e);return o===1?t.currentStreak+=1:o===0||(t.currentStreak=1),t.longestStreak=Math.max(t.longestStreak,t.currentStreak),t.bestAccuracy=Math.max(t.bestAccuracy,n),o!==0&&(t.puzzlesPlayed+=1),t.lastPlayedDate=e,t.todayResult={dateKey:e,guess:r,target:s,accuracy:n,journey:i},p(t),t}const _=["🟥","🟧","🟨","🟩","🟦"];function Y(t){return[40,55,70,85,95].map((n,s)=>t>=n?_[s]:"⬛").join("")}function G({day:t,accuracy:e,streak:n}){const s=Math.round(e);return[`Hue 🎨 Day ${t}`,`Accuracy: ${s}%`,Y(s),`Streak: ${n} 🔥`,location.host||"hue.app"].join(`
`)}function J({streak:t,longestStreak:e}){const n="🔥".repeat(Math.min(Math.max(t,1),5)),r=[`Hue 🎨 — ${t} ${t===1?"day":"days"} streak ${n}`];return e>t&&r.push(`Best: ${e}`),r.push(location.host||"hue.app"),r.join(`
`)}async function P(t){try{if(navigator.clipboard&&window.isSecureContext)return await navigator.clipboard.writeText(t),!0}catch{}try{const e=document.createElement("textarea");e.value=t,e.style.position="fixed",e.style.opacity="0",document.body.appendChild(e),e.select();const n=document.execCommand("copy");return document.body.removeChild(e),n}catch{return!1}}function U(t=1600){const e=document.createElement("canvas");e.className="confetti",document.body.appendChild(e);const n=e.getContext("2d"),s=Math.min(window.devicePixelRatio||1,2),r=()=>{e.width=innerWidth*s,e.height=innerHeight*s,e.style.width=innerWidth+"px",e.style.height=innerHeight+"px"};r(),addEventListener("resize",r);const i=["#ff6ec4","#7c3aed","#22d3ee","#f59e0b","#10b981","#ef4444"],d=Array.from({length:80},()=>({x:innerWidth/2*s,y:innerHeight/2*s,vx:(Math.random()-.5)*18*s,vy:(Math.random()-1.2)*18*s,g:.5*s,s:(4+Math.random()*6)*s,r:Math.random()*Math.PI,vr:(Math.random()-.5)*.4,c:i[Math.floor(Math.random()*i.length)]})),g=performance.now();function v(k){const $=k-g;n.clearRect(0,0,e.width,e.height),d.forEach(c=>{c.vy+=c.g,c.x+=c.vx,c.y+=c.vy,c.r+=c.vr,n.save(),n.translate(c.x,c.y),n.rotate(c.r),n.fillStyle=c.c,n.fillRect(-c.s/2,-c.s/2,c.s,c.s*.5),n.restore()}),$<t?requestAnimationFrame(v):(removeEventListener("resize",r),e.remove())}requestAnimationFrame(v)}function K(){const t=u();if(t.tutorialSeen)return;const e=document.createElement("div");e.className="tutorial",e.innerHTML=`
    <div class="tutorial-card">
      <div class="tutorial-icon">🎨</div>
      <h2>Welcome to Hue</h2>
      <p>Match the target color using the R, G, B sliders.</p>
      <p>You have <b>30 seconds</b>. One new color every day.</p>
      <button class="btn" type="button">Got it</button>
    </div>
  `,document.body.appendChild(e);const n=()=>{e.classList.add("fade-out"),setTimeout(()=>e.remove(),250),t.tutorialSeen=!0,p(t)};e.addEventListener("click",n,{once:!0}),e.querySelector("button").addEventListener("click",s=>s.stopPropagation()),e.querySelector("button").addEventListener("click",n,{once:!0})}const X="ovaisinamullah";function Q(t){const e=document.getElementById("admin-link");e&&e.addEventListener("click",n=>{n.preventDefault(),Z(t)})}function Z(t){const e=document.createElement("div");e.className="admin-modal",e.setAttribute("role","dialog"),e.setAttribute("aria-modal","true"),e.setAttribute("aria-label","Admin code"),e.innerHTML=`
    <div class="admin-card">
      <div class="admin-icon">🔐</div>
      <h2>Admin Code</h2>
      <p>Enter the code to reset today's daily game.</p>
      <input type="password" class="admin-input" id="admin-input"
             placeholder="Code" autocomplete="off" autocapitalize="off"
             autocorrect="off" spellcheck="false" />
      <div class="admin-error" id="admin-error" hidden>Incorrect code.</div>
      <div class="admin-actions">
        <button type="button" class="btn btn-secondary" id="admin-cancel">Cancel</button>
        <button type="button" class="btn btn-primary" id="admin-submit">Reset Daily</button>
      </div>
    </div>
  `,document.body.appendChild(e);const n=e.querySelector("#admin-input"),s=e.querySelector("#admin-error"),r=()=>{e.classList.add("fade-out"),setTimeout(()=>e.remove(),220),document.removeEventListener("keydown",i)},i=d=>{d.key==="Escape"&&r()};document.addEventListener("keydown",i),setTimeout(()=>n.focus(),0);const o=()=>{if(n.value===X){const d=u();d.todayResult=null,d.lastPlayedDate=null,p(d),r(),t()}else s.hidden=!1,n.classList.add("admin-input-error"),n.focus(),n.select()};e.querySelector("#admin-cancel").addEventListener("click",r),e.querySelector("#admin-submit").addEventListener("click",o),n.addEventListener("keydown",d=>{d.key==="Enter"&&o()}),n.addEventListener("input",()=>{s.hidden=!0,n.classList.remove("admin-input-error")}),e.addEventListener("click",d=>{d.target===e&&r()})}function tt(){false&&"serviceWorker"in navigator&&(location.hostname==="localhost"||location.hostname==="127.0.0.1"||window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").catch(()=>{})}))}const f=3e4,et=6e3,nt=Math.sqrt(255*255*3),l=(t,e=document)=>e.querySelector(t),y=([t,e,n])=>`rgb(${t}, ${e}, ${n})`,at=(t,e,n)=>Math.max(e,Math.min(n,t));function st(t,e){const n=t[0]-e[0],s=t[1]-e[1],r=t[2]-e[2],i=Math.sqrt(n*n+s*s+r*r);return at(100*(1-i/nt),0,100)}function j(t){try{navigator.vibrate&&navigator.vibrate(t)}catch{}}function rt(t){if(t<=0)return'<span class="streak-pip streak-pip-empty">—</span>';const e=Math.min(t,5),n=Array.from({length:e},(r,i)=>`<span class="streak-pip" style="opacity:${(.35+.65*(i+1)/e).toFixed(2)}">🔥</span>`).join(""),s=t>5?`<span class="streak-overflow">+${t-5}</span>`:"";return n+s}let x=null;function D(t="submit"){if(!u().muted)try{x||(x=new(window.AudioContext||window.webkitAudioContext));const n=x;n.state==="suspended"&&n.resume();const s=n.createOscillator(),r=n.createGain();s.connect(r),r.connect(n.destination),s.type="sine";const i=n.currentTime;t==="submit"?(s.frequency.setValueAtTime(523.25,i),s.frequency.exponentialRampToValueAtTime(783.99,i+.18)):(s.frequency.setValueAtTime(659.25,i),s.frequency.exponentialRampToValueAtTime(987.77,i+.22)),r.gain.setValueAtTime(1e-4,i),r.gain.exponentialRampToValueAtTime(.18,i+.02),r.gain.exponentialRampToValueAtTime(1e-4,i+.4),s.start(i),s.stop(i+.45)}catch{}}const a={mode:"daily",phase:"ready",target:[128,128,128],guess:[128,128,128],journey:[],startedAt:0,remaining:f,timerHandle:null,sampleHandle:null,hasInteracted:!1,accuracy:0},R=l("#app");function m(){const t=u();a.mode==="daily"&&a.phase==="ready"&&t.todayResult&&t.todayResult.dateKey===h()&&(a.target=t.todayResult.target,a.guess=t.todayResult.guess,a.journey=t.todayResult.journey||[],a.accuracy=t.todayResult.accuracy,a.phase="result"),a.phase==="ready"||a.phase==="playing"?it(t):yt(t)}function it(t){const e=M(),n=t.muted,s=a.mode==="free"?'<div class="day-pill day-pill-free">Free Play</div>':`<div class="day-pill">Day ${e}</div>`;R.innerHTML=`
    <header class="topbar">
      <div class="brand">Hue <span class="brand-emoji">🎨</span></div>
      <div class="topbar-right">
        ${s}
        <button class="icon-btn" id="mute-btn" aria-label="${n?"Unmute":"Mute"}">
          ${n?"🔇":"🔊"}
        </button>
      </div>
    </header>

    <section class="swatches">
      <div class="swatch swatch-target" id="swatch-target" style="background:${y(a.target)}">
        <div class="swatch-label">Target</div>
      </div>
      <div class="swatch swatch-guess" id="swatch-guess" style="background:${y(a.guess)}">
        <div class="swatch-label">You</div>
      </div>
    </section>

    <section class="timer-row">
      <div class="timer" id="timer">${a.phase==="ready"?"0:30":H(a.remaining)}</div>
      <div class="timer-bar"><div class="timer-bar-fill" id="timer-fill" style="width:${a.remaining/f*100}%"></div></div>
    </section>

    <section class="sliders">
      ${S("R",0,a.guess[0])}
      ${S("G",1,a.guess[1])}
      ${S("B",2,a.guess[2])}
    </section>

    <section class="actions">
      <button class="btn btn-primary" id="submit-btn">${a.phase==="ready"?"Start":"Submit"}</button>
    </section>
  `;for(let r=0;r<3;r++)l(`#slider-${r}`).addEventListener("input",o=>dt(r,+o.target.value));l("#submit-btn").addEventListener("click",ut),l("#mute-btn").addEventListener("click",N),I()}function S(t,e,n){return`
    <div class="slider-row" data-channel="${t}">
      <div class="slider-label">${t}</div>
      <input type="range" min="0" max="255" step="1" value="${n}" id="slider-${e}" class="slider" aria-label="${t} channel" />
      <div class="slider-value" id="slider-val-${e}">${n}</div>
    </div>
  `}function I(){const[t,e,n]=a.guess,s=[`linear-gradient(to right, rgb(0,${e},${n}), rgb(255,${e},${n}))`,`linear-gradient(to right, rgb(${t},0,${n}), rgb(${t},255,${n}))`,`linear-gradient(to right, rgb(${t},${e},0), rgb(${t},${e},255))`];for(let r=0;r<3;r++){const i=document.getElementById(`slider-${r}`);i&&i.style.setProperty("--track",s[r])}}function H(t){const e=Math.max(0,Math.ceil(t/1e3));return`0:${String(e).padStart(2,"0")}`}function ot(t){const e=t.currentStreak,n=t.longestStreak;return n<2?"":e>=n?'<div class="stat-sub stat-sub-best">🏆 Personal best</div>':`<div class="stat-sub">Best: ${n}</div>`}function q(){a.phase="playing",a.startedAt=performance.now(),a.remaining=f,a.journey=[],a.hasInteracted=!1,a.timerHandle=setInterval(ct,100),a.sampleHandle=setInterval(lt,et),m()}function ct(){if(a.remaining=f-(performance.now()-a.startedAt),a.remaining<=0){a.remaining=0,mt();return}const t=l("#timer");t&&(t.textContent=H(a.remaining));const e=l("#timer-fill");e&&(e.style.width=a.remaining/f*100+"%"),a.remaining<5e3&&t?.classList.add("timer-urgent")}function lt(){a.journey.push([...a.guess]),a.journey.length>=5&&clearInterval(a.sampleHandle)}function dt(t,e){a.guess[t]=e,a.phase==="ready"&&q(),a.hasInteracted=!0;const n=l("#swatch-guess");n&&(n.style.background=y(a.guess));const s=l(`#slider-val-${t}`);s&&(s.textContent=e),I(),j(5)}function ut(){if(a.phase==="ready"){q();return}F()}function mt(){F()}function F(){if(a.phase!=="result"){for(clearInterval(a.timerHandle),clearInterval(a.sampleHandle);a.journey.length<5;)a.journey.push([...a.guess]);if(a.journey=a.journey.slice(0,5),a.accuracy=st(a.target,a.guess),a.phase="result",a.mode==="daily"){const t=u();W(t,h(),a.accuracy,a.target,a.guess,a.journey)}j([15,40,15]),D("submit"),a.accuracy>=90&&U(),m()}}function yt(t){const e=M(),n=a.accuracy,s=n.toFixed(1),r=a.mode==="free",i=z(),o=n>=i+10?"Way above average":n>=i?"Above average":n>=i-10?"Just below average":"Below average",d=r?'<div class="day-pill day-pill-free">Free Play</div>':`<div class="day-pill">Day ${e}</div>`,g=r?`<section class="actions actions-double">
         <button class="btn btn-secondary" id="back-daily-btn">Back to Daily</button>
         <button class="btn btn-primary" id="play-again-btn">Play Again</button>
       </section>`:`<section class="actions actions-double">
         <button class="btn btn-primary" id="share-btn">Share</button>
         <button class="btn btn-secondary" id="copy-streak-btn">Copy my streak 🔥</button>
       </section>
       <section class="actions actions-secondary">
         <button class="btn btn-secondary" id="free-play-btn">Try Free Play →</button>
       </section>`,v=r?`<p class="come-back">Free play doesn't affect your streak or best.</p>`:'<p class="come-back">Come back tomorrow for a new color.</p>',k=r?"Free play round":`${o} · global avg ${i}%`;R.innerHTML=`
    <header class="topbar">
      <div class="brand">Hue <span class="brand-emoji">🎨</span></div>
      <div class="topbar-right">
        ${d}
        <button class="icon-btn" id="mute-btn" aria-label="${t.muted?"Unmute":"Mute"}">
          ${t.muted?"🔇":"🔊"}
        </button>
      </div>
    </header>

    <section class="result-swatches">
      <div class="swatch-mini" style="background:${y(a.target)}">
        <div class="swatch-mini-label">Target</div>
        <div class="swatch-mini-rgb">${a.target.join(", ")}</div>
      </div>
      <div class="swatch-mini" style="background:${y(a.guess)}">
        <div class="swatch-mini-label">You</div>
        <div class="swatch-mini-rgb">${a.guess.join(", ")}</div>
      </div>
    </section>

    <section class="accuracy">
      <div class="accuracy-num">${s}%</div>
      <div class="accuracy-sub">${k}</div>
    </section>

    <section class="journey" aria-label="Your guess journey">
      ${a.journey.map($=>`<div class="journey-row" style="background:${y($)}"></div>`).join("")}
    </section>

    <section class="stats-row">
      <div class="stat">
        <div class="stat-num">${t.currentStreak}</div>
        <div class="stat-label">Streak</div>
        <div class="streak-pips" aria-label="${t.currentStreak} day streak">${rt(t.currentStreak)}</div>
        ${ot(t)}
      </div>
      <div class="stat"><div class="stat-num">${t.bestAccuracy.toFixed(1)}%</div><div class="stat-label">Best</div></div>
      <div class="stat"><div class="stat-num">${t.puzzlesPlayed}</div><div class="stat-label">Played</div></div>
    </section>

    ${g}

    ${v}
  `,l("#mute-btn").addEventListener("click",N),r?(l("#back-daily-btn").addEventListener("click",ht),l("#play-again-btn").addEventListener("click",vt)):(l("#share-btn").addEventListener("click",pt),l("#copy-streak-btn").addEventListener("click",bt),l("#free-play-btn").addEventListener("click",ft))}function b(){clearInterval(a.timerHandle),clearInterval(a.sampleHandle),a.guess=[128,128,128],a.journey=[],a.startedAt=0,a.remaining=f,a.hasInteracted=!1,a.accuracy=0}function ft(){a.mode="free",a.target=T(),b(),a.phase="ready",m()}function vt(){a.target=T(),b(),a.phase="ready",m()}function ht(){a.mode="daily",b(),a.phase="ready",m()}async function pt(){const t=u(),e=G({day:M(),accuracy:a.accuracy,streak:t.currentStreak});if(navigator.share)try{await navigator.share({text:e});return}catch{}const n=await P(e);O("#share-btn",n?"Copied!":"Copy failed")}async function bt(){const t=u(),e=J({streak:t.currentStreak,longestStreak:t.longestStreak}),n=await P(e);O("#copy-streak-btn",n?"Copied!":"Copy failed"),n&&D("streak")}function O(t,e){const n=l(t);if(!n)return;const s=n.textContent;n.textContent=e,n.classList.add("btn-flash"),setTimeout(()=>{n.textContent=s,n.classList.remove("btn-flash")},1400)}function N(){const t=u();t.muted=!t.muted,p(t);const e=l("#mute-btn");e&&(e.textContent=t.muted?"🔇":"🔊")}function gt(){a.mode="daily",a.target=E(),b(),a.phase="ready",m()}function kt(){a.target=E(),tt(),K(),Q(gt),m()}document.addEventListener("DOMContentLoaded",kt);
