// Conexión con Firebase compartida por alumnos.html y admin.html.
import { initializeApp, deleteApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut,
  createUserWithEmailAndPassword, sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, collection, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

// Los alumnos sin correo entran con un usuario; por dentro se convierte en este correo.
export const DOMINIO_ALUMNOS = 'alumnos.innovatingkids.com.mx';
export const listo = !!(firebaseConfig && firebaseConfig.apiKey);

let app = null, auth = null, db = null;
if (listo) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}
export { auth, db };

export function usuarioAEmail(valor) {
  const v = String(valor || '').trim().toLowerCase();
  return v.includes('@') ? v : v + '@' + DOMINIO_ALUMNOS;
}
export function esCorreoReal(email) {
  return !!email && !String(email).toLowerCase().endsWith('@' + DOMINIO_ALUMNOS);
}
export function usuarioValido(v) {
  return /^[a-z0-9][a-z0-9._-]{2,29}$/.test(v);
}

export const entrar = (u, p) => signInWithEmailAndPassword(auth, usuarioAEmail(u), p);
export const salir = () => signOut(auth);
export const alCambiarSesion = (fn) => onAuthStateChanged(auth, fn);
export const recuperar = (email) => sendPasswordResetEmail(auth, email);

export async function leer(ruta) {
  const s = await getDoc(doc(db, ruta));
  return s.exists() ? Object.assign({ id: s.id }, s.data()) : null;
}
export async function listar(ruta) {
  const s = await getDocs(collection(db, ruta));
  return s.docs.map((d) => Object.assign({ id: d.id }, d.data()));
}
export const guardar = (ruta, datos, unir = true) => setDoc(doc(db, ruta), datos, { merge: unir });
export const actualizar = (ruta, datos) => updateDoc(doc(db, ruta), datos);
export const ahora = () => serverTimestamp();

// Crea una cuenta de alumno sin cerrar la sesión del administrador:
// usa una segunda instancia de Firebase solo para el alta.
export async function crearCuenta(email, password) {
  const temp = initializeApp(firebaseConfig, 'alta-' + Date.now());
  try {
    const cred = await createUserWithEmailAndPassword(getAuth(temp), email, password);
    return cred.user.uid;
  } finally {
    try { await signOut(getAuth(temp)); } catch (e) { /* sin sesión */ }
    await deleteApp(temp);
  }
}

// Mensajes de error de Firebase en español.
export function mensajeError(e) {
  const c = (e && e.code) || '';
  const m = {
    'auth/invalid-credential': 'Usuario o contraseña incorrectos.',
    'auth/wrong-password': 'Usuario o contraseña incorrectos.',
    'auth/user-not-found': 'Usuario o contraseña incorrectos.',
    'auth/invalid-email': 'Escribe un usuario o correo válido.',
    'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
    'auth/network-request-failed': 'No hay conexión. Revisa tu internet.',
    'auth/email-already-in-use': 'Ese usuario o correo ya tiene una cuenta.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/user-disabled': 'Esta cuenta está desactivada.',
    'permission-denied': 'No tienes permiso para ver esta información.',
    'unavailable': 'No hay conexión con el servidor. Inténtalo de nuevo.'
  };
  return m[c] || 'Ocurrió un error. Inténtalo de nuevo.';
}

// Utilidades de interfaz.
export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
export function urlSegura(u) {
  try { const x = new URL(u); return (x.protocol === 'https:' || x.protocol === 'http:') ? x.href : ''; } catch (e) { return ''; }
}
