FROM ubuntu

RUN apt-get -yqq update && apt-get -yqq install \
    curl \
    docker.io

RUN curl -sL https://deb.nodesource.com/setup_9.x | bash - \
    && apt-get -y install nodejs

ENV DUMB_INIT_VERSION=1.2.1
RUN curl -s -L -O https://github.com/Yelp/dumb-init/releases/download/v$DUMB_INIT_VERSION/dumb-init_${DUMB_INIT_VERSION}_amd64.deb \
    && dpkg -i dumb-init_${DUMB_INIT_VERSION}_amd64.deb \
    && rm -f dumb-init_${DUMB_INIT_VERSION}_amd64.deb

RUN git config --global user.email "bot@atomist.com" &&  git config --global user.name "Atomist Bot"

ENV NPM_CONFIG_LOGLEVEL warn
ENV SUPPRESS_NO_CONFIG_WARNING true
ENV NODE_ENV production

ENV PCF_ORG atomist
ENV PCF_SPACE_STAGING ri-staging
ENV PCF_SPACE_PRODUCTION ri-production

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package.json /app/
COPY package-lock.json /app/
RUN npm install

# Bundle app source
COPY . /app

EXPOSE 2866

ENTRYPOINT [ "dumb-init", "node", "--trace-warnings", "--expose_gc", "--optimize_for_size", "--always_compact", "--max_old_space_size=384" ]

CMD [ "node_modules/@atomist/automation-client/start.client.js" ]