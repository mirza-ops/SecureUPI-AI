(function () {
  "use strict";

  /* =========================
     THEME TOGGLE
     ========================= */

  const body = document.body;
  const themeButtons = document.querySelectorAll("[data-theme-toggle]");

  function applyTheme(theme) {
    body.classList.toggle("light-mode", theme === "light");

    themeButtons.forEach(function (button) {
      button.textContent = theme === "light" ? "🌙" : "☀️";
    });
  }

  const savedTheme =
    localStorage.getItem("secureupi-theme") || "dark";

  applyTheme(savedTheme);

  themeButtons.forEach(function (button) {
    button.addEventListener("click", function () {

      const nextTheme =
        body.classList.contains("light-mode")
          ? "dark"
          : "light";

      localStorage.setItem("secureupi-theme", nextTheme);

      applyTheme(nextTheme);
    });
  });


  /* =========================
     TRANSACTION ANALYSIS
     ========================= */

  const fraudForm = document.getElementById("fraudForm");
  const loading = document.getElementById("loading");

  if (fraudForm) {

    fraudForm.addEventListener("submit", function () {

      if (loading) {
        loading.classList.add("show");
      }

      const button =
        fraudForm.querySelector(".analyze-btn");

      if (button) {

        button.disabled = true;
        button.classList.add("is-loading");

        const label =
          button.querySelector("span");

        if (label) {
          label.textContent = "Analyzing...";
        }
      }

    });
  }


  /* =========================
     FRAUD PROBABILITY COUNTER
     ========================= */

  const counter =
    document.getElementById("counter");

  const progress =
    document.getElementById("progressFill");

  if (counter && progress) {

    const target = Math.max(
      0,
      Math.min(
        100,
        Number(counter.dataset.target || 0)
      )
    );

    const start = performance.now();
    const duration = 1200;

    function animateCounter(now) {

      const progressTime =
        Math.min(
          (now - start) / duration,
          1
        );

      const easing =
        1 - Math.pow(1 - progressTime, 3);

      const current =
        target * easing;

      counter.textContent =
        current.toFixed(1);

      progress.style.width =
        current + "%";

      if (progressTime < 1) {
        requestAnimationFrame(animateCounter);
      }
    }

    requestAnimationFrame(animateCounter);
  }


  /* =========================
     3D CARD TILT
     ========================= */

  const cards =
    document.querySelectorAll(".tile");

  const canTilt =
    window.matchMedia &&
    window.matchMedia("(min-width: 851px)").matches;

  if (canTilt) {

    cards.forEach(function (card) {

      card.addEventListener(
        "pointermove",
        function (event) {

          const rect =
            card.getBoundingClientRect();

          const x =
            (event.clientX - rect.left) /
            rect.width;

          const y =
            (event.clientY - rect.top) /
            rect.height;

          const rotateX =
            (0.5 - y) * 5;

          const rotateY =
            (x - 0.5) * 5;

          card.style.setProperty(
            "--mx",
            x * 100 + "%"
          );

          card.style.setProperty(
            "--my",
            y * 100 + "%"
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

        },
        { passive: true }
      );


      card.addEventListener(
        "pointerleave",
        function () {

          card.style.setProperty(
            "--mx",
            "50%"
          );

          card.style.setProperty(
            "--my",
            "50%"
          );

          card.style.setProperty(
            "--tilt-x",
            "0deg"
          );

          card.style.setProperty(
            "--tilt-y",
            "0deg"
          );

          card.classList.remove(
            "tilt-active"
          );

        }
      );

    });
  }


  /* =========================
     CURSOR GLOW
     ========================= */

  document.addEventListener(
    "pointermove",
    function (event) {

      document.documentElement.style.setProperty(
        "--cursor-x",
        event.clientX + "px"
      );

      document.documentElement.style.setProperty(
        "--cursor-y",
        event.clientY + "px"
      );

    },
    { passive: true }
  );


  /* =========================
     BULK UPLOAD UI
     ========================= */

  const dropZone =
    document.getElementById("dropZone");

  const fileInput =
    document.getElementById("fileInput");

  const fileName =
    document.getElementById("fileName");

  const bulkForm =
    document.getElementById("bulkForm");


  if (dropZone && fileInput) {

    dropZone.addEventListener(
      "click",
      function () {
        fileInput.click();
      }
    );


    fileInput.addEventListener(
      "change",
      function () {

        if (
          fileInput.files.length &&
          fileName
        ) {

          fileName.textContent =
            "Selected: " +
            fileInput.files[0].name;

          dropZone.classList.add(
            "has-file"
          );
        }

      }
    );


    dropZone.addEventListener(
      "dragover",
      function (event) {

        event.preventDefault();

        dropZone.classList.add(
          "dragover"
        );

      }
    );


    dropZone.addEventListener(
      "dragleave",
      function () {

        dropZone.classList.remove(
          "dragover"
        );

      }
    );


    dropZone.addEventListener(
      "drop",
      function (event) {

        event.preventDefault();

        dropZone.classList.remove(
          "dragover"
        );

        if (event.dataTransfer.files.length) {

          fileInput.files =
            event.dataTransfer.files;

          fileInput.dispatchEvent(
            new Event("change")
          );
        }

      }
    );
  }


  /* =========================
     BULK FORM BUTTON
     ========================= */

  if (bulkForm) {

    bulkForm.addEventListener(
      "submit",
      function () {

        const button =
          bulkForm.querySelector(
            ".analyze-btn"
          );

        if (button) {

          button.disabled = true;

          button.classList.add(
            "is-loading"
          );

          const label =
            button.querySelector("span");

          if (label) {
            label.textContent =
              "Scanning dataset...";
          }
        }

      }
    );
  }


  /* =========================
     ACCESSIBILITY
     ========================= */

  if (dropZone && fileInput) {

    dropZone.setAttribute(
      "tabindex",
      "0"
    );

    dropZone.setAttribute(
      "role",
      "button"
    );

    dropZone.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {

          event.preventDefault();

          fileInput.click();
        }

      }
    );
  }

})();
