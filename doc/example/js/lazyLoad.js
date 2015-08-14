// 所有模块都通过 define 来定义
define(function(require) {
	var $ = require('jquery'),
		big = require('big.dev')($);
    
	$(function() {
		var imgLoader = new big.ui.LazyLoad('.img');
        console.log(imgLoader)
	});
})