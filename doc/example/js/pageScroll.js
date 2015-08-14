// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var $ = require('jquery'),
		big = require('big.dev')($);

	$(function() {
		$target = $('.target');
		$target.on('click', function() {
			big.ui.pageScroll(60, {
				adjust : -10,
				callback : function(top) {
					console.log('我现在的位置是top:'+ top);
				}
			});
		});
	})
})