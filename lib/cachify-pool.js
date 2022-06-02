const debug = require('debug')('jambonz:db-helpers');
const hasher = require('node-object-hash');
const hashSha1 = hasher({alg: 'sha1'});

const cache = {};

function augment(pp, fnName) {
  const refresh = pp[fnName];
  pp[fnName] = async function() {
    const sha1 = hashSha1.hash(arguments);
    let val = cache[sha1];
    if (!val) {
      val = await refresh.apply(pp, arguments);
      cache[sha1] = val;
      setTimeout(function() {
        delete cache[sha1];
      }, parseInt(process.env.JAMBONES_MYSQL_REFRESH_TTL, 10) * 1000);

      debug(`cache: ${sha1}`, arguments);
    }
    return val;
  };
}

/**
 * Cache the results of all SELECT queries
 * @param {*} pool
 */
function cachify(pool) {
  const cachePromise = pool.promise;
  pool.promise = function() {
    const pp = cachePromise.apply(pool, arguments);
    ['execute', 'query'].forEach(function(fnName) {
      augment(pp, fnName);
    });
    return pp;
  };
}

module.exports = cachify;
