const debug = require('debug')('jambonz:db-helpers');

const cache = {};
let timerID = null;

function startUpdater() {
  // debug('cache: maybe update', { timerID, envVar: process.env.JAMBONES_MYSQL_REFRESH_TTL });

  if (timerID === null) {
    debug('cache: updating');
    const ttl = parseInt(process.env.JAMBONES_MYSQL_REFRESH_TTL || '0.001', 10) * 1000;

    console.log('TTL', ttl);

    timerID = setTimeout(function() {
      console.log('increment');

      const promises = Object.keys(cache).reduce(function(arr, sha1) {
        const item = cache[sha1];
        const delta = new Date() - item.lastAccess;

        debug(`cache: item delta ${ sha1 }`, { ttl, delta });

        if (delta > ttl) {
          debug(`cache: item purged ${ sha1 }`, { ttl, delta });
          delete cache[sha1];
        }
        else {
          arr.push(item.refresh());
        }

        return arr;
      }, []);

      Promise.all(promises).then(function() {
        timerID = null;

        const keys = Object.keys(cache);
        if (keys.length > 0)
          startUpdater();

        debug('cache: items updated', keys.map((sha1) => ({ sha1, lastAccess: cache[sha1].lastAccess })));

        console.log('X increment');

        return;
      }).catch(function(err) {
        debug('cache: error', err);
      });
    }, ttl);
  }
}

module.exports = {
  cache,
  startUpdater
};
