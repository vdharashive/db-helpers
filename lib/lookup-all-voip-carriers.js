const debug = require('debug')('jambonz:db-helpers');

const sql = 'SELECT * FROM voip_carriers';

/**
 * Lookup all voip_carriers
 * @param {*} pool
 * @param {*} logger
 * @param {*} sip_realm
 */
async function lookupAllVoipCarriers(pool, logger) {
  const pp = pool.promise();
  const [r] = await pp.execute(sql);
  debug(`results: ${JSON.stringify(r)}`);
  return r;
}

module.exports = lookupAllVoipCarriers;
