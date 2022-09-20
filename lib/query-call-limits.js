const sqlSelectServiceProviderLimits = `
SELECT quantity 
FROM service_provider_limits
WHERE service_provider_sid = ?
AND category = 'voice_call_session'`;

const sqlSelectAccountLimits = `
SELECT quantity 
FROM account_limits
WHERE account_sid = ?
AND category = 'voice_call_session'`;

const queryCallLimits = async(pool, logger, service_provider_sid, account_sid) => {
  const pp = pool.promise();
  const results = {account_limit: 0, sp_limit: 0};
  try {
    const [rows] = await pp.query(sqlSelectServiceProviderLimits, [service_provider_sid]);
    if (rows.length) results.sp_limit = rows[0].quantity;
    const [rows2] = await pp.query(sqlSelectAccountLimits, [account_sid]);
    if (rows2.length) results.account_limit = rows2[0].quantity;
  }
  catch (err) {
    console.log(err);
    logger.error({err}, 'Error querying call limits');
  }
  logger.debug({service_provider_sid, account_sid, results}, 'Call limits');
  return results;
};

module.exports = queryCallLimits;
