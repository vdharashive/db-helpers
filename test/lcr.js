const test = require('tape').test ;
const config = require('config');
const mysqlOpts = config.get('mysql');
const {execSync} = require('child_process');
const pwd = process.env.TRAVIS ? '' : '-p$MYSQL_ROOT_PASSWORD';

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

test('lcr tests', async(t) => {
  const fn = require('..');
  const {performLcr} = fn(mysqlOpts);
  try {
    let gateways = await performLcr('4412838238238');
    //console.log(`gateways: ${JSON.stringify(gateways)}`);
    t.ok(gateways[0] === 'sip:+4412838238238@3.3.3.3:5060', 'uses lcr when regex matches');

    try {
      gateways = await performLcr('16172375089');
      t.fail('should throw on LCR route with no configured gateways')
    } catch (err) {
      t.ok(err.message === 'no configured gateways for lcr route', 'throws when no configured gateways for lcr route');
    }

    try {
      carriers = await performLcr('3383904905');
      t.fail('should throw on no match');
    }
    catch (err) {
      t.ok(err.message === 'no matching lcr route', 'throws \'no matching lcr route\' when called number does not match anything');
    }

    // remove all lcr configuration
    let stdout = execSync(`mysql -h localhost -u root ${pwd} -D jambones_test -e "delete from lcr_carrier_set_entry"`);
    stdout = execSync(`mysql -h localhost -u root ${pwd} -D jambones_test -e "delete from lcr_routes"`);

    gateways = await performLcr('4412838238238');
    //console.log(`gateways: ${JSON.stringify(gateways)}`);
    t.ok(gateways.length === 2, 'when lcr is not configured at all, return a randomly shuffled list of outbound gateways');

    // clear data and insert data with multiple carriers in same priority
    execSync(`mysql -h localhost -u root ${pwd} -D jambones_test < ${__dirname}/db/jambones-sql.sql`);
    execSync(`mysql -h localhost -u root ${pwd} -D jambones_test < ${__dirname}/db/populate-test-data2.sql`);

    gateways = await performLcr('4412838238238');
    //console.log(`gateways: ${JSON.stringify(gateways)}`);
    t.ok(gateways.length === 8 && gateways[7] === 'sip:4412838238238@10.10.10.10:5060', 'handles multiple carriers');

    t.end();
  }
  catch (err) {
    t.end(err);
  }
});

