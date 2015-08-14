/* ==================================================
 * @constructor(*) 文章形式HTML分割器[Util]
 * - wrapper(selector *) 进行HTML分割的包围盒子
 * + options(json) 参数
 *   - (show:string [显示更多…]) 展开的提示文字
 *   - (hide:string [收起]) 收起的提示文字
 *   - (size:number [200]) 分割后显示文字的最小数量
 *   - (speed:millisecond [800]) 展开收缩的动画速度
 *   - (easing:string ['easeInOutQuart']) 缓动效果
 * ================================================== */

define(function(require) {
    return function($, Big) {
        var HtmlSplit = Big.ui.HtmlSplit = function(wrapper, options) {
            var options = Big.isType('json', options) ? options : {},
                showText = Big.isType('string', options.show) ? options.show : '显示更多…',
                hideText = Big.isType('string', options.hide) ? options.hide : '收起';

            this._wrapper = $(wrapper),
            this._nodes = this._wrapper.children(),
            
            this._size = Big.isType('number', options.size) ? options.size : 200,
            this._speed = Big.isType('number', options.speed) ? options.speed : 800,
            this._easing = Big.isType('string', options.easing) ? Big.getEasing(options.easing) : Big.getEasing('easeInOutQuart');

            this.initialize(showText, hideText);
        };

        HtmlSplit.prototype = {
            initialize : function(showText, hideText) {
                var wrapHeight = this._wrapper.height(),

                    nodes = this.getNode(),
                    beforeNode = nodes.before,
                    afterNode = nodes.after,
                    beforeIndex = beforeNode.length - 1,
                    afterIndex = afterNode.length - 1;

                this._showBtn = $('<a href="javascript:;" class="-html-split-nav show-btn">'+ showText +'</a>'),
                this._hideBtn = $('<a href="javascript:;" class="-html-split-nav hide-btn">'+ hideText +'</a>')

                this.insertBtn(beforeNode[beforeIndex], this._showBtn);
                this.insertBtn(afterNode[afterIndex], this._hideBtn);
                this.bindEvent(wrapHeight, this.appendHTML(beforeNode, afterNode));
            },
            appendHTML : function(before, after) {
                this._wrapper.empty().addClass('-html-split');

                for (var i = 0; i < before.length; i++) {
                    this._wrapper.append(before[i]);
                };

                this._after = $('<div class="-html-split-after"></div>').css({
                    opacity : 0,
                    display : 'none',
                    height : 0
                }).appendTo(this._wrapper);

                for (var j = 0; j < after.length; j++) {
                    this._after.append(after[j]);
                };

                return this._wrapper.height();
            },
            bindEvent : function(oldHeight, newHeight) {
                var that = this;

                this._showBtn.on('click', function() {
                    that._after.show().animate({
                        opacity : 1,
                        height : oldHeight - newHeight
                    }, that._speed, that._easing);

                    that._showBtn.fadeOut(200);
                });

                this._hideBtn.on('click', function() {
                    that._after.animate({
                        opacity : 0,
                        height : 0
                    }, that._speed, that._easing, function() {
                        $(this).hide();
                    });

                    that._showBtn.fadeIn(200);
                });
            },
            getIndex : function() {
                var string = [],
                    index,
                    count = 0;

                this._nodes.each(function(i, node) {
                    var nodeClone = $(node).clone(),
                        nodeText = nodeClone.text();

                    string.push(nodeText);
                });

                for (var i = 0; i < string.length; i++) {
                    count += string[i].length;

                    if (count >= this._size) {
                        index = i;
                        break;
                    } else {
                        index = i;
                    }
                };

                return index;
            },
            getNode : function() {
                var index = this.getIndex(),
                    before = [],
                    after = [];

                for (var i = 0; i <= index; i++) {
                    before.push(this._nodes[i]);
                };

                for (var i = index + 1; i < this._nodes.length; i++) {
                    after.push(this._nodes[i]);
                };

                return {
                    before : before,
                    after : after
                }
            },
            checkNodeType : function(node) {
                var $tempBox = $('<div></div>'),
                    type;

                $tempBox.append(node);

                var html = $tempBox.html();

                if (html.indexOf('</') > -1) {
                    type = true;
                } else {
                    type = false;
                };

                return type;
            },
            insertBtn : function(wrapper, btn) {
                if (this.checkNodeType(wrapper)) {
                    $(wrapper).append(btn);
                } else {
                    $(wrapper).after(btn);
                }
            }
        };

        return HtmlSplit;
    };
});