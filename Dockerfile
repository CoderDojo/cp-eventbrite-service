FROM mhart/alpine-node:0.10.48
ARG DEP_VERSION=latest
MAINTAINER butlerx <butlerx@notthe.cloud>
RUN apk add --update git build-base python postgresql-client && \
    mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install && \
    npm install cp-translations@"$DEP_VERSION" && \
    apk del build-base python && \
    rm -rf /tmp/* /root/.npm /root/.node-gyp
EXPOSE 10307
CMD ["npm", "start"]
