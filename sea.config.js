seajs.config({
    base : 'modules/',
    alias : {
        'big' : 'big.min.js?ver=1.1.0&build=50730pm',

        'jquery' : 'jquery.min.js?ver=1.11.3',
        'jquery2' : 'jquery2.min.js?ver=2.1.4',

        'underscore' : 'underscore.min.js?ver=1.7.0',
        'backbone' : 'backbone.min.js?ver=1.1.2',

        'ui.carousel' : 'big/plugin/ui.carousel.min',
        'ui.htmlsplit' : 'big/plugin/ui.htmlsplit.min',
        'ui.lightgallery' : 'big/plugin/ui.lightgallery.min',

        'ext.wechatapi' : 'big/plugin/ext.wechatapi.min'
    },
    charset: 'utf-8'
});

(function(host, query) {
    if (query.indexOf('big=debug') > 0) {
        seajs.config({
            alias : {
                'big' : 'big.dev.js?ver=1.0.5&build=50730pm'
            }
        });
    };
})(window.location.host, window.location.search);