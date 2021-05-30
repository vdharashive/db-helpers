const test = require('tape').test ;
const config = require('config');
const mysqlOpts = config.get('mysql');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

test('add sbc address tests', async(t) => {
  const fn = require('..');
  const {addSbcAddress, addSmppAddress} = fn(mysqlOpts);
  try {
    await addSbcAddress('3.3.3.3');
    t.pass('added sbc address');

    await addSbcAddress('3.3.3.3');
    t.pass('no need to add if it exists');

    await addSmppAddress('3.3.3.3');
    t.pass('added smpp address');

    await addSmppAddress('3.3.3.3');
    t.pass('no need to add if it exists');

    t.end();
  }
  catch (err) {
    t.end(err);
  }
});

