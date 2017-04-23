const numeral = require('numeral');
const moment = require('moment');
moment.locale('zh-cn');
/**
 * extracting a list of property values
 *
 * @param {Array<Object>} arr
 * @param {String} key
 * @param {Boolean} leanCloud 特殊处理
 * @returns {Array} result
 */
exports.pluck = (arr, key, leanCloud = true) => {
    let result = [];
    arr.forEach(item => {
        if (item[key]) {
            leanCloud ? result.push(Object.assign({
                id: item.id,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }, item[key])) : result.push(item[key]);
        }
    });
    return result;
};

exports.isObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test((id + '').trim());
};

exports.fromNow = (data, format = 'dd') => {
    return moment(data, format).fromNow();
};

exports.listFormat = (list, comments) => {
    return list.map(item => {
        return Object.assign({
            id: item.id,
            createdAt: exports.fromNow(item.createdAt),
            liked: comments && comments.indexOf(item.id) !== -1
        }, item.attributes);
    });
};

exports.liked = (list, comments) => {
    return comments.length ? list.map(item => {
        item.liked = comments.indexOf(item.id) !== -1;
        return item;
    }) : list;
};

exports.isNumeric = (val) => {
    return !Array.isArray(val) && (val - parseFloat(val) + 1) >= 0;
};

exports.moment = moment;

exports.numberFormat = (value) => {
    if (value >= 10000) {
        return numeral(value/10000).format('0,0.00').replace(/\.?0{1,2}$/, '') + '万';
    }
    return numeral(value).format('0,0');
};