const fs = require('fs');
const DictionaryReader = require('./DictionaryReader');
const SequentialDictionariesReader = require('./SequentialDictionariesReader');
const prepareDictionaries = require('./prepare-dictionaries');

const DEFAULT_MECAB_IPADIC_DIRECTORY = 'dict';

/**
 * IPADic
 */
module.exports = class IPADic {
  /**
   * @constructor
   */
  constructor(dictBase) {
    this.dictBase = dictBase || DEFAULT_MECAB_IPADIC_DIRECTORY;
    this.costMatrixDefinition = new DictionaryReader(this.dictBase, 'matrix.def');
    this.characterDefinition = new DictionaryReader(this.dictBase, 'char.def');
    this.unknownWordDefinition = new DictionaryReader(this.dictBase, 'unk.def');

    const readers = fs.readdirSync(this.dictBase).filter((filename) => {
      return /\.csv$/.test(filename);
    }).map((filename) => {
      return new DictionaryReader(this.dictBase, filename);
    });
    this.tokenInfoDictionaries = new SequentialDictionariesReader(readers);
  }

  /**
   * Read cost matrix definition (matrix.def)
   * @param {function(line: string)} callback Line-by-line callback function
   * @returns {Promise} Promise which is resolved when reading completed
   */
  readMatrixDef(callback) {
    return this.costMatrixDefinition.read(callback);
  }

  /**
   * Read character definition (char.def)
   * @param {function(line: string)} callback Line-by-line callback function
   * @returns {Promise} Promise which is resolved when reading completed
   */
  readCharDef(callback) {
    return this.characterDefinition.read(callback);
  }

  /**
   * Read unknown word definition (unk.def)
   * @param {function(line: string)} callback Line-by-line callback function
   * @returns {Promise} Promise which is resolved when reading completed
   */
  readUnkDef(callback) {
    return this.unknownWordDefinition.read(callback);
  }

  /**
   * Read token info dictionaries (*.csv) sequentially by filename
   * @param {function(line: string)} callback Line-by-line callback function
   * @returns {Promise} Promise which is resolved when reading completed
   */
  readTokenInfo(callback) {
    return this.tokenInfoDictionaries.read(callback);
  }

  static prepareDictionaries(options) {
    return prepareDictionaries({
      dictPath: DEFAULT_MECAB_IPADIC_DIRECTORY,
      ...options,
    });
  }
};
