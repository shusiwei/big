// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var $ = require('jquery'),
		big = require('big.dev')($);

	$(function() {
		new big.ui.ToggleTab('span', '.con', {
				onReady : function(self) {
					console.log('创建完成！', self);
				},
                onChange : function(prev, next) {
                    console.log(prev, next);
                }
			});
	});
});