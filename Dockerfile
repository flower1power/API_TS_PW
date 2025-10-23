FROM node:20-bookworm-slim

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

WORKDIR /usr/workspace

COPY package.json package-lock.json ./

RUN apt-get update && \
    apt-get install -y openjdk-17-jre curl tar && \
    curl -o allure-2.24.0.tgz -Ls https://repo.maven.apache.org/maven2/io/qameta/allure/allure-commandline/2.24.0/allure-commandline-2.24.0.tgz && \
    tar -zxvf allure-2.24.0.tgz -C /opt/ && \
    ln -s /opt/allure-2.24.0/bin/allure /usr/bin/allure && \
    rm allure-2.24.0.tgz && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN npm ci

COPY . .
