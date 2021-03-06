FROM node:carbon-alpine
LABEL maintainer="butlerx <cian@coderdojo.org>"
ENV NODE_ENV=development
RUN apk add --update git build-base python postgresql-client && \
    mkdir -p /usr/src/app /usr/src/cp-translations
COPY docker-entrypoint.sh /usr/src
EXPOSE 10307
VOLUME /usr/src/app /usr/src/cp-translations
CMD ["/usr/src/docker-entrypoint.sh"]
