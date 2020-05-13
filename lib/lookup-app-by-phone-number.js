const debug = require('debug')('jambonz:db-helpers');

const sql =
`SELECT *
FROM applications app
LEFT JOIN webhooks AS ch ON app.call_hook_sid = ch.webhook_sid
LEFT JOIN webhooks AS sh ON app.call_status_hook_sid = sh.webhook_sid
WHERE app.application_sid = (SELECT application_sid from phone_numbers where number = ?)`;

const sqlCallRoutes =
`SELECT cr.regex, cr.application_sid
FROM call_routes cr, phone_numbers ph
WHERE ph.number = ?
AND ph.account_sid = cr.account_sid
ORDER BY cr.priority ASC
`;

/**
 * Lookup the application which should be invoked when a call arrives on a phone number
 * @param {*} pool
 * @param {*} logger
 * @param {*} phoneNumber - phone number that was dialed
 */
async function lookupAppByPhoneNumber(pool, logger, phoneNumber) {
  const pp = pool.promise();

  // first see if the phone number is directly assigned to an app
  const [r] = await pp.execute({sql, nestTables: true}, [phoneNumber]);
  debug(`results from querying phone_numbers for application: ${JSON.stringify(r)}`);
  if (r.length > 0) {
    const obj = r[0].app;
    Object.assign(obj, {call_hook: r[0].ch, call_status_hook: r[0].sh});
    if (!obj.call_hook.url) delete obj.call_hook;
    if (!obj.call_status_hook.url) delete obj.call_status_hook;
    //console.log(`retrieved application: ${JSON.stringify(obj)}`);
    return obj;
  }

  // if not, check the regex patterns that have been set up
  // for the account that owns the phone number
  const [callRoutes] = await pp.execute(sqlCallRoutes, [phoneNumber]);
  const selectedRoute = callRoutes.find((cr) => RegExp(cr.RegExp).test(phoneNumber));
  if (!selectedRoute) return null;

  const lookupAppBySid = require('./lookup-app-by-sid').bind(null, pool, logger);
  return await lookupAppBySid(selectedRoute.application_sid);
}

module.exports = lookupAppByPhoneNumber;
