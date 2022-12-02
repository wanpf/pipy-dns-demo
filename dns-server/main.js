(({
  dns_broker
} = pipy.solve('dns.js')) => (

  pipy({
    forward_dns: null
  })

    //
    // DNS server 
    //
    .listen(5300, { protocol: 'udp', transparent: true })
    .replaceMessage(
      (msg => (
        forward_dns = false,
        ((dns, rc = -1, response = {}) => (
          dns = DNS.decode(msg.body),
          dns?.question?.[0]?.name && dns?.question?.[0]?.type && (
            response.answer = [],
            response.authority = [],
            response.additional = [],
            rc = dns_broker.query_data(dns.question[0].name, dns.question[0].type,
              response.answer, response.authority, response.additional),
            (rc != -1) && (
              response.id = dns.id,
              response.question = [{
                'name': dns.question[0].name,
                'type': dns.question[0].type
              }],
              response.qr = response.rd = response.ra = response.aa = 1,
              response.rcode = rc
            )
          ),
          (rc != -1) ? (new Message(DNS.encode(response))) : (forward_dns = true, msg)
        ))()
      ))
    )
    .branch(
      () => forward_dns, $ => $
        .connect(() => '1.1.1.1:53', { protocol: 'udp' }),
      $ => $
    )

))()