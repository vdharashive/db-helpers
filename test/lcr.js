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
    let gateways = await performLcr('4412838238238', 'ee9d7d49-b3e4-4fdb-9d66-661149f717e8');
    //console.log(`gateways: ${JSON.stringify(gateways)}`);
    t.ok(gateways[0].uri === 'sip:+4412838238238@3.3.3.3' || gateways[1].uri === 'sip:+4412838238238@3.3.3.3', 
      'uses lcr when regex matches');
    gateways = await performLcr('4412838238238', '5f190a4f-b997-4f04-b56e-03c627ea547d');
    //console.log(`gateways: ${JSON.stringify(gateways)}`);
    t.ok(!gateways, 'does not find carrier in other account');

    try {
      gateways = await performLcr('16172375089', 'ee9d7d49-b3e4-4fdb-9d66-661149f717e8');
      //console.log(`gateways: ${JSON.stringify(gateways)}`);
      t.fail('should throw on LCR route with no configured gateways')
    } catch (err) {
      //console.log(err);
      t.ok(err.message === 'no matching lcr route', 'throws when no matching lcr route');
    }

    // remove all lcr configuration
    let stdout = execSync(`mysql -h 127.0.0.1 -u root --protocol=tcp -D jambones_test -e "delete from lcr_carrier_set_entry"`);
    stdout = execSync(`mysql -h 127.0.0.1 -u root --protocol=tcp -D jambones_test -e "delete from lcr_routes"`);

    gateways = await performLcr('4412838238238', 'ee9d7d49-b3e4-4fdb-9d66-661149f717e8');
    //console.log(`gateways: ${JSON.stringify(gateways)}`);
    t.ok(gateways.length === 2, 'when lcr is not configured at all, return a randomly shuffled list of outbound gateways');

    // clear data and insert data with multiple carriers in same priority
    execSync(`mysql -h 127.0.0.1 -u root --protocol=tcp -D jambones_test < ${__dirname}/db/jambones-sql.sql`);
    execSync(`mysql -h 127.0.0.1 -u root --protocol=tcp -D jambones_test < ${__dirname}/db/populate-test-data2.sql`);

    gateways = await performLcr('4412838238238', 'ee9d7d49-b3e4-4fdb-9d66-661149f717e8');
    //console.log(`gateways: ${JSON.stringify(gateways)}`);
    t.ok(gateways.length === 8 && gateways[7].uri === 'sip:4412838238238@10.10.10.10', 'handles multiple carriers');

    t.end();
  }
  catch (err) {
    t.end(err);
  }
});

