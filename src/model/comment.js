const moment = require('moment');
const AV = require('leanengine');
const Comment = AV.Object.extend('Comment');
const Like = AV.Object.extend('Like');

moment.locale('zh-cn');

const utils = require('../utils/utils');
const site = require('./site');

exports.list = async(ctx, next) => {
    let result = {
        success: 0,
        video: 0,
        total: 0,
        hot: [],
        list: [],
    };
    let params = Object.assign({
        limit: 15,
        skip: 0,
    }, ctx.query);

    const query = new AV.Query('Comment');

    /**
     * @desc 点赞降序
     */
    query.addDescending('like');
    /**
     * @desc 时间降序
     */
    query.addDescending('createdAt');

    /**
     * @desc 需要查询热门评论
     */
    if (!params.skip) {
        let ret = await exports.hot();
        Object.assign(result, ret);
    }

    query.limit(params.limit);
    query.skip(+params.skip + result.hot.length);

    const queryTotal = new AV.Query('Comment');

    let listArr = await Promise.all([query.find(), queryTotal.count()]);

    result.total = listArr[1];

    if (listArr[0].length) {
        let tmpList = listArr[0].map(item => {
            return Object.assign({
                id: item.id,
                createdAt: moment(item.createdAt, 'dd').fromNow(),
            }, item.attributes);
        });
        if (params.userid) {
            let AVlike = await exports.queryLike(params.userid);
            if (AVlike) {
                let comments = AVlike.get('comments');
                tmpList = tmpList.map(item => {
                    item.liked = comments.indexOf(item.id) !== -1;
                    return item;
                });
            }
        }
        result.list = tmpList;
    }
    ctx.body = result;
};

exports.hot = async() => {
    const config = await site.get();
    const query = new AV.Query('Comment');
    query.addDescending('like');
    query.greaterThan('like', 0);
    query.limit(config.hot);

    let result = {
        video: config.video,
        hot: [],
    }
    let hostList = await query.find();

    if (hostList.length) {
        result.hot = utils.pluck(hostList, 'attributes');
    }
    return result;
}

exports.insert = async(ctx, next) => {
    const AVobj = new Comment();
    let data = ctx.request.fields;
    let result = {
        success: 0,
    };

    ['userid', 'nickname', 'avatar', 'text'].some(key => {
        if (data[key]) {
            AVobj.set(key, data[key]);
            return true;
        } else {
            result.success = 1;
            result.msg = `${key}不能为空`;
            return false;
        }
    });

    ctx.body = result.success ? result : await AVobj.save();
};

exports.like = async(ctx, next) => {
    let result = {
        success: 0,
    };
    let params = ctx.request.fields;

    if (!params.userid) {
        return ctx.body = {
            success: 1,
            msg: 'userid不能为空'
        };
    }

    if (!utils.isObjectId(params.comment)) {
        return ctx.body = {
            success: 1,
            msg: 'commentId不正确'
        };
    }

    let queryComment = new AV.Query('Comment');
    let AVcomment = await queryComment.get(params.comment);

    if (!AVcomment) {
        return ctx.body = {
            success: 1,
            msg: 'commentId不正确'
        };
    }

    AVcomment.increment('like', 1);

    let AVlike = await exports.queryLike(params.userid);

    if (!AVlike) {
        AVlike = new Like();
        AVlike.set('userid', params.userid);
    }
    AVlike.addUnique('comments', params.comment);

    let results = await Promise.all([AVlike.save(), AVcomment.save(null, {
        fetchWhenSave: true,
    })]);

    ctx.body = results[1].attributes;
};

exports.queryLike = async(userid) => {
    let query = new AV.Query('Like');
    query.equalTo('userid', userid);
    return await query.first();
};