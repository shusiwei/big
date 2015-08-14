// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var $ = require('jquery'),
		big = require('big')($);

	// 或者通过 module.exports 提供整个接口
	var blurID = big.getRandom();
	module.exports = {
		onBlur : function() {
			console.log(big);
		},
		offBlur : function() {

		}
	}

	$(function() {
		$('input.onBlur').on('click', function() {
			big.ui.toggleBlur(blurID, {
				target : this,
				callback : function() {
					console.log('模糊了！')
				}
			});
		});
		$('input.offBlur').on('click', function() {
			big.ui.toggleBlur(blurID, {
				callback : function() {
					console.log('清楚了！')
				}
			});
		});
	})
})