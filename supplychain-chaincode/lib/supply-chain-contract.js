//
// Securing Supply Chain Using Blockchain - HHM
//	
// Contract for Supply Chain Network
//
// Fabric Contract API : https://hyperledger.github.io/fabric-chaincode-node/master/api/tutorial-using-contractinterface.html
//
// helpful resources : 
//	https://stackoverflow.com/questions/65204924/error-no-valid-responses-from-any-peers-failed-to-execute-transaction-could-no
// 
//
//  TODO: 
// 		[*]  Use events()                            [DONE]
//		[*]  Clean code (helper functions)            
//		[*]  Add userid and user's hash in batch	 [DONE]  
//		[*]
//
//
//
//

'use-strict'

const { Contract } = require('fabric-contract-api');
const sha256 = require('sha256');
const uuid = require('uuid');

const GEN = '9b358c76-6ed2-4975-ba9c-037a22e95b5c';


class SupplyChainContract extends Contract {

	/**
	 * convert javascript object to
	 * buffer instance
	 * @param obj Object 
	 * @returns Buffer
	 */
	o2b(obj) {
		return Buffer.from(JSON.stringify(obj));
	}

	/**
	 * helper function
	 * @param  event 
	 * @param  data  
	 */
	async setEvent(ctx, event, data) {
		await ctx.stub.setEvent( event, data);
	}

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
				user: sha256('Manufacturer'),       // hashed owner
				uuid: uuid.v5('Manufacturer', GEN), // unique userid
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
				user: sha256('Manufacturer'),       // hashed owner
				uuid: uuid.v5('Manufacturer', GEN), // unique userid
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
				user: sha256('Manufacturer'),       // hashed owner
				uuid: uuid.v5('Manufacturer', GEN), // unique userid
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
            await ctx.stub.putState(batches[i].batchId, this.o2b(batches[i]));
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
		// fire event
		await this.setEvent(ctx, 'batches-retrived', this.o2b(allResults));
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
       	 	await ctx.stub.putState(batchId, this.o2b(batchParsed));
     	 	console.info('============= Item Added Successfuly ! ===========');
			// fire event
			await this.setEvent(ctx, 'item-added', this.o2b(batchParsed));
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
		await ctx.stub.putState(batchId, this.o2b(batchParsed)));
		console.info('============= Product Added Successfuly ! ===========');
		// fire event
		this.setEvent(ctx, 'product-added', JSON.stringify(batchParsed));
 	 	return(JSON.stringify(batchParsed));

      }

    /*
     * Creats a new Batch and adds it to the ledger
     * 
     * 
     */
    async addBatch(ctx, batchId, owner){
    	console.info('============= Adding Batch  ===========');

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
		await ctx.stub.putState(batchId, this.o2b(newBatch));
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
 	 * It is an example of a malicious 
	 * function 
 	 * @param ctx Ledger Context
 	 * @return Transaction
 	 */
	async malicious_sendBatch(ctx, to, batchid, cost, dd) {

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
		return "Batch sent";
    }

	/* 
 	 * Records sending of batch
 	 * 
 	 * @param ctx Ledger Context
 	 * @return Transaction
 	 */
	 async sendBatch(ctx, from, to, batchid, cost, dd) {

    	// check if batch exists
	    const batch = await ctx.stub.getState(batchid); 
    	if (!batch || batch.length == 0) {
            throw new Error(`${batchid} does not exists !`);
        }

        // check is 'to' is a valid org
        const orgs = this.getRegisteredOrgs();
        if(!orgs.includes(to)) {
        	throw new Error(`${to} is not a valid organization, it should be one of ${orgs.toString()}`);
        }

   		// record transaction
  		const trx = await this.createTransaction(ctx, from, to, cost, batchid, dd, "N/A", `sending batch from: ${from}, to: ${to} with cost ${cost}`);
		// fire event
		this.setEvent(ctx, 'batch-sent', JSON.stringify(trx));
		return "Batch sent";
    }

	async createTransaction(ctx, from, to, cost, batchId, dd, da, desc) {
		console.info('============= Creating Transaction ===========');
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
			senderSignature: '',
			recieverSignature: '',
			docType: "transaction"
		};

		// add transaction to ledger
		await ctx.stub.putState(trxId, this.o2b(trx));
		console.log(trx);
		console.info('============= Created Transaction ===========');
		// fire event
		this.setEvent(ctx, 'transaction-created', this.o2b(trx));
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
    async recieveBatch(ctx,reciever, trxid, batchid, date) {
		console.info('============= Recieving Batch ===========');

    	// get all transactions
    	var trxs = await this.getTransactions(ctx);
		console.log("TRXS", trxs);
    	// get invoker orgs name
    	const to = reciever;
    	console.log("Got to : ", to);
    	// verify is org has been sent a batch
    	for(var i = 0; i < trxs.length; i++) {
			// as we need only record, not key
			var trx = trxs[i].Record;
			console.log("TRX", trx);
    		if(trx.trxId == trxid && trx.batchId == batchid && trx.dateArrival == "N/A") {
    			console.info("Got transaction ", trxs[i]);
    			// mark arrival date
    			trx.dateArrival = date;

    			// change batch's owner
    			const batch = await ctx.stub.getState(batchid);
		       	const batchParsed = JSON.parse(batch.toString());
		       	// add current owner to previous owner
		       	batchParsed.previousOwners.push(batchParsed.owner);
		       	// make receiever the new owner of batch
		       	batchParsed.owner = to;
				batchParsed.uuid = uuid.v5(to, GEN); // change owners's uuid
				batchParsed.user = sha256(to);       // update user's hash
		       	// save updated batch and transactions
		       	ctx.stub.putState(trx.trxid, this.o2b(trx));
		       	ctx.stub.putState(batchParsed.batchId, this.o2b(batchParsed));
				console.info('============= Recieved Batch ===========');

				// fire event
				this.setEvent(ctx, 'recieved-batch', this.o2b(trx));
			
		       	return `Updated TRX : ${JSON.stringify(trxs)} \n Updated Batch ${JSON.stringify(batchParsed)}`;
    		}
    	}
		console.info('============= Recieving Batch ERROR ===========');

    	// if we are here, it means that we didnt found the transactions
    	throw new Error(`[ERROR] TRX with id ${trxid}, batchid ${batchid} not found, please make sure u've been sent a batch !!`);
    }

	/**
	 * update sender signature in transaction
	 * with the public key of sender
	 * @param {*} ctx transaction contecxt
	 * @param {*} trxid  transaction id
	 * @param {*} batchid  batch id
	 * @param {*} sendersignature  public key of sender
	 */
	async updateSenderSignature(ctx, trxid, batchid,sendersignature) {

		console.log("============= Updating sender signature ============== ");
	
    	var trxs = await this.getTransactions(ctx);
		
    	for(var i = 0; i < trxs.length; i++) {
			// as we need only record, not key
			var trx = trxs[i].Record;
			console.log("TRX", trx);
    		if(trx.trxId == trxid && trx.batchId == batchid && trx.dateArrival == "N/A") {
    			console.info("Got transaction ", trxs[i]);
    			
    			// change batch's owner
    			const batch = await ctx.stub.getState(batchid);
		       	const batchParsed = JSON.parse(batch.toString());
		       	// add current owner to previous owner
		       	batchParsed.previousOwners.push(batchParsed.owner);
		       	// make receiever the new owner of batch
		       	batchParsed.senderSignature = sendersignature;

		       	// save updated batch and transactions
		       	ctx.stub.putState(trx.trxid, this.o2b(trx));
		       	ctx.stub.putState(batchParsed.batchId, this.o2b(batchParsed));
				console.info('============= Recieved Batch ===========');
				// fire event
				this.setEvent(ctx, 'sender-signed', JSON.stringify(trx));
		       	return `Updated TRX : ${JSON.stringify(trxs)} \n Updated Batch ${JSON.stringify(batchParsed)}`;
    		}
    	}
    	// if we are here, it means that we didnt found the transactions
    	throw new Error(`[ERROR] TRX with id ${trxid}, batchid ${batchid} not found, please make sure u've sent a batch !!`);
	}

	/**
	 * update sender signature in transaction
	 * with the public key of sender
	 * @param {*} ctx transaction contecxt
	 * @param {*} trxid  transaction id
	 * @param {*} batchid  batch id
	 * @param {*} sendersignature  public key of sender
	 */
		 async updateSenderSignature(ctx, trxid, batchid,recieversignature) {

			console.log("============= Updating reciever signature ============== ");
		
			var trxs = await this.getTransactions(ctx);
			
			for(var i = 0; i < trxs.length; i++) {
				// as we need only record, not key
				var trx = trxs[i].Record;
				console.log("TRX", trx);
				if(trx.trxId == trxid && trx.batchId == batchid && trx.dateArrival == "N/A") {
					console.info("Got transaction ", trxs[i]);
					
					// change batch's owner
					const batch = await ctx.stub.getState(batchid);
					const batchParsed = JSON.parse(batch.toString());
					// add current owner to previous owner
					batchParsed.previousOwners.push(batchParsed.owner);
					// make receiever the new owner of batch
					batchParsed.recieverSignature = recieversignature;

					// save updated batch and transactions
					ctx.stub.putState(trx.trxid, this.o2b(trx));
					ctx.stub.putState(batchParsed.batchId, this.o2b(batchParsed));
					console.info('============= Recieved Batch ===========');
					
					// fire event
					this.setEvent(ctx, 'reciever-signed', JSON.stringify(trx));

					return `Updated TRX : ${JSON.stringify(trxs)} \n Updated Batch ${JSON.stringify(batchParsed)}`;
				}
			}
			// if we are hebre, it means that we didnt found the transactions
			throw new Error(`[ERROR] TRX with id ${trxid}, batchid ${batchid} not found, please make sure u've been sent a batch !!`);
		}
}

module.exports = SupplyChainContract;
