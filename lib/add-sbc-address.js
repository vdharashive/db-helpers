const debug = require('debug')('jambonz:db-helpers');
const { v4: uuid } = require('uuid');


const sql = `INSERT into sbc_addresses 
(sbc_address_sid, ipv4, last_updated) 
values (?, ?, NOW())`;

const updateSql = 'UPDATE sbc_addresses SET last_updated = NOW() WHERE sbc_address_sid = ?';

/**
 * Lookup the account by account_sid
 * @param {*} pool
 * @param {*} logger
 */
async function addSbcAddress(pool, logger, ipv4) {
  try {
    const pp = pool.promise();
    debug(`select with ${ipv4}`);
    const [r] = await pp.execute('SELECT * FROM sbc_addresses where ipv4 = ?', [ipv4]);
    debug(`results from searching for sbc address ${ipv4}: ${JSON.stringify(r)}`);
    if (r.length > 0) {
      const [r2] = await pp.execute(updateSql, [r[0].sbc_address_sid]);
      debug(`results from Updating sbc address ${ipv4}: ${JSON.stringify(r2)}`);
    } else {
      const [r2] = await pp.execute(sql, [uuid(), ipv4]);
      debug(`results from inserting sbc address ${ipv4}: ${JSON.stringify(r2)}`);
    }
  } catch (err) {
    debug(err);
    logger.error({err}, 'Error adding SBC address to the database');
  }
}

module.exports = addSbcAddress;
