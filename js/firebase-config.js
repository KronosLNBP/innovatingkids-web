// Configuración web de Firebase para el portal de alumnos.
// 1) En la consola de Firebase: Configuración del proyecto → Tus apps → App web → "Configuración del SDK".
// 2) Copia los valores aquí (no son secretos: Firebase los diseña para ir en el navegador;
//    la seguridad la dan las reglas de firestore.rules).
// Mientras sea null, alumnos.html y admin.html muestran "El portal todavía no está activo".
export const firebaseConfig = null;
/* Ejemplo:
export const firebaseConfig = {
  apiKey: 'AIza...',
  authDomain: 'innovating-kids.firebaseapp.com',
  projectId: 'innovating-kids',
  storageBucket: 'innovating-kids.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abc123'
};
*/
