const debug = require('debug')('jambonz:db-helpers');


/**
 * Clean the sbc address after long time no update
 * @param {*} pool
 * @param {*} logger
 * @param {*} ipv4 SBC IP Address
 */
async function cleanSbcAddresses(pool, logger) {
  try {
    const pp = pool.promise();
    const sql = `DELETE FROM sbc_addresses WHERE last_updated IS NULL OR
      last_updated < DATE_SUB(NOW(), INTERVAL 
      '${process.env.DEAD_SBC_IN_SECOND || 3600}' SECOND)`;
    const [r] = await pp.execute(sql);
    debug(`results from cleaning for sbc address ${JSON.stringify(r)}`);
  } catch (err) {
    debug(err);
    logger.error({err}, 'Error cleaning SBC address to the database');
  }
}

module.exports = cleanSbcAddresses;
