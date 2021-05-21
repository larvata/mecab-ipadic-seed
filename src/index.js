const { DICT, UNPACK_DIRECTORY } = require('./prepare-dictionaries/utils');
const DictionaryPrepare = require('./prepare-dictionaries');
const MecabDictionaryReader = require('./IPADic');

const SUPPORTED_DICTIONARIES = DICT.map((d) => d.key);

module.exports = {
  DictionaryPrepare,
  MecabDictionaryReader,
  SUPPORTED_DICTIONARIES,
  UNPACK_DIRECTORY,
};
