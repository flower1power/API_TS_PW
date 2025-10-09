FROM node:24-bookworm-slim

WORKDIR /usr/workspace

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    NODE_ENV=production

# Для API-тестов браузер не требуется — пропускаем установку системных пакетов и Chromium

COPY ["package.json", "package-lock.json", "/usr/workspace/"]

RUN npm ci && rm -rf /root/.npm /tmp/*

COPY . /usr/workspace

CMD ["npm", "run", "test", "--", "--reporter=line"]