FROM ghcr.io/browserless/chromium:latest

USER root

RUN apt-get update && apt-get install -y \
    fonts-open-sans \
    fonts-liberation \
    fonts-noto-core \
    fonts-dejavu-core \
    fontconfig \
    && fc-cache -fv \
    && rm -rf /var/lib/apt/lists/*

USER blessuser

