const express = require('express');
const router = express.Router();
const fabricHelper = require('../utils/fabric-helper');
const auth = require('../utils/auth');

const THIS_ORG = 'Manufacturer'

const clog = str => {
    console.log(`[manufacturer-router] ${str}`);
};

router.route('/').get( (req, res) => {
    res.json({
        'status' : "manufacturer is alive"
    });
});

router.post('/init-ledger', async (req, res) => {
    // just for testing
    fabricHelper.changeContext(THIS_ORG);

    let trx = await fabricHelper.submitTrx('initLedger');
    res.status(200);
    res.json({'status' : 'success', 'response' : trx});
});

router.get('/batches', auth, async (req, res) => {
    // handle route
    fabricHelper.changeContext(THIS_ORG);

    clog('Initiating transaction ....');
    let trx = await fabricHelper.submitTrx('getAllBatches');
    clog(`TRX ${ trx}`);

    // send response
    res.status(200);
    res.json({'status' : 'success', 'response' : JSON.parse(trx)});
});

router.get('/transactions', auth, async (req, res) => {
    // handle route
    fabricHelper.changeContext(THIS_ORG);

    let trx = await fabricHelper.submitTrx('getTransactions');
    clog(`TRX ${ trx}`);

    // send response
    res.status(200);
    res.json({'status' : 'success', 'response' : JSON.parse(trx)});
});

router.get('/batch/:id', auth, async (req, res) => {
    let id = req.params.id;
    let data = {};
    // handle route
    clog(`Getting batch of id ${id}`);

    let trx = await fabricHelper.submitTrx('getAllBatches');
    trx = JSON.parse(trx);
    clog(`Trx : ${trx}`);
    for(var i = 0; i < trx.length; i++) {
        if( trx[i].Key == id) {
            data = trx[i];
        }
    }
    // send response
    res.status(200);
    res.json({'status' : 'success', 'response' : data});
});

// // add a new batch
router.post('/batch', auth, async (req, res) => {
    fabricHelper.changeContext(THIS_ORG);

    clog(`Adding batch req-body : ${JSON.stringify(req.query)}`);
    // console.log(req);
    let bathcid = req.body.batchid;
    let trx = await fabricHelper.submitTrx('addBatch', bathcid, 'Manufacturer');
    // handle route
    clog(`TRX: ${trx}`);
    // send response
    res.status(200);
    res.json({'status' : 'success', 'response' : JSON.parse(trx)});
});

// // add a new item
router.post('/item', auth, async (req, res) => {

    clog(`Adding item req-body : ${JSON.stringify(req.query)}`);
    fabricHelper.changeContext(THIS_ORG);

    // console.log(req);
    let bathcid = req.query.batchid;
    let productid = req.query.productid;
    let itemname = req.query.itemname;

    fabricHelper.submitTrx('addItem', bathcid, productid, itemname)
        .catch(error => {
            res.status(400);
            res.json({'status' : 'failure', 'error' : error});
        })
        .then( trx => {
            // handle route
            clog(`TRX: ${trx}`);
            // send response
            res.status(200);
            res.json({'status' : 'success', 'response' : trx != undefined ? JSON.parse(trx) : 'No response from peers'});
        })
        ;

});

// // add a new product
router.post('/product', auth, async (req, res) => {

    clog(`Adding product req-body : ${JSON.stringify(req.query)}`);
    fabricHelper.changeContext(THIS_ORG);

    // console.log(req);
    let bathcid = req.query.batchid;
    let productid = req.query.productid;

    fabricHelper.submitTrx('addProduct', bathcid, productid)
        .catch(error => {
            res.status(400);
            res.json({'status' : 'failure', 'error' : error});
        })
        .then( trx => {
            // handle route
            clog(`TRX: ${trx}`);
            // send response
            res.status(200);
            res.json({'status' : 'success', 'response' : trx != undefined ? JSON.parse(trx) : 'No response from peers'});
        })
        ;

});

// // send batch
router.post('/send-batch', auth, async (req, res) => {
    fabricHelper.changeContext(THIS_ORG);

    clog(`Sending batch req-body : ${JSON.stringify(req.body)}`);
    // console.log(req);

    let bathcid = req.body.batchid;
    let cost = req.body.cost;
    let from = THIS_ORG;
    let to = req.body.reciever;
    // let date = new Date();
    let dd = req.body.departureDate;

    fabricHelper.submitTrx('sendBatch', from, to, bathcid, cost, dd)
        .catch(error => {
            res.status(400);
            res.json({'status' : 'failure', 'error' : error});
        })
        .then( trx => {
            // handle route
            clog(`TRX: ${trx}`);
            // send response
            res.status(200);
            res.json({'status' : 'success', 'response' : trx != undefined ? JSON.parse(trx) : 'No response from peers'});
        });
});

router.post('/authenticate', async (req, res) =>  {
    fabricHelper.changeContext(THIS_ORG);

    let user = req.body.username;
    let pass = req.body.password;
    console.log(req.body);
    console.log(user);


    let valid = await fabricHelper.userExists(user);
    res.status(200);
    clog(`[authenticate] valid = ${valid}`);
    if(valid == true) {
        res.json({'auth': 'true'});
    } else {
        res.json({'auth': 'false'});
    }
});


// mark batch as sent
router.post('/verify-sent',  (req, res) => {
    fabricHelper.changeContext(THIS_ORG);
   
    let trxid = req.body.trxid;
    let batchid = req.body.batchid;
    let sign = req.body.sign;

    fabricHelper.submitTrx('updateSenderSignature', trxid, batchid, sign)
        .catch( error => {
            res.status(404);
            res.json({'status' : 'failure', 'error' : error});
        })
        .then( trx => {
            // handle route
            clog(`TRX: ${trx}`);
            // send response
            res.status(200);
            res.json({'status' : 'success', 'response' : trx != undefined ? JSON.stringify(trx) : 'No response from peers'});
        });
});


module.exports = router;