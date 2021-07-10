
/**
 * 
 * 
 * 
 */

const express = require('express');
const api = express();
const crypto = require('crypto');
const cors = require('cors');
const port = 8001;
const fabricHelper = require('./utils/fabric-helper');

// importing routes
const manufacturerRoutes = require('./routes/manufacture-routes');
// const supplierRoutes = require('./routes/supplier-routes');
// const retailerRoutes = require('./routes/retialer-routes');


api.use(express.json());
api.use(cors());

api.use('/manufacturer', manufacturerRoutes);
// api.use('/supplier', supplierRoutes);
// api.use('/retailer', retailerRoutes);

api.get('/', (req, res) => {
    res.json({"status":"okay"});
});

(async () => {
    try {
        await fabricHelper.initConn();
        await fabricHelper.eventListener();
        api.listen(port, (error) => {
            if (error) {
                return console.log('Error: ' + err);
            }
            console.log(`Server listening on ${port}`)
        });
    
    } catch(err) {
        console.log("[API] Failed starting api ", err);
    }
})();



