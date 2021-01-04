//
// Securing Supply Chain Using Blockchain - HHM
//	
// Contract for Supply Chain Network
//
// Fabric Contract API : https://hyperledger.github.io/fabric-chaincode-node/master/api/tutorial-using-contractinterface.html
//
// ./network.sh deployCC -ccn supplychain -ccp ../supplychain-chaincode -ccv 1 -ccl javasctipt
//
// 
'use-strict'

const { Contract } = require('fabric-contract-api');

class SupplyChainContract extends Contract {

	/*
	 * populate ledger with dummy data, for dev
	 * @param ctx : Transaction Context 
	 */
	async initLedger(ctx) {
        console.info('============= Initializing Ledger ===========');

        const batches = [
        	{
        		batchId: "B-001",
        		owner: "Manufacturer",
        		previousOwners: [],
        		products: [
	        		{
	        			productId: "P-001",
	        			items: [
	        				'item1',
	        				'item2',
	        				'item3'
	        			]
	        		}
        		]
        	},
        	{
        		batchId: "B-002",
        		owner: "Manufacturer",
        		previousOwners: [],
        		products: [
	        		{
	        			productId: "P-002",
	        			items: [
	        				'item1',
	        				'item2',
	        				'item3'
	        			]
	        		}
        		]
        	},
        	{
        		batchId: "B-003",
        		owner: "Manufacturer",
        		previousOwners: [],
        		products: [
	        		{
	        			productId: "P-003",
	        			items: [
	        				'item1',
	        				'item2',
	        				'item3'
	        			]
	        		}
        		]
        	}	
        ]
        for (let i = 0; i < batches.length; i++) {
             batches[i].docType = 'batch';
            await ctx.stub.putState(batches[i].batchId, Buffer.from(JSON.stringify(batches[i])));
            console.info('Added <--> ', batches[i]);
        }
        console.info('============= Ledger Initialized !! ===========');
	}

	/*
	 * Returns json representation of all batches
	 * stored in ledger
	 * @return allBatches
	 */
	async getAllBatches(ctx) {
        console.info('============= Getting All Batches ===========');
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info("All Batches : ", allResults);
        return JSON.stringify(allResults);
    }

    /*
     * Adds an item to an already created batch
     * This function does not create product instance
     * For this a product instance should be present, 
     * else it will fail, resulting in error. 
     * 
     * @param ctx Transaction Context
     * @param batchId : String Id of batch to add item
     * @param productId : String Id of product to add item
     * @param itemName : String Unique name for item
     */
     async addItem(ctx, batchId, productId, itemName) {
     	 console.info('============= Adding Item  ===========');

     	 // get the batch from chaincode state
     	 // here batch is of type bytes, we need
     	 // to change its type to work with it
	     const batch = await ctx.stub.getState(batchId); 

	     // throw error if invalid batch
	     if (!batch || batch.length === 0) {
            throw new Error(`${batchId} does not exist, please create it first !`);
         }

         // change type of batch to JSON
       	 const batchParsed = JSON.parse(batch.toString());

       	 // check if batch has products, raise error if not
       	 if(!batchParsed.products || batchParsed.products.length == 0) {
       	 	throw new Error(`${batchId} has no products, please add products first !`);
       	 }

       	 var hasSpecifiedProductId = false;
       	 
       	 // check if productId is there in batch
       	 for(var i = 0; i < batchParsed.products.length; i++) {
       	 	if(batchParsed.products[i].productId == productId) {
       	 		// found the batch, add item to it
       	 		batchParsed.products[i].items.push(itemName);
       	 		hasSpecifiedProductId = true;
       	 	}
       	 }

       	 if(hasSpecifiedProductId) {
       	 	console.info(`[SUCCESS] Added item : ${itemName} to ${productId} of batch : ${batchId}`);
       	 	console.info("Updated batch : ", batchParsed);
       	 	await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(batchParsed)));
     	 	console.info('============= Item Added Successfuly ! ===========');
     	 	return(JSON.stringify(batchParsed));
       	 } else {
       	 	console.warn(`[FAILED] No product : ${productId} found in batch : ${batchId}`);
     	 	console.info('============= Item Adding Faild :(  ===========');
       	 }
     }


    /*
     * Adds a product entry into a given batch 
     * This function only creates the product instance
     * with given productId, it does not add items
     * into that product instance
     *
     * @params ctx Transaction Context
     * @params batchId : String Batch to add product to
     * @params productId : String Product Id
     */
    async addProduct(ctx, batchId, productId) {
   		console.info('============= Adding Product  ===========');

     	// get the batch from chaincode state
	    const batch = await ctx.stub.getState(batchId); 

	    // throw error if invalid batch
	    if (!batch || batch.length === 0) {
            throw new Error(`${batchId} does not exist, please create it first !`);
        }

        // change type of batch to JSON
    	const batchParsed = JSON.parse(batch.toString());

       	// check if product with id productId 
       	// already exists or not
       	for(var i = 0; i < batchParsed.products.length; i++) {
       	 	if(batchParsed.products[i].productId == productId) {
	            throw new Error(`${productId} already exists !!`);	
       	 	}
       	}	

       	// product instance
       	var product = {
       	 	productId: productId,
       	 	items: []
       	};

       	 // add product instance to batch's products
       	batchParsed.products.push(product);

       	console.info("Updated Batch", batchParsed);

       	console.info(`[SUCCESS] Added product : ${productId} to batch : ${batchId}`);
		console.info("Updated batch : ", batchParsed);
		await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(batchParsed)));
		console.info('============= Product Added Successfuly ! ===========');
 	 	return(JSON.stringify(batchParsed));

      }

    /*
     * Creats a new Batch and adds it to the ledger
     * 
     * 
     */
    async addBatch(ctx, batchId, owner){
    	console.info('============= Adding Batch  ===========');

    	// checking if batch already existss
	    const batch = await ctx.stub.getState(batchId); 
	    if (batch.length != 0) {
            throw new Error(`${batchId} already exists ! ${batch} ^ ${batch.length}`);
        }

        // creating a new batch
        var newBatch = {
        	batchId: batchId,
        	owner: owner,
        	previousOwners: [],
        	products: []
        };
        newBatch.docType = "batch";
        console.info("New Batch", newBatch);
        console.info(`[SUCCESS] Created Batch : ${batchId}`);

        //adding batch to Ledger
		await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(newBatch)));
		console.info('============= Batch Created & Added Successfuly ! ===========');
 	 	return(newBatch);
    }


 	/*
 	 * @returns list of all organization in network
 	 */
	getRegisteredOrgs() {
 		return ['manufacturer', 'supplier', 'retailer'];
	}

	getInvokerOrg(ctx) {
		// get invokers id
        const fromMSP = ctx.stub.getMspID();
        var from = "";
        if(fromMSP == "ManufacturerMSP") {
        	from = "manufacturer";
        } else if (fromMSP == "SupplierMSP") {
        	from = "supplier";
        } else if (fromMSP == "RetailerMSP") {
        	from = "retailer";
        } else {
        	throw new Error(`[getInvokerOrg] Org ${from} is not a registered org. :( `);
        }
        return from;	
	}

 	/* 
 	 * Records sending of batch
 	 * 
 	 * @param ctx Ledger Context
 	 * @return Transaction
 	 */
    async sendBatch(ctx, to, batchid, cost, dd) {

    	// check if batch exists
	    const batch = await ctx.stub.getState(batchid); 
    	if (!batch || batch.length == 0) {
            throw new Error(`${batchid} does not exists !`);
        }

        // get name of organization who invoked this transaction
        const from = this.getInvokerOrg(ctx);

        console.info(`FROM : ${from}`);

        // check is 'to' is a valid org
        const orgs = this.getRegisteredOrgs();
        if(!orgs.includes(to)) {
        	throw new Error(`${to} is not a valid organization, it should be one of ${orgs.toString()}`);
        }

   		// record transaction
  		const trx = await this.createTransaction(ctx, from, to, cost, batchid, dd, "N/A", `sending batch from: ${from}, to: ${to} with cost ${cost}`);
  		return trx;
    }

	async createTransaction(ctx, from, to, cost, batchId, dd, da, desc) {

		// create tansaction id
		const allTrx = await this.getTransactions(ctx);
		const numTrx = allTrx.length+1;
		const trxId  = `TRX-${numTrx}`;

		// create tansaction obj
		const trx = {
			trxId: trxId,
			from: from,
			to: to,
			batchId: batchId,
			desc: desc,
			cost: cost,
			dateDeparture: dd, 
			dateArrival: da,
			docType: "transaction"
		};

		// add transaction to ledger
		await ctx.stub.putState(trxId, Buffer.from(JSON.stringify(trx)));
		return trx;
	}

	async getTransactions(ctx) {
		console.info('============= Getting All Transactions ===========');
        const allTransaction = [];
        for await (const {key, value} of ctx.stub.getStateByRange('', '')) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.warn(`[ERROR] failed parsing string ${strValue}: Error = ${err}`);
            }
            console.log(record);
            if(record.docType === "transaction") {
	            allTransaction.push({ Key: key, Record: record });        	
            }
        }
        console.info("All Transaction : ", allTransaction);
        return allTransaction;
	}

	/*
	 *
	 */
    async recieveBatch(ctx, trxid, batchid, date) {
    	// get all transactions
    	const trxs = await getTransactions(ctx);

    	// get invoker orgs name
    	const to = this.getInvokerOrg(ctx);
    	console.log("Got to : ", to);
    	// verify is org has been sent a batch
    	for(var i = 0; i < trxs.length; i++) {
    		if(trsx[i].trxId == trxid && trxs.batchId == batchid && trxs.dateArrival == "N/A") {
    			console.info("Got transaction ", trxs[i]);
    			// mark arrival date
    			trxs[i].dateArrival = date;

    			// change batch's owner
    			const batch = await ctx.stub.getState(batchId);
		       	const batchParsed = JSON.parse(batch.toString());
		       	// add current owner to previous owner
		       	batchParsed.previousOwners.push(batchParsed.owner);
		       	// make receiever the new owner of batch
		       	batchParsed.owner = to;

		       	// save updated batch and transactions
		       	ctx.stub.putState(trxs[i].trxid, Buffer.from(JSON.stringify(trxs[i])));
		       	ctx.stub.putState(batchParsed.batchId, Buffer.from(JSON.stringify(batchParsed)));

		       	return `Updated TRX : ${JSON.stringify(trxs)} \n Updated Batch ${JSON.stringify(batchParsed)}`;
    		}
    	}

    	// if we are here, it means that we didnt found the transactions
    	throw new Error(`[ERROR] TRX with id ${trxid}, batchid ${batchid} not found, please make sure u've been sent a batch !!`);
    }
}

module.exports = SupplyChainContract;
