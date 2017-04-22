const Router = require('koa-router');
const router = new Router({
    prefix: '/api'
});

const comment = require('../model/comment');
const site = require('../model/site');
const prize = require('../model/prize');

router
    .get('/comment', comment.list)
    .post('/comment', comment.insert)
    .post('/like', comment.like)
    .get('/prize', prize.get)
    .post('/site', site.update);

module.exports = router;