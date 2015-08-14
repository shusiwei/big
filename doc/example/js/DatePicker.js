// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var $ = require('jquery'),
		big = require('big.dev')($);

	$(function() {
		new big.com.DatePicker('input', {
			wrapper : '.wrapper',
            hour : true,
            onReady : function(self) {
                console.log(self);
            },
            onHide : function(type, self) {
                console.log(type, self);
            },
            onShow : function(self) {
                console.log(self);
            },
            onInput : function(time) {
                console.log(time)
            }
		})
	})
})