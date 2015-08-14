// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var $ = require('jquery'),
		big = require('big')($);

	$(function() {
		big.ui.listSplit('.list li', 3, '<ul></ul>' ,{
			callback : function() {
				console.log('分割完成！');
			}
		});
	})
})