/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { src, dest } from 'gulp'

export function copyAddon(cb) {
    // return cb()
    console.log('迁移 node-addon-api/build/release/**')
    return src('node-addon-api/build/Release/**/*.{node,pdb}', {
        removeBOM: false,
        encoding: false
    }).pipe(dest('build/Release', {}))
}
