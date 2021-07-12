const fabricconn = require('../utils/fabric-helper');

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
const auth = async (req, res, next) => {
    clog(`Got header : ${JSON.stringify(req.headers)}`);
    
    if( req.headers.authorization == undefined ) {
        clog(` [WARNING] Unautherized access !!`);
        res.status(404);
        res.json({'error' : 'Unautherized Access !!'});
        return;
    }
    let authheader = req.headers.authorization;
    clog(`Got token ${authheader}`);
    let userid = Buffer.from(authheader, 'base64').toString('utf-8').split(':')[0];
    clog(`Extracted userid : ${userid}`);
    let status = await fabricconn.userExists(userid);
    clog(`Auth status : ${status}`);
    
    if( status == false ) {
        // send error response
        clog(` [WARNING] Unautherized access !!`);
        res.status(404);
        res.json({'error' : 'Unautherized Access !!'});
    } else {
        // allow request
        next();
    }
};

module.exports = auth;