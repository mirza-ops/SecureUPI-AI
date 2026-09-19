/* =========================================================
   PREMIUM INTERACTION EFFECTS
   ========================================================= */

(function () {

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) return;

  /* Cursor-following ambient light */
  let cursorFrame = null;

  document.addEventListener("pointermove", function (e) {

    if (cursorFrame) return;

    cursorFrame = requestAnimationFrame(function () {

      document.documentElement.style.setProperty(
        "--cursor-x",
        e.clientX + "px"
      );

      document.documentElement.style.setProperty(
        "--cursor-y",
        e.clientY + "px"
      );

      cursorFrame = null;

    });

  }, { passive: true });


  /* 3D project card tilt */
  const cards = document.querySelectorAll(".tile");

  const canTilt =
    window.matchMedia &&
    window.matchMedia("(min-width: 851px)").matches;

  if (canTilt) {

    cards.forEach(function (card) {

      card.addEventListener("pointermove", function (e) {

        const rect = card.getBoundingClientRect();

        const x =
          (e.clientX - rect.left) / rect.width;

        const y =
          (e.clientY - rect.top) / rect.height;

        const rotateX = (0.5 - y) * 5;
        const rotateY = (x - 0.5) * 5;

        card.style.setProperty(
          "--mx",
          (x * 100) + "%"
        );

        card.style.setProperty(
          "--my",
          (y * 100) + "%"
        );

        card.style.setProperty(
          "--tilt-x",
          rotateX.toFixed(2) + "deg"
        );

        card.style.setProperty(
          "--tilt-y",
          rotateY.toFixed(2) + "deg"
        );

        card.classList.add("tilt-active");

      }, { passive: true });


      card.addEventListener("pointerleave", function () {

        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
        card.style.setProperty("--mx", "50%");
        card.style.setProperty("--my", "50%");

        card.classList.remove("tilt-active");

      });

    });

  }


  /* Keyboard support for upload area */
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");

  if (dropZone && fileInput) {

    dropZone.setAttribute("tabindex", "0");
    dropZone.setAttribute("role", "button");

    dropZone.addEventListener("keydown", function (e) {

      if (e.key === "Enter" || e.key === " ") {

        e.preventDefault();

        fileInput.click();

      }

    });

  }

})();
