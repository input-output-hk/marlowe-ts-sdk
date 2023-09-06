import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy'
import commonjs from '@rollup/plugin-commonjs';
import outputSize from 'rollup-plugin-output-size';
import { visualizer } from "rollup-plugin-visualizer";

const outputDir = 'dist/wallet/esm';
const nodePlugin = nodeResolve(
    { browser: true
    });

const copyWasm = copy({
    targets: [
        { src: 'node_modules/lucid-cardano/esm/src/core/wasm_modules/cardano_multiplatform_lib_web/*.wasm', dest: `${outputDir}/wasm_modules/cardano_multiplatform_lib_web/` },
        { src: 'node_modules/lucid-cardano/esm/src/core/wasm_modules/cardano_message_signing_web/*.wasm', dest: `${outputDir}/wasm_modules/cardano_message_signing_web/` },
    ]})

export default {
    input: 'packages/wallet/dist/browser/index.js',
    output: {
        dir: outputDir,
        format: 'esm',
    },
    plugins:
        [ nodePlugin
        , commonjs()
        , copyWasm
        , outputSize()
        , visualizer()],
}
