#! /bin/bash

##################################################################
#                                                                #
#  This script runs the container that was initially built       #
#  with ./build.sh which sets up the webpack-dev server env for  #
#  local development. A prod deployment only requires the        #
#  compiled assets to be available to an nginx instance to work  #
#  which is taken care of with a jenkins instance.               #
#                                                                #
##################################################################

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
docker run --detach \
    --volume $DIR/src:/repo/src \
    --publish 80:80 \
    --name reflow-client \
    reflow-client \
    npm run start
