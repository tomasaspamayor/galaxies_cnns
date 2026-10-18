/* ==========================================================================
   gitgraph.js — reusable interactive commit-graph simulator.
   Teaches what branches *are* by letting learners run git commands and watch
   the graph change. Supports the subset of commands a beginner lesson needs:
   commit, switch -c, switch, merge (fast-forward + three-way), branch -d.

   Markup contract (see lessons/0002-*.html):

   <div class="gitgraph" data-gitgraph>
     <div class="gg-controls">
       <input data-msg placeholder="commit message">
       <button data-act="commit">git commit</button>
       <input data-name value="experiment">
       <button data-act="branch">git switch -c</button>
       <select data-switch></select>
       <button data-act="switch">git switch</button>
       <select data-merge></select>
       <button data-act="merge">git merge</button>
       <select data-delete></select>
       <button data-act="delete">git branch -d</button>
       <button data-act="reset" class="gg-reset">reset</button>
     </div>
     <svg width="560" height="220" role="img" aria-label="commit graph"></svg>
     <p class="gg-status" data-status></p>
     <pre class="gg-log" data-log></pre>
   </div>
   ========================================================================== */

(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var LANE_COLORS = ["#33557f", "#2f6b4f", "#9a6a1a", "#8a3324", "#5b4b8a", "#1f7a8c"];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
    return e;
  }
  function textEl(x, y, str, fill, size, weight) {
    var t = el("text", { x: x, y: y, fill: fill, "font-size": size, "font-weight": weight, "text-anchor": "middle" });
    t.textContent = str;
    return t;
  }
  function laneColor(lane) { return LANE_COLORS[lane % LANE_COLORS.length]; }
  function shortMsg(m) { return m.length > 13 ? m.slice(0, 12) + "\u2026" : m; }

  function GitGraph(root) {
    this.root = root;
    this.svg = root.querySelector("svg");
    this.log = root.querySelector("[data-log]");
    this.status = root.querySelector("[data-status]");
    this.logLines = [];
    this.reset();
    this.bindControls();
    this.render();
  }

  GitGraph.prototype.reset = function () {
    this.laneCount = 0;
    this.nextId = 0;
    this.commits = {};
    this.order = [];
    this.branches = {};
    this.branchLane = {};
    this.head = "main";
    this.logLines = [];
    this.branchLane["main"] = 0;
    var c0 = this.makeCommit("load data", 0, []);
    var c1 = this.makeCommit("clean data", 0, [c0]);
    this.branches["main"] = c1;
  };

  GitGraph.prototype.makeCommit = function (msg, lane, parents) {
    var id = "C" + this.nextId++;
    this.commits[id] = { id: id, msg: msg, lane: lane, parents: parents.slice(), x: this.order.length };
    this.order.push(id);
    return id;
  };

  GitGraph.prototype.tip = function () { return this.branches[this.head]; };

  GitGraph.prototype.pushLog = function (line) {
    this.logLines.unshift(line);
    if (this.logLines.length > 40) this.logLines.pop();
  };

  GitGraph.prototype.commit = function (msg) {
    var lane = this.branchLane[this.head];
    var parent = this.branches[this.head];
    var id = this.makeCommit(msg, lane, parent ? [parent] : []);
    this.branches[this.head] = id;
    this.pushLog('git commit -m "' + msg + '"');
  };

  GitGraph.prototype.createBranch = function (name) {
    if (!name) return;
    if (this.branches[name]) { this.pushLog('branch "' + name + '" already exists'); return; }
    this.laneCount += 1;
    this.branchLane[name] = this.laneCount;
    this.branches[name] = this.branches[this.head];
    this.head = name;
    this.pushLog("git switch -c " + name);
  };

  GitGraph.prototype.switchBranch = function (name) {
    if (!this.branches[name]) return;
    this.head = name;
    this.pushLog("git switch " + name);
  };

  GitGraph.prototype.isAncestor = function (a, b) {
    if (a === b) return true;
    var stack = [b], seen = {};
    while (stack.length) {
      var id = stack.pop();
      if (seen[id]) continue;
      seen[id] = true;
      var c = this.commits[id];
      if (!c) continue;
      for (var i = 0; i < c.parents.length; i++) {
        if (c.parents[i] === a) return true;
        stack.push(c.parents[i]);
      }
    }
    return false;
  };

  GitGraph.prototype.merge = function (name) {
    var target = this.branches[name];
    if (!target || name === this.head) return;
    var headTip = this.branches[this.head];
    if (headTip === target) { this.pushLog("Already up to date."); return; }
    if (this.isAncestor(headTip, target)) {
      this.branches[this.head] = target;
      this.pushLog("git merge " + name + "   \u2190 fast-forward");
    } else if (this.isAncestor(target, headTip)) {
      this.pushLog("Already up to date.");
    } else {
      var lane = this.branchLane[this.head];
      var id = this.makeCommit("merge " + name, lane, [headTip, target]);
      this.branches[this.head] = id;
      this.pushLog("git merge " + name + "   \u2190 merge commit (two parents)");
    }
  };

  GitGraph.prototype.deleteBranch = function (name) {
    if (!name || name === this.head || !this.branches[name]) return;
    delete this.branches[name];
    this.pushLog("git branch -d " + name);
  };

  GitGraph.prototype.render = function () {
    var self = this;
    var svg = this.svg;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute("font-family", "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif");

    var padX = 54, padY = 70, dx = 86, dy = 96;
    var pos = {};
    this.order.forEach(function (id) {
      var c = self.commits[id];
      pos[id] = { x: padX + c.x * dx, y: padY + c.lane * dy };
    });
    var maxX = Math.max(0, this.order.length - 1);
    var maxLane = Math.max(0, this.laneCount);
    var W = padX * 2 + maxX * dx + 60;
    var H = padY * 2 + maxLane * dy;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);

    this.order.forEach(function (id) {
      var c = self.commits[id], a = pos[id];
      c.parents.forEach(function (pid) {
        var b = pos[pid]; if (!b) return;
        svg.appendChild(el("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: "#cfc7b6", "stroke-width": "2" }));
      });
    });

    this.order.forEach(function (id) {
      var c = self.commits[id], p = pos[id];
      svg.appendChild(el("circle", { cx: p.x, cy: p.y, r: "16", fill: laneColor(c.lane), stroke: "#fff", "stroke-width": "2.5" }));
      svg.appendChild(textEl(p.x, p.y + 4, c.id, "#fff", "11", "700"));
      svg.appendChild(textEl(p.x, p.y + 32, shortMsg(c.msg), "#8a8378", "10", "400"));
    });

    var byTip = {};
    Object.keys(this.branches).forEach(function (name) {
      var tip = self.branches[name];
      (byTip[tip] = byTip[tip] || []).push(name);
    });
    Object.keys(byTip).forEach(function (tip) {
      var p = pos[tip];
      byTip[tip].forEach(function (name, k) {
        var isHead = name === self.head;
        var label = (isHead ? "HEAD \u2192 " : "") + name;
        var w = label.length * 6.6 + 18;
        var y = p.y - 30 - k * 22;
        svg.appendChild(el("rect", { x: p.x - w / 2, y: y - 11, width: w, height: 22, rx: 11,
          fill: isHead ? "#8a3324" : laneColor(self.branchLane[name]), opacity: isHead ? "1" : "0.85" }));
        svg.appendChild(textEl(p.x, y + 4, label, "#fff", "10.5", "600"));
      });
    });

    var headTip = this.branches[this.head];
    if (headTip && pos[headTip]) {
      svg.appendChild(el("circle", { cx: pos[headTip].x, cy: pos[headTip].y, r: "21", fill: "none",
        stroke: "#8a3324", "stroke-width": "2", "stroke-dasharray": "4 3" }));
    }

    if (this.status) this.status.textContent = "On branch " + this.head;
    if (this.log) this.log.textContent = this.logLines.join("\n");
    this.updateSelects();
  };

  GitGraph.prototype.updateSelects = function () {
    var self = this;
    var names = Object.keys(this.branches);
    fillSelect(this.root.querySelector("[data-switch]"), names, this.head);
    fillSelect(this.root.querySelector("[data-merge]"), names.filter(function (n) { return n !== self.head; }), null);
    fillSelect(this.root.querySelector("[data-delete]"), names.filter(function (n) { return n !== self.head; }), null);
  };

  function fillSelect(sel, names, current) {
    if (!sel) return;
    var prev = sel.value;
    sel.innerHTML = "";
    names.forEach(function (n) {
      var o = document.createElement("option");
      o.value = n; o.textContent = n;
      sel.appendChild(o);
    });
    if (names.indexOf(prev) >= 0) sel.value = prev;
    else if (current && names.indexOf(current) >= 0) sel.value = current;
  }

  GitGraph.prototype.bindControls = function () {
    var self = this;
    this.root.querySelectorAll("[data-act]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var act = btn.getAttribute("data-act");
        if (act === "commit") {
          var input = self.root.querySelector("[data-msg]");
          var msg = (input && input.value.trim()) || "change";
          self.commit(msg);
          if (input) input.value = "";
        } else if (act === "branch") {
          var n = self.root.querySelector("[data-name]");
          self.createBranch(n ? n.value.trim() : "");
        } else if (act === "switch") {
          var s = self.root.querySelector("[data-switch]");
          if (s) self.switchBranch(s.value);
        } else if (act === "merge") {
          var m = self.root.querySelector("[data-merge]");
          if (m) self.merge(m.value);
        } else if (act === "delete") {
          var d = self.root.querySelector("[data-delete]");
          if (d) self.deleteBranch(d.value);
        } else if (act === "reset") {
          self.reset();
          self.pushLog("\u2014 reset \u2014");
        }
        self.render();
      });
    });
  };

  document.querySelectorAll("[data-gitgraph]").forEach(function (root) { new GitGraph(root); });
})();
