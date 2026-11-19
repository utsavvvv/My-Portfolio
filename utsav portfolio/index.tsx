// @ts-nocheck
// Portfolio interactions: countdown, scroll animations, parallax, contact form.
(function () {
  // Ticking 24-hour countdown in the hero browser bar (loops back to 24:00:00).
  var cd = document.getElementById("countdown");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (cd && !reduce) {
    var left = 24 * 3600;
    setInterval(function () {
      left = left > 0 ? left - 1 : 24 * 3600;
      var h = Math.floor(left / 3600), m = Math.floor(left % 3600 / 60), s = left % 60;
      cd.textContent = [h, m, s].map(function (n) { return String(n).padStart(2, "0"); }).join(":");
    }, 1000);
  }

  // Scroll-in reveal: hide below-the-fold blocks, then fade/rise them in as they enter the screen.
  var REVEAL = ".hero-copy > *, .browser, .head, .service, .clockbar, .process li, .project > *, .plan, .note, .faq details, .portrait, .about-copy > *, .contact-info > *, #contactForm";
  if (!reduce && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-reveal");
    // Split section headings into words that slide up one after another.
    document.querySelectorAll(".head h2, .about-copy h2, .contact-info h2").forEach(function (h) {
      var text = h.textContent.trim();
      h.setAttribute("aria-label", text);
      h.textContent = "";
      text.split(/\s+/).forEach(function (word, i) {
        var outer = document.createElement("span"); outer.className = "w"; outer.setAttribute("aria-hidden", "true");
        var inner = document.createElement("span"); inner.style.setProperty("--i", i); inner.textContent = word;
        outer.appendChild(inner); h.appendChild(outer); h.appendChild(document.createTextNode(" "));
      });
    });
    var revealEls = [].slice.call(document.querySelectorAll(REVEAL));
    revealEls.forEach(function (el) {
      el.classList.add("reveal");
      var sibs = [].slice.call(el.parentElement.children).filter(function (c) { return c.matches(REVEAL); });
      el.style.setProperty("--d", (sibs.indexOf(el) % 5) * 110 + "ms");
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // Scroll effects: parallax layers, moving text band, 24h progress bar, page progress.
  var nav = document.querySelector(".nav");
  var pageBar = document.getElementById("pageProgress");
  var layers = [].slice.call(document.querySelectorAll("[data-speed]"));
  var band = document.getElementById("band");
  var rows = [].slice.call(document.querySelectorAll(".band-row"));
  var proc = document.getElementById("process");
  var fill = document.getElementById("clockFill");
  var hourLabel = document.getElementById("clockHour");
  var wideMq = window.matchMedia ? window.matchMedia("(min-width: 820px)") : null;
  var queued = false;

  function update() {
    queued = false;
    var vh = window.innerHeight, y = window.scrollY;
    var max = document.documentElement.scrollHeight - vh;
    nav.classList.toggle("scrolled", y > 8);
    pageBar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";

    if (reduce) return;
    var wide = wideMq ? wideMq.matches : true;
    layers.forEach(function (el) {
      if (el.hasAttribute("data-desktop") && !wide) { el.style.transform = ""; return; }
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -300 || r.top > vh + 300) return;
      var d = (r.top + r.height / 2) - vh / 2;
      el.style.transform = "translate3d(0," + (d * parseFloat(el.dataset.speed)).toFixed(1) + "px,0)";
    });

    var br = band.getBoundingClientRect();
    if (br.bottom > 0 && br.top < vh) {
      var p = vh - br.top;
      rows.forEach(function (row) {
        var dir = +row.dataset.dir;
        var base = dir > 0 ? -row.offsetWidth * 0.45 : -row.offsetWidth * 0.05;
        row.style.transform = "translate3d(" + (base + dir * p * 0.35).toFixed(1) + "px,0,0)";
      });
    }

    var pr = proc.getBoundingClientRect();
    var t = Math.max(0, Math.min(1, (vh * 0.85 - pr.top) / (pr.height * 0.85)));
    fill.style.transform = "scaleX(" + t.toFixed(3) + ")";
    var h = Math.round(t * 24);
    hourLabel.textContent = h >= 24 ? "hour 24 · live" : "hour " + String(h).padStart(2, "0");
  }
  function onScroll() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();

  function copy(text, btn, done) {
    var original = btn.textContent;
    function ok() { btn.textContent = done; setTimeout(function () { btn.textContent = original; }, 1800); }
    try {
      navigator.clipboard.writeText(text).then(ok, function () { btn.textContent = "Select and copy"; });
    } catch (e) { btn.textContent = "Select and copy"; }
  }
  document.getElementById("copyEmail").addEventListener("click", function () {
    copy(document.getElementById("email").textContent, this, "Copied");
  });

  // ---- Contact settings: fill these in to turn on automatic sending and WhatsApp ----
  var CONTACT = {
    web3formsKey: "",   // access key from web3forms.com (sends form messages to your Gmail)
    whatsapp: ""        // your WhatsApp number with country code, digits only, e.g. "919876543210"
  };

  var waLink = function (text) { return "https://wa.me/" + CONTACT.whatsapp + "?text=" + encodeURIComponent(text); };
  if (CONTACT.whatsapp) {
    var waBtn = document.getElementById("waBtn");
    waBtn.href = waLink("Hi Utsav, I'd like to get a website made in 24 hours.");
    waBtn.hidden = false;
  }

  var form = document.getElementById("contactForm");
  var field = function (id) { return document.getElementById(id); };
  var statusEl = field("sendStatus"), sendBtn = field("sendBtn");
  function setStatus(text, cls) { statusEl.textContent = text; statusEl.className = "send-status" + (cls ? " " + cls : ""); }
  function showDraft(text, note) {
    field("draft").textContent = text;
    field("resultNote").textContent = note;
    var wa = field("waDraft");
    if (CONTACT.whatsapp) { wa.href = waLink(text); wa.hidden = false; }
    field("result").hidden = false;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = field("name").value.trim(), reply = field("reply").value.trim(), msg = field("msg").value.trim();
    var biz = field("biz").value.trim(), need = field("type").value;
    if (!name) { setStatus("Please add your name.", "err"); field("name").focus(); return; }
    if (!reply) { setStatus("Please add your email or WhatsApp number so I can reply.", "err"); field("reply").focus(); return; }
    if (!msg) { setStatus("Please tell me a little about your project.", "err"); field("msg").focus(); return; }
    var text = "Hi Utsav,\n\nI'm " + name + (biz ? " from " + biz : "") + ". I'm looking for: " +
      need.toLowerCase() + ".\n\n" + msg + "\n\nYou can reach me at: " + reply + "\n\nThanks,\n" + name;
    field("result").hidden = true;

    if (!CONTACT.web3formsKey) {
      setStatus("");
      showDraft(text, "Copy this and send it to the email address on the left" + (CONTACT.whatsapp ? ", or send it on WhatsApp." : "."));
      return;
    }

    sendBtn.disabled = true; sendBtn.textContent = "Sending…"; setStatus("");
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        access_key: CONTACT.web3formsKey,
        subject: "New 24-hour website request from " + name,
        from_name: "Portfolio website",
        name: name, contact: reply, business: biz, need: need, message: msg,
        botcheck: field("botcheck").checked
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.success) throw new Error(d.message || "Not sent");
        form.reset();
        setStatus("Sent! Thanks, " + name + ". I'll reply within a few hours.", "ok");
      })
      .catch(function () {
        setStatus("Your message couldn't be sent automatically.", "err");
        showDraft(text, "Copy it and email it to me instead" + (CONTACT.whatsapp ? ", or send it on WhatsApp." : "."));
      })
      .then(function () { sendBtn.disabled = false; sendBtn.textContent = "Send my 24-hour request"; });
  });
  document.getElementById("copyDraft").addEventListener("click", function () {
    copy(document.getElementById("draft").textContent, this, "Copied");
  });
})();
