Supply Chain Network Hyperledger Fabric 2.0
===========================================


# TODOS
=======


## Docker Containers    [DONE]
    - Create Docker file for Certificate Authority       [DONE]
      At docker/docker-compose-ca.yaml
      
    - Create Docker file for Supply Chain Network
      At docker/docker-compose-supply-chain-network.yaml 
      This docker-compose file will contain configurations for our supply chain network  [DONE]

## Genesis Block Configuration      [DONE]
    - Configure system genesis block
      At configtx/configtx.yaml

## Organizations Configurations

   ### Organization Crypto Material Configuration       [DONE]
        - Create crypto configuration file for :
            1. Orderer      [DONE]
                At organizations/cryptogen/crypto-config-orderer.yaml
            2. Manufacturer [DONE]
                At organizations/cryptogen/crypto-config-manufacturer.yaml
            3. Supplier     [DONE]
                At organizations/cryptogen/crypto-config-supplier.yaml
            4. Retailer     [DONE]
                At organizations/cryptogen/crypto-config-manufacturer.yaml
   

   ##### Generate CCP [DONE]
        - Create CCP script  [DONE]
            At organization/ccp-generate.sh
        - Create RegisterUser script at [NO NEED]
            At organization/fabric-ca/registerEnroll.shs (only needed if $CRYPTO == "Certificate Authorities")

## Network start up script [DONE]
    - Complete network startup script
        Functions to implement
        - networkUp [DONE]
        - networkUp [DONE]
        - createChannel [DONE]
        - deployCC  [DONE]

## Helper Scripts [DONE]
    - Create createChannel script 
        At scripts/createChannel.sh [DONE]
## Chaincodes [DONE]
    - Make necessary chaincodes 

## Documentation
    - Maintain documentation of whole project



# TODOs FOR FYP 2
=================

   ### Organizations Fabric Certificate Athurity Configuration      [DONE]
        - Create certificate authority configurations for :
            1. Orderer      [DONE]
                At organizations/fabric-ca/ordererOrg/fabric-ca-server-config.yaml
            2. Manufacturer [DONE]
                At organizations/fabric-ca/manufacturer/fabric-ca-server-config.yaml
            3. Supplier     [DONE]
                At organizations/fabric-ca/supplier/fabric-ca-server-config.yaml
            4. Retailer     [DONE]
                At organizations/fabric-ca/retailer/fabric-ca-server-config.yaml
        
        - Create Docker compose file
            At docker/docker-compose-ca.yaml
        
        - Create registerEnroll script 
            (Fix paths)
            organtizations/fabric-ca/registerEnroll.sh

   ### Create Client application.