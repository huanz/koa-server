const Router = require('koa-router');
const router = new Router();

const api = require('./api');
const manage = require('./manage');

router.use(api.routes());
router.use(manage.routes());

module.exports = router;