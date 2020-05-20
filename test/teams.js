const test = require('tape').test ;
const config = require('config');
const mysqlOpts = config.get('mysql');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

test('ms teams tests', async(t) => {
  const fn = require('..');
  const {lookupTeamsByAccount} = fn(mysqlOpts);
  try {
    const obj = await lookupTeamsByAccount('422affb5-4d1e-45e8-b2a4-2623f08b95ef');
    t.ok(obj.ms_teams_fqdn === 'customers.drachtio.org' && obj.tenant_fqdn === 'daveh.customers.drachtio.org', 'looked up ms teams fqdns for account');

    t.end();
  }
  catch (err) {
    t.end(err);
  }
});

