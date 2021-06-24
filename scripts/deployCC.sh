#!/bin/bash

source scriptUtility.sh

CHANNEL_NAME="sc"
CC_NAME="supplychain" ## chaincode name 
CC_SRC_PATH="${PWD}/supplychain-chaincode/"
CC_SRC_LANGUAGE="javscript"
CC_VERSION="1.0"
CC_SEQUENCE="1"

DELAY="3"
MAX_RETRY="5"
VERBOSE="true"
CC_RUNTIME_LANGUAGE=node

INIT_REQUIRED=""
CC_END_POLICY=""
CC_COLL_CONFIG=""

println "executing with the following"
println "- CHANNEL_NAME: ${C_GREEN}${CHANNEL_NAME}${C_RESET}"
println "- CC_NAME: ${C_GREEN}${CC_NAME}${C_RESET}"
println "- CC_SRC_PATH: ${C_GREEN}${CC_SRC_PATH}${C_RESET}"
println "- CC_SRC_LANGUAGE: ${C_GREEN}${CC_SRC_LANGUAGE}${C_RESET}"
println "- CC_VERSION: ${C_GREEN}${CC_VERSION}${C_RESET}"
println "- CC_SEQUENCE: ${C_GREEN}${CC_SEQUENCE}${C_RESET}"
println "- DELAY: ${C_GREEN}${DELAY}${C_RESET}"
println "- MAX_RETRY: ${C_GREEN}${MAX_RETRY}${C_RESET}"
println "- VERBOSE: ${C_GREEN}${VERBOSE}${C_RESET}"

CC_SRC_LANGUAGE=$(echo "$CC_SRC_LANGUAGE" | tr [:upper:] [:lower:])

FABRIC_CFG_PATH=$PWD/../config/

## Make sure that the path the chaincode exists if provided
if [ ! -d "$CC_SRC_PATH" ]; then
  fatalln "Path to chaincode does not exist. Please provide different path"
fi



# import utils
. scripts/envVar.sh

packageChaincode() {
  set -x
  peer lifecycle chaincode package ${CC_NAME}.tar.gz --path ${CC_SRC_PATH} --lang ${CC_RUNTIME_LANGUAGE} --label ${CC_NAME}_${CC_VERSION} >&log.txt
  res=$?
  { set +x; } 2>/dev/null
  cat log.txt
  verifyResult $res "Chaincode packaging has failed"
  successln "Chaincode is packaged"
}

# installChaincode PEER ORG
installChaincode() {
  ORG=$1
  setGlobals $ORG
  set -x
  peer lifecycle chaincode install ${CC_NAME}.tar.gz >&log.txt
  res=$?
  { set +x; } 2>/dev/null
  cat log.txt
  verifyResult $res "Chaincode installation on peer0.org${ORG} has failed"
  successln "Chaincode is installed on peer0.org${ORG}"
}

# queryInstalled PEER ORG
queryInstalled() {
  ORG=$1
  setGlobals $ORG
  set -x
  peer lifecycle chaincode queryinstalled >&log.txt
  res=$?
  { set +x; } 2>/dev/null
  cat log.txt
  PACKAGE_ID=$(sed -n "/${CC_NAME}_${CC_VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
  verifyResult $res "Query installed on peer0.org${ORG} has failed"
  successln "Query installed successful on peer0.org${ORG} on channel"
}

# approveForMyOrg VERSION PEER ORG
approveForMyOrg() {
  ORG=$1
  setGlobals $ORG
  set -x
  peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.ssc-hhm.com --tls --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} --package-id ${PACKAGE_ID} --sequence ${CC_SEQUENCE} ${INIT_REQUIRED} ${CC_END_POLICY} ${CC_COLL_CONFIG} >&log.txt
  res=$?
  { set +x; } 2>/dev/null
  cat log.txt
  verifyResult $res "Chaincode definition approved on peer0.org${ORG} on channel '$CHANNEL_NAME' failed"
  successln "Chaincode definition approved on peer0.org${ORG} on channel '$CHANNEL_NAME'"
}

# checkCommitReadiness VERSION PEER ORG
checkCommitReadiness() {
  ORG=$1
  shift 1
  setGlobals $ORG
  infoln "Checking the commit readiness of the chaincode definition on peer0.org${ORG} on channel '$CHANNEL_NAME'..."
  local rc=1
  local COUNTER=1
  # continue to poll
  # we either get a successful response, or reach MAX RETRY
  while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ]; do
    sleep $DELAY
    infoln "Attempting to check the commit readiness of the chaincode definition on peer0.org${ORG}, Retry after $DELAY seconds."
    set -x
    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} --sequence ${CC_SEQUENCE} ${INIT_REQUIRED} ${CC_END_POLICY} ${CC_COLL_CONFIG} --output json >&log.txt
    res=$?
    { set +x; } 2>/dev/null
    let rc=0
    for var in "$@"; do
      grep "$var" log.txt &>/dev/null || let rc=1
    done
    COUNTER=$(expr $COUNTER + 1)
  done
  cat log.txt
  if test $rc -eq 0; then
    infoln "Checking the commit readiness of the chaincode definition successful on peer0.org${ORG} on channel '$CHANNEL_NAME'"
  else
    fatalln "After $MAX_RETRY attempts, Check commit readiness result on peer0.org${ORG} is INVALID!"
  fi
}

# commitChaincodeDefinition VERSION PEER ORG (PEER ORG)...
commitChaincodeDefinition() {
 
  # while 'peer chaincode' command can get the orderer endpoint from the
  # peer (if join was successful), let's supply it directly as we know
  # it using the "-o" option
  set -x
  # peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.ssc-hhm.com --tls --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} $PEER_CONN_PARMS --version ${CC_VERSION} --sequence ${CC_SEQUENCE} ${INIT_REQUIRED} ${CC_END_POLICY} ${CC_COLL_CONFIG} >&log.txt
  peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.ssc-hhm.com --tls --cafile ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/orderers/orderer.ssc-hhm.com/msp/tlscacerts/tlsca.ssc-hhm.com-cert.pem --channelID ${CHANNEL_NAME} --name supplychain --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/peers/peer0.manufacturer.ssc-hhm.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/peers/peer0.supplier.ssc-hhm.com/tls/ca.crt --peerAddresses localhost:11051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/peers/peer0.retailer.ssc-hhm.com/tls/ca.crt --version 1.0 --sequence 1 

  res=$?
  { set +x; } 2>/dev/null
  cat log.txt
  verifyResult $res "Chaincode definition commit failed on peer0.org${ORG} on channel '$CHANNEL_NAME' failed"
  successln "Chaincode definition committed on channel '$CHANNEL_NAME'"
}

# queryCommitted ORG
queryCommitted() {
  ORG=$1
  setGlobals $ORG
  EXPECTED_RESULT="Version: ${CC_VERSION}, Sequence: ${CC_SEQUENCE}, Endorsement Plugin: escc, Validation Plugin: vscc"
  infoln "Querying chaincode definition on peer0.org${ORG} on channel '$CHANNEL_NAME'..."
  local rc=1
  local COUNTER=1
  # continue to poll
  # we either get a successful response, or reach MAX RETRY
  while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ]; do
    sleep $DELAY
    infoln "Attempting to Query committed status on peer0.org${ORG}, Retry after $DELAY seconds."
    set -x
    peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name ${CC_NAME} >&log.txt
    res=$?
    { set +x; } 2>/dev/null
    test $res -eq 0 && VALUE=$(cat log.txt | grep -o '^Version: '$CC_VERSION', Sequence: [0-9]*, Endorsement Plugin: escc, Validation Plugin: vscc')
    test "$VALUE" = "$EXPECTED_RESULT" && let rc=0
    COUNTER=$(expr $COUNTER + 1)
  done
  cat log.txt
  if test $rc -eq 0; then
    successln "Query chaincode definition successful on peer0.org${ORG} on channel '$CHANNEL_NAME'"
  else
    fatalln "After $MAX_RETRY attempts, Query chaincode definition result on peer0.org${ORG} is INVALID!"
  fi
}


chaincodeQuery() {
  ORG=$1
  setGlobals $ORG
  infoln "Querying on peer0.org${ORG} on channel '$CHANNEL_NAME'..."
  local rc=1
  local COUNTER=1
  # continue to poll
  # we either get a successful response, or reach MAX RETRY
  while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ]; do
    sleep $DELAY
    infoln "Attempting to Query peer0.org${ORG}, Retry after $DELAY seconds."
    set -x
    peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["queryAllCars"]}' >&log.txt
    res=$?
    { set +x; } 2>/dev/null
    let rc=$res
    COUNTER=$(expr $COUNTER + 1)
  done
  cat log.txt
  if test $rc -eq 0; then
    successln "Query successful on peer0.org${ORG} on channel '$CHANNEL_NAME'"
  else
    fatalln "After $MAX_RETRY attempts, Query result on peer0.org${ORG} is INVALID!"
  fi
}

##  package the chaincode
packageChaincode

## Install chaincode on peer0 of manufacturer, supplier , retailer
infoln "Installing chaincode on peer0.manufacturer..."
installChaincode "manufacturer"
infoln "Install chaincode on peer0.retailer..."
installChaincode "retailer"
infoln "Install chaincode on peer0.supplier..."
installChaincode "supplier"

## query whether the chaincode is installed
queryInstalled "manufacturer"

## approve the definition for manufacturer
approveForMyOrg "manufacturer"

## check whether the chaincode definition is ready to be committed
## expect manufacturer to have approved and supplier, retailer not to
checkCommitReadiness "manufacturer" "\"ManufacturerMSP\": true" "\"SupplierMSP\": false" "\"RetailerMSP\": false" 
checkCommitReadiness "supplier" "\"ManufacturerMSP\": true" "\"SupplierMSP\": false" "\"RetailerMSP\": false"
checkCommitReadiness "retailer" "\"ManufacturerMSP\": true" "\"SupplierMSP\": false" "\"RetailerMSP\": false"

## now approve also for org2
approveForMyOrg "supplier"

## check whether the chaincode definition is ready to be committed
## expect them both to have approved
checkCommitReadiness "manufacturer" "\"ManufacturerMSP\": true" "\"SupplierMSP\": true" "\"RetailerMSP\": false" 
checkCommitReadiness "supplier" "\"ManufacturerMSP\": true" "\"SupplierMSP\": true" "\"RetailerMSP\": false"
checkCommitReadiness "retailer" "\"ManufacturerMSP\": true" "\"SupplierMSP\": true" "\"RetailerMSP\": false"

## now approve also for org2
approveForMyOrg "retailer"

## check whether the chaincode definition is ready to be committed
## expect them both to have approved
checkCommitReadiness "manufacturer" "\"ManufacturerMSP\": true" "\"SupplierMSP\": true" "\"RetailerMSP\": true" 
checkCommitReadiness "supplier" "\"ManufacturerMSP\": true" "\"SupplierMSP\": true" "\"RetailerMSP\": true"
checkCommitReadiness "retailer" "\"ManufacturerMSP\": true" "\"SupplierMSP\": true" "\"RetailerMSP\": true"

## now that we know for sure both orgs have approved, commit the definition
commitChaincodeDefinition "manufacturer" "supplier" "retailer"

## query on both orgs to see that the definition committed successfully
queryCommitted "manufacturer"
queryCommitted "supplier"
queryCommitted "retailer"

exit 0
