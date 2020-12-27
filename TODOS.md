Supply Chain Network Hyperledger Fabric 2.0
===========================================


# TODOS
=======


## Docker Containers
    - Create Docker file for Certificate Authority       [DONE]
      At docker/docker-compose-ca.yaml
      
    - Create Docker file for Supply Chain Network
      At docker/docker-compose-supply-chain-network.yaml 
      This docker-compose file will contain configurations for our supply chain network  [two peer done, 1 left (i.e Retailer)]

## Genesis Block Configuration      [DONE]
    - Configure system genesis block
      At configtx/configtx.yaml

## Organizations Configurations

   ### Organization Crypto Material Configuration
        - Create crypto configuration file for :
            1. Orderer      [DONE]
                At organizations/cryptogen/crypto-config-orderer.yaml
            2. Manufacturer [DONE]
                At organizations/cryptogen/crypto-config-manufacturer.yaml
            3. Supplier     [DONE]
                At organizations/cryptogen/crypto-config-supplier.yaml
            4. Retailer     [DONE]
                At organizations/cryptogen/crypto-config-manufacturer.yaml
   
   ### Organizations Fabric Certificate Athurity Configuration
        - Create certificate authority configurations for :
            1. Orderer
                At organizations/fabric-ca/ordererOrg/fabric-ca-server-config.yaml
            2. Manufacturer
                At organizations/fabric-ca/manufacturer/fabric-ca-server-config.yaml
            3. Supplier
                At organizations/fabric-ca/manufacturer/fabric-ca-server-config.yaml
            4. Retailer
                At organizations/fabric-ca/manufacturer/fabric-ca-server-config.yaml

## Network start up script [DOING]
    - Complete network startup script

## Chaincodes
    - Make necessary chaincodes

## Documentation
    - Maintain documentation of whole project