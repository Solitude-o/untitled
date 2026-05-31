import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base:'./',
  build: {
    outDir: 'dist'
  }
})


// https://gist.githubusercontent.com/Solitude-o/d482ae581677f0c60329ba8bf4955914/raw/b93826d724f295315840be017ee17a3acb2894c1/data.json

// https://github.com/Solitude-o/untitled