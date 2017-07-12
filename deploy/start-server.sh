#!/bin/bash
isExistApp=`ps -eaf |grep cp-eventbrite-service |grep -v grep| awk '{ print $2; }'`
if [[ -n $isExistApp ]]; then
    service cp-eventbrite-service stop
fi

service cp-eventbrite-service start
