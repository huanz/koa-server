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