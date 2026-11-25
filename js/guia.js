// Guía del alumno: guia.html?curso=python muestra los módulos del curso; sin curso, la lista de guías.
import { CONTENIDO } from './contenido-cursos.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const id = new URLSearchParams(location.search).get('curso') || '';
const curso = CONTENIDO.find((c) => c.id === id);

if (!curso) {
  $('g-cuerpo').innerHTML = '<div class="portal-grid">' + CONTENIDO.map((c) =>
    '<a class="portal-card guia-curso" href="guia.html?curso=' + esc(c.id) + '">' +
    '<h2 class="guia-curso-t">' + esc(c.nombre) + '</h2>' +
    '<p class="portal-muted">' + esc(c.descripcion) + '</p>' +
    '<p class="guia-curso-m">' + c.modulos.length + ' módulos · ' + esc(c.edad) + '</p>' +
    '<span class="btn btn-yellow">Ver guía</span></a>').join('') + '</div>';
} else {
  document.title = 'Guía: ' + curso.nombre + ' | Innovating Kids';
  $('g-miga').textContent = curso.nombre;
  $('g-titulo').textContent = 'Guía de ' + curso.nombre;
  $('g-lead').textContent = curso.descripcion;
  const datos = $('g-datos');
  datos.innerHTML = '<li><strong>' + curso.modulos.length + '</strong> módulos</li><li>Edad: <strong>' + esc(curso.edad) + '</strong></li><li>Proyecto final: <strong>' + esc(curso.proyecto) + '</strong></li>';
  datos.hidden = false;
  $('g-cuerpo').innerHTML =
    '<nav class="guia-indice" aria-label="Módulos del curso"><ol>' +
      curso.modulos.map((m, i) => '<li><a href="#m' + (i + 1) + '">' + esc(m.titulo) + '</a></li>').join('') +
    '</ol></nav>' +
    '<ol class="guia-modulos">' + curso.modulos.map((m, i) =>
      '<li class="portal-card guia-mod" id="m' + (i + 1) + '">' +
        '<p class="guia-num">Módulo ' + (i + 1) + ' de ' + curso.modulos.length + '</p>' +
        '<h2 class="guia-mod-t">' + esc(m.titulo) + '</h2>' +
        '<p class="guia-obj"><strong>Vas a aprender:</strong> ' + esc(m.objetivo) + '</p>' +
        '<div class="guia-cols">' +
          '<div><h3>Temas</h3><ul>' + m.temas.map((t) => '<li>' + esc(t) + '</li>').join('') + '</ul></div>' +
          '<div class="guia-act"><h3>Actividad</h3><p>' + esc(m.actividad) + '</p></div>' +
          '<div class="guia-reto"><h3>Reto</h3><p>' + esc(m.reto) + '</p></div>' +
        '</div>' +
      '</li>').join('') + '</ol>' +
    '<p class="guia-pie"><a class="btn btn-outline" href="guia.html">Ver todas las guías</a> <a class="btn btn-teal" href="alumnos.html">Volver a mi portal</a></p>';
}
