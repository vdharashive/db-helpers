# jambonz-db-helpers ![Build Status](https://github.com/jambonz/jambonz-db-helpers/workflows/CI/badge.svg)


A set of helper functions to access data in the [jambones database](https://github.com/jambonz/jambones-api-server/blob/master/db/jambones-sql.sql).

This module exposes a function that should be called with mysql [configuration options](https://www.npmjs.com/package/mysql#connection-options) and, optionally, a [pino](https://www.npmjs.com/package/pino) logger function.  It then returns an object containing various useful functions for accessing and updating the database.

```
const mySqlOpts = {
  "host": "localhost",
  "user": "jambones_test",
  "database": "jambones_test",
  "password": "jambones_test"
};
const logger = require('pino')();
const {lookupAuthHook} = require('jambonz-db-helpers')(mySqlOpts, logger);
// now invoke lookupAuthHook per below
```

### Functions

- [lookupAuthHook](#lookupAuthHook) - retrieves the http authentication callback for a given sip realm/domain
- [lookupSipGatewayBySignalingAddress](#lookupSipGatewayBySignalingAddress) - retrieves the sip gateway associated with a given ipv4 dot-decimal address and sip port
- [performLcr](#performLcr) - given a called number returns a preference-ordered list of carriers to use to complete the call

#### lookupAuthHook
`lookupAuthHook(sip_realm) returns Promise`

Retrieves the http authentication callback info for a given sip realm/domain, or null if no information is found for that domain.

HTTP authentication callbacks are configured in the `accounts` table (`accounts.sip_realm`).  Furthermore if no exact match is found in the accounts table for a given sip realm, then a callback can be configured for the root domain in the `service_providers.root_domain` column.  

This function is used by telephony apps that need to challenge incoming SIP requests, and therefore need to select the correct customer callback hook to delegate authentication to.
```
const obj = await lookupAuthHook('sip.example.com');
if (obj) {
  console.dir(obj);
  // {url: 'http://mycallback.com:3000, auth: {username: 'foo', password: 'bar}}
  // where obj.url is the callback url
  // and obj.auth is optional - if provided it means the url is protected using http basic auth
  // and the user/pass provided should be used when invoking it.
}
```

#### lookupSipGatewayBySignalingAddress
`lookupSipGatewayBySignalingAddress(ipv4, port) returns Promise`

Retrieves the sip gateway associated with a given ipv4 dot-decimal address and sip port.  The function returns a Promise that resolves to sip gateway object, or null if no gateway exists at that ip:port.
```
const gateway = await lookupSipGatewayBySignalingAddress('192.168.1.100', 5060);
if (!gateway) logger.info('no gateway found at that address/port');
```

#### performLcr
`performLcr(calledNumber) returns Promise throws Error if no match is found`

Selects an ordered list of carriers to use to complete a call to the specified number.  The function returns a Promise that resolves to an array of carriers.  

The function throws Error('no configured lcr routes') if the database has no configured lcr routes, and Error('no matching lcr route') if none of the configured routes match.
```
try {
  const carriers = await performLcr('44928300633');
} catch (err) {
  // handle no routes match or found at all here..
}
```



