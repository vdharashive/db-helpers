const hasher = require('node-object-hash');
const {startUpdater, cache} = require('./cache-manager');
const CacheItem = require('./cache-item');
const hashSha1 = hasher({alg: 'sha1'});

let originalPromise = null;

function augment(pp, fnName) {
  const fetch = pp[fnName];
  pp[fnName] = async function(...args) {
    if (args[0].trim().toUpperCase().startsWith('SELECT')) {
      const sha1 = hashSha1.hash(args);
      let item = cache[sha1];
      if (!item) {
        item = new CacheItem(sha1, pp, fetch, args);
        await item.refresh();
        cache[sha1] = item;
        startUpdater();
      }

      return item.val;
    }
    else {
      return await fetch.apply(pp, args);
    }
  };
}

/**
 * Activate caching of results of all SELECT queries
 * @param {*} pool
 */
function activate(pool) {
  originalPromise = pool.promise;
  pool.promise = function() {
    const pp = originalPromise.apply(pool, arguments);
    ['execute', 'query'].forEach(function(fnName) {
      augment(pp, fnName);
    });
    return pp;
  };
}

/**
 * Deactivate caching of results of all SELECT queries
 * @param {*} pool
 */
function deactivate(pool) {
  pool.promise = originalPromise;
  delete process.env.JAMBONES_MYSQL_REFRESH_TTL;
}

module.exports = {
  activate,
  deactivate
};


