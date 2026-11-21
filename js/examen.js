(function () {
  'use strict';

  var data = window.IK_EXAM;
  var form = document.getElementById('exam-form');
  if (!data || !form) return;

  var cfg = window.IK_CONFIG || {};
  var waNumber = String(cfg.whatsapp || '').replace(/\D/g, '');
  var ids = Object.keys(data.key);
  var countEl = document.getElementById('exam-count');
  var errorEl = document.getElementById('exam-error');
  var result = document.getElementById('exam-result');

  function answered() {
    return ids.filter(function (id) { return form.querySelector('input[name="' + id + '"]:checked'); });
  }

  function updateCount() {
    if (countEl) countEl.textContent = answered().length;
  }
  form.addEventListener('change', function (e) {
    if (e.target && e.target.type === 'radio') {
      var q = document.getElementById(e.target.name);
      if (q) q.classList.remove('is-missing');
      updateCount();
    }
  });

  function message(grade, correct, perSection, nombre, edad) {
    var lines = [
      'Examen de diagnóstico — Innovating Kids',
      'Alumno: ' + nombre + (edad ? ' (' + edad + ' años)' : ''),
      'Calificación: ' + grade + '/10 (' + correct + ' de ' + data.total + ' correctas)',
      ''
    ];
    Object.keys(perSection).forEach(function (s) {
      var p = perSection[s];
      lines.push('• ' + data.sections[s] + ': ' + p.ok + '/' + p.n);
    });
    var abierta = (document.getElementById('abierta').value || '').trim();
    if (abierta) {
      lines.push('', 'Pregunta abierta (PC gamer):', abierta.slice(0, 900));
    }
    return lines.join('\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nombreInput = document.getElementById('alumno');
    var nombre = nombreInput.value.trim();
    var edad = document.getElementById('edad').value.trim();

    var missing = ids.filter(function (id) { return !form.querySelector('input[name="' + id + '"]:checked'); });
    ids.forEach(function (id) { document.getElementById(id).classList.toggle('is-missing', missing.indexOf(id) !== -1); });

    if (nombre.length < 2) {
      errorEl.textContent = 'Escribe el nombre del alumno antes de calificar.';
      errorEl.hidden = false;
      nombreInput.setAttribute('aria-invalid', 'true');
      nombreInput.focus();
      return;
    }
    nombreInput.removeAttribute('aria-invalid');
    if (missing.length) {
      errorEl.textContent = 'Faltan ' + missing.length + (missing.length === 1 ? ' pregunta' : ' preguntas') + ' por responder (marcadas en amarillo).';
      errorEl.hidden = false;
      var first = document.getElementById(missing[0]);
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var firstInput = first.querySelector('input');
      if (firstInput) firstInput.focus({ preventScroll: true });
      return;
    }
    errorEl.hidden = true;

    var correct = 0;
    var perSection = {};
    ids.forEach(function (id) {
      var k = data.key[id];
      var q = document.getElementById(id);
      var chosen = form.querySelector('input[name="' + id + '"]:checked');
      var ok = Number(chosen.value) === k.a;
      if (!perSection[k.s]) perSection[k.s] = { ok: 0, n: 0 };
      perSection[k.s].n++;
      if (ok) { correct++; perSection[k.s].ok++; }

      q.classList.remove('is-ok', 'is-wrong');
      q.classList.add(ok ? 'is-ok' : 'is-wrong');
      q.querySelectorAll('.exam-option').forEach(function (label) {
        var input = label.querySelector('input');
        label.classList.toggle('is-answer', Number(input.value) === k.a);
        input.disabled = true;
      });
      var fb = q.querySelector('.exam-feedback');
      fb.textContent = (ok ? '¡Correcto! ' : 'Respuesta correcta: ' + k.c + '. ') + k.e;
      fb.hidden = false;
    });

    var pct = Math.round((correct / data.total) * 100);
    var grade = Math.round((correct / data.total) * 100) / 10;
    var msg;
    if (pct >= 90) msg = '¡Excelente! Dominas los temas. Está listo para retos más avanzados.';
    else if (pct >= 70) msg = 'Muy bien. Tiene buenas bases; conviene repasar los temas marcados en rojo.';
    else if (pct >= 50) msg = 'Va por buen camino. Hay que reforzar varios temas antes de avanzar.';
    else msg = 'Es un buen punto de partida: repasaremos las bases con calma.';

    document.getElementById('score-grade').textContent = grade.toFixed(1).replace('.0', '');
    document.getElementById('score-correct').textContent = correct;
    document.getElementById('score-pct').textContent = pct;
    document.getElementById('score-name').textContent = nombre;
    document.getElementById('score-msg').textContent = msg;

    var list = document.getElementById('score-sections');
    list.innerHTML = '';
    Object.keys(perSection).forEach(function (s) {
      var p = perSection[s];
      var li = document.createElement('li');
      var w = Math.round((p.ok / p.n) * 100);
      li.innerHTML = '<span class="exam-bd-name"></span><span class="exam-bd-bar" aria-hidden="true"><span style="width:' + w + '%"></span></span><span class="exam-bd-val">' + p.ok + '/' + p.n + '</span>';
      li.querySelector('.exam-bd-name').textContent = data.sections[s];
      list.appendChild(li);
    });

    var wa = document.getElementById('send-wa');
    wa.href = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(message(grade.toFixed(1).replace('.0', ''), correct, perSection, nombre, edad));

    form.querySelector('.exam-actions').hidden = true;
    nombreInput.disabled = true;
    document.getElementById('edad').disabled = true;
    result.hidden = false;
    form.parentNode.insertBefore(result, form);
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    result.focus({ preventScroll: true });
  });

  document.getElementById('print-exam').addEventListener('click', function () { window.print(); });
  document.getElementById('retry-exam').addEventListener('click', function () {
    if (!window.confirm('¿Borrar las respuestas y volver a empezar?')) return;
    window.location.reload();
  });

  updateCount();
})();
