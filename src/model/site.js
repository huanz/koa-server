const AV = require('leanengine');

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
    let data = ctx.body;
    let AVsite = await query.first();
    for (let key in data) {
        AVsite.set(key, data[key]);
    }
    ctx.body = await AVsite.save();
};