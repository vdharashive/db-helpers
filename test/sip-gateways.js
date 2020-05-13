const test = require('tape').test ;
const config = require('config');
const mysqlOpts = config.get('mysql');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

test('sip gateways tests', async(t) => {
  const fn = require('..');
  const {lookupSipGatewayBySignalingAddress} = fn(mysqlOpts);
  try {
    let gateway = await lookupSipGatewayBySignalingAddress('3.3.3.3', 5060);
    //console.log(`gateway: ${JSON.stringify(gateway)}`);
    t.ok(gateway.sip_gateway_sid === '124a5339-c62c-4075-9e19-f4de70a96597', 'retrieves sip gateway with default port');

    gateway = await lookupSipGatewayBySignalingAddress('3.3.3.3', 5062);
    //console.log(`gateway: ${JSON.stringify(gateway)}`);
    t.ok(gateway.sip_gateway_sid === 'efbc4830-57cd-4c78-a56f-d64fdf210fe8', 'retrieves sip gateway with non-default port');

    gateway = await lookupSipGatewayBySignalingAddress('3.3.3.4', 5062);
    //console.log(`gateway: ${JSON.stringify(gateway)}`);
    t.ok(gateway === null, 'returns null when gateway not found');

    t.end();
  }
  catch (err) {
    t.end(err);
  }
});

