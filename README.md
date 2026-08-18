# DNS Shield

A DNS proxy written directly on UDP sockets. It reads the query name out of the raw packet
bytes, refuses anything on a block list, and forwards everything else to an upstream resolver.

No DNS library is involved — the packet parsing and the refusal response are built by hand.

## Tech stack

- Node.js, `node:dgram` (built-in UDP sockets)
- `Buffer` for byte-level packet reading and writing
- Block rules in a plain JSON file

No runtime dependencies. The packages currently listed in `package.json` are not used: `dgram`
and `dns` are Node built-ins, and `dns2` is never imported.

## How it works

The server binds `127.0.0.1:53` and handles each datagram:

1. **Parse the QNAME.** The header is 12 bytes, so the question starts at offset 12. Labels are
   length-prefixed — read one byte for the length, then that many ASCII bytes, repeat until a
   zero byte. `["events", "amazon", "com"]` is joined back into `events.amazon.com`.

2. **Decide.** `core/normalize.js` lowercases and trims the name, then checks it against the
   `block` array in `data/rules.json`.

3. **Blocked → build a refusal by hand.** A 12-byte header is allocated: the query's transaction
   ID is copied verbatim, the flag bytes are set to `0x81 0x85` (QR=1, RD, RA, RCODE=5 REFUSED),
   QDCOUNT is copied, and ANCOUNT / NSCOUNT / ARCOUNT are zeroed. The original question section
   is sliced off the request and appended, because a well-formed response has to echo it back.

4. **Allowed → forward.** The untouched datagram is sent to `1.1.1.1:53` and the upstream reply
   is relayed to the client.

## Block rules

`data/rules.json`:

```json
{
  "block": ["amazon.com", "instagram.com"]
}
```

Matching is a substring check, so `amazon.com` also blocks `events.amazon.com`.

## Running it

```bash
node app.js
```

Port 53 is privileged, so this needs administrator / root:

```bash
sudo node app.js          # macOS, Linux
```

On Windows, run the terminal as administrator. Port 53 also has to be free — a local DNS
service or resolver stub already listening there will make `bind` fail.

Point a client at it and watch the log:

```bash
dig @127.0.0.1 amazon.com        # -> REFUSED, logs "Bloqueado: amazon.com"
dig @127.0.0.1 google.com        # -> forwarded, logs "Permitido: google.com"
```

## Known gaps

- The upstream `client.on("message", ...)` listener is registered **inside** the per-request
  handler, so one listener is added for every allowed query. Listeners accumulate and replies
  get duplicated as the process runs.
- Matching uses `String.includes`, so `notamazon.com.example.net` is blocked too. Exact or
  suffix-boundary matching is not implemented.
- `validatePattern` in `core/normalize.js` is written and exported but never called.
- `client.js` is a scratch test client and is currently out of sync: it sends to port 5533 while
  the server binds 53, and its header declares QDCOUNT=2 while carrying one question.
- Only the question is inspected. Record types, EDNS, DNS-over-TCP fallback and truncation are
  not handled.
- `node_modules/` is committed to the repository.
