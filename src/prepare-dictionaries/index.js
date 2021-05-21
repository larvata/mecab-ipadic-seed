const {
  createDirectorySync,
  cleanDirectorySync,
  UNPACK_DIRECTORY,
} = require('./utils');

const prepareIPADIC = require('./prepare-ipadic');
const prepareIPADICNeologd = require('./prepare-ipadic-neologd');
const prepareUnidicCWJ = require('./prepare-unidic-cwj');
const prepareUnidicCSJ = require('./prepare-unidic-csj');

const prepare = {
  ipadic: prepareIPADIC,
  'ipadic-neologd': prepareIPADICNeologd,
  'unidic-cwj': prepareUnidicCWJ,
  'unidic-csj': prepareUnidicCSJ,
};

module.exports = async (options) => {
  const {
    dict,
    dictPath,
  } = options;

  cleanDirectorySync(UNPACK_DIRECTORY);
  createDirectorySync(UNPACK_DIRECTORY);
  createDirectorySync(dictPath);

  await prepare[dict]();

  console.log('Done.');
};
