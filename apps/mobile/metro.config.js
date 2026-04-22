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

module.exports = config;
