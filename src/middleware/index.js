const path = require('path');
const AV = require('leanengine');
const logger = require('koa-logger');
const body = require('koa-body');
const cors = require('kcors');
const helmet = require('koa-helmet');
const error = require('koa-json-error');
const staticCache = require('koa-static-cache');

let files = {};
let middleware = [
    AV.koa(),
    body({
        formidable: {
            uploadDir: path.join(__dirname, '..', '..', 'upload')
        }
    }),
    cors(),
    helmet(),
    error({
        format: (err) => {
            return {
                status: err.status,
                msg: err.message,
                success: 2
            };
        }
    }),
    staticCache(path.join(__dirname, '..', '..', 'public'), {
        maxAge: 365 * 24 * 60 * 60,
        alias: {
            '/': '/index.html',
        }
    }, files),
];

staticCache(path.join(__dirname, '..', '..', 'manage'), {}, files);
staticCache(path.join(__dirname, '..', '..', 'live'), {}, files);

module.exports = (app) => {
    if (app.env !== 'production') {
        middleware.push(logger());
    }
    return middleware;
};