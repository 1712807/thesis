# INSTALL
FROM mhart/alpine-node:12
WORKDIR /tkm/deabee_sv/be

RUN apk add --no-cache libc6-compat git

COPY ./package.json ./package.json
RUN yarn install
COPY . .

ENV NODE_ENV production

CMD [ "node", "index.js" ]
