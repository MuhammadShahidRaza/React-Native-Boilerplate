module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    "react-native-reanimated/plugin",
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
          types: "./src/types",
          screens: "./src/screens",
          translation: "./src/translation",
          utils: "./src/utils",
          navigation: "./src/navigation",
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
  ],
};
