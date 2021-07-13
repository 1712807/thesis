# INSTALL
FROM mhart/alpine-node:12
WORKDIR /tkm/fe

RUN apk add --no-cache libc6-compat git

COPY ./package.json ./package.json
RUN yarn install
COPY . .

ENV DANGEROUSLY_DISABLE_HOST_CHECK true

ENV NODE_ENV production
ENV PORT 3001
EXPOSE 3001

RUN yarn run build

CMD [ "npm", "start" ]
