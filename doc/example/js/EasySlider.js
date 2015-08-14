// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var $ = require('jquery'),
		big = require('big.dev')($);

	$(function() {
		var sliderA = new big.ui.EasySlider('.div1', {
				effect : {
					name : 'slide',
					options : {
						mode : 'x',
						speed : 1000,
						touch : true
					}
				},
				navigation : {},
				onReady : function(self) {
					// this._prevBtn.text('<<');
					// this._nextBtn.text('>>');
					console.log('装载完成！', self);
				},
				onChangeStart : function(currnet, next, source) {
					console.log(currnet, next, source);
				},
				onChangeEnd : function(currnet, prev, source) {
					console.log(currnet, prev, source);
				}
			});

			sliderB = new big.ui.EasySlider('.div2', {
				effect : {
					name : 'slide',
					options : {
						mode : 'x',
						speed : 1000,
						touch : false
					}
				}
			});

		sliderA.control = sliderB;
		sliderB.control = sliderA;
	})
})