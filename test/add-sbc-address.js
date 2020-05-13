const test = require('tape').test ;
const config = require('config');
const mysqlOpts = config.get('mysql');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

test('add sbc address tests', async(t) => {
  const fn = require('..');
  const {addSbcAddress} = fn(mysqlOpts);
  try {
    await addSbcAddress('3.3.3.3');
    t.pass('added sbc address');

    await addSbcAddress('3.3.3.3');
    t.pass('no need to add if it exists');

    t.end();
  }
  catch (err) {
    t.end(err);
  }
});

