define(function(require, exports) {
    var $ = require('jquery'),
        big = require('big.dev')($);

    $(function() {
        new big.ui.ChapterTrun([
            {
                catalog : '.a',
                chapter : '.p1',
                adjust : 1
            },
            {
                catalog : '.b',
                chapter : '.p2'
            },
            {
                catalog : '.c',
                chapter : '.p3'
            },
            {
                catalog : '.d',
                chapter : '.p4',
                adjust : -100
            }
        ], {
            adjust : -50,
            onReady : function(self) {
                console.log(self);
            },
            onChange : function(index) {
                console.log(index);
            }
        })
    })
})