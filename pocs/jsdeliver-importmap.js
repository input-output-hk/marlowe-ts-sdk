const importMap = {
  imports: {
    '@marlowe.io/wallet':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/wallet/esm/browser.js',
    '@marlowe.io/wallet/browser':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/wallet/esm/browser.js',
    '@marlowe.io/wallet/api':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/wallet/esm/api.js',
    '@marlowe.io/runtime-core':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/runtime-core/esm/index.js',
    '@marlowe.io/runtime-lifecycle':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/runtime-lifecycle/esm/index.js',
    '@marlowe.io/runtime-rest-client':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/runtime-rest-client/esm/runtime-rest-client.js',
    '@marlowe.io/runtime-rest-client/transaction':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/runtime-rest-client/esm/transaction.js',
    '@marlowe.io/runtime-rest-client/withdrawal':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/runtime-rest-client/esm/withdrawal.js',
    '@marlowe.io/adapter':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/adapter/esm/adapter.js',
    '@marlowe.io/adapter/time':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/adapter/esm/time.js',
    '@marlowe.io/adapter/codec':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/adapter/esm/codec.js',
    '@marlowe.io/adapter/file':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/adapter/esm/file.js',
    '@marlowe.io/adapter/http':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/adapter/esm/http.js',
    '@marlowe.io/adapter/fp-ts':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/adapter/esm/fp-ts.js',
    '@marlowe.io/language-core-v1/next':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/language-core-v1/esm/next.js',
    '@marlowe.io/language-core-v1/version':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/language-core-v1/esm/version.js',
    '@marlowe.io/language-core-v1/environment':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/language-core-v1/esm/environment.js',
    '@marlowe.io/language-core-v1/state':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/language-core-v1/esm/state.js',
    '@marlowe.io/language-core-v1':
      'https://cdn.jsdelivr.net/gh/hrajchert/marlowe-ts-sdk@081ea368e70b3126a71e076ae11c713b5163aefb/dist/language-core-v1/esm/language-core-v1.js',
    'lucid-cardano': 'https://unpkg.com/lucid-cardano@0.10.7/web/mod.js',
  },
};
const im = document.createElement('script');
im.type = 'importmap';
im.textContent = JSON.stringify(importMap);
document.currentScript.after(im);
