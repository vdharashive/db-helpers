const test = require('tape').test ;
const config = require('config');
const mysqlOpts = config.get('mysql');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

test('account tests', async(t) => {
  const fn = require('..');
  const {lookupAccountBySid, lookupAccountBySipRealm} = fn(mysqlOpts);
  try {
    let account = await lookupAccountBySid('422affb5-4d1e-45e8-b2a4-2623f08b95ef');
    t.ok(account !== null, 'retrieves account by sid');

    account = await lookupAccountBySipRealm('sip.drachtio.org');
    t.ok(account !== null, 'retrieves account by sip realm');

    account = await lookupAccountBySipRealm('voxout.voxbone.com');
    t.ok(account === null, 'returns null for unknown sip realm');


    t.end();
  }
  catch (err) {
    t.end(err);
  }
});

