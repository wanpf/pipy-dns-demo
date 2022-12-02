(
  (
    config = JSON.decode(pipy.load('config.json')),
    global
  ) => (

    global = {
      dnsServers: { primary: config?.Spec?.LocalDNSProxy?.UpstreamDNSServers?.Primary, secondary: config?.Spec?.LocalDNSProxy?.UpstreamDNSServers?.Secondary },
      dnsSvcAddress: null,
      dnsRecordSets: {},
    },

    global.dnsSvcAddress = (global.dnsServers?.primary || global.dnsServers?.secondary || os.env.LOCAL_DNS_PROXY_PRIMARY_UPSTREAM || '10.96.0.10') + ":53",

    config?.DNSResolveDB && (
      Object.entries(config.DNSResolveDB).map(
        ([k, v]) => (
          ((rr) => (
            rr = [],
            v.map(
              ip => (
                rr.push({
                  'name': k,
                  'type': 'A',
                  'ttl': 600, // TTL : 10 minutes
                  'rdata': ip
                })
              )
            ),
            global.dnsRecordSets[k.toLowerCase()] = rr
          ))()
        )
      )
    ),

    global
  )
  
)()