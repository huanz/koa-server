(function ($, window) {
    var PAGE = {
        config: {
            title: '4.26 魅蓝 E2 给青春做减法',
            text: '陌陌最火的求婚视频，100万附近人围观！',
            url: window.location.href,
            pic: 'https://s.momocdn.com/biz/m/activity/2017/mzso/img/meizumomo.jpg'
        },
        api: 'https://meizu.leanapp.cn/api/live',
        init: function () {
            this.$view = $('#j-view');
            this.$praise = $('#j-praise');

            this.getData();
            this.events();
            this.share();
        },
        getData: function () {
            var _this = this;
            $.getJSON(this.api, function (res) {
                if (!res.success) {
                    _this.$view.text(res.data.view);
                    _this.$praise.text(res.data.praise);
                }
            });
        },
        events: function () {
            var _this = this;
            this.$praise.on('click', function () {
                $.post(this.api, {
                    type: 'praise'
                }, function (res) {
                    res.success || _this.$praise.text(res.num);
                }, 'json');
            });
        },
        share: function () {
            var MomoBridge = window.MomoBridge || window.mm;
            var shareConfig = $.extend({
                callback: '',
                apps: ['momo_feed', 'momo_contacts']
            }, this.config);

            shareConfig.configs = {
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
                momo_friend: this.config,
                momo_discuss: this.config,
                momo_group: this.config
            };

            MomoBridge.init({
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
    PAGE.init();
})($, window);