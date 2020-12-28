#!/bin/bash

#####################################################
# Bash Script to manage our Supply Chain Network    #
# @author: mubeenghauri                             #
#####################################################

###################################################################################
# prepending $PWD/../bin to PATH to ensure we are picking up the correct binaries #
# this may be commented out to resolve installed version of tools if desired      #
###################################################################################
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${PWD}/configtx
export VERBOSE=false

source scriptUtility.sh

################################
# Helper Functions Begin Below #
################################

########################################################################
# Obtain CONTAINER_IDS and remove them                                 #
# TODO Might want to make this optional - could clear other containers #
# This function is called when you bring a network down                #
########################################################################
function clearContainers() {
  CONTAINER_IDS=$(docker ps -a | awk '($2 ~ /dev-peer.*/) {print $1}')
  if [ -z "$CONTAINER_IDS" -o "$CONTAINER_IDS" == " " ]; then
    infoln "No containers available for deletion"
  else
    docker rm -f $CONTAINER_IDS
  fi
}

#################################################################
# Delete any images that were generated as a part of this setup #
# specifically the following images are often left behind:      #
# This function is called when you bring the network down       #
#################################################################
function removeUnwantedImages() {
  DOCKER_IMAGE_IDS=$(docker images | awk '($1 ~ /dev-peer.*/) {print $3}')
  if [ -z "$DOCKER_IMAGE_IDS" -o "$DOCKER_IMAGE_IDS" == " " ]; then
    infoln "No images available for deletion"
  else
    docker rmi -f $DOCKER_IMAGE_IDS
  fi
}

# Create Organization crypto material using cryptogen
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

  infoln "Generate CCP files for Manufacturer, Supplier and Retailer"
  ./organizations/ccp-generate.sh
}


# Generate orderer system channel genesis block.
function createConsortium() {

  which configtxgen
  if [ "$?" -ne 0 ]; then
    fatalln "configtxgen tool not found."
  fi

  infoln "Generating Orderer Genesis block"

  # Note: For some unknown reason (at least for now) the block file can't be
  # named orderer.genesis.block or the orderer will fail to launch!
  set -x
  configtxgen -profile SupplyChainNetworkOrdererGenesis -channelID system-channel -outputBlock ./system-genesis-block/genesis.block
  res=$?
  { set +x; } 2>/dev/null
  if [ $res -ne 0 ]; then
    fatalln "Failed to generate orderer genesis block..."
  fi
}


# Bring up Peer and Orderer Nodes using Docker Compose
function networkUp() {

  if [ ! -d "organizations/peerOrganizations" ]; then
    createOrgs
    createConsortium
  else
    warnln "organizations/peerOrganizations already exist !!! It shouldnt for development, LOOK INTO IT !!"
  fi

  COMPOSE_FILES="-f ${COMPOSE_FILE_BASE}"

  IMAGE_TAG=$IMAGETAG docker-compose ${COMPOSE_FILES} up -d 2>&1

  docker ps -a
  if [ $? -ne 0 ]; then
    fatalln "Unable to start network"
  fi

}

function networkDown() {

  # remove peer orgs dir if exists
  if [ -d "organizations/peerOrganizations" ]; then
    warnln "Removing peer and orderer configurations"
    rm -Rf organizations/peerOrganizations && rm -Rf organizations/ordererOrganizations
  fi

  # remove unwanted changes 
  # Bring down the network, deleting the volumes
  # Cleanup the chaincode containers
  clearContainers

  #Cleanup images
  removeUnwantedImages

  # remove orderer block and other channel configuration transactions and certs
  docker run --rm -v $(pwd):/data busybox sh -c 'cd /data && rm -rf system-genesis-block/*.block organizations/peerOrganizations organizations/ordererOrganizations'
  
  ## remove fabric ca artifacts for manufacturer
  docker run --rm -v $(pwd):/data busybox sh -c 'cd /data && rm -rf organizations/fabric-ca/manufacturer/msp organizations/fabric-ca/manufacturer/tls-cert.pem organizations/fabric-ca/manufacturer/ca-cert.pem organizations/fabric-ca/manufacturer/IssuerPublicKey organizations/fabric-ca/manufacturer/IssuerRevocationPublicKey organizations/fabric-ca/manufacturer/fabric-ca-server.db'
  
  ## remove fabric ca artifacts for supplier
  docker run --rm -v $(pwd):/data busybox sh -c 'cd /data && rm -rf organizations/fabric-ca/supplier/msp organizations/fabric-ca/supplier/tls-cert.pem organizations/fabric-ca/supplier/ca-cert.pem organizations/fabric-ca/supplier/IssuerPublicKey organizations/fabric-ca/supplier/IssuerRevocationPublicKey organizations/fabric-ca/supplier/fabric-ca-server.db'
  
  ## remove fabric ca artifacts for retailer
  docker run --rm -v $(pwd):/data busybox sh -c 'cd /data && rm -rf organizations/fabric-ca/retailer/msp organizations/fabric-ca/retailer/tls-cert.pem organizations/fabric-ca/retailer/ca-cert.pem organizations/fabric-ca/retailer/IssuerPublicKey organizations/fabric-ca/retailer/IssuerRevocationPublicKey organizations/fabric-ca/retailer/fabric-ca-server.db'

  ## remove fabric ca artifacts for orderer
  docker run --rm -v $(pwd):/data busybox sh -c 'cd /data && rm -rf organizations/fabric-ca/ordererOrg/msp organizations/fabric-ca/ordererOrg/tls-cert.pem organizations/fabric-ca/ordererOrg/ca-cert.pem organizations/fabric-ca/ordererOrg/IssuerPublicKey organizations/fabric-ca/ordererOrg/IssuerRevocationPublicKey organizations/fabric-ca/ordererOrg/fabric-ca-server.db'

  # remove channel and script artifacts
  docker run --rm -v $(pwd):/data busybox sh -c 'cd /data && rm -rf channel-artifacts log.txt *.tar.gz'
}

function printHelp() {
    warnln "Please specify arguments : [up, down]"
}

######################################
#      Script Begins Below           #
######################################

#####################################
# Setting Some needed env variables #
#####################################

# using cryptogen for generating certificates and configs
CRYPTO="cryptogen"
# use this as the default docker-compose yaml definition
COMPOSE_FILE_BASE=docker/docker-compose-supplychain-network.yaml
# default image tag
IMAGETAG="latest"

##############
# Parse mode #
##############
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
