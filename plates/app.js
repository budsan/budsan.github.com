(function () {
  'use strict';

  var STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];
  var STATE_BY_LOWER = {};
  STATES.forEach(function (s) { STATE_BY_LOWER[s.toLowerCase()] = s; });

  var DIFF_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

  var ALL_PLATES = (typeof PLATES !== 'undefined' && Array.isArray(PLATES))
    ? PLATES.filter(function (p) { return p && STATE_BY_LOWER[String(p.state).toLowerCase()] && p.img; })
    : [];

  var FACTS_DATA = (typeof FACTS !== 'undefined' && FACTS && typeof FACTS === 'object') ? FACTS : {};
  function getFacts(state) {
    var f = FACTS_DATA[state];
    return f && typeof f === 'object' ? f : null;
  }
  function hasFront(state) {
    var f = getFacts(state);
    return !!f && typeof f.frontPlate === 'boolean';
  }
  // Eligible for a Yes/No front-plate question: states whose rule has conditions are left out.
  function frontQuizzable(state) {
    return hasFront(state) && getFacts(state).frontAmbiguous !== true;
  }
  var failedImgs = {};
  var VERSIONS = {};
  ALL_PLATES.forEach(function (p) {
    var k = STATE_BY_LOWER[String(p.state).toLowerCase()];
    (VERSIONS[k] = VERSIONS[k] || []).push(p);
  });

  function $(id) { return document.getElementById(id); }
  var el = {
    start: $('screen-start'), quiz: $('screen-quiz'), end: $('screen-end'),
    diffGroup: $('diff-group'), lenGroup: $('len-group'), allCount: $('all-count'),
    bestLine: $('best-line'), startBtn: $('start-btn'), loadError: $('load-error'),
    progress: $('progress'), diffLabel: $('diff-label'), score: $('score'), fill: $('progress-fill'),
    holder: $('plate-holder'), hint: $('plate-hint'), easy: $('easy-area'),
    typeForm: $('type-area'), input: $('answer'), suggest: $('suggest'), typeMsg: $('type-msg'),
    submitBtn: $('submit-btn'), feedback: $('feedback'), next: $('next-btn'),
    finalScore: $('final-score'), finalPct: $('final-pct'), rank: $('rank'), bestResult: $('best-result'),
    missedWrap: $('missed-wrap'), missed: $('missed'), again: $('again-btn'), change: $('change-btn'),
    credits: $('credits-list'), prompt: $('q-prompt'), frontToggle: $('front-toggle'),
    frontNote: $('front-toggle-note'), info: $('info'), infoState: $('info-state'), infoLabel: $('info-label'),
    infoNick: $('info-nick'), infoFactWrap: $('info-fact-wrap'), infoFact: $('info-fact'), infoMore: $('info-more'),
    infoDesigns: $('info-designs'), infoFront: $('info-front'),
    namesToggle: $('names-toggle'), namesNote: $('names-toggle-note'),
    blurBtn: $('blur-btn'), home: $('home-btn'),
    strip: $('info-strip'), stripList: $('strip-list'), share: $('share-btn'), shareMsg: $('share-msg'),
    streak: $('streak'), streakN: $('streak-n'), frame: $('plate-frame'), ring: $('ring'),
    rankSub: $('rank-sub'), streakFinal: $('streak-final'),
    explore: $('screen-explore'), exploreBtn: $('explore-btn'), viewGroup: $('view-group'),
    exploreList: $('explore-list'), exploreCount: $('explore-count'), exploreFilter: $('explore-filter'),
    exploreEmpty: $('explore-empty'), namesGroup: $('names-group'), dlg: $('plate-dialog'), dlgImg: $('dlg-img'), dlgTitle: $('dlg-title'), dlgSub: $('dlg-sub')
  };

  var settings = { diff: 'easy', len: '25', front: false, names: false };
  var S = null; // current run
  var qToken = 0; // page-wide question counter: never repeats across runs, so stale loads can't match
  var imageCache = {};

  /* ---------- helpers ---------- */
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function show(screen) {
    [el.start, el.quiz, el.end, el.explore].forEach(function (s) { s.hidden = s !== screen; });
    if (el.home) el.home.hidden = screen === el.start;
    document.body.setAttribute('data-screen',
      screen === el.start ? 'start' : screen === el.quiz ? 'quiz' : screen === el.explore ? 'explore' : 'end');
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  // The names setting has no effect in Hard (the plate is blurred either way), so it is not part of Hard's key.
  function bestKey() {
    return 'platesquiz.v2.best.' + settings.diff + '.' + settings.len + (settings.front ? '.front' : '') +
      (settings.names && settings.diff !== 'hard' ? '.names' : '');
  }
  function getBest() {
    try {
      var v = JSON.parse(localStorage.getItem(bestKey()));
      if (v && typeof v.score === 'number' && typeof v.total === 'number' && v.total > 0 && v.score >= 0 && v.score <= v.total) return v;
    } catch (e) { /* ignore */ }
    return null;
  }
  function saveBest(score, total) {
    var prev = getBest();
    var isBest = !prev || score / total > prev.score / prev.total;
    if (isBest) {
      try { localStorage.setItem(bestKey(), JSON.stringify({ score: score, total: total })); } catch (e) { /* ignore */ }
    }
    return { isBest: isBest, prev: prev };
  }
  function fmtBest(b) {
    return b.score + '/' + b.total + ' (' + Math.round(100 * b.score / b.total) + '%)';
  }
  function updateBestLine() {
    var b = getBest();
    el.bestLine.textContent = b ? 'Your best for this setting: ' + fmtBest(b) : 'No best score yet for this setting.';
  }

  /* ---------- images ---------- */
  function loadImage(url) {
    if (imageCache[url]) return imageCache[url];
    // One automatic retry so a transient network error doesn't permanently drop a plate.
    function attempt(left) {
      return new Promise(function (resolve) {
        var img = new Image();
        img.decoding = 'async';
        img.onload = function () { resolve(img); };
        img.onerror = function () {
          if (left > 0) setTimeout(function () { attempt(left - 1).then(resolve); }, 400);
          else resolve(null);
        };
        img.src = url;
      });
    }
    imageCache[url] = attempt(1).then(function (img) {
      if (!img) delete imageCache[url]; // don't cache a failure: a later request may succeed
      return img;
    });
    return imageCache[url];
  }

  function sharpImg(plate, state) {
    var im = document.createElement('img');
    im.src = plate.img;
    im.alt = 'License plate: ' + state;
    im.draggable = false;
    return im;
  }

  /* ---------- run setup ---------- */
  // All: every plate of every state, in random order with no state twice in a row where possible.
  function pickAll() {
    var qs = ALL_PLATES.filter(function (p) { return !failedImgs[p.img]; }).map(function (p) {
      return { type: 'state', plate: p, state: STATE_BY_LOWER[String(p.state).toLowerCase()] };
    });
    return applyFront(spreadStates(qs));
  }

  // Random order with no state twice in a row (whenever that is possible).
  // Each step picks a state other than the last one, weighted by how many plates it has left;
  // a state that would otherwise run out of gaps (2*count >= remaining) is placed immediately.
  function spreadStates(qs) {
    var by = {};
    shuffle(qs).forEach(function (q) { (by[q.state] = by[q.state] || []).push(q); });
    var out = [], last = null;
    while (out.length < qs.length) {
      var left = Object.keys(by).filter(function (k) { return by[k].length; });
      var keys = left.filter(function (k) { return k !== last; });
      if (!keys.length) keys = left; // only the last state remains: adjacency unavoidable
      var remaining = qs.length - out.length, pick = null, total = 0;
      keys.forEach(function (k) {
        total += by[k].length;
        if (2 * by[k].length >= remaining && (!pick || by[k].length > by[pick].length)) pick = k;
      });
      if (!pick) {
        var r = Math.random() * total;
        for (var i = 0; i < keys.length; i++) { r -= by[keys[i]].length; if (r < 0) { pick = keys[i]; break; } }
        if (!pick) pick = keys[keys.length - 1];
      }
      out.push(by[pick].pop());
      last = pick;
    }
    return out;
  }

  function applyFront(qs) {
    if (settings.front) {
      var elig = [];
      qs.forEach(function (q, i) { if (frontQuizzable(q.state)) elig.push(i); });
      shuffle(elig).slice(0, Math.round(qs.length / 4)).forEach(function (i) { qs[i].type = 'front'; });
    }
    return qs;
  }

  // The state's primary plate: the entry with primary:true, else the first entry in file order.
  var PRIMARY = {};
  Object.keys(VERSIONS).forEach(function (k) {
    PRIMARY[k] = VERSIONS[k].filter(function (p) { return p.primary === true; })[0] || VERSIONS[k][0];
  });

  // 25 / 50: n distinct states at random, each with its primary plate only.
  function pickPrimary(n) {
    var states = shuffle(Object.keys(PRIMARY).filter(function (k) { return !failedImgs[PRIMARY[k].img]; }));
    return applyFront(states.slice(0, n).map(function (k) {
      return { type: 'state', plate: PRIMARY[k], state: k };
    }));
  }

  function startRun() {
    if (!ALL_PLATES.length) {
      el.loadError.textContent = 'No plate data could be loaded.';
      el.loadError.hidden = false;
      return;
    }
    el.loadError.hidden = true;
    var primaryMode = settings.len !== 'all';
    var n = primaryMode ? Math.min(parseInt(settings.len, 10), Object.keys(PRIMARY).length) : 0;
    S = {
      diff: settings.diff, primaryMode: primaryMode, plates: primaryMode ? pickPrimary(n) : pickAll(), idx: 0, score: 0,
      names: settings.names, answered: false, ready: false, token: 0, results: [], current: null, streak: 0, bestStreak: 0
    };
    show(el.quiz);
    el.diffLabel.textContent = DIFF_LABEL[S.diff];
    showQuestion();
  }

  function skipBroken(q) {
    failedImgs[q.plate.img] = true;
    var used = {}, usedStates = {};
    S.plates.forEach(function (x) { used[x.plate.img] = true; usedStates[x.state] = true; });
    var cands = S.primaryMode
      ? Object.keys(PRIMARY).filter(function (k) { return !usedStates[k] && !failedImgs[PRIMARY[k].img]; })
          .map(function (k) { return PRIMARY[k]; })
      : ALL_PLATES.filter(function (p) { return !used[p.img] && !failedImgs[p.img]; });
    var fresh = cands.filter(function (p) { return !usedStates[STATE_BY_LOWER[String(p.state).toLowerCase()]]; });
    var pool = fresh.length ? fresh : cands;
    if (pool.length) {
      var pl = pool[Math.floor(Math.random() * pool.length)];
      var ns = STATE_BY_LOWER[String(pl.state).toLowerCase()];
      // keep a front-plate question a front-plate question when the replacement state allows it
      S.plates[S.idx] = { type: q.type === 'front' && frontQuizzable(ns) ? 'front' : 'state', plate: pl, state: ns };
      showQuestion();
      return;
    }
    S.plates.splice(S.idx, 1);
    if (!S.plates.length) {
      S = null; show(el.start);
      el.loadError.textContent = 'Plate images could not be loaded. Please try again later.';
      el.loadError.hidden = false;
    } else if (S.idx >= S.plates.length) finish();
    else showQuestion();
  }

  function updateStreak(bump) {
    el.streak.hidden = S.streak < 2;
    el.streakN.textContent = S.streak;
    if (bump) { el.streak.classList.remove('bump'); void el.streak.offsetWidth; el.streak.classList.add('bump'); }
  }

  function showQuestion() {
    var q = S.plates[S.idx];
    var plate = q.plate, state = q.state;
    var isFront = q.type === 'front';
    var hard = S.diff === 'hard' && !isFront;
    q.correct = isFront ? (getFacts(state).frontPlate ? 'Yes' : 'No') : state;
    S.current = q;
    S.answered = false; S.ready = false;
    var token = S.token = ++qToken;
    syncBlurBtn(); // disabled until the plate is ready, and hidden if this question can't be blurred

    el.progress.textContent = (S.idx + 1) + '/' + S.plates.length;
    el.score.textContent = 'Score ' + S.score;
    updateStreak(false);
    el.frame.classList.remove('ok', 'bad', 'enter');
    void el.frame.offsetWidth;
    el.frame.classList.add('enter');
    if (S.idx > 0 && el.quiz.getBoundingClientRect().top < 0) el.quiz.scrollIntoView();
    el.fill.style.width = (100 * S.idx / S.plates.length) + '%';
    el.feedback.textContent = '';
    el.feedback.className = 'feedback';
    el.next.hidden = true;
    el.typeMsg.hidden = true;
    el.hint.textContent = '';
    el.info.hidden = true;
    el.prompt.hidden = !isFront;
    el.prompt.textContent = isFront ? 'Plate from ' + state + '. Does this state require a front license plate?' : '';
    clear(el.holder);
    var msg = document.createElement('div');
    msg.className = 'plate-msg';
    msg.textContent = 'Loading plate...';
    el.holder.appendChild(msg);

    var buttons = S.diff === 'easy' || isFront;
    el.easy.hidden = !buttons;
    el.typeForm.hidden = buttons;
    clear(el.easy);
    closeSuggest();
    el.input.value = '';
    el.input.disabled = true; el.submitBtn.disabled = true;

    cancelReveal();
    loadForQuestion(q, hard).then(function (res) {
      if (!S || token !== S.token) return; // run ended (Home) or a newer question started
      var img = res.img;
      // A missing name-free image would show the printed name, and a missing blur would show the plate: replace the question.
      if (!img || (wantsNameless(q) && !res.nl) || (hard && !res.real)) { skipBroken(q); return; }
      q.hasNl = !!res.nl;
      clear(el.holder);
      if (hard) {
        var bi = document.createElement('img');
        bi.className = 'blurred';
        bi.src = q.plate.blurImg; bi.alt = 'Blurred license plate'; bi.draggable = false;
        el.holder.appendChild(bi);
      } else {
        showBase(q, res);
      }
      el.hint.textContent = hard ? 'Colours, layout and graphics only: the text is unreadable.' : '';
      S.ready = true;
      syncBlurBtn();
      if (isFront) buildChoices('Yes', ['Yes', 'No']);
      else if (S.diff === 'easy') buildChoices(state);
      else { el.input.disabled = false; el.submitBtn.disabled = false; el.input.focus(); }
      preloadNext();
    });
  }

  /* ---------- blur toggle (Easy / Medium) ---------- */
  var blurOn = false;
  try { blurOn = localStorage.getItem('platesquiz.v2.blur') === '1'; } catch (e) { /* ignore */ }
  function canBlur(q) { return !!q && S && S.diff !== 'hard' && q.type !== 'front' && !!q.plate.blurImg; }
  // blurOk === false means the blurred image failed or timed out: show the sharp plate instead.
  function baseNode(q, blurOk) {
    if (blurOn && canBlur(q) && blurOk !== false) {
      var bi = document.createElement('img');
      bi.className = 'blurred'; bi.src = q.plate.blurImg; bi.alt = 'Blurred license plate'; bi.draggable = false;
      q.shownBlur = true;
      return bi;
    }
    q.shownBlur = false;
    var im = sharpImg(q.hasNl ? { img: q.plate.nameless } : q.plate, '');
    im.alt = 'A US license plate';
    return im;
  }
  function showBase(q, res) {
    clear(el.holder);
    el.holder.appendChild(baseNode(q, res.real));
  }
  function syncBlurBtn() {
    var q = S && S.current;
    var show = canBlur(q);
    el.blurBtn.hidden = !show;
    el.blurBtn.setAttribute('aria-pressed', blurOn ? 'true' : 'false');
    el.blurBtn.textContent = blurOn ? 'Unblur plate' : 'Blur plate';
    el.blurBtn.disabled = !S || S.answered || !S.ready;
  }

  function wantsNameless(q) {
    return !S.names && q.type !== 'front' && !!q.plate.nameless;
  }

  function preloadNext() {
    var nxt = S.plates[S.idx + 1];
    if (!nxt) return;
    loadImage(nxt.plate.img);
    if (wantsNameless(nxt)) loadImage(nxt.plate.nameless);
    if (nxt.plate.blurImg && (S.diff === 'hard' || blurOn)) loadImage(nxt.plate.blurImg);
  }

  // Resolves {img: full image, nl: nameless image or null, real: blurImg loaded}
  function loadForQuestion(q, hard) {
    var fullP = loadImage(q.plate.img);
    var nlP = wantsNameless(q) ? loadImage(q.plate.nameless) : Promise.resolve(null);
    var blurP = Promise.resolve(null);
    if ((hard || (blurOn && canBlur(q))) && q.plate.blurImg) {
      var timeout = new Promise(function (resolve) { setTimeout(function () { resolve(null); }, 7000); });
      blurP = Promise.race([loadImage(q.plate.blurImg), timeout]);
    }
    return Promise.all([fullP, nlP, blurP]).then(function (r) {
      return { img: r[0], nl: r[1], real: !!r[2] };
    });
  }

  /* ---------- plate reveal (crossfades) ---------- */
  var revealTimers = [];
  function cancelReveal() {
    revealTimers.forEach(clearTimeout);
    revealTimers = [];
  }
  function later(fn, ms) {
    var tok = S && S.token;
    revealTimers.push(setTimeout(function () { if (S && S.token === tok) fn(); }, ms));
  }
  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function layer(src, alt) {
    var im = document.createElement('img');
    im.className = 'layer'; im.src = src; im.alt = alt; im.draggable = false;
    return im;
  }
  function fadeTo(node, dur, done) {
    if (reducedMotion() || !dur) {
      clear(el.holder); el.holder.appendChild(node);
      if (done) done();
      return;
    }
    node.style.opacity = '0';
    el.holder.appendChild(node);
    void node.offsetWidth;
    node.style.transition = 'opacity ' + dur + 'ms ease';
    node.style.opacity = '1';
    later(function () {
      Array.prototype.slice.call(el.holder.children).forEach(function (c) { if (c !== node) el.holder.removeChild(c); });
      if (done) done();
    }, dur + 30);
  }
  function revealPlate(q) {
    var fullAlt = 'License plate: ' + q.state;
    var full = layer(q.plate.img, fullAlt);
    if ((q.hasNl || q.shownBlur) && !(reducedMotion())) {
      if (S.diff === 'hard') {
        fadeTo(layer(q.plate.nameless, 'License plate with the state name removed'), 600, function () {
          later(function () { fadeTo(full, 600); }, 700);
        });
      } else fadeTo(full, 600);
    } else if (S.diff === 'hard' || q.hasNl || q.shownBlur) fadeTo(full, 600);
  }

  function buildChoices(correct, fixed) {
    var opts = fixed || shuffle([correct].concat(shuffle(STATES.filter(function (s) { return s !== correct; })).slice(0, 3)));
    clear(el.easy);
    opts.forEach(function (name, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'choice';
      b.dataset.state = name;
      b.textContent = name;
      b.setAttribute('aria-keyshortcuts', String(i + 1));
      b.addEventListener('click', function () { answer(name); });
      el.easy.appendChild(b);
    });
    // Focus the group, not choice 1: a held or repeated Enter from "Next" must not answer the new question.
    el.easy.tabIndex = -1;
    el.easy.focus({ preventScroll: true });
  }

  /* ---------- answering ---------- */
  function answer(given) {
    if (!S || S.answered || !S.ready) return;
    S.answered = true;
    el.blurBtn.disabled = true;
    var cur = S.current;
    var isFront = cur.type === 'front';
    var buttons = S.diff === 'easy' || isFront;
    var ok = given === cur.correct;
    if (ok) { S.score++; S.streak++; if (S.streak > S.bestStreak) S.bestStreak = S.streak; }
    else { S.streak = 0; S.results.push({ q: cur, given: given }); }
    el.score.textContent = 'Score ' + S.score;
    if (ok) { el.score.classList.remove('bump'); void el.score.offsetWidth; el.score.classList.add('bump'); }
    updateStreak(ok);
    el.frame.classList.add(ok ? 'ok' : 'bad');
    el.fill.style.width = (100 * (S.idx + 1) / S.plates.length) + '%';

    el.feedback.className = 'feedback ' + (ok ? 'good' : 'bad');
    if (isFront) {
      var req = cur.correct === 'Yes' ? 'requires' : 'does not require';
      el.feedback.textContent = (ok ? 'Correct! ' : 'Wrong. ') + cur.state + ' ' + req + ' a front plate.';
    } else {
      el.feedback.textContent = ok ? 'Correct! ' + cur.state
        : 'Wrong. It was ' + cur.state + (buttons ? '' : ' (you said ' + given + ')');
    }

    if (buttons) {
      Array.prototype.forEach.call(el.easy.children, function (b) {
        b.disabled = true;
        if (b.dataset.state === cur.correct) b.classList.add('correct');
        else if (b.dataset.state === given) b.classList.add('wrong');
      });
    } else {
      el.input.disabled = true; el.submitBtn.disabled = true;
      closeSuggest();
      el.typeMsg.hidden = true;
    }
    if (!isFront) {
      revealPlate(cur);
      el.hint.textContent = '';
    }
    el.next.textContent = S.idx + 1 >= S.plates.length ? 'See results' : 'Next';
    el.next.hidden = false;
    showInfo(cur);
    el.next.focus();
  }

  /* ---------- info card ---------- */
  var factState = { order: [], i: 0 };
  function showFact() {
    if (!factState.order.length) { el.infoFactWrap.hidden = true; return; }
    el.infoFactWrap.hidden = false;
    el.infoFact.textContent = factState.order[factState.i];
    el.infoMore.hidden = factState.order.length < 2;
  }
  function showInfo(q) {
    var f = getFacts(q.state) || {};
    el.infoState.textContent = q.state;
    el.infoLabel.textContent = q.plate.label ? q.plate.label : '';
    el.infoLabel.hidden = !q.plate.label;
    el.infoNick.textContent = typeof f.nickname === 'string' ? f.nickname : '';
    el.infoNick.hidden = !el.infoNick.textContent;
    var tr = Array.isArray(f.trivia) ? f.trivia.filter(function (t) { return typeof t === 'string' && t; }) : [];
    factState.order = shuffle(tr); factState.i = 0;
    showFact();
    el.infoDesigns.textContent = typeof f.designs === 'string' ? f.designs : '';
    el.infoDesigns.hidden = !el.infoDesigns.textContent;
    clear(el.infoFront);
    if (typeof f.frontPlate === 'boolean') {
      var b = document.createElement('span');
      b.className = 'badge ' + (f.frontPlate ? 'yes' : 'no');
      b.textContent = f.frontPlate ? 'Front plate required' : 'Rear plate only';
      el.infoFront.appendChild(b);
      if (typeof f.frontNote === 'string' && f.frontNote) {
        el.infoFront.appendChild(document.createTextNode(' ' + f.frontNote));
      }
    }
    el.infoFront.hidden = !el.infoFront.firstChild;
    buildStrip(q);
    el.info.hidden = false;
  }

  function buildStrip(q) {
    clear(el.stripList);
    var vs = VERSIONS[q.state] || [];
    if (!S.primaryMode) {
      // In All mode, only compare designs already shown this run, so the strip can't reveal later answers.
      var shown = {};
      S.plates.slice(0, S.idx + 1).forEach(function (x) { shown[x.plate.img] = true; });
      vs = vs.filter(function (v) { return shown[v.img]; });
    }
    el.strip.hidden = vs.length < 2;
    if (vs.length < 2) return;
    vs.forEach(function (v, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'thumb';
      var name = v.label || ('Design ' + (i + 1));
      b.setAttribute('aria-label', 'Show ' + name + ' design');
      b.setAttribute('aria-pressed', v === q.plate ? 'true' : 'false');
      var im = document.createElement('img');
      im.src = v.img; im.alt = ''; im.loading = 'lazy'; im.draggable = false;
      var cap = document.createElement('span');
      cap.textContent = name;
      b.appendChild(im); b.appendChild(cap);
      b.addEventListener('click', function () {
        cancelReveal();
        clear(el.holder);
        el.holder.appendChild(sharpImg(v, q.state + (v.label ? ' (' + v.label + ')' : '')));
        el.infoLabel.textContent = v.label || '';
        el.infoLabel.hidden = !v.label;
        Array.prototype.forEach.call(el.stripList.children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        el.frame.classList.remove('enter');
      });
      el.stripList.appendChild(b);
    });
  }
  el.infoMore.addEventListener('click', function () {
    if (factState.order.length) { factState.i = (factState.i + 1) % factState.order.length; showFact(); }
  });

  function next() {
    if (!S || !S.answered) return;
    S.idx++;
    if (S.idx >= S.plates.length) finish();
    else showQuestion();
  }

  /* ---------- autocomplete ---------- */
  var sug = { items: [], active: -1 };

  function matches(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    var pre = [], sub = [];
    STATES.forEach(function (s) {
      var l = s.toLowerCase();
      if (l.indexOf(q) === 0) pre.push(s);
      else if (l.indexOf(q) > 0) sub.push(s);
    });
    return pre.concat(sub);
  }
  function closeSuggest() {
    sug.items = []; sug.active = -1;
    el.suggest.hidden = true; clear(el.suggest);
    el.input.setAttribute('aria-expanded', 'false');
    el.input.removeAttribute('aria-activedescendant');
  }
  function renderSuggest() {
    clear(el.suggest);
    var q = el.input.value.trim().toLowerCase();
    sug.items.forEach(function (name, i) {
      var li = document.createElement('li');
      li.id = 'sug-' + i;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', i === sug.active ? 'true' : 'false');
      var at = name.toLowerCase().indexOf(q);
      if (at >= 0 && q) {
        li.appendChild(document.createTextNode(name.slice(0, at)));
        var mk = document.createElement('mark');
        mk.textContent = name.slice(at, at + q.length);
        li.appendChild(mk);
        li.appendChild(document.createTextNode(name.slice(at + q.length)));
      } else li.textContent = name;
      li.addEventListener('mousedown', function (e) { e.preventDefault(); });
      li.addEventListener('click', function () { chooseState(name); });
      el.suggest.appendChild(li);
    });
    el.suggest.hidden = !sug.items.length;
    el.suggest.classList.remove('up');
    if (sug.items.length) {
      var r = el.input.getBoundingClientRect();
      var vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      if (vh - r.bottom < 230 && r.top > vh - r.bottom) el.suggest.classList.add('up');
    }
    el.input.setAttribute('aria-expanded', sug.items.length ? 'true' : 'false');
    if (sug.active >= 0) {
      el.input.setAttribute('aria-activedescendant', 'sug-' + sug.active);
      var node = el.suggest.children[sug.active];
      if (node && node.scrollIntoView) node.scrollIntoView({ block: 'nearest' });
    } else el.input.removeAttribute('aria-activedescendant');
  }
  function updateSuggest() {
    el.typeMsg.hidden = true;
    sug.items = matches(el.input.value);
    sug.active = -1;
    renderSuggest();
  }
  function chooseState(name) {
    el.input.value = name;
    closeSuggest();
    answer(name);
  }
  function trySubmitTyped() {
    if (!S || S.answered || !S.ready) return;
    var exact = STATE_BY_LOWER[el.input.value.trim().toLowerCase()];
    if (exact) return chooseState(exact);
    var m = matches(el.input.value);
    if (m.length === 1) return chooseState(m[0]);
    el.typeMsg.textContent = el.input.value.trim()
      ? 'Please choose a valid state from the list.' : 'Type a state name first.';
    el.typeMsg.hidden = false;
    if (m.length) { sug.items = m; renderSuggest(); }
  }

  el.input.addEventListener('input', updateSuggest);
  el.input.addEventListener('keydown', function (e) {
    var n = sug.items.length;
    if (e.key === 'ArrowDown' && n) {
      e.preventDefault(); sug.active = (sug.active + 1) % n; renderSuggest();
    } else if (e.key === 'ArrowUp' && n) {
      e.preventDefault(); sug.active = (sug.active - 1 + n) % n; renderSuggest();
    } else if (e.key === 'Escape') {
      if (n) { e.preventDefault(); closeSuggest(); }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (sug.active >= 0) chooseState(sug.items[sug.active]);
      else trySubmitTyped();
    }
  });
  el.input.addEventListener('blur', function () { setTimeout(closeSuggest, 120); });
  el.typeForm.addEventListener('submit', function (e) { e.preventDefault(); trySubmitTyped(); });

  /* ---------- end screen ---------- */
  function rankInfo(pct) {
    if (pct === 100) return ['Plate Perfect', 'Not a single miss. Pull over for your trophy.'];
    if (pct >= 90) return ['Highway Legend', 'You could do this blindfolded in the back seat.'];
    if (pct >= 75) return ['Road Trip Pro', 'Seasoned highway navigator.'];
    if (pct >= 50) return ['Weekend Driver', 'Solid co-pilot. Keep cruising.'];
    if (pct >= 25) return ['Learner Permit', 'Getting there. Take another lap!'];
    return ['Parking Lot Rookie', 'Everyone starts somewhere. Give it another go!'];
  }

  function animateRing(pct) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { el.ring.style.setProperty('--p', pct); return; }
    var start = null, dur = 900;
    el.ring.style.setProperty('--p', 0);
    function step(t) {
      if (start === null) start = t;
      var k = Math.min(1, (t - start) / dur);
      el.ring.style.setProperty('--p', (pct * (1 - Math.pow(1 - k, 3))).toFixed(1));
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function finish() {
    var total = S.plates.length, score = S.score;
    var pct = Math.round(100 * score / total);
    show(el.end);
    el.finalScore.textContent = score + '/' + total;
    el.finalPct.textContent = pct + '% on ' + DIFF_LABEL[S.diff];
    var rk = rankInfo(pct);
    el.rank.textContent = rk[0];
    el.rankSub.textContent = rk[1];
    el.streakFinal.textContent = S.bestStreak > 1 ? 'Longest streak: ' + S.bestStreak : '';
    animateRing(pct);
    el.shareMsg.textContent = '';
    S.shareText = 'I scored ' + score + '/' + total + ' on the US License Plate Quiz (' + DIFF_LABEL[S.diff] +
      (settings.front ? ', with front-plate questions' : '') + ') ' + pageUrl();

    var r = saveBest(score, total);
    el.bestResult.textContent = r.isBest
      ? (r.prev ? 'New best score! (previous: ' + fmtBest(r.prev) + ')' : 'New best score!')
      : 'Best for this setting: ' + fmtBest(r.prev);

    clear(el.missed);
    el.missedWrap.hidden = !S.results.length;
    S.results.forEach(function (r) {
      var m = { plate: r.q.plate, state: r.q.state, given: r.given, correct: r.q.correct };
      var li = document.createElement('li');
      var im = document.createElement('img');
      im.src = m.plate.img; im.alt = 'License plate of ' + m.state; im.loading = 'lazy';
      var d = document.createElement('div');
      if (r.q.type === 'front') {
        var h = document.createElement('div');
        h.className = 'qline';
        h.textContent = m.state + ': front plate required?';
        d.appendChild(h);
      }
      var a = document.createElement('div');
      a.appendChild(document.createTextNode('You: '));
      var yb = document.createElement('span'); yb.className = 'bad'; yb.textContent = m.given || 'no answer';
      a.appendChild(yb);
      var c = document.createElement('div');
      c.appendChild(document.createTextNode('Correct: '));
      var cb = document.createElement('span'); cb.className = 'good'; cb.textContent = m.correct;
      c.appendChild(cb);
      d.appendChild(a); d.appendChild(c);
      li.appendChild(im); li.appendChild(d);
      el.missed.appendChild(li);
    });
    el.again.focus();
  }

  /* ---------- start screen wiring ---------- */
  function wireGroup(group, attr, key) {
    group.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-' + attr + ']');
      if (!b) return;
      settings[key] = b.getAttribute('data-' + attr);
      Array.prototype.forEach.call(group.querySelectorAll('button'), function (x) {
        x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
      updateBestLine();
    });
  }
  wireGroup(el.diffGroup, 'diff', 'diff');
  wireGroup(el.lenGroup, 'len', 'len');
  el.blurBtn.addEventListener('click', function () {
    var q = S && S.current;
    if (!S || S.answered || !S.ready || !canBlur(q)) return;
    blurOn = !blurOn;
    try { localStorage.setItem('platesquiz.v2.blur', blurOn ? '1' : '0'); } catch (e) { /* ignore */ }
    syncBlurBtn();
    // Wait for the blurred image (cached promise) so a missing file falls back to the sharp plate.
    var tok = S.token;
    var p = blurOn ? loadImage(q.plate.blurImg) : Promise.resolve(true);
    p.then(function (ok) {
      if (!S || S.token !== tok || S.answered) return;
      fadeTo(baseNode(q, !!ok), 250);
    });
  });
  el.frontToggle.addEventListener('change', function () { settings.front = el.frontToggle.checked; updateBestLine(); });
  el.namesToggle.addEventListener('change', function () { settings.names = el.namesToggle.checked; updateBestLine(); });
  el.startBtn.addEventListener('click', startRun);
  el.next.addEventListener('click', next);
  el.again.addEventListener('click', startRun);
  el.home.addEventListener('click', function () {
    qToken++; // invalidate any plate still loading
    cancelReveal();
    S = null;
    closeSuggest();
    show(el.start);
    updateBestLine();
    window.scrollTo(0, 0);
  });

  function pageUrl() {
    try { return location.origin + location.pathname; } catch (e) { return ''; }
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  el.share.addEventListener('click', function () {
    if (!S || !S.shareText) return;
    var text = S.shareText;
    function done(ok) {
      el.shareMsg.textContent = ok ? 'Result copied to clipboard!' : 'Could not copy automatically. Copy this: ' + text;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
    } else done(fallbackCopy(text));
  });
  el.change.addEventListener('click', function () {
    S = null; show(el.start); updateBestLine(); el.startBtn.focus();
  });

  document.addEventListener('keydown', function (e) {
    if (el.quiz.hidden || !S || e.defaultPrevented) return;
    // Ignore auto-repeat of Enter so holding it can't skip through questions (also cancels the button's click).
    if (e.key === 'Enter' && e.repeat) { e.preventDefault(); return; }
    var t = e.target;
    var onBody = t === document.body || t === document.documentElement;
    if (e.key === 'Enter' && S.answered && onBody) { e.preventDefault(); next(); return; }
    var buttons = S.diff === 'easy' || S.current.type === 'front';
    if (buttons && !S.answered && S.ready && !e.ctrlKey && !e.metaKey && !e.altKey) {
      var idx = /^[1-4]$/.test(e.key) ? parseInt(e.key, 10) - 1 : -1;
      if (S.current.type === 'front') { var k = e.key.toLowerCase(); if (k === 'y') idx = 0; else if (k === 'n') idx = 1; }
      var b = el.easy.children[idx];
      if (b) answer(b.dataset.state);
    }
  });

  /* ---------- explore all plates ---------- */
  var exploreView = 'state';
  // Grid only: which image each tile shows: 'names' (full plate), 'hidden' (name-free plate) or 'blur' (blurred plate).
  // Captions and tooltips are always shown; only the picture changes.
  var EXPLORE_MODES = { names: 1, hidden: 1, blur: 1 };
  var exploreMode = 'names';
  try {
    if (localStorage.getItem('platesquiz.v2.explore') === 'grid') exploreView = 'grid';
    var savedMode = localStorage.getItem('platesquiz.v2.exploreMode');
    if (EXPLORE_MODES[savedMode]) exploreMode = savedMode;
    else if (localStorage.getItem('platesquiz.v2.exploreHide') === '1') exploreMode = 'hidden'; // old toggle setting
  } catch (e) { /* ignore */ }

  // States in alphabetical order, each with its plates: main plate first, then file order.
  function exploreGroups() {
    return STATES.filter(function (s) { return VERSIONS[s] && VERSIONS[s].length; }).map(function (s) {
      var vs = VERSIONS[s].slice().sort(function (a, b) { return (b === PRIMARY[s]) - (a === PRIMARY[s]); });
      return { state: s, plates: vs };
    });
  }

  // mode: undefined/'names' = normal; 'hidden' = name-free image; 'blur' = blurred image.
  function plateButton(p, state, cls, caption, mode) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = cls + (mode === 'blur' ? ' is-blur' : '');
    var name = state + (p.label ? ' (' + p.label + ')' : '');
    b.setAttribute('aria-label', 'Show ' + name + ' larger');
    b.title = name;
    var im = document.createElement('img');
    im.src = mode === 'blur' && p.blurImg ? p.blurImg : mode === 'hidden' && p.nameless ? p.nameless : p.img;
    im.alt = ''; im.loading = 'lazy'; im.decoding = 'async'; im.draggable = false;
    b.appendChild(im);
    if (caption) b.appendChild(caption);
    b.addEventListener('click', function () { openPlate(p, state); });
    return b;
  }

  function renderExplore() {
    clear(el.exploreList);
    el.exploreList.className = 'explore-list view-' + exploreView;
    Array.prototype.forEach.call(el.viewGroup.querySelectorAll('button'), function (x) {
      x.setAttribute('aria-pressed', x.getAttribute('data-view') === exploreView ? 'true' : 'false');
    });
    var groups = exploreGroups();
    el.namesGroup.hidden = exploreView !== 'grid';
    Array.prototype.forEach.call(el.namesGroup.querySelectorAll('button'), function (x) {
      x.setAttribute('aria-pressed', x.getAttribute('data-names') === exploreMode ? 'true' : 'false');
    });
    if (exploreView === 'grid') {
      var tiles = [];
      groups.forEach(function (g) {
        g.plates.forEach(function (p) { tiles.push({ p: p, state: g.state }); });
      });
      tiles.forEach(function (x) {
        var cap = document.createElement('span');
        cap.className = 'ex-cap'; cap.textContent = x.state;
        var t = plateButton(x.p, x.state, 'ex-tile', cap, exploreMode);
        t.setAttribute('data-state', x.state.toLowerCase());
        el.exploreList.appendChild(t);
      });
    } else {
      groups.forEach(function (g) {
        var f = getFacts(g.state) || {};
        var sec = document.createElement('section');
        sec.className = 'ex-state';
        sec.setAttribute('data-state', g.state.toLowerCase());
        var head = document.createElement('div');
        head.className = 'ex-head';
        var h = document.createElement('h3'); h.textContent = g.state; head.appendChild(h);
        if (typeof f.nickname === 'string' && f.nickname) {
          var nk = document.createElement('span'); nk.className = 'ex-nick'; nk.textContent = f.nickname; head.appendChild(nk);
        }
        if (typeof f.frontPlate === 'boolean') {
          var bd = document.createElement('span');
          bd.className = 'badge ' + (f.frontPlate ? 'yes' : 'no');
          bd.textContent = f.frontPlate ? (f.frontAmbiguous ? 'Front plate (with exceptions)' : 'Front plate required') : 'Rear plate only';
          head.appendChild(bd);
        }
        sec.appendChild(head);
        var row = document.createElement('div');
        row.className = 'ex-variants';
        g.plates.forEach(function (p, i) {
          var cap = document.createElement('span');
          cap.className = 'ex-cap';
          cap.textContent = p.label || (g.plates.length > 1 ? 'Design ' + (i + 1) : 'Standard design');
          if (p === PRIMARY[g.state] && g.plates.length > 1) {
            var tag = document.createElement('em'); tag.className = 'ex-main'; tag.textContent = 'Main';
            cap.appendChild(document.createTextNode(' ')); cap.appendChild(tag);
          }
          row.appendChild(plateButton(p, g.state, 'ex-plate', cap));
        });
        sec.appendChild(row);
        el.exploreList.appendChild(sec);
      });
    }
    applyExploreFilter();
  }

  function applyExploreFilter() {
    var q = el.exploreFilter.value.trim().toLowerCase();
    var shown = 0, states = {};
    Array.prototype.forEach.call(el.exploreList.children, function (n) {
      var st = n.getAttribute('data-state') || '';
      var ok = !q || st.indexOf(q) >= 0;
      n.hidden = !ok;
      if (ok) {
        shown += n.classList.contains('ex-state') ? n.querySelectorAll('.ex-plate').length : 1;
        states[st] = true;
      }
    });
    var ns = Object.keys(states).length;
    el.exploreCount.textContent = shown + ' plate' + (shown === 1 ? '' : 's') + ' · ' + ns + ' state' + (ns === 1 ? '' : 's');
    el.exploreEmpty.hidden = shown > 0;
  }

  function openPlate(p, state) {
    el.dlgImg.src = p.img;
    el.dlgImg.alt = 'License plate: ' + state + (p.label ? ' (' + p.label + ')' : '');
    el.dlgTitle.textContent = state;
    el.dlgSub.textContent = p.label || '';
    el.dlgSub.hidden = !p.label;
    if (typeof el.dlg.showModal === 'function') el.dlg.showModal(); else el.dlg.setAttribute('open', '');
  }
  // click on the dark backdrop (outside the dialog box) closes it
  el.dlg.addEventListener('click', function (e) { if (e.target === el.dlg) el.dlg.close(); });

  el.exploreBtn.addEventListener('click', function () {
    S = null;
    show(el.explore);
    if (!el.exploreList.firstChild) renderExplore();
    window.scrollTo(0, 0);
  });
  el.viewGroup.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-view]');
    if (!b || b.getAttribute('data-view') === exploreView) return;
    exploreView = b.getAttribute('data-view');
    try { localStorage.setItem('platesquiz.v2.explore', exploreView); } catch (err) { /* ignore */ }
    renderExplore();
  });
  el.exploreFilter.addEventListener('input', applyExploreFilter);
  el.namesGroup.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-names]');
    if (!b || b.getAttribute('data-names') === exploreMode) return;
    exploreMode = b.getAttribute('data-names');
    try {
      localStorage.setItem('platesquiz.v2.exploreMode', exploreMode);
      localStorage.removeItem('platesquiz.v2.exploreHide');
    } catch (err) { /* ignore */ }
    renderExplore();
  });

  /* ---------- init ---------- */
  el.allCount.textContent = ALL_PLATES.length ? ALL_PLATES.length + ' plates' : 'plates';
  var anyFront = ALL_PLATES.some(function (p) { return hasFront(STATE_BY_LOWER[String(p.state).toLowerCase()]); });
  if (!anyFront) {
    el.frontToggle.disabled = true;
    el.frontNote.textContent = 'Not available (no front-plate data).';
  }
  if (!ALL_PLATES.some(function (p) { return !!p.nameless; })) {
    el.namesToggle.disabled = true;
    el.namesNote.textContent = 'Not available (no name-free images).';
  }
  updateBestLine();
  if (!ALL_PLATES.length) {
    el.loadError.textContent = 'Plate data is not available yet.';
    el.loadError.hidden = false;
  }
  ALL_PLATES.forEach(function (p) {
    var li = document.createElement('li');
    li.textContent = p.state + (p.label ? ' (' + p.label + ')' : '') + ': ' + (p.credit || 'No credit information');
    el.credits.appendChild(li);
  });
})();
