#! /bin/bash

##################################################################
#                                                                #
#  This script needs to be run on any changes to package.json    #
#  It does not need to be run for changes to the application     #
#  code.                                                         #
#                                                                #
##################################################################

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
pushd $DIR
docker build -t reflow-api .
popd
