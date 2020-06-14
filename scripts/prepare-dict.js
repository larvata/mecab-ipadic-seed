/* eslint-disable no-confusing-arrow */

const fs = require('fs');
const path = require('path');
const ProxyAgent = require('proxy-agent');
const decompress = require('decompress');
const iconv = require('iconv-lite');
const { buffer } = require('request-compose');
// const { stream } = require('./lib/compose');

const MECAB_IPADIC_URL = process.env.MECAB_IPADIC_URL
  || 'http://downloads.sourceforge.net/project/mecab/mecab-ipadic/2.7.0-20070801/mecab-ipadic-2.7.0-20070801.tar.gz';
const MECAB_IPADIC_DIRECTORY = 'dict';

if (!fs.existsSync(MECAB_IPADIC_DIRECTORY)) {
  fs.mkdirSync(MECAB_IPADIC_DIRECTORY);
}

let agent = null;
if (process.env.http_proxy) {
  agent = new ProxyAgent(process.env.http_proxy);
}

const downloadOptions = {
  url: MECAB_IPADIC_URL,
  agent,
  redirect: { max: 3 },
};

buffer(downloadOptions)
  .then(({ body }) => decompress(body, MECAB_IPADIC_DIRECTORY, { strip: 1 }))
  .then((files) => {
    // convert euc-jp to utf8
    const filtered = files.filter((file) => {
      // return file.path.endsWith('Adj.csv');
      return file.path.endsWith('.def') || file.path.endsWith('.csv');
    });

    const tasks = filtered.map((file) => {
      const fullpath = path.join(MECAB_IPADIC_DIRECTORY, file.path);
      return new Promise((resolve, reject) => {
        // const fsStream = fs.createWriteStream(fullpath);
        const eucjp = iconv.decode(file.data, 'eucjp');
        const utf8 = iconv.encode(eucjp, 'utf8');
        fs.writeFile(fullpath, utf8, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });

    return Promise.all(tasks);
  })
  .then(() => {
    console.log('mecab-ipadic has been downloaded and patched.');
  })
  .catch((err) => {
    console.log(err);
  });
