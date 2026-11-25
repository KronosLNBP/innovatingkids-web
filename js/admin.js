// Panel de administración del portal de alumnos (admin.html).
// Solo funciona para cuentas con documento admins/{uid} en Firestore (ver firestore.rules).
import {
  listo, entrar, salir, alCambiarSesion, recuperar, leer, listar, guardar, ahora,
  crearCuenta, usuarioAEmail, usuarioValido, esCorreoReal, mensajeError, esc, urlSegura
} from './portal-fb.js';

window.IK_PORTAL_OK = true;
const $ = (id) => document.getElementById(id);
const vistas = ['v-cargando', 'v-inactivo', 'v-login', 'v-sin-acceso', 'v-portal'];
function mostrar(id) {
  vistas.forEach((v) => { $(v).hidden = v !== id; });
  $('btn-salir').hidden = !(id === 'v-portal' || id === 'v-sin-acceso');
}

let cursos = [];      // [{id, nombre, orden, modulos:[{id,titulo}]}]
let alumnos = [];     // [{id, nombre, usuario, email, cursos[], activo, tutor, whatsapp}]
let actual = null;    // alumno en edición

// Los 6 cursos que ya aparecen en el sitio (sin módulos: los agrega el maestro).
const CURSOS_SITIO = [
  ['python', 'Python'],
  ['pensamiento-computacional', 'Pensamiento Computacional'],
  ['robotica', 'Robótica'],
  ['minecraft-codigo', 'Minecraft con código'],
  ['minecraft-design', 'Minecraft Design'],
  ['roblox-studio', 'Roblox Studio']
];
const BASE = 'https://www.innovatingkids.com.mx/temarios/';
const TEMARIOS = {
  robotica: [['Temario: Robótica con LEGO Education (PDF)', BASE + 'temario-robotica-lego-education.pdf'], ['Temario: Robótica con Arduino (PDF)', BASE + 'temario-robotica-arduino.pdf']],
  'minecraft-codigo': [['Temario: Módulos de Minecraft (PDF)', BASE + 'temario-minecraft.pdf']],
  'minecraft-design': [['Temario: Módulos de Minecraft (PDF)', BASE + 'temario-minecraft.pdf']],
  'roblox-studio': [['Temario: Módulos de Roblox (PDF)', BASE + 'temario-roblox.pdf']]
};

function aviso(t, error) {
  const a = $('aviso');
  a.textContent = t; a.hidden = false;
  a.classList.toggle('is-error', !!error);
  clearTimeout(aviso._t);
  aviso._t = setTimeout(() => { a.hidden = true; }, 6000);
}
function error(id, t) { const e = $(id); e.textContent = t; e.hidden = !t; }
function slug(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}
function idModulo() { return 'm' + Math.random().toString(36).slice(2, 8); }
function genPass() {
  const abc = 'abcdefghjkmnpqrstuvwxyz23456789';
  let s = '';
  const r = crypto.getRandomValues(new Uint32Array(8));
  r.forEach((n) => { s += abc[n % abc.length]; });
  return s;
}
function soloDigitos(s) { return String(s || '').replace(/\D/g, ''); }
function nombreCurso(id) { const c = cursos.find((x) => x.id === id); return c ? c.nombre : id; }

// ---------- Sesión ----------
if (!listo) {
  mostrar('v-inactivo');
} else {
  alCambiarSesion(async (user) => {
    if (!user) { mostrar('v-login'); return; }
    try {
      const admin = await leer('admins/' + user.uid);
      if (!admin) { $('mi-uid').textContent = user.uid; mostrar('v-sin-acceso'); return; }
      mostrar('v-portal');
      await cargarTodo();
    } catch (e) {
      console.error(e);
      $('mi-uid').textContent = user.uid;
      mostrar('v-sin-acceso');
    }
  });
}

$('f-login').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const u = $('l-usuario').value.trim(), p = $('l-pass').value;
  if (!u || !p) { error('l-error', 'Escribe tu correo y tu contraseña.'); return; }
  error('l-error', '');
  $('l-btn').disabled = true;
  try { await entrar(u, p); $('l-pass').value = ''; } catch (e) { error('l-error', mensajeError(e)); }
  $('l-btn').disabled = false;
});
document.querySelectorAll('.pass-toggle[aria-controls]').forEach((b) => {
  b.addEventListener('click', () => {
    const i = $(b.getAttribute('aria-controls'));
    const ver = i.type === 'password';
    i.type = ver ? 'text' : 'password';
    b.textContent = ver ? 'Ocultar' : 'Mostrar';
    b.setAttribute('aria-pressed', String(ver));
  });
});
$('btn-salir').addEventListener('click', () => salir());

// ---------- Pestañas ----------
const tabs = [$('t-alumnos'), $('t-cursos')];
tabs.forEach((t, i) => {
  t.addEventListener('click', () => elegirTab(i));
  t.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const j = (i + 1) % 2; elegirTab(j); tabs[j].focus(); }
  });
});
function elegirTab(i) {
  tabs.forEach((t, j) => {
    t.setAttribute('aria-selected', String(i === j));
    t.tabIndex = i === j ? 0 : -1;
    $(t.getAttribute('aria-controls')).hidden = i !== j;
  });
}

// ---------- Carga ----------
async function cargarTodo() {
  try {
    [cursos, alumnos] = await Promise.all([listar('cursos'), listar('alumnos')]);
  } catch (e) { aviso(mensajeError(e), true); return; }
  cursos.sort((a, b) => (a.orden || 99) - (b.orden || 99) || String(a.nombre).localeCompare(b.nombre));
  alumnos.sort((a, b) => String(a.nombre).localeCompare(b.nombre, 'es'));
  pintarAlumnos();
  pintarCursos();
  $('n-cursos').innerHTML = checksCursos('n-c', []);
}

function checksCursos(prefijo, marcados) {
  if (!cursos.length) return '<p class="portal-muted">Primero crea cursos en la pestaña «Cursos».</p>';
  return cursos.map((c) =>
    '<label class="check-line"><input type="checkbox" name="' + prefijo + '" value="' + esc(c.id) + '"' +
    (marcados.includes(c.id) ? ' checked' : '') + '> ' + esc(c.nombre) + '</label>').join('');
}
function leerChecks(prefijo) {
  return Array.from(document.querySelectorAll('input[name="' + prefijo + '"]:checked')).map((i) => i.value);
}

// ---------- Alumnos ----------
function pintarAlumnos() {
  const q = $('buscar').value.trim().toLowerCase();
  const lista = alumnos.filter((a) => !q || String(a.nombre).toLowerCase().includes(q) || String(a.usuario || a.email).toLowerCase().includes(q));
  $('lista-alumnos').innerHTML = lista.length ? lista.map((a) =>
    '<tr><th scope="row">' + esc(a.nombre) + '</th><td>' + esc(a.usuario || a.email) + '</td><td>' +
    esc((a.cursos || []).map(nombreCurso).join(', ') || '—') + '</td><td>' +
    (a.activo === false ? '<span class="tag tag-off">Inactivo</span>' : '<span class="tag">Activo</span>') +
    '</td><td><button class="btn btn-outline btn-sm" type="button" data-editar="' + esc(a.id) + '">Editar<span class="sr-only"> a ' + esc(a.nombre) + '</span></button></td></tr>').join('')
    : '<tr><td colspan="5" class="portal-muted">' + (alumnos.length ? 'Sin resultados.' : 'Todavía no hay alumnos. Usa «Nuevo alumno».') + '</td></tr>';
}
$('buscar').addEventListener('input', pintarAlumnos);
$('lista-alumnos').addEventListener('click', (e) => {
  const b = e.target.closest('[data-editar]');
  if (b) abrirEditar(b.getAttribute('data-editar'));
});

$('btn-nuevo').addEventListener('click', () => {
  $('f-nuevo').reset();
  $('n-cursos').innerHTML = checksCursos('n-c', []);
  $('n-pass').value = genPass();
  ajustarAcceso();
  error('n-error', '');
  $('f-nuevo').hidden = false; $('credenciales').hidden = true;
  $('n-nombre').focus();
});
$('n-cancelar').addEventListener('click', () => { $('f-nuevo').hidden = true; });
$('n-generar').addEventListener('click', () => { $('n-pass').value = genPass(); });
$('n-acceso').addEventListener('change', ajustarAcceso);
function ajustarAcceso() {
  const correo = $('n-acceso').value === 'correo';
  $('n-usuario-l').textContent = correo ? 'Correo' : 'Usuario';
  $('n-usuario').type = correo ? 'email' : 'text';
  $('n-usuario-h').textContent = correo ? 'Con correo podrá recuperar su contraseña solo.' : '3 a 30 caracteres: minúsculas, números, punto o guion. Ej. ana.lopez';
}

$('f-nuevo').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const nombre = $('n-nombre').value.trim();
  const correo = $('n-acceso').value === 'correo';
  const login = $('n-usuario').value.trim().toLowerCase();
  const pass = $('n-pass').value;
  const wa = soloDigitos($('n-wa').value);
  if (!nombre) return error('n-error', 'Escribe el nombre del alumno.');
  if (correo ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login) : !usuarioValido(login)) return error('n-error', correo ? 'Escribe un correo válido.' : 'El usuario debe tener de 3 a 30 caracteres: minúsculas, números, punto o guion.');
  if (pass.length < 6) return error('n-error', 'La contraseña debe tener al menos 6 caracteres.');
  if (wa && wa.length !== 10) return error('n-error', 'El WhatsApp debe tener 10 dígitos.');
  error('n-error', '');
  const btn = $('n-btn'); btn.disabled = true; btn.textContent = 'Creando…';
  try {
    const email = usuarioAEmail(login);
    const uid = await crearCuenta(email, pass);
    const datos = {
      nombre, email, usuario: correo ? '' : login, tutor: $('n-tutor').value.trim(), whatsapp: wa,
      cursos: leerChecks('n-c'), activo: true, creado: ahora()
    };
    await guardar('alumnos/' + uid, datos, false);
    alumnos.push(Object.assign({ id: uid }, datos));
    alumnos.sort((a, b) => String(a.nombre).localeCompare(b.nombre, 'es'));
    pintarAlumnos();
    $('f-nuevo').hidden = true;
    mostrarCredenciales(nombre, correo ? email : login, pass, wa);
  } catch (e) {
    error('n-error', mensajeError(e));
  }
  btn.disabled = false; btn.textContent = 'Crear alumno';
});

function mostrarCredenciales(nombre, login, pass, wa) {
  const texto = 'Portal de alumnos de Innovating Kids\nhttps://www.innovatingkids.com.mx/alumnos.html\nAlumno: ' + nombre + '\nUsuario: ' + login + '\nContraseña: ' + pass;
  $('cred-texto').textContent = texto;
  const a = $('cred-wa');
  a.hidden = !wa;
  if (wa) a.href = 'https://wa.me/52' + wa + '?text=' + encodeURIComponent(texto);
  $('credenciales').hidden = false;
  $('credenciales').scrollIntoView({ block: 'center' });
}
$('cred-copiar').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('cred-texto').textContent); aviso('Datos copiados.'); } catch (e) { aviso('No se pudo copiar; selecciona el texto y cópialo.', true); }
});
$('cred-cerrar').addEventListener('click', () => { $('credenciales').hidden = true; $('cred-texto').textContent = ''; });

// ---------- Editar alumno ----------
async function abrirEditar(id) {
  actual = alumnos.find((a) => a.id === id);
  if (!actual) return;
  $('e-titulo').textContent = actual.nombre;
  $('e-nombre').value = actual.nombre || '';
  $('e-login').value = actual.usuario || actual.email || '';
  $('e-tutor').value = actual.tutor || '';
  $('e-wa').value = actual.whatsapp || '';
  $('e-activo').checked = actual.activo !== false;
  $('e-cursos').innerHTML = checksCursos('e-c', actual.cursos || []);
  error('e-error', ''); error('r-error', '');
  const real = esCorreoReal(actual.email);
  $('e-pass-correo').hidden = !real;
  $('f-reemplazo').hidden = real;
  $('r-usuario').value = ''; $('r-pass').value = genPass();
  $('editar').hidden = false;
  $('editar').focus();
  $('editar').scrollIntoView({ block: 'start' });
  await pintarAvance();
}
$('e-cerrar').addEventListener('click', () => { $('editar').hidden = true; actual = null; });

$('f-datos').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  if (!actual) return;
  const nombre = $('e-nombre').value.trim();
  const wa = soloDigitos($('e-wa').value);
  if (!nombre) return error('e-error', 'Escribe el nombre.');
  if (wa && wa.length !== 10) return error('e-error', 'El WhatsApp debe tener 10 dígitos.');
  error('e-error', '');
  const datos = { nombre, tutor: $('e-tutor').value.trim(), whatsapp: wa, activo: $('e-activo').checked, cursos: leerChecks('e-c') };
  try {
    await guardar('alumnos/' + actual.id, datos);
    Object.assign(actual, datos);
    $('e-titulo').textContent = nombre;
    pintarAlumnos();
    await pintarAvance();
    aviso('Datos guardados.');
  } catch (e) { error('e-error', mensajeError(e)); }
});

async function pintarAvance() {
  const cont = $('e-avance');
  const ids = (actual && actual.cursos) || [];
  pintarJuegos(actual.id);
  if (!ids.length) { cont.innerHTML = '<p class="portal-muted">Inscríbelo en un curso para registrar avance y calificaciones.</p>'; return; }
  cont.innerHTML = '<p class="portal-muted">Cargando avance…</p>';
  const uid = actual.id;
  const avances = await Promise.all(ids.map((c) => leer('alumnos/' + uid + '/avance/' + c).catch(() => null)));
  if (!actual || actual.id !== uid) return;
  cont.innerHTML = ids.map((cid, i) => {
    const curso = cursos.find((c) => c.id === cid) || { id: cid, nombre: cid, modulos: [] };
    const av = avances[i] || {};
    const hechos = new Set(av.completados || []);
    const cal = av.calificaciones || {};
    const mods = curso.modulos || [];
    const filas = mods.map((m) =>
      '<tr><th scope="row">' + esc(m.titulo) + '</th>' +
      '<td><label class="check-line"><input type="checkbox" data-mod="' + esc(m.id) + '"' + (hechos.has(m.id) ? ' checked' : '') + '><span class="sr-only">Completado: ' + esc(m.titulo) + '</span></label></td>' +
      '<td><input class="nota" type="number" min="0" max="10" step="0.1" inputmode="decimal" data-nota="' + esc(m.id) + '" value="' + (typeof cal[m.id] === 'number' ? cal[m.id] : '') + '" aria-label="Calificación de ' + esc(m.titulo) + '"></td></tr>').join('');
    return '<form class="admin-avance" data-curso="' + esc(cid) + '" novalidate>' +
      '<h3>' + esc(curso.nombre) + '</h3>' +
      (mods.length
        ? '<div class="table-wrap"><table class="portal-table"><thead><tr><th scope="col">Módulo</th><th scope="col">Completado</th><th scope="col">Calificación (0–10)</th></tr></thead><tbody>' + filas + '</tbody></table></div>'
        : '<p class="portal-muted">Este curso no tiene módulos. Agrégalos en la pestaña «Cursos».</p>') +
      '<div class="field"><label for="cu-' + esc(cid) + '">Enlace de la constancia <span class="opt">(opcional)</span></label>' +
      '<input id="cu-' + esc(cid) + '" type="url" data-constancia value="' + esc(av.constanciaUrl || '') + '" placeholder="https://drive.google.com/…"></div>' +
      '<p class="form-error" role="alert" hidden></p>' +
      '<div class="admin-actions"><button class="btn btn-teal" type="submit">Guardar avance de ' + esc(curso.nombre) + '</button></div></form>';
  }).join('');
}

// Estrellas de los juegos (las guarda el alumno al jugar)
const JUEGOS = [['hardware', 'Computación básica: hardware', 9], ['bloques', 'Programación con bloques', 51], ['aleteo', 'Tutorial Astro Salto (JavaScript)', 11], ['cubos', 'Mundo de Cubos (3D)', 8], ['navidad', 'Aventura de Navidad', 8], ['dinosaurios', 'Vivir con dinosaurios', 9], ['criaturas', 'Exploradores de criaturas', 9]];
async function pintarJuegos(uid) {
  const box = $('e-juegos');
  box.innerHTML = '<p class="portal-muted">Cargando niveles…</p>';
  const datos = await Promise.all(JUEGOS.map((j) => leer('alumnos/' + uid + '/juegos/' + j[0]).catch(() => null)));
  if (!actual || actual.id !== uid) return;
  box.innerHTML = '<h3>Niveles de los juegos</h3><ul class="admin-juegos">' + JUEGOS.map((j, i) => {
    const niv = (datos[i] && datos[i].niveles) || {};
    const total = (datos[i] && datos[i].total) || j[2];
    const hechos = Object.keys(niv).filter((k) => +niv[k] > 0).length;
    const est = Object.keys(niv).reduce((a, k) => a + (+niv[k] || 0), 0);
    return '<li><strong>' + esc(j[1]) + ':</strong> ' + hechos + ' de ' + total + ' niveles · ' + est + ' de ' + (total * 3) + ' estrellas</li>';
  }).join('') + '</ul>';
}

$('e-avance').addEventListener('submit', async (ev) => {
  const f = ev.target.closest('.admin-avance');
  if (!f || !actual) return;
  ev.preventDefault();
  const err = f.querySelector('.form-error');
  const cid = f.getAttribute('data-curso');
  const completados = Array.from(f.querySelectorAll('[data-mod]:checked')).map((i) => i.getAttribute('data-mod'));
  const calificaciones = {};
  let mal = false;
  f.querySelectorAll('[data-nota]').forEach((i) => {
    i.removeAttribute('aria-invalid');
    if (i.value === '') return;
    const n = Number(i.value);
    if (!isFinite(n) || n < 0 || n > 10) { mal = true; i.setAttribute('aria-invalid', 'true'); return; }
    calificaciones[i.getAttribute('data-nota')] = n;
  });
  const cu = f.querySelector('[data-constancia]').value.trim();
  if (mal) { err.textContent = 'Las calificaciones van de 0 a 10.'; err.hidden = false; return; }
  if (cu && !urlSegura(cu)) { err.textContent = 'El enlace de la constancia debe empezar con https://'; err.hidden = false; return; }
  err.hidden = true;
  try {
    await guardar('alumnos/' + actual.id + '/avance/' + cid, { completados, calificaciones, constanciaUrl: cu, actualizado: ahora() }, false);
    aviso('Avance guardado: ' + nombreCurso(cid) + '.');
  } catch (e) { err.textContent = mensajeError(e); err.hidden = false; }
});

$('e-reset').addEventListener('click', async () => {
  if (!actual) return;
  try { await recuperar(actual.email); aviso('Se envió el correo de recuperación a ' + actual.email + '.'); } catch (e) { aviso(mensajeError(e), true); }
});

// Acceso nuevo para alumnos con usuario: copia datos y avance, y desactiva el acceso anterior.
$('f-reemplazo').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  if (!actual) return;
  const login = $('r-usuario').value.trim().toLowerCase();
  const pass = $('r-pass').value;
  if (!usuarioValido(login)) return error('r-error', 'Usuario no válido (3 a 30: minúsculas, números, punto o guion).');
  if (pass.length < 6) return error('r-error', 'La contraseña debe tener al menos 6 caracteres.');
  error('r-error', '');
  const btn = $('r-btn'); btn.disabled = true;
  try {
    const viejo = actual;
    const email = usuarioAEmail(login);
    const uid = await crearCuenta(email, pass);
    const datos = {
      nombre: viejo.nombre || '', email, usuario: login, tutor: viejo.tutor || '', whatsapp: viejo.whatsapp || '',
      cursos: viejo.cursos || [], activo: true, creado: ahora(), reemplazaA: viejo.id
    };
    await guardar('alumnos/' + uid, datos, false);
    for (const cid of datos.cursos) {
      const av = await leer('alumnos/' + viejo.id + '/avance/' + cid).catch(() => null);
      if (av) { delete av.id; await guardar('alumnos/' + uid + '/avance/' + cid, av, false); }
    }
    await guardar('alumnos/' + viejo.id, { activo: false, reemplazadaPor: uid });
    viejo.activo = false;
    alumnos.push(Object.assign({ id: uid }, datos));
    alumnos.sort((a, b) => String(a.nombre).localeCompare(b.nombre, 'es'));
    pintarAlumnos();
    $('editar').hidden = true; actual = null;
    mostrarCredenciales(datos.nombre, login, pass, datos.whatsapp);
  } catch (e) { error('r-error', mensajeError(e)); }
  btn.disabled = false;
});

// ---------- Cursos ----------
function pintarCursos() {
  $('btn-semilla').hidden = cursos.length > 0;
  $('lista-cursos').innerHTML = cursos.length
    ? cursos.map((c) =>
      '<article class="portal-card admin-curso"><div class="admin-edit-head"><h3>' + esc(c.nombre) + '</h3>' +
      '<button class="btn btn-outline btn-sm" type="button" data-curso-editar="' + esc(c.id) + '">Editar<span class="sr-only"> ' + esc(c.nombre) + '</span></button></div>' +
      '<p class="portal-muted">' + (c.modulos || []).length + ' módulos · <code>' + esc(c.id) + '</code></p><div class="admin-curso-form"></div></article>').join('')
    : '<p class="portal-empty">No hay cursos. Usa «Cargar los 6 cursos del sitio» o «Nuevo curso».</p>';
}

$('btn-semilla').addEventListener('click', async () => {
  const b = $('btn-semilla'); b.disabled = true;
  try {
    for (let i = 0; i < CURSOS_SITIO.length; i++) {
      const [id, nombre] = CURSOS_SITIO[i];
      await guardar('cursos/' + id, { nombre, orden: i + 1, modulos: [] }, false);
      const items = (TEMARIOS[id] || []).map(([titulo, url]) => ({ titulo, url }));
      await guardar('cursos/' + id + '/privado/materiales', { items }, false);
    }
    await cargarTodo();
    aviso('Se cargaron los 6 cursos. Ahora agrega sus módulos.');
  } catch (e) { aviso(mensajeError(e), true); }
  b.disabled = false;
});

$('btn-nuevo-curso').addEventListener('click', () => {
  const art = document.createElement('article');
  art.className = 'portal-card admin-curso';
  art.innerHTML = '<h3>Nuevo curso</h3><div class="admin-curso-form"></div>';
  $('lista-cursos').prepend(art);
  const p = $('lista-cursos').querySelector('.portal-empty');
  if (p) p.remove();
  formCurso(art.querySelector('.admin-curso-form'), null, []);
});

$('lista-cursos').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-curso-editar]');
  if (!b) return;
  const c = cursos.find((x) => x.id === b.getAttribute('data-curso-editar'));
  const box = b.closest('.admin-curso').querySelector('.admin-curso-form');
  if (box.childElementCount) { box.innerHTML = ''; return; }
  const mat = await leer('cursos/' + c.id + '/privado/materiales').catch(() => null);
  formCurso(box, c, (mat && mat.items) || []);
});

function formCurso(box, c, materiales) {
  const k = c ? c.id : 'nuevo';
  box.innerHTML =
    '<form class="admin-form-curso" novalidate>' +
    '<div class="field"><label for="cn-' + esc(k) + '">Nombre del curso</label><input id="cn-' + esc(k) + '" name="nombre" type="text" required value="' + esc(c ? c.nombre : '') + '"></div>' +
    '<div class="field"><label for="cm-' + esc(k) + '">Módulos (uno por renglón, en orden)</label><textarea id="cm-' + esc(k) + '" name="modulos" rows="6">' +
      esc(c ? (c.modulos || []).map((m) => m.titulo).join('\n') : '') + '</textarea>' +
      '<small class="field-hint">Si cambias el nombre de un módulo, se reinicia su avance y su calificación.</small></div>' +
    '<div class="field"><label for="cx-' + esc(k) + '">Materiales (uno por renglón: Título | https://enlace)</label><textarea id="cx-' + esc(k) + '" name="materiales" rows="4" placeholder="Guía de la clase 1 | https://drive.google.com/…">' +
      esc(materiales.map((m) => (m.titulo || '') + ' | ' + (m.url || '')).join('\n')) + '</textarea></div>' +
    '<p class="form-error" role="alert" hidden></p>' +
    '<div class="admin-actions"><button class="btn btn-teal" type="submit">Guardar curso</button></div></form>';
  const f = box.querySelector('form');
  f.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const err = f.querySelector('.form-error');
    const nombre = f.nombre.value.trim();
    if (!nombre) { err.textContent = 'Escribe el nombre del curso.'; err.hidden = false; return; }
    const previos = c ? (c.modulos || []) : [];
    const modulos = f.modulos.value.split('\n').map((t) => t.trim()).filter(Boolean).map((titulo) => {
      const p = previos.find((m) => m.titulo === titulo);
      return { id: p ? p.id : idModulo(), titulo };
    });
    const items = [];
    const malos = [];
    f.materiales.value.split('\n').map((t) => t.trim()).filter(Boolean).forEach((linea) => {
      const i = linea.lastIndexOf('|');
      const titulo = (i > -1 ? linea.slice(0, i) : '').trim();
      const url = urlSegura((i > -1 ? linea.slice(i + 1) : linea).trim());
      if (url) items.push({ titulo: titulo || 'Material', url }); else malos.push(linea);
    });
    if (malos.length) { err.textContent = 'Revisa estos materiales (falta un enlace https://): ' + malos.join(' · '); err.hidden = false; return; }
    let id = c ? c.id : slug(nombre);
    if (!id) { err.textContent = 'Usa letras o números en el nombre.'; err.hidden = false; return; }
    if (!c && cursos.some((x) => x.id === id)) id = id + '-' + Math.random().toString(36).slice(2, 5);
    err.hidden = true;
    try {
      await guardar('cursos/' + id, { nombre, modulos, orden: c ? (c.orden || 99) : cursos.length + 1 });
      await guardar('cursos/' + id + '/privado/materiales', { items }, false);
      await cargarTodo();
      aviso('Curso guardado: ' + nombre + '.');
    } catch (e) { err.textContent = mensajeError(e); err.hidden = false; }
  });
  f.nombre.focus();
}
