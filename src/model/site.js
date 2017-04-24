const AV = require('leanengine');
const query = new AV.Query('Site');

const utils = require('../utils/utils');

/**
 * @desc 涉及增加相关的
 */
exports.increase = async(key, num = 1) => {
    let AVsite = await query.first();
    AVsite.increment(key, num);
    let newSite = await AVsite.save(null, {
        fetchWhenSave: true,
    });
    return newSite;
};

exports.get = async() => {
    let AVsite = await query.first();
    return AVsite.attributes;
};

exports.video = async(ctx) => {
    let AVsite = await exports.increase('video');
    ctx.body = {
        success: 1,
        video: AVsite.get('video'),
    };
};

exports.update = async(ctx, next) => {
    let data = ctx.request.body;
    let AVsite = await query.first();
    for (let key in data) {
        AVsite.set(key, utils.isNumeric(data[key]) ? +data[key] : data[key]);
    }
    let AVret = await AVsite.save();
    ctx.body = Object.assign({
        success: 0,
    }, AVret.attributes);
};

exports.view = async(ctx, next) => {
    let AVsite = await exports.increase('view');
    ctx.body = {
        success: 0,
        view: utils.numberFormat(AVsite.get('view')),
    };
};

exports.config = async(ctx, next) => {
    let AVsite = await query.first();
    ctx.body = {
        success: 0,
        data: AVsite.attributes,
    };
};

/**
 * @desc 直播数据
 */
exports.live = async(ctx, next) => {
    let AVsite = await exports.increase('live');
    ctx.body = {
        success: 0,
        data: {
            view: AVsite.get('live'),
            praise: AVsite.get('praise'),
        },
    };
};

/**
 * @desc 直播播放量、点赞量  type: live播放量 praise点赞量
 */
exports.liveInc = async(ctx, next) => {
    let params = ctx.request.body;

    if (['live', 'praise'].indexOf(params.type) === -1) {
        return ctx.body = {
            success: 1,
            num: 0,
        };
    }

    let AVsite = await exports.increase(params.type);

    ctx.body = {
        success: 0,
        num: utils.numberFormat(AVsite.get(params.type)),
    };
};