// 블로그 시각화: flow · arch · tabs · rail · permsim
(function () {
  // flow · arch: 항목을 누르면 설명 표시
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".flow-step, .arch-item");
    if (!b) return;
    var fig = b.closest(".viz");
    fig.querySelectorAll(".flow-step, .arch-item").forEach(function (x) {
      x.classList.toggle("is-active", x === b);
      x.setAttribute("aria-pressed", x === b ? "true" : "false");
    });
    fig.querySelector(".viz-detail").textContent = b.dataset.detail || "";
  });

  // tabs
  document.querySelectorAll("[data-tabs]").forEach(function (fig) {
    fig.addEventListener("click", function (e) {
      var b = e.target.closest("[data-tab]");
      if (!b) return;
      fig.querySelectorAll("[data-tab]").forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
      fig.querySelectorAll("[data-tab-panel]").forEach(function (p) { p.hidden = p.dataset.tabPanel !== b.dataset.tab; });
    });
  });

  // rail
  var RAIL_TEXT = {
    normal: "정상 배치: 두 노드의 같은 번호 GPU가 같은 rail leaf로 갑니다. 노드 사이 같은 번호 GPU 통신이 leaf 하나 안에서 끝납니다.",
    mis: "빈 포트에 예비 노드를 연결하면 노드 B의 GPU가 다른 번호의 leaf에 붙습니다. 같은 번호 GPU끼리 통신할 때 spine을 거치게 되어 경로가 달라집니다.",
    moved: "고장 노드를 빼고 그 자리에 예비 노드를 옮겨 재마운트, 전원, 광 케이블을 다시 연결했습니다. rail 배치가 그대로 유지됩니다. 두 달 동안 9번 진행했습니다."
  };
  document.querySelectorAll("[data-rail]").forEach(function (fig) {
    var svg = fig.querySelector("svg"), txt = fig.querySelector("[data-rail-text]");
    function leafOf(g) { return fig.dataset.mode === "mis" && g.dataset.leafMis ? g.dataset.leafMis : g.dataset.leaf; }
    function highlight(i) {
      svg.querySelectorAll(".up, .dn, .leaf").forEach(function (el) { el.classList.toggle("hl", el.dataset.leaf === i); });
      svg.querySelectorAll(".gpu").forEach(function (g) { g.classList.toggle("hl", leafOf(g) === i); });
    }
    function pick(e) {
      var g = e.target.closest(".gpu, .leaf");
      if (!g) return;
      highlight(g.classList.contains("gpu") ? leafOf(g) : g.dataset.leaf);
    }
    svg.addEventListener("click", pick);
    svg.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(e); } });
    fig.querySelectorAll("[data-mode-btn]").forEach(function (b) {
      b.addEventListener("click", function () {
        fig.dataset.mode = b.dataset.modeBtn;
        fig.querySelectorAll("[data-mode-btn]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        txt.textContent = RAIL_TEXT[b.dataset.modeBtn];
        highlight("0");
      });
    });
    highlight("0");
  });

  // permsim
  document.querySelectorAll("[data-permsim]").forEach(function (fig) {
    var rules = JSON.parse(fig.dataset.rules);
    var cmd = fig.querySelector("[data-cmd]"), mode = fig.querySelector("[data-mode]");
    var out = fig.querySelector(".sim-result");
    function hit(c) {
      for (var i = 0; i < rules.length; i++) {
        var p = rules[i].replace(/ \*$/, "");
        if (c === p || c.indexOf(p + " ") === 0) return rules[i];
      }
      return null;
    }
    function set(s, v, state) {
      var li = fig.querySelector('[data-s="' + s + '"]');
      li.querySelector(".sim-v").textContent = v;
      li.className = state;
    }
    function run() {
      var c = cmd.value, m = mode.value, r = hit(c);
      set("deny", "해당 없음 (deny 규칙 없음)", "pass");
      if (r) {
        set("ask", "Bash(" + r + ") 에 해당", "hit");
        set("allow", "평가하지 않음", "skip");
        out.textContent = "확인 요청: " + (m === "bypass" ? "bypassPermissions 모드에서도 " : "") + "실행 전에 사용자에게 묻습니다.";
        out.className = "viz-detail sim-result tone-ok";
      } else if (m === "bypass") {
        set("ask", "해당 없음", "pass");
        set("allow", "bypassPermissions: allow 규칙과 상관없이 실행", "hit");
        out.textContent = "바로 실행: 묻지 않고 실행합니다.";
        out.className = "viz-detail sim-result tone-warn";
      } else {
        set("ask", "해당 없음", "pass");
        set("allow", "allow 규칙 없음, 기본 동작", "hit");
        out.textContent = "확인 요청: 허용 규칙이 없어 사용자에게 묻습니다.";
        out.className = "viz-detail sim-result";
      }
    }
    cmd.addEventListener("change", run); mode.addEventListener("change", run); run();
  });
})();

// spike: 기종별 전력 개념도 + 랙당 대수 계산
(function () {
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }
  document.querySelectorAll("[data-spike]").forEach(function (fig) {
    var models = JSON.parse(fig.dataset.spike), svg = fig.querySelector("svg");
    var budget = fig.querySelector("[data-budget]"), out = fig.querySelector("[data-budget-out]");
    var rows = fig.querySelector("[data-rows]"), txt = fig.querySelector("[data-spike-text]");
    var cur = 0, X0 = 56, X1 = 744, Y0 = 270, Y1 = 16, MAX = 20;
    function y(kw) { return Y0 - (kw / MAX) * (Y0 - Y1); }
    function draw() {
      var m = models[cur];
      svg.textContent = "";
      for (var t = 0; t <= MAX; t += 5) {
        svg.appendChild(el("line", { class: "grid", x1: X0, x2: X1, y1: y(t), y2: y(t) }));
        svg.appendChild(el("text", { class: "ax", x: X0 - 8, y: y(t) + 4 }, t + "kW"));
      }
      // 대기 → 학습 시작 → 계산·통신 반복, 동기화 순간마다 스파이크
      var pts = [[X0, y(m.load * 0.25)], [130, y(m.load * 0.25)], [150, y(m.load * 0.9)]];
      for (var x = 150, i = 0; x < X1 - 20; x += 44, i++) {
        var top = i % 3 === 1 ? m.spike : m.load * (0.92 + (i % 2) * 0.08);
        pts.push([x + 10, y(top)], [x + 18, y(m.load * 0.9)], [x + 30, y(m.load * 0.7)], [x + 44, y(m.load * 0.9)]);
      }
      svg.appendChild(el("polyline", { class: "wave", points: pts.map(function (p) { return p.join(","); }).join(" ") }));
      [[m.spike, "spike", "스파이크 최대 " + m.spikeLabel], [m.spike * 0.8, "mount", "Max Spike 80% · " + (m.spike * 0.8).toFixed(1) + "kW"], [m.load, "load", "100% 부하 최대 " + m.loadLabel]].forEach(function (l) {
        svg.appendChild(el("line", { class: "lv " + l[1], x1: X0, x2: X1, y1: y(l[0]), y2: y(l[0]) }));
        svg.appendChild(el("text", { class: "lv-t " + l[1], x: X1 - 4, y: y(l[0]) - 6 }, l[2]));
      });
      svg.appendChild(el("text", { class: "ax", x: 92, y: Y0 + 22 }, "대기"));
      svg.appendChild(el("text", { class: "ax", x: 420, y: Y0 + 22 }, "학습 중 (계산 · 통신 반복)"));
      calc();
    }
    function calc() {
      var m = models[cur], b = +budget.value;
      out.textContent = b + "kW";
      rows.textContent = "";
      [["100% 부하 기준", m.load], ["Max Spike 80% 기준", m.spike * 0.8], ["Max Spike 기준", m.spike]].forEach(function (r) {
        var li = document.createElement("li");
        li.innerHTML = "<span>" + r[0] + "</span><b>" + Math.floor(b / r[1]) + "대</b>";
        rows.appendChild(li);
      });
      txt.textContent = m.name + ": 같은 " + b + "kW 랙이라도 100% 부하로 계산하면 " + Math.floor(b / m.load) + "대, 스파이크로 계산하면 " + Math.floor(b / m.spike) + "대입니다. 부하 기준으로 채우면 학습 중 여러 대가 동시에 튀는 순간 한도를 넘을 수 있습니다.";
    }
    fig.querySelectorAll("[data-model]").forEach(function (b) {
      b.addEventListener("click", function () {
        cur = +b.dataset.model;
        fig.querySelectorAll("[data-model]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        draw();
      });
    });
    budget.addEventListener("input", calc);
    draw();
  });
})();
