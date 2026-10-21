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
