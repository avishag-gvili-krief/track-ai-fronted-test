import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    __API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL),
    __BLAZOR_MAPBOX_URL__: JSON.stringify(process.env.VITE_BLAZOR_MAPBOX_URL),
  },
});

