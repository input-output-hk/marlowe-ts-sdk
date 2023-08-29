import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy'
import commonjs from '@rollup/plugin-commonjs';
import outputSize from 'rollup-plugin-output-size';
import { visualizer } from "rollup-plugin-visualizer";

const outputDir = 'dist/runtime/esm';
const nodePlugin = nodeResolve(
    { browser: true 
    });

const copyWasm = copy({
    targets: [
        { src: 'node_modules/lucid-cardano/esm/src/core/wasm_modules/cardano_multiplatform_lib_web/*.wasm', dest: `${outputDir}/wasm_modules/cardano_multiplatform_lib_web/` },
        { src: 'node_modules/lucid-cardano/esm/src/core/wasm_modules/cardano_message_signing_web/*.wasm', dest: `${outputDir}/wasm_modules/cardano_message_signing_web/` },
    ]})

export default {
    // input: 'packages/language/core/v1/dist/semantics/contract/index.js',
    // input: 'packages/adapter/dist/index.js',
    input: 'packages/runtime/lifecycle/dist/index.js',
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