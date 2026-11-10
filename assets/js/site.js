/* SPECIMENS — site behaviour. No dependencies. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cfg = window.SPECIMENS || {};
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }

  /* store link from config */
  if (cfg.playUrl) $$("a[data-play]").forEach(function (a) { a.href = cfg.playUrl; });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- dust in the lamp light ---------- */
  (function dust() {
    if (reduce) return;
    var cv = doc.createElement("canvas");
    cv.className = "dust"; cv.setAttribute("aria-hidden", "true");
    doc.body.insertBefore(cv, doc.body.firstChild);
    var ctx = cv.getContext("2d"), W, H, dpr = Math.min(window.devicePixelRatio || 1, 2), motes = [];
    function size() { W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; }
    size(); addEventListener("resize", size);
    var n = innerWidth < 700 ? 38 : 70;
    for (var i = 0; i < n; i++) motes.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + .4, s: Math.random() * .00018 + .00005, p: Math.random() * 6.28, a: Math.random() * .5 + .25 });
    var last = 0, visible = true;
    doc.addEventListener("visibilitychange", function () { visible = !doc.hidden; if (visible) requestAnimationFrame(tick); });
    function tick(t) {
      if (!visible) return;
      var dt = Math.min(t - last, 50); last = t;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.y -= m.s * dt * .6; m.p += dt * .0006; m.x += Math.sin(m.p) * .00012 * dt;
        if (m.y < -.02) { m.y = 1.02; m.x = Math.random(); }
        var cx = Math.abs(m.x - .5) * 2; /* brighter in the lamp's cone */
        var glow = Math.max(0, 1 - cx * .9) * (1 - m.y * .55);
        ctx.globalAlpha = m.a * glow;
        ctx.fillStyle = "#ffe2a6";
        ctx.beginPath(); ctx.arc(m.x * W, m.y * H, m.r * dpr, 0, 6.283); ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  /* ---------- creatures react to touch ---------- */
  doc.addEventListener("click", function (e) {
    var c = e.target.closest && e.target.closest("button.creature");
    if (!c) return;
    c.classList.remove("react"); void c.offsetWidth; c.classList.add("react");
    clearTimeout(c._t); c._t = setTimeout(function () { c.classList.remove("react"); }, 1700);
    if (navigator.vibrate) { try { navigator.vibrate(12); } catch (er) {} }
  });

  /* ---------- drawers slide out on scroll ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (ents) {
    ents.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("open"); en.target.dispatchEvent(new CustomEvent("drawer:open")); io.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -18% 0px", threshold: .05 }) : null;
  $$(".drawer").forEach(function (d) { io ? io.observe(d) : d.classList.add("open"); });

  /* ---------- sticky Google Play rail ---------- */
  var rail = $("#cta-rail"), heroCta = $(".hero-cta .play"), finale = $("#get");
  if (rail && "IntersectionObserver" in window) {
    var heroOut = false, finaleIn = false;
    var upd = function () { rail.classList.toggle("show", heroOut && !finaleIn); };
    new IntersectionObserver(function (e) { heroOut = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; upd(); }).observe($(".hero-cta"));
    if (finale) new IntersectionObserver(function (e) { finaleIn = e[0].isIntersecting; upd(); }, { threshold: .25 }).observe(finale);
  }

  /* ---------- I. a board that solves itself ---------- */
  (function demo() {
    var board = $("#demo-board"); if (!board) return;
    var cap = $("#demo-caption"), N = 6, timers = [];
    var cells = $$(".cell", board);
    function cell(r, c) { return cells[r * N + c]; }
    var regionOf = function (el) { return el.className.match(/c-(\w+)/)[1]; };
    var plan = [
      [0, 4, "A butterfly settles in the little cream region…"],
      [null, null, "…so its row, its column and every square touching it are crossed out."],
      [1, 2, "Peach now has a single safe square. The peacock takes it."],
      [2, 5, "An owl perches in the green, clear of everyone."],
      [3, 1, "In all that blue, only one safe square remains."],
      [5, 0, "Purple: the bottom corner is the only square left."],
      [4, 3, "And the last creature finds the last free square."],
      [null, null, "Six creatures. One answer. Not a single guess."]
    ];
    function reset() {
      timers.forEach(clearTimeout); timers = [];
      cells.forEach(function (c) { c.classList.remove("has", "is-x", "focus"); });
      board.classList.remove("solved");
    }
    function crossFrom(r, c) {
      var reg = regionOf(cell(r, c)), list = [];
      for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
        var el = cell(i, j);
        if (el.classList.contains("has") || (i === r && j === c)) continue;
        if (i === r || j === c || (Math.abs(i - r) <= 1 && Math.abs(j - c) <= 1) || regionOf(el) === reg) list.push(el);
      }
      list.forEach(function (el, k) { timers.push(setTimeout(function () { el.classList.add("is-x"); }, k * 35)); });
      return list.length * 35;
    }
    function run() {
      reset();
      var t = 300, lastPlaced = null;
      plan.forEach(function (step) {
        timers.push(setTimeout(function () {
          cap.textContent = step[2];
          cells.forEach(function (c) { c.classList.remove("focus"); });
          if (step[0] !== null) { var el = cell(step[0], step[1]); el.classList.add("has", "focus"); lastPlaced = step; if (step === plan[0]) return; crossFrom(step[0], step[1]); }
          else if (lastPlaced && step === plan[1]) crossFrom(lastPlaced[0], lastPlaced[1]);
          if (step === plan[plan.length - 1]) board.classList.add("solved");
        }, t));
        t += step === plan[0] ? 1500 : 2300;
      });
    }
    if (reduce) { cells.forEach(function (c) { if (c.querySelector(".pc")) c.classList.add("has"); else c.classList.add("is-x"); }); cap.textContent = plan[plan.length - 1][2]; return; }
    var d = board.closest(".drawer"), started = false;
    d.addEventListener("drawer:open", function () { if (!started) { started = true; setTimeout(run, 900); } });
    if (d.classList.contains("open")) { started = true; run(); }
    $("#demo-replay").addEventListener("click", run);
  })();

  /* ---------- II. the playable board: the game's own controls ----------
     tap = cross out (tap again to clear), double-tap = place a creature. Only the
     answer's square takes a creature; anywhere else is refused, as in the game. */
  (function play() {
    var board = $("#play-board"); if (!board) return;
    var N = 4, cells = $$(".cell", board), cap = $("#play-caption"), win = $("#play-win");
    var state = cells.map(function () { return 0; }); /* 0 empty, 1 creature, 2 cross */
    var reg = cells.map(function (c) { return c.getAttribute("data-g"); });
    function rc(i) { return [Math.floor(i / N), i % N]; }
    var answer = (function solve() { /* the one layout that obeys every rule */
      var cols = [];
      function ok(r, c) {
        for (var q = 0; q < r; q++) {
          if (cols[q] === c || (q === r - 1 && Math.abs(cols[q] - c) <= 1)) return false;
          if (reg[q * N + cols[q]] === reg[r * N + c]) return false;
        }
        return true;
      }
      function go(r) { if (r === N) return true; for (var c = 0; c < N; c++) if (ok(r, c)) { cols[r] = c; if (go(r + 1)) return true; } return false; }
      go(0); return cols.map(function (c, r) { return r * N + c; });
    })();
    function label(i) {
      var p = rc(i);
      cells[i].setAttribute("aria-label", "Row " + (p[0] + 1) + ", column " + (p[1] + 1) + ", " + reg[i] + " region, " + ["empty", "creature", "crossed out"][state[i]]);
    }
    function paint(i) { cells[i].classList.toggle("has", state[i] === 1); cells[i].classList.toggle("is-x", state[i] === 2); label(i); }
    /* The guide, like the game's tutorial: the butterfly's one-square colour first, then the squares each
       creature takes up (the player crosses them out), then the next row or colour with one free square. */
    var order = [1, 7, 14, 8]; /* the answer, in the order it is taught */
    function blocked(i) {
      var A = rc(i), out = [];
      for (var k = 0; k < cells.length; k++) {
        if (k === i) continue;
        var B = rc(k);
        if (A[0] === B[0] || A[1] === B[1] || reg[k] === reg[i] || (Math.abs(A[0] - B[0]) <= 1 && Math.abs(A[1] - B[1]) <= 1)) out.push(k);
      }
      return out;
    }
    function focusOn(i) {
      cells.forEach(function (c) { c.classList.remove("focus"); });
      if (i !== null) cells[i].classList.add("focus");
    }
    function guide() {
      var list = placed(), n = list.length;
      if (n === N) { focusOn(null); return; }
      var want = null;
      for (var k = 0; k < order.length; k++) if (list.indexOf(order[k]) < 0) { want = order[k]; break; }
      if (n === 0) { cap.textContent = "This colour has only one square, so the butterfly must live there. Double-tap it."; focusOn(want); return; }
      var open = 0;
      list.forEach(function (p) { blocked(p).forEach(function (k) { if (state[k] === 0) open++; }); });
      if (open > 0) {
        cap.textContent = n === 1
          ? "It owns its row, its column and the squares touching it. Tap each one to cross it out. A tap is only a pencil note."
          : "Cross out what this creature takes up too: its row, column, colour and the squares around it.";
        focusOn(null); return;
      }
      cap.textContent = n === N - 1 ? "One creature left. Double-tap the only square without a cross."
        : "Look! A row or a colour has just one free square. Double-tap it.";
      focusOn(want);
    }
    function placed() { var out = []; state.forEach(function (s, i) { if (s === 1) out.push(i); }); return out; }
    function why(i) {
      var A = rc(i), list = placed();
      for (var k = 0; k < list.length; k++) {
        var B = rc(list[k]);
        if (A[0] === B[0]) return "That row already has its creature.";
        if (A[1] === B[1]) return "That column already has its creature.";
        if (reg[i] === reg[list[k]]) return "That colour already has its creature.";
        if (Math.abs(A[0] - B[0]) <= 1 && Math.abs(A[1] - B[1]) <= 1) return "Too close: creatures can't touch, not even corner to corner.";
      }
      return "Not here. Look again: which square is the only safe one?";
    }
    function refresh() {
      var list = placed();
      $$(".medal").forEach(function (m) { var g = m.getAttribute("data-m"); m.classList.toggle("on", list.some(function (i) { return reg[i] === g; })); });
      if (list.length === N) {
        board.classList.add("solved"); cap.textContent = "Every creature is safe. Solved.";
        win.classList.add("show");
        setTimeout(function () { win.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" }); }, 400);
      } else { board.classList.remove("solved"); win.classList.remove("show"); }
      return list.length;
    }
    function place(i) {
      if (answer.indexOf(i) < 0) {
        cap.textContent = why(i);
        cells[i].classList.remove("shake"); void cells[i].offsetWidth; cells[i].classList.add("shake");
        if (navigator.vibrate) { try { navigator.vibrate(60); } catch (er) {} }
        return;
      }
      state[i] = 1; paint(i);
      if (refresh() < N) guide();
    }
    var last = null;
    cells.forEach(function (c, i) {
      c.addEventListener("click", function () {
        if (state[i] === 1) return; /* a placed creature stays, as in the game */
        var now = Date.now();
        if (last && last.i === i && now - last.t < 340) { state[i] = last.prev; paint(i); last = null; place(i); return; }
        last = { i: i, t: now, prev: state[i] };
        state[i] = state[i] === 2 ? 0 : 2; paint(i);
        if (placed().length < N) guide();
      });
    });
    $("#play-reset").addEventListener("click", function () {
      state = state.map(function () { return 0; }); last = null;
      cells.forEach(function (c, i) { c.classList.remove("has", "is-x", "bad", "shake"); label(i); });
      refresh(); guide();
    });
    cells.forEach(function (c, i) { label(i); });
    guide();
  })();

  /* ---------- "Coming soon" buttons: a short note until launch ---------- */
  (function soon() {
    var t, toast;
    doc.addEventListener("click", function (e) {
      if (!e.target.closest || !e.target.closest("[data-soon]")) return;
      if (!toast) { toast = doc.createElement("div"); toast.className = "soon-toast"; toast.setAttribute("role", "status"); doc.body.appendChild(toast); }
      toast.textContent = "Specimens is coming to Google Play very soon. The cabinet opens shortly!";
      toast.classList.add("show"); clearTimeout(t); t = setTimeout(function () { toast.classList.remove("show"); }, 3200);
    });
  })();

  /* ---------- IV. the streak fills, a rare find unlocks ---------- */
  (function streak() {
    var s = $("#streak"); if (!s) return;
    var days = $$(".days li", s), out = $("#streak-reward");
    var finds = ["Golden Luna Moth", "Albino Barn Owl", "Red Panda"], k = 0, timers = [];
    function cycle() {
      s.classList.remove("done"); days.forEach(function (d) { d.classList.remove("lit"); });
      days.forEach(function (d, i) { timers.push(setTimeout(function () { d.classList.add("lit"); }, 500 + i * 450)); });
      timers.push(setTimeout(function () { out.textContent = "Seven days kept. Rare find: " + finds[k++ % finds.length]; s.classList.add("done"); }, 500 + days.length * 450));
      timers.push(setTimeout(cycle, 500 + days.length * 450 + 3800));
    }
    if (reduce) { days.forEach(function (d) { d.classList.add("lit"); }); s.classList.add("done"); out.textContent = "Seven days kept. Rare find unlocked."; return; }
    var d = s.closest(".drawer");
    d.addEventListener("drawer:open", function () { setTimeout(cycle, 700); });
  })();

  /* ---------- V. climbing the ranks ---------- */
  (function ladder() {
    var l = $("#ladder"); if (!l) return;
    var rungs = $$("li", l), i = 0;
    function step() {
      rungs.forEach(function (r) { r.classList.remove("here"); });
      rungs[i].classList.add("here");
      i = (i + 1) % rungs.length;
      setTimeout(step, i === 0 ? 2600 : 1300);
    }
    if (reduce) { rungs[0].classList.add("here"); return; }
    l.closest(".drawer").addEventListener("drawer:open", function () { setTimeout(step, 600); });
  })();
})();
