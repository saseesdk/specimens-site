/* SPECIMENS — Google Analytics (GA4).
   Where the law asks for consent first (Europe, the UK and similar), it waits for "Allow".
   Everywhere else it counts visits straight away, and the visitor can turn it off in "Cookie settings".
   Set gaId in assets/js/config.js. With no id, nothing loads and no banner shows.
   Events: play_click (a "Get it on Google Play" button), soon_click (a "Coming soon" button).

   shortcut: the region is guessed from the browser's time zone (no server lookup), so a visitor in
   Europe with a non-European time zone, or a VPN user, is treated as outside Europe. Upgrade to a
   country lookup (e.g. Cloudflare's CF-IPCountry header) if that matters. */
(function () {
  "use strict";
  var cfg = window.SPECIMENS || {}, id = cfg.gaId, doc = document, KEY = "sp-consent";
  if (!id || /^(localhost|127\.|\[::1\])/.test(location.hostname)) return; /* local previews don't count */

  /* Ask first when the visitor's time zone is in (or can't be told from) a consent-first region. */
  var EXTRA = ["Atlantic/Azores", "Atlantic/Madeira", "Atlantic/Canary", "Atlantic/Faroe", "Atlantic/Reykjavik",
    "Asia/Nicosia", "Asia/Famagusta", "Africa/Ceuta", "America/Sao_Paulo", "America/Bahia", "America/Fortaleza",
    "America/Recife", "America/Manaus", "America/Belem", "America/Cuiaba", "America/Campo_Grande"];
  function needsConsent() {
    var tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
    if (!tz) return true; /* can't tell: ask */
    return /^Europe\//.test(tz) || EXTRA.indexOf(tz) > -1;
  }
  var strict = needsConsent();

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  var loaded = false;
  function load() {
    if (loaded) return; loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true });
    var s = doc.createElement("script"); s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    doc.head.appendChild(s);
  }
  function track(name, where) { if (loaded && window.gtag) window.gtag("event", name, { location: where || location.pathname }); }
  doc.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("a[data-play],[data-soon]");
    if (!t) return;
    var where = t.closest(".hero-cta") ? "hero" : t.closest("#cta-rail") ? "rail" : t.closest(".site-head") ? "header" : t.closest("#get") ? "finale" : "other";
    track(t.hasAttribute("data-soon") ? "soon_click" : "play_click", where);
  });

  var banner;
  function ask(optIn) {
    if (banner) banner.remove();
    banner = doc.createElement("div");
    banner.className = "consent show"; banner.setAttribute("role", "dialog"); banner.setAttribute("aria-label", "Cookies");
    banner.innerHTML = optIn
      ? '<p>May we count your visit? We use Google Analytics (with cookies) to see how people find Specimens. <a href="/privacy/#website">Learn more</a></p>' +
        '<div class="consent-btns"><button type="button" data-c="no" class="btn-ghost">No thanks</button><button type="button" data-c="yes" class="consent-yes">Allow</button></div>'
      : '<p>We count visits to this site with Google Analytics (it uses cookies). You can switch it off. <a href="/privacy/#website">Learn more</a></p>' +
        '<div class="consent-btns"><button type="button" data-c="no" class="btn-ghost">Turn off</button><button type="button" data-c="yes" class="consent-yes">Keep on</button></div>';
    doc.body.appendChild(banner);
    banner.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-c]"); if (!b) return;
      var yes = b.getAttribute("data-c") === "yes";
      set(yes ? "yes" : "no"); banner.classList.remove("show");
      if (yes) load();
      else if (loaded) { location.reload(); } /* turning it off: stop the running tag */
    });
  }
  doc.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-cookies]")) { e.preventDefault(); ask(strict && get() !== "yes"); }
  });

  var c = get();
  if (c === "no") return;                 /* they said no: respect it */
  if (c === "yes") { load(); return; }
  if (strict) ask(true);                  /* consent-first region: wait for "Allow" */
  else load();                            /* elsewhere: count visits, with a switch-off in "Cookie settings" */
})();
