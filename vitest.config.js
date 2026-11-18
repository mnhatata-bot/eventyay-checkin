import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      // Native Vitest suite belongs to src/. Historical source-review Node
      // reproduction fixtures under ci-review/ and test/ are not native tests;
      // their assertions intentionally describe pre-patch unsafe behavior.
      include: ['src/**/*.{spec,test}.{js,jsx,ts,tsx,mjs,cjs}'],
      exclude: [...configDefaults.exclude, 'e2e/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      transformMode: {
        web: [/\.[jt]sx$/]
      }
    }
  })
)
