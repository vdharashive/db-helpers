const debug = require('debug')('jambonz:db-helpers');
const assert = require('assert');

const sqlRegex = 'SELECT regex, lcr_route_sid FROM lcr_routes ORDER BY priority ASC';
const sqlCarrierSet =
`SELECT lcs.voip_carrier_sid, vc.name, priority, workload
FROM lcr_carrier_set_entry lcs, voip_carriers vc
WHERE lcs.lcr_route_sid = ?
AND lcs.voip_carrier_sid = vc.voip_carrier_sid
ORDER by priority ASC`;
const sqlGateways =
`SELECT sg.voip_carrier_sid, sg.sip_gateway_sid, sg.ipv4, sg.port, vc.name, vc.e164_leading_plus, 
vc.requires_register, vc.register_username, vc.register_sip_realm, vc.register_password 
FROM sip_gateways sg, voip_carriers vc
WHERE is_active = 1
AND outbound = 1
AND sg.voip_carrier_sid = vc.voip_carrier_sid
AND sg.voip_carrier_sid IN (?)`;

async function performLcr(pool, logger, calledNumber) {
  const pp = pool.promise();
  const [r] = await pp.execute(sqlRegex);
  if (r.length === 0) {
    logger.debug('performLcr: lcr has not been configured, return random list of outbound gateways');
    debug('performLcr: lcr has not been configured, return random list of outbound gateways');
    return randomizeOutboundGateways(pool, logger, calledNumber);
  }
  // search for a matching regex
  const lcr_route = r.find((lcr) => RegExp(lcr.regex).test(calledNumber));
  if (!lcr_route) throw new Error('no matching lcr route');

  // retrieve the carriers configured for that route
  const [carriers] = await pp.execute(sqlCarrierSet, [lcr_route.lcr_route_sid]);
  const vcsids = carriers.map((o) => o.voip_carrier_sid);
  if (vcsids.length === 0) throw new Error('no configured gateways for lcr route');
  debug(`performLcr: voip_carrier_sids: ${JSON.stringify(vcsids)}`);

  // create a Map of carrier => [{ipv, port, e164_leading_plus}] outbound gateways
  const [r2] = await pp.query(sqlGateways, [vcsids]);
  const gwMap = new Map();
  r2.forEach((o) => {
    const vc_sid = o.voip_carrier_sid;
    const obj = {
      uri: `sip:${o.e164_leading_plus ? '+' : ''}${calledNumber}@${o.ipv4}:${o.port}`
    };
    if (o.requires_register) {
      Object.assign(obj, {
        auth: {
          username: o.register_username,
          password: o.register_password
        }
      });
    }

    if (!gwMap.has(vc_sid)) gwMap.set(vc_sid, []);
    gwMap.get(vc_sid).push(obj);
  });

  /*
    1. add gateways into each carrier row
    2. stratify into layers by priority
    3. reduce each layer into an ordered list of gateways, as a function of workload/distribution
    4. reduce all the layers into a final ordered list of gateways
  */
  const fnGatewayInsert = addGateways.bind(null, gwMap);
  const gateways = stratifyByPriority(carriers.map(fnGatewayInsert))
    .map(orderGatewaysByWorkload)
    .reduce(appendGateways, []);

  debug(`performLcr: final list of gateways for ${calledNumber}: ${JSON.stringify(gateways)}`);
  return gateways;
}

function addGateways(gwMap, obj) {
  obj.gateways = gwMap.get(obj.voip_carrier_sid);
  return obj;
}

function stratifyByPriority(carriers) {
  const layers = [];
  let priority = null;
  let start = 0;
  debug(`stratifyByPriority: input ${JSON.stringify(carriers)}`);
  carriers.forEach((c, idx) => {
    if (idx === 0) priority = c.priority;
    if (priority != c.priority) {
      layers.push(carriers.slice(start, idx));
      start = idx;
      priority = c.priority;
    }
  });
  layers.push(carriers.slice(start));
  debug(`stratifyByPriority: output ${JSON.stringify(layers)}`);
  return layers;
}

function orderGatewaysByWorkload(layer) {
  debug(`orderGatewaysByWorkload: input ${JSON.stringify(layer)}`);
  const total = layer.reduce((accum, c) => accum + c.workload, 0);

  // select one randomly based on desired workload
  const random = Math.random() * total;
  let mark = 0, selected = -1;
  const gateways = [];
  for (let i = 0; i < layer.length; i++) {
    if (selected === -1 && random <= (mark += layer[i].workload)) selected = i;
    else {
      gateways.push(layer[i].gateways);
    }
  }
  assert(selected >= 0);

  // put selected one at the front
  const result = [].concat(layer[selected].gateways, ...gateways);
  debug(`orderGatewaysByWorkload: output ${JSON.stringify(result)}`);
  return result;
}

function appendGateways(accum, arrGateways) {
  return accum.concat(arrGateways);
}

const sqlGatewaysAll =
`SELECT sg.voip_carrier_sid, sg.sip_gateway_sid, sg.ipv4, sg.port, vc.name, vc.e164_leading_plus,
vc.requires_register, vc.register_username, vc.register_sip_realm, vc.register_password 
FROM sip_gateways sg, voip_carriers vc
WHERE sg.is_active = 1
AND sg.voip_carrier_sid = vc.voip_carrier_sid
AND sg.outbound = 1`;

async function randomizeOutboundGateways(pool, logger, calledNumber) {
  const pp = pool.promise();
  const [r] = await pp.execute(sqlGatewaysAll);
  debug(`randomizeOutboundGateways: before shuffling: ${JSON.stringify(r)}`);
  const uris = shuffle(r.map((o) => {
    const obj = {
      uri: `sip:${o.e164_leading_plus ? '+' : ''}${calledNumber}@${o.ipv4}:${o.port}`,
    };
    if (o.register_username && o.register_password) {
      Object.assign(obj, {
        auth: {
          username: o.register_username,
          password: o.register_password
        }
      });
    }
    return obj;
  }));
  debug(`randomizeOutboundGateways: after shuffling: ${JSON.stringify(uris)}`);
  return uris;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

module.exports = performLcr;
