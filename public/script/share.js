(function ($, window) {
    var MomoBridge = window.MomoBridge || window.mm;
    var config = {
        title: '4.26 魅蓝 E2 给青春做减法',
        text: '陌陌最火的求婚视频，100万附近人围观！',
        url: window.location.href,
        pic: 'http://blog.u.qiniudn.com/meizumomo.jpg'
    };
    var shareConfig = {
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
                sdk: 1,
                resource: {
                    title: config.title,
                    desc: config.text,
                    icon: config.pic,
                    link: config.url
                }
            },
            momo_friend: config,
            momo_discuss: config,
            momo_group: config
        }
    };
    var MMSHARE = {
        init: function () {
            MomoBridge.ready(function (bridge) {
                bridge.invoke('init', {
                    enable: {
                        back: 0,
                        forward: 0,
                        refresh: 0,
                        share: 0,
                        scrollbar: 0,
                        ui_btn: 0
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
            });
        },
        invoke: function () {
            MomoBridge.ready(function (bridge) {
                bridge.invoke('callShare', shareConfig);
            });
        }
    };
    window.MMSHARE = MMSHARE;
})($, window);