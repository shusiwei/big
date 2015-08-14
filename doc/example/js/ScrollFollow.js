/* ==================================================
 * @constructor 在线预约[Component]
 * ================================================== */
define(function(require) {
    var $ = require('jquery'),
        big = require('big.dev')($);

    $(function() {
        window.a = new big.ui.ScrollFollow('.div1', {
            ease : true,
            attach : true,
            offset : 7,
            onReady : function(self) {
                console.log(self)
            }
        });
        new big.ui.ScrollFollow('.div2', {
            ease : true,
            attach : false,
            offset : 6,
            onReady : function(self) {
                console.log(self)
            }
        });

        new big.ui.ScrollFollow('.div3', {
            ease : false,
            attach : true,
            offset : 5,
            onReady : function(self) {
                console.log(self)
            }
        });
    });
});