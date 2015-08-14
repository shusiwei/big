// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var $ = require('jquery'),
		big = require('big.dev')($);

	$(function() {
		new big.ext.AjaxForm([
				{
					tag : 'input',
					title : '姓名',
					notice : '输入您的姓名',
					require : true,
					prop : {
						type : 'text',
						value : '输入您的姓名',
						name : 'name',
						className : 'username'
					}
				}, {
					tag : 'input',
					title : '出生份',
					notice : '输入您的姓名',
					require : true,
					prop : {
						type : 'checkbox',
						value : [2010, 2011, 2012, 2013, 2014, 2015],
						checked : ['2010', '2011'],
						name : 'year',
						className : 'years'
					}
				}, {
					tag : 'input',
					title : '性别',
					require : true,
					prop : {
						type : 'radio',
						value : ['男', '女'],
						checked : 1,
						name : 'sex'
					}
				}, {
					tag : 'input',
					title : '地市',
					require : true,
					prop : {
						type : 'checkbox',
						value : ['深圳', '东莞', '佛山', '广州'],
						checked : [0, 2, 3],
						name : 'city'
					}
				}, {
					tag : 'select',
					title : '心情',
					require : true,
					prop : {
						options : ['开心', '高兴', '难过', '忧郁'],
						selected : '忧郁',
						name : 'mood'
					}
				}, {
					tag : 'select',
					title : '地区',
					require : true,
					prop : {
						options : [
							['罗湖', 'nanshan'],
							['福田', 'futian'],
							['南山', 1],
							['龙华', false]
						],
						selected : 2,
						name : 'aera'
					}
				}
			], {
				event : function(xhr) {
					console.log(xhr);
				},
				xhr : {
					url : 'http://localhost/index.php',
					type : 'GET',
					data : {},
					dataType : 'jsonp' // json/xml/html/text/false(submit提交)
				}
			}, {
				onReady : function(form, self) {
					console.log(form, self);
					console.log('加载完成！将生成的表单装入页面！');
					$(document.body).append(form);
				},
				submit : {
					value : '报名'
				}
		})
	})
})