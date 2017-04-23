const Router = require('koa-router');
const router = new Router({
    prefix: '/manage'
});

const comment = require('../model/comment');
const site = require('../model/site');

router
    .post('/comment', comment.praise)
    .post('/comment/delete', comment.delete)
    .get('/view', site.config)
    .post('/config', site.update);

module.exports = router;