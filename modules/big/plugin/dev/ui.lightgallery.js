/* ==================================================
 * @constructor(*) 图片查看器[Util]
 * - wrapper(selector *) 图片索引范围所在的盒子
 * + options(json) 参数
 *   - (speed:millisecond [400]) 动画速度
 *   - (easing:string ['easeInOutQuart']) 缓动效果
 *   - (loop:boolean [false]) 是否可以循环切图
 *   - (onReady:function) 装载完成后执行的回调
 *   - (onShow:function) 打开窗口后执行的回调
 *   - (onHide:function) 关闭窗口后执行的回调
 * + data(data-in-html-by-target *) 启用lightView插件的target的值
 *   - ([data-light-path]) 图片引用路径
 *   - ([data-light-desc]) 文字说明
 * ================================================== */

define(function(require) {
    return function($, Big) {        
        var LightGallery = Big.ui.LightGallery = function(wrapper, options) {
            var _self = this,
                _options = Big.isType('json', options) ? options : {},

                $targets = this._targets = $(wrapper).find('[data-light-path]'),

                $wrapper = this._wrapper = $('<div class="-light-gallery"></div>').css({'visibility' : 'hidden'}),
                $mask = this._mask = $('<div class="-light-gallery-mask"></div>'),
                $origin = this._origin = $('<div class="-light-gallery-origin"></div>'),

                $container = this._container = $('<div class="-light-gallery-container"></div>'),
                $imageBox = this._imageBox = $('<div class="-light-gallery-image"></div>'),
                $descBox = this._descBox = $('<div class="-light-gallery-desc"><b></b></div>'),
                $desc = this._desc = $('<p></p>'),

                $closeBtn = this._closeBtn = $('<a class="-light-gallery-close-btn"><i></i><b></b></a>'),
                $loader = $('<div class="-light-gallery-loader"></div>'),
                $prevBtn = $prevBtn = $('<a class="-light-gallery-nav prev-btn"><i></i><b></b></a>'),
                $nextBtn = $nextBtn = $('<a class="-light-gallery-nav next-btn"><i></i><b></b></a>'),

                _params = this._params = {
                    speed : Big.isType('number', _options.speed) ? _options.speed : 400,
                    easing : Big.isType('string', _options.easing) ? Big.getEasing(_options.easing) : Big.getEasing('easeInOutQuart'),
                    loop : Big.isType('boolean', _options.loop) ? _options.loop : false
                },
                _data = [],
                _active,
                _navType,
                _imgWidth,
                _imgHeight,
                _blurID = Big.getRandom(),
                _Loader = null;

            this.onReady = _options.onReady;

            $descBox.append($desc);
            $container.append($imageBox).append($descBox);
            $origin.append($container).append($closeBtn).append($loader).append($prevBtn).append($nextBtn);
            $wrapper.append($mask).append($origin);
            $(document.body).append($wrapper);

        var zoomEvent = function(type) {
                $closeBtn[type]('click', zoomHide);
                $mask[type]('click', zoomHide);
            },
            getNavIndex = function(type) {
                var maxIndex = _data.length - 1,
                    index;

                switch (_params.loop) {
                    case true :
                        switch (type) {
                            case 'prev' :
                                if (_active == 0) {
                                    index = maxIndex;
                                } else {
                                    index = _active - 1;
                                };
                                break;

                            case 'next' :
                                if (_active == maxIndex) {
                                    index = 0;
                                } else {
                                    index = _active + 1;
                                };
                                break;
                        };
                        break;

                    case false:
                        switch (type) {
                            case 'prev' :
                                index = _active - 1;

                                if (index <= 0) {
                                    $prevBtn.stop().animate({
                                        left : 5,
                                        opacity : 0
                                    }, _params.speed, function() {
                                        $prevBtn.hide();
                                    });

                                    if (maxIndex > 1) {
                                        $nextBtn.show().stop().animate({
                                            right : 15,
                                            opacity : 1
                                        }, _params.speed);
                                    };
                                };
                                break;

                            case 'next' :
                                index = _active + 1;

                                if (index >= maxIndex) {
                                    $nextBtn.stop().animate({
                                        right : 5,
                                        opacity : 0
                                    }, _params.speed, function() {
                                        $nextBtn.hide();
                                    });

                                    if (maxIndex > 1) {
                                        $prevBtn.show().stop().animate({
                                            left : 15,
                                            opacity : 1
                                        }, _params.speed);
                                    };
                                };

                                break;
                        };
                        break;
                };

                return index;
            },
            updateNav = function(type) {
                var maxIndex = _data.length - 1;

                switch (_params.loop) {
                    case true :
                        switch (type) {
                            case 'prev' :
                                $prevBtn.show().stop().animate({
                                    left : 15,
                                    opacity : 1
                                }, _params.speed);

                                $nextBtn.stop().animate({
                                    right : 5,
                                    opacity : 0
                                }, _params.speed, function() {
                                    $nextBtn.hide();
                                });
                                break;

                            case 'next' :
                                $prevBtn.stop().animate({
                                    left : 5,
                                    opacity : 0
                                }, _params.speed, function() {
                                    $prevBtn.hide();
                                });

                                $nextBtn.show().stop().animate({
                                    right : 15,
                                    opacity : 1
                                }, _params.speed);
                                break;

                            case 'none' :
                                $prevBtn.stop().animate({
                                    left : 5,
                                    opacity : 0
                                }, _params.speed, function() {
                                    $prevBtn.hide();
                                });

                                $nextBtn.stop().animate({
                                    right : 5,
                                    opacity : 0
                                }, _params.speed, function() {
                                    $nextBtn.hide();
                                });
                                break;
                        };
                        break;

                    case false :
                        switch (type) {
                            case 'prev' :
                                if (_active <= 0) {
                                    $prevBtn.stop().animate({
                                        left : 5,
                                        opacity : 0
                                    }, _params.speed, function() {
                                        $prevBtn.hide();
                                    });
                                } else {
                                    $prevBtn.show().stop().animate({
                                        left : 15,
                                        opacity : 1
                                    }, _params.speed);
                                };

                                $nextBtn.stop().animate({
                                    right : 5,
                                    opacity : 0
                                }, _params.speed, function() {
                                    $nextBtn.hide();
                                });
                                break;

                            case 'next' :
                                $prevBtn.stop().animate({
                                    left : 5,
                                    opacity : 0
                                }, _params.speed, function() {
                                    $prevBtn.hide();
                                });

                                if (_active >= maxIndex) {
                                    $nextBtn.stop().animate({
                                        right : 5,
                                        opacity : 0
                                    }, _params.speed, function() {
                                        $nextBtn.hide();
                                    });
                                } else {
                                    $nextBtn.show().stop().animate({
                                        right : 15,
                                        opacity : 1
                                    }, _params.speed);
                                };
                                break;

                            case 'none' :
                                $prevBtn.stop().animate({
                                    left : 5,
                                    opacity : 0
                                }, _params.speed, function() {
                                    $prevBtn.hide();
                                });

                                $nextBtn.stop().animate({
                                    right : 5,
                                    opacity : 0
                                }, _params.speed, function() {
                                    $nextBtn.hide();
                                });
                                break;
                        };
                        break;
                };

                _navType = type;
            },
            getTargetStyle = function(index) {
                var $target = $targets.eq(index),
                    offset = $target.offset(),
                    size = Big.getSize($target);

                return {
                    opacity : 0,
                    width : size.width,
                    height : size.height,
                    left : offset.left - Big.size.left,
                    top : offset.top - Big.size.top,
                    marginTop : 0,
                    marginLeft : 0
                };
            },
            getOriginStyle = function(img) {
                var size,
                    style;

                switch (img.complete) {
                    case true :
                        var originSize = Big.getSize($origin, {
                                preset : {
                                    width : 0,
                                    height : 0
                                }
                            });

                        size = getImgSize(img);
                        style = Big.getFixed({
                            offset : 5,
                            attach : false,
                            range : 0,
                            width : size.width + originSize.width,
                            height : size.height + originSize.height
                        }, {
                            fixed : true,
                            style : {
                                opacity : 1,
                                width : size.width,
                                height : size.height
                            }
                        });
                        break;

                    case false :
                        size = Big.getSize($origin);
                        style = Big.getFixed({
                            offset : 5,
                            attach : false,
                            range : 0,
                            width : size.width,
                            height : size.height
                        }, {
                            fixed : true,
                            style : {
                                opacity : 1,
                                width : size.width,
                                height : size.height
                            }
                        });
                        break;
                };

                return style;
            },
            getImgSize = function(img) {
                var scale,
                    maxWidth = Big.size.width - 88,
                    maxHeight = Big.size.height - 88,
                    width,
                    height;

                // 始终取最大的图片尺寸，以应对窗口拉伸
                if ((_imgWidth && _imgWidth) && _imgWidth > img.width || _imgHeight > img.height) {
                    width = _imgWidth,
                    height = _imgHeight;
                } else {
                    width = img.width,
                    height = img.height;
                };
                
                if (width > maxWidth || height > maxHeight) {
                    if (maxHeight > maxWidth) {
                        scale = width / height,
                        width = maxWidth,
                        height = maxWidth / scale;
                    } else {
                        scale = height / width,
                        height = maxHeight,
                        width = maxHeight / scale;
                    };
                };

                return {
                    width : width,
                    height : height
                };
            },
            zoomShow = this.zoomShow = function(index) {
                $(document.body).append($wrapper);

                var startStyle = getTargetStyle(index),
                    endStyle = getOriginStyle(_data[index].img);

                Big.ui.toggleBlur(_blurID, {
                    target : $wrapper,
                    callback : function() {
                        $origin.css(startStyle);
                        $wrapper.css({zIndex : Big.getZIndex($wrapper)}).fadeIn(_params.speed, function() {
                            imageLoad(index);
                            $origin.animate(endStyle, _params.speed, function() {
                                zoomEvent('on');

                                if (Big.isType('function', _self.onShow)) {
                                    _self.onShow(_self);
                                };
                            });
                        });
                    }
                });
            },
            zoomHide = this.zoomHide = function() {
                var targetStyle = getTargetStyle(_active);

                zoomEvent('off');

                $container.fadeOut(_params.speed, function() {
                    $origin.animate(targetStyle, _params.speed, function() {
                        Big.ui.toggleBlur(_blurID, {
                            callback : function() {
                                $wrapper.fadeOut(Big.resetTime(_params.speed, 0), function() {
                                    $imageBox.empty();
                                    $descBox.hide();
                                    $container.show();
                                    $wrapper.detach();

                                    if (Big.isType('function', _self.onHide)) {
                                        _self.onHide(_self);
                                    };
                                });
                            }
                        });
                    });
                });
            },
            imageLoad = this.imageLoad = function(index) {
                if (index >= _data.length || index < 0) return false;

                var newImg = _data[index].img,
                    $oldImg = $imageBox.children('img'),
                    desc = _data[index].desc;

                // 重置newImg状态
                newImg.style.display = 'block';

                // 更新图片尺寸值
                _imgWidth = newImg.width;
                _imgHeight = newImg.height;

                // 更新当前索引
                _active = _self._active = index;

                // 清除计时器
                switch (newImg.complete) {
                    case true :
                        updateView(newImg, desc);
                        break;

                    case false :
                        switch ($oldImg.length > 0) {
                            case true :
                                // oldImg显示状态为none了
                                $oldImg.fadeOut(_params.speed, function() {
                                    _Loader.play();
                                });
                                break;

                            case false :
                                _Loader.play();
                                break;
                        };

                        newImg.onload = function() {
                            updateView(newImg, desc);
                        };
                        newImg.src = newImg.src; // IE9以下浏览器下的onload不响应的bug修复
                        break;
                };
            },
            updateView = function(newImg, desc) {
                var imgSize = getImgSize(newImg),
                    boxSize = Big.getSize($origin, {
                        preset : {
                            width : imgSize.width,
                            height : imgSize.height
                        }
                    }),
                    newStyle = Big.getFixed({
                        offset : 5,
                        attach : false,
                        range : 0,
                        width : boxSize.width,
                        height : boxSize.height
                    }, {
                        fixed : true,
                        style : {
                            width : imgSize.width,
                            height : imgSize.height
                        }
                    });

                $container.fadeOut(_params.speed, function() {
                    $imageBox.empty().append(newImg);

                    if (desc && desc != '') {
                        $descBox.show();
                        $desc.text(desc);
                    } else {
                        $descBox.hide();
                        $desc.empty();
                    };

                    if (_Loader._status) {
                        _Loader.stop(function() {
                            $origin.animate(newStyle, _params.speed, _params.easing, function() {
                                $container.fadeIn(_params.speed);
                            });
                        });
                    } else {
                        $origin.animate(newStyle, _params.speed, _params.easing, function() {
                            $container.fadeIn(_params.speed);
                        });
                    };
                });
            },
            resizeView = function () {
                var img = $imageBox.children('img').get(0),
                    style;

                if (img) {
                    $origin.css(getOriginStyle(img));
                }
            },
            initialize = (function() {
                Big.each($targets, function(index, target) {
                    var $target = $(target),
                        newImg = new Image();
                        newImg.src = $target.data('light-path');
                        
                    var desc = $target.data('light-desc');

                    _data.push({
                        img : newImg,
                        desc : desc
                    });
                });

                Big.ui.keepFull($wrapper, {
                    callback : function() {
                        var offset = new Big.ui.ScrollFollow($wrapper, {
                            offset : 1
                        });
                    }
                });

                var restStyle = (function() {
                        var prevSize = Big.getSize($prevBtn),
                            nextSize = Big.getSize($nextBtn);

                        $prevBtn.css({
                            top : '50%',
                            marginTop : - prevSize.height / 2,
                            display : 'none'
                        });
                        $nextBtn.css({
                            top : '50%',
                            marginTop : - nextSize.height / 2,
                            display : 'none'
                        });

                        _Loader = new Big.ui.CycleLoader({
                            target : $loader,
                            offset : 60,
                            step : 75,
                            speed : 55
                        });

                        $wrapper.css({visibility : 'visible'}).detach();
                    })(),
                    bindEvent = (function() {
                        $targets.on('click', function() {
                            zoomShow($(this).index());
                        });

                        $prevBtn.on('click', function() {
                            imageLoad(getNavIndex('prev'));
                        });

                        $nextBtn.on('click', function() {
                            imageLoad(getNavIndex('next'));
                        });

                        $container.on('mousemove', function(event) {
                            if (event.offsetX) {
                                var x = event.offsetX,
                                    y = event.offsetY;
                            } else {
                                var offset = $container.offset(),
                                    offsetX = offset.left - Big.size.left,
                                    offsetY = offset.top - Big.size.top,
                                    x = event.clientX - offsetX,
                                    y = event.clientY - offsetY;
                            };

                            var size = Big.getSize(this),
                                maxX = size.width / 2,
                                maxY = size.height / 2,
                                type;

                            if (x > maxX) {
                                type = 'next';
                            } else {
                                type = 'prev';
                            };

                            if (_navType != type) {
                                updateNav(type);
                            };
                        });

                        $origin.on('mouseout', function(event) {
                            if (event.currentTarget == event.relatedTarget || event.relatedTarget == $mask[0]) {
                                updateNav('none');
                            };
                        });

                        Big.evt.onResize(resizeView);

                        if (Big.isType('function', _self.onReady)) {
                            _self.onReady(_self);
                        };
                    })();
            })();

        };

        return LightGallery;
    };
});