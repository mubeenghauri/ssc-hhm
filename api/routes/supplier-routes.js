const express = require('express');
const router = express.Router();
const fabricHelper = require('../utils/fabric-helper');
const auth = require('../utils/auth');

const THIS_ORG = 'Supplier';
// const THIS_USER = 'supplierUser';
const clog = str => {
    console.log(`[supplier-router] ${str}`);
};

router.route('/').get( (req, res) => {
    res.json({
        'status' : "supplier is alive"
    });
});


router.get('/batches', auth, async (req, res) => {
    // handle route
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
    fabricHelper.changeContext(THIS_ORG);
    
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
            res.json({'status' : 'success', 'response' : trx != undefined ? JSON.stringify(trx) : 'No response from peers'});
        });
});

// // recieve batch
router.post('/recieve-batch', auth, async (req, res) => {
    fabricHelper.changeContext(THIS_ORG);

    clog(`Recieve batch req-body : ${JSON.stringify(req.body)}`);
    // console.log(req);
    let batchid = req.body.batchid;
    let trxid = req.body.trxid;
    let date = req.body.date;
    let reciever = req.body.reciever;

    fabricHelper.submitTrx('recieveBatch', reciever, trxid, batchid, date)
        .catch(error => {
            res.status(400);
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

router.post('/authenticate', async (req, res) =>  {
    let user = req.body.username;
    let pass = req.body.password;
    console.log(req.body);
    console.log(user);

    fabricHelper.changeContext(THIS_ORG);

    let valid = await fabricHelper.userExists(user);
    res.status(200);
    clog(`[authenticate] valid = ${valid}`);
    if(valid == true) {
        res.json({'auth': 'true'});
    } else {
        res.json({'auth': 'false'});
    }
});

router.post('/register-user', async (req, res) => {
    let user = req.body.username;
    let pass = req.body.pass;
    let affl = req.body.affl;
    clog(`${user}, ${pass}, ${affl}`);
    fabricHelper.changeContext(THIS_ORG);

    try {
        await fabricHelper.registerAndEnrollUser( user, affl);
        res.status(200);
        res.json({'status': 'success'});
    } catch(e) {
        res.status(200);
        res.json({'status': 'failure', 'error' : `${e}`});
    }
    
});

// mark batch as sent
router.post('/verify-sent',  (req, res) => {
   
    let trxid = req.body.trxid;
    let batchid = req.body.batchid;
    let sign = req.body.sign;
    fabricHelper.changeContext(THIS_ORG);

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


// mark batch as recieved
router.post('/verify-recieved',  (req, res) => {
   
    let trxid = req.body.trxid;
    let batchid = req.body.batchid;
    let sign = req.body.sign;
    fabricHelper.changeContext(THIS_ORG);

    fabricHelper.submitTrx('updateRecieverSignature', trxid, batchid, sign)
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