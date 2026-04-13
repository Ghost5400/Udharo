const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add WASM to asset extensions for expo-sqlite web support
config.resolver.assetExts.push('wasm');

// expo-sqlite on web uses AccessHandlePoolVFS which requires
// FileSystemSyncAccessHandle. That API requires crossOriginIsolated = true,
// which means the server MUST send COOP + COEP headers.
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      middleware(req, res, next);
    };
  },
};

module.exports = config;
