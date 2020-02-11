# This image will be published as dspace/dspace-angular
# See https://dspace-labs.github.io/DSpace-Docker-Images/ for usage details

FROM node:8-alpine
ENV PROJECT_NAME ${PROJECT_NAME:-sedici-angular}

WORKDIR /app
ADD . /app/
EXPOSE 3000

RUN yarn install
RUN yarn run build
CMD yarn run watch:notbuild

VOLUME /app/
