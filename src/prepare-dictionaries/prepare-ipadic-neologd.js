const {
  CACHE_DIRECTORY,
  UNPACK_DIRECTORY,
  downloadDict,
  writeToFile,
  patchFile,
  unxz,
} = require('./utils');

const prepareIPADIC = require('./prepare-ipadic');

module.exports = async (options = {}) => {
  const { patchOnly } = options;

  await prepareIPADIC();
  const neologdAllFiles = await downloadDict({ dict: 'ipadic-neologd', cachePath: CACHE_DIRECTORY });

  // patching
  // overwrite unk.def
  console.log('Overwrite: unk.def');
  const neologdUnkDef = neologdAllFiles.find((file) => file.path === 'misc/dic/unk.def');
  neologdUnkDef.path = neologdUnkDef.path.replace(/^misc\/dic\//, '');
  await writeToFile(neologdUnkDef, UNPACK_DIRECTORY);

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

  const diffTasks = neologdDiffFiles.map((f) => {
    f.path = f.path.replace(/^misc\/patch\//, '');
    return patchFile(f, UNPACK_DIRECTORY);
  });

  await Promise.all(diffTasks);

  if (patchOnly) {
    return;
  }

  // decompress xz file in seeds folder
  const neologdDictFiles = neologdAllFiles.filter((file) => file.path.startsWith('seed/'));
  console.log('Decompress ipadic neologd seed data');
  const decompressTasks = neologdDictFiles.map((file) => {
    const nfile = {
      ...file,
      path: file.path.replace(/^seed\//, '').replace(/\.xz$/, ''),
    };
    return unxz(nfile, UNPACK_DIRECTORY);
  });
  await Promise.all(decompressTasks);
};
