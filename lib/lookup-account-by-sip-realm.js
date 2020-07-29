const debug = require('debug')('jambonz:db-helpers');

const sql =
`SELECT *
FROM accounts acc
LEFT JOIN webhooks AS rh ON acc.registration_hook_sid = rh.webhook_sid
WHERE acc.sip_realm = ?`;

/**
 * Lookup the account by sip_realm
 * @param {*} pool
 * @param {*} logger
 */
async function lookupAccountBySipRealm(pool, logger, realm) {
  const pp = pool.promise();
  const [r] = await pp.execute({sql, nestTables: true}, [realm]);
  debug(`results: ${JSON.stringify(r)}`);
  if (r.length > 0) {
    const obj = r[0].acc;
    Object.assign(obj, {registration_hook: r[0].rh});
    if (!obj.registration_hook.url) delete obj.registration_hook;
    logger.debug(`retrieved account: ${JSON.stringify(obj)}`);
    return obj;
  }
  return null;
}

module.exports = lookupAccountBySipRealm;
