const debug = require('debug')('jambonz:db-helpers');

const primarySql =
`SELECT *
FROM applications app
LEFT JOIN webhooks AS ch ON app.call_hook_sid = ch.webhook_sid
LEFT JOIN webhooks AS sh ON app.call_status_hook_sid = sh.webhook_sid
WHERE application_sid = (
  SELECT application_sid 
  FROM ms_teams_tenants
  WHERE tenant_fqdn = ?
)`;

const fallbackSql =
`SELECT *
FROM applications app
LEFT JOIN webhooks AS ch ON app.call_hook_sid = ch.webhook_sid
LEFT JOIN webhooks AS sh ON app.call_status_hook_sid = sh.webhook_sid
WHERE application_sid = (
  SELECT pn.application_sid 
  FROM ms_teams_tenants mt
  JOIN phone_numbers pn ON mt.account_sid = pn.account_sid
  WHERE mt.tenant_fqdn = ?
  AND pn.number = ?
  LIMIT 1
)`;

/**
 * Lookup the application by ms teams tenant
 * @param {*} pool
 * @param {*} logger
 * @param {*} sip_realm
 */
async function lookupAppByTeamsTenant(pool, logger, tenant_fqdn, dnis) {
  const pp = pool.promise();
  
  // Try direct lookup first
  let [r] = await pp.execute({sql: primarySql, nestTables: true}, [tenant_fqdn]);
  debug(`primary query results: ${JSON.stringify(r)}`);
  
  // If no results, try phone_numbers join as fallback with dnis
  if (r.length === 0) {
    debug('direct lookup returned no results, trying phone_numbers lookup');
    [r] = await pp.execute({sql: fallbackSql, nestTables: true}, [tenant_fqdn, dnis]);
    debug(`fallback query results: ${JSON.stringify(r)}`);
  }

  if (r.length > 0) {
    const obj = r[0].app;
    Object.assign(obj, {call_hook: r[0].ch, call_status_hook: r[0].sh});
    if (!obj.call_hook.url) delete obj.call_hook;
    if (!obj.call_status_hook.url) delete obj.call_status_hook;
    debug(`retrieved application: ${JSON.stringify(obj)}`);
    return obj;
  }
  return null;
}

module.exports = lookupAppByTeamsTenant;
