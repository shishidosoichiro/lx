#!/bin/sh
docker run --rm -it -v `pwd`:/src --name node_dev_`dirname $0` node:dev $@
