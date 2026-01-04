

const dns = require('dns');
const { type } = require('os');

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







const decide = async (qname, rules) => {
    const goodDomain = normalizeDomain(qname);

    if (rules.block.includes(goodDomain)){ 
        const response = {
            status: false,
            message: 'blocked, vete alachingada',
            domain: goodDomain
        }
        return response;
    
    } else {
        /*
        let dgram = require('dgram');
        let s = dgram.createSocket('udp4');
        s.send(Buffer.from('abc'), 8080, 'localhost'); */

        const response = {
            status: true,
            message: 'allowed, esta bien',
            domain: goodDomain
        }
        return response;
    }

}










module.exports = { normalizeDomain, validatePattern, decide };

