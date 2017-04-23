const AV = require('leanengine');
const numeral = require('numeral');
const query = new AV.Query('Site');

exports.get = async() => {
    let AVsite = await query.first();
    return AVsite.attributes;
};

exports.video = async(ctx) => {
    let AVsite = await query.first();

    AVsite.increment('video', 1);

    let newSite = await AVsite.save(null, {
        fetchWhenSave: true,
    });

    ctx.body = {
        success: 1,
        video: newSite.get('video'),
    };
};

exports.update = async(ctx, next) => {
    let data = ctx.request.body;
    let AVsite = await query.first();
    for (let key in data) {
        AVsite.set(key, data[key]);
    }
    let AVret = await AVsite.save();
    ctx.body = Object.assign({
        success: 0,
    }, AVret.attributes);
};

exports.view = async(ctx, next) => {
    let AVsite = await query.first();
    AVsite.increment('view', 1);
    let AVret = await AVsite.save(null, {
        fetchWhenSave: true,
    });

    ctx.body = {
        success: 0,
        view: numeral(AVret.get('view')).format('0,0'),
    };
};