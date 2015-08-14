// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var $ = require('jquery'),
		big = require('big')($),
		lightgallery = require('ui.lightgallery')($, big);

	$(function() {
		window.gallery = new big.ui.LightGallery('.view', {
			loop : false,
			onReady : function(self) {
				console.log('onReady', self);
			},
			onShow : function(self) {
				console.log('onShow', self);
			},
			onHide : function(self) {
				console.log('onHide', self);
			}
		});
	})
})