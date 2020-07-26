const fs = require('fs');
const path = require('path');

const ProxyAgent = require('proxy-agent');
const decompress = require('decompress');
const lzma = require('lzma-native');
const Diff = require('diff');
const { buffer } = require('request-compose');
const { Iconv } = require('iconv');

const DEFAULT_MECAB_IPADIC_URL = 'http://downloads.sourceforge.net/project/mecab/mecab-ipadic/2.7.0-20070801/mecab-ipadic-2.7.0-20070801.tar.gz';
const DEFAULT_MECAB_IPADIC_NEOLOGD_URL = 'https://github.com/neologd/mecab-ipadic-neologd/archive/master.zip';
const iconv = new Iconv('EUC-JP', 'UTF-8');

let agent = null;
if (process.env.http_proxy) {
  agent = new ProxyAgent(process.env.http_proxy);
}

function downloadAndExtract(options) {
  const { cachefile, cachePath } = options;
  const cacheFilePath = path.join(cachePath, cachefile);

  let bufferPromise = null;
  if (fs.existsSync(cacheFilePath)) {
    console.log('Loading from cache:', cachefile);
    // console.log('cachefile was found')
    bufferPromise = new Promise((resolve, reject) => {
      // cache file already exists
      fs.readFile(cacheFilePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  } else {
    console.log('Downloading:', cachefile);
    // console.log('cachefile not found')
    bufferPromise = buffer(options).then(({ body }) => {
      fs.writeFileSync(cacheFilePath, body);
      return body;
    });
  }

  return bufferPromise
    .then((body) => decompress(body, { strip: 1 }));
}

function downloadMecabIpadic(options = {}) {
  const url = process.env.MECAB_IPADIC_URL
    || DEFAULT_MECAB_IPADIC_URL;

  const downloadOptions = {
    url,
    agent,
    redirect: { max: 3 },
    cachefile: 'mecab-ipadic.cache.zip',
    ...options,
  };

  return downloadAndExtract(downloadOptions);
}

function downloadMecabIpadicNeologd(options = {}) {
  const url = process.env.MECAB_IPADIC_NEOLOGD_URL
    || DEFAULT_MECAB_IPADIC_NEOLOGD_URL;

  const downloadOptions = {
    url,
    agent,
    redirect: { max: 3 },
    cachefile: 'mecab-ipadic-neologd.cache.zip',
    ...options,
  };

  return downloadAndExtract(downloadOptions);
}

function eucjp2utf8(file, savePath) {
  return new Promise((resolve, reject) => {
    const fullpath = path.join(savePath, file.path);
    const utf8 = iconv.convert(file.data);
    fs.writeFile(fullpath, utf8, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

function unxz(file, savePath) {
  return new Promise((resolve, reject) => {
    const fullpath = path.join(savePath, file.path);
    lzma.decompress(file.data, (decompressed) => {
      fs.writeFile(fullpath, decompressed, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  });
}

function writeToFile(file, savePath) {
  return new Promise((resolve, reject) => {
    const fullpath = path.join(savePath, file.path);
    fs.writeFile(fullpath, file.data, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

function patchFile(file, savePath) {
  const target = file.path.replace(/(.*\.csv)\.\d+\.diff/, (_, p1) => p1);
  const targetFilePath = path.join(savePath, target);

  console.log('Apply:', file.path);
  const orig = fs.readFileSync(targetFilePath, 'utf8');
  const result = Diff.applyPatch(orig, file.data.toString());
  fs.writeFileSync(targetFilePath, result);
}

function createDirectorySync(dpath) {
  if (!fs.existsSync(dpath)) {
    fs.mkdirSync(dpath);
  }
}

module.exports = {
  downloadMecabIpadic,
  downloadMecabIpadicNeologd,
  eucjp2utf8,
  unxz,
  writeToFile,
  patchFile,
  createDirectorySync,
};
