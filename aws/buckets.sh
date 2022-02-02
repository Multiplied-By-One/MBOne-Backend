#!/bin/bash
set -x
awslocal s3 mb s3://test-bucket
awslocal s3api put-bucket-acl --bucket test-bucket --acl public-read
set +x
