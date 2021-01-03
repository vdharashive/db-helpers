const debug = require('debug')('jambonz:db-helpers');

const sql =
`SELECT *
FROM sip_gateways
WHERE sip_gateway_sid = ?`;

/**
 * Lookup the sip_gateway by sid
 * @param {*} pool
 * @param {*} logger
 */
async function lookupSipGatewayBySid(pool, logger, sid) {
  const pp = pool.promise();
  const [r] = await pp.execute(sql, [sid]);
  debug(`results: ${JSON.stringify(r)}`);
  if (r.length > 0) {
    return r[0];
  }
  return null;
}

module.exports = lookupSipGatewayBySid;
