(function ($, window) {
    // 抽奖程序
    var Lottery = {
        // 初始化用户配置
        init: function (options) {
            this.options = $.extend({
                selector: '#j-lottery',
                width: 3, // 转盘宽度
                height: 2, // 转盘高度
                initSpeed: 500, // 初始转动速度
                speed: 500, // 当前转动速度
                upStep: 50, // 加速滚动步长
                upMax: 80, // 速度上限
                downStep: 30, // 减速滚动步长
                downMax: 500, // 减速上限
                waiting: 2000, // 匀速转动时长
                index: 0, // 初始位置
                target: 3, // 中奖位置，可通过后台算法来获得，默认值：最便宜的一个奖项或者"谢谢参与"
                isRunning: false // 当前是否正在抽奖
            }, options);
            this.$el = $(this.options.selector);
            this._setup();
        },

        // 开始装配转盘
        _setup: function () {

            this.$lottery = this.$el.find('.lottery-item');

            this._enable();
        },

        // 开启抽奖
        _enable: function () {
            this.$el.on('click', '.lottery-btn', $.proxy(this.beforeRoll, this));
        },

        // 禁用抽奖
        _disable: function () {
            this.$el.off('click', '.lottery-btn', $.proxy(this.beforeRoll, this));
        },

        // 转盘加速
        _up: function () {
            var _this = this;
            if (_this.options.speed <= _this.options.upMax) {
                _this._constant();
            } else {
                _this.options.speed -= _this.options.upStep;
                _this.upTimer = setTimeout(function () {
                    _this._up();
                }, _this.options.speed);
            }
        },

        // 转盘匀速
        _constant: function () {
            var _this = this;
            clearTimeout(_this.upTimer);
            setTimeout(function () {
                _this.beforeDown();
            }, _this.options.waiting);
        },

        // 减速之前的操作，支持用户追加操作（例如：从后台获取中奖号）
        beforeDown: function () {
            var _this = this;
            _this.aim();
            if (_this.options.beforeDown) {
                _this.options.beforeDown.call(_this);
            }
            _this._down();
        },

        // 转盘减速
        _down: function () {
            var _this = this;
            if (_this.options.speed > _this.options.downMax && _this.options.target == _this._index()) {
                _this._stop();
            } else {
                _this.options.speed += _this.options.downStep;
                _this.downTimer = setTimeout(function () {
                    _this._down();
                }, _this.options.speed);
            }
        },

        // 转盘停止，还原设置
        _stop: function () {
            var _this = this;
            clearTimeout(_this.downTimer);
            clearTimeout(_this.rollerTimer);
            _this.options.speed = _this.options.initSpeed;
            _this.options.isRunning = false;
            _this._enable();
            if (_this.options.stop) {
                _this.options.stop.call(_this);
            }
        },

        // 抽奖之前的操作，支持用户追加操作
        beforeRoll: function () {
            if (this.options.beforeRoll && this.options.beforeRoll.call(this) !== false) {
                this._disable();
                this._roll();
            }
        },

        // 转盘滚动
        _roll: function () {
            var _this = this;
            this.$lottery.filter('[index="' + this._index() + '"]').removeClass('active');
            ++this.options.index;
            this.$lottery.filter('[index="' + this._index() + '"]').addClass('active');
            this.rollerTimer = setTimeout(function () {
                _this._roll();
            }, _this.options.speed);
            if (!this.options.isRunning) {
                this._up();
                this.options.isRunning = true;
            }
        },

        // 转盘当前格子下标
        _index: function () {
            return this.options.index % this._count();
        },

        // 转盘总格子数
        _count: function () {
            return this.options.width * this.options.height - (this.options.width - 2) * (this.options.height - 2);
        },

        // rand 
        _rand: function (arr) {
            var leng = 0;
            for (var i = 0; i < arr.length; i++) {
                leng += arr[i];
            }
            for (var i = 0; i < arr.length; i++) {
                var random = parseInt(Math.random() * leng);
                if (random < arr[i]) {
                    return i;
                } else {
                    leng -= arr[i];
                }
            }
        },
        // 获取中奖号，用户可重写该事件，默认随机数字
        aim: function () {
            if (this.options.aim) {
                this.options.aim.call(this);
            }
        }
    };

    var PAGE = {
        init: function () {
            this.$toast = $('.toast');
            this.$dialog = $('#j-dialog');
            this.$dialogC = this.$dialog.find('.lottery-alert-content');

            /**
             * @desc 抽奖次数
             */
            window.luckyCount = {
                count: 1,
                share: 0
            };

            this.events();
            this.lottery();

            this.luckyData();
        },
        events: function () {
            var _this = this;

            $('.mybtn').on('click', function () {
                _this.toast('啊哦，您还没有中奖呢');
            });

            this.$dialog.on('click', '.lottery-alert-close', function () {
                _this.$dialog.fadeOut();
            }).on('click', '.lottery-mybtn', function () {
                _this.toast('啊哦，您还没有中奖呢');
            }).on('click', '.lottery-sharebtn', function () {
                window.MMSHARE.invoke();
            });
        },
        lottery: function () {
            var _this = this;
            Lottery.init({
                beforeRoll: function () {
                    if (window.luckyCount.count) {
                        window.luckyCount.count--;
                        _this.luckyData(true);
                        return true;
                    } else {
                        _this.dialog($('#j-tpl-' + (window.luckyCount.share < 3 ? '1' : '0')).html());
                        return false;
                    }
                },
                stop: function () {
                    _this.toast('啊哦，您没有中奖哦');
                }
            });
        },
        luckyData: function (reduce) {
            var api = 'https://meizu.leanapp.cn/api/prize' + (reduce ? '/reduce' : '') + '?userid=' + window.momoid;
            $.getJSON(api, function (res) {
                if (!res.success) {
                    window.luckyCount = res.data;
                }
            });
        },
        dialog: function (html) {
            this.$dialogC.html(html);
            this.$dialog.fadeIn();
        },
        toast: function (msg) {
            var $toast = this.$toast;
            $toast.text(msg).fadeIn();
            setTimeout(function () {
                $toast.fadeOut();
            }, 2000);
        }
    };

    PAGE.init();
})($, window);