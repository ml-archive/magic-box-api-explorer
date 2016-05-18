#!/bin/bash

# Build the app
npm run dist

if [ "$1" = "prod" ]
then
    BUCKET="explorer.magic-box.fuzzproductions.com"
else
    BUCKET="${1}"
fi

echo "Deploying to ${BUCKET}"

## Deploy to AWS
aws s3 sync dist/ s3://${BUCKET} --profile crub --acl public-read
