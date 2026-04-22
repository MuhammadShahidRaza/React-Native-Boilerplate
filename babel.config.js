module.exports = {
  presets: ['module:@react-native/babel-preset'],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
  plugins: [
    "./themed-stylesheet.js",
    [
      "module:react-native-dotenv",
      {
        envName: "APP_ENV",
        moduleName: "@env",
      },
    ],
    [
      "module-resolver",
      {
        root: ["./src"],
        extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
        alias: {
          components: "./src/components",
          config: "./src/config",
          types: "./src/types",
          screens: "./src/screens",
          utils: "./src/utils",
          navigation: "./src/navigation",
          context: "./src/context",
          constants: "./src/constants",
          store: "./src/redux",
          hooks: "./src/hooks",
          theme: "./src/theme",
          assets: "./src/assets",
          i18n: "./src/i18n",
          api: "./src/api",
        },
      },
    ],
    // react-native-worklets/plugin must be last
    "react-native-worklets/plugin",
  ],
};
