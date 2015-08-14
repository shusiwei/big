/* ==================================================
 * @ url:http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html

+ 附录2-所有JS接口列表
    + 版本1.0.0接口
        - onMenuShareTimeline
        - onMenuShareAppMessage
        - onMenuShareQQ
        - onMenuShareWeibo

        - hideOptionMenu
        - showOptionMenu
        - hideMenuItems
        - showMenuItems
        - hideAllNonBaseMenuItem
        - showAllNonBaseMenuItem
        - closeWindow
        
+ 附录3-所有菜单项列表
    + 基本类
      - 举报: "menuItem:exposeArticle"
      - 调整字体: "menuItem:setFont"
      - 日间模式: "menuItem:dayMode"
      - 夜间模式: "menuItem:nightMode"
      - 刷新: "menuItem:refresh"
      - 查看公众号（已添加）: "menuItem:profile"
      - 查看公众号（未添加）: "menuItem:addContact" 

    + 传播类
      - 发送给朋友: "menuItem:share:appMessage"
      - 分享到朋友圈: "menuItem:share:timeline"
      - 分享到QQ: "menuItem:share:qq"
      - 分享到Weibo: "menuItem:share:weiboApp"
      - 收藏: "menuItem:favorite"
      - 分享到FB: "menuItem:share:facebook"
      - 分享到 QQ 空间/menuItem:share:QZone 

    + 保护类
      - 调试: "menuItem:jsDebug"
      - 编辑标签: "menuItem:editTag"
      - 删除: "menuItem:delete"
      - 复制链接: "menuItem:copyUrl"
      - 原网页: "menuItem:originPage"
      - 阅读模式: "menuItem:readMode"
      - 在QQ浏览器中打开: "menuItem:openWithQQBrowser"
      - 在Safari中打开: "menuItem:openWithSafari"
      - 邮件: "menuItem:share:email"
      - 一些特殊公众号: "menuItem:share:brand"
 * ================================================== */
define(function(require) {
    'use strict';
    var jssdk = require('http://res.wx.qq.com/open/js/jweixin-1.0.0');

    return function($, Big) {
        var WechatAPI,
            ShareTips;

        /* ==================================================
         * @constructor 分享提示[Component]
         * @param(param:json) 参数
         *   - (target:selector *) 显示提示的按钮
         *   + (options:json) 可选选项
         *     - (speed:millisecond[300]) 过渡时长
         * ================================================== */
        ShareTips = function(target, options) {
            var _self = this,
                _options = Big.isType('json', options) ? options : {},

                $target = this._target = $(target),
                $tips = this._tips = $('<div class="-share-tips"></div>').append('<i class="-share-tips-hand"></i>'),

                _speed = Big.isType('number', _options.speed) ? _options.speed : 300,
                _blurID = Big.getRandom();

            $(document.body).append($tips);

            var bindEvent = this.bindEvent = function(target) {
                    if (target) {
                        $(target).on('click', function() {
                            toggle('in');
                        });
                    } else {
                        // 绑定控制显示按钮
                        $target.on('click', function() {
                            toggle('in');
                        });
                        
                        // 绑定控制隐藏按钮
                        $tips.on('click', function() {
                             toggle('out');
                         });
                    };
                },
                toggle = this.toggle = function(type) {
                    if (type === 'in') {
                        Big.ui.toggleBlur(_blurID, {
                            target : $tips,
                            callback : function() {
                                $tips.css({
                                    zIndex : Big.getZIndex($tips)
                                }).fadeIn(_speed);
                            }
                        });
                    } else if (type === 'out') {
                        Big.ui.toggleBlur(_blurID, {
                            callback : function() {
                                $tips.fadeOut(_speed, function() {
                                    $tips.css({
                                        zIndex : - 1
                                    });
                                });
                            }
                        });
                    }
                };

                bindEvent();
            };

        /* ==================================================
         * @constructor(*) 微信API[Extend]
         * + (share:json) 分享
         *   - (imgUrl:string *) 封面图片URL地址
         *   - (title:string) 内容标题
         *   - (link:string) 页面URL地址
         *   - (desc:string) 内容描述
         * ================================================== */
        WechatAPI = Big.ext.WechatAPI = function(param, options) {
            var _self = this,
                xhr = param.xhr,
                cfg = param.cfg,

                _options = Big.isType('json', options) ? options : {},
                _prop = this._prop = {},

                config = _options.config = Big.isType('json', _options.config) ? _options.config : {},
                item = config.item = Big.isType('json', config.item) ? config.item : {},

                tempImg = new Image();

            tempImg.src = cfg.imgUrl;

            _prop.xhr = {
                url : Big.isType('string', xhr.url) ? xhr.url : '/',
                type : Big.isType('string', xhr.type) && (xhr.type.toUpperCase() == 'GET' || xhr.type.toUpperCase() == 'POST') ? xhr.type.toUpperCase() : 'GET',
                data : Big.isType('json', xhr.data) ? xhr.data : {},
                dataType : Big.isType('string', xhr.dataType) && (xhr.dataType == 'json' || xhr.dataType == 'jsonp' || xhr.dataType == 'xml' || xhr.dataType == 'text' || xhr.dataType == 'html' || xhr.dataType == 'script') ? xhr.dataType : 'json'
            },
            _prop.cfg = {
                title : Big.isType('string', cfg.title) ? cfg.title : document.title,
                desc : Big.isType('string', cfg.desc) ? cfg.desc : document.querySelector('meta[name="descripton"]').content,
                link : Big.isType('string', cfg.link) ? cfg.link : Big.host.href,
                imgUrl : tempImg.src
            },
            _prop.config = {
                api : Big.isType('array', config.api) ? config.api : ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'showOptionMenu', 'hideOptionMenu', 'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem'],
                menu : Big.isType('boolean', config.menu) ? config.menu : true,
                item : {
                    base : Big.isType('boolean', item.base) ? item.base : false,
                    hide : Big.isType('boolean', item.hide) ? item.hide : [],
                    show : Big.isType('array', item.show) ? item.show : ['menuItem:share:appMessage', 'menuItem:share:timeline', 'menuItem:share:qq', 'menuItem:share:weiboApp', 'menuItem:favorite']
                }
            };

            this.onReady = _options.onReady;

            var pushState = this.pushState = function(options) {
                    var options = Big.isType('json', options) ? options : {},
                        cfg = Big.isType('json', options.cfg) ? options.cfg : {},
                        xhr = Big.isType('json', options.xhr) ? options.xhr : _prop.xhr,
                        api = Big.isType('array', options.api) ? options.api : _prop.config.api;

                    $.ajax({
                        url : xhr.url,
                        type : xhr.type,
                        data : xhr.data,
                        dataType : xhr.dataType,
                        success : function(data) {
                            jssdk.config({
                                debug : false,
                                appId : data.appId,
                                timestamp : data.timestamp,
                                nonceStr : data.nonceStr, 
                                signature : data.signature,
                                jsApiList : api
                            });

                            jssdk.ready(function() {
                                bindEvent(cfg);

                                if (Big.isType('function', options.callback)) {
                                    options.callback();
                                };
                            });
                        }
                    });
                },
                bindEvent = function(_cfg) {
                    var title = _cfg.title || _prop.cfg.title,
                        desc = _cfg.desc || _prop.cfg.desc,
                        link = _cfg.link || _prop.cfg.link,
                        imgUrl = _cfg.imgUrl || _prop.cfg.imgUrl;
                        
                    jssdk.onMenuShareAppMessage({
                        title: title, 
                        desc: desc,
                        link: link,
                        imgUrl: imgUrl,
                        type: 'link',
                        dataUrl: '',
                        success: function() {},
                        cancel: function() {}
                    });

                    jssdk.onMenuShareTimeline({
                        title: title, 
                        link: link,
                        imgUrl: imgUrl,
                        success: function() {},
                        cancel: function() {}
                    });

                    jssdk.onMenuShareQQ({
                        title: title, 
                        desc: desc,
                        link: link,
                        imgUrl: imgUrl,
                        success: function() {},
                        cancel: function() {}
                    });

                    jssdk.onMenuShareWeibo({
                        title: title, 
                        desc: desc,
                        link: link,
                        imgUrl: imgUrl,
                        success: function() {},
                        cancel: function() {}
                    });
                },
                changeMenu = function(option, item) {
                    if (option) {
                        jssdk.showOptionMenu();
                    } else {
                        jssdk.hideOptionMenu();
                    };

                    if (item.base) {
                        jssdk.showAllNonBaseMenuItem();
                    } else {
                        jssdk.hideAllNonBaseMenuItem();
                    };

                    if (item.hide.length > 0) {
                        jssdk.hideMenuItems({
                            menuList : item.hide
                        });
                    };

                    if (item.show.length > 0) {
                        jssdk.showMenuItems({
                            menuList : item.show
                        });
                    };
                },
                initialize = (function(tips) {
                    if (Big.isType('json', tips) && tips.target) {
                        this.tipser = new ShareTips(tips.target, tips.options);
                    };

                    pushState({
                        cfg : _prop.cfg,
                        xhr : _prop.xhr,
                        api : _prop.config.api,
                        callback : function() {
                            changeMenu(_prop.config.menu, _prop.config.item)
                        }
                    });

                    if (Big.isType('function', this.onReady)) {
                        this.onReady(this);
                    };
                }).call(this, param.tips);
        };

        return WechatAPI;
    };
});