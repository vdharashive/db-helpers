const debug = require('debug')('jambonz:db-helpers');

const sql =
`SELECT *
FROM account_capacities 
WHERE account_sid = ? 
AND (effective_end_date IS NULL OR effective_end_date > CURDATE() ) 
ORDER BY effective_start_date ASC`;

async function lookupAccountSettingsBySid(pool, logger, account_sid) {
  const pp = pool.promise();
  const [r] = await pp.query(sql, account_sid);
  debug(`results: ${JSON.stringify(r)}`);
  if (r.length > 0) {
    return r[0];
  }
  return null;
}

module.exports = lookupAccountSettingsBySid;
