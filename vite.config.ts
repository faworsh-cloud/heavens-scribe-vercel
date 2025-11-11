// 이것은 테스트 주석입니다.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // 1. PWA 플러그인을 불러옵니다.

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({ // 2. PWA 플러그인을 실행하도록 설정합니다.
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Heavens Scribe', // 앱의 전체 이름
        short_name: 'HeavensScribe', // 앱 아이콘 밑에 표시될 짧은 이름
        description: '설교 자료 정리를 위한 앱', // 앱 설명
        theme_color: '#ffffff', // 앱 상단바 색상
        background_color: '#ffffff', // 앱 실행 시 배경색
        display: 'standalone', // 브라우저 주소창 없이 앱처럼 열기
        start_url: '/', // 앱 시작 주소
        icons: [
          // 3. 아이콘 파일들을 등록합니다.
          {
            src: 'pwa-192x192.png', // 192x192 픽셀 크기 아이콘
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // 512x512 픽셀 크기 아이콘
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})