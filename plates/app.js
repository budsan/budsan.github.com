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
  var failedImgs = {};
  var VERSIONS = {};
  ALL_PLATES.forEach(function (p) {
    var k = STATE_BY_LOWER[String(p.state).toLowerCase()];
    (VERSIONS[k] = VERSIONS[k] || []).push(p);
  });
  var seenImgs = {}; // session-wide: plate versions already shown

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
    rankSub: $('rank-sub'), streakFinal: $('streak-final')
  };

  var settings = { diff: 'easy', len: '25', front: false, names: false };
  var S = null; // current run
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
    [el.start, el.quiz, el.end].forEach(function (s) { s.hidden = s !== screen; });
    if (el.home) el.home.hidden = screen === el.start;
    document.body.setAttribute('data-screen', screen === el.start ? 'start' : screen === el.quiz ? 'quiz' : 'end');
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function bestKey() { return 'platesquiz.v2.best.' + settings.diff + '.' + settings.len + (settings.front ? '.front' : '') + (settings.names ? '.names' : ''); }
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
    imageCache[url] = new Promise(function (resolve) {
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = url;
    });
    return imageCache[url];
  }

  // Heavily blurred, downscaled, noisy rendering. The sharp image is never put in the DOM.
  function renderBlurred(img) {
    var nw = img.naturalWidth || 480, nh = img.naturalHeight || 240;
    var W = 480, H = Math.max(1, Math.round(W * nh / nw));
    var radius = Math.round(W * 0.045);
    var m = radius * 2;

    // 1. strong downscale (destroys fine detail)
    var smallW = Math.max(8, Math.round(W / 5)), smallH = Math.max(8, Math.round(smallW * nh / nw));
    var small = document.createElement('canvas');
    small.width = smallW; small.height = smallH;
    var sc = small.getContext('2d');
    sc.imageSmoothingQuality = 'high';
    sc.drawImage(img, 0, 0, smallW, smallH);

    // 2. upscale into padded canvas with edge extension, so the blur does not fade at the borders
    var pad = document.createElement('canvas');
    pad.width = W + 2 * m; pad.height = H + 2 * m;
    var pc = pad.getContext('2d');
    pc.imageSmoothingEnabled = true; pc.imageSmoothingQuality = 'high';
    pc.drawImage(small, 0, 0, smallW, smallH, m, m, W, H);
    pc.drawImage(small, 0, 0, 1, smallH, 0, m, m, H);
    pc.drawImage(small, smallW - 1, 0, 1, smallH, W + m, m, m, H);
    pc.drawImage(small, 0, 0, smallW, 1, m, 0, W, m);
    pc.drawImage(small, 0, smallH - 1, smallW, 1, m, H + m, W, m);
    pc.drawImage(small, 0, 0, 1, 1, 0, 0, m, m);
    pc.drawImage(small, smallW - 1, 0, 1, 1, W + m, 0, m, m);
    pc.drawImage(small, 0, smallH - 1, 1, 1, 0, H + m, m, m);
    pc.drawImage(small, smallW - 1, smallH - 1, 1, 1, W + m, H + m, m, m);

    // 3. gaussian blur (canvas filter if supported, else CSS filter on the element)
    var out = document.createElement('canvas');
    out.width = W; out.height = H;
    var oc = out.getContext('2d');
    var filtered = false;
    if ('filter' in oc) {
      oc.filter = 'blur(' + radius + 'px)';
      oc.drawImage(pad, -m, -m);
      oc.filter = 'none';
      filtered = true;
    } else {
      oc.drawImage(pad, -m, -m);
    }
    if (!filtered) out.style.filter = 'blur(' + radius + 'px)';

    // 4. light noise
    try {
      var d = oc.getImageData(0, 0, W, H), px = d.data;
      for (var i = 0; i < px.length; i += 4) {
        var n = (Math.random() - 0.5) * 24;
        px[i] += n; px[i + 1] += n; px[i + 2] += n;
      }
      oc.putImageData(d, 0, 0);
    } catch (e) { /* tainted canvas: skip noise */ }

    out.setAttribute('role', 'img');
    out.setAttribute('aria-label', 'Blurred license plate');
    return out;
  }

  function sharpImg(plate, state) {
    var im = document.createElement('img');
    im.src = plate.img;
    im.alt = 'License plate: ' + state;
    im.draggable = false;
    return im;
  }

  /* ---------- run setup ---------- */
  function pickPlates(n) {
    var by = {};
    ALL_PLATES.forEach(function (p) {
      if (failedImgs[p.img]) return;
      var k = STATE_BY_LOWER[String(p.state).toLowerCase()];
      (by[k] = by[k] || []).push(p);
    });
    Object.keys(by).forEach(function (k) {
      var list = by[k];
      if (list.every(function (p) { return seenImgs[p.img]; })) list.forEach(function (p) { delete seenImgs[p.img]; });
      var seen = shuffle(list.filter(function (p) { return seenImgs[p.img]; }));
      var fresh = shuffle(list.filter(function (p) { return !seenImgs[p.img]; }));
      by[k] = seen.concat(fresh); // pop() takes unseen versions first
    });
    var picked = [];
    while (picked.length < n) {
      var keys = shuffle(Object.keys(by).filter(function (k) { return by[k].length; }));
      if (!keys.length) break;
      for (var i = 0; i < keys.length && picked.length < n; i++) picked.push(by[keys[i]].pop());
    }
    picked.forEach(function (p) { seenImgs[p.img] = true; });
    var qs = shuffle(picked).map(function (p) {
      return { type: 'state', plate: p, state: STATE_BY_LOWER[String(p.state).toLowerCase()] };
    });
    for (var a = 1; a < qs.length; a++) {
      if (qs[a].state !== qs[a - 1].state) continue;
      for (var b = a + 1; b < qs.length; b++) {
        if (qs[b].state !== qs[a - 1].state) { var tmp = qs[a]; qs[a] = qs[b]; qs[b] = tmp; break; }
      }
    }
    return applyFront(qs);
  }

  function applyFront(qs) {
    if (settings.front) {
      var elig = [];
      qs.forEach(function (q, i) { if (hasFront(q.state)) elig.push(i); });
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
    var n = primaryMode ? Math.min(parseInt(settings.len, 10), Object.keys(PRIMARY).length) : ALL_PLATES.length;
    S = {
      diff: settings.diff, primaryMode: primaryMode, plates: primaryMode ? pickPrimary(n) : pickPlates(n), idx: 0, score: 0,
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
      S.plates[S.idx] = { type: 'state', plate: pl, state: STATE_BY_LOWER[String(pl.state).toLowerCase()] };
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
    var token = ++S.token;

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
      if (token !== S.token) return;
      var img = res.img;
      if (!img) { skipBroken(q); return; }
      q.hasNl = !!res.nl;
      clear(el.holder);
      if (hard && res.real) {
        var bi = document.createElement('img');
        bi.className = 'blurred';
        bi.src = q.plate.blurImg; bi.alt = 'Blurred license plate'; bi.draggable = false;
        el.holder.appendChild(bi);
      } else if (hard) {
        el.holder.appendChild(renderBlurred(img));
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
  function baseNode(q) {
    if (blurOn && canBlur(q)) {
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
  function showBase(q) {
    clear(el.holder);
    el.holder.appendChild(baseNode(q));
  }
  function syncBlurBtn() {
    var q = S && S.current;
    var show = canBlur(q);
    el.blurBtn.hidden = !show;
    el.blurBtn.setAttribute('aria-pressed', blurOn ? 'true' : 'false');
    el.blurBtn.textContent = blurOn ? 'Unblur plate' : 'Blur plate';
    el.blurBtn.disabled = !!(S && S.answered);
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
    if (el.easy.firstChild && el.easy.firstChild.focus) el.easy.firstChild.focus({ preventScroll: true });
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
    var node = baseNode(q);
    fadeTo(node, 250);
    syncBlurBtn();
  });
  el.frontToggle.addEventListener('change', function () { settings.front = el.frontToggle.checked; updateBestLine(); });
  el.namesToggle.addEventListener('change', function () { settings.names = el.namesToggle.checked; updateBestLine(); });
  el.startBtn.addEventListener('click', startRun);
  el.next.addEventListener('click', next);
  el.again.addEventListener('click', startRun);
  el.home.addEventListener('click', function () {
    if (S) S.token++;
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
