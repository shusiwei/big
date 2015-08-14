// 所有模块都通过 define 来定义
define(function(require, exports) {
	var $ = require('jquery'),
		big = require('big.dev')($);
		carousel = require('ui.carousel')($, big);
	
	$(function() {
		window.loader = new big.ui.Carousel('.loader', {
			scale : 0.5,
			row : 5,
			pagination : true,
			// navigation : true,
			onReady : function(self) {
				console.log('装载完成！', self);
			},
			onChangeStart : function(currnet, next, source) {
				console.log('当前索引为：'+ currnet + '，下一个索引为：'+ next, source);
			},
			onChangeEnd : function(currnet, prev, source) {
				console.log('当前索引为：'+ currnet + '，上一个索引为：'+ prev, source);
			}
		});
	})
})