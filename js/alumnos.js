// Portal de alumnos (alumnos.html). Lee de Firestore:
//   alumnos/{uid}                      → nombre, cursos[], activo
//   cursos/{cursoId}                   → nombre, modulos[{id, titulo}]
//   cursos/{cursoId}/privado/materiales → items[{titulo, url}]
//   alumnos/{uid}/avance/{cursoId}     → completados[], calificaciones{}, constanciaUrl
import {
  listo, entrar, salir, alCambiarSesion, recuperar, leer, mensajeError, esc, urlSegura, esCorreoReal
} from './portal-fb.js';

// Rutas de aprendizaje (juegos). total = número de niveles de cada juego.
const NIVELES = [
  { id: 'hardware', titulo: 'Computación básica: hardware', texto: 'Partes de la computadora, arma una PC y 3 sesiones de 45 min: puertos, seguridad y archivos.', url: 'juego-hardware.html', total: 9, sprite: 'perro' },
  { id: 'dinosaurios', titulo: 'Vivir con dinosaurios', texto: 'Clase de 45 min: 9 misiones con bloques y código, con Profe Rex como tutor.', url: 'dinosaurios.html', total: 9, sprite: 'dino' },
  { id: 'navidad', titulo: 'Aventura de Navidad', texto: 'Guía al elfo con bloques: recoge regalos y llega al trineo. Para 6 a 10 años.', url: 'navidad.html', total: 8, sprite: 'elfo' },
  { id: 'cubos', titulo: 'Mundo de Cubos (3D)', texto: 'Da instrucciones a Cubi para construir puentes y escaleras de cubos. Para 6 a 12 años, unos 20 minutos.', url: 'juego-cubos.html', total: 8, sprite: 'gato' },
  { id: 'aleteo', titulo: 'Crea tu videojuego: Astro Salto', texto: 'Programa en JavaScript, paso a paso, un juego de aleteo con gravedad, saltos, choques y puntos.', url: 'tutorial-astro-salto.html', total: 11, sprite: 'ninja' },
  { id: 'bloques', titulo: 'Programación con bloques', texto: '7 capítulos, con 3 sesiones de 45 min: trucos (funciones), patrullas y expedición final.', url: 'programacion-con-bloques.html', total: 51, sprite: 'pirata' }
];

window.IK_PORTAL_OK = true;
const $ = (id) => document.getElementById(id);
const vistas = ['v-cargando', 'v-inactivo', 'v-login', 'v-sin-acceso', 'v-portal'];
function mostrar(id) {
  vistas.forEach((v) => { $(v).hidden = v !== id; });
  $('btn-salir').hidden = !(id === 'v-portal' || id === 'v-sin-acceso');
  $('btn-sitio').hidden = id === 'v-portal';
}
function waLink(msg) {
  const n = (window.IK_CONFIG && window.IK_CONFIG.whatsapp) || '';
  return 'https://wa.me/' + n + '?text=' + encodeURIComponent(msg);
}

if (!listo) {
  mostrar('v-inactivo');
} else {
  mostrar('v-cargando');
  alCambiarSesion(async (user) => {
    if (!user) { mostrar('v-login'); return; }
    try {
      const alumno = await leer('alumnos/' + user.uid);
      if (!alumno || alumno.activo === false) { await sinAcceso(user, alumno); return; }
      await pintarPortal(user.uid, alumno);
      mostrar('v-portal');
    } catch (e) {
      console.error(e);
      await sinAcceso(user, null, e);
    }
  });
}

// Explica por qué no entra: maestro en la página de alumnos, cuenta sin alta, desactivada o error.
async function sinAcceso(user, alumno, error) {
  $('sa-admin').hidden = true; $('sa-wa').hidden = false; $('sa-detalle').hidden = true;
  let admin = null;
  try { admin = await leer('admins/' + user.uid); } catch (e) { /* sin permiso */ }
  if (admin) {
    $('sa-titulo').textContent = 'Esta es tu cuenta de maestro';
    $('sa-msg').textContent = 'Los alumnos entran aquí. Para dar de alta alumnos, asignar cursos y ver su avance, entra al panel del maestro.';
    $('sa-admin').hidden = false; $('sa-wa').hidden = true;
  } else if (alumno && alumno.activo === false) {
    $('sa-titulo').textContent = 'Tu cuenta está desactivada';
    $('sa-msg').textContent = alumno.reemplazadaPor ? 'Tu maestro te dio un usuario nuevo. Entra con ese usuario.' : 'Pide a tu maestro que la active.';
  } else if (error) {
    $('sa-titulo').textContent = 'No pudimos abrir tu portal';
    $('sa-msg').textContent = mensajeError(error);
    $('sa-detalle').textContent = 'Código: ' + (error.code || 'desconocido');
    $('sa-detalle').hidden = false;
  } else {
    $('sa-titulo').textContent = 'Tu cuenta no tiene acceso';
    $('sa-msg').textContent = 'Esta cuenta (' + (user.email || '') + ') no está dada de alta como alumno. Las cuentas de alumno se crean desde el panel del maestro.';
  }
  mostrar('v-sin-acceso');
}

// ---------- Inicio de sesión ----------
const fLogin = $('f-login');
fLogin.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const u = $('l-usuario'), p = $('l-pass'), err = $('l-error'), btn = $('l-btn');
  err.hidden = true;
  u.removeAttribute('aria-invalid'); p.removeAttribute('aria-invalid');
  if (!u.value.trim()) { u.setAttribute('aria-invalid', 'true'); err.textContent = 'Escribe tu usuario o correo.'; err.hidden = false; u.focus(); return; }
  if (!p.value) { p.setAttribute('aria-invalid', 'true'); err.textContent = 'Escribe tu contraseña.'; err.hidden = false; p.focus(); return; }
  btn.disabled = true; btn.textContent = 'Entrando…';
  try {
    await entrar(u.value, p.value);
    p.value = '';
  } catch (e) {
    err.textContent = mensajeError(e); err.hidden = false;
  } finally {
    btn.disabled = false; btn.textContent = 'Entrar';
  }
});

document.querySelectorAll('.pass-toggle').forEach((b) => {
  b.addEventListener('click', () => {
    const input = $(b.getAttribute('aria-controls'));
    const ver = input.type === 'password';
    input.type = ver ? 'text' : 'password';
    b.textContent = ver ? 'Ocultar' : 'Mostrar';
    b.setAttribute('aria-pressed', String(ver));
  });
});

$('l-olvide').addEventListener('click', async () => {
  const v = $('l-usuario').value.trim().toLowerCase();
  const msg = $('l-olvide-msg');
  msg.hidden = false;
  if (v.includes('@') && esCorreoReal(v)) {
    try {
      await recuperar(v);
      msg.textContent = 'Si ese correo tiene una cuenta, te enviamos un enlace para crear una contraseña nueva. Revisa también la carpeta de spam.';
    } catch (e) {
      msg.textContent = mensajeError(e);
    }
  } else {
    msg.innerHTML = 'Si entras con usuario, tu maestro te puede dar una contraseña nueva. <a href="' +
      esc(waLink('Hola, olvidé mi contraseña del portal de alumnos de Innovating Kids. Mi usuario es: ' + v)) +
      '" target="_blank" rel="noopener">Pídela por WhatsApp</a>. Si entras con correo, escríbelo arriba y vuelve a tocar «¿Olvidaste tu contraseña?».';
  }
});

$('btn-salir').addEventListener('click', async () => {
  await salir();
  $('p-cursos').innerHTML = $('p-materiales').innerHTML = $('p-calificaciones').innerHTML = '';
  window.scrollTo(0, 0);
});

// ---------- Portal ----------
async function pintarPortal(uid, alumno) {
  pintarNiveles(uid);
  const nombre = (alumno.nombre || '').trim().split(/\s+/)[0] || '';
  $('p-hola').textContent = nombre ? '¡Hola, ' + nombre + '!' : '¡Hola!';
  const ids = Array.isArray(alumno.cursos) ? alumno.cursos : [];

  const datos = await Promise.all(ids.map(async (id) => {
    const [curso, avance, materiales] = await Promise.all([
      leer('cursos/' + id).catch(() => null),
      leer('alumnos/' + uid + '/avance/' + id).catch(() => null),
      leer('cursos/' + id + '/privado/materiales').catch(() => null)
    ]);
    return { id, curso: curso || { nombre: id, modulos: [] }, avance: avance || {}, materiales: (materiales && materiales.items) || [] };
  }));

  $('p-resumen').textContent = datos.length
    ? (datos.length === 1 ? 'Estás inscrito en 1 curso.' : 'Estás inscrito en ' + datos.length + ' cursos.') + ' Aquí ves tu avance, tus materiales y tus calificaciones.'
    : 'Todavía no tienes cursos asignados. Tu maestro los agregará pronto.';

  $('p-cursos').innerHTML = datos.length ? datos.map(tarjetaCurso).join('') : vacio('Aún no tienes cursos asignados.');
  $('p-materiales').innerHTML = datos.length ? datos.map(tarjetaMateriales).join('') : vacio('Los materiales aparecerán cuando tengas un curso.');
  $('p-calificaciones').innerHTML = datos.length ? datos.map(bloqueCalificaciones).join('') : vacio('Tus calificaciones aparecerán aquí.');
}

async function pintarNiveles(uid) {
  const box = $('p-niveles');
  const datos = await Promise.all(NIVELES.map((n) => leer('alumnos/' + uid + '/juegos/' + n.id).catch(() => null)));
  box.innerHTML = '';
  NIVELES.forEach((n, i) => {
    const niv = (datos[i] && datos[i].niveles) || {};
    const total = (datos[i] && datos[i].total) || n.total;
    const hechos = Object.keys(niv).filter((k) => +niv[k] > 0).length;
    const estrellas = Object.keys(niv).reduce((a, k) => a + (+niv[k] || 0), 0);
    const pct = Math.min(100, Math.round((hechos / total) * 100));
    const a = document.createElement('a');
    a.className = 'portal-card portal-nivel';
    a.href = n.url;
    a.innerHTML = '<div class="portal-nivel-head"><span class="portal-nivel-sprite"></span><div><h3>' + esc(n.titulo) + '</h3><p class="portal-muted">' + esc(n.texto) + '</p></div></div>' +
      '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="Avance en ' + esc(n.titulo) + '"><span style="width:' + pct + '%"></span></div>' +
      '<p class="progress-label"><strong>' + hechos + ' de ' + total + '</strong> niveles · <span class="portal-star" aria-hidden="true">★</span> ' + estrellas + ' estrellas</p>' +
      '<span class="btn btn-yellow portal-nivel-btn">' + (hechos ? (hechos >= total ? 'Jugar otra vez' : 'Continuar') : 'Empezar') + '</span>';
    if (window.IKSprites) a.querySelector('.portal-nivel-sprite').appendChild(window.IKSprites.canvasOf(n.sprite, 64));
    box.appendChild(a);
  });
}

function vacio(t) { return '<p class="portal-empty">' + esc(t) + '</p>'; }

function modulosDe(curso) { return Array.isArray(curso.modulos) ? curso.modulos : []; }

function tarjetaCurso(d) {
  const mods = modulosDe(d.curso);
  const hechos = new Set(d.avance.completados || []);
  const n = mods.filter((m) => hechos.has(m.id)).length;
  const pct = mods.length ? Math.round((n / mods.length) * 100) : 0;
  const lista = mods.length
    ? '<ol class="portal-mods">' + mods.map((m) => {
        const ok = hechos.has(m.id);
        return '<li class="' + (ok ? 'is-done' : '') + '"><span class="mod-dot" aria-hidden="true">' + (ok ? '✓' : '') + '</span>' +
          esc(m.titulo) + '<span class="sr-only">' + (ok ? ' (completado)' : ' (pendiente)') + '</span></li>';
      }).join('') + '</ol>'
    : '<p class="portal-muted">Tu maestro todavía no agrega los módulos de este curso.</p>';
  return '<article class="portal-card portal-course">' +
    '<h3>' + esc(d.curso.nombre || d.id) + '</h3>' +
    (mods.length ? '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="Avance en ' + esc(d.curso.nombre || d.id) + '"><span style="width:' + pct + '%"></span></div>' +
      '<p class="progress-label"><strong>' + pct + '%</strong> · ' + n + ' de ' + mods.length + ' módulos completados</p>' : '') +
    lista + '</article>';
}

function tarjetaMateriales(d) {
  const items = d.materiales.map((m) => ({ titulo: m.titulo, url: urlSegura(m.url) })).filter((m) => m.url);
  return '<article class="portal-card">' +
    '<h3>' + esc(d.curso.nombre || d.id) + '</h3>' +
    (items.length
      ? '<ul class="portal-links">' + items.map((m) =>
          '<li><a href="' + esc(m.url) + '" target="_blank" rel="noopener">' + esc(m.titulo || 'Material') + '<span class="sr-only"> (se abre en otra pestaña)</span></a></li>').join('') + '</ul>'
      : '<p class="portal-muted">Todavía no hay materiales para este curso.</p>') +
    '</article>';
}

function bloqueCalificaciones(d) {
  const mods = modulosDe(d.curso);
  const cal = d.avance.calificaciones || {};
  const hechos = new Set(d.avance.completados || []);
  const notas = mods.map((m) => cal[m.id]).filter((x) => typeof x === 'number');
  const prom = notas.length ? (notas.reduce((a, b) => a + b, 0) / notas.length) : null;
  const constancia = urlSegura(d.avance.constanciaUrl || '');
  const filas = mods.map((m) =>
    '<tr><th scope="row">' + esc(m.titulo) + '</th><td>' + (hechos.has(m.id) ? 'Completado' : 'Pendiente') + '</td><td>' +
    (typeof cal[m.id] === 'number' ? esc(formatoNota(cal[m.id])) : '—') + '</td></tr>').join('');
  return '<article class="portal-card portal-grades">' +
    '<div class="portal-grades-head"><h3>' + esc(d.curso.nombre || d.id) + '</h3>' +
    (prom !== null ? '<p class="portal-avg">Promedio: <strong>' + esc(formatoNota(prom)) + '</strong></p>' : '') + '</div>' +
    (mods.length
      ? '<div class="table-wrap"><table class="portal-table"><caption class="sr-only">Calificaciones de ' + esc(d.curso.nombre || d.id) + '</caption>' +
        '<thead><tr><th scope="col">Módulo</th><th scope="col">Estado</th><th scope="col">Calificación</th></tr></thead><tbody>' + filas + '</tbody></table></div>'
      : '<p class="portal-muted">Aún no hay calificaciones.</p>') +
    (constancia
      ? '<a class="btn btn-teal" href="' + esc(constancia) + '" target="_blank" rel="noopener">Descargar constancia<span class="sr-only"> (se abre en otra pestaña)</span></a>'
      : '<p class="portal-muted">Tu constancia aparecerá aquí cuando termines el curso.</p>') +
    '</article>';
}

function formatoNota(x) { return (Math.round(x * 10) / 10).toString(); }
