const sqlAccount = `
SELECT sg.smpp_gateway_sid, sg.voip_carrier_sid, sg.ipv4, sg.port, sg.is_primary, sg.use_tls,  
vc.name 
FROM smpp_gateways sg, voip_carriers vc
WHERE sg.voip_carrier_sid = vc.voip_carrier_sid
AND vc.is_active = 1 
AND vc.account_sid = ? 
ORDER BY sg.is_primary DESC
`;
const sqlServiceProvider = `
SELECT sg.smpp_gateway_sid, sg.voip_carrier_sid, sg.ipv4, sg.port, sg.is_primary, sg.use_tls,  
vc.name 
FROM smpp_gateways sg, voip_carriers vc
WHERE sg.voip_carrier_sid = vc.voip_carrier_sid
AND vc.is_active = 1 
AND vc.service_provider_sid = ? 
ORDER BY sg.is_primary DESC
`;

/**
 * Lookup the smpp gateways for an account or service_provider
 * @param {*} pool
 * @param {*} logger
 */
async function lookupSmppGateways(pool, logger, service_provider_sid, account_sid) {
  const pp = pool.promise();
  if (service_provider_sid) {
    const [r] = await pp.execute({sql: sqlServiceProvider, nestTables: true}, [service_provider_sid]);
    return r;
  }
  const [r] = await pp.execute({sql: sqlAccount, nestTables: true}, [account_sid]);
  return r;
}

module.exports = lookupSmppGateways;
