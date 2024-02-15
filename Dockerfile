FROM node:18-alpine
USER root

# Update apk
RUN apk update

RUN apk add --no-cache python3 && \
    if [ ! -e /usr/bin/python ]; then ln -sf python3 /usr/bin/python ; fi

# Install ffmpeg
RUN apk add --no-cache ffmpeg

# Create app directory
WORKDIR /home/node/harmonyspring

# Copy app source
COPY packages ./packages
COPY .yarn .yarn
COPY .yarnrc.yml .yarnrc.yml
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY tsconfig.json tsconfig.json
COPY turbo.json turbo.json

# Install and prepare the app
RUN yarn install
RUN yarn migrate
RUN yarn build

CMD ["sh", "-c", "yarn migrate && yarn start"];
