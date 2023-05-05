const mysql = require('mysql2');
const cacheActivator = require('./lib/cache-activator');

const pingDb = async(pool) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) return reject(err);
      conn.ping((err) => {
        pool.releaseConnection(conn);
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

module.exports = function(mysqlConfig, logger) {
  const pool = mysql.createPool(mysqlConfig);

  if (process.env.JAMBONES_MYSQL_REFRESH_TTL)
    cacheActivator.activate(pool);

  logger = logger || {info: () => {}, error: () => {}, debug: () => {}};
  pool.getConnection((err, conn) => {
    if (err) throw err;
    conn.ping((err) => {
      if (err) return logger.error(err, `Error pinging mysql at ${JSON.stringify(mysqlConfig)}`);
    });
  });

  return {
    pool,
    ping: pingDb.bind(null, pool),
    lookupAuthHook: require('./lib/lookup-auth-hook').bind(null, pool, logger),
    lookupSipGatewayBySignalingAddress:
      require('./lib/lookup-sip-gateway-by-signaling-address').bind(null, pool, logger),
    performLcr: require('./lib/perform-lcr').bind(null, pool, logger),
    lookupAppByPhoneNumber: require('./lib/lookup-app-by-phone-number').bind(null, pool, logger),
    lookupAppByRegex: require('./lib/lookup-app-by-regex').bind(null, pool, logger),
    lookupAppBySid: require('./lib/lookup-app-by-sid').bind(null, pool, logger),
    lookupAppByRealm: require('./lib/lookup-app-by-realm').bind(null, pool, logger),
    lookupAppByTeamsTenant: require('./lib/lookup-app-by-teams-tenant').bind(null, pool, logger),
    lookupAccountBySid: require('./lib/lookup-account-by-sid').bind(null, pool, logger),
    lookupAccountBySipRealm: require('./lib/lookup-account-by-sip-realm').bind(null, pool, logger),
    lookupAccountByPhoneNumber: require('./lib/lookup-account-by-phone-number').bind(null, pool, logger),
    lookupAccountCapacitiesBySid: require('./lib/lookup-account-capacities-by-sid').bind(null, pool, logger),
    addSbcAddress: require('./lib/add-sbc-address').bind(null, pool, logger),
    lookUpSbcAddressesbyIpv4: require('./lib/lookup-sbc-address-by-ipv4').bind(null, pool, logger),
    cleanSbcAddresses: require('./lib/clean-sbc-addresses').bind(null, pool, logger),
    addSmppAddress: require('./lib/add-smpp-address').bind(null, pool, logger),
    lookupAllTeamsFQDNs: require('./lib/lookup-all-teams-fqdns').bind(null, pool, logger),
    lookupTeamsByAccount: require('./lib/lookup-teams-by-account').bind(null, pool, logger),
    lookupAllVoipCarriers: require('./lib/lookup-all-voip-carriers').bind(null, pool, logger),
    lookupCarrierBySid: require('./lib/lookup-carrier-by-sid').bind(null, pool, logger),
    lookupSipGatewayBySid: require('./lib/lookup-sip-gateway-by-sid').bind(null, pool, logger),
    lookupSipGatewaysByCarrier: require('./lib/lookup-sip-gateways-by-carrier').bind(null, pool, logger),
    lookupSmppGatewayBySid: require('./lib/lookup-smpp-gateway-by-sid').bind(null, pool, logger),
    lookupSmppGateways: require('./lib/lookup-smpp-gateways').bind(null, pool, logger),
    lookupSmppGatewaysByBindCredentials:
      require('./lib/lookup-smpp-gateways-by-bind-credentials').bind(null, pool, logger),
    queryCallLimits: require('./lib/query-call-limits').bind(null, pool, logger),
    updateVoipCarriersRegisterStatus: require('./lib/update-carrier-register-status-by-sid').bind(null, pool, logger),
    lookupCarrierByAccountLcr: require('./lib/lookup-carrier-by-account-lcr').bind(null, pool, logger)
  };
};
