FROM node:24-bookworm-slim

WORKDIR /usr/workspace

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 


COPY ["package.json", "package-lock.json", "/usr/workspace/"]

RUN npm ci && rm -rf /root/.npm /tmp/*

COPY . /usr/workspace