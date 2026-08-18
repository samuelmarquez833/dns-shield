

const dns = require('dns');
const { type } = require('os');
const { execPath } = require('process');

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







const decide = (qname, rules) => {

    const goodDomain = normalizeDomain(qname);
    let isIt = true;
    
    rules.block.forEach( badName => {
    
        if(goodDomain.includes(badName)){
            isIt = false;
        }
    });



    if (!isIt){ 
        const response = {
            status: false,
            message: 'blocked, vete alachingada',
            domain: goodDomain
        }
        return response;

    } else {
        const response = {
            status: true,
            message: 'allowed, esta bien',
            domain: goodDomain
        }
        return response;
    }
    

}










module.exports = { normalizeDomain, validatePattern, decide };

