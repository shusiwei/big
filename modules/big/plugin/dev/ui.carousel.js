/* ==================================================
 * @constructor(*) 3D滚动展示[Util]
 * - wrapper:(selector *) 滚动展示的UL的包围盒子
 * + options(json) 参数
 *   - (speed:millisecond [500]) 滚动速度
 *   - (autoplay:millisecond/boolean) 是否滚动自动
 *   - (easing:string ['easeInOutQuart']) 缓动效果
 *   + (navigation:json [true]) 是否在页面中生成导航控件，如果为false则不生成，如果为json格式则生成
 *     - (icon:boolean [false]) 导航控件中是否包含图标元素
 *     - (under:boolean [false]) 导航控件中是否包含背景元素
 *   - (pagination:boolean [false]) 是否显示分页
 *   - (active:number [0]) 默认显示的索引
 *   - (row:number [4]) 每边列表的数量（包括当前中间列）
 *   - (scale:number [0.6]) 最左&最右的尺寸的倍数
 *   - (onReady:function [self]) 装载完成后执行的回调
 *   - (onChangeStart:function [current, next, source]) 运动开始之前执行的回调，传回两个参数（当前列表的索引,下一个列表的索引）
 *   - (onChangeEnd:function [current, prev, source]) 运动完成之后执行的回调，传回两个参数（当前列表的索引,上一个列表的索引）
 * ================================================== */

define(function(require) {
    'use strict';
    return function($, Big) {
        var Carousel = Big.ui.Carousel = function(wrapper, options) {
            var _self = this,
                _options = Big.isType('json', options) ? options : {},

                $wrapper = this._wrapper = $(wrapper).addClass('-carousel'),
                $ul = this._ul = this._wrapper.children('ul:first').addClass('-carousel-container'),
                $lis = this._lis = this._ul.children('li'),
                _length = $lis.length,
                _maxIndex = _length - 1,
                _events = null,
                _prop = this._prop = {
                    width : $ul.width(),
                    height : $ul.height(),
                    row : Big.isType('number', _options.row) ? _options.row : 4,
                    scale : Big.isType('number', _options.scale) && _options.scale <= 0.8 && _options.scale >= 0.2 ? _options.scale : 0.5,
                    pagination : Big.isType('boolean', _options.pagination) ? _options.pagination : false,
                    navigation : Big.isType('json', _options.navigation) || Big.isType('boolean', _options.navigation) ? _options.navigation : false
                },
                _params = this._params = {
                    speed : Big.isType('number', _options.speed) ? _options.speed : 500,
                    autoplay : Big.isType('boolean', _options.autoplay) && _options.autoplay == false ? false : (Big.isType('number', _options.autoplay) ? _options.autoplay : 3000),
                    easing : Big.isType('string', _options.easing) ? Big.getEasing(_options.easing) : Big.getEasing('easeInOutBack')
                },
                _active = undefined,
                _styles = [],
                _timer = undefined,

                $pagers = this._pagers = null,
                $prevBtn = this._prevBtn = null,
                $nextBtn = this._nextBtn = null;

            this.onReady = _options.onReady,
            this.onChangeStart = _options.onChangeStart,
            this.onChangeEnd = _options.onChangeEnd;

            var getList = function(index) {
                    var tempList = [];

                    for (var i = index; i < _length; i++) {
                        tempList.push($lis[i]);
                    };

                    for (var j = 0; j < index; j++) {
                        tempList.push($lis[j]);
                    };

                    return tempList;
                },
                getIndex = function(type) {
                    var index;

                    if (type === 'prev') {
                        if (_active === 0) {
                            index = _maxIndex;
                        } else {
                            index = _active - 1;
                        };
                    } else if (type === 'next') {
                        if (_active === _maxIndex) {
                            index = 0;
                        } else {
                            index = _active + 1;
                        };
                    };

                    return index;
                },
                bindEvent = this.bindEvent = function(type) {
                    switch (type) {
                        case 'on' :
                            $lis.each(function(index, li) {
                                if (index == _active) {
                                    $(li).off('click', _events.list[index]);
                                } else {
                                    $(li).on('click', _events.list[index]);
                                };
                            });

                            if (_prop.pagination) {
                                $pagers.each(function(index, target) {
                                    $(target).on('click', _events.page[index]);
                                });
                            };

                            if (_prop.navigation) {
                                $prevBtn.on('click', _events.prev);
                                $nextBtn.on('click', _events.next);
                            };
                            break;

                        case 'off' :
                            $lis.each(function(index, li) {
                                $(li).off('click', _events.list[index]);
                            });

                            if (_prop.pagination) {
                                $pagers.each(function(index, target) {
                                    $(target).off('click', _events.page[index]);
                                });
                            };

                            if (_prop.navigation) {
                                $prevBtn.off('click', _events.prev);
                                $nextBtn.off('click', _events.next);
                            };
                            break;
                    };
                },
                startPlay = this.startPlay = function() {
                    if (_params.autoplay) {
                        stopPlay();
                        
                        _timer = setTimeout(function() {
                            playNext();
                            startPlay();
                        }, _params.autoplay);
                    };
                },
                stopPlay = this.stopPlay = function() {
                    clearTimeout(_timer);
                },
                playPrev = this.playPrev = function() {
                    playTo(getIndex('prev'), true, 'prev');
                },
                playNext = this.playNext = function() {
                    playTo(getIndex('next'), true, 'next');
                },
                playTo = this.playTo = function(index, hasCallback, source) {
                    if (index === _active) return false;

                    var tempList = getList(index);

                    // 移动前的回调(current, next)
                    if (Big.isType('function', _self.onChangeStart) && hasCallback === true) {
                        _self.onChangeStart(_active, index, source);
                    };

                    // 移除绑定
                    bindEvent('off');

                    if (source === 'init') {
                        Big.each(tempList, function(i, li) {
                            $(li).css(_styles[i]);
                        });

                        $ul.css({
                            height : Big.getSize(tempList[0]).height
                        });
                    } else {
                        Big.each(tempList, function(i, li) {
                            $(li).animate(_styles[i], _params.speed, _params.easing);
                        });
                    };

                    // 更新当前列表状态
                    $lis.eq(_active).removeClass('active');
                    $lis.eq(index).addClass('active');

                    // 更新分页状态
                    if ($pagers) {
                        $pagers.eq(_active).removeClass('active');
                        $pagers.eq(index).addClass('active');
                    };

                    setTimeout(function() {
                        // 移动后的回调(current, prev)
                        if (Big.isType('function', _self.onChangeEnd) && hasCallback === true) {
                            _self.onChangeEnd(index, _active, source);
                        };

                        // 更新当前index值
                        _active = _self._active = index;

                        // 重新绑定
                        bindEvent('on');
                    }, _params.speed);
                },
                initialize = (function(initIndex) {
                    var getStyle = (function() {
                        var firstLi = $lis[0],

                            boxSize = Big.getSize(firstLi),
                            otrSize = Big.getSize(firstLi, {
                                preset : {
                                    width : 0,
                                    height : 0
                                }
                            }),
                            trueSize = {
                                width : boxSize.width - otrSize.width,
                                height : boxSize.height - otrSize.height
                            },
                            minSize = {
                                width : trueSize.width * _prop.scale,
                                height : trueSize.height * _prop.scale
                            },
                            center = (_prop.width - boxSize.width) / 2,
                            unit = {
                                width : (boxSize.width - minSize.width) / _prop.row,
                                height : (boxSize.height - minSize.height) / _prop.row,
                                opacity : 1 / _prop.row,
                                left : center / (_prop.row - 1)
                            },
                            styles = [];

                        // 遍历出左侧的样式
                        Big.each(_prop.row, function(i) {
                            var zIndex = _prop.row - i,
                                width,
                                height,
                                left,
                                marginTop;

                            switch (i) {
                                case 0 :
                                    width = trueSize.width,
                                    height = trueSize.height,
                                    left = center;
                                    break;

                                case _prop.row - 1 :
                                    width = minSize.width,
                                    height = minSize.height,
                                    left = 0;
                                    break;

                                default :
                                    width = minSize.width + unit.width * zIndex,
                                    height = minSize.height + unit.height * zIndex,
                                    left = unit.left * (zIndex - 1) - (otrSize.width / 2);
                                    break;
                            };

                            styles.push({
                                width : width,
                                height : height,
                                left : left,
                                zIndex : zIndex,
                                opacity : zIndex * unit.opacity,
                                marginTop : - (height + otrSize.height) / 2
                            });
                        });

                        Big.each((function() {
                            var layout = [];

                            // 左侧的列表
                            for (var i = 0; i < _prop.row; i++) {
                                layout.push(i);
                            };

                            // 隐藏的列表
                            for (var j = _prop.row; j < _length - _prop.row + 1; j++) {
                                layout.push(_prop.row - 1);
                            };

                            // 右侧的列表
                            for (var k = _length - _prop.row + 1; k < _length; k++) {
                                layout.push(_length - k);
                            };

                            return layout;
                        })(), function(index, value) {
                            var style,
                                cloneStyle;

                            // 右侧的样式
                            if (_length - index <= _prop.row - 1) {
                                cloneStyle = Big.mergeJSON(styles[value], {}),
                                style = Big.mergeJSON({
                                    left : _prop.width - styles[_length - index].left - cloneStyle.width - otrSize.width
                                }, cloneStyle);
                            // 隐藏的样式
                            } else if (index >= _prop.row) {
                                cloneStyle = Big.mergeJSON(styles[value], {}),
                                style = Big.mergeJSON({
                                    left : (_prop.width - cloneStyle.width - otrSize.width) / 2,
                                    opacity : 0
                                }, cloneStyle);
                            // 正常继承的样式
                            } else {
                                style = styles[value];
                            };

                            _styles.push(style);
                        });
                    })(),
                    createPage = (function(hasPagination) {
                        if (!hasPagination) return false;

                        var $pagination = $('<div class="-carousel-pagination"></div>');

                        for (var i = 0; i < _length; i++) {
                            (function(i) {
                                var pager = $('<a class="rel-'+ (i + 1) +'">'+ (i + 1) +'</a>');

                                $pagination.append(pager);
                            })(i);
                        };

                        $pagers = _self._pagers = $pagination.find('a');
                        // $pagers.eq(_active).addClass('active');

                        if (_prop.pagination) {
                            $wrapper.append($pagination);
                        };
                    })(_prop.pagination),
                    cerateCtrl = (function(hasNavigation) {
                        if (!hasNavigation) return false;

                        $prevBtn = _self._prevBtn = $('<a class="-carousel-nav prev-btn"></a>'),
                        $nextBtn = _self._nextBtn = $('<a class="-carousel-nav next-btn"></a>');

                        if (_prop.navigation) {
                            $wrapper.append($prevBtn).append($nextBtn);

                            if (Big.isType('json', _prop.navigation) && _prop.navigation.icon) {
                                $prevBtn.append('<i></i>');
                                $nextBtn.append('<i></i>');

                                if (_prop.navigation.under) {
                                    $prevBtn.append('<b></b>');
                                    $nextBtn.append('<b></b>');
                                };
                            };
                        };
                    })(_prop.navigation),
                    setCtrlEvent = (function() {
                        _events = {
                            list : [],
                            page : [],
                            prev : playPrev,
                            next : playNext
                        };

                        Big.each(_length, function(index) {
                            _events.list.push(function() {
                                playTo(index, true, 'click');
                            });

                            _events.page.push(function() {
                                playTo(index, true, 'page');
                            });
                        });

                        // for (var i = 0; i < _length; i++) {
                        //     (function(index) {
                        //         _events.list.push(function() {
                        //             playTo(index, true, 'page');
                        //         });
                        //     })(i);
                        // };
                    })(),
                    bindAuto = (function() {
                        $wrapper.on('mouseover', stopPlay);
                        $wrapper.on('mouseout', startPlay);

                        bindEvent('on');

                        if (Big.isType('function', _self.onReady)) {
                            _self.onReady(_self);
                        };
                    })();

                    playTo(initIndex, true, 'init');
                    startPlay();
                })(Big.isType('number', _options.active) && _options.active <= _maxIndex && _options.active >= 0 ? _options.active : 0);
        };

        return Carousel;
    };
});