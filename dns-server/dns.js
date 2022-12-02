(
  (
    config = JSON.decode(pipy.load('dns.json')),
    dns,
    global = {}
  ) => (

    dns = {
      code: {
        // DNS Query completed successfully
        'NOERROR': 0,
        // DNS Query Format Error
        'FORMERR': 1,
        // Server failed to complete the DNS request
        'SERVFAIL': 2,
        // Domain name does not exist.  
        'NXDOMAIN': 3,
        // Function not implemented
        'NOTIMP': 4,
        // The server refused to answer for the query
        'REFUSED': 5,
        // Name that should not exist, does exist
        'YXDOMAIN': 6,
        // RRset that should not exist, does exist
        'XRRSET': 7,
        // Server not authoritative for the zone
        'NOTAUTH': 8,
        // Name not in zone
        'NOTZONE': 9
      },
      name_type_rr: {}
    },

    dns.normalize_ipv6 = (ipv6) => (
      ((vec, str = '', len = 5, total = 0) => (
        vec = ipv6.split(':'),
        vec.map(e => (
          (str.length > 0 || len != 5) && (str += ':'),
          len = 4 - e.length,
          (len <= 0) && (
            str += e
          ),
          (len === 1) && (
            str += '0' + e
          ),
          (len === 2) && (
            str += '00' + e
          ),
          (len === 3) && (
            str += '000' + e
          ),
          (len < 4) && (
            total += 4
          )
        )),
        str.indexOf('::') < 0 ? str : (
          32 - total > 4 ? dns.normalize_ipv6(str.replace('::', ':0000::')) : (
            32 - total > 0 ? str.replace('::', ':0000:') : str
          )
        )
      ))()
    ),

    dns.load_data = () => (
      ((key, vec) => (
        config.map(
          rr => (
            key = null,
            (rr?.type === 'PTR') && (
              vec = rr?.name?.split?.('.'),
              (vec.length === 4) && (
                rr.name = vec[3] + '.' + vec[2] + '.' + vec[1] + '.' + vec[0] + '.in-addr.arpa'
              )
            ),
            (rr?.type === 'OPT') && rr.DOMAIN_NAME && (
              key = (rr.DOMAIN_NAME + '#' + rr.type).toUpperCase(),
              delete rr.DOMAIN_NAME
            ),
            (key || rr?.name) && rr?.type && (
              !Boolean(key) && (key = (rr.name + '#' + rr.type).toUpperCase()),
              (rr?.status === 'deny') && (
                dns.name_type_rr[key] = {
                  'status': 'deny'
                }
              ) || (
                !Boolean(dns.name_type_rr[key]) && (
                  dns.name_type_rr[key] = {
                    'index': 0,
                    'rr': []
                  }
                ),
                (rr.type === 'AAAA') && rr?.rdata && (
                  rr.rdata = dns.normalize_ipv6(rr.rdata).replaceAll(':', '')
                ),
                dns.name_type_rr[key].rr.push(rr)
              )
            )
          )
        )
      ))()
    ),

    dns.suffix_match = (name, type) => (
      name && type && ((key, vec, index, record = null) => (
        key = (name + '#' + type).toUpperCase(),
        record = dns.name_type_rr[key],
        !Boolean(record) && (
          vec = name.split('.'),
          key = '',
          index = 0,
          vec.map(e => (
            index++ > 0 && (
              key.length > 0 && (key += '.'),
              key += e
            )
          )),
          record = dns.suffix_match(key, type)
        ),
        record
      ))()
    ),

    dns.query_data = (name, type, answer, authority, additional) => (
      ((key, record, index, rc = -1) => (
        key = (name + '#' + type).toUpperCase(),
        record = dns.name_type_rr[key],
        (record?.status === 'deny') && (
          rc = dns.code.REFUSED
        ) || (
          record && record.rr && (
            index = record.index,
            record.rr.map(e => (
              answer.push(
                record.rr[
                index++ % record.rr.length])
            )),
            record.index = (record.index + 1) % record.rr.length,
            rc = dns.code.NOERROR
          ),
          (rc == -1) && (
            record = dns.suffix_match(name, 'SOA'),
            record && record.rr && (
              record.rr.map(e => authority.push(e)),
              rc = dns.code.NXDOMAIN
            )
          ),
          (rc != -1) && (
            record = dns.suffix_match(name, 'OPT'),
            record && record.rr && (
              record.rr.map(e => additional.push(e))
            )
          )
        ),
        rc
      ))()
    ),

    dns.load_data(),

    global.dns_broker = dns,

    global
  )

)()