/* SPECIMENS — Google Analytics (GA4), only after the visitor allows it.
   Set gaId in assets/js/config.js. With no id, nothing loads and no banner shows.
   Events: play_click (a "Get it on Google Play" button), soon_click (a "Coming soon" button). */
(function () {
  "use strict";
  var cfg = window.SPECIMENS || {}, id = cfg.gaId, doc = document, KEY = "sp-consent";
  if (!id || /^(localhost|127\.|\[::1\])/.test(location.hostname)) return; /* local previews don't count */
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
  function ask() {
    if (banner) { banner.classList.add("show"); return; }
    banner = doc.createElement("div");
    banner.className = "consent show"; banner.setAttribute("role", "dialog"); banner.setAttribute("aria-label", "Cookies");
    banner.innerHTML = '<p>May we count your visit? We use Google Analytics (with cookies) to see how people find Specimens. ' +
      '<a href="/privacy/#website">Learn more</a></p><div class="consent-btns"><button type="button" data-c="no" class="btn-ghost">No thanks</button>' +
      '<button type="button" data-c="yes" class="consent-yes">Allow</button></div>';
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
    if (e.target.closest && e.target.closest("[data-cookies]")) { e.preventDefault(); ask(); }
  });
  var c = get();
  if (c === "yes") load(); else if (c !== "no") ask();
})();
