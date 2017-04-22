(function ($, window) {
    var config = window.config = {
        title: '预约只需1秒钟 奖品高达20万',
        text: '附近的人都在抢！0元预约抢夺魅蓝Note5新品手机',
        url: window.location.href,
        pic: 'https://s.momocdn.com/w/u/img/2016/12/05/1480937461662-share.jpg'
    };
    window.shareCallback = function () {
        
    };
    var shareConfig = window.shareConfig = {
        title: config.title,
        text: config.text,
        url: config.url,
        pic: config.pic,
        callback: 'shareCallback',
        apps: ['momo_feed', 'momo_contacts'],
        configs: {
            momo_feed: {
                title: config.title,
                text: config.text,
                url: config.url,
                resource: {
                    title: config.title,
                    desc: config.text,
                    icon: config.pic,
                    link: config.url
                }
            }
        }
    }
    var callback = window.callback = {
        config: function () {
            mm.init({
                enable: {
                    share: 0,
                    ui_btn: 1
                },
                share: shareConfig,
                ui_btn: {
                    title: '',
                    dropdown: 0,
                    buttons: [{
                        'text': '分享',
                        'action': 1,
                        'param': shareConfig,
                    }]
                }
            });
        }
    };
    callback.config();
})($, window);