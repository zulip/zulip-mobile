const fs = require('fs');
const babel = require('babel-core');

const inputFolder = 'src/webview/assets/';
const outputAndroidFolder = 'android/app/src/main/assets/webview/';
const outputIosFolder = 'ios/webview/';

const sourceFilename = 'src/webview/js/js.js';

const copyFile = filename => {
  fs
    .createReadStream(inputFolder + filename)
    .pipe(fs.createWriteStream(outputAndroidFolder + filename));
  fs
    .createReadStream(inputFolder + filename)
    .pipe(fs.createWriteStream(outputIosFolder + filename));
};

const copyResourceFiles = () => {
  fs.readdirSync(inputFolder).forEach(filename => {
    copyFile(filename);
  });
};

const compileJS = () => {
  const compiledCode = babel.transformFileSync(sourceFilename, {
    compact: false,
  }).code;

  fs.writeFileSync(`${outputAndroidFolder}zulip.js`, compiledCode);
  fs.writeFileSync(`${outputIosFolder}zulip.js`, compiledCode);
};

copyResourceFiles();
compileJS();
