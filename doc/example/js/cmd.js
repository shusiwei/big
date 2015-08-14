// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var $ = require('jquery'),
		big = require('big')($);

	// 或者通过 module.exports 提供整个接口
	module.exports = {
		example : function() {
			alert('big加载完成！');
			console.log(big);
		}
	}

	$(function() {
		module.exports.example();
	})
})