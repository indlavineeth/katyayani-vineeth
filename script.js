const $ = id => document.getElementById(id);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Front cover: doors open / close ── */
const MUSIC_START = 16; // seconds into the song where playback begins (and where it loops back to)
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

function openInvitation() {
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
  }, reducedMotion ? 0 : 2700);
}

function closeInvitation() {
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
}

$("openButton").addEventListener("click", openInvitation);
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
    ids.forEach(id => $(id).textContent = "00");
    $("countdownCaption").textContent = "The auspicious day is here. Best wishes to the couple! 🎉";
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
const shareText = "You are warmly invited to the wedding of Katyayani & Vineeth 💍\n" +
  "Wedding: Sun, 13 Dec 2026 · Night 4:01 (Early hours of Monday) · Gudivada\n" +
  "Reception: Sun, 13 Dec 2026 · 6:00 PM onwards · at the venue";

$("whatsappButton").href = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${pageUrl}`)}`;

$("shareButton").addEventListener("click", async () => {
  const shareData = { title: "Katyayani Weds Vineeth", text: shareText, url: pageUrl };
  if (navigator.share) {
    try { await navigator.share(shareData); } catch (e) { /* user cancelled */ }
    return;
  }
  const button = $("shareButton");
  try {
    await navigator.clipboard.writeText(`${shareText}\n\n${pageUrl}`);
    button.textContent = "Invitation link copied ✓";
    setTimeout(() => button.textContent = "Share Invitation ↗", 2400);
  } catch (e) {
    window.prompt("Copy this invitation link:", pageUrl);
  }
});
