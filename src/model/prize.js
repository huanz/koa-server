const AV = require('leanengine');

const utils = require('../utils/utils');

const Prize = AV.Object.extend('Prize');

exports.get = async(ctx, next) => {
    let userid = ctx.query.userid;
    let result = {
        success: 0,
        msg: '成功',
        data: {}
    };

    if (!utils.isNumeric(userid)) {
        return ctx.body = {
            success: 1,
            msg: 'userid不正确',
        };
    }

    let AVprize = await exports.queryPrize(userid);

    if (AVprize) {
        result.data = {
            count: AVprize.get('count'),
            share: AVprize.get('share'),
        };
    } else {
        AVprize = new Prize();
        AVprize.set('userid', userid);
        AVprize.set('count', 1);
        AVprize.set('share', 0);
        let ret = await AVprize.save();
        result.data = {
            count: 1,
            share: 0,
        };
    }

    ctx.body = result;
};

exports.post = async(ctx, next) => {
    let userid = ctx.query.userid;
    let result = {
        success: 1,
        msg: 'userid不正确',
    };

    if (!utils.isNumeric(userid)) {
        return ctx.body = result;
    }

    let AVprize = await exports.queryPrize(userid);

    if (!AVprize) {
        return ctx.body = result;
    }

    /**
     * @desc last 上次分享时间不在同一天的话 share归为1
     */
    let last = AVprize.get('last');
    if (last && utils.moment().format('YYYYMMDD') !== utils.moment(last).format('YYYYMMDD')) {
        AVprize.set('share', 1);
        AVprize.increment('count', 1);
    } else {
        if (AVprize.get('share') < 3) {
            AVprize.increment('count', 1);
        }
        AVprize.increment('share', 1);
    }

    AVprize.set('last', new Date());

    let AVret = await AVprize.save(null, {
        fetchWhenSave: true,
    });

    ctx.body = {
        success: 0,
        msg: '成功',
        data: {
            share: AVret.get('share'),
            count: AVret.get('count'),
            times: AVret.get('times')
        },
    };
};

exports.reduce = async(ctx, next) => {
    let userid = ctx.query.userid;
    let result = {
        success: 1,
        msg: 'userid不正确',
    };
    if (!utils.isNumeric(userid)) {
        return ctx.body = result;
    }

    let AVprize = await exports.queryPrize(userid);

    if (!AVprize) {
        return ctx.body = result;
    }

    if (AVprize.get('count')) {
        AVprize.increment('count', -1);
        let AVret = await AVprize.save(null, {
            fetchWhenSave: true,
        });
        ctx.body = {
            success: 0,
            msg: '成功',
            data: {
                share: AVret.get('share'),
                count: AVret.get('count'),
            },
        };
    } else {
        ctx.body = {
            success: 0,
            msg: '成功',
            data: {
                count: 0,
                share: AVprize.get('share'),
            }
        };
    }
};

exports.queryPrize = async(userid) => {
    let query = new AV.Query('Prize');
    query.equalTo('userid', userid);
    return await query.first();
};