const express = require('express');
const router = express.Router();
const fabricHelper = require('../utils/fabric-helper');
const auth = require('../utils/auth');


const clog = str => {
    console.log(`[manufacturer-router] ${str}`);
};

router.route('/').get( (req, res) => {
    res.json({
        'status' : "manufacturer is alive"
    });
});

router.route('/init-ledger').post( async (req, res) => {
    // just for testing
    let trx = await fabricHelper.submitTrx('initLedger');
    // .then( trx => {
    res.status(200);
    res.json({'status' : 'success', 'response' : trx});
    // })
    // .catch( err => {
        // res.status(500);
        // res.json({'status' : 'error', 'error' : err});
    // });

});

router.route('/batches').get( async (req, res) => {
    if(  await auth(fabricHelper, req.headers) == false ) {
        clog(` [WARNING] Unautherized access !!`);
        res.status(404);
        res.json({'error' : 'Unautherized Access !!'});
        return;
    }
    // console.log(req.headers);
    // handle route
    clog('Initiating transaction ....');
    let trx = await fabricHelper.submitTrx('getAllBatches');
    clog(`TRX ${ trx}`);
    // send response
    res.status(200);
    res.json({'status' : 'success', 'response' : trx});
});


// router.get('/batch/:id', (req, res) {
//     if( ! auth(req.headers) ) {
//         // send error
//     }
    
//     // handle route

//     // send response
// });


// // add a new batch
// router.post('/batch', (req, res) {
//     if( ! auth(req.headers) ) {
//         // send error
//     }
    
//     // handle route

//     // send response
// });

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