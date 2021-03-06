#/bin/bash

SCRIPT_HOME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
TAG=gamercert/brutalistitties-site

pushd ${SCRIPT_HOME}/..
    npm run-script build
    docker build -t $TAG ./
    docker push $TAG
popd
