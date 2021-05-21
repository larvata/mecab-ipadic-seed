const prepareUnidicCWJ = require('./prepare-unidic-cwj');

module.exports = async (options) => {
  await prepareUnidicCWJ({ dict: 'unidic-csj' });
};
