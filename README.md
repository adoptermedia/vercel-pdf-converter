# PDF Conversion API

This project provides a simple serverless API that converts any URL into a PDF using Puppeteer.

## Usage

Send a request to the `/api/pdf` endpoint with a `url` query parameter:

```
https://<your-deployment>/api/pdf?url=https://example.com
```

The endpoint returns a PDF of the requested page.

A tiny web interface is available at the root path to quickly test the API.

## Development

```sh
npm run develop
```

## Deploy

```sh
npm run deploy
```

## License

[MIT](LICENSE)
