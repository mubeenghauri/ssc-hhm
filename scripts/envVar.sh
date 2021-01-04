

# This is a collection of bash functions used by different scripts

source scriptUtility.sh

export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/ssc-hhm.com/orderers/orderer.ssc-hhm.com/msp/tlscacerts/tlsca.ssc-hhm.com-cert.pem
export PEER0_MANUFACTURER_CA=${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/peers/peer0.manufacturer.ssc-hhm.com/tls/ca.crt
export PEER0_SUPPLIER_CA=${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/peers/peer0.supplier.ssc-hhm.com/tls/ca.crt
export PEER0_RETAILER_CA=${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/peers/peer0.retailer.ssc-hhm.com/tls/ca.crt

# Set OrdererOrg.Admin globals
setOrdererGlobals() {
  export CORE_PEER_LOCALMSPID="OrdererMSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/ordererOrganizations/ssc-hhm.com/orderers/orderer.ssc-hhm.com/msp/tlscacerts/tlsca.ssc-hhm.com-cert.pem
  export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/ordererOrganizations/ssc-hhm.com/users/Admin@ssc-hhm.com/msp
}

# Set environment variables for the peer org
setGlobals() {
  local USING_ORG=""
  if [ -z "$OVERRIDE_ORG" ]; then
    USING_ORG=$1
  else
    USING_ORG="${OVERRIDE_ORG}"
  fi
  infoln "Using organization ${USING_ORG}"
  if [ $USING_ORG == "manufacturer" ]; then
    export CORE_PEER_LOCALMSPID="ManufacturerMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_MANUFACTURER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/users/Admin@manufacturer.ssc-hhm.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
  elif [ $USING_ORG == "supplier" ]; then
    export CORE_PEER_LOCALMSPID="SupplierMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_SUPPLIER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/users/Admin@supplier.ssc-hhm.com/msp
    export CORE_PEER_ADDRESS=localhost:9051

  elif [ $USING_ORG == "retailer" ]; then
    export CORE_PEER_LOCALMSPID="RetailerMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_RETAILER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/users/Admin@retailer.ssc-hhm.com/msp
    export CORE_PEER_ADDRESS=localhost:11051
  else
    errorln "ORG Unknown"
  fi

  if [ "$VERBOSE" == "true" ]; then
    env | grep CORE
  fi
}

# parsePeerConnectionParameters $@
# Helper function that sets the peer connection parameters for a chaincode
# operation
parsePeerConnectionParameters() {

  PEER_CONN_PARMS=""
  PEERS=""
  while [ "$#" -gt 0 ]; do
    setGlobals $1
    PEER="peer0.$1"
    ## Set peer addresses
    PEERS="$PEERS $PEER"
    PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses $CORE_PEER_ADDRESS"
    ## Set path to TLS certificate
    TLSINFO=$(eval echo "--tlsRootCertFiles \$PEER0_$1_CA")
    PEER_CONN_PARMS="$PEER_CONN_PARMS $TLSINFO"
    # shift by one to get to the next organization
    shift
  done
  # remove leading space for output
  PEERS="$(echo -e "$PEERS" | sed -e 's/^[[:space:]]*//')"
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    fatalln "$2"
  fi
}
