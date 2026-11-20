(function () {
  'use strict';

  var cfg = window.IK_CONFIG || {};
  var number = String(cfg.whatsapp || '').replace(/\D/g, '');
  var hasNumber = number.length >= 10;

  function waUrl(text) {
    var base = 'https://wa.me/' + (hasNumber ? number : '');
    return base + '?text=' + encodeURIComponent(text);
  }

  // Enlaces de WhatsApp: toman el número de config.js
  document.querySelectorAll('.js-wa').forEach(function (a) {
    var msg = a.getAttribute('data-msg') || 'Hola, quiero información sobre Innovating Kids.';
    a.href = waUrl(msg);
    a.target = '_blank';
    a.rel = 'noopener';
  });
  document.querySelectorAll('.js-wa-label').forEach(function (el) {
    if (cfg.whatsappLabel) el.textContent = cfg.whatsappLabel;
  });

  // Menú en celular
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
      });
    });
  }

  // Si el menú no cabe en una línea, se colapsa en el botón de menú
  var header = document.querySelector('.site-header');
  var headerInner = header && header.querySelector('.header-inner');
  function fitNav() {
    if (!header || !headerInner || !menu) return;
    header.classList.remove('nav-collapsed');
    if (getComputedStyle(menu).position === 'absolute') return;
    var over = headerInner.scrollWidth > headerInner.clientWidth + 1 ||
      menu.scrollWidth > menu.clientWidth + 1;
    if (over) {
      header.classList.add('nav-collapsed');
    } else if (menu.classList.contains('is-open')) {
      menu.classList.remove('is-open');
      if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menú'); }
    }
  }
  var fitTimer;
  window.addEventListener('resize', function () {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fitNav, 100);
  });
  window.addEventListener('load', fitNav);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNav);
  fitNav();

  // Preguntas frecuentes
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.hidden = open;
    });
  });

  // Botón "Quiero probar este curso": preselecciona el curso en el formulario
  var courseSelect = document.getElementById('curso');
  document.querySelectorAll('[data-course]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (courseSelect) courseSelect.value = a.getAttribute('data-course');
    });
  });

  // Botones "Elegir modalidad": preseleccionan la modalidad en el formulario
  var modeSelect = document.getElementById('modalidad');
  document.querySelectorAll('[data-mode]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (modeSelect) modeSelect.value = a.getAttribute('data-mode');
    });
  });

  // Formulario: valida y abre WhatsApp con los datos
  var form = document.getElementById('lead-form');
  if (form) {
    var fields = form.querySelector('.js-form-fields');
    var success = document.getElementById('form-success');
    var error = document.getElementById('form-error');
    var retry = document.getElementById('wa-retry');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre = form.nombre.value.trim();
      var tel = form.whatsapp.value.replace(/\D/g, '');
      var edad = parseInt(form.edad.value, 10);

      var okNombre = nombre.length >= 2;
      var okTel = tel.length >= 10;
      var okEdad = edad >= 4 && edad <= 17;
      form.nombre.setAttribute('aria-invalid', String(!okNombre));
      form.whatsapp.setAttribute('aria-invalid', String(!okTel));
      form.edad.setAttribute('aria-invalid', String(!okEdad));

      if (!(okNombre && okTel && okEdad)) {
        error.hidden = false;
        (!okNombre ? form.nombre : !okTel ? form.whatsapp : form.edad).focus();
        return;
      }
      error.hidden = true;

      var text = 'Hola, quiero agendar una clase muestra gratis.\n' +
        'Nombre: ' + nombre + '\n' +
        'WhatsApp: ' + tel + '\n' +
        'Edad de mi hijo: ' + edad + ' años\n' +
        'Curso de interés: ' + form.curso.value + '\n' +
        'Modalidad: ' + form.modalidad.value;
      var url = waUrl(text);
      if (retry) retry.href = url;

      fields.hidden = true;
      fields.style.display = 'none';
      success.hidden = false;
      window.open(url, '_blank', 'noopener');
    });
  }

  // Video de la portada: si la persona prefiere menos movimiento, no se reproduce solo
  var introVideo = document.getElementById('intro-video');
  if (introVideo && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    introVideo.removeAttribute('autoplay');
    introVideo.pause();
  }

  // Animaciones de entrada al hacer scroll. Solo se activan si el navegador
  // soporta IntersectionObserver y la persona no pidió menos movimiento;
  // sin JS el contenido se ve normal.
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealSel = '.section-head, .benefit, .course, .mode, .step, .related-card, .mode-detail, .course-detail, .syllabus, .mascot-card, .ai-card, .lp-course, .steps-band, .faq-item, .signup-card';
    var revealEls = Array.prototype.slice.call(document.querySelectorAll(revealSel));
    if (revealEls.length) {
      document.documentElement.classList.add('js-reveal');
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('is-visible');
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
      revealEls.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
      // Red de seguridad: si algo no se marcó (p. ej. al imprimir o saltar con un ancla), se muestra todo
      setTimeout(function () {
        revealEls.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible');
        });
      }, 1200);
      window.addEventListener('beforeprint', function () {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
      });
    }
  }

  // Botón "Volver arriba" en páginas largas
  if (document.documentElement.scrollHeight > window.innerHeight * 2.5) {
    var topBtn = document.createElement('button');
    topBtn.type = 'button';
    topBtn.className = 'back-to-top';
    topBtn.setAttribute('aria-label', 'Volver arriba');
    topBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
    document.body.appendChild(topBtn);
    var onScroll = function () {
      topBtn.classList.toggle('is-shown', window.scrollY > window.innerHeight * 1.2);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var target = document.querySelector('.site-header a, a');
      if (target) target.focus({ preventScroll: true });
    });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
