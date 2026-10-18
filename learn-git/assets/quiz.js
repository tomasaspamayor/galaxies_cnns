/* ==========================================================================
   Quiz widget — shared across lessons.
   Markup:

   <div class="quiz">
     <div class="quiz-item" data-answer="1">
       <p class="quiz-prompt"><span class="qno">Question 1</span> …</p>
       <button class="quiz-opt">Option A</button>
       <button class="quiz-opt">Option B</button>
       <button class="quiz-opt">Option C</button>
       <p class="quiz-feedback"><strong>Why:</strong> …</p>
     </div>
   </div>

   data-answer is the 0-based index of the correct option. One attempt per
   question; all options are locked after the first click and feedback shows.
   ========================================================================== */

(function () {
  "use strict";

  function initQuiz(root) {
    var items = root.querySelectorAll(".quiz-item");
    var total = items.length;
    var answered = 0;
    var correct = 0;

    var score = root.querySelector(".quiz-score");
    if (score && total) {
      score.textContent = "0 of " + total + " answered";
    }

    items.forEach(function (item) {
      var answer = parseInt(item.getAttribute("data-answer"), 10);
      var opts = Array.prototype.slice.call(item.querySelectorAll(".quiz-opt"));
      var feedback = item.querySelector(".quiz-feedback");

      opts.forEach(function (btn, i) {
        btn.addEventListener("click", function () {
          if (item.hasAttribute("data-done")) return;
          item.setAttribute("data-done", "");

          opts.forEach(function (b, j) {
            if (j === answer) b.classList.add("correct");
            else if (j === i) b.classList.add("incorrect");
            else b.classList.add("muted");
            b.setAttribute("tabindex", "-1");
          });

          if (feedback) feedback.classList.add("show");

          answered += 1;
          if (i === answer) correct += 1;
          if (score) {
            score.textContent =
              correct + " of " + total + " correct" +
              (answered < total ? " · keep going" : "");
          }
        });
      });
    });
  }

  document.querySelectorAll(".quiz").forEach(initQuiz);
})();
