(function ($, window) {
    var BASEAPI = 'https://meizu.leanapp.cn/api';
    var PAGE = {
        user: {
            userid: window.momoid,
            nickname: window.username,
            avatar: window.avatar
        },
        api: {
            comment: BASEAPI + '/comment',
            like: BASEAPI + '/like',
            video: BASEAPI + '/video'
        },
        init: function () {
            this.$video = $('.video-like');
            this.$list = $('#j-list');
            this.$comment = this.$list.find('.comment-list');
            this.$total = $('#j-total');
            this.$toast = $('.toast');
            this.$tabs = $('.tab > a');
            this.$more = this.$list.find('.comment-more');

            this.params = {
                userid: this.user.userid,
                skip: 0,
                limit: 15
            };

            this.getComments();
            this.events();
        },
        events: function () {
            var _this = this;
            /**
             * @desc 
             */
            var player = videojs('j-player');
            player.on('ready', function () {
                try {
                    window.followUrl && $.get(window.followUrl);
                } catch (error) {}
            });
            /**
             * @desc 切换tab
             */
            var $tab = this.$tabs;
            var $tabC = $('.tab-content');
            $tab.on('click', function () {
                var $this = $(this);
                var index = $this.index();
                if (!$this.hasClass('active')) {
                    $tab.removeClass('active');
                    $this.addClass('active');
                    $tabC.hide().eq(index).show();
                }
            });

            this.$video.on('click', function () {
                var $this = $(this);
                $.post(_this.api.video, function (res) {
                    $this.text(res.video);
                });
            });

            /**
             * @desc 提交评论
             */
            $('.comment-form').submit(function (e) {
                e.preventDefault();
                var comment = $.trim($(this).serializeArray()[0].value);
                comment && _this.postComment(comment);
                return false;
            });
            /**
             * @desc 评论点赞
             */
            this.$list.on('click', '.comment-praise', function () {
                var $this = $(this);
                var params = $this.data();
                if ($this.hasClass('active')) {
                    return;
                }
                $.post(_this.api.like, params, function (res) {
                    res.success || $this.text(res.comment.like).addClass('active');
                }, 'json');
            });
            /**
             * @desc 点击加载更多
             */
            this.$more.on('click', function () {
                _this.getComments();
            });
        },
        getComments: function () {
            var _this = this;
            $.getJSON(this.api.comment, this.params, function (res) {
                var first = !_this.params.skip;
                /**
                 * @desc 首次加载
                 */
                if (first) {
                    /**视频点赞数量 */
                    _this.$video.text(res.video);
                    /**评论总数 */
                    _this.$total.text(res.total);
                    /**热门评论 */
                    if (res.hot.length) {
                        $('#j-hot').show().find('.comment-hot').html(_this.renderList(res.hot));
                        _this.params.skip += res.hot.length;
                    }
                }

                if (res.list.length) {
                    /**评论 */
                    _this.$comment[first ? 'html' : 'append'](_this.renderList(res.list));

                    if (res.list.length < _this.params.limit) {
                        _this.$more.hide();
                    } else {
                        /**分页skip */
                        _this.params.skip += res.list.length;
                    }
                } else {
                    _this.$more.hide();
                }
            });
        },
        renderList: function (list) {
            var _this = this;
            var str = '';
            $.each(list, function (i, item) {
                str += _this.renderComment(item);
            });
            return str;
        },
        renderComment: function (item) {
            return [
                '<div class="comment-item">',
                '<img class="comment-thumb" src="' + item.avatar + '" alt="' + item.nickname + '">',
                '<div class="comment-right">',
                '<p class="comment-name">' + item.nickname + '<span class="comment-praise ' + (item.liked ? 'active' : '') + '" data-userid="' + item.userid + '" data-comment="' + item.id + '">' + item.like + '</span></p>',
                '<p class="comment-info">' + item.createdAt + '</p>',
                '<p class="comment-info"><span class="blue">#点评赢取魅蓝E2#&nbsp;&nbsp;</span>' + item.text + '</p>',
                '</div>',
                '</div>'
            ].join('');
        },
        postComment: function (comment) {
            var _this = this;
            $.post(this.api.comment, $.extend({}, this.user, {
                text: comment
            }), function (res) {
                if (!res.success) {
                    _this.$comment.prepend(_this.renderComment(res.comment));
                    $(window).scrollTop(_this.$tabs.offset().top);
                } else {
                    _this.toast('评论失败');
                }
            }, 'json');
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