FROM ghcr.io/browserless/chromium:latest

USER root

RUN apt-get update && apt-get install -y \
    ghostscript \
    && rm -rf /var/lib/apt/lists/*

USER blessuser

