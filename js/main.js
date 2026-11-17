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

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
