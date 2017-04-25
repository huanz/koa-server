(function ($, window) {
    var PAGE = {
        config: {
            title: '歌手张碧晨陌陌直播，观看赢新品手机！',
            text: '魅蓝 E2 新品发布会正在直播中',
            url: window.location.href,
            pic: 'https://s.momocdn.com/biz/m/activity/2017/mzso/img/meizuzb.jpg'
        },
        api: 'https://meizu.leanapp.cn/api/live',
        init: function () {
            this.$view = $('#j-view');
            this.$praise = $('#j-praise');

            this.video();
            this.getData();
            this.events();
            this.share();
        },
        video: function () {
            var player = videojs('j-player', {
                controls: false
            });
            var $control = $('.video-control');
            var $play = $control.find('i.vjs-icon-play');
            var $fullscreen = $control.find('i.vjs-icon-play');

            player.on(['pause', 'ended'], function () {
                $play.removeClass('vjs-icon-pause');
            });

            player.on(['waiting', 'playing'], function () {
                $play.addClass('vjs-icon-pause');
            });

            player.on('fullscreenchange', function () {
                $fullscreen.toggleClass('vjs-icon-fullscreen-exit', player.isFullscreen());
            });

            // vjs-icon-pause
            $control.on('click', '.vjs-icon-play', function () {
                player.paused() ? player.play() : player.pause();
            }).on('click', '.vjs-icon-fullscreen-enter', function () {
                player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();
            });
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
                $.post(_this.api, {
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
                    title: this.config.title,
                    text: this.config.text,
                    url: this.config.url,
                    sdk: 1,
                    resource: {
                        title: this.config.title,
                        desc: this.config.text,
                        icon: this.config.pic,
                        link: this.config.url
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