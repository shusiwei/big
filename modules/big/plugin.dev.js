/*
 * name : Big Plugin
 * author : shusiwei
 * data : 2015/08/14
 * version : 1.0 beta
 */

define(function(require) {
    'use strict';
    require('./big.css');
 
    return function($, Big) {
        var ScrollFollow,
            ChapterTrun,
            LightPopup,
            CycleLoader,
            ToggleTab,
            EasingTab,
            EasySlider,
            LazyLoad,

            AjaxForm,
            DragAPI,

            ScrollTop,
            DatePicker;

        /* ==================================================
         * @constructor(*) 跟随浮动[View]
         * - target(selector *) 浮动元素
         * + options(json) 参数
         *   - (ease:boolean [false]) 浮动模式(true:缓动浮动/false:固定浮动)
         *   - (attach:boolean [false]) 是否附着于页面宽度
         *   - (offset:number [5]) 对应九宫格的位置
         *   - (speed:millisecond [500]) 对应九宫格的位置
         *   - (range:number [980]) 屏幕最小可视宽度,当窗口宽度小于此值时元素始终保持可见
         * ================================================== */
        ScrollFollow = Big.ui.ScrollFollow = function(target, options) {
            if (!target) return false;

            var _self = this,
                _options = Big.isType('json', options) ? options : {},

                $target = this._target = $(target).eq(0).addClass('-scroll-follow'),
                targetSize = Big.getSize($target),
                eleWidth = targetSize.width,
                eleHeight = targetSize.height,

                _params = this._params = {
                    ease : Big.isType('boolean', _options.ease) ? _options.ease : false,
                    attach : Big.isType('boolean', _options.attach) ? _options.attach : false,
                    offset : Big.isType('number', _options.offset) && _options.offset < 10 && _options.offset > 0 ? _options.offset : 5,
                    speed : Big.isType('number', _options.speed) ? _options.speed : 500,
                    range : (Big.isType('number', _options.range) ? _options.range : 980) + (eleWidth * 2)
                };
            
            this.onReady = _options.onReady;

            var setOffset = function(mode) {
                    if (_params.ease && mode !== false) {
                        $target.animate(Big.getFixed({
                            offset : _params.offset,
                            attach : _params.attach,
                            range : _params.range,
                            width : eleWidth,
                            height : eleHeight
                        }, {
                            ease : _params.ease
                        }), {
                                duration : _params.speed,
                                queue : false
                            }
                        );
                    } else {
                        $target.css(Big.getFixed({
                            offset : _params.offset,
                            attach : _params.attach,
                            range : _params.range,
                            width : eleWidth,
                            height : eleHeight
                        }, {
                            ease : _params.ease
                        }));
                    }
                },
                initialize = (function() {
                    Big.ui.setFixed($target, _params.ease);
                    setOffset(false);

                    Big.evt.onChange(setOffset);

                    if (Big.isType('function', _self.onReady)) {
                        _self.onReady(_self);
                    };
                })();
        };

        /* ==================================================
         * @constructor(*) 节点关联的屏幕滚动[View]
         * - item(array *) 项目
         *   - [0] (json) 单项参数
         *     - (catalog : (selector *)) 目标
         *     - (chapter : (selector *)) 锚位置
         *     - (adjust : (number [0])) 微调(正负值)
         *     - (speed : (millisecond [1000])) 滚动速度
         *     - (easing : string (easing ['easeInOutQuart'])) 缓动效果
         *     - (callback : function(top)) 完成后的回调，传值为滚动完成后的top位置
         * + options(json) 参数
         *   - (speed:millisecond [1000]) 显示/隐藏的速度
         *   - (easing:string (easing ['easeInOutQuart'])) 缓动效果
         * ================================================== */
        ChapterTrun = Big.ui.ChapterTrun = function(item, options) {
            if (!Big.isType('array', item) && item.length === 0) return false;

            var _self = this,
                _options = Big.isType('json', options) ? options : {},
                _targets = this._targets = [],

                _active = undefined;

            this.onReady = _options.onReady,
            this.onChange = _options.onChange;

            var activeStyle = function() {
                    var position = Big.size.height / 2 + Big.size.top,
                        tempActive;

                    for (var i = 0, length = _targets.length; i < length; i++) {
                        var $chapter = _targets[i][1],
                            top = $chapter.offset().top,
                            offset = top + $chapter.height();

                        if (position >= top && position <= offset) {
                            tempActive = i;
                            break;
                        };
                    };

                    Big.each(_targets, function(index, target) {
                        if (tempActive !== undefined) {
                            if (index !== tempActive && target[0].hasClass('active')) {
                                target[0].removeClass('active');
                            } else if (index === tempActive) {
                                if (!target[0].hasClass('active')) {
                                    target[0].addClass('active');
                                };
                            };
                        } else {
                            target[0].removeClass('active');
                        };
                    });

                    if (tempActive !== _active) {
                        _active = tempActive;

                        if (Big.isType('function', _self.onChange)) {
                            _self.onChange(_active);
                        };
                    };
                },
                initialize = (function(item, opt) {
                    // catalogs = _self._catalogs = [],
                    // chapters = _self._chapters = [],
                    // params = _self._params = [];

                    Big.each(item, function(index, value) {
                        var target = [],
                            $catalog = $(value.catalog).addClass('-chapter-trun-catalog'),
                            $chapter = $(value.chapter).addClass('-chapter-trun-chapter'),
                            param = {
                                adjust : Big.isType('number', value.adjust) ? value.adjust : (Big.isType('number', opt.adjust) ? opt.adjust : 0),
                                speed : Big.isType('number', value.speed) ? value.speed : (Big.isType('number', opt.speed) ? opt.speed : 1000),
                                easing : Big.isType('string', value.easing) ? value.easing : (Big.isType('string', opt.easing) ? opt.easing : 'easeInOutQuart'),
                                callback : Big.isType('function', value.callback) ? value.callback : (Big.isType('function', opt.callback) ? opt.callback : null)
                            };

                        $catalog.on('click', function() {
                            Big.ui.pageScroll($chapter, param);
                        });

                        target.push($catalog);
                        target.push($chapter);
                        target.push(param);

                        _targets.push(target);
                    });

                    Big.evt.onChange(activeStyle);
                    activeStyle();

                    if (Big.isType('function', _self.onReady)) {
                        _self.onReady(_self);
                    };
                })(item, _options);
        };

        /* ==================================================
         * @constructor 弹出框[Extend]
         * - content(DOM *) 打开弹出层所展现的内容
         * + options(json) 选项
         *   - (speed:millisecond [400]) 弹窗展示/关闭的速度
         *   - (style:string) 样式名
         *   - (width:number [200]) 弹窗打开的宽度
         *   - (height:number [200]) 弹窗打开的高度
         *   + (close:json) 关闭按钮参数
         *     - (icon:boolean [false]) 是否包含关闭按钮图标元素
         *     - (under:boolean [false]) 是否包含关闭按钮背景元素
         *   - (onReady:function) 构建完后执行的回调
         *   - (onShow:function) 完全打开弹出层后的回调
         *   - (onHide:function) 完全关闭弹出层后的回调
         *   - (onVisible:function) 当内容元素可见时的回调
         *   - (onPopUp:function) 开始打开弹出层时的回调
         *   - (onPopOff:function) 开始关闭弹出层时的回调
         * ================================================== */
        LightPopup = Big.ui.LightPopup = function(filler, options) {
            if (!filler && filler !== null) return false;

            var _self = this,
                _options = Big.isType('json', options) ? options : {},
                _params = this._params = {
                    width : Big.isType('number', _options.width) ? _options.width : 200,
                    height : Big.isType('number', _options.height) ? _options.height : 200,
                    speed : Big.isType('number', _options.speed) ? _options.speed : 400
                },

                $filler = $(filler),
                $body = $(document.body),

                $wrapper = this._wrapper = $('<div class="-light-popup"></div>'),
                $mask = this._mask = $('<div class="-light-popup-mask"></div>'),
                $origin = this._origin = $('<div class="-light-popup-origin"></div>'),
                $closeBtn = this._closeBtn = $('<a class="-light-popup-close"></a>'),
                $container = this._container = $('<div class="-light-popup-container"></div>'),
                $content = this._content = $('<div class="-light-popup-content"></div>'),

                _status = false,
                _blurID = Big.getRandom(),

                $target = null,
                _targetStyle = null,
                _zoomStyle = null,
                _fx = {};

            this.onReady = _options.onReady,
            this.onShow = _options.onShow,
            this.onHide = _options.onHide,
            this.onVisible = _options.onVisible,
            this.onPopUp = _options.onPopUp,
            this.onPopOff = _options.onPopOff,
            this.onAppend = _options.onAppend;

            $container.append($closeBtn).append($content);
            $origin.append($container);
            $wrapper.append($mask).append($origin);

            var show = this.show = function(target) {
                    $target = _self._target = $(target);

                    var targetSize = Big.getSize($target);

                    _targetStyle = {
                        width : targetSize.width,
                        height : targetSize.height,
                        margin : 0,
                        opacity : 0
                    };

                    $body.append($wrapper);
                    toggle();
                },
                /* --------------------------------------------------
                 * @module 显示切换
                 * -------------------------------------------------- */
                toggle = this.toggle = function() {                    
                    if (_status) {
                        if (Big.isType('function', _self.onPopOff)) {
                            _self.onPopOff(_self);
                        };
                        _fx.zoomOut(_targetStyle);
                    } else {
                        if (Big.isType('function', _self.onPopUp)) {
                            _self.onPopUp(_self);
                        };
                        _fx.zoomIn(_zoomStyle, _targetStyle);
                    };
                },
                setContent = this.setContent = function(filler, width, height) {
                    $content.empty().append(filler);
                    _zoomStyle = Big.getFixed({
                        offset : 5,
                        attach : false,
                        range : 0,
                        width : width || _params.width,
                        height : height || _params.height
                    }, {
                        fixed : true,
                        style : {
                            opacity : 1,
                            width : width || _params.width,
                            height : height || _params.height
                        }
                    });

                    if (Big.isType('function', _self.onAppend)) {
                        _self.onAppend($content.children(), _self);
                    };
                },
                bindEvent = function(type) {
                    $closeBtn[type]('click', toggle);
                    $mask[type]('click', toggle);
                },
                toggleAfter = function(type) {
                    switch (type) {
                        case 'in' :
                            bindEvent('on');
                            _status = true;

                            if (Big.isType('function', _self.onShow)) {
                                _self.onShow(_self);
                            };
                            break;

                        case 'out' :
                            _status = false;

                            if (Big.isType('function', _self.onHide)) {
                                _self.onHide(_self);
                            };
                            break;
                    };
                },
                initialize = (function(style, filler, close) {
                    if (Big.isType('string', style)) $wrapper.addClass(style);

                    setContent(filler, _params.width, _params.height);

                    var close = Big.isType('json', close) ? close : {};
                        close.icon = Big.isType('boolean', close.icon) ? close.icon : false;
                        close.under = Big.isType('boolean', close.under) ? close.under : false;

                    if (close.icon) {
                        $closeBtn.append('<i></i>');

                        if (close.under) {
                            $closeBtn.append('<b></b>');
                        };
                    };

                    Big.ui.keepFull($wrapper, {
                        callback : function() {
                            var offset = new ScrollFollow($wrapper, {
                                offset : 1
                            });
                        }
                    });

                    Big.each((function() {
                            if (Big.checkIE(9, 'lt')) {
                                return {
                                    zoomIn : function(endStyle) {
                                        $origin.css(Big.mergeJSON({
                                            position : 'absolute'
                                        }, endStyle));
                                        $wrapper.css({
                                            visibility : 'hidden',
                                            display : 'block'
                                        });

                                        if (Big.isType('function', _self.onVisible)) {
                                            _self.onVisible(_self);
                                        };

                                        $wrapper.css({
                                            visibility : 'visible',
                                            display : 'none',
                                            zIndex : Big.getZIndex($wrapper)
                                        }).fadeIn(_params.speed, function() {
                                            toggleAfter('in');
                                        });
                                    },
                                    zoomOut : function() {
                                        bindEvent('off');

                                        $wrapper.fadeOut(_params.speed, function() {
                                            $wrapper.detach();

                                            toggleAfter('out');
                                        });
                                    }
                                };
                            } else {
                                return {
                                    zoomIn : function(endStyle, startStyle) {
                                        var targetOffset = $target.offset();

                                        $origin.css(Big.mergeJSON({
                                            left : targetOffset.left - Big.size.left,
                                            top : targetOffset.top - Big.size.top
                                        }, startStyle));
                                        $container.css({opacity : 0});

                                        Big.ui.toggleBlur(_blurID, {
                                            target : $wrapper,
                                            callback : function() {
                                                $wrapper.css({zIndex : Big.getZIndex($wrapper)}).fadeIn(_params.speed, function() {
                                                    $origin.animate(endStyle, _params.speed, function() {
                                                        if (Big.isType('function', _self.onVisible)) {
                                                            _self.onVisible(_self);
                                                        };

                                                        $container.animate({
                                                            opacity : 1
                                                        }, _params.speed, function() {
                                                            toggleAfter('in');
                                                        });
                                                    });
                                                });
                                            }
                                        });
                                    },
                                    zoomOut : function(startStyle) {
                                        var targetOffset = $target.offset();

                                        bindEvent('off');

                                        $container.animate({
                                            opacity : 0
                                        }, _params.speed, function() {
                                            $origin.animate(Big.mergeJSON({
                                                left : targetOffset.left - Big.size.left,
                                                top : targetOffset.top - Big.size.top
                                            }, startStyle), _params.speed, function() {
                                                Big.ui.toggleBlur(_blurID, {
                                                    callback : function() {
                                                        $wrapper.fadeOut(_params.speed, function() {
                                                            $wrapper.detach();
                                                            $content.removeAttr('style');
                                                            $container.removeAttr('style');
                                                            $origin.removeAttr('style');

                                                            toggleAfter('out');
                                                        });
                                                    }
                                                });
                                            })
                                        });
                                    }
                                };
                            };
                        })(), function(key, fn) {
                        _fx[key] = fn;
                    });

                    if (Big.isType('function', _self.onReady)) {
                        _self.onReady(_self);
                    };
                })(_options.style, $filler, _options.close);
        };

        /* ==================================================
         * @constructor(*) 加载动画(通过改变element的background-position来造成动画的假象)[View]
         * + param(param *) 选项
         *   - (target:selector *) 执行动画的对象
         *   - (offset:number *) 单步偏移单位
         *   - (step:number *) 偏移总步数
         *   - (speed:millisecond *) 动画速度
          * + options(json) 参数
         *   - (time:millisecond [200]) 动画显示速度
         *   - (onReady:function) 装载完成后执行的回调
         * ================================================== */
        CycleLoader = Big.ui.CycleLoader = function(param, options) {
            if (!Big.isType('json', param)) return false;

            var _self = this,
                _options = Big.isType('json', options) ? options : {},

                $target = $(param.target).addClass('-cycle-loader'),
                offset = param.offset,
                step = param.step,
                speed = param.speed,
                _params= this._params = {
                    time : Big.isType('number', _options.time) ? _options.time : 200
                },

                _status = this._status = false,
                _timer,
                _count = 0;

            this.onReady = _options.onReady;

            var play = this.play = function(callback) {
                    if (_status === true) return false;

                    animateTo();
                    $target.fadeIn(_params.time, function() {
                        if (Big.isType('function', callback)) {
                            callback(_self);
                        };
                    });
                },
                stop = this.stop = function(callback) {
                    if (_status === false) return false;

                    $target.fadeOut(_params.time, function() {
                        clearInterval(_timer);
                        _status = _self._status = false;

                        if (Big.isType('function', callback)) {
                            callback(_self);
                        };
                    });
                },
                animateTo = function() {
                    clearInterval(_timer);
                    _status = _self._status = true;

                    var target = $target[0],
                        // count,
                        position;
                        // x = target.style.backgroundPosition;

                    // if (!x || x == '') {
                    //     count = 0;
                    // } else {
                    //     count = Math.abs(parseInt(x.split(' ')[0]) / offset);
                    // };

                    _timer = setInterval(function() {
                        // 如果运行到最大偏移量，则回到0，重新开始
                        if (_count < step) {
                            _count++;
                        } else {
                            _count = 0;
                        };

                        // 得到目前的偏移量
                        position = - (_count * offset);
                        // 改变backgroundPosition以达到动画效果
                        target.style.backgroundPosition = position + 'px 0';
                    }, speed);
                },
                initialize = (function() {
                    var loaderSize = Big.getSize($target);

                    $target.css(Big.getFixed({
                        offset : 5,
                        attach : false,
                        range : 0,
                        width : loaderSize.width,
                        height : loaderSize.height
                    }, {
                        style : {
                            display : 'none'
                        }
                    }));

                    if (Big.isType('function', _self.onReady)) {
                        _self.onReady(_self);
                    };
                })();
        };

        /* ==================================================
         * @constructor(*) Tab切换[View]
         * - controls(selector *) 切换的控制元素
         * - columns(selector *) 要切换的内容
         * + options(json) 选项
         *   - (event:event [mouseover]) 切换的事件
         *   - (active:number [0]) 默认显示的盒子索引
         *   - (delay:millisecond [200]) 鼠标滑动事件中的事件延时
         *   - (onReady:function) 装载完成后执行的回调
         *   - (onChange:function [prev, next]) 切换时执行的回调，回设参数为[当前索引, 下一个索引]
         * ================================================== */
        ToggleTab = Big.ui.ToggleTab = function(controls, columns, options) {
            if (!controls || !columns) return false;

            var _self = this,
                _options = Big.isType('json', options) ? options : {},

                $controls = this._controls = $(controls).addClass('-toggle-tab-control'),
                $columns = this._columns = $(columns).addClass('-toggle-tab-column').hide(),

                _event = Big.isType('string', _options.event) && 'on' + _options.event in $controls.get(0) ? _options.event : 'mouseover',
                _params = this._params = {
                    delay : Big.isType('number', _options.delay) && _event === 'mouseover' ? _options.delay : 200,
                    autoplay : Big.isType('boolean', _options.autoplay) ? _options.autoplay : true,
                    clear : Big.isType('number', _options.clear) ? _options.clear : (Big.isType('boolean', _options.clear) && _options.clear === true ? 100 : false)
                },

                _active = this._active = undefined,
                _activeTarget = null,
                _lazyID,
                _eventTimer,
                _clearTimer,
                _clearStatus;

            this.onReady = _options.onReady,
            this.onChange = _options.onChange;

            if ($controls.length === 0 || $columns.length === 0) return false;

            var toggleClear = this.toggleClear = function() {
                    if (_active === undefined) return false;

                    $controls.eq(_active).removeClass('active');
                    $columns.eq(_active).hide();
                    
                    _active = _self._active = undefined;
                },
                toggleTo = this.toggleTo = function(index, hasCallback, source) {
                    if (index < 0 || index >= $controls.length) return false;

                    $controls.eq(_active).removeClass('active');
                    $columns.eq(_active).hide();

                    $controls.eq(index).addClass('active');
                    $columns.eq(index).show();

                    if (Big.isType('function', _self.onChange) && hasCallback === true) {
                        _self.onChange(_active, index, source);
                    };

                    if (_lazyID in Big.coll.elem.lazy) Big.coll.elem.lazy[_lazyID].loading();

                    _active = _self._active = index;
                },
                leaveClear = function() {
                    clearTimeout(_clearTimer);
                    _clearTimer = setTimeout(function() {
                        if (_activeTarget === null) {
                            clearTimeout(_clearTimer);
                            _clearStatus = true;

                            toggleClear();
                        };
                    }, _params.clear || 0);
                },
                initialize = (function(initIndex) {
                    if (_params.autoplay) {
                        toggleTo(Big.isType('number', initIndex) && initIndex < $columns.length ? initIndex : 0, true, 'init');
                    };

                    _lazyID = new LazyLoad($columns, {
                        merge : true
                    })._lazyID;

                    var bindEvent = (function() {
                        if (_event === 'mouseover' && _params.delay > 0) {
                            $controls.hover(function(evt) {
                                var index = Big.indexOf($controls, evt.currentTarget);

                                _activeTarget = evt.currentTarget;

                                if (_active !== index || (_active === index && _clearStatus)) {
                                    _eventTimer = setTimeout(function() {
                                        toggleTo(index, true, 'event');
                                    }, _params.delay);
                                };
                            }, function() {
                                clearTimeout(_eventTimer);
                            });
                        } else {
                            $controls.on(_event, function(evt) {
                                var index = Big.indexOf($controls, evt.currentTarget);
                                
                                _activeTarget = evt.currentTarget;

                                if (_active !== index || (_active === index && _clearStatus)) {
                                    toggleTo(index, true, 'event');
                                };
                            });
                        };

                        if (_event === 'mouseover' && _params.clear) {
                            $controls.on('mouseleave', function(evt) {
                                _activeTarget = null;
                                leaveClear();
                            });

                            $columns.on('mouseleave', function(evt) {
                                _activeTarget = null;
                                leaveClear();
                            });
                        };

                        if (Big.isType('function', _self.onReady)) {
                            _self.onReady(_self);
                        };
                    })();
                })(_options.active);
        };

        /* ==================================================
         * @constructor(*) 缓动Tab切换[View]
         * - controls(selector *) 控制元素选择器
         * - columns(selector *) 内容栏目元素选择器
         * + options(json) 选项
         *   - (event:event [mouseover]) 切换的事件
         *   - (active:number [0]) 默认显示的盒子索引
         *   - (delay:millisecond [200]) 鼠标滑动事件中的事件延时
         *   - (mode:string ['x']) 滚动方向(x: 水平滚动)/(y: 垂直滚动)
         *   - (easing:string ['easeInOutQuart']) 缓动特效
         *   - (onReady:function) 装载完成后执行的回调
         *   - (onChangeStart:function [current, next]) 运动开始之前执行的回调，传回两个参数（当前列表的索引,下一个列表的索引）
         *   - (onChangeEnd:function [current, prev]) 运动完成之后执行的回调，传回两个参数（当前列表的索引,上一个列表的索引）
         * ================================================== */
        EasingTab = Big.ui.EasingTab = function(controls, columns, options) {
            if (!controls || !columns) return false;

            var _self = this,
                _options = Big.isType('json', options) ? options : {},

                $controls = this._controls = $(controls).addClass('-easing-tab-control'),
                $columns = this._columns = $(columns).addClass('-easing-tab-column'),
                $container = this._container = $('<div class="-easing-tab-container clearfix"></div>'),
                $wrapper = this._wrapper = this._columns.parent().addClass('-easing-tab-wrapper'),

                _event = Big.isType('string', _options.event) && 'on' + _options.event in $controls.get(0) ? _options.event : 'mouseover',
                _mode = Big.isType('string', _options.mode) && (_options.mode.toLowerCase() == 'x' || _options.mode.toLowerCase() == 'y') ? _options.mode : 'x',

                _params = this._params = {
                    delay : Big.isType('number', _options.delay) && _event == 'mouseover' ? _options.delay : 200,
                    speed : Big.isType('number', _options.speed) ? _options.speed : 800,
                    easing : Big.isType('string', _options.easing) ? Big.getEasing(_options.easing) : Big.getEasing('easeInOutQuart'),
                    autoplay : Big.isType('boolean', _options.autoplay) ? _options.autoplay : true
                },

                _active = this._active = undefined,
                _tempActive,
                _lazyID,
                _autoTimer;

            this.onReady = _options.onReady,
            this.onChangeStart = _options.onChangeStart,
            this.onChangeEnd = _options.onChangeEnd;

            if ($controls.length === 0 || $columns.length === 0) return false;

            var toggleTo = this.toggleTo = function(index, hasCallback, source) {
                    if (Big.isType('function', _self.onChangeStart)) {
                        _self.onChangeStart(_active, index, source);
                    };

                    var $control = $controls.eq(index),
                        $column = $columns.eq(index),
                        eleSize = Big.getSize($column),
                        width = eleSize.width,
                        height = eleSize.height,
                        top = 0,
                        left = 0;

                    Big.each(index, function(i) {
                        var prevEle = $columns.get(i),
                            prevSize = Big.getSize(prevEle);

                            left += prevSize.width,
                            top += prevSize.height;
                    });

                    $control.addClass('active').siblings().removeClass('active');

                    switch (_mode) {
                        case 'x' :
                        default :
                            $wrapper.stop().animate({
                                width : width,
                                height : height
                            }, _params.speed, _params.easing);
                            $container.stop().animate({
                                left : - left
                            }, _params.speed, _params.easing, function() {
                                slideEnd(index, hasCallback, source);
                            });
                            break;

                        case 'y' :
                            $wrapper.stop().animate({
                                width : width,
                                height : height
                            }, _params.speed, _params.easing);
                            $container.stop().animate({
                                top : - top
                            }, _params.speed, _params.easing, function() {
                                slideEnd(index, hasCallback, source);
                            });
                            break;
                    };
                },
                slideEnd = function(index, hasCallback, source) {
                    if (Big.isType('function', _self.onChangeEnd) && hasCallback === true) {
                        _self.onChangeEnd(index, _active, source);
                    };

                    _active = _self._active = index;

                    if (_lazyID in Big.coll.elem.lazy) Big.coll.elem.lazy[_lazyID].loading();
                },
                initialize = (function(initIndex) {
                    var width = 0,
                        height = 0;

                    $container.append($columns);
                    $wrapper.append($container);

                    $columns.each(function(i, ele) {
                        var eleSize = Big.getSize(ele);
                            width += eleSize.width,
                            height += eleSize.height;
                    });

                    switch (_mode) {
                        case 'x' :
                        default :
                            $container.css({
                                width : width
                            });
                            $columns.css({
                                float : 'left'
                            });
                            break;

                        case 'y' :
                            $container.css({
                                height : height
                            });
                            break;
                    };

                    if (_params.autoplay) {
                        toggleTo(Big.isType('number', initIndex) && initIndex < $columns.length ? initIndex : 0, true, 'init');
                    };

                    _lazyID = new LazyLoad($columns, {
                        merge : true
                    })._lazyID;

                    var bindEvent = (function() {
                        if (_event == 'mouseover' && _params.delay > 0) {
                            $controls.hover(function(evt) {
                                var index = Big.indexOf($controls, evt.currentTarget);

                                if (_active !== index && _tempActive !== index) {
                                    _tempActive = index;
                                    
                                    _autoTimer = setTimeout(function() {
                                        toggleTo(index, true, 'event');
                                    }, _params.delay);
                                };
                            }, function() {
                                clearTimeout(_autoTimer);
                            });
                        } else {
                            $controls.on(_event, function(evt) {
                                var index = Big.indexOf($controls, evt.currentTarget);

                                if (_active !== index && _tempActive !== index) {
                                    _tempActive = index;
                                    toggleTo(index, true, 'event');
                                };
                            });
                        };

                        if (Big.isType('function', _self.onReady)) {
                            _self.onReady(_self);
                        };
                    })();
                })(_options.active);
        };

        /* ==================================================
         * @constructor(*) 单页循环展示[View]
         * - wrapper(selector *) 滚动展示的UL的包围盒子
         * + options(json) 参数
         *   - (speed:millisecond [500]) 滚动速度
         *   - (autoplay:boolean [true]) 是否滚动自动
         *   - (easing:string ['easeInOutQuart']) 缓动效果
         *   - (effect:string ['fade']) 动画效果(fade/coverIn/coverOut/push/queue)
         *   - (mode:string ['x']) 动画模式，'x'为横向动画，'y'为纵向动画
         *   + (navigation:json [true]) 是否在页面中生成导航控件，如果为false则不生成，如果为json格式则生成
         *     - (icon:boolean [false]) 导航控件中是否包含图标元素
         *     - (under:boolean [false]) 导航控件中是否包含背景元素
         *   - (pagination:boolean [true]) 是否显示分页
         *   - (active:number [0]) 默认显示的索引
         *   - (onReady:function) 装载完成后执行的回调
         *   - (onChangeStart:function [current, next]) 运动开始之前执行的回调，传回两个参数（当前列表的索引,下一个列表的索引）
         *   - (onChangeEnd:function [current, prev]) 运动完成之后执行的回调，传回两个参数（当前列表的索引,上一个列表的索引）
         * ================================================== */
        EasySlider = Big.ui.EasySlider = function(wrapper, options) {
            if (!wrapper) return false;

            var _self = this,
                _options = Big.isType('json', options) ? options : {},
            
                $wrapper = this._wrapper = $(wrapper).addClass('-easy-slider'),
                $container = this._container = $('<div class="-easy-slider-container"></div>'),
                $ul = this._ul = $wrapper.children('ul:first'),
                $lis = this._lis = $ul.children('li'),

                _prop = this._prop = {
                    length : $lis.length,
                    maxIndex : $lis.length - 1,
                    navigation : Big.isType('json', _options.navigation) || Big.isType('boolean', _options.navigation) ? _options.navigation : false,
                    pagination : Big.isType('boolean', _options.pagination) ? _options.pagination : true
                },
                _params = this._params = {
                    autoplay : Big.isType('number', _options.autoplay) ? _options.autoplay : (Big.isType('boolean', _options.autoplay) && !_options.autoplay ? false : 4000)
                },
                _active = this._active = Big.isType('number', _options.active) && _options.active < _prop.length ? _options.active : 0,

                $pagers = null,
                $prevBtn = null,
                $nextBtn = null,
                $loopLis = null,

                _events = {},
                _autoTimer = undefined,
                _lazyID;

            if ($ul.length === 0 || _prop.length === 0) return false;
            
            this.onReady = _options.onReady,
            this.onChangeStart = _options.onChangeStart,
            this.onChangeEnd = _options.onChangeEnd;

            $container.append($ul);
            $wrapper.append($container);

            var stopPlay = this.stopPlay = function() {
                    clearTimeout(_autoTimer);
                },
                startPlay = this.startPlay = function() {
                    if (!_params.autoplay) return false;

                    stopPlay();
                    _autoTimer = setTimeout(function() {
                        if (Big.inViewport($wrapper)) {
                            slideNext('auto');
                        };
                        startPlay();
                    }, _params.autoplay);
                },
                slidePrev = this.slidePrev = function(source) {
                    _self.slideTo(getIndex('prev'), true, source || 'prev');
                },
                slideNext = this.slideNext = function(source) {
                    _self.slideTo(getIndex('next'), true, source || 'next');
                },
                bindEvent = function(type) {
                    if (_prop.hasPagination) {
                        $pagers.each(function(index, page) {
                            $(page)[type]('click', _events.list[index]);
                        });
                    };

                    if (_prop.navigation) {
                        $prevBtn[type]('click', _events.prev);
                        $nextBtn[type]('click', _events.next);
                    };
                },
                getIndex = function(type) {
                    var index;

                    if (type === 'prev') {
                        if (_active === 0) {
                            index = _prop.maxIndex;
                        } else {
                            index = _active - 1;
                        };
                    } else if (type === 'next') {
                        if (_active === _prop.maxIndex) {
                            index = 0;
                        } else {
                            index = _active + 1;
                        };
                    };

                    return index;
                },
                slideStart = function(index, hasCallback, source) {
                    if (Big.isType('function', _self.onChangeStart) && hasCallback === true) {
                        _self.onChangeStart(index.current, index.next, source);
                    };

                    if (_self.control && _self.control instanceof EasySlider && !Big.inObject(source, 'control')) {
                        _self.control.slideTo(index.original || index.next, false, 'control ' + source);
                    };

                    stopPlay();
                    bindEvent('off');

                    if (_prop.hasPagination) {
                        $pagers.eq(index.current).removeClass('active');
                        $pagers.eq(index.next).addClass('active');
                    };
                },
                slideEnd = function(index, hasCallback, source) {
                    var current = index.current,
                        prev = index.prev,
                        $currentLi = $lis.eq(current),
                        $prevLi = $lis.eq(prev);

                    if (_prop.effect.opt.loop) {
                        current += _prop.effect.opt.loop,
                        prev += _prop.effect.opt.loop,
                        $currentLi = $loopLis.eq(current),
                        $prevLi = $loopLis.eq(prev);
                    };

                    $prevLi.removeClass('active');
                    $currentLi.addClass('active');

                    startPlay();
                    bindEvent('on');

                    if (_lazyID in Big.coll.elem.lazy) Big.coll.elem.lazy[_lazyID].loading();
                    if (Big.isType('function', _self.onChangeEnd) && hasCallback === true) {
                        _self.onChangeEnd(index.current, index.prev, source);
                    };

                    _active = _self._active = index.current;
                },
                initialize = (function(opt, active) {
                    _prop.columnSize = Big.getSize($lis[active]);
                    _prop.wrapSize = Big.getSize($container);

                    var effectsLib = {
                            fade : function(opt) {
                                return {
                                    slideTo : function(index, hasCallback, source) {
                                        if (_active !== index) {
                                            var $activeLi = $lis.eq(_active),
                                                $nextLi = $lis.eq(index);

                                            slideStart({
                                                current : _active,
                                                next : index
                                            }, hasCallback, source);

                                            $activeLi.animate({
                                                opacity : 0,
                                                zIndex : 0
                                            }, opt.speed, opt.easing);

                                            $nextLi.show().animate({
                                                opacity : 1,
                                                zIndex : 1
                                            }, opt.speed, opt.easing, function() {
                                                $activeLi.hide();

                                                slideEnd({
                                                    current : index,
                                                    prev : _active
                                                }, hasCallback, source);
                                            });
                                        } else if (source === 'init') {
                                            var $firstLi = $lis.eq(_active);

                                            slideStart({
                                                current : _active,
                                                next : index
                                            }, hasCallback, source);

                                            $firstLi.css({
                                                opacity : 1,
                                                zIndex : 1,
                                                display : 'block'
                                            });

                                            slideEnd({
                                                current : index,
                                                prev : _active
                                            }, hasCallback, source);
                                        };
                                    }
                                }
                            },
                            coverIn : function(opt) {
                                var getStyle = function(index, source) {
                                        var offset;
                                        if (index > _active || source === 'next') {
                                            if (index == _prop.maxIndex && _active == 0) {
                                                offset = '-100%';
                                            } else {
                                                offset = '100%';
                                            };
                                        } else if (index < _active || source === 'prev'){
                                            offset = '-100%';
                                        };

                                        return {
                                            x : {
                                                css : {
                                                    left : offset,
                                                    zIndex : 2
                                                },
                                                ani : {
                                                    left : 0
                                                }
                                            },
                                            y : {
                                                css : {
                                                    top : offset,
                                                    zIndex : 2
                                                },
                                                ani : {
                                                    top : 0
                                                }
                                            }
                                        };
                                    };

                                (function() {
                                    $ul.css({
                                        height : Big.getSize($lis[_active]).height
                                    });

                                    $lis.hide();
                                })();

                                return {
                                    slideTo : function(index, hasCallback, source) {
                                        var style = getStyle(index, source)[opt.mode];

                                        if (_active !== index) {
                                            var $activeLi = $lis.eq(_active),
                                                $nextLi = $lis.eq(index);

                                            slideStart({
                                                current : _active,
                                                next : index
                                            }, hasCallback, source);

                                            $activeLi.css({
                                                zIndex : 1
                                            });

                                            $nextLi.show().css(style.css).animate(style.ani, opt.speed, opt.easing, function() {
                                                $activeLi.css({
                                                    zIndex : 0
                                                }).hide();

                                                slideEnd({
                                                    current : index,
                                                    prev : _active
                                                }, hasCallback, source);
                                            });
                                        } else if (index === _active && source === 'init') {
                                            var $firstLi = $lis.eq(_active);

                                            slideStart({
                                                current : _active,
                                                next : index
                                            }, hasCallback, source);

                                            $firstLi.show().css(style.ani);

                                            slideEnd({
                                                current : index,
                                                prev : _active
                                            }, hasCallback, source);
                                        };
                                    }
                                }
                            },
                            coverOut : function(opt) {
                                var getStyle = function(index, source) {
                                        var offset;

                                        if (index > _active || source == 'next') {
                                            if (index == _prop.maxIndex && _active == 0) {
                                                offset = '-100%';
                                            } else {
                                                offset = '100%';
                                            };
                                        } else if (index < _active || source == 'prev'){
                                            offset = '-100%';
                                        };

                                        return {
                                            x : {
                                                css : {
                                                    zIndex : 1,
                                                    left : 0
                                                },
                                                ani : {
                                                    left : offset
                                                }
                                            },
                                            y : {
                                                css : {
                                                    zIndex : 1,
                                                    top : 0
                                                },
                                                ani : {
                                                    top : offset
                                                }
                                            }
                                        };
                                    };

                                (function() {
                                    $ul.css({
                                        height : Big.getSize($lis[_active]).height
                                    });

                                    $lis.hide();
                                })();

                                return {
                                    slideTo : function(index, hasCallback, source) {
                                        var style = getStyle(index, source)[opt.mode];

                                        if (_active !== index) {
                                            var $activeLi = $lis.eq(_active),
                                                $nextLi = $lis.eq(index);

                                            slideStart({
                                                current : _active,
                                                next : index
                                            }, hasCallback, source);

                                            $nextLi.show().css(style.css);
                                            $activeLi.animate(style.ani, opt.speed, opt.easing, function() {
                                                $nextLi.css({
                                                    zIndex : 2
                                                });

                                                $activeLi.css({
                                                    zIndex : 0
                                                }).hide();

                                                slideEnd({
                                                    current : index,
                                                    prev : _active
                                                }, hasCallback, source);
                                            });
                                        } else if (index === _active && source === 'init') {
                                            var $firstLi = $lis.eq(_active);

                                            slideStart({
                                                current : _active,
                                                next : index
                                            }, hasCallback, source);

                                            $firstLi.show().css(Big.mergeJSON({
                                                zIndex : 2
                                            }, style.ani));

                                            slideEnd({
                                                current : index,
                                                prev : _active
                                            }, hasCallback, source);
                                        };
                                    }
                                };
                            },
                            push : function(opt) {
                                var getStyle = function(index, source) {
                                        if (index > _active || source === 'next') {
                                            if (index == _prop.maxIndex && _active == 0) {
                                                var nextStart = '-100%',
                                                    nextEnd = 0,
                                                    curLeft = '100%';
                                            } else {
                                                var nextStart = '100%',
                                                    nextEnd = 0,
                                                    curLeft = '-100%';
                                            };
                                        } else if (index < _active || source === 'prev'){
                                            var nextStart = '-100%',
                                                nextEnd = 0,
                                                curLeft = '100%';
                                        } else if (index === _active && source === 'init') {
                                            var nextStart = 0,
                                                nextEnd = '100%';
                                        };

                                        return {
                                            x : {
                                                nextCSS : {
                                                    left : nextStart
                                                },
                                                nextAni : {
                                                    left : nextEnd
                                                },
                                                activeAni : {
                                                    left : curLeft
                                                }
                                            },
                                            y : {
                                                nextCSS : {
                                                    top : nextStart
                                                },
                                                nextAni : {
                                                    top : nextEnd
                                                },
                                                activeAni : {
                                                    top : curLeft
                                                }
                                            }
                                        };
                                    };

                                (function() {
                                    var $activeLi = $lis.eq(_active),
                                        size = Big.getSize($activeLi);

                                    switch (opt.mode) {
                                        case 'x' :
                                        default :
                                            $ul.css({
                                                width : size.width
                                            });
                                            break;

                                        case 'y' :
                                            $ul.css({
                                                height : size.height
                                            });
                                            break;
                                    };
                                })();

                                return {
                                    slideTo : function(index, hasCallback, source) {
                                        var style = getStyle(index, source)[opt.mode];

                                        if (index !== _active) {
                                            var $activeLi = $lis.eq(_active),
                                                $nextLi = $lis.eq(index);

                                            slideStart({
                                                current : _active,
                                                next : index
                                            }, hasCallback, source);

                                            $activeLi.animate(style.activeAni, opt.speed, opt.easing);
                                            $nextLi.css(style.nextCSS).animate(style.nextAni, opt.speed, opt.easing, function() {
                                                $nextLi.addClass('active');
                                                $activeLi.removeClass('active');

                                                slideEnd({
                                                    current : index,
                                                    prev : _active
                                                }, hasCallback, source);
                                            });
                                        } else if (index === _active && source === 'init') {
                                            var $firstLi = $lis.eq(_active);

                                            slideStart({
                                                current : _active,
                                                next : index
                                            }, hasCallback, source);

                                            $firstLi.css(Big.mergeJSON(style.nextCSS, style.nextAni)).addClass('active');

                                            slideEnd({
                                                current : index,
                                                prev : _active
                                            }, hasCallback, source);
                                        };
                                    }
                                };
                            },
                            slide : function(opt) {
                                var mathItem = {
                                        width : ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth', 'marginLeft', 'marginRight', 'width'],
                                        height : ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth', 'marginTop', 'marginBottom', 'height']
                                    },
                                    Swiper,
                                    swipeTimer,
                                    style = Big.getCSS3Name(['transition', 'transform']),
                                    supportCSS3 = style.transition[0] && style.transform[0];

                                var getStyle = function(index, status) {
                                        index += opt.loop;

                                        var left = 0,
                                            top = 0,
                                            size = Big.getSize($loopLis[index], mathItem);

                                        for (var i = 0; i < index; i++) {
                                            var tempSize = Big.getSize($loopLis[i], mathItem);

                                            left += tempSize.width;
                                            top += tempSize.height;
                                        };

                                        switch (opt.align) {
                                            case 'left' :
                                                break;

                                            case 'center' :
                                                if (size.width > _prop.wrapSize.width) {
                                                    left += (size.width - _prop.wrapSize.width) / 2;
                                                } else if (size.width < _prop.wrapSize.width) {
                                                    left -= (_prop.wrapSize.width - size.width) / 2
                                                };

                                                if (size.height > _prop.wrapSize.height) {
                                                    top += (size.height - _prop.wrapSize.height) / 2;
                                                } else if (size.height < _prop.wrapSize.height) {
                                                    top -= (_prop.wrapSize.height - size.height) / 2
                                                };
                                                break;

                                            case 'right' :
                                                break;
                                        };

                                        if (status) {
                                            left += status.x || 0;
                                            top += status.y || 0;
                                        };

                                        switch (opt.mode) {
                                            case 'x':
                                            default :
                                                return {
                                                    translate : 'translate3d('+ - left +'px , 0px, 0px)',
                                                    animate : {
                                                        marginLeft : - left
                                                    },
                                                    index : index
                                                };
                                                break;

                                            case 'y':
                                                return {
                                                    translate : 'translate3d(0px , '+ - top +'px, 0px)',
                                                    animate : {
                                                        marginTop : - top
                                                    },
                                                    index : index
                                                };
                                                break;
                                        };
                                    },
                                    animate = function(offset, easing, callback) {
                                        if (supportCSS3) {
                                            $ul[0].style[style.transition[0]] = easing.transition;
                                            $ul[0].style[style.transform[0]] = offset.translate;

                                            setTimeout(callback.transform, opt.speed);
                                        } else {
                                            if (easing.animate === 'none') {
                                                $ul.css(offset.animate);
                                                callback.animate();
                                            } else {
                                                $ul.stop().animate(offset.animate, opt.speed, easing.animate, callback.animate);
                                            };
                                        };
                                    },
                                    getLoopIndex = function(index, source) {
                                        var original = index,
                                            loopIndex = index,
                                            reset = false;

                                        if (opt.loop) {
                                            switch (source) {
                                                case 'left' :
                                                case 'down' :
                                                case 'prev' :
                                                case 'control left' :
                                                case 'control down' :
                                                case 'control prev' :
                                                    if (index === _prop.maxIndex) {
                                                        index = _prop.maxIndex;
                                                        loopIndex = -1;
                                                        reset = true;
                                                    };
                                                    break;

                                                case 'auto' :
                                                case 'right' :
                                                case 'up' :
                                                case 'next' :
                                                case 'control auto' :
                                                case 'control right' :
                                                case 'control up' :
                                                case 'control next' :
                                                    if (index === 0) {
                                                        loopIndex = _prop.length;
                                                        index = 0;
                                                        reset = true;
                                                    };
                                                    break;
                                            };
                                        };

                                        return {
                                            index : index,
                                            loopIndex : loopIndex,
                                            original : original,
                                            reset : reset
                                        };
                                    },                        
                                    getLoopLi = function() {
                                        var prevChild = [],
                                            prevWidth = 0,
                                            prevHeight = 0,
                                            prevLength = 0,

                                            nextChild = [],
                                            nextWidth = 0,
                                            nextHeight = 0,
                                            nextLength = 0;

                                        if (opt.loop) {
                                            for (var i = 0, loopLength = opt.loop; i < loopLength; i++) {
                                                prevChild.push($lis.eq(_prop.maxIndex - i).clone(true).attr({
                                                    'loop-index' : _prop.maxIndex - i,
                                                    'loop-clone' : true
                                                }));
                                                nextChild.push($lis.eq(i).clone(true).attr({
                                                    'loop-index' : i,
                                                    'loop-clone' : true
                                                }));
                                            };
                                        };

                                        Big.each(prevChild, function(index, $child) {
                                            prevLength ++;
                                            $ul.prepend($child);

                                            var size = Big.getSize($child, mathItem);

                                            prevWidth += size.width;
                                            prevHeight += size.height;
                                        });

                                        Big.each(nextChild, function(index, $child) {
                                            nextLength ++;
                                            $ul.append($child);

                                            var size = Big.getSize($child, mathItem);

                                            nextWidth += size.width;
                                            nextHeight += size.height;
                                        });

                                        $lis.each(function(index, li) {
                                            $(li).attr({
                                                'loop-index' : index,
                                                'loop-clone' : false
                                            });
                                        });

                                        return $ul.children('li');
                                    },
                                    mathSize = function() {
                                        var ulWidth = 0,
                                            ulHeight = 0;

                                        if (Big.isType('number', opt.column) && opt.column >= 1) {
                                            var width = _prop.wrapSize.width / opt.column,
                                                height = _prop.wrapSize.height / opt.column;

                                            Big.each($loopLis, function(index, li) {
                                                var liSize,
                                                    marSize = Big.getSize(li, Big.mergeJSON(mathItem, {
                                                        preset : {
                                                            width : 0,
                                                            height : 0
                                                        }
                                                    }));

                                                switch (opt.mode) {
                                                    case 'x' :
                                                    default :
                                                        $(li).css({
                                                            width : width - marSize.width
                                                        });
                                                        break;

                                                    case 'y' :
                                                        $(li).css({
                                                            height : height - marSize.height
                                                        });
                                                        break;
                                                };

                                                liSize = Big.getSize(li, mathItem);
                                                ulWidth += liSize.width;
                                                ulHeight += liSize.height;
                                            });
                                        } else {
                                            Big.each($loopLis, function(index, li) {
                                                var liSize = Big.getSize(li, mathItem);

                                                ulWidth += liSize.width;
                                                ulHeight += liSize.height;
                                            });
                                        };

                                        switch (opt.mode) {
                                            case 'x' :
                                            default :
                                                $ul.css({
                                                    width : ulWidth
                                                });
                                                break;

                                            case 'y' :
                                                $ul.css({
                                                    height : ulHeight
                                                });
                                                break;
                                        };
                                    },
                                    onResize = function() {
                                        _prop.wrapSize = Big.getSize($container);

                                        stopPlay();
                                        mathSize();
                                        _self.slideTo(_active, false, 'none');
                                    };

                                (function() {
                                    if (opt.loop) {
                                        $loopLis = _self._loopLis = getLoopLi();
                                    } else {
                                        $loopLis = _self._loopLis = $lis;
                                    };

                                    if (opt.touch && supportCSS3) {
                                        (function($ul) {
                                            var translate = null;

                                            Swiper = new DragAPI($ul, {
                                                onReady : function() {},
                                                onDragStart : function(status) {
                                                    stopPlay();
                                                    this._target[0].style[style.transition[0]] = '0ms';

                                                    translate = this._target[0].style[style.transform[0]].slice('translate3d('.length, - ')'.length).split(',');
                                                },
                                                onDragMove : function(status) {
                                                    if (!status || (status && !status.type)) {
                                                        this.bindEvent('on');
                                                        return false;
                                                    };

                                                    switch (opt.mode) {
                                                        case 'x' :
                                                        default :
                                                            var x = (status.x / _prop.wrapSize.width) * Big.getSize($lis[_active]).width * opt.ratio;
                                                                x = parseInt(translate[0]) - x;
                                                            this._target[0].style[style.transform[0]] = 'translate3d('+ x +'px , 0px, 0px)';
                                                            break;

                                                        case 'y' :
                                                            var y = status.y * opt.ratio;
                                                                y = parseInt(translate[1]) - x;
                                                            this._target[0].style[style.transform[0]] = 'translate3d(0px , '+ y +'px, 0px)';
                                                            break;
                                                    };
                                                },
                                                onDragEnd : function(status) {
                                                    if (!status || (status && !status.type)) {
                                                        this.bindEvent('on');
                                                        return false;
                                                    };

                                                    switch (opt.mode) {
                                                        case 'x':
                                                        default :
                                                            switch (status.type) {
                                                                case 'right' :
                                                                    if (status.x >= _prop.wrapSize.width * 0.2 && (_active < _prop.maxIndex || opt.loop)) {
                                                                        _self.slideTo(getIndex('next'), true, status.type);
                                                                    } else {
                                                                        _self.slideTo(_active, false, 'none');
                                                                    };
                                                                    break;

                                                                case 'left' :
                                                                    if (Math.abs(status.x) >= _prop.wrapSize.width * 0.2 && (_active !== 0 || opt.loop)) {
                                                                        _self.slideTo(getIndex('prev'), true, status.type);
                                                                    } else {
                                                                        _self.slideTo(_active, false, 'none');
                                                                    };
                                                                    break;

                                                                case 'up' :
                                                                case 'down' :
                                                                    _self.slideTo(_active, false, 'none');
                                                                    break;
                                                            };
                                                            break;

                                                        case 'y':
                                                            switch (status.type) {
                                                                case 'up' :
                                                                    if (status.y >= _prop.wrapSize.height * 0.2 && (_active < _prop.maxIndex || opt.loop)) {
                                                                        _self.slideTo(getIndex('next'), true, status.type);
                                                                    } else {
                                                                        _self.slideTo(_active, false, 'none');
                                                                    };
                                                                    break;

                                                                case 'down' :
                                                                    if (Math.abs(status.y) >= _prop.wrapSize.height * 0.2 && (_active !== 0 || opt.loop)) {
                                                                        _self.slideTo(getIndex('prev'), true, status.type);
                                                                    } else {
                                                                        _self.slideTo(_active, false, 'none');
                                                                    };
                                                                    break;

                                                                case 'right' :
                                                                case 'left' :
                                                                    _self.slideTo(_active, false, 'none');
                                                                    break;
                                                            };
                                                            break;
                                                    };
                                                },
                                                onDragCancel : function() {
                                                    _self.slideTo(_active, false, 'none');
                                                }
                                            }, {
                                                mode : opt.mode
                                            });
                                        })($ul);
                                    };

                                    mathSize();
                                    Big.evt.onResize(onResize);
                                })();

                                return {
                                    slideTo : function(index, hasCallback, source) {
                                        if (index === _active && source === 'page') return false;
                                        var index = getLoopIndex(index, source),
                                            callback = {
                                                transform : function() {
                                                    slideEnd({
                                                        current : index.index,
                                                        prev : _active,
                                                        original : index.original
                                                    }, hasCallback, source);

                                                    if (Swiper && (source === 'none' || source === 'left' || source === 'right' || source === 'up' || source === 'down')) Swiper.bindEvent('on');
                                                },
                                                animate : function() {
                                                    slideEnd({
                                                        current : index.index,
                                                        prev : _active,
                                                        original : index.original
                                                    }, hasCallback, source);
                                                }
                                            },
                                            easing = {
                                                transition : style.transform[1] + ' ' + opt.speed + 'ms',
                                                animate : opt.easing
                                            };

                                        slideStart({
                                            current : _active,
                                            next : index.index,
                                            original : index.original
                                        }, true, source);

                                        if (index.reset === true) {
                                            callback = {
                                                transform : function() {
                                                    $ul[0].style[style.transition[0]] = '0ms';
                                                    $ul[0].style[style.transform[0]] = getStyle(index.index).translate;

                                                    slideEnd({
                                                        current : index.index,
                                                        prev : _active,
                                                        original : index.original
                                                    }, hasCallback, source);

                                                    if (Swiper && (source === 'none' || source === 'left' || source === 'right' || source === 'up' || source === 'down')) Swiper.bindEvent('on');
                                                },
                                                animate : function() {
                                                    $ul.css(getStyle(index.index).animate);

                                                    slideEnd({
                                                        current : index.index,
                                                        prev : _active,
                                                        original : index.original
                                                    }, hasCallback, source);
                                                }
                                            };
                                        };

                                        if (source === 'init') {
                                            easing.transition = 'none',
                                            easing.animate = 'none';
                                        };

                                        animate(getStyle(index.loopIndex), easing, callback);
                                    }
                                };
                            }
                        },
                        fx,
                        effect,
                        effectName,
                        param = Big.isType('json', opt.effect) && Big.isType('json', opt.effect.options) ? opt.effect.options : {
                            ratio : 0.5,
                            align : 'left',
                            column : 'auto',
                            touch : false,
                            loop : undefined,
                            mode : Big.isType('string', opt.mode) && (opt.mode.toLowerCase() == 'x' || opt.mode.toLowerCase() == 'y') ? opt.mode.toLowerCase() : 'x',
                            speed : Big.isType('number', opt.speed) ? opt.speed : 500,
                            easing : Big.isType('string', opt.easing) ? Big.getEasing(opt.easing) : Big.getEasing('easeInOutQuart')
                        };

                    if (Big.isType('string', opt.effect)) {
                        switch (opt.effect) {
                            case 'slide' :
                            case 'push' :
                            case 'coverIn' :
                            case 'coverOut' :
                            case 'fade' :
                                effectName = opt.effect;
                                break;

                            default :
                                effectName = 'fade';
                                break;
                        };
                    } else if (Big.isType('json', opt.effect)) {
                        switch (opt.effect.name) {
                            case 'slide' :
                            case 'push' :
                            case 'coverIn' :
                            case 'coverOut' :
                            case 'fade' :
                                effectName = opt.effect.name;
                                break;

                            default :
                                effectName = 'fade';
                                break;
                        };                    
                    } else if (!opt.effect) {
                        effectName = 'fade';
                    };

                    switch (effectName) {
                        case 'slide' :
                            effect = _prop.effect = {
                                name : effectName,
                                type : 'slide',
                                pages : 'multi',
                                opt : param
                            };
                            break;

                        case 'push' :
                        case 'coverIn' :
                        case 'coverOut' :
                            effect = _prop.effect = {
                                name : effectName,
                                type : 'slide',
                                pages : 'single',
                                opt : param
                            };
                            break;

                        case 'fade' :
                        default :
                            effect = _prop.effect = {
                                name : effectName,
                                type : 'fixed',
                                pages : 'single',
                                opt : param
                            };
                            break;
                    };

                    Big.mergeJSON({
                        mode : Big.isType('string', param.mode) && (param.mode.toLowerCase() === 'x' || param.mode.toLowerCase() === 'y') ? param.mode.toLowerCase() : (Big.isType('string', opt.mode) && (opt.mode.toLowerCase() === 'x' || opt.mode.toLowerCase() === 'y') ? opt.mode.toLowerCase() : 'x'),
                        speed : Big.isType('number', param.speed) ? param.speed : (Big.isType('number', opt.speed) ? opt.speed : 500),
                        easing : Big.isType('string', param.easing) ? Big.getEasing(param.easing) : (Big.isType('string', opt.easing) ? Big.getEasing(opt.easing) : Big.getEasing('easeInOutQuart'))
                    }, effect.opt);

                    if (effect.type === 'slide' && effect.pages === 'multi') {
                        Big.mergeJSON({
                            ratio : Big.isType('number', param.ratio) && param.ratio >= 0.1 && param.ratio <= 1 ? param.ratio : 1,
                            align : opt.align === 'left' || param.align === 'center' ? param.align : 'left',
                            column : opt.column === 'auto' || (Big.isType('number', param.column) && param.column > 0 && param.column <= _prop.length) ? param.column : 'auto',
                            touch : Big.isType('boolean', param.touch) ? param.touch : false
                        }, effect.opt);

                        if (Big.isType('number', param.loop)) {
                            if (param.loop === 0) {
                                effect.opt.loop = 0;
                            }else if (param.loop < 1) {
                                effect.opt.loop = 1;
                            } else if (param.loop > _prop.length) {
                                effect.opt.loop = _prop.length;
                            } else {
                                effect.opt.loop = param.loop;
                            };
                        } else if (Big.isType('boolean', param.loop)) {
                            if (param.loop === true) {
                                effect.opt.loop = _prop.length;
                            } else {
                                effect.opt.loop = 0;
                            };
                        } else {
                            if (effect.opt.mode === 'x') {
                                effect.opt.loop = _prop.columnSize.width > _prop.wrapSize.width * 0.8 ? 1 : _prop.length;
                            } else if (effect.opt.mode === 'y') {
                                effect.opt.loop = _prop.columnSize.height > _prop.wrapSize.height * 0.8 ? 1 : _prop.length;
                            };
                        };
                    };

                    switch (effect.name) {
                        case 'coverIn' :
                        case 'coverOut' :
                        case 'push' :
                            fx = effectsLib[effect.name](effect.opt);
                            $ul.addClass('-easy-slider-effect-'+ effect.name +'-'+ effect.opt.mode);
                            break;

                        case 'slide' :
                            fx = effectsLib.slide(effect.opt);
                            $ul.addClass('-easy-slider-effect-'+ effect.name +'-'+ effect.opt.mode +' clearfix');
                            break;

                        case 'fade' :
                        default :
                            fx = effectsLib.fade(effect.opt);
                            $ul.addClass('-easy-slider-effect-fade');
                            break;
                    };

                    Big.each(fx, function(key, fn) {
                        _self[key] = fn;
                    });

                    _lazyID = new LazyLoad($ul, {
                        merge : true,
                        wrapper : $container
                    })._lazyID;

                    var createPage = (function(hasPagination) {
                        if (!hasPagination) return false;
                            var $pagination = $('<div class="-easy-slider-pagination"></div>');

                            _prop.hasPagination = true;
                            _events.list = [];

                            Big.each(_prop.length, function(index) {
                                $pagination.append('<a class="rel-'+ (index + 1) +'">'+ (index + 1) +'</a>');
                                _events.list.push(function() {
                                    _self.slideTo(index, true, 'page');
                                });
                            });

                            $pagers = _self._pagers = $pagination.find('a');
                            $wrapper.append($pagination);
                        })(_prop.pagination),
                        cerateCtrl = (function(hasNavigation) {
                            if (!hasNavigation) return false;

                            _events.prev = function() {
                                slidePrev();
                            },
                            _events.next = function() {
                                slideNext();
                            };

                            $prevBtn = _self._prevBtn = $('<a class="-easy-slider-nav prev-btn"></a>'),
                            $nextBtn = _self._nextBtn = $('<a class="-easy-slider-nav next-btn"></a>');

                            $wrapper.append($prevBtn).append($nextBtn);

                            if (Big.isType('json', _prop.navigation) && _prop.navigation.icon) {
                                $prevBtn.append('<i></i>');
                                $nextBtn.append('<i></i>');

                                if (_prop.navigation.under) {
                                    $prevBtn.append('<b></b>');
                                    $nextBtn.append('<b></b>');
                                };
                            };
                        })(_prop.navigation),
                        bindAuto = (function() {
                            $wrapper.on('mouseover', stopPlay);
                            $wrapper.on('mouseleave', startPlay);

                            startPlay();

                            if (Big.isType('function', _self.onReady)) {
                                _self.onReady(_self);
                            };
                        })();

                        bindEvent('on');

                        _self.slideTo(_active, false, 'init');
                })(_options, _active);
        };

        /* ==================================================
         * @constructor AJAX表单[Extend]
         * + target(array/selector *) 要应用延时加载的图片元素
         * + options(json) 参数
         *   - (selector [window]) 附加样式名
         *   - (boolean [false]) 是会将其它已经被实例延时加载的图片元素添加到本实例操作中
         * ================================================== */

        LazyLoad = Big.ui.LazyLoad = function(target, options) {
            if (!target) return false;

            var _self = this,
                _options = Big.isType('json', options) ? options : {},
                $window = $(window),

                _wrapper = _options.wrapper || window,

                images,
                update;

            var destroy = this.destroy = function() {
                    var id = arguments[0] || _self._lazyID,
                        object = Big.coll.elem.lazy[id];

                    $window.off('scroll', object.loading);
                    Big.coll.elem.lazy[id] = object = object._images = object._target = object.loading = object.destroy = null;
                    
                    delete Big.coll.elem.lazy[id];
                },
                loading = this.loading = function() {
                    Big.each(images, function(index, image) {
                        var $image = $(image);
                        if (Big.inViewport(image, {
                            wrapper : _wrapper
                        })) {
                            $image.trigger('appear', true);
                        };
                    });
                },
                getLazyImg = function(target, merge) {
                    var targets = [],
                        images = [],
                        isLazyImg = function(ele) {
                            if (merge) {
                                return ele.nodeName.toLowerCase() == 'img' && (ele.getAttribute('data-lazy') && ele.getAttribute('data-lazy').length > 0);
                            } else {
                                return ele.nodeName.toLowerCase() == 'img' && ele.isLazy === undefined && (ele.getAttribute('data-lazy') && ele.getAttribute('data-lazy').length > 0);
                            };
                        };

                    if (Big.isType('array', target)) {
                        Big.each(target, function(index, elem) {
                            $(elem).each(function(i, ele) {
                                targets.push(ele);
                            });
                        });
                    } else {
                        $(target).each(function(i, ele) {
                            targets.push(ele);
                        });
                    };

                    Big.each(targets, function(index, target) {
                        if (target.childNodes.length > 0) {
                            $(target).find('img[data-lazy]').each(function(i, image) {
                                if (isLazyImg(image)) {
                                    image.isLazy = true;
                                    images.push(image);
                                };
                            });
                        } else if (isLazyImg(target)) {
                            target.isLazy = true;
                            images.push(target);
                        };
                    });

                    return images;
                },
                lazyLoading = function(image, hasEach) {
                    var tempImg = new Image(),
                        lazySrc = image.getAttribute('data-lazy');

                    tempImg.src = lazySrc;

                    if (tempImg.complete) {
                        loadSuccess(image, tempImg.src, lazySrc, hasEach);
                    } else {
                        tempImg.onload = function() {
                            loadSuccess(image, tempImg.src, lazySrc, hasEach);
                        };
                        tempImg.src = tempImg.src;
                    };
                },
                loadSuccess = function(target, imgSrc, lazySrc, hasEach) {
                    var $target = $(target);

                    $target.fadeOut(400, function() {
                        target.src = imgSrc;

                        $target.fadeIn(400, function() {
                            if (hasEach === true) {
                                Big.each(Big.coll.elem.lazy, function(id, object) {
                                    Big.each(object._images, function(index, image) {
                                        if (!image) return false;
                                        var lazyeAttr = image.getAttribute('data-lazy');

                                        if (image === target || lazyeAttr === lazySrc) {
                                            object._images.splice(Big.indexOf(object._images, image), 1);

                                            if (object._images.length === 0) _self.destroy(id);
                                            if (lazyeAttr === lazySrc) $(image).trigger('appear', false);
                                        };
                                        image = null;
                                    });
                                });
                            };
                            
                            $target.removeClass('-lazy-load').attr('data-lazy', 'success');
                            $target = target = null;
                        });
                    });
                },
                initialize = (function(target, merge) {
                    images = _self._images = getLazyImg(target, merge);

                    if (images.length === 0) {
                        return undefined;
                    } else {
                        var lazyID = _self._lazyID = Big.getRandom();
                        Big.coll.elem.lazy[lazyID] = _self;

                        (function(images) {
                            $(images).one('appear', function(evt, data) {
                                lazyLoading(evt.target, data);
                            }).addClass('-lazy-load').attr({
                                src : Big.root + 'style/spacer.gif'
                            });

                            $window.on('scroll', loading);

                            loading();
                        })(images);
                    };
                })(target, Big.isType('boolean', _options.merge) ? _options.merge : false);
        };
        
        /* ==================================================
         * @constructor AJAX表单[Extend]
         * + element(array *) 元素参数
         *   + (json) 元素参数
         *     - (tag:[string:'input'/'select'/'textarea']) 元素标签类型
         *     - (title:string) 项目名称
         *     - (notice:string) 验证不通过时的提示语,require为false时无意义
         *     - (require:boolean/regex *) 是否为必须项,为true时验证是否为空,为regex时根据正则表达式进行验证
         *     + (prop:json) 元素参数,下标应该为JS中的属性名称如:maxLength
         *       - (options:array) 在类似于 select/checkbox/radio时,需要这项为其赋值
         *       - (value:string) 默认值
         *       - (name:string) 名称
         *       - (type:string) 类型
         *       - ......更多
         * + handler(json *) 事件参数
         *   - event(function) 点击提交后返回新的request.data
         *   + xhr(json) 参数
         *     - (url:string) 提交动作的URL地址
         *     - (method:'POST'/'GET') 提交动作的方法
         *     - (data:json) 跟随url的参数
         *     - (dataType:json) 返回的数据类型，如果值为false,则使用传统的submit方式提交
         * + options(json) 参数
         *   - (style:string) 附加样式名
         *   - (submit:json) 提交按钮的属性
         *   - (reset:json) 重置提交按钮的属性，如果无此项则无重置按钮
          *   - onReady(function) 表单装载完成后的后续操作
         * ================================================== */
        AjaxForm = Big.ext.AjaxForm = function(element, handler, options) {
            if ((!Big.isType('array', element) && element.length === 0) || !Big.isType('json', handler)) return false;

            var _self = this,
                _options = Big.isType('json', options) ? options : {},
                // submit = Big.isType('json', _options.submit) ? _options.submit : null,
                // reset = Big.isType('json', _options.reset) ? _options.reset : null,
                
                $form = this._form = $('<form class="-ajax-form"></form>'),
                $content = this._content = $('<div class="-ajax-form-content"></div>'),

                _box = this._box = {},
                _elem = this._elem = {},

                $submitBox = _box['_action'] = $('<div class="-ajax-form-action"></div>'),
                $submitBtn = _elem['_submit'] = $('<input type="button" class="-ajax-form-sumit-btn">');
            
            this.onReady = _options.onReady;

            $submitBox.append($submitBtn);

            var getElement = function (ele) {
                    var prop = Big.isType('json', ele.prop) ? ele.prop : {},
                        $dl = $('<dl></dl>').addClass('-ajax-form-dl-'+ prop.name),
                        $dt = $('<dt></dt>'),
                        $dd = $('<dd></dd>'),
                        $ele,
                        $label,
                        $arrow;
                        
                    switch (ele.tag) {
                        case 'select' :
                            $ele = $(Big.getSelecet(prop.options, {
                                empty : prop.value,
                                prop : {
                                    selected : prop.selected
                                }
                            })),
                            $arrow = $('<i></i>');
                            break;

                        case 'input' :
                        default :
                            switch (prop.type) {
                                case 'number':
                                case 'email':
                                case 'url':
                                case 'date':
                                case 'password':
                                    $ele = $('<input type="'+ prop.type +'">');
                                    if (Big.isType('string', prop.value)) Big.ui.setPlaceholder($ele, prop.value);
                                    break;

                                case 'hidden':
                                    $ele = $('<input type="'+ prop.type +'">');
                                    if (Big.isType('string', prop.value) || Big.isType('number', prop.value)) $ele.val(prop.value);
                                    $dl.css({display : 'none'});
                                    break;

                                case 'checkbox' :
                                case 'radio' :
                                    $ele = [];
                                    Big.each(prop.value, function(index, value) {
                                        var $input = $('<input value="'+ value +'" type="'+ prop.type +'">');
                                        $ele.push([$input, value]);
                                    });
                                    break;

                                case 'button':
                                    $ele = $('<input type="'+ prop.type +'">');
                                    if (Big.isType('string', prop.value)) $ele.val(prop.value);
                                    break;

                                case 'file':
                                    $ele = $('<input type="'+ prop.type +'">');
                                    break;

                                case 'text':
                                default :
                                    $ele = $('<input type="text">');
                                    if (Big.isType('string', prop.value)) Big.ui.setPlaceholder($ele, prop.value);
                                    break;
                            };

                            break;

                        case 'textarea' :
                            $ele = $('<textarea></textarea>');

                            if (Big.isType('string', prop.value)) {
                                Big.ui.setPlaceholder($ele, prop.value);
                            };
                            break;
                    };

                    if (Big.isType('array', $ele)) {
                        Big.each($ele, function(index, $ele) {
                            var inputVal,
                                labelText;

                            Big.each(prop, function(key, value) {
                                if (!(key === 'value')) {
                                    $ele[0][0][key] = value;
                                } else if (key === 'value') {
                                    var option = value[index];
                                    if (Big.isType('array', option)) {
                                        inputVal = option[1];
                                        labelText = option[0];
                                    } else {
                                        inputVal = option;
                                        labelText = option;
                                    };
                                };
                            });

                            if (prop.type === 'radio' || prop.type === 'checkbox') {
                                $ele[0][0].checked = false;
                                setChecked($ele[0][0], prop.checked, index, inputVal);
                            };

                            $label = $('<label></label>');
                            $ele[0].val(inputVal);
                            $label.append($ele[0]).append(labelText);
                            $dd.append($label);
                        });

                        var $tempEle = _elem[prop.name] = $(null);
                        for (var i = 0; i < $ele.length; i++) {
                            $tempEle.push($ele[i][0][0]);
                        };
                    } else {
                        Big.each(prop, function(key, value) {
                            if (!(key === 'value' || key === 'options')) {
                                $ele[0][key] = value;
                            };
                        });
                        $dd.append($ele);

                        if ($arrow) $dd.append($arrow);

                        _elem[prop.name] = $ele;
                    };

                    if (Big.isType('string', ele.title) && ele.title != '') {
                        if (ele.require) {
                            var $dot = $('<b>*</b>');
                                $dt.append($dot);
                        };
                        
                        $dt.append(ele.title + '：');
                        $dl.append($dt);
                    };
                    $dl.append($dd);

                    return $dl;
                },
                setChecked = function(elem, preset, index, value) {
                    if (Big.isType('number', preset) && preset === index) {
                        elem.checked = true;
                    } else if (Big.isType('string', preset) && preset == value) {
                        elem.checked = true;
                    } else if (Big.isType('array', preset)) {
                        Big.each(preset, function(i, array) {
                            setChecked(elem, array, index, value)
                        });
                    };
                },
                getValue = function () {
                    var data = {};

                    for (var i = 0, length = element.length; i < length; i++) {
                        var elem = element[i],
                            tag = elem.tag,
                            require = elem.require,
                            prop = elem.prop,
                            name = prop.name,
                            type = prop.type,
                            $ele,
                            value;

                        if (tag === 'input' && type === 'checkbox') {
                            $ele = $form.find('[name="' + name + '"]');
                            value = [];

                            for (var j = 0; j < $ele.length; j++) {
                                if ($ele[j].checked) value.push($ele[j].value);
                            };

                            value = value.toString();
                        } else if (tag === 'input' && type === 'radio') {
                            $ele = $form.find('[name="' + name + '"]:checked'),
                            value = $ele.val();
                        } else {
                            $ele = $form.find('[name="' + name + '"]'),
                            value = $ele.val();
                        };

                        data[name] = verify(elem, value, $ele);

                        if (require && (data[name] == '' || !data[name])) {
                            return false;
                        } else {
                            continue;
                        };
                    };

                    getURL(data);
                },
                verify = function(elem, value, element) {
                    var notice = elem.notice,
                        require = elem.require,
                        prop = elem.prop;

                    if (require) {
                        if (require === true) {
                            if (!value || value === '' || value === prop.value) {
                                alert(notice);
                                element.focus();

                                return false;
                            };
                        } else {
                            if (Big.isType('regexp', require)) {
                                if (!require.test(value)) {
                                    alert(notice);
                                    element.focus();

                                    return false;
                                };
                            } else if (Big.isType('regexpstr', require)) {
                                if (!new RegExp(require).test(value)) {
                                    alert(notice);
                                    element.focus();

                                    return false;
                                };
                            } else {
                                alert(notice);
                                element.focus();

                                return false;
                            };
                        };
                    };

                    return value;
                },
                /* --------------------------------------------------
                 * @module 取回URL
                 * -------------------------------------------------- */
                getURL = function(data) {
                    var onSubmit = handler.event,
                        xhr = handler.xhr;

                    if (Big.isType('json', xhr)) {
                        var url = xhr.url,
                            type = Big.isType('string', xhr.type) && (xhr.type.toUpperCase() == 'GET' || xhr.type.toUpperCase() == 'POST') ? xhr.type.toUpperCase() : 'GET',
                            dataType = xhr.dataType;

                        xhr.data = Big.isType('json', xhr.data) ? xhr.data : {};

                        if (dataType === false) {
                            var query = '',
                                action = url + '?';

                            $form[0].method = type;
                            $form[0].target = '_self';

                            if (type == 'POST') {
                                Big.each(xhr.data, function(key, value) {
                                    query += (key + '=' + value + '&');
                                });
                                $form[0].action = (action += query).slice(0, -1);

                                if (Big.isType('function', onSubmit)) {
                                    onSubmit({
                                        url : url,
                                        type : type,
                                        data : xhr.data,
                                        post : data,
                                        query : query,
                                        action : action,
                                        dataType : dataType
                                    });
                                };
                            } else {
                                data = Big.mergeJSON(data, xhr.data);
                                Big.each(data, function(key, value) {
                                    query += (key + '=' + value + '&');
                                });
                                $form[0].action = (action += query).slice(0, -1);

                                if (Big.isType('function', onSubmit)) {
                                    onSubmit({
                                        url : url,
                                        type : type,
                                        data : data,
                                        query : query,
                                        dataType : dataType
                                    });
                                };
                            };

                            $form[0].submit();
                        } else {
                            onSubmit({
                                url : url,
                                type : type,
                                data : Big.mergeJSON(data, xhr.data),
                                dataType : Big.isType('string', xhr.dataType) ? xhr.dataType : 'json'
                            });
                        };
                    } else {
                        onSubmit();
                    };
                },
                initialize = (function(style, submit, reset) {
                    if (Big.isType('string', style)) {
                        $form.addClass(style);
                    };

                    Big.each(element, function(index, elem) {
                        var $dl = getElement(elem);

                        _box[elem.prop.name] = $dl;
                        $content.append($dl);
                    });

                    Big.each(submit, function(key, value) {
                        if (key == 'type' && value  != 'button') {
                            value == 'button';
                        };
                        
                        if (key == 'className') {
                            $submitBtn.addClass(value);
                        } else {
                            $submitBtn[0][key] = value;
                        };
                    });

                    if (reset) {
                        var $resetBtn = _elem['_reset'] = $('<input type="reset" class="-ajax-form-reset-btn">');

                        Big.each(reset, function(key, value) {
                            if (key == 'type' && value != 'reset') {
                                value == 'reset';
                            };

                            if (key == 'className') {
                                $resetBtn.addClass(value);
                            } else {
                                $resetBtn[0][key] = value;
                            };
                        });

                        $submitBox.append($resetBtn);
                    };

                    $content.append($submitBox);
                    $form.append($content);

                   var bindEvent = (function() {
                            $submitBtn.on('click', getValue);
                            $form.on('keydown', function(evt) {
                                if (evt.keyCode == 13) {
                                    return false;
                                };
                            });
                        })();

                    if (Big.isType('function', _self.onReady)) {
                        _self.onReady($form, _self);
                    };
                })(_options.style, Big.isType('json', _options.submit) ? _options.submit : null, Big.isType('json', _options.reset) ? _options.reset : null);
        };

        /* ==================================================
         * @constructor(*) 触摸API[Extend]
         * - target(selector *) 被绑定触摸事件的元素
         * - handler(json) 参数
         *   - (onReady:function(self)) API准备就绪后的回调
         *   - (oonDragStart:function(status) 拖拽事件开始时执行的回调，status代表回传的参数
         *   - (oonDragMove:function(status) 拖拽移动时执行的回调，status代表回传的参数
         *   - (oonDragEnd:function(status) 拖拽结束时执行的回调，status代表回传的参数
         *   - (oonDragCancel : function(status) 拖拽取消时执行的回调，status代表回传的参数
         * + options(json) 参数
         *   - (mode:string ('x'/'y' ['x'])) 预定的滑动方向
         * ================================================== */
        DragAPI = Big.ext.DragAPI = function(target, handler, options) {
            var _self = this,
                _options = Big.isType('json', options) ? options : {},
                _prop = this._prop = {
                    mode : Big.isType('string', _options.mode) && (_options.mode.toLowerCase() === 'x' || _options.mode.toLowerCase() === 'y') ? _options.mode.toLowerCase() : 'x'
                },
                $target = this._target = $(target).addClass('-touch'),

                _tap,
                _events,
                _offset,
                status,
                _isScroll,
                _hasMove = false;

            this.onReady = handler.onReady,
            this.onDragStart = handler.onDragStart,
            this.onDragMove = handler.onDragMove,
            this.onDragEnd = handler.onDragEnd,
            this.onDragCancel = handler.onDragCancel;

        var bindEvent = this.bindEvent = function(type) {
                if (type === 'on') {
                    _hasMove = false;

                    $target.on(_tap.start, _events.start);
                } else if (type === 'off') {
                    $target.off(_tap.start, _events.start);
                    $target.off(_tap.move, _events.move);
                    $target.off(_tap.end, _events.end);
                    $target.off(_tap.cancel, _events.cancel);

                    if (_hasMove === false) bindEvent('on');
                };
            },
            getOffset = function(x, y) {
                // 定方触摸类型
                var type,
                    X = Math.abs(x),
                    Y = Math.abs(y),
                    horiz,
                    vertical;

                // X轴模式
                if (x < 0) {
                    horiz = status.x = 'left';
                } else if (x > 0) {
                    horiz = status.x = 'right';
                } else {
                    horiz = undefined;
                };

                // Y轴模式
                if (y < 0) {
                    vertical = status.y = 'down';
                } else if (y > 0) {
                    vertical = status.y = 'up';
                } else {
                    vertical = undefined;
                };

                // 定义各触摸模式
                if (!horiz && !vertical) {
                    type = undefined;
                } else if (horiz && !vertical) {
                    type = horiz;
                } else if (!horiz && vertical) {
                    type = vertical;
                } else if (horiz && vertical) {
                    if (horiz == 'left') {
                        if (X > Y) {
                            type = 'left';
                        } else {
                            if (y > 0) {
                                type = 'up';
                            } else {
                                type = 'down';
                            };
                        };
                    } else {
                        if (X > Y) {
                            type = 'right';
                        } else {
                            if (y > 0) {
                                type = 'up';
                            } else {
                                type = 'down';
                            };
                        };
                    };
                };

                // 返回最终的触摸模式
                return {
                    type : type,
                    x : x,
                    y : y
                };
            },
            dragStart = function(e, target) {
                _isScroll = _offset = undefined;

                if (e.type !== 'touchstart') e.preventDefault();
                
                bindEvent('off');

                $target.on(_tap.move, _events.move);
                $target.on(_tap.end, _events.end);
                $target.on(_tap.cancel, _events.cancel);

                status.sx = Big.info.os.mobile ? e.originalEvent.targetTouches[0].pageX : e.pageX;
                status.sy = Big.info.os.mobile ? e.originalEvent.targetTouches[0].pageY : e.pageY;

                _self.onDragStart({
                    type : undefined,
                    x : status.sx,
                    y : status.sy
                });
            },
            dragMove = function(e, target) {
                _hasMove = true;

                var moveX = Big.info.os.mobile ? e.originalEvent.targetTouches[0].pageX : e.pageX,
                    moveY = Big.info.os.mobile ? e.originalEvent.targetTouches[0].pageY : e.pageY;

                _offset = getOffset(status.sx - moveX, status.sy - moveY);

                if (_isScroll === undefined) {
                    switch (_prop.mode) {
                        case 'x' :
                        default :
                            if (_offset.type === 'up' || _offset.type  === 'down') {
                                _isScroll = true;
                            } else if (_offset.type === 'left' || _offset.type === 'right') {
                                _isScroll = false;
                            };
                            break;

                        case 'y' :
                            if (_offset.type === 'left' || _offset.type === 'right') {
                                _isScroll = true;
                            } else if (_offset.type === 'up' || _offset.type  === 'down') {
                                _isScroll = false;
                            };
                            break;
                    };
                };

                if (_isScroll === false) {
                    e.preventDefault();
                    _self.onDragMove(_offset);
                };
            },
            dragEnd = function(e, target) {
                if (_isScroll === false) {
                    bindEvent('off');
                    _self.onDragEnd(_offset);
                };
            },
            dragCancel = function(e, target) {
                e.preventDefault();
                e.stopPropagation();

                if (_isScroll === false) {
                    bindEvent('off');
                    _self.onDragCancel(_offset);
                };
            },
            initialize = (function() {
                _tap = (function() {
                    if ('ontouchstart' in window && Big.info.os.mobile) {
                        return {
                            start : 'touchstart',
                            move : 'touchmove',
                            end : 'touchend',
                            cancel : 'touchcancel'
                        };
                    } else if ('onmousedown' in document.body) {
                        return {
                            start : 'mousedown',
                            move : 'mousemove',
                            end : 'mouseup',
                            cancel : 'mouseleave'
                        };
                    } else if (window.navigator.pointerEnabled) {
                        return {
                            start : 'pointerdown',
                            move : 'pointermove',
                            end : 'pointerup',
                            cancel : 'pointerout'
                        };
                    } else if (window.navigator.msPointerEnabled) {
                        return {
                            start :'MSPointerDown',
                            move :'MSPointerMove',
                            end :'MSPointerUp',
                            cancel : 'MSPointerOut'
                        };
                    };
                })(),
                _events = {
                    start : function(evt) {
                        dragStart(evt, this);
                    },
                    move : function(evt) {
                        dragMove(evt, this);
                    },
                    end : function(evt) {
                        dragEnd(evt, this);
                    },
                    cancel : function(evt) {
                        dragCancel(evt, this);
                    }
                },
                status = {
                    sx : 0,
                    sy : 0,
                    mx : 0,
                    my : 0,
                    ex : 0,
                    ey : 0,
                    x : undefined,
                    y : undefined,
                    status : undefined
                };

                bindEvent('on');
                _self.onReady();
            })();
        };

        /* ==================================================
         * @constructor(*) 滚动到顶部[Com]
         * - wrapper(selector *) 插入向上按钮的包围盒子
         * + options(json) 参数
         *   - (easing:string ['easeInOutQuart']) 缓动效果
         *   - (mode:number [1]) 显示模式(0:离开顶部位置时显示&隐藏/1:滚动一屏时显示&隐藏/2:永远保持可见状态)
         *   - (speed:millisecond [500]) 滚动动画时间
         *   - (icon:boolean [true]) 是否包含图标
         *   - (under:boolean [false]) 是否包含背景
         *   - (text:string [undefined]) 插入的文字
         *   - (style:string [undefined]) 独立的样式名
         * ================================================== */
        ScrollTop = Big.com.ScrollTop = function(wrapper, options) {
            if (!wrapper) return false;

            var _self = this,
                _options = Big.isType('json', options) ? options : {},
                _params = this._params = {
                    easing : Big.isType('string', _options.easing) ? Big.getEasing(_options.easing) : Big.getEasing('easeInOutQuart'),
                    mode : Big.isType('integer', _options.mode) && _options.mode >= 0 && _options.mode <= 2 ? _options.mode : 1,
                    speed : Big.isType('number', _options.speed) ? _options.speed : 500,
                    autohide : Big.isType('number', _options.autohide) ? _options.autohide : (Big.isType('boolean', _options.autohide) && _options.autohide === true ? 4000 : false)
                },

                $wrapper = this._wrapper = $(wrapper),
                $target = this._target = $('<a class="-srcoll-top"></a>'),

                _icon = Big.isType('boolean', _options.icon) ? _options.icon : true,
                _under = Big.isType('boolean', _options.under) ? _options.under : false,
                _text = Big.isType('string', _options.text) ? _options.text : undefined,
                _style = Big.isType('string', _options.style) ? _options.style : undefined,
                _insert = Big.isType('string', _options.insert) ? _options.insert : 'append',

                _timer,
                _hideTimer;

            this.onReady = _options.onReady;

            var onScroll = function() {
                    clearTimeout(_timer);

                    _timer = setTimeout(function() {
                        if (Big.size.top > (_params.mode ? Big.size.height : 0)) {
                            $target.fadeIn(200).css({display : 'block'});

                            autoHide();
                        } else {
                            $target.fadeOut(200);
                        };
                    }, 100);
                },
                autoHide = function() {
                    if (!_params.autohide && $target.is(':visible')) return false;
                    clearTimeout(_hideTimer);

                    _hideTimer = setTimeout(function() {
                        $target.stop().fadeOut(200);
                    }, _params.autohide);
                },
                initialize = (function() {
                    if (_icon) {
                        $target.append('<i></i>');
                    };
                    if (_under) {
                        $target.append('<b></b>');
                    };

                    if (_text) {
                        if (_icon || _under) {
                            $target.append('<span>'+ _text +'</span>');
                        } else {
                            $target.append(document.createTextNode(_text));
                        };
                    };

                    if (_style) {
                        $target.addClass(_style);
                    };

                    if (_params.mode && Big.size.top < Big.size.height && _params.mode !== 2) {
                        $target.css({display : 'none'});
                    } else {
                        autoHide();
                    };

                    switch (_insert) {
                        case 'prepend' :
                        case 'after' :
                        case 'before' :
                            $wrapper[_insert]($target);
                            break;

                        case 'append' :
                        default :
                            $wrapper.append($target);
                            break;
                    };

                    var bindEvent = (function() {
                            $target.on('click', function() {
                                Big.coll.elem.$scroll.animate({
                                    scrollTop : 0
                                }, _params.speed, _params.easing);
                            });

                            if (_params.mode !== 2) {
                                Big.evt.onChange(onScroll);
                            };
                        })();
                })();

                if (Big.isType('function', _self.onReady)) {
                    _self.onReady($target, _self);
                };
        };

        /* ==================================================
         * @constructor 日历插件[Com]
         * - target(selector *) 日历输入框
         * + options(json) 参数
         *   - (wrapper:selector) 日历插件的包围盒子
         *   - (start:year) 开始年份
         *   - (end:year) 结束年份
         * ================================================== */
        DatePicker = Big.com.DatePicker = function(target, options) {
            if (!target) return false;

            var _self = this,
                options = Big.isType('json', options) ? options : {},            
                $target = this._target = $(target),

                $wrapper = this._wrapper = options.wrapper ? $(options.wrapper) : $(document.body),

                _params = this._params = {
                    history : Big.isType('boolean', options.history) ? options.history : false,
                    hour : Big.isType('array', options.hour) || Big.isType('string', options.hour) ? options.hour : (Big.isType('boolean', options.hour) && options.hour ? true : false)
                },

                $picker = $('<div class="-date-picker"></div>'),
                $calendar = $('<div class="bsjs-calendar"></div>'),
                $calHead = $('<div class="calendar-header"></div>'),
                $calWeek = $('<div class="calendar-week clearfix"><em>日</em><em>一</em><em>二</em><em>三</em><em>四</em><em>五</em><em>六</em></div>'),
                $calBody =  $('<div class="calendar-body clearfix"></div>'),
                $calFoot = $('<div class="calendar-footer clearfix"></div>'),
                $prevMonBtn = $('<button class="prev-month"></button>'),
                $nextMonBtn = $('<button class="next-month"></button>'),
                $todayBtn = $('<em class="today-btn">今天</em>'),
                $closeBtn = $('<em class="close-btn">关闭</em>'),
                $calDate = $('<div class="calendar-date clearfix"></div>'),
                $calHours = $('<b>00</b><b>01</b><b>02</b><b>03</b><b>04</b><b>05</b><b>06</b><b>07</b><b>08</b><b>09</b><b>10</b><b>11</b><b>12</b><b>13</b><b>14</b><b>15</b><b>16</b><b>17</b><b>18</b><b>19</b><b>20</b><b>21</b><b>22</b><b>23</b>'),
                $calHour = $('<div class="calendar-hour clearfix"></div>'),
                $calHourBack = $('<em class="back-btn">重新选择日期</em>'),

                $yearSelect,
                $monthSelect,
                $calDates,
                $input = this._input = null,

                _date = new Date(),
                _toYear = _date.getFullYear(),
                _toMonth = _date.getMonth(),
                _toDay = _date.getDate(),
                _startYear = options.start ? options.start : _toYear,
                _endYear = options.end ? options.end : _toYear + 1,
                _yearLength = _endYear - _startYear,
                _years = [],

                _pickerSize = null,
                _isFixed = undefined,
                _tempDate;

            this.onReady = options.onReady,
            this.onShow = options.onShow,
            this.onHide = options.onHide,
            this.onInput = options.onInput;

            var addTarget = this.addTarget = function(target) {
                    $(target).on('click', function() {
                        $input = _self._input = $(this);
                        getDays();
                        $picker.css(getPosition(this)).fadeIn(200, function() {
                            if (Big.isType('function', _self.onShow)) {
                                _self.onShow(_self);
                            };
                        });

                        $wrapper.append($picker);
                    });
                },
                closePicker = this.closePicker = function() {
                    $picker.fadeOut(200, function() {
                        $picker.detach();

                        if (Big.isType('function', _self.onHide)) {
                            _self.onHide(_self);
                        };
                    });
                },
                getDays = function() {
                    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
                        yearIndex = $yearSelect.get(0).selectedIndex,

                        nowYear = parseInt($yearSelect.val()),
                        nowMonth = parseInt($monthSelect.val()),
                        date = new Date(nowYear, nowMonth),
                        start = date.getDay();

                    if (start == 0) start = 7;

                    var prevMon,
                        nextMon,
                        prevYear,
                        nextYear;

                    if (nowMonth == 0) {
                        prevMon = 11,
                        nextMon = nowMonth + 1,
                        prevYear = nowYear - 1,
                        nextYear = nowYear;
                    } else if (nowMonth == 11) {
                        prevMon = nowMonth - 1,
                        nextMon = 0,
                        prevYear = nowYear,
                        nextYear = nowYear + 1;
                    } else {
                        prevMon = nowMonth - 1,
                        nextMon = nowMonth + 1,
                        prevYear = nowYear,
                        nextYear = nowYear;
                    };

                    if (nowMonth == 0 && yearIndex == 0) {
                        $prevMonBtn.hide();
                    } else if (nowMonth == 11 && yearIndex == _yearLength) {
                        $nextMonBtn.hide();
                    } else {
                        $prevMonBtn.show();
                        $nextMonBtn.show();
                    };

                    var nowSize = monthLength[nowMonth],
                        prevSize = monthLength[prevMon],
                        nextSize = monthLength[nextMon];

                    if (nowMonth == 1 && (nowYear % 4 == 0 && nowYear % 100 != 0 || nowYear % 400 == 0)) nowSize = 29;
                    if (prevMon == 1 && (prevYear % 4 == 0 && prevYear % 100 != 0 || prevYear % 400 == 0)) prevSize = 29;
                    if (nextMon == 1 && (nextYear % 4 == 0 && nextYear % 100 != 0 || nextYear % 400 == 0)) nextSize = 29;

                    var days = [],
                        nextLength = 42 - start - nowSize;

                    for (var i = 0; i < start; i++) {
                        days.push(prevSize - i);
                    };
                    days.reverse();

                    for (var i = 0; i < nowSize; i++) {
                        days.push(i + 1);
                    };

                    for (var i = 0; i < nextLength; i++) {
                        days.push(i + 1);
                    };

                    var curDate = $input.val();
                    if (curDate) {
                        var dateArray = curDate.split('-'),
                            curYear = parseInt(dateArray[0]),
                            curMonth = parseInt(dateArray[1]) - 1,
                            curDay = parseInt(dateArray[2]) - 1;
                    };

                    initDate(days, start, nowSize, nowYear, nowMonth, (_toYear == nowYear && _toMonth == nowMonth) ? true : false, (curYear == nowYear && curMonth == nowMonth) ? true : false, curDay);
                },
                initDate = function(days, start, length, year, mon, hasToday, hasCurday, curDay) {
                    var today = start + _toDay - 1;

                    if (hasCurday) curDay += start;

                    for (var i = 0; i < days.length; i++) {
                        (function(day, node) {
                            var $node = $(node).empty().removeClass().off('click');

                            if (i < start || i >= start + length) {
                                $node.text(day);
                            } else {
                                if (!_params.history) {
                                    if (year < _toYear || (year === _toYear && mon < _toMonth) || (year === _toYear && mon === _toMonth && day < _toDay)) {
                                        $node.text(day);
                                    } else {
                                        $node.addClass('has').text(day).on('click', function() {
                                            setValue(this, year, mon + 1, day);
                                        });
                                    };
                                } else {
                                    $node.addClass('has').text(day).on('click', function() {
                                        setValue(this, year, mon + 1, day);
                                    });
                                };

                                if (i == today && hasToday) $node.addClass('now');
                                if (i == curDay && hasCurday) $node.addClass('current');
                            };
                        })(days[i], $calDates[i]);
                    };
                },
                getPosition = function(elem) {
                    _isFixed = _isFixed !== undefined ? _isFixed : (function() {
                        var wrapper = $wrapper[0],
                            isFixed = false;

                        while (wrapper && (wrapper !== document.body && wrapper.nodeType !== 11)) {
                            if (Big.info.browser.kernel == 'Trident') {
                                isFixed = wrapper.currentStyle.position === 'fixed';
                            } else {
                                isFixed = window.getComputedStyle(wrapper , null).position === 'fixed';
                            };
                            if (isFixed === true) {
                                break;
                            } else {
                                wrapper = wrapper.parentNode;
                            };
                        };
                        return isFixed;
                    })();
                    
                    var tempOffset,
                        lastOffset,
                        docHeight = $(document).height(),
                        wrapOffset = $wrapper.offset(),
                        left = 0,
                        top = 0,
                        $target = $(elem),
                        marginLeft = parseInt($target.css('marginLeft')),
                        marginTop = parseInt($target.css('marginTop')),
                        elemOffset = Big.mergeJSON(Big.getSize(elem), {
                            marginLeft : isNaN(marginLeft) ? 0 : marginLeft,
                            marginTop : isNaN(marginTop) ? 0 : marginTop
                        });

                    switch ($wrapper[0] === document.body) {
                        case true :
                            var offset = $target.offset(),
                                elemSize = Big.getSize(elem, {
                                    width : ['marginLeft'],
                                    height : ['marginTop']
                                });

                            left += (offset.left - elemSize.width);
                            top += (offset.top - elemSize.height);
                            break;

                        case false :
                            while (elem && elem !== $wrapper[0]) {
                                var $elem = $(elem),
                                    position = $(elem).position();

                                left += position.left;
                                top += position.top;

                                elem = $(elem).offsetParent()[0];
                            };
                            break;
                    };


                    tempOffset = {
                        left : left + elemOffset.marginLeft,
                        top : top + elemOffset.height + elemOffset.marginTop + 1
                    };

                    if (_isFixed) {
                        if (Big.size.height - (wrapOffset.top + tempOffset.top - Big.size.top) >= _pickerSize.height) {
                            lastOffset = tempOffset;
                        } else {
                            lastOffset = {
                                left : left + elemOffset.marginLeft,
                                top : top - _pickerSize.height + elemOffset.marginTop - 1
                            };
                        };
                    } else {
                        if (docHeight - (wrapOffset.top + tempOffset.top) >= _pickerSize.height) {
                            lastOffset = tempOffset;
                        } else {
                            lastOffset = {
                                left : left + elemOffset.marginLeft,
                                top : top - _pickerSize.height + elemOffset.marginTop - 1
                            };
                        };
                    };

                    return Big.mergeJSON({
                        position : 'absolute',
                        zIndex : Big.getZIndex(elem)
                    }, lastOffset);
                },
                setValue = function(target, year, month, day) {
                    _tempDate = formatDate(year, month, day);

                    if (_params.hour) {
                        $calHour.fadeIn(200);

                        if ($input.val().slice(0, 10) === _tempDate) {
                            $calHours.eq(parseInt($input.val().slice(11, -3))).addClass('now').siblings().removeClass('now');
                        };
                    } else {
                        $input.val(_tempDate);

                        if (Big.isType('function', _self.onInput)) {
                            _self.onInput(_tempDate);
                        };

                        closePicker();
                    };
                },
                getHour = function(hour) {
                    $input.val(_tempDate + ' ' + hour);

                    if (Big.isType('function', _self.onInput)) {
                        _self.onInput(_tempDate + ' ' + hour);
                    };

                    closeHour();
                    closePicker();
                },
                formatDate = function(year, month, day) {
                    var date = [year.toString(), month.toString(), day.toString()];

                    if (date[1].length == 1) date[1] = '0' + date[1];
                    if (date[2].length == 1) date[2] = '0' + date[2];

                    return date.toString().replace(/,/g, '-');
                },
                closeHour = function() {
                    $calHour.fadeOut(200);
                },
                makeHTML = (function(_startYear) {
                    if (_params.hour) {
                        if (Big.isType('array', _params.hour)) {
                            Big.each(_params.hour, function(index, value) {
                                $calHours.eq(value).addClass('enable');
                            });
                        } else if (Big.isType('string', _params.hour) && Big.inObject(_params.hour, '-')) {
                            var enable = _params.hour.split('-');

                            for (var i = 0; i < 24; i++) {
                                if (i >= enable[0] && i <= enable[1]) {
                                    $calHours.eq(i).addClass('enable');
                                };
                            };
                        } else {
                            $calHours.addClass('enable');
                        };
                        $calHour.append($calHours).append($calHourBack);
                        $calBody.append($calHour);
                    };

                    for (var j = 0; j <= _yearLength; j++) {
                        _years.push([_startYear + j + '年', _startYear + j]);
                    };

                    $yearSelect = $(Big.getSelecet(_years, {
                        empty : null,
                        prop : {
                            selected : Big.inObject(_years, _toYear),
                            className : 'year'
                        }
                    })),
                    $monthSelect = $(Big.getSelecet([['一月', 0], ['二月', 1], ['三月', 2], ['四月', 3], ['五月', 4], ['六月', 5], ['七月', 6], ['八月', 7], ['九月', 8], ['十月', 9], ['十一月', 10], ['十二月', 11]], {
                        empty : null,
                        prop : {
                            selected :  _toMonth,
                            className : 'month'
                        }
                    }));

                    for (var k = 0; k < 6; k++) {
                        $calDate.append('<b></b><b></b><b></b><b></b><b></b><b></b><b></b>');
                    };

                    $calDates = $calDate.find('b');

                    $calHead.append($prevMonBtn).append($nextMonBtn).append($yearSelect).append($monthSelect);
                    $calBody.append($calDate);
                    $calFoot.append($todayBtn).append($closeBtn);
                    $calendar.append($calHead).append($calWeek).append($calBody).append($calFoot);
                    _pickerSize = Big.getSize($picker.append($calendar).prependTo(document.body).css({
                        visibility : 'hidden'
                    }));
                    $picker.detach().css({
                        visibility : 'visible'
                    });

                    if ($wrapper.css('position') === 'static') {
                        $wrapper.css({
                            position : 'relative'
                        });
                    };

                    var bindEvent = (function() {
                        $prevMonBtn.on('click', function() {
                            var year = parseInt($yearSelect.val()),
                                mon = parseInt($monthSelect.val());

                            if (mon === 0) {
                                if ($yearSelect.get(0).selectedIndex > 0) {
                                    year --;
                                    $yearSelect.val(year);
                                    $monthSelect.val(11);

                                    getDays();
                                };
                            } else {
                                mon --;
                                $monthSelect.val(mon);

                                getDays();
                            };
                        });

                        $nextMonBtn.on('click', function() {
                            var year = parseInt($yearSelect.val()),
                                mon = parseInt($monthSelect.val());

                            if (mon === 11) {
                                if ($yearSelect.get(0).selectedIndex < _yearLength) {
                                    year ++;
                                    $yearSelect.val(year);
                                    $monthSelect.val(0);

                                    getDays();
                                };
                            } else {
                                mon ++;
                                $monthSelect.val(mon);

                                getDays();
                            };
                        });

                        $todayBtn.on('click', function() {
                            $yearSelect.val(_toYear);
                            $monthSelect.val(_toMonth);

                            setValue(this, _toYear, _toMonth + 1, _toDay);
                        });

                        $calHours.each(function(index, target) {
                            var $target = $(target),
                                hour = $target.text() + ':00';

                            if ($target.hasClass('enable')) {
                                $target.on('click', function() {
                                    getHour(hour);
                                });
                            };
                        });

                        $closeBtn.on('click', closePicker);
                        $calHourBack.on('click', closeHour);
                        $yearSelect.on('change', getDays);
                        $monthSelect.on('change', getDays);

                        addTarget($target);
                    })();

                    if (Big.isType('function', _self.onReady)) {
                        _self.onReady(_self);
                    };
                })(_startYear);
        };

        return Big;
    };
});