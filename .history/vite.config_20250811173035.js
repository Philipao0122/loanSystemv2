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
          main: resolve(__dirname, 'view_loan.html'),
          // Agrega aquí otras páginas HTML si es necesario
        },
      },
    },
    define: {
      // Reemplazar los placeholders en tiempo de compilación
      'VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
    }
  };
});
