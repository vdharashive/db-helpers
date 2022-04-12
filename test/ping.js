const test = require('tape').test ;
const config = require('config');
const mysqlOpts = config.get('mysql');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

test('ping test', async(t) => {
  const fn = require('..');
  const {ping} = fn(mysqlOpts);
  try {
    await ping();
    t.pass('pinged mysql successfully');
    t.end();
  }
  catch (err) {
    t.end(err);
  }
});

