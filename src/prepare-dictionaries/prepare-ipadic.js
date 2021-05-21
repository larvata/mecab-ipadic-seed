const {
  CACHE_DIRECTORY,
  UNPACK_DIRECTORY,
  downloadDict,
  eucjp2utf8,
} = require('./utils');

module.exports = async (options) => {
  console.log('Fetch: mecab-ipadic.zip');
  const origAllFiles = await downloadDict({ dict: 'ipadic', cachePath: CACHE_DIRECTORY });
  const origDictFiles = origAllFiles.filter((file) => file.path.endsWith('.def') || file.path.endsWith('.csv'));
  // const origDictFiles = origAllFiles;

  // convert the encoding of the original ipadic files
  console.log('Recoding: mecab-ipadic');
  const recodingTasks = origDictFiles.map((file) => eucjp2utf8(file, UNPACK_DIRECTORY));
  await Promise.all(recodingTasks);
};
