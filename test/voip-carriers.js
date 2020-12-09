const test = require('tape').test ;
const config = require('config');
const mysqlOpts = config.get('mysql');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

test('voip_carriers tests', async(t) => {
  const fn = require('..');
  const {lookupAllVoipCarriers} = fn(mysqlOpts);
  try {
    let carriers = await lookupAllVoipCarriers();
    //console.log(`carriers: ${JSON.stringify(carriers)}`);
    t.ok(carriers[0].register_username === 'janedoe', 'retrieves voip_carriers');

    t.end();
  }
  catch (err) {
    t.end(err);
  }
});

