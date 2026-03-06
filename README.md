url2pdf
=======

A service for performing web site to pdf conversions.

Requirements
============

* Docker

Install
=======

Just copy the `.env.example` to `.env` and adapt the settings.
Run via `docker compose`, and ensure ports 3000 and 3001 ports are accessible.

Usage
=====

Use browserless for the conversion (port 3000), and ghostscript for improving compatibility with browser's PDF viewers, which is not ensured with the browserless output.
