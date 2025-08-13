import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    root: '.',
    publicDir: 'public',
    server: {
      port: 3000,
      open: true
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          // Asegúrate de que los nombres coincidan con tus archivos HTML
          main: resolve(__dirname, 'index.html'),
          dashboard: resolve(__dirname, 'dashboard.html'),
          loan: resolve(__dirname, 'loan.html'),
          view_loan: resolve(__dirname, 'view_loan.html'),
        },
      },
    },
    define: {
      // Esta sección ya está correcta, no la modifiques.
      // Reemplaza los placeholders en tiempo de compilación
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
    }
  };
});
