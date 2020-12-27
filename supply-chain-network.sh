#!/bin/bash

#
# Bash Script to manage our Supply Chain Network
# 


# prepending $PWD/../bin to PATH to ensure we are picking up the correct binaries
# this may be commented out to resolve installed version of tools if desired
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${PWD}/configtx
export VERBOSE=false

source scriptUtility.sh

# Create Organization crypto material using cryptogen or CAs
function createOrgs() {

  infoln "Creating Peer Orgs and Orderer ...."

  if [ -d "organizations/peerOrganizations" ]; then
    rm -Rf organizations/peerOrganizations && rm -Rf organizations/ordererOrganizations
  fi

  # Create crypto material using cryptogen
  if [ "$CRYPTO" == "cryptogen" ]; then
    which cryptogen
    if [ "$?" -ne 0 ]; then
      fatalln "cryptogen tool not found. exiting"
    fi
    infoln "Generate certificates using cryptogen tool"

    infoln "Creating Manufacturer's Identities"

    set -x
    cryptogen generate --config=./organizations/cryptogen/crypto-config-manufacturer.yaml --output="organizations"
    res=$?
    { set +x; } 2>/dev/null             ## 2 here means stderr, '>' means to redirect LHS to RHS of '>'.
                                        ## /dev/null is a null file, 
                                        ## 2>/dev/null means to throw all errors to /dev/null, meaning 
                                        ## dont show it
    if [ $res -ne 0 ]; then
      fatalln "Failed to generate certificate for Manufacturer..."
    fi

    infoln "Creating Supplier's Identities"

    set -x
    cryptogen generate --config=./organizations/cryptogen/crypto-config-supplier.yaml --output="organizations"
    res=$?
    { set +x; } 2>/dev/null
    if [ $res -ne 0 ]; then
      fatalln "Failed to generate certificates for Supplier..."
    fi

    infoln "Creating Retailer's Identities"

    set -x
    cryptogen generate --config=./organizations/cryptogen/crypto-config-retailer.yaml --output="organizations"
    res=$?
    { set +x; } 2>/dev/null
    if [ $res -ne 0 ]; then
      fatalln "Failed to generate certificates for Retailer..."
    fi

    infoln "Creating Orderer Org Identities"

    set -x
    cryptogen generate --config=./organizations/cryptogen/crypto-config-orderer.yaml --output="organizations"
    res=$?
    { set +x; } 2>/dev/null
    if [ $res -ne 0 ]; then
      fatalln "Failed to generate certificates for Orderer..."
    fi

  fi

  # Create crypto material using Fabric CAs
#   if [ "$CRYPTO" == "Certificate Authorities" ]; then

#     infoln "Generate certificates using Fabric CA's"

#     IMAGE_TAG=${CA_IMAGETAG} docker-compose -f $COMPOSE_FILE_CA up -d 2>&1

#     . organizations/fabric-ca/registerEnroll.sh

#   while :
#     do
#       if [ ! -f "organizations/fabric-ca/org1/tls-cert.pem" ]; then
#         sleep 1
#       else
#         break
#       fi
#     done

#     infoln "Create Org1 Identities"

#     createOrg1

#     infoln "Create Org2 Identities"

#     createOrg2

#     infoln "Create Orderer Org Identities"

#     createOrderer

#   fi

#   infoln "Generate CCP files for Org1 and Org2"
#   ./organizations/ccp-generate.sh
}


# Bring up Peer and Orderer Nodes using Docker Compose
function networkUp() {

    if [ ! -d "organizations/peerOrganizations" ]; then
        createOrgs
    else
        warnln "Something went wrong in bringing network up"
    fi
}

function networkDown() {

  # remove peer orgs dir if exists
  if [ -d "organizations/peerOrganizations" ]; then
    warnln "Removing peer and orderer configurations"
    rm -Rf organizations/peerOrganizations && rm -Rf organizations/ordererOrganizations
  fi
}

function printHelp() {
    warnln "Please specify arguments : [up, down]"
}

######################################
#      Script Begins Below           #
######################################

#
# Setting Some needed env variables
#

CRYPTO="cryptogen"

## Parse mode
if [[ $# -lt 1 ]] ; then
  printHelp
  exit 0
else
  MODE=$1
fi

if [ "$MODE" == "up" ]; then
  infoln "Bringing up Supply Chain Network ..."
  networkUp
elif [ "$MODE" == "down" ]; then
  infoln "Bringing down Supply Chain Network ..."
  networkDown
fi 
