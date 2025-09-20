#! /bin/bash
STAGE=${1}
ACCOUNT=$(aws sts get-caller-identity --query "Account" --output text)

$(npx cdk deploy 'GatewayUserPoolStack' -c stage=dev)
