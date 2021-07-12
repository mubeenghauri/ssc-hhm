/**
 * REST Api for serving peers 
 * using HLF (Hyperledger Fabric)
 * 
 * @author SSC-HHM
 */
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const api = express();

const fabricHelper = require('./utils/fabric-helper');

const port = 8001;

// importing routes
const manufacturerRoutes = require('./routes/manufacture-routes');
// const supplierRoutes = require('./routes/supplier-routes');
// const retailerRoutes = require('./routes/retialer-routes');


api.use(express.json());
api.use(cors());
api.use(helmet());
api.use(morgan('tiny'));


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



