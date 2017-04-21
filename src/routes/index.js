const Router = require('koa-router');
const router = new Router();

const api = require('./api');

router.all('/', (ctx, next) => {
    ctx.body = {
        msg: 'hello'
    };
})
.use(api.routes());

module.exports = router;