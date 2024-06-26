const test = require('tape').test ;
const config = require('config');
const mysqlOpts = config.get('mysql');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});


test('system_information tests', async(t) => {
  const fn = require('..');
  const {
    lookupSystemInformation
  } = fn(mysqlOpts);
  try {
    let info = await lookupSystemInformation();
    console.log({info});
    t.ok(info.length === 1 && info[0].domain_name === 'jambonz.xyz', 'found system information');

    t.end();
  }
  catch (err) {
    t.end(err);
  }
});