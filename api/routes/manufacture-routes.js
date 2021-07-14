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

router.post('/init-ledger', auth, async (req, res) => {
    // just for testing
    let trx = await fabricHelper.submitTrx('initLedger');
    res.status(200);
    res.json({'status' : 'success', 'response' : trx});
});

router.get('/batches', auth, async (req, res) => {
    // handle route
    clog('Initiating transaction ....');
    let trx = await fabricHelper.submitTrx('getAllBatches');
    clog(`TRX ${ trx}`);

    // send response
    res.status(200);
    res.json({'status' : 'success', 'response' : trx});
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

    clog(`Adding batch req-body : ${JSON.stringify(req.query)}`);
    // console.log(req);
    let bathcid = req.query.batchid;
    let trx = await fabricHelper.submitTrx('addBatch', bathcid, 'manufacturer');
    // handle route
    clog(`TRX: ${trx}`);
    // send response
    res.status(200);
    res.json({'status' : 'success', 'response' : JSON.parse(trx)});
});

// // add a new item
router.post('/item', auth, async (req, res) => {

    clog(`Adding item req-body : ${JSON.stringify(req.query)}`);
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

    clog(`Sending batch req-body : ${JSON.stringify(req.query)}`);
    // console.log(req);
    let bathcid = req.query.batchid;
    let cost = req.query.cost;
    let from = THIS_ORG;
    let to = req.query.to;
    let date = new Date();
    let dd = date.getDate();

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

// // recieve batch
router.post('/recieve-batch', auth, async (req, res) => {

    clog(`Recieve batch req-body : ${JSON.stringify(req.query)}`);
    // console.log(req);
    let bathcid = req.query.batchid;
    let trxid = req.query.trxid;
    let date = new Date();
    let dd = date.getDate();

    fabricHelper.submitTrx('recieveBatch', from, to, bathcid, cost, dd)
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
// // send batch
// router.post('/send', (req, res) {
//     if( ! auth(req.headers) ) {
//         // send error
//     }
    
//     // handle route

//     // send response
// });

// // mark batch as sent
// router.post('/verify-sent', (req, res) {
//     if( ! auth(req.headers) ) {
//         // send error
//     }
    
//     // handle route

//     // send response
// });

module.exports = router;