const {
  CACHE_DIRECTORY,
  UNPACK_DIRECTORY,
  downloadDict,
  writeToFile,
} = require('./utils');

module.exports = async (options = {}) => {
  let { dict } = options;
  dict = dict || 'unidic-cwj';
  console.log('Fetch: unidic-cwj.zip', CACHE_DIRECTORY);
  const cwjAllFiles = await downloadDict({ dict, cachePath: CACHE_DIRECTORY });
  const cwjDictFiles = cwjAllFiles.filter((file) => {
    return ['char.def', 'unk.def', 'matrix.bin', 'lex_3_1.csv'].includes(file.path);
  });
  const saveDictFilesPromise = cwjDictFiles.map((file) => {
    return writeToFile(file, UNPACK_DIRECTORY);
  });

  await Promise.all(saveDictFilesPromise);
};
