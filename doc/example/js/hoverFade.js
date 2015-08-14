// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var $ = require('jquery'),
		big = require('big')($);

	$(function() {
		big.ui.hoverFade('.target', '.content', {
			speed : 500,
			onShow : function() {
				console.log('我显示了！');
			},
			onHide : function() {
				console.log('我隐藏了！');
			}
		})
	})
})