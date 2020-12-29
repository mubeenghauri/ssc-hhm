#!/bin/bash


###############################################
#=================CAUTUTION==================-#
# Tried using the pretty printing unctions    #
# here but they dont work here, even tried    #
# "source ../../scriptutility.sh" but it dont #
# work and was cusing script to freeze.       # 
# DONT TRY THIS AGAIN. use echo               # 
###############################################

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $5)
    local CP=$(one_line_pem $6)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${ORGID}/$2/" \
        -e "s/\${P0PORT}/$3/" \
        -e "s/\${CAPORT}/$4/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.json
}

function yaml_ccp {
    local PP=$(one_line_pem $5)
    local CP=$(one_line_pem $6)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${ORGID}/$2/" \
        -e "s/\${P0PORT}/$3/" \
        -e "s/\${CAPORT}/$4/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}
echo "[ccp-generate] Generating ccp config for Manufacturer ..."

ORG=manufacturer
ORGID=Manufacturer
P0PORT=7051
CAPORT=7054
PEERPEM=organizations/peerOrganizations/manufacturer.ssc-hhm.com/tlsca/tlsca.manufacturer.ssc-hhm.com-cert.pem
CAPEM=organizations/peerOrganizations/manufacturer.ssc-hhm.com/ca/ca.manufacturer.ssc-hhm.com-cert.pem

echo "$(json_ccp $ORG $ORGID $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/manufacturer.ssc-hhm.com/connection-manufacturer.json
echo "$(yaml_ccp $ORG $ORGID $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/manufacturer.ssc-hhm.com/connection-manufacturer.yaml

echo "[ccp-generate] Generating ccp config for Supplier ..."

ORG=supplier
ORGID=Supplier
P0PORT=9051
CAPORT=8054
PEERPEM=organizations/peerOrganizations/supplier.ssc-hhm.com/tlsca/tlsca.supplier.ssc-hhm.com-cert.pem
CAPEM=organizations/peerOrganizations/supplier.ssc-hhm.com/ca/ca.supplier.ssc-hhm.com-cert.pem

echo "$(json_ccp $ORG $ORGID $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/supplier.ssc-hhm.com/connection-supplier.json
echo "$(yaml_ccp $ORG $ORGID $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/supplier.ssc-hhm.com/connection-supplier.yaml

echo "[ccp-generate] Generating ccp config for Retailer ..."

ORG=retailer
ORGID=Retailer
P0PORT=10051
CAPORT=9054
PEERPEM=organizations/peerOrganizations/retailer.ssc-hhm.com/tlsca/tlsca.retailer.ssc-hhm.com-cert.pem
CAPEM=organizations/peerOrganizations/retailer.ssc-hhm.com/ca/ca.retailer.ssc-hhm.com-cert.pem

echo "$(json_ccp $ORG $ORGID $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/retailer.ssc-hhm.com/connection-retailer.json
echo "$(yaml_ccp $ORG $ORGID $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/retailer.ssc-hhm.com/connection-retailer.yaml

echo "[ccp-generate] Successfully Generated ccp configs."