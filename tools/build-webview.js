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

const build = () => {
  copyResourceFiles();
  compileJS();
};

const watch = () => {
  process.stdout.write('Watching...\n');

  fs.watch(inputFolder, {}, (eventType, filename) => {
    if (filename) {
      process.stdout.write('Asset changed. Copying... ');
      copyResourceFiles();
      process.stdout.write('Done.\n');
    }
  });

  fs.watch(sourceFilename, {}, (eventType, filename) => {
    if (filename) {
      process.stdout.write('Code changed. Compiling... ');
      compileJS();
      process.stdout.write('Done.\n');
    }
  });
};

const args = process.argv.slice(2);

if (args.length === 0) {
  build();
} else if (args.indexOf('--watch') !== -1 || args.indexOf('-w') !== -1) {
  watch();
}
