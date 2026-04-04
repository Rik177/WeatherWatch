import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const yandexKey = env.YANDEX_WEATHER_KEY ?? ''

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api/yandex': {
          target: 'https://api.weather.yandex.ru',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/yandex/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (yandexKey) {
                proxyReq.setHeader('X-Yandex-Weather-Key', yandexKey)
              }
            })
          },
        },
        '/api/nominatim': {
          target: 'https://nominatim.openstreetmap.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/nominatim/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader(
                'User-Agent',
                'WeatherWatch/1.0 (study project; +https://example.local)',
              )
            })
          },
        },
      },
    },
  }
})
