const debug = require('debug')('jambonz:db-helpers');


const sql = 'UPDATE voip_carriers SET register_status = ?';

/**
 * Update voip_carriers register status
 * @param {*} pool
 * @param {*} logger
 * @param {*} value a json {status: 'fail', reason: '408 timeout'}
 */
async function updateVoipCarriersRegisterStatus(pool, logger, value) {
  try {
    await pool.execute(sql, [JSON.stringify(value)]);
  } catch (err) {
    debug(err);
    logger.error({err}, 'Error updating Voip Carriers Register Status to the database');
  }
}

module.exports = updateVoipCarriersRegisterStatus;
