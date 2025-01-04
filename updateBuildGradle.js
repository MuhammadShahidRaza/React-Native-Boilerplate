const { appendLineToFile } = require("./src/pathSaver");

const pathsToSave = [
  {
    filePath: "android/app/build.gradle",
    lineToAdd: 'apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")',
  },
  // Add more paths and commands as needed
];

pathsToSave.forEach((item) => {
  try {
    appendLineToFile(item.filePath, item.lineToAdd);
    console.log(`Line added to ${item.filePath}`);
  } catch (err) {
    console.error(`Error adding line to ${item.filePath}:`, err);
  }
});



// commit msg  yarn commitlint --edit $1
 
//pre-commit  yarn lint-staged 
