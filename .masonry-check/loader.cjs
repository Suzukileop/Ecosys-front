module.exports = function (source) {
  return require('typescript').transpileModule(source, {
    compilerOptions: { jsx: 4, target: 7, module: 99 }, fileName: this.resourcePath,
  }).outputText;
};
