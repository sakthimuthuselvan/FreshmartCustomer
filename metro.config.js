const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const { withNativeWind } = require("nativewind/metro");

const defaultConfig = getDefaultConfig(__dirname);

const config = mergeConfig(defaultConfig, {
  resolver: {
    blockList: [
      /.*\/android\/\.cxx\/.*/,
      /.*\/android\/build\/.*/,
      /.*\/ios\/build\/.*/,
      /.*\/node_modules\/.*\/android\/\.cxx\/.*/
    ]
  }
});

module.exports = withNativeWind(config, { input: "./global.css" });