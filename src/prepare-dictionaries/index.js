const {
  downloadMecabIpadic,
  downloadMecabIpadicNeologd,
  eucjp2utf8,
  unxz,
  writeToFile,
  patchFile,
  createDirectorySync,
} = require('./utils');

const CACHE_DIRECTORY = '.cache';

module.exports = async (options) => {
  const opts = { neologd: true, doPatch: true, ...options };
  const {
    dictPath,
    neologd,
    doPatch,
  } = opts;

  createDirectorySync(CACHE_DIRECTORY);
  createDirectorySync(dictPath);

  console.log('Fetch: mecab-ipadic.zip');
  const origAllFiles = await downloadMecabIpadic({ cachePath: CACHE_DIRECTORY });
  const origDictFiles = origAllFiles.filter((file) => file.path.endsWith('.def') || file.path.endsWith('.csv'));

  // convert the encoding of the original ipadic files
  console.log('Recoding: mecab-ipadic');
  const recodeingTasks = origDictFiles.map((file) => eucjp2utf8(file, dictPath));
  await Promise.all(recodeingTasks);

  let neologdAllFiles = null;
  if (neologd || doPatch) {
    console.log('Fetch: mecab-ipadic-neologd.zip');
    neologdAllFiles = await downloadMecabIpadicNeologd({ cachePath: CACHE_DIRECTORY });
  }

  if (doPatch) {
    // overwrite unk.def
    console.log('Overwrite: unk.def');
    const neologdUnkDef = neologdAllFiles.find((file) => file.path === 'misc/dic/unk.def');
    neologdUnkDef.path = neologdUnkDef.path.replace(/^misc\/dic\//, '');
    await writeToFile(neologdUnkDef, dictPath);

    const neologdDiffFiles = neologdAllFiles
      .filter((file) => file.path.startsWith('misc/patch') && file.path.endsWith('.diff'))
      .sort((a, b) => {
        // sort the diff file by date asc, there are multiple diff for a single targe
        const ap = a.path;
        const bp = b.path;
        if (ap > bp) {
          return 1;
        }
        if (ap < bp) {
          return -1;
        }
        return 0;
      });

    const diffTasks = neologdDiffFiles.map((file) => {
      file.path = file.path.replace(/^misc\/patch\//, '');
      return patchFile(file, dictPath);
    });

    await Promise.all(diffTasks);
  }

  if (neologd) {
    const neologdDictFiles = neologdAllFiles.filter((file) => file.path.startsWith('seed/'));

    // decompress xz file in seeds folder
    console.log('Decompress ipadic neologd seed data');
    const decompressTasks = neologdDictFiles.map((file) => {
      const nfile = {
        ...file,
        path: file.path.replace(/^seed\//, '').replace(/\.xz$/, ''),
      };
      return unxz(nfile, dictPath);
    });
    await Promise.all(decompressTasks);
  }

  console.log('Done.');
};
