#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.json
}

function yaml_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}

infoln "[ccp-generate] Generating ccp config for Manufacturer ..."

ORG=manufacturer
ORGID=Manufacturer
P0PORT=7051
CAPORT=7054
PEERPEM=organizations/peerOrganizations/manufacturer.hhm-ssc.com/tlsca/tlsca.manufacturer.hhm-ssc.com-cert.pem
CAPEM=organizations/peerOrganizations/manufacturer.hhm-ssc.com/ca/ca.manufacturer.hhm-ssc.com-cert.pem

echo "$(json_ccp $ORG $ORGID $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/manufacturer.hhm-ssc.com/connection-manufacturer.json
echo "$(yaml_ccp $ORG $ORGID $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/manufacturer.hhm-ssc.com/connection-manufacturer.yaml

infoln "[ccp-generate] Generating ccp config for Supplier ..."

ORG=supplier
ORGID=Supplier
P0PORT=9051
CAPORT=8054
PEERPEM=organizations/peerOrganizations/supplier.hhm-ssc.com/tlsca/tlsca.supplier.hhm-ssc.com-cert.pem
CAPEM=organizations/peerOrganizations/supplier.hhm-ssc.com/ca/ca.supplier.hhm-ssc.com-cert.pem

echo "$(json_ccp $ORG $ORGID $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/supplier.hhm-ssc.com/connection-supplier.json
echo "$(yaml_ccp $ORG $ORGID $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/supplier.hhm-ssc.com/connection-supplier.yaml

infoln "[ccp-generate] Generating ccp config for Retailer ..."

ORG=retailer
ORGID=Retailer
P0PORT=10051
CAPORT=10054
PEERPEM=organizations/peerOrganizations/retailer.hhm-ssc.com/tlsca/tlsca.retailer.hhm-ssc.com-cert.pem
CAPEM=organizations/peerOrganizations/retailer.hhm-ssc.com/ca/ca.retailer.hhm-ssc.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/retailer.hhm-ssc.com/connection-retailer.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/retailer.hhm-ssc.com/connection-retailer.yaml

successln "[ccp-generate] Successfully Generated ccp configs."