(
  (
    {
      dns_broker
    } = pipy.solve('dns.js'),
    {
      setDNS,
      getDNS,
    } = pipy.solve('cache.js')
  ) => (

    pipy({
      _forward_dns: null
    })

      //
      // DNS server 
      //
      .listen(5300, { protocol: 'udp', transparent: true })
      .replaceMessage(
        (msg => (
          _forward_dns = false,
          (
            (
              dns,
              rc = -1,
              response = {}
            ) => (
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
                ),
                (rc === -1) && (response = getDNS(dns.question[0].type + '#' + dns.question[0].name)) && ( // read cache
                  response.id = dns.id,
                  response.question = [{
                    'name': dns.question[0].name,
                    'type': dns.question[0].type
                  }],
                  response.qr = response.rd = response.ra = response.aa = 1,
                  rc = 0
                )
              ),
              (rc != -1) ? (new Message(DNS.encode(response))) : (_forward_dns = true, msg)
            )
          )()
        ))
      )
      .branch(
        () => _forward_dns, $ => $
          .connect(() => '1.1.1.1:53', { protocol: 'udp' })
          .handleMessage(
            msg => (
              (
                dns = DNS.decode(msg.body)
              ) => (
                dns?.question?.[0]?.name && dns?.question?.[0]?.type && !dns?.rcode && ( // write cache
                  setDNS(dns.question[0].type + '#' + dns.question[0].name,
                    {
                      answer: dns.answer,
                      authority: dns.authority,
                      additional: dns.additional,
                    }
                  )
                )
              )
            )()
          ),
        $ => $
      )

  ))()