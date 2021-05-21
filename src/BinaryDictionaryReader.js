const fs = require('fs');
const path = require('path');

// TODO inherit from DictionaryReader
module.exports = class BinaryDictionaryReader {
  constructor(dictBase, fileName) {
    this.filePath = path.join(dictBase, fileName);
  }

  read(callback) {
    return new Promise((resolve, reject) => {
      /* eslint-disable camelcase */
      fs.readFile(this.filePath, (err, buffer) => {
        if (err) {
          return reject(err);
        }

        const COST_SIZE = 2;
        const COST_START = 4;

        // read file header
        const forward_dimension_max = buffer.readUInt16LE(0);
        const backward_dimension_max = buffer.readUInt16LE(2);
        callback([forward_dimension_max, backward_dimension_max]);

        // read file content
        let forward_dimension = 0;
        let backward_dimension = 0;
        while (
          forward_dimension < forward_dimension_max
          && backward_dimension < backward_dimension_max) {
          const cursor = (
            forward_dimension
            + backward_dimension * forward_dimension_max
          ) * COST_SIZE + COST_START;

          const cost = buffer.readInt16LE(cursor);
          callback([forward_dimension, backward_dimension, cost]);

          backward_dimension += 1;
          if (backward_dimension > backward_dimension_max) {
            backward_dimension = 0;
            forward_dimension += 1;
          }
        }
        return resolve();
      });
    });
  }
};
