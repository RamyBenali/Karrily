import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load .env file vars, then merge with process.env for Cloudflare build-time vars
  const env = loadEnv(mode, process.cwd(), '')

  const viteEnvDefines = Object.fromEntries(
    Object.entries({ ...env, ...process.env })
      .filter(([key]) => key.startsWith('VITE_'))
      .map(([key, val]) => [`import.meta.env.${key}`, JSON.stringify(val)])
  )

  return {
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: viteEnvDefines,

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
