const Router = require('koa-router');
const router = new Router();

router.all('/', (ctx, next) => {
    ctx.body = {
        msg: 'hello'
    };
});

module.exports = router;