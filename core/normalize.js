
const normalizeDomain = (domain) => {   
    if(typeof domain !== 'string') {
        throw new Error('Domain must be a string');
    }
    if (domain.length === 0) {
        throw new Error('Domain cannot be empty');
    }

    let d  = domain.toLocaleLowerCase().trim();
    return d;
}

const validatePattern = (pattern) => {

    if (pattern.includes(" ")) {
        throw new Error("Pattern contains spaces");
    }

    if (!pattern.endsWith('.com')) {
        throw new Error('Pattern must end with .com');    
    }
    
    const parts = pattern.split(".");
    if (parts.length !== 2) {
        throw new Error('Pattern must be in the format example.com');    
    }

    const [name, tld] = parts;
    
    if (name.length === 0) {
        throw new Error('Pattern must be in the format example.com');    
    }

    if (tld !== "com"){
        throw new Error('Pattern must be in the format example.com');    
    }

    return pattern;
}

//para que uso rules?

const decide = (domain, rules) => {
    const goodDomain = normalizeDomain(domain)
    
    if (rules.block.includes(goodDomain)){        
        const dnsServfailResponse = Buffer.from([
        0x12, 0x34,       // ID (igual que la query)
        0x81, 0x82,       // FLAGS: response + RD + SERVFAIL(2)
        0x00, 0x01,       // QDCOUNT = 1
        0x00, 0x00,       // ANCOUNT = 0
        0x00, 0x00,       // NSCOUNT = 0
        0x00, 0x00,       // ARCOUNT = 0

        // QUESTION (copiada idéntica)
        0x07, 0x79, 0x6f, 0x75, 0x74, 0x75, 0x62, 0x65, // "youtube"
        0x03, 0x63, 0x6f, 0x6d,                         // "com"
        0x00,                                           // end
        0x00, 0x01,                                     // QTYPE = A
        0x00, 0x01                                      // QCLASS = IN
        ]);

        const response = {
            dnsServfailResponse: dnsServfailResponse,
            status: 'blocked, vete alachingada',
            domain: goodDomain
        }
        console.log(response);
        return response;
    } else {
        const response = {
            status: 'allowed, esta bien',
            domain: goodDomain
        }
        console.log(response);
        return response;
    }

}


/*
const makeEvent = (decision, clientId) => {
    console.log('time');

}*/









module.exports = { normalizeDomain, validatePattern, decide };

