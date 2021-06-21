
source scriptUtility.sh

function createManufacturerCA() {
  infoln "Enrolling the CA admin for Manufacturer"
  mkdir -p organizations/peerOrganizations/manufacturer.ssc-hhm.com/

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/
  #  rm -rf $FABRIC_CA_CLIENT_HOME/fabric-ca-client-config.yaml
  #  rm -rf $FABRIC_CA_CLIENT_HOME/msp

  # Enroll Organization Admin
      set -x
  fabric-ca-client enroll -u https://manufactureradmin:manufactureradminpw@localhost:7054 --caname ca-manufacturer --tls.certfiles ${PWD}/organizations/fabric-ca/manufacturer/tls-cert.pem
      { set +x; } 2>/dev/null

  # Populate MSP Configuration file with relevant configs
  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-manufacturer.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-manufacturer.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-manufacturer.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-manufacturer.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/msp/config.yaml

  # registering credentials for peer0 
  infoln "Register peer0 for Manufacturer"
  set -x
  fabric-ca-client register --caname ca-manufacturer --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/organizations/fabric-ca/manufacturer/tls-cert.pem
  { set +x; } 2>/dev/null

  # registering client's credentials.
  infoln "Register user"
  set -x
  fabric-ca-client register --caname ca-manufacturer --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${PWD}/organizations/fabric-ca/manufacturer/tls-cert.pem
  { set +x; } 2>/dev/null


  # registering organization's admin's credentials
  infoln "Register the manufacturer org admin"
  set -x
  fabric-ca-client register --caname ca-manufacturer --id.name manufacturerOrgadmin --id.secret manufactureradminpw --id.type admin --tls.certfiles ${PWD}/organizations/fabric-ca/manufacturer/tls-cert.pem
  { set +x; } 2>/dev/null

  mkdir -p organizations/peerOrganizations/manufacturer.ssc-hhm.com/peers
  mkdir -p organizations/peerOrganizations/manufacturer.ssc-hhm.com/peers/peer0.manufacturer.ssc-hhm.com

  # Generating MSP certificates. THe ones this orgs MSP will use to 
  infoln "Generate the peer0 msp"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 --caname ca-manufacturer -M ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/peers/peer0.manufacturer.ssc-hhm.com/msp --csr.hosts peer0.manufacturer.ssc-hhm.com --tls.certfiles ${PWD}/organizations/fabric-ca/manufacturer/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/msp/config.yaml ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/peers/peer0.manufacturer.ssc-hhm.com/msp/config.yaml

  infoln "Generate the peer0-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 --caname ca-manufacturer -M ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/peers/peer0.manufacturer.ssc-hhm.com/tls --enrollment.profile tls --csr.hosts peer0.manufacturer.ssc-hhm.com --csr.hosts localhost --tls.certfiles ${PWD}/organizations/fabric-ca/manufacturer/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/peers/peer0.manufacturer.ssc-hhm.com/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/peers/peer0.manufacturer.ssc-hhm.com/tls/ca.crt
  cp ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/peers/peer0.manufacturer.ssc-hhm.com/tls/signcerts/* ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/peers/peer0.manufacturer.ssc-hhm.com/tls/server.crt
  cp ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/peers/peer0.manufacturer.ssc-hhm.com/tls/keystore/* ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/peers/peer0.manufacturer.ssc-hhm.com/tls/server.key

  mkdir -p ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/msp/tlscacerts
  cp ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/peers/peer0.manufacturer.ssc-hhm.com/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/msp/tlscacerts/ca.crt

  mkdir -p ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/tlsca
  cp ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/peers/peer0.manufacturer.ssc-hhm.com/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/tlsca/tlsca.manufacturer.ssc-hhm.com-cert.pem

  mkdir -p ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/ca
  cp ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/peers/peer0.manufacturer.ssc-hhm.com/msp/cacerts/* ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/ca/ca.manufacturer.ssc-hhm.com-cert.pem

  mkdir -p organizations/peerOrganizations/manufacturer.ssc-hhm.com/users
  mkdir -p organizations/peerOrganizations/manufacturer.ssc-hhm.com/users/User1@manufacturer.ssc-hhm.com

  infoln "Generate the user msp"
  set -x
  fabric-ca-client enroll -u https://user1:user1pw@localhost:7054 --caname ca-manufacturer -M ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/users/User1@manufacturer.ssc-hhm.com/msp --tls.certfiles ${PWD}/organizations/fabric-ca/manufacturer/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/msp/config.yaml ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/users/User1@manufacturer.ssc-hhm.com/msp/config.yaml

  mkdir -p organizations/peerOrganizations/manufacturer.ssc-hhm.com/users/Admin@manufacturer.ssc-hhm.com

  infoln "Generate the org admin msp"
  set -x
  fabric-ca-client enroll -u https://manufacturerOrgadmin:manufactureradminpw@localhost:7054 --caname ca-manufacturer -M ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/users/Admin@manufacturer.ssc-hhm.com/msp --tls.certfiles ${PWD}/organizations/fabric-ca/manufacturer/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/msp/config.yaml ${PWD}/organizations/peerOrganizations/manufacturer.ssc-hhm.com/users/Admin@manufacturer.ssc-hhm.com/msp/config.yaml
}

function createSupplierCA() {
  infoln "Enroll the CA admin"
  mkdir -p organizations/peerOrganizations/supplier.ssc-hhm.com/

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/
  #  rm -rf $FABRIC_CA_CLIENT_HOME/fabric-ca-client-config.yaml
  #  rm -rf $FABRIC_CA_CLIENT_HOME/msp

  set -x
  fabric-ca-client enroll -u https://supplieradmin:supplieradminpw@localhost:8054 --caname ca-supplier --tls.certfiles ${PWD}/organizations/fabric-ca/supplier/tls-cert.pem
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-supplier.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-supplier.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-supplier.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-supplier.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/msp/config.yaml

  infoln "Register peer0"
  set -x
  fabric-ca-client register --caname ca-supplier --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/organizations/fabric-ca/supplier/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Register user"
  set -x
  fabric-ca-client register --caname ca-supplier --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${PWD}/organizations/fabric-ca/supplier/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Register the org admin"
  set -x
  fabric-ca-client register --caname ca-supplier --id.name supplierOrgadmin --id.secret supplieradminpw --id.type admin --tls.certfiles ${PWD}/organizations/fabric-ca/supplier/tls-cert.pem
  { set +x; } 2>/dev/null

  mkdir -p organizations/peerOrganizations/supplier.ssc-hhm.com/peers
  mkdir -p organizations/peerOrganizations/supplier.ssc-hhm.com/peers/peer0.supplier.ssc-hhm.com

  infoln "Generate the peer0 msp"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 --caname ca-supplier -M ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/peers/peer0.supplier.ssc-hhm.com/msp --csr.hosts peer0.supplier.ssc-hhm.com --tls.certfiles ${PWD}/organizations/fabric-ca/supplier/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/msp/config.yaml ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/peers/peer0.supplier.ssc-hhm.com/msp/config.yaml

  infoln "Generate the peer0-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 --caname ca-supplier -M ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/peers/peer0.supplier.ssc-hhm.com/tls --enrollment.profile tls --csr.hosts peer0.supplier.ssc-hhm.com --csr.hosts localhost --tls.certfiles ${PWD}/organizations/fabric-ca/supplier/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/peers/peer0.supplier.ssc-hhm.com/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/peers/peer0.supplier.ssc-hhm.com/tls/ca.crt
  cp ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/peers/peer0.supplier.ssc-hhm.com/tls/signcerts/* ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/peers/peer0.supplier.ssc-hhm.com/tls/server.crt
  cp ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/peers/peer0.supplier.ssc-hhm.com/tls/keystore/* ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/peers/peer0.supplier.ssc-hhm.com/tls/server.key

  mkdir -p ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/msp/tlscacerts
  cp ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/peers/peer0.supplier.ssc-hhm.com/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/msp/tlscacerts/ca.crt

  mkdir -p ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/tlsca
  cp ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/peers/peer0.supplier.ssc-hhm.com/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/tlsca/tlsca.supplier.ssc-hhm.com-cert.pem

  mkdir -p ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/ca
  cp ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/peers/peer0.supplier.ssc-hhm.com/msp/cacerts/* ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/ca/ca.supplier.ssc-hhm.com-cert.pem

  mkdir -p organizations/peerOrganizations/supplier.ssc-hhm.com/users
  mkdir -p organizations/peerOrganizations/supplier.ssc-hhm.com/users/User1@supplier.ssc-hhm.com

  infoln "Generate the user msp"
  set -x
  fabric-ca-client enroll -u https://user1:user1pw@localhost:8054 --caname ca-supplier -M ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/users/User1@supplier.ssc-hhm.com/msp --tls.certfiles ${PWD}/organizations/fabric-ca/supplier/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/msp/config.yaml ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/users/User1@supplier.ssc-hhm.com/msp/config.yaml

  mkdir -p organizations/peerOrganizations/supplier.ssc-hhm.com/users/Admin@supplier.ssc-hhm.com

  infoln "Generate the org admin msp"
  set -x
  fabric-ca-client enroll -u https://supplierOrgadmin:supplieradminpw@localhost:8054 --caname ca-supplier -M ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/users/Admin@supplier.ssc-hhm.com/msp --tls.certfiles ${PWD}/organizations/fabric-ca/supplier/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/msp/config.yaml ${PWD}/organizations/peerOrganizations/supplier.ssc-hhm.com/users/Admin@supplier.ssc-hhm.com/msp/config.yaml

}

function createRetailerCA() {
  infoln "Enroll the CA admin"
  mkdir -p organizations/peerOrganizations/retailer.ssc-hhm.com/

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/
  #  rm -rf $FABRIC_CA_CLIENT_HOME/fabric-ca-client-config.yaml
  #  rm -rf $FABRIC_CA_CLIENT_HOME/msp

  set -x
  fabric-ca-client enroll -u https://retaileradmin:retaileradminpw@localhost:11054 --caname ca-retailer --tls.certfiles ${PWD}/organizations/fabric-ca/retailer/tls-cert.pem
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-retailer.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-retailer.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-retailer.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-retailer.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/msp/config.yaml

  infoln "Register peer0"
  set -x
  fabric-ca-client register --caname ca-retailer --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/organizations/fabric-ca/retailer/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Register user"
  set -x
  fabric-ca-client register --caname ca-retailer --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${PWD}/organizations/fabric-ca/retailer/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Register the org admin"
  set -x
  fabric-ca-client register --caname ca-retailer --id.name retailerOrgadmin --id.secret retaileradminpw --id.type admin --tls.certfiles ${PWD}/organizations/fabric-ca/retailer/tls-cert.pem
  { set +x; } 2>/dev/null

  mkdir -p organizations/peerOrganizations/retailer.ssc-hhm.com/peers
  mkdir -p organizations/peerOrganizations/retailer.ssc-hhm.com/peers/peer0.retailer.ssc-hhm.com

  infoln "Generate the peer0 msp"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:11054 --caname ca-retailer -M ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/peers/peer0.retailer.ssc-hhm.com/msp --csr.hosts peer0.retailer.ssc-hhm.com --tls.certfiles ${PWD}/organizations/fabric-ca/retailer/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/msp/config.yaml ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/peers/peer0.retailer.ssc-hhm.com/msp/config.yaml

  infoln "Generate the peer0-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:11054 --caname ca-retailer -M ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/peers/peer0.retailer.ssc-hhm.com/tls --enrollment.profile tls --csr.hosts peer0.retailer.ssc-hhm.com --csr.hosts localhost --tls.certfiles ${PWD}/organizations/fabric-ca/retailer/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/peers/peer0.retailer.ssc-hhm.com/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/peers/peer0.retailer.ssc-hhm.com/tls/ca.crt
  cp ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/peers/peer0.retailer.ssc-hhm.com/tls/signcerts/* ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/peers/peer0.retailer.ssc-hhm.com/tls/server.crt
  cp ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/peers/peer0.retailer.ssc-hhm.com/tls/keystore/* ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/peers/peer0.retailer.ssc-hhm.com/tls/server.key

  mkdir -p ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/msp/tlscacerts
  cp ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/peers/peer0.retailer.ssc-hhm.com/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/msp/tlscacerts/ca.crt

  mkdir -p ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/tlsca
  cp ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/peers/peer0.retailer.ssc-hhm.com/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/tlsca/tlsca.retailer.ssc-hhm.com-cert.pem

  mkdir -p ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/ca
  cp ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/peers/peer0.retailer.ssc-hhm.com/msp/cacerts/* ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/ca/ca.retailer.ssc-hhm.com-cert.pem

  mkdir -p organizations/peerOrganizations/retailer.ssc-hhm.com/users
  mkdir -p organizations/peerOrganizations/retailer.ssc-hhm.com/users/User1@retailer.ssc-hhm.com

  infoln "Generate the user msp"
  set -x
  fabric-ca-client enroll -u https://user1:user1pw@localhost:11054 --caname ca-retailer -M ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/users/User1@retailer.ssc-hhm.com/msp --tls.certfiles ${PWD}/organizations/fabric-ca/retailer/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/msp/config.yaml ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/users/User1@retailer.ssc-hhm.com/msp/config.yaml

  mkdir -p organizations/peerOrganizations/retailer.ssc-hhm.com/users/Admin@retailer.ssc-hhm.com

  infoln "Generate the org admin msp"
  set -x
  fabric-ca-client enroll -u https://retailerOrgadmin:retaileradminpw@localhost:11054 --caname ca-retailer -M ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/users/Admin@retailer.ssc-hhm.com/msp --tls.certfiles ${PWD}/organizations/fabric-ca/retailer/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/msp/config.yaml ${PWD}/organizations/peerOrganizations/retailer.ssc-hhm.com/users/Admin@retailer.ssc-hhm.com/msp/config.yaml
}


function createOrderer() {

  infoln "Enroll the CA admin"
  mkdir -p organizations/ordererOrganizations/ssc-hhm.com

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/ordererOrganizations/ssc-hhm.com
  #  rm -rf $FABRIC_CA_CLIENT_HOME/fabric-ca-client-config.yaml
  #  rm -rf $FABRIC_CA_CLIENT_HOME/msp

  set -x
  fabric-ca-client enroll -u https://admin:adminpw@localhost:9054 --caname ca-orderer --tls.certfiles ${PWD}/organizations/fabric-ca/orderer/tls-cert.pem
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/organizations/ordererOrganizations/ssc-hhm.com/msp/config.yaml

  infoln "Register orderer"
  set -x
  fabric-ca-client register --caname ca-orderer --id.name orderer --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/organizations/fabric-ca/orderer/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Register the orderer admin"
  set -x
  fabric-ca-client register --caname ca-orderer --id.name ordererAdmin --id.secret ordererAdminpw --id.type admin --tls.certfiles ${PWD}/organizations/fabric-ca/orderer/tls-cert.pem
  { set +x; } 2>/dev/null

  mkdir -p organizations/ordererOrganizations/ssc-hhm.com/orderers
  mkdir -p organizations/ordererOrganizations/ssc-hhm.com/orderers/ssc-hhm.com

  mkdir -p organizations/ordererOrganizations/ssc-hhm.com/orderers/orderer.ssc-hhm.com

  infoln "Generate the orderer msp"
  set -x
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/orderers/orderer.ssc-hhm.com/msp --csr.hosts orderer.ssc-hhm.com --csr.hosts localhost --tls.certfiles ${PWD}/organizations/fabric-ca/orderer/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/msp/config.yaml ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/orderers/orderer.ssc-hhm.com/msp/config.yaml

  infoln "Generate the orderer-tls certificates"
  set -x
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/orderers/orderer.ssc-hhm.com/tls --enrollment.profile tls --csr.hosts orderer.ssc-hhm.com --csr.hosts localhost --tls.certfiles ${PWD}/organizations/fabric-ca/orderer/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/orderers/orderer.ssc-hhm.com/tls/tlscacerts/* ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/orderers/orderer.ssc-hhm.com/tls/ca.crt
  cp ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/orderers/orderer.ssc-hhm.com/tls/signcerts/* ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/orderers/orderer.ssc-hhm.com/tls/server.crt
  cp ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/orderers/orderer.ssc-hhm.com/tls/keystore/* ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/orderers/orderer.ssc-hhm.com/tls/server.key

  mkdir -p ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/orderers/orderer.ssc-hhm.com/msp/tlscacerts
  cp ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/orderers/orderer.ssc-hhm.com/tls/tlscacerts/* ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/orderers/orderer.ssc-hhm.com/msp/tlscacerts/tlsca.ssc-hhm.com-cert.pem

  mkdir -p ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/msp/tlscacerts
  cp ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/orderers/orderer.ssc-hhm.com/tls/tlscacerts/* ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/msp/tlscacerts/tlsca.ssc-hhm.com-cert.pem

  mkdir -p organizations/ordererOrganizations/ssc-hhm.com/users
  mkdir -p organizations/ordererOrganizations/ssc-hhm.com/users/Admin@ssc-hhm.com

  infoln "Generate the admin msp"
  set -x
  fabric-ca-client enroll -u https://ordererAdmin:ordererAdminpw@localhost:9054 --caname ca-orderer -M ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/users/Admin@ssc-hhm.com/msp --tls.certfiles ${PWD}/organizations/fabric-ca/orderer/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/msp/config.yaml ${PWD}/organizations/ordererOrganizations/ssc-hhm.com/users/Admin@ssc-hhm.com/msp/config.yaml

}