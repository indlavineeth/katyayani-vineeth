const $ = id => document.getElementById(id);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Front cover: doors open / close ── */
const MUSIC_START = 2; // seconds into the song where playback begins (and where it loops back to)
const audio = $("music");
audio.addEventListener("ended", () => {
  audio.currentTime = MUSIC_START;
  audio.play().catch(() => {});
});
const musicButton = $("musicButton");
let petalTimer = null;
let sparkTimer = null;

function setMusicLabel(on) {
  $("musicIcon").textContent = on ? "🔊" : "🔇";
  $("musicLabel").textContent = on ? "Music On" : "Music Off";
}

let isOpen = false;
function openInvitation() {
  if (isOpen) return;
  isOpen = true;
  stopKnocking();
  // Play inside the click handler so mobile browsers allow it. If music.mp3 is absent, the button stays hidden.
  audio.currentTime = MUSIC_START;
  audio.play().then(() => {
    setMusicLabel(true);
    musicButton.classList.add("visible");
  }).catch(() => {});

  // Card fades → doors swing open in 3D with a burst of light → temple photo zooms into place → flowers shower
  $("cover-card").classList.add("hide");
  setTimeout(() => $("cover").classList.add("open"), 250);
  setTimeout(() => document.body.classList.add("opened"), reducedMotion ? 0 : 600);
  setTimeout(() => {
    if (reducedMotion) return;
    for (let i = 0; i < 28; i++) spawnPetal(true);
  }, 1200);
  setTimeout(() => {
    $("cover").classList.add("gone");
    $("cover-card").classList.add("gone");
    document.body.classList.remove("locked");
    $("backButton").classList.add("visible");
    startParticles();
    startTour();
  }, reducedMotion ? 0 : 2700);
}

function closeInvitation() {
  isOpen = false;
  clearInterval(tourTimer);
  updateBottomUi();
  audio.pause();
  musicButton.classList.remove("visible");
  $("backButton").classList.remove("visible");
  stopParticles();
  window.scrollTo({ top: 0, behavior: "instant" });
  document.body.classList.add("locked");
  document.body.classList.remove("opened");
  $("cover").classList.remove("gone");
  $("cover-card").classList.remove("gone");
  requestAnimationFrame(() => setTimeout(() => {
    $("cover").classList.remove("open");
    $("cover-card").classList.remove("hide");
  }, 60));
  startKnocking();
}

$("openButton").addEventListener("click", openInvitation);
// The whole front cover opens the invitation, not just the button
$("cover").addEventListener("click", openInvitation);
$("cover-card").addEventListener("click", openInvitation);

/* ── Nudges: doors "knock" if nobody taps; a gentle peek shows there is more below ── */
let knockTimer = null, peekTimer = null;
function startKnocking() {
  if (reducedMotion) return;
  stopKnocking();
  knockTimer = setInterval(() => {
    const cover = $("cover");
    cover.classList.remove("knock");
    void cover.offsetWidth; // restart the animation
    cover.classList.add("knock");
  }, 4500);
}
function stopKnocking() {
  clearInterval(knockTimer);
  knockTimer = null;
  $("cover").classList.remove("knock");
}
/* ── Guided tour: 8 s after opening a small peek, 15 s glide to the 2nd section,
      then every 13 s on to the next section. Touching or scrolling pauses it;
      it carries on from where the guest is after 13 s without touching. ── */
const TOUR = { peekAt: 8000, firstAt: 15000, every: 13000, countdown: 6000 }; // countdown has little to read
let tourTimer = null, lastTouch = 0, peeked = false, peekingUntil = 0;
["touchstart", "wheel", "keydown", "mousedown"].forEach(ev => addEventListener(ev, () => { lastTouch = Date.now(); }, { passive: true }));

// Real page position (offsetTop ignores the 30px fade-in shift of sections not shown yet)
const pageTop = el => { let t = 0; for (; el; el = el.offsetParent) t += el.offsetTop; return t; };

// How long to stay on the section currently at the top of the screen
function tourWait() {
  const y = window.scrollY + 20;
  const current = [...document.querySelectorAll("main > section")].filter(sec => pageTop(sec) <= y).pop();
  return current && current.classList.contains("countdown-section") ? TOUR.countdown : TOUR.every;
}

function nextTourStop() {
  const y = window.scrollY, bottom = document.documentElement.scrollHeight - window.innerHeight;
  if (y >= bottom - 5) return null;
  const nextTop = [...document.querySelectorAll("main > section")].map(pageTop).find(top => top > y + 20) ?? bottom;
  // Every stop shows one section from its top. A section taller than the screen gets one extra
  // stop that shows the rest of it, ending exactly where the next section begins (never half of the next one).
  let target = nextTop;
  if (nextTop - y > window.innerHeight + 100) {          // only a few pixels over? no tiny extra step
    target = Math.min(y + window.innerHeight - 90, nextTop - window.innerHeight + 80);
    if (target <= y + 20) target = nextTop;
  }
  return Math.min(target, bottom);
}

function startTour() {
  clearInterval(tourTimer);
  if (reducedMotion) return;
  lastTouch = Date.now(); peeked = false;
  tourTimer = setInterval(() => {
    const chooser = $("mapChooser"); // pause while the location chooser is open
    if (!isOpen || document.hidden || (chooser && !chooser.hidden)) return;
    if (Date.now() < peekingUntil) return;          // the peek is still going down and back
    const idle = Date.now() - lastTouch;
    if (window.scrollY < 40) {                       // still on the first screen
      if (!peeked && idle >= TOUR.peekAt) {
        peeked = true;
        peekingUntil = Date.now() + 2800;
        window.scrollTo({ top: Math.min(260, window.innerHeight * 0.35), behavior: "smooth" });
        setTimeout(() => { if (Date.now() - lastTouch >= 1300) window.scrollTo({ top: 0, behavior: "smooth" }); }, 1300);
      } else if (idle >= TOUR.firstAt) {
        $("invitation").scrollIntoView({ behavior: "smooth", block: "start" });
        lastTouch = Date.now();
      }
      return;
    }
    if (idle >= tourWait()) {
      const to = nextTourStop();
      if (to === null) { clearInterval(tourTimer); return; }   // reached the end
      window.scrollTo({ top: to, behavior: "smooth" });
      lastTouch = Date.now();
    }
  }, 500);
}
startKnocking();

// First screen: only the "scroll down" hint. From the 2nd section on: the Dates & Venue · Map · Share bar.
function updateBottomUi() {
  const y = window.scrollY;
  document.body.classList.toggle("scrolled", y > 80);
  // Hidden again on the last section, which has its own big Share buttons
  const atClosing = pageTop($("share")) < y + window.innerHeight * 0.8;
  $("quickBar").classList.toggle("visible", isOpen && y > window.innerHeight * 0.6 && !atClosing);
}
addEventListener("scroll", updateBottomUi, { passive: true });

document.querySelectorAll("[data-jump]").forEach(a => a.addEventListener("click", e => {
  e.preventDefault();
  $(a.dataset.jump).scrollIntoView({ behavior: "smooth", block: "start" });
}));
$("backButton").addEventListener("click", closeInvitation);
musicButton.addEventListener("click", () => {
  if (audio.paused) audio.play().then(() => setMusicLabel(true)).catch(() => {});
  else { audio.pause(); setMusicLabel(false); }
});

/* ── Falling flowers + hero sparks ── */
const flowers = [["🌸", "#ffb7c5"], ["🌼", "#fff176"], ["🌺", "#ff8a80"], ["🏵️", "#ffcc80"], ["🪷", "#f48fb1"]];

function spawnPetal(shower = false) {
  if (document.hidden) return;
  const [emoji, color] = flowers[Math.floor(Math.random() * flowers.length)];
  const el = document.createElement("div");
  const dur = shower ? 4 + Math.random() * 3 : 8 + Math.random() * 9;
  const delay = Math.random() * (shower ? 1.2 : 2);
  const sway = (Math.random() - 0.5) * 90;
  el.className = "petal";
  el.textContent = emoji;
  el.style.cssText = `left:${Math.random() * 100}vw;font-size:${0.9 + Math.random() * 0.8}rem;` +
    `animation-duration:${dur}s;animation-delay:${delay}s;--sway:${sway}px;` +
    `--sway2:${sway + (Math.random() - 0.5) * 50}px;--spin:${(Math.random() - 0.5) * 360}deg;` +
    `filter:drop-shadow(0 2px 6px ${color}88)`;
  $("petals").appendChild(el);
  setTimeout(() => el.remove(), (dur + delay + 0.5) * 1000);
}

function spawnSpark() {
  if (document.hidden) return;
  const sp = document.createElement("div");
  const dur = 2 + Math.random() * 3;
  const delay = Math.random() * 3;
  sp.className = "spark";
  sp.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 90}%;animation-duration:${dur}s;animation-delay:${delay}s`;
  $("sparks").appendChild(sp);
  setTimeout(() => sp.remove(), (dur + delay + 0.5) * 1000);
}

function startParticles() {
  if (reducedMotion || petalTimer) return;
  const petalEvery = window.innerWidth < 700 ? 900 : 600;
  for (let i = 0; i < 16; i++) spawnPetal();
  for (let i = 0; i < 25; i++) spawnSpark();
  petalTimer = setInterval(spawnPetal, petalEvery);
  sparkTimer = setInterval(spawnSpark, 500);
}

function stopParticles() {
  clearInterval(petalTimer);
  clearInterval(sparkTimer);
  petalTimer = sparkTimer = null;
  $("petals").replaceChildren();
  $("sparks").replaceChildren();
}

/* ── Countdown: Wedding Muhurtham, Sunday 13 December 2026 night 4:01 (early hours of Monday 14th, IST) ── */
const target = new Date("2026-12-14T04:01:00+05:30").getTime();
const ids = ["days", "hours", "minutes", "seconds"];
let countdownTimer = null;

function updateCountdown() {
  const distance = target - Date.now();
  if (distance <= 0) {
    showMarried();
    clearInterval(countdownTimer);
    return;
  }
  const values = [
    Math.floor(distance / 86400000),
    Math.floor((distance % 86400000) / 3600000),
    Math.floor((distance % 3600000) / 60000),
    Math.floor((distance % 60000) / 1000)
  ];
  ids.forEach((id, i) => {
    const el = $(id);
    const text = String(values[i]).padStart(2, "0");
    if (el.textContent === text) return;
    el.textContent = text;
    el.classList.remove("flip");
    void el.offsetWidth; // restart the animation
    el.classList.add("flip");
  });
}
/* ── After the wedding: the timer becomes a "married" note; after the last event the
      invitation wording turns into a thank-you. Runs on its own from the dates below. ── */
const MARRIED_LINE = "Married on Sunday night, 13 December 2026 · 4:01 (early hours of Monday) · Thula Lagnam";
const ALL_EVENTS_DONE = new Date("2026-12-14T04:01:00+05:30").getTime();

function showMarried() {
  $("countdownSection").classList.add("married");
  $("countdownKicker").textContent = "By the grace of Lord Venkateswara";
  $("countdownTitle").textContent = "Happily married 🙏";
  $("countdownCaption").textContent = MARRIED_LINE;
  if (Date.now() >= ALL_EVENTS_DONE) {
    $("eventsKicker").textContent = "Thank you for joining us";
    $("closingKicker").textContent = "Your presence was our blessing";
    $("closingTitle").innerHTML = "Thank you for your<br>love &amp; blessings 🙏";
  }
}
setInterval(() => { if (Date.now() >= ALL_EVENTS_DONE && Date.now() >= target) showMarried(); }, 60000);

updateCountdown();
countdownTimer = setInterval(updateCountdown, 1000);

/* ── Scroll reveal ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

/* ── Card hover glow (desktop) ── */
document.querySelectorAll(".event-card").forEach(card => {
  card.addEventListener("mousemove", e => {
    const r = card.getBoundingClientRect();
    card.style.background = `radial-gradient(circle at ${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%, rgba(198,154,75,.16) 0%, transparent 55%), #fffaf1`;
  });
  card.addEventListener("mouseleave", () => card.style.background = "");
});

/* ── Sharing ── */
const pageUrl = window.location.href.split("#")[0];
const OPEN_TIP = "👉 Tap \"Open Invitation\", then scroll down for all details";
const shareText = "You are warmly invited to the wedding of Katyayani & Vineeth 💍\n" +
  "Wedding: Sun, 13 Dec 2026 · Night 4:01 (Early hours of Monday) · Gudivada\n" +
  "Reception: Sun, 13 Dec 2026 · 6:00 PM onwards · at the venue";

$("whatsappButton").href = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${pageUrl}\n\n${OPEN_TIP}`)}`;

$("shareButton").addEventListener("click", async () => {
  const shareData = { title: "Katyayani Weds Vineeth", text: `${shareText}\n\n${OPEN_TIP}`, url: pageUrl };
  if (navigator.share) {
    try { await navigator.share(shareData); } catch (e) { /* user cancelled */ }
    return;
  }
  const button = $("shareButton");
  try {
    await navigator.clipboard.writeText(`${shareText}\n\n${pageUrl}\n\n${OPEN_TIP}`);
    button.textContent = "Invitation link copied ✓";
    setTimeout(() => button.textContent = "Share Invitation ↗", 2400);
  } catch (e) {
    window.prompt("Copy this invitation link:", pageUrl);
  }
});
