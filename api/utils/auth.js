
const clog = (str) => {
    console.log(`[auth] ${str}`);
}

/**
 * Takes a base64 encoded string and
 * authenticates it.
 * @param {Fabric-Helper} fabricconn
 * @param {string} authheader
 * @return {boolean}  
 */
const auth = async (fabricconn, header) => {
    clog(`Got header : ${JSON.stringify(header)}`);
    if(header.authorization == undefined) {
        return false;
    }
    let authheader = header.authorization;
    clog(`Got token ${authheader}`);
    let userid = Buffer.from(authheader, 'base64').toString('utf-8').split(':')[0];
    clog(`Extracted userid : ${userid}`);
    let res = await fabricconn.userExists(userid);
    clog(`Auth status : ${res}`);
    return res;
};

module.exports = auth;