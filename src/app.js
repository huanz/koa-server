'use strict';
const Koa = require('koa');

const moddlewares = require('./middleware');
const router = require('./routes');

const app = new Koa();

app.proxy = true;

/**
 * @desc 加载中间件
 */
moddlewares.forEach(moddleware => app.use(moddleware));

/**
 * @desc 路由
 */
app.use(router.routes()).use(router.allowedMethods());

module.exports = app;