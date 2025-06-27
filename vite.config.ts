import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // Define a página principal (que será carregada em http://localhost:xxxx/)
        main: resolve(__dirname, 'relatorio.html'),

        // Define a segunda página
        comunicacao: resolve(__dirname, 'comunicacao.html'),
      },
    },
  },
})