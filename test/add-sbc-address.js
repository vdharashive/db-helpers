const test = require('tape').test ;
const config = require('config');
const mysqlOpts = config.get('mysql');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

test('add sbc address tests', async(t) => {
  const fn = require('..');
  const {addSbcAddress, addSmppAddress, lookUpSbcAddressesbyIpv4, cleanSbcAddresses} = fn(mysqlOpts);
  try {
    await addSbcAddress('3.3.3.3');
    t.pass('added sbc address');
    const first = await lookUpSbcAddressesbyIpv4('3.3.3.3')

    await new Promise(resolve => setTimeout(resolve, 1000));
    await addSbcAddress('3.3.3.3');
    t.pass('no need to add if it exists');
    const readd = await lookUpSbcAddressesbyIpv4('3.3.3.3')
    t.ok(readd[0].last_updated > first[0].last_updated, "last_updated is updated");

    process.env.DEAD_SBC_IN_SECOND = 1;
    await new Promise(resolve => setTimeout(resolve, 2000));
    await cleanSbcAddresses();
    const cleanSbc = await lookUpSbcAddressesbyIpv4('3.3.3.3');
    t.ok(cleanSbc.length == 0, "Successfully clean up SBC address");
    process.env.DEAD_SBC_IN_SECOND = null;

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

