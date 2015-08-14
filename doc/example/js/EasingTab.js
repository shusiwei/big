// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var $ = require('jquery'),
		big = require('big.dev')($);

	$(function() {
		var tab = new big.ui.EasingTab('span', '.con', {
                mode : 'y',
				onReady : function(self) {
					console.log('创建完成！', self);
				},
                onChangeStart : function(current, next, type) {
                    console.log('切换开始！', current, next, type);
                },
                onChangeEnd : function(current, prev, type) {
                    console.log('切换完成！', current, prev, type);
                }
			});
	});
});