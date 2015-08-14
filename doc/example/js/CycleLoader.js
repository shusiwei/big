// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var $ = require('jquery'),
		big = require('big.dev')($);

	$(function() {
		var loader = new big.ui.CycleLoader({
				target : '.loader',
				offset : 60,
				step : 75,
				speed : 55
			}, {
				onReady : function(self) {
					console.log('创建完成！', self);
				}
			});

		$('.play').on('click', function() {
			loader.play(function(self) {
				console.log('动画播放啦！', self);
			});
		});

		$('.stop').on('click', function() {
			loader.stop(function(self) {
				console.log('动画停止啦！', self);
			});
		});
	});
});