import path from 'path'
import { fileURLToPath } from 'url'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ['**/int.spec.{ts,js}'],
    exclude: ['**/e2e.spec.{ts,js}'],
    globals: true,
    environment: 'node',
    setupFiles: ['./dev/test-setup.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URI: 'postgres://bit-linux:bit-linux@localhost:5432/payload-ai-localization-dev',
      PAYLOAD_SECRET: 'd36e1b8d8cc9a9b3c59b649e',
      OPENAI_API_KEY: '7eIgbTjVc0UmaF4INY_uOQxC_8TowgF7vJh-5GTpQzdJVQjNggdSQEccseiW9aac5Kk9WIls51T3BlbkFJT16vnEqwtEq-6N9MnQQrzaK1MOwqdlzvPjmkATyv3Esn5GYRSqkHON5oFfH7zKK4mU4x9MGAQA',
    },
  },
})
