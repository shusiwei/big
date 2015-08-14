// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var $ = require('jquery'),
		big = require('big.dev')($);

	$(function() {
		var popup = new big.ui.LightPopup('<div>看到我了没？</div>', {
						onReady : function(self) {
							console.log(self, '创建完成！');
						},
						onShow : function(self) {
							console.log(self, '完全显示了！');
						},
						onHide : function(self) {
							console.log(self, '完全关闭了！')
						},
						onVisible : function(self) {
							console.log(self, '可见！');
						},
						onPopUp : function(self) {
							console.log(self, '打开！');
						},
						onPopOff : function(self) {
							console.log(self, '关闭！');
						},
						onAppend : function(filler, self) {
							console.log(filler, self, '填充内容完成！')
						}
					});

		$('button').on('click', function() {
			popup.show(this);
		});
	})
})