import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import preact from '@preact/preset-vite'

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()]
    },
    preload: {
        plugins: [externalizeDepsPlugin()]
    },
    renderer: {
        resolve: {
            alias: {
                '@renderer': resolve('src/renderer/src')
            }
        },
        plugins: [preact()]
    }
})
