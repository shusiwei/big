// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var $ = require('jquery'),
		big = require('big')($);

	$(function() {
		big.ui.keepFull('.box', {
			callback : function() {
				console.log('满屏了！');
			}
		})
	})
})