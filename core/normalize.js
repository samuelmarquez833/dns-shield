
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
        const response = {
            status: 'allowed',
            domain: goodDomain
        }
        return response;
    } else {
        const response = {
            status: 'blocked',
            domain: goodDomain
        }
        return response;
    }

}


/*
const makeEvent = (decision, clientId) => {
    console.log('time');

}*/









module.exports = { normalizeDomain, validatePattern, decide };

