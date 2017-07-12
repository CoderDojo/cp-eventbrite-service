#!/bin/bash
isExistApp=`pgrep cp-eventbrite-service`
if [[ -n $isExistApp ]]; then
  service cp-eventbrite-service stop
fi
