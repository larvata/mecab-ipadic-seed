const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * MeCab seed dictionary reader
 */
module.exports = class DictionaryReader {
  /**
   * @constructor
   * @param {string} filename
   */
  constructor(dictBase, fileName) {
    this.filePath = path.join(dictBase, fileName);
  }

  /**
   * Read dictionary file
   * @param {function(line: string)} callback Line-by-line callback function
   * @returns {Promise} Promise which is resolved when reading completed
   */
  read(callback) {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: fs.createReadStream(this.filePath),
      });
      rl.on('line', (line) => {
        callback(line);
      });
      rl.on('close', () => {
        resolve();
      });
    });
  }
};
