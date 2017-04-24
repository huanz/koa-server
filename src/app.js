'use strict';
const Koa = require('koa');
const app = new Koa();
const moddlewares = require('./middleware')(app);
const router = require('./routes');

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