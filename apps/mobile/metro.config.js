const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the monorepo root so workspace packages resolve correctly
config.watchFolders = [monorepoRoot];

// Block Rust build artifacts from being watched — they are ephemeral
// during `cargo build` and cause ENOENT crashes in Metro's file watcher
config.resolver.blockList = [
  /apps\/desktop\/src-tauri\/target\/.*/,
];

// React must be a singleton in the bundle. Desktop pins react ^18.3 while
// mobile needs 18.2.0 (react-native 0.74), so the hoisted install nests one
// of them — WHICH one is decided at install time (no committed lockfile).
// If mobile's copy is the nested one, hoisted packages like
// @tanstack/react-query resolve the root copy instead and the app crashes at
// launch with "Cannot read property 'useEffect' of null" (two React
// instances; shipped in the v0.4.1 APK). Route every react/react-native
// import through the app's own resolution so the same copy wins everywhere.
const SINGLETONS = ['react', 'react-native'];
const appOrigin = path.join(projectRoot, 'package.json');
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const base = moduleName.split('/')[0];
  if (SINGLETONS.includes(base)) {
    return context.resolveRequest(
      { ...context, originModulePath: appOrigin },
      moduleName,
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
