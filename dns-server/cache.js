(
  (
    dnsCache = new algo.Cache(null, null, { ttl: 3600 }),
  ) => (
    {
      setDNS: (key, record) => (
        (
          ttl = 3600,
        ) => (
          record.answer.map(
            rr => (
              (rr.ttl < ttl) && (ttl = rr.ttl)
            )
          ),
          dnsCache.set(key.toLowerCase(), { ts: Date.now(), ttl: ttl * 1000, record })
        )
      )(),

      getDNS: key => (
        (
          lowerKey = key.toLowerCase(),
          rr = dnsCache.get(lowerKey),
          ts = Date.now(),
        ) => (
          rr?.ttl && (
            (rr.ttl + rr.ts > ts) && (
              (
                obj = Object.assign({}, rr.record),
                dec = Math.floor((ts - rr.ts) / 1000),
              ) => (
                obj.answer = obj.answer.map(
                  o => (
                    (
                      t = Object.assign({}, o)
                    ) => (
                      t.ttl -= dec,
                      t
                    )
                  )()
                ),
                obj
              )
            )() || (
              dnsCache.remove(lowerKey),
              null
            )
          )
        )
      )(),
    }
  )
)()