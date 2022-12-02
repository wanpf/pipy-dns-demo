(() => pipy()

//
// Local DNS server
//
.listen('127.0.0.153:5300', { protocol: 'udp', transparent: true })
.chain(['dns-main.js'])

)()
