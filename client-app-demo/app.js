/**
 * CLI based sample client app for
 * Supply Chain Network
 * 
 * @author : "HHM-SSC"
 * @version : "0.1"
 * 
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

/////////// setting up global constants //////

const channelName = 'sc';
const chaincodeName = 'supplychain';
const mspManufacturer = 'ManufacturerMSP';
const walletPath = path.join(__dirname, 'wallet');
const userId = 'user4';
const adminUserId = 'manufactureradmin';
const adminUserPass = 'manufactureradminpw';

/////////// Helper Functions ////////////////

const buildCAClient = (FabricCAServices, ccp, caHostName) => {
    // create a client for interacting with CA
    
    // console.log("[BuildCAClient] Got ccp", ccp);
    // getting CA's info through its certificates (ccp configs)
    const caInfo = ccp.certificateAuthorities[caHostName];

    // console.log("[BuildCAClient] Got caInfo",caInfo);
    
    // getting TLS CA Certificate from CA
    const caTLSCACerts = caInfo.tlsCACerts.pem;

    // creating client instance
    const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

    console.log("[*] Successfully created CA client ", caInfo.caName);
    return caClient;
};

const enrollAdmin = async (caClient, wallet, mspId) => {
    try {
        // checking to see if user is already enrolled
        const identity = await wallet.get(adminUserId);
    
        // if user already enrolled, return
        // no need to enroll again.
        if (identity) {
			console.log(`Identity for user ${adminUserId} already exists in wallet.`);
			return;
		}
        
        // Enroll the admin user 
        // Enroll the admin user, and import the new identity into the wallet.
		const enrollment = await caClient.enroll({ enrollmentID: adminUserId, enrollmentSecret: adminUserPass });
		
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
		console.log('[*] Successfully enrolled admin user and imported it into the wallet');
    } catch (error) {
		console.error(`[ERROR] Failed to enroll admin user : ${error}`);
	}
};

const registerAndEnrollUser = async (caClient, wallet, orgMspId, userId, affiliation) => {
	try {
		// Check to see if we've already enrolled the user
		const userIdentity = await wallet.get(userId);
		if (userIdentity) {
			console.log(`An identity for the user ${userId} already exists in the wallet`);
			return;
		}

		// Must use an admin to register a new user
		const adminIdentity = await wallet.get(adminUserId);
		if (!adminIdentity) {
			console.log('[ERROR] An identity for the admin user does not exist in the wallet');
			console.log('[ERROR] Enroll the admin user before retrying');
			return;
		}

		// build a user object for authenticating with the CA
		const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
		const adminUser = await provider.getUserContext(adminIdentity, adminUserId);

		// Register the user, enroll the user, and import the new identity into the wallet.
		// if affiliation is specified by client, the affiliation value must be configured in CA
		const secret = await caClient.register({
			affiliation: affiliation,
			enrollmentID: userId,
			role: 'client'
		}, adminUser);
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
		await wallet.put(userId, x509Identity);
		console.log(`Successfully registered and enrolled user ${userId} and imported it into the wallet`);
	} catch (error) {
		console.error(`Failed to register user : ${error}`);
	}
};

const buildCCPManufacturer = () => {
	// load the common connection configuration file
	const ccpPath = path.resolve(__dirname, '..', 'organizations', 'peerOrganizations', 'manufacturer.ssc-hhm.com', 'connection-manufacturer.json');
	const fileExists = fs.existsSync(ccpPath);
	if (!fileExists) {
		throw new Error(`no such file or directory: ${ccpPath}`);
	}
	const contents = fs.readFileSync(ccpPath, 'utf8');

	// build a JSON object from the file contents
	const ccp = JSON.parse(contents);

	console.log(`Loaded the network configuration located at ${ccpPath}`);
	return ccp;
};

const buildWallet = async (Wallets, walletPath) => {
	// Create a new  wallet : Note that wallet is for managing identities.
	let wallet;
	if (walletPath) {
		wallet = await Wallets.newFileSystemWallet(walletPath);
		console.log(`Built a file system wallet at ${walletPath}`);
	} else {
		wallet = await Wallets.newInMemoryWallet();
		console.log('Built an in memory wallet');
	}

	return wallet;
};

const prettyJSONString = (inputString) => {
	if (inputString) {
		 return JSON.stringify(JSON.parse(inputString), null, 2);
	}
	else {
		 return inputString;
	}
};
////////// Main Functions  /////////////////
async function main() {

    try {
        const ccp = buildCCPManufacturer();

        const caClient = buildCAClient(FabricCAServices, ccp, 'ca.manufacturer.ssc-hhm.com');
        
        const wallet = await buildWallet(Wallets, walletPath);

        await enrollAdmin(caClient, wallet, mspManufacturer);

        await registerAndEnrollUser(caClient, wallet, mspManufacturer, userId, 'manufacturer.desktop-client');

        const gateway = new Gateway();

        try {
            console.log("Inside Try");
            // setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: userId,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

            console.debug("created gateway");
            // Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);
            console.log("---- created network");
            // Get the contract from the network.
            console.log("---- getting contract");
			
            const contract = network.getContract(chaincodeName);
            console.log("---- got contract");


            console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');
			await contract.submitTransaction('initLedger');
			console.log('*** Result: committed');



            console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');
			let result = await contract.evaluateTransaction('getAllBatches');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
    		
    		console.log('\n--> Submit transaction : add item ')
    		result = await contract.submitTransaction('addItem', 'B-002', 'P-002', 'newItem');
    		console.log(`*** Result: ${prettyJSONString(result.toString())}`)


            console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');
			result = await contract.evaluateTransaction('getAllBatches');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

        }  finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}

    } catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}

}

main();