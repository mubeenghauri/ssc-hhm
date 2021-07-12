
const { FileSystemWallet, Gateway, User, X509WalletMixin, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');
const e = require('express');

/**
 * Global constatnts
 * TODO: add these in a config file maybe?
 */
// path to config file.
const CCP_PATH    = path.resolve(__dirname, '..', '..', 'organizations', 'peerOrganizations', 'manufacturer.ssc-hhm.com', 'connection-manufacturer.json');
const WALLET_PATH = path.join(__dirname, 'wallet');
const CA_HOST = 'ca.manufacturer.ssc-hhm.com';
const ORG_ADMIN = "manufactureradmin";
const ORG_ADMIN_PASS = 'manufactureradminpw';
const USER_ID = 'user2';
const USER_AFFL = 'manufacturer.desktop-client';
const CHANNEL = 'sc';
const CHAINCODENAME = 'supplychain';

const clog = (str) => {
    console.log(`[fabric-helper] ${str}`);
}

// Connection object to hold
// necessary data
const conn = {
    ccppath : null,
    uid : null,
    msp : null,
    contract : null,
    caclient: null,
    wallet: null,
    ccp : null,
    gateway : null,
};

// fabric helper class
const fabric = {


    getCCP() {
        clog('Reading CCP file');
        return JSON.parse(fs.readFileSync(CCP_PATH, 'utf-8'));
    },

    async buildWallet() {
        clog('Building wallet ...');
        let wallet;
        if (WALLET_PATH) {
            wallet = await Wallets.newFileSystemWallet(WALLET_PATH);
            clog(`Built a file system wallet at ${WALLET_PATH}`);
        } else {
            wallet = await Wallets.newInMemoryWallet();
            clog('Built an in memory wallet');
        }
        return wallet;
    },

    /**
     * check if an admin identity exists in 
     * wallet,
     * if not, add the identity.
     * @returns 
     */
    async checkAdmin()  {
        clog('Checking for admin');
        admin = await conn.wallet.get(ORG_ADMIN);
        if( !admin ) {
            clog('An admin identity does not exists in the wallet.')
            await this.enrollAdmin();
            return;
        }
        clog('Admin already Exists !');
        return true;
    },

    async checkUser() {
        clog('Checking for user.');
        user = await conn.wallet.get(USER_ID);
        if( !user ) {
            clog('A user identity does not exists in the wallet.')
            await this.registerAndEnrollUser();
            return;
        }
        clog('User already Exists ! ');
        return true;
    },

    /**
     * Make connection with fabric
     * network by reading connection
     * profile
     * @returns {Contract} contract
     */
     async initConn() {
        let contract;
        try {
            // https://hyperledger.github.io/fabric-sdk-node/release-1.4/FabricCAClient.html
            const wallet = await this.buildWallet();
            const ccp = this.getCCP();

            conn.msp = ccp.organizations[ccp.client.organization].mspid;
            conn.ccp = ccp;
            conn.wallet = wallet;
            conn.caclient = this.buildCAClient();

            clog(`Got ccp : ${ccp}`);
            clog(`Got MSP : ${conn.msp}`);

            // check admin enrollment
            await this.checkAdmin();

            // check user enrollment
            await this.checkUser();

            const gateway = new Gateway();
            await gateway.connect(ccp, {
                wallet,
                identity : USER_ID,
                discovery: {enabled: true, asLocalhost:true}
            });
            conn.gateway = gateway;
            // connect to channel
            const network = await gateway.getNetwork(CHANNEL);

            // get contract deployed on channel
            conn.contract = network.getContract(CHAINCODENAME);
            
            clog('Successfully gotten the contract !');
            clog('Connected to Fabric Network :) ');
        } catch (err) {
            clog(`Failed connecting to fabric network. ${err}`);
        }
        return contract;
    },

    /**
     * Execute a given transaction 
     * on the fabric network
     * 
     * @param {String} trx 
     * @param  {...any} args 
     * @returns {Promise}
     */
     async submitTrx( trx, ...args) {
        // console.log(conn);
        clog(`Initiating transaction : ${trx} , args : ${args}, contract : ${conn.contract}`);
        let response;
        // try {
        return conn.contract.submitTransaction(trx, ...args)
            .catch(error => {
                let e = error.responses[0].response.message.split(':');
                e = e[e.length -1];
                clog(`EEEEROR : ${e}`);

                return Promise.reject(e);
            })
            .then( res => {
                clog(`Contrac res : ${res}`);
                return Promise.resolve(res.toString());
            });

        // } catch (error) {
        //     clog(`ERROR : ${error}`);
        //     return Promise.reject(error);
        // }
    },

    async enrollAdmin() {
        const caClient = conn.caclient;
        const wallet = conn.wallet;
        const mspId = conn.msp;
        const adminUserId = ORG_ADMIN;
        const adminUserPass = ORG_ADMIN_PASS;
        clog(`Registering and Enrolling Admin : ${adminUserId} ... `);
        try {
            // checking to see if user is already enrolled
            const identity = await wallet.get(adminUserId);
        
            // if user already enrolled, return
            // no need to enroll again.
            if (identity) {
                clog(`Identity for user ${adminUserId} already exists in wallet.`);
                return;
            }
            
            // Enroll the admin user 
            // Enroll the admin user, and import the new identity into the wallet.
            const enrollment = await caClient.enroll({ enrollmentID: adminUserId, enrollmentSecret: adminUserPass, type: 'admin'});
            
            // get x509 certificates
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: mspId,
                type: 'X.509',
            };
            await wallet.put(adminUserId, x509Identity);
            clog('[*] Successfully enrolled admin user and imported it into the wallet');
        } catch (error) {
            console.error(`[ERROR] Failed to enroll admin user : ${error}`);
        }
    },

    async registerAndEnrollUser(caClient=conn.caclient, 
                                    wallet=conn.wallet,
                                    orgMspId=conn.msp, 
                                    userId=USER_ID, 
                                    affiliation=USER_AFFL) {

        clog(`Registering and Enrolling user : ${userId}, msp : ${orgMspId} ...`);
        const adminUserId = ORG_ADMIN;
        // const affiliation = USER_AFFL;
        // const userId = USER_ID;
        try {
            // Check to see if we've already enrolled the user
            const userIdentity = await wallet.get(userId);
            if (userIdentity) {
                clog(`An identity for the user ${userId} already exists in the wallet`);
                return;
            }
    
            // Must use an admin to register a new user
            const adminIdentity = await wallet.get(adminUserId);
            if (!adminIdentity) {
                clog('[ERROR] An identity for the admin user does not exist in the wallet');
                clog('[ERROR] Enroll the admin user before retrying');
                return;
            }
            
            clog("Building admin context ...");

            // build a user object for authenticating with the CA
            const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUser = await provider.getUserContext(adminIdentity, adminUserId);
    
            // Register the user, enroll the user, and import the new identity into the wallet.
            // if affiliation is specified by client, the affiliation value must be configured in CA
            clog('Registering User ...');
            const secret = await caClient.register({
                affiliation: affiliation,
                enrollmentID: userId,
                role: 'client'
            }, adminUser);

            clog('Enrolling User ...');
            const enrollment = await caClient.enroll({
                enrollmentID: userId,
                enrollmentSecret: secret
            });

            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: orgMspId,
                type: 'X.509',
            };

            clog(`Created identity : ${JSON.stringify(x509Identity)}`);
            await wallet.put(userId, x509Identity);
            clog(`Successfully registered and enrolled user ${userId} and imported it into the wallet`);
        } catch (error) {
            console.error(`Failed to register user : ${error}`);
            console.log(error.stack);
        }
    },
    
    buildCAClient() {
        // create a client for interacting with CA
        
        clog("Building CA client");
        // getting CA's info through its certificates (ccp configs)
        const caInfo = conn.ccp.certificateAuthorities[CA_HOST];
    
        // clog("[BuildCAClient] Got caInfo",caInfo);
        
        // getting TLS CA Certificate from CA
        const caTLSCACerts = caInfo.tlsCACerts.pem;
    
        // creating client instance
        const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
    
        clog("[*] Successfully created CA client ", caInfo.caName);
        return caClient;
    },

    /**
     * Verify if user identity exists 
     * in wallet.
     * @param {string} user 
     * @returns 
     */
    async userExists(user) {
        let res = await conn.wallet.get(user);
        if(res) return true;
        return false;
    },

    async eventListener() {
        clog('Setting up event listerner ...');
        // console.log(conn);
        const network = await conn.gateway.getNetwork(CHANNEL);
        // console.log(network);
        const contract = network.getContract(CHAINCODENAME);

        const listener = await contract.addContractListener( event => {
            console.log(event);
            if (event.eventName == 'batches-retrived') {
                clog(`[EVENT] Recieved : ${event.payload.toString()}`);
            }
        });        
    }

}

module.exports = fabric;

