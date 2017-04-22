const AV = require('leanengine');
const logger = require('koa-logger');
const body = require('koa-body');
const cors = require('kcors');
const helmet = require('koa-helmet');
const error = require('koa-json-error');
const staticCache = require('koa-static-cache');

const middleware = [
    AV.koa(),
    body({
        formidable: {
            uploadDir: '/upload'
        }
    }),
    cors(),
    helmet(),
    logger(),
    error({
        format: (err) => {
            return {
                status: err.status,
                msg: err.message,
                success: 2
            };
        }
    })
];

module.exports = middleware;