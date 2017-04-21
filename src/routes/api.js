const Router = require('koa-router');
const router = new Router({
    prefix: '/api'
});

const comment = require('../model/comment');
const site = require('../model/site');

router
    .get('/comment', comment.list)
    .post('/comment', comment.insert)
    .post('/like', comment.like)
    .get('/video', site.video)
    .post('/site', site.update)

module.exports = router;