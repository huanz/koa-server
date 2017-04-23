const AV = require('leanengine');
const Comment = AV.Object.extend('Comment');
const Like = AV.Object.extend('Like');

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
        limit: 10,
        skip: 0,
    }, ctx.query);

    params.skip = +params.skip;

    const query = new AV.Query('Comment');

    /**
     * @desc 是否已经赞
     */
    let AVlike = params.userid ? await exports.queryLike(params.userid) : null;
    let comments = AVlike ? AVlike.get('comments') : [];

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
        let ret = await exports.hot(comments);
        Object.assign(result, ret);
    }

    query.limit(params.limit);
    query.skip(params.skip + result.hot.length);

    const queryTotal = new AV.Query('Comment');

    let listArr = await Promise.all([query.find(), queryTotal.count()]);

    result.total += listArr[1];

    if (listArr[0].length) {
        result.list = utils.listFormat(listArr[0], comments);
    }
    ctx.body = result;
};

exports.hot = async(comments) => {
    const config = await site.get();
    const query = new AV.Query('Comment');
    query.addDescending('like');
    query.greaterThan('like', 0);
    query.limit(config.hot);

    let result = {
        view: config.view,
        total: config.comments,
        video: config.video,
        hot: [],
    };

    let hostList = await query.find();

    if (hostList.length) {
        result.hot = utils.listFormat(hostList, comments);
    }
    return result;
}

exports.insert = async(ctx, next) => {
    const AVobj = new Comment();
    let data = ctx.request.body;
    let result = {
        success: 0,
    };

    ['userid', 'nickname', 'avatar', 'text'].some(key => {
        if (data[key]) {
            AVobj.set(key, data[key]);
            return false;
        } else {
            result.success = 1;
            result.msg = `${key}不能为空`;
            ctx.body = result;
            return true;
        }
    });

    let AVret = await AVobj.save();

    ctx.body = {
        success: 0,
        comment: Object.assign({
            id: AVret.get('objectId'),
            createdAt: utils.fromNow(AVret.createdAt),
            like: 0,
        }, AVret.attributes)
    };
};

exports.like = async(ctx, next) => {
    let result = {
        success: 0,
    };
    let params = ctx.request.body;

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
    AVlike.addUnique('comments', [params.comment]);

    let results = await Promise.all([AVlike.save(), AVcomment.save(null, {
        fetchWhenSave: true,
    })]);

    ctx.body = {
        success: 0,
        comment: results[1].attributes
    };
};

exports.queryLike = async(userid) => {
    let query = new AV.Query('Like');
    query.equalTo('userid', userid);
    return await query.first();
};

/**
 * @desc 修改赞数量
 */
exports.praise = async(ctx, next) => {
    let params = ctx.request.body;
    let AVcomment = AV.Object.createWithoutData('Comment', params.comment);
    AVcomment.set('like', +params.num);
    let ret = await AVcomment.save(null, {
        fetchWhenSave: true,
    });
    ctx.body = ret;
};

/**
 * @desc 删除一条评论
 */
exports.delete = async(ctx, next) => {
    let params = ctx.request.body;
    let AVcomment = AV.Object.createWithoutData('Comment', params.comment);
    let ret = await AVcomment.destroy();
    ctx.body = {
        success: 0,
        msg: '成功'
    };
};