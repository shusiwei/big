define(function(require) {
	var $ = require('jquery'),
		big = require('big.dev')($);

	$(function() {
		new big.com.ScrollTop(document.body, {
			text : 'TOP',
			mode : 1,
			autohide : 1000,
			onReady : function(target, self) {
				console.log(target, self);
			}
		})
	});
});