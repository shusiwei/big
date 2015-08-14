/*
 * name : Big
 * author : shusiwei
 * data : 2015/08/14
 * version : 1.0 beta
 */

define(function(require) {
    'use strict';
    var plugin = require('./big/plugin.dev');
    
    return function($, opt) {
        var Big = (function(root) {
            var $window = $(window),
                $document = $(document),
                _Util,  // 内部获取数据
                _Lib,   // 方法
                _Ui,  // 视图
                _Ext,   // 扩展
                _Com,   // 组件
                _Cache, // 缓存
                _Coll,  // 数据存储集合
                _Evt;   // 内部事件集合

            _Util = {
                /*
                 * 获取窗口信息
                 */
                getScreenSize : function() {
                    _Coll.size.width = $window.width();
                    _Coll.size.height = $window.height();
                    _Coll.size.docWidth = $document.width();
                    _Coll.size.docHeight = $document.height();

                    return {
                        width : _Coll.size.width,
                        height : _Coll.size.height,
                        docWidth : _Coll.size.docWidth,
                        docHeight : _Coll.size.docHeight
                    };
                },
                /*
                 * 获取滚动信息
                 */
                getScrollOffset : function() {
                    _Coll.size.top = $window.scrollTop();
                    _Coll.size.left = $window.scrollLeft();

                    return {
                        top : _Coll.size.top,
                        left : _Coll.size.left
                    };
                },
                /*
                 * 获取文档参数
                 */
                getHostQuery : function(str, key) {
                    var query = str.split(key[0]),
                        tempQuery,
                        queryJSON = {};

                    _Lib.each(query, function(index, value) {
                        var tempQuery = query[index].split(key[1]);
                        queryJSON[tempQuery[0]] = tempQuery[1];
                    });

                    return queryJSON;
                },
                /*
                 * 获取页面信息
                 */
                getHostInfo : function() {
                    var location = window.location,
                        host = {
                            href : location.href,
                            host : location.host,
                            hostname : location.hostname,
                            port : location.port,
                            protocol : location.protocol,
                            pathname : location.pathname,
                            origin : location.origin,
                            search : location.search,
                            query : _Util.getHostQuery(location.search.substring(1), ['&', '=']),
                            str : location.href.toLowerCase().substring(location.protocol.length + 2).split('/')
                        };

                    host.domain = host.host.toLowerCase().split('.');

                    return host;
                },
                /*
                 * 获取操作系统信息
                 */
                getOSInfo : function() {
                    var ua = navigator.userAgent.toLowerCase(),
                        name,
                        version,
                        uaArray;

                    if (_Lib.inObject(ua, 'android')) {
                        name = 'Android';
                    } else if (_Lib.inObject(ua, 'iphone os') || _Lib.inObject(ua, 'ipad')) {
                        name = 'iOS';
                    } else if (_Lib.inObject(ua, 'windows phone')) {
                        name = 'Windows Phone';
                    } else if (_Lib.inObject(ua, 'windows nt')) {
                        name = 'Windows';
                    } else if (_Lib.inObject(ua, 'linux')) {
                        name = 'Linux';
                    } else if (_Lib.inObject(ua, 'macintosh')) {
                        name = 'OS X';
                    };

                    if (name == 'Windows') {
                        if (_Lib.inObject(ua, 'nt 5.1')) {
                            version = 'XP';
                        } else if (_Lib.inObject(ua, 'nt 5.2')) {
                            version = '2003';
                        } else if (_Lib.inObject(ua, 'nt 6.0')) {
                            version = 'Vista';
                        } else if (_Lib.inObject(ua, 'nt 6.1')) {
                            version = '7';
                        } else if (_Lib.inObject(ua, 'nt 6.2')) {
                            version = '8';
                        } else if (_Lib.inObject(ua, 'nt 10.0')) {
                            version = '10';
                        };
                    } else if (name === 'iOS') {
                        uaArray = ua.split(';');
                        for (var i = 0, length = uaArray.length; i < length; i++) {
                            if (_Lib.inObject(uaArray[i], 'iphone os')) {
                                version = uaArray[i].split(' ')[4].replace(/_/g, '.');
                                break;
                            } else if (_Lib.inObject(uaArray[i], 'cpu os')) {
                                version = uaArray[i].split(' ')[3].replace(/_/g, '.');
                                break;
                            };
                        };
                    } else if (name === 'Android') {
                        uaArray = ua.split(';');
                        for (var i = 0, length = uaArray.length; i < length; i++) {
                            if (_Lib.inObject(uaArray[i], 'android')) {
                                version = uaArray[i].split(' ')[2];
                                break;
                            };
                        };
                    } else if (name === 'Windows Phone') {
                        uaArray = ua.split(';');
                        for (var i = 0, length = uaArray.length; i < length; i++) {
                            if (_Lib.inObject(uaArray[i], 'windows phone')) {
                                version = uaArray[i].split(' ')[3];
                                break;
                            };
                        };
                    } else if (name == 'OS X') {
                        version = ua.split(' ')[6].slice(0, -1).replace(/_/g, '.');
                    };
                    return {
                        name : name,
                        version : version,
                        mobile : name === 'iOS' || name === 'Android' || name === 'Windows Phone' ? true : false
                    };
                },
                /*
                 * 获取浏览器信息
                 */
                getBrowserInfo : function() {
                    var ua = navigator.userAgent.toLowerCase(),
                        uaArray = ua.split(' '),
                        kernel,
                        name,
                        version,
                        ie6;

                    if (_Lib.inObject(ua, 'trident') || _Lib.inObject(ua, 'msie')) {
                        kernel = 'Trident';
                    } else if (_Lib.inObject(ua, 'applewebkit')) {
                        kernel = 'WebKit';
                    } else if (_Lib.inObject(ua, 'gecko')) {
                        kernel = 'Gecko';
                    };

                    if (kernel == 'Trident') {
                        uaArray = ua.split(';');

                        if (_Lib.inObject(ua, 'msie')) {
                            for (var i = 0, length = uaArray.length; i < length; i++) {
                                if (_Lib.inObject(uaArray[i], 'msie')) {
                                    version = uaArray[i].split(' ')[2];
                                    break;
                                };
                            };
                        } else {
                            for (var i = 0, length = uaArray.length; i < length; i++) {
                                if (_Lib.inObject(uaArray[i], 'rv:')) {
                                    version = uaArray[i].split(' ')[1].slice(3, -1);
                                    break;
                                };
                            };
                        };
                        name = 'IE';
                    } else if (kernel == 'WebKit') {
                        if (_Lib.inObject(ua, 'edge')) {
                            for (var i = 0, length = uaArray.length; i < length; i++) {
                                if (_Lib.inObject(uaArray[i], 'edge')) {
                                    version = uaArray[i].split('/')[1];
                                    break;
                                };
                            };
                            name = 'Edge';
                        } else if (_Lib.inObject(ua, 'chrome')) {
                            for (var i = 0, length = uaArray.length; i < length; i++) {
                                if (_Lib.inObject(uaArray[i], 'chrome')) {
                                    version = uaArray[i].split('/')[1];
                                    break;
                                };
                            };
                            name = 'Chrome';
                        } else if (_Lib.inObject(ua, 'silk')) {
                            for (var i = 0, length = uaArray.length; i < length; i++) {
                                if (_Lib.inObject(uaArray[i], 'silk')) {
                                    version = uaArray[i].split('/')[1];
                                    break;
                                };
                            };
                            name = 'Silk';
                        } else if (_Lib.inObject(ua, 'safari')) {
                            for (var i = 0, length = uaArray.length; i < length; i++) {
                                if (_Lib.inObject(uaArray[i], 'version')) {
                                    version = uaArray[i].split('/')[1];
                                    break;
                                };
                            };
                            name = 'Safari';
                        };
                    } else if (kernel == 'Gecko') {
                        if (_Lib.inObject(ua, 'firefox')) {
                            for (var i = 0, length = uaArray.length; i < length; i++) {
                                if (_Lib.inObject(uaArray[i], 'firefox')) {
                                    version = uaArray[i].split('/')[1];
                                    break;
                                };
                            };
                            name = 'Firefox';
                        };
                    };

                    if (_Lib.inObject(ua, 'opr')) {
                        name = 'Opera';
                    } else if (_Lib.inObject(ua, 'micromessenger')) {
                        name = 'WeChat';
                    } else if (_Lib.inObject(ua, 'mqqbrowser')) {
                        name = 'MQQ';
                    } else if (_Lib.inObject(ua, 'qqbrowser')) {
                        name = 'QQ';
                    } else if (_Lib.inObject(ua, 'bidubrowser')) {
                        name = 'Baidu';
                    } else if (_Lib.inObject(ua, 'ubrowser')) {
                        name = 'UC';
                    } else if (_Lib.inObject(ua, 'qihu 360se')) {
                        name = '360SW';
                    } else if (_Lib.inObject(ua, 'qihu 360ee')) {
                        name = '360EE';
                    } else if (_Lib.inObject(ua, 'metasr')) {
                        name = 'Sogou';
                    } else if (_Lib.inObject(ua, 'lbbrowser')) {
                        name = 'Liebao';
                    } else if (_Lib.inObject(ua, 'maxthon')) {
                        name = 'Maxthon';
                    } else if (_Lib.inObject(ua, 'miuibrowser')) {
                        name = 'Miui';
                    } else if (_Lib.inObject(ua, 'ucbrowser')) {
                        name = 'MUC';
                    } else if (name === 'Chrome' && window.chrome && window.chrome.webstore && !window.chrome.webstore.onDownloadProgress) {
                        name = 'Other';
                    } else if (!name) {
                        name = kernel;
                    };

                    return {
                        kernel : kernel,
                        version : version,
                        name : name,
                        ie6 : _Lib.checkIE(6)
                    };
                },
                updateConfig : function(config, callback) {
                    if (_Lib.isType('json', config)) {
                        _Coll.config = _Lib.mergeJSON(config, _Coll.config);

                        if (_Lib.isType('function', callback)) {
                            callback(_Coll.config);
                        };
                    };

                    return _Coll.config;
                },
                /*
                 * 根据IP地址获取城市信息
                 */
                getAddress : function(data, callback) {
                    $.ajax({
                        url : 'http://api.map.baidu.com/location/ip',
                        data : data,
                        type : 'GET',
                        dataType : 'jsonp',
                        success : function(data) {
                            callback(data);
                        }
                    });
                }
            },
            _Lib = {
                /*
                 * 对一个对象进行遍历，并通过callback方法回传
                 * - obj(number/json/array/nodelist *) 遍历次数/json/数组/节点列表等
                 * - callbcak(function *) 回调索引/值
                 */
                each : function(data, callback) {
                    if (_Lib.isType('number', data)) {
                        for (var i = 0; i < data; i++) {
                            callback(i);
                        };
                    } else if (_Lib.isType('json', data)) {
                        for (var key in data) {
                            callback(key, data[key]);
                        };
                    } else if (data && 'length' in data) {
                        for (var i = 0, length = data.length; i < length; i++) {
                            callback(i, data[i]);
                        };
                    } else {
                        return false;
                    };
                },
                /*
                 * 验证一个对象是否为某一个类型
                 * - type(string *) 类型名称
                 * - obj(object *) 验证的对象
                 */
                isType : function(type, obj) {
                    var result;

                    if (obj === undefined || obj === null) {
                        return false;
                    };

                    switch (type.toLowerCase()) {
                        case 'json' :
                            result = typeof(obj) === 'object' && Object.prototype.toString.call(obj) === '[object Object]' && !('length' in obj);
                            break;

                        case 'array' :
                            result = typeof(obj) === 'object' && Object.prototype.toString.call(obj) === '[object Array]';

                            break;

                        case 'element' :
                            result = typeof(obj) === 'object' && 'nodeName' in obj && 'nodeType' in obj && obj.nodeType === 1;
                            break;

                        case 'function' :
                            result = typeof(obj) === 'function';
                            break;

                        case 'number' :
                            result = typeof(obj) === 'number';
                            break;

                        case 'integer' :
                            result = new RegExp(_Coll.regex.integer).test(obj);
                            break;

                        case 'string' :
                            result = typeof(obj) === 'string' && obj != '' && obj.length > 0;
                            break;

                        case 'boolean' :
                            result = typeof(obj) === 'boolean';
                            break;

                        case 'nodelist' :
                            result = typeof(obj) === 'object' && Object.prototype.toString.call(obj).indexOf('NodeList') >= 0 && obj.length;
                            break;

                        case 'event' :
                            result = _Lib.isType('string', obj) && 'on' + obj in document.body;
                            break;

                        case 'regexp' :
                            result = Object.prototype.toString.call(obj).indexOf('RegExp') >= 0;
                            break;

                        case 'regexpstr' :
                            result = _Lib.isType('string', obj) && obj.length > 3 && obj.slice(0, 1) == '^' && obj.slice(-1) == '$';
                            break;

                        case 'hexcolor' :
                            result = new RegExp(_Coll.regex.hex).test(_Lib.inObject(obj, '#') ? obj.substring(1) : obj);
                            break;

                        case 'username' :
                            result =  new RegExp(_Coll.regex.username).test(obj);
                            break;

                        case 'phone' :
                            result = new RegExp(_Coll.regex.phone).test(obj);
                            break;

                        case 'cell' :
                            result = new RegExp(_Coll.regex.cell).test(obj);
                            break;

                        case 'tel' :
                            result = new RegExp(_Coll.regex.tel).test(obj);
                            break;

                        case 'email' :
                            result = new RegExp(_Coll.regex.email).test(obj);
                            break;

                        case 'chinese' :
                            result = new RegExp(_Coll.regex.chinese).test(obj);
                            break;

                        default :
                            result = false;
                            break;
                    };

                    return result;
                },
                inObject : function(obj, value) {
                    var result;

                    if (_Lib.isType('array', obj)) {
                        for (var i = 0, length = obj.length; i < length; i++) {
                            if (obj[i] === value) {
                                result = true;
                                break;
                            };
                        };
                    } else if (_Lib.isType('json', obj)) {
                        result = (value in obj);
                    } else if (_Lib.isType('string', obj)) {
                        result = (obj.indexOf(value) > -1);
                    };

                    return result;
                },
                indexOf : function(obj, value) {
                    var index = -1;

                    if (_Lib.isType('array', obj)) {
                        for (var i = 0, length = obj.length; i < length; i++) {
                            if (obj[i] === value) {
                                index = i;
                                break;
                            };
                        };
                    } else if (_Lib.isType('json', obj)) {
                        for (var key in obj) {
                            if (obj[key] == value) {
                                index = key;
                                break;
                            }
                        }
                    } else if (_Lib.isType('string', obj)) {
                        index = obj.indexOf(value);
                    } else if ('length' in obj) {
                        for (var i = 0, length = obj.length; i < length; i++) {
                            if (obj[i] === value) {
                                index = i;
                                break;
                            };
                        };
                    };

                    return index;
                },
                /*
                 * 合并两组json数据
                 * - json(json *) 新的json数据
                 * - original(json *) 原始的json数据
                 */
                mergeJSON : function(json, original) {
                    var merge = (function(data, source) {
                        _Lib.each(data, function(key, value) {
                            if (_Lib.isType('json', value)) {
                                if (!(key in source)) {
                                    source[key] = {};
                                };

                                merge(value, source[key]);
                            } else {
                                source[key] = value;
                            };
                        });
                    });

                    merge(json, original);

                    return original;
                },
                // /*
                //  * HEX颜色转化RGB颜色
                //  * - hex(hex *) HEX颜色
                //  */
                // HexToRGB : function (hex) {
                //     var hex = parseInt((_Lib.inObject(hex, '#') ? hex.substring(1) : hex), 16);
                //     return {r: hex >> 16, g: (hex & 0x00FF00) >> 8, b: (hex & 0x0000FF)};
                // },
                // /*
                //  * RGB颜色转化HEX颜色
                //  * - rgb(rgb *) RGB颜色
                //  */
                // RGBToHex : function(rgb) {
                //     var hex = '#',
                //         rgbStr = _Lib.inObject(rgb.toLowerCase(), 'rgb') ? rgb.slice(4, -1) : rgb,
                //         rgbData = rgbStr.split(',');

                //     _Lib.each(rgbData, function(i, value) {
                //         var str = Number(value).toString(16);

                //         if(str == 0) {
                //             str += str;
                //         };
                //         hex += str;
                //     });

                //     return hex;
                // },
                /*
                 * 获取得一个整数随机数
                 */
                getRandom : function() {
                    var date = new Date(),
                        nowTime = date.getFullYear().toString() + date.getMonth().toString() + date.getDate().toString() + date.getMinutes().toString() + date.getSeconds().toString(),
                        number = Math.round(nowTime * Math.random());

                    return number;
                },
                /*
                 * 获取得一个范围
                 */
                getRange : function(min, max) {
                    var range = max - min,
                        rand = Math.random();

                    return min + Math.round(rand * range);
                },
                /*
                 * 检测浏览器是否为某个IE版本
                 * - ver(number *) IE版本号
                 * - mode(string) 验证方式
                 */
                checkIE : function(ver, mode) {
                    var verStatus,
                        version = parseInt(_Coll.info.browser.version);

                    switch (mode) {
                        case 'lt' :
                            verStatus = version < ver;
                            break;

                        case 'lte' :
                            verStatus = version <= ver;
                            break;

                        case 'gt' :
                            verStatus = version > ver;
                            break;

                        case 'gte' :
                            verStatus = version >= ver;
                            break;

                        case 'eq' :
                        default :
                            verStatus = version == ver;
                            break;
                    };

                    return (_Coll.info.browser.kernel == 'Trident' && verStatus);
                },
                /*
                 * 获取某个元素实际占用的空间大小
                 * - target(selector *) 要获取的元素
                 * + options(json) 预设的选项
                 *   - width(array) 重定义的宽度计算项目
                 *   - height(array) 重定义的高度计算项目
                 *   - preset(json) 预设的选项：paddingTop/paddingBottom/borderTopWidth/borderBottomWidth/marginTop/marginBottom/height;paddingLeft/paddingRight/borderLeftWidth/borderRightWidth/marginLeft/marginRight/width
                 */
                getSize : function(target, options) {
                    var options = _Lib.isType('json', options) ? options : {},
                        $elem = $(target),
                        position = $elem.css('position'),
                        
                        width = 0,
                        height = 0,
                        tempValue,
                        heightStr = _Lib.isType('array', options.height) ? options.height : ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth', 'height'],
                        widthStr =  _Lib.isType('array', options.width) ? options.width : ['paddingLeft',  'paddingRight', 'borderLeftWidth', 'borderRightWidth', 'width'],
                        preset = _Lib.isType('json', options.preset) ? options.preset : {};

                    _Lib.each(heightStr, function(index, value) {
                        if (value in preset) {
                            tempValue = preset[value];
                        } else {
                            tempValue = $elem.css(value);
                        };
                        
                        height += parseInt(tempValue) || 0;
                    });

                    _Lib.each(widthStr, function(index, value) {
                        if (value in preset) {
                            tempValue = preset[value];
                        } else {
                            tempValue = $elem.css(value);
                        };

                        width += parseInt(tempValue) || 0;
                    });

                    return {
                        width : width,
                        height : height
                    };
                },
                /*
                 * 为不同浏览器设置fixed定位的实际位置
                 * + param(json *) 参数
                 *   - (offset:number *) 九宫格中的位置
                 *   - (attach:boolean *) 是否附着于屏幕边缘
                 *   - (range:number *) 最小保持的内容范围
                 *   - (width:number *) 元素的宽度
                 *   - (height:number *) 元素的高度
                 * + options(json) 预设及随带的style属性
                 *   - (fixed:boolean [false]) IE6中是否强制使用fixed样式的结果
                 *   - (ease:boolean [false])  是否强制返回应用于缓动动画的结果（基于'absolute'）
                 */
                getFixed : function(param, options) {
                    var style,
                        fixed = _Lib.isType('json', options) && 'fixed' in options && _Lib.isType('boolean', options.fixed) ? options.fixed : false,
                        ease = _Lib.isType('json', options) && 'ease' in options && _Lib.isType('boolean', options.ease) ? options.ease : false;
                        
                    if (_Lib.checkIE(6) || (_Lib.checkIE(6) && fixed) || ease) {
                        style = {
                            left : _Lib.getAbsStyle({
                                offset : param.offset,
                                short : param.width,
                                long : _Coll.size.width
                            }, {
                                attach : param.attach,
                                range : param.range
                                }) + _Coll.size.left,
                            top : _Lib.getAbsStyle({
                                offset : param.offset,
                                short : param.height,
                                long : _Coll.size.height
                            }) + _Coll.size.top
                        };
                    } else {
                        style = _Lib.getFixedStyle(param);
                    };

                    if (_Lib.isType('json', options) && 'style' in options) {
                        _Lib.each(options.style, function(key, value) {
                            style[key] = value;
                        });
                    };

                    return style;
                },
                /*
                 * 获取fixed定位的实际位置
                 * + param(json *) 要fixed定位的元素
                 *   - (offset:number *) 九宫格中的位置
                 *   - (attach:boolean *) 是否附着于页面内容
                 *   - (range:range *) 最小保持的内容范围
                 *   - (width:number *) 元素的宽度
                 *   - (height:number *) 元素的高度
                 */
                getFixedStyle : function(param) {
                    var style,
                        offset = param.offset,
                        attach = param.attach,
                        range = param.range,
                        width = param.width,
                        height = param.height;

                    if ((attach && _Coll.size.width < range) || !attach) {
                        switch (offset) {
                            case 1 :
                                style = {
                                    left : 0,
                                    right : 'auto',
                                    top : 0,
                                    bottom : 'auto',
                                    marginLeft : 0,
                                    marginTop : 0
                                };
                                break;

                            case 2 :
                                style = {
                                    left : '50%',
                                    right : 'auto',
                                    top : 0,
                                    bottom : 'auto',
                                    marginLeft : - width / 2,
                                    marginTop : 0
                                };
                                break;
                            case 3 :
                                style = {
                                    left : 'auto',
                                    right : 0,
                                    top : 0,
                                    bottom : 'auto',
                                    marginLeft : 0,
                                    marginTop : 0
                                };
                                break;

                            case 4 :
                                style = {
                                    left : 0,
                                    right : 'auto',
                                    top : '50%',
                                    bottom : 'auto',
                                    marginLeft : 0,
                                    marginTop : - height / 2
                                };
                                break;

                            case 5 :
                                style = {
                                    left : '50%',
                                    right : 'auto',
                                    top : '50%',
                                    bottom : 'auto',
                                    marginLeft : - width / 2,
                                    marginTop : - height / 2
                                }
                                break;

                            case 6 :
                                style = {
                                    left : 'auto',
                                    right : 0,
                                    top : '50%',
                                    bottom : 'auto',
                                    marginLeft : - width / 2,
                                    marginTop : - height / 2
                                };
                                break;

                            case 7 :
                                style = {
                                    left : 0,
                                    right : 'auto',
                                    top : 'auto',
                                    bottom : 0,
                                    marginLeft : 0,
                                    marginTop : 0
                                }
                                break;

                            case 8 :
                                style = {
                                    left : '50%',
                                    right : 'auto',
                                    top : 'auto',
                                    bottom : 0,
                                    marginLeft : - width / 2,
                                    marginTop : - height / 2
                                };
                                break;

                            case 9 :
                                style = {
                                    left : 'auto',
                                    right : 0,
                                    top : 'auto',
                                    bottom : 0,
                                    marginLeft : 0,
                                    marginTop : 0
                                };
                                break;
                        };
                    } else {
                        switch (offset) {
                            case 1 :
                                style = {
                                    left : (_Coll.size.width - range) / 2,
                                    right : 'auto',
                                    top : 0,
                                    bottom : 'auto',
                                    marginLeft : 0,
                                    marginTop : 0
                                };
                                break;

                            case 2 :
                                style = {
                                    left : '50%',
                                    right : 'auto',
                                    top : 0,
                                    bottom : 'auto',
                                    marginLeft : - width / 2,
                                    marginTop : 0
                                };
                                break;
                            case 3 :
                                style = {
                                    left : 'auto',
                                    right : _Coll.size.width - range - (_Coll.size.width - range) / 2,
                                    top : 0,
                                    bottom : 'auto',
                                    marginLeft : 0,
                                    marginTop : 0
                                };
                                break;

                            case 4 :
                                style = {
                                    left : (_Coll.size.width - range) / 2,
                                    right : 'auto',
                                    top : '50%',
                                    bottom : 'auto',
                                    marginLeft : 0,
                                    marginTop : - height / 2
                                };
                                break;

                            case 5 :
                                style = {
                                    left : '50%',
                                    right : 'auto',
                                    top : '50%',
                                    bottom : 'auto',
                                    marginLeft : - width / 2,
                                    marginTop : - height / 2
                                };
                                break;

                            case 6 :
                                style = {
                                    left : 'auto',
                                    right : _Coll.size.width - range - (_Coll.size.width - range) / 2,
                                    top : '50%',
                                    bottom : 'auto',
                                    marginLeft : 0,
                                    marginTop : - height / 2
                                };
                                break;

                            case 7 :
                                style = {
                                    left : (_Coll.size.width - range) / 2,
                                    right : 'auto',
                                    top : 'auto',
                                    bottom : 0,
                                    marginLeft : 0,
                                    marginTop : 0
                                };
                                break;

                            case 8 :
                                style = {
                                    left : '50%',
                                    right : 'auto',
                                    top : 'auto',
                                    bottom : 0,
                                    marginLeft : - width / 2,
                                    marginTop : - height / 2
                                };
                                break;

                            case 9 :
                                style = {
                                    left : 'auto',
                                    right : _Coll.size.width - range - (_Coll.size.width - range) / 2,
                                    top : 'auto',
                                    bottom : 0,
                                    marginLeft : 0,
                                    marginTop : 0
                                };
                                break;
                        };
                    };

                    return style;
                },
                /*
                 * 获取absolute定位的实际位置
                 * + (param:json *) 参数
                 *   - (offset:number *) 九宫格中的位置
                 *   - (attach:boolean *) 是否附着于屏幕
                 *   - (range:range *) 最小保持的内容范围
                 *   - (width:number *) 元素的宽度
                 *   - (height:number *) 元素的高度
                 */
                getAbsStyle : function(param, options) {
                    var position = 0,

                        offset = param.offset,
                        short = param.short,
                        long = param.long;

                    if (_Lib.isType('json', options)) {
                        var range = options.range;

                        switch (offset) {
                            case 1 :
                            case 4 :
                            case 7 :
                                if (options.attach && long > options.range) {
                                    position = (long / 2) - (range / 2);
                                } else {
                                    position = 0;
                                };
                                break;

                            case 2 :
                            case 5 :
                            case 8 :
                            default :
                                position = long / 2 - short / 2;
                                break;

                            case 3 :
                            case 6 :
                            case 9 :
                                if (options.attach && long > options.range) {
                                    position = (long / 2) + (range / 2) - short;
                                } else {
                                    position = long - short;
                                };
                                break;
                        };
                    } else {
                        switch (offset) {
                            case 1 :
                            case 2 :
                            case 3 :
                                position = 0;
                                break;

                            case 4 :
                            case 5 :
                            case 6 :
                            default :
                                position = long / 2 - short / 2;
                                break;

                            case 7 :
                            case 8 :
                            case 9 :
                                position = long - short;
                                break;
                        };
                    };

                    return position;
                },
                /*
                 * 设定一个缓动类型
                 * - easing(string *) 缓动名称(jquery.easing.min.js)
                 */
                getEasing : function(easing) {
                    return _Lib.isType('string', easing) && (easing in $.easing) ? easing : 'swing';
                },
                /*
                 * 生成一个下拉列表
                 * - data(array *) 下拉列表值
                 * + options(json) 选项
                 *   - (empty:string) 空白选项的名称
                 *   - (active:index) 默认选中的索引
                 *   - (prop:json) 元素附加的参数
                 */
                getSelecet : function(data, options) {
                    var hasEmpty = false,
                        options = _Lib.isType('json', options) ? options : {},
                        select = document.createElement('select');

                    if (_Lib.isType('string', options.empty) && options.empty != '') {
                        select.options.add(new Option(options.empty, ''));
                        hasEmpty = true;
                    };

                    _Lib.each(data, function(index, value) {
                        if (_Lib.isType('array', value)) {
                            select.options.add(new Option(value[0], value[1]));
                        } else {
                            select.options.add(new Option(value, value));
                        };

                        if ('prop' in options && _Lib.isType('json', options.prop) && 'selected' in options.prop) {
                            var selected = options.prop.selected;

                            if ((_Lib.isType('number', selected) && selected === index) || (_Lib.isType('string', selected) && ((_Lib.isType('array', value) && selected == value[0]) || (_Lib.isType('string', value) && selected == value)))) {
                                if (hasEmpty) {
                                    select.options[index + 1].selected =  true;
                                } else {
                                    select.options[index].selected =  true;
                                };
                            };
                        };
                    });

                    if ('prop' in options && _Lib.isType('json', options.prop)) {
                        _Lib.each(options.prop, function(key, value) {
                            if (key !== 'selected') {
                                select[key] = value;
                            };
                        });
                    };

                    return select;
                },
                /*
                 * 在query字符串中请求参数的值
                 * - (key:string *) 下标名称
                 */
                getQuery : function(key) {
                    return _Coll.host.query[key];
                },
                // for fix IE8 with jQuery fadeIn/fadeOut/fadeTo
                resetTime : function(before, after) {
                    return _Lib.checkIE(8) ? after : before
                },
                /*
                 * 获取大于兄弟节点的style.zIndex值，并返回
                 * - (target:selector *) 目标节点
                 */
                getZIndex : function(target, parent) {
                    var $siblings = $(_Lib.getVisibles(target, parent)),
                        maxZIndex = 1;

                    $siblings.each(function(i, ele) {
                        var zIndex = parseInt($(ele).css('zIndex')),
                            zIndex = isNaN(zIndex) ? 0 : zIndex;

                            if (zIndex >= maxZIndex) {
                                maxZIndex = zIndex + 1;
                            };
                    });

                    return maxZIndex;
                },
                /*
                 * 得到可视化的节点
                 * - target(selector) 目标节点
                 * - parent(selector) 父级节点
                 */
                getVisibles : function(target, parent) {
                    var elems = [];

                    if (target) {
                        var $target = $(target),
                            target = $target[0];

                        if (parent) {
                            var $parent = $(parent);

                            while (target.parentNode && target.parentNode !== $parent[0]) {
                                target = target.parentNode;
                            };

                            $target = $(target);
                        };

                        $target.siblings().each(function(i, ele) {
                            var tag = ele.nodeName.toLowerCase();
                            if (ele !== target && (tag !== 'style' && tag !== 'script' && tag !== 'br')) {
                                elems.push(ele);
                            };
                        });
                    } else if (parent) {
                        var $parent = $(parent);

                        $parent.children().each(function(i, ele) {
                            var tag = ele.nodeName.toLowerCase();
                            if (ele !== target && (tag !== 'style' && tag !== 'script' && tag !== 'br')) {
                                elems.push(ele);
                            };
                        });
                    };

                    return elems;
                },
                /*
                 * 针对不同浏览器中的CSS3属性有私有名称，通过此方法返回浏览器中真正的CSS属性名，并以字符串/json的形式返回
                 * - prop(string/array *) 必填，验证的CSS3属性名
                 */
                getCSS3Name : function(prop) {
                    var prefixs = ['', 'webkit', 'Moz', 'o', 'ms'],
                        style = document.body.style,
                        getPropName = function(name) {
                            var styleName,
                                cssName;

                            for (var i = 0, length = prefixs.length; i < length; i++) {
                                if (i == 0) {
                                    styleName = cssName = name;
                                } else {
                                    styleName = prefixs[i] + name.substring(0, 1).toUpperCase() + name.substring(1);
                                    cssName = '-' + prefixs[i].toLowerCase() + '-' + name.toLowerCase()
                                };

                                if (styleName in style) {
                                    break;
                                } else {
                                    styleName = cssName = undefined;
                                };
                            };

                            return [styleName, cssName];
                        },
                        propName;

                    if (_Lib.isType('array', prop) && prop.length > 0) {
                        propName = {};
                        _Lib.each(prop, function(key, value) {
                            propName[value] = getPropName(value);
                        });
                    } else if (_Lib.isType('string', prop)) {
                        propName = getPropName(prop);
                    };

                    return propName;
                },
                inViewport : function(target, options) {
                    var options = _Lib.isType('json', options) ? options : {},
                        wrapper = options.wrapper || window,
                        threshold = options.threshold || 0,

                        $target = $(target),
                        targetOffset = $target.offset(),
                        targetLeft = targetOffset.left,
                        targetTop = targetOffset.top,
                        targetWidth = $target.width(),
                        targetHeight = $target.height();

                    if (wrapper !== window) {
                        var $wrapper = $(wrapper),
                            wrapOffset = $wrapper.offset(),
                            wrapLeft = wrapOffset.left,
                            wrapTop = wrapOffset.top,
                            wrapWidth = $wrapper.width(),
                            wrapHeight = $wrapper.height();
                    };

                    var belowTheFold = function() {
                            var fold;

                            if (wrapper === window) {
                                fold = (window.innerHeight ? window.innerHeight : _Coll.size.height) + _Coll.size.top;
                            } else {
                                fold = wrapTop + wrapHeight;
                            };

                            return fold < targetTop - threshold;
                        },
                        rightOfFold = function() {
                            var fold;

                            if (wrapper === window) {
                                fold = _Coll.size.width + _Coll.size.left;
                            } else {
                                fold = wrapLeft + wrapWidth;
                            };

                            return fold < targetLeft - threshold;
                        },
                        aboveTheTop = function() {
                            var fold;

                            if (wrapper === window) {
                                fold = _Coll.size.top;
                            } else {
                                fold = wrapTop;
                            };

                            return fold > targetTop + threshold  + targetHeight;
                        },
                        leftOfBegin = function() {
                            var fold;

                            if (wrapper === window) {
                                fold = _Coll.size.left;
                            } else {
                                fold = wrapLeft;
                            };

                            return fold > targetLeft + threshold + targetWidth;
                        };

                    return !leftOfBegin() && !aboveTheTop() && !rightOfFold() && !belowTheFold() && $target.is(':visible') && (wrapper === window || _Lib.inViewport(wrapper));
                }
            },
            _Ui = {
                /*
                 * 名称：toggleBlur
                 * 说明：切换一个模糊方式
                 * + options(json) 其它选项
                 *   - (target:selector *) 当前突出显示的对象
                 *   - (callback:function) 执行后的回调
                 *   - (id:number) 保存在blur对象中的ID，用以查找对应的数组对象
                 */
                toggleBlur : function(id, options) {
                    var options = _Lib.isType('json', options) ? options : {},
                        blurElem = _Coll.elem.blur;

                    // 如果为Trident(IE)内核则跳过
                    if (_Coll.info.browser.kernel !== 'Trident' && (_Coll.info.browser.name === 'Chrome' || _Coll.info.browser.name === 'Safari' || _Coll.info.browser.name === 'Firefox' || _Coll.info.browser.name === 'Opera')) {
                        if (options.target) {
                            if (!(id in blurElem)) {
                                blurElem[id] = [];
                            };

                            var $target = $(options.target),
                                target = $target[0],
                                siblings;

                            // 如果这个DOM被模糊，则先移除模糊
                            if ($target.hasClass('-filter-blur')) {
                                $target.removeClass('-filter-blur');
                            };

                            siblings = _Lib.getVisibles(target, options.parent || document.body);

                            _Lib.each(siblings, function(index, ele) {
                                var $ele = $(ele);

                                if (!($ele.hasClass('-filter-blur'))) {
                                    blurElem[id].push(ele);
                                    $ele.addClass('-filter-blur');
                                };
                                
                            });
                        } else {
                            _Lib.each(_Coll.elem.blur[id], function(i, ele) {
                                $(_Coll.elem.blur[id].shift()).removeClass('-filter-blur');
                            });
                        };
                    };
                    

                    if (_Lib.isType('function', options.callback)) {
                        options.callback();
                    };
                },
                /* 名称：keepFull
                 * 说明：特定情况下，IE6出现width:100%;height:100%时会失效，此为修复方式
                 * - target(selector *) 应用满屏的元素
                 * + options(json *) 参数
                 *   - (mode:x/y ['x']) 满屏的模式（横向满屏[x]/竖向满屏[y]/满屏[无]）
                 *   - (callback:function) 回调
                 */
                keepFull : function(target, options) {
                    var options = _Lib.isType('json', options) ? options : {},

                        $target = $(target).addClass('-full-layer'),
                        mode = _Lib.isType('string', options.mode) && (options.mode.toLowerCase() == 'x' || options.mode.toLowerCase() == 'y') ? options.mode.toLowerCase() : 'z',
                        callback = options.callback;

                    if (_Lib.checkIE(6)) {
                        if (mode === 'x') {
                            $target.css({
                                width : _Coll.size.width
                            });
                        } else if (mode === 'y') {
                            $target.css({
                                height : _Coll.size.height
                            });
                        } else {
                            $target.css({
                                width : _Coll.size.width,
                                height : _Coll.size.height
                            });
                        };
                        
                        if (mode === 'x') {
                            _Evt.onResize(function() {
                                $target.css({
                                    width : _Coll.size.width
                                });
                            });
                        } else if (mode === 'y') {
                            _Evt.onResize(function() {
                                $target.css({
                                    height : _Coll.size.height
                                });
                            });
                        } else {
                            _Evt.onResize(function() {
                                $target.css({
                                    width : _Coll.size.width,
                                    height : _Coll.size.height
                                });
                            });
                        };
                    } else {
                        if (mode === 'x') {
                            $target.css({
                                width : '100%'
                            });
                        } else if (mode === 'y') {
                            $target.css({
                                height : '100%'
                            });
                        } else {
                            $target.css({
                                width : '100%',
                                height : '100%'
                            });
                        };
                    }

                    if (_Lib.isType('function', callback)) {
                        callback();
                    };
                },
                /* 名称：listSplit
                 * 说明：对一个列表进行分割并放进一个盒子
                 * - (list:selector *) 列表元素
                 * - (number:number *) 循环单元个数
                 * - (wrapper:selector *) 包围的盒子
                 * + option(json) 选项
                 *   - (callback:function) 回调
                 */
                listSplit : function(list, number, wrapper, options) {
                    var options = _Lib.isType('json', options) ? options : {},

                        $list = $(list),
                        wrapper = $(wrapper).addClass('-list-split'),
                        bout = Math.ceil($list.size() / number),

                        callback = options.callback;

                    for (var i = 0; i < bout; i++) {
                        $list.slice(i * number, (i + 1) * number).wrapAll(wrapper);
                    };

                    if (_Lib.isType('function', callback)) {
                        callback();
                    };
                },
                /*
                 * 名称：hoverFade
                 * 说明：切换显示
                 * - control(selector *) 触发切换的盒子对象
                 * - content(selector *) 触发后显示的盒子对象
                 * + options(json) 参数
                 *   - (speed:millisecond [200]) 显示/隐藏的速度
                 *   - (onShow:function) 打开弹出层的回调
                 *   - (onHide:function) 关闭弹出层的回调
                 */
                hoverFade : function(control, content, options) {
                    var options = _Lib.isType('json', options) ? options : {},

                        $control = $(control).addClass('-hover-fade-control'),
                        $content = $(content).addClass('-hover-fade-content').css({display : 'none'}),
                        speed = _Lib.isType('number', options.speed) ? options.speed : 200,
                        onShow = options.onShow,
                        onHide = options.onHide;

                    $control.hover(function() {
                        $content.stop().fadeIn(speed, function() {
                            if (_Lib.isType('function', onShow)) {
                                onShow();
                            };
                        });
                    }, function(){
                        $content.stop().fadeOut(speed, function() {
                            if (_Lib.isType('function', onHide)) {
                                onHide();
                            };
                        });
                    });
                },
                /*
                 * 名称：pageScroll
                 * 说明：滚动至页面某处
                 * - offset(selector/number *) 滑动到达的位置
                 * + options(json) 选项
                 *   - (adjust:number) 微调，微调值为正负整数
                 *   - (speed:millisecond [1000]) 显示/隐藏的速度
                 *   - (easing:string (easing ['easeInOutQuart'])) 缓动效果
                 *   - (callback:function [top]) 回调，传值为滚动完成后的top位置
                 */
                pageScroll : function(offset, options) {
                    var options = _Lib.isType('json', options) ? options : {},

                        value = !isNaN(options.adjust) ? options.adjust : 0,
                        speed = _Lib.isType('number', options.speed) ? options.speed : 1000,
                        easing = _Lib.isType('string', options.easing) ? _Lib.getEasing(options.easing) : _Lib.getEasing('easeInOutQuart'),
                        callback = options.callback;

                    if (_Lib.isType('number', offset)) {
                        value += offset;
                    } else {
                        value += $(offset).offset().top;
                    };

                    _Coll.elem.$scroll.stop().animate({
                        scrollTop : value
                    }, speed, easing, function() {
                        if (_Lib.isType('function', callback)) {
                            callback(_Coll.size.top);
                        };
                    });
                },
                /*
                 * 为不同浏览器设置fixed定位方式
                 * - target(selector *) 要fixed定位的元素
                 * - absolute(boolean [false]) 在非IE6中使用是否强制使用absolute样式
                 */
                setFixed : function(target, absolute) {
                    var $target = $(target);
                    
                    if (_Lib.checkIE(6) || (!_Lib.checkIE(6) && absolute)) {
                        $target.css({position : 'absolute'});
                    } else {
                        $target.css({position : 'fixed'});
                    };

                    return $target;
                },
                /*
                 * 在元素中设置占位符
                 * - (target:selector *) 设置占位符的元素
                 * - (value:string *) 预设的占位符文字
                 */
                setPlaceholder : function(target, value) {
                    var target = $(target).get(0);

                    if (!target) return false;
                    if ('placeholder' in target) {
                        target.placeholder = value;
                    } else {
                        _Ui.focusInput(target, value);
                    };
                },
                /*
                 * 浏览器不支持input.placeholder属性的时候,在元素中设置占位符
                 * - (target:selector *) 设置占位符的元素
                 * - (value:number *) 预设的占位符文字
                 */
                focusInput : function(target, placeholder) {
                    var $target = $(target),
                        target = $target[0],
                        tagName = target.nodeName.toLowerCase(),
                        type = target.type.toLowerCase(),
                        isPassword = (tagName === 'input' && type === 'password');

                    if (isPassword) {
                        placeholder = '';
                    };

                    $target.val(placeholder).addClass('isNormal');

                    $target.on('focus', function() {
                        var $input = $(this),
                            value = $input.val();
                        
                        if (value === placeholder) {
                            $input.val('');
                        };

                        $input.addClass('onFocus');

                        if ($input.hasClass('isNormal')) {
                            $input.removeClass('isNormal');
                        } else if ($input.hasClass('isEmpty')) {
                            $input.removeClass('isEmpty');
                        };
                    });
                    
                    $target.on('blur', function() {
                        var $input = $(this),
                            value = $input.val();

                        if (!value || value === '' || value === placeholder) {
                            $input.val(placeholder).removeClass('onFocus').addClass('isEmpty');
                        } else {
                            $input.removeClass('onFocus');
                        };
                    });
                },
                /* ==================================================
                 * @constructor(*) 在元素中自动生成一个二维码[UI]
                 * + param(json *) 参数
                 *   - (wrapper:selector *) 包围元素
                 *   - (size:number *) 二维码尺寸
                 *   - (text:string *) 要生成的二维码文本
                 * ================================================== */
                insertQRcode : function(param) {
                    var $wrapper = $(param.wrapper).addClass('-insert-qrcode'),
                        text = _Lib.isType('string', param.text) ? param.text : '空',
                        size = _Lib.isType('number', param.size) ? param.size : 3,
                        apiurl = _Coll.api.QRcode.url + '?text='+ text +'&size=',
                        getQRCode = function(width, img) {
                            $.ajax({
                                url : apiurl + size / width,
                                type : 'GET',
                                dataType : 'jsonp',
                                success : function(url) {
                                    img.src = root + 'server/' + url;
                                    $wrapper.append(img);
                                }
                            });
                        };

                    $.ajax({
                        url : apiurl + 1,
                        type : 'GET',
                        dataType : 'jsonp',
                        success : function(url) {
                            var src = root + 'server/' + url,
                                tempImg = new Image(),
                                qrcode = new Image();

                            tempImg.src = src;

                            switch (tempImg.complete) {
                                case true :
                                    getQRCode(tempImg.width, qrcode);
                                    break;

                                case false :
                                    tempImg.onload = function() {
                                        getQRCode(tempImg.width, qrcode);
                                    };
                                    tempImg.src = src;
                                    break;
                            };
                        }
                    });
                },
                lazyLoad : function(target, lazyID) {
                    return new Big.ui.LazyLoad(target);
                }
            },
            _Ext = {},
            _Com = {},
            _Cache = {},
            _Coll = {
                /*
                 * 尺寸相关数据
                 */
                size : {},
                /*
                 * 系统相关信息
                 */
                host : _Util.getHostInfo(),
                info : {
                    address : {
                        province : undefined,
                        city : undefined,
                        address : undefined,
                        district : undefined,
                        point : {
                            x : undefined,
                            y : undefined
                        }
                    },
                    os : {},
                    browser : {}
                },
                /*
                 * 常用正则
                 */
                regex : {
                    uname : '^[\u4E00-\u9FA5\a-zA-Z]{2,15}$',
                    cell : '^(13[0-9]{9}|15[012356789][0-9]{8}|18[0-9][0-9]{8}|147[0-9]{8}|17[0678][0-9]{8})$',
                    tel : '^(0\\d{2,3})?(\\d{7,8})$',
                    phone : '^(13[0-9]{9}|15[012356789][0-9]{8}|18[0-9][0-9]{8}|147[0-9]{8}|17[0678][0-9]{8}|(0\\d{2,3})?(\\d{7,8}))$',
                    email : '^\\w+((-\\w+)|(\\.\\w+))*\\@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$',
                    hex : '^([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$',
                    date : '^\\d{4}-\\d{2}-\\d{2}$',
                    year : '^\\d{4}$',
                    integer : '^\\d+$',
                    chinese : '^[\\u4E00-\\u9FA5]+$'
                },
                /*
                 * 常用DOM对象
                 */
                elem : {
                    // $body : (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html,body'),
                    // $body : $('html'),
                    blur : {},
                    lazy : {}
                },
                config : {},
                api : {
                    BaiduMap : {
                        ak : 'AB01W4B6xtmWXpRkICT50rkh'
                    },
                    WeChat : {
                        qrurl : 'http://weixin.qq.com/r/'
                    },
                    QRcode : {
                        url : root +'server/qrcode/api.php'
                    }
                }
            },
            _Evt = {
                /*
                 * window 加载
                 */
                onLoad : function(handler) {
                    handler();
                },
                /*
                 * window 改变尺寸
                 */
                onResize : function(handler) {
                    $window.on('resize', function() {
                        handler();
                    });
                },
                /*
                 * window 滚动
                 */
                onScroll : function(handler) {
                    $window.on('scroll', function() {
                        handler();
                    });
                },
                /*
                 * window 改变
                 */
                onChange : function(handler) {
                    _Evt.onResize(handler);
                    _Evt.onScroll(handler);
                },
                /*
                 * bajs初始化
                 */
                onInit : function(options) {
                    var options = _Lib.isType('json', options) ? options : {};

                    _Coll.host = _Util.getHostInfo();
                    _Coll.info.os = _Util.getOSInfo();
                    _Coll.info.browser = _Util.getBrowserInfo();
                    _Coll.elem.$scroll = _Coll.info.browser.kernel === 'WebKit' ? $(document.body) : $('html');

                    _Util.getAddress({
                        ak : _Coll.api.BaiduMap.ak
                    }, function(data) {
                        if (data.status == 0) {
                            _Coll.info.address = {
                                address : data.content.address,
                                province : data.content.address_detail.province,
                                city : data.content.address_detail.city,
                                district : data.content.address_detail.district,
                                point : data.content.point
                            };
                        };
                    });

                    _Util.getScreenSize();
                    _Util.getScrollOffset();

                    _Evt.onLoad(function() {
                        _Evt.onChange(function() {
                            _Util.getScreenSize();
                            _Util.getScrollOffset();
                        });

                        // 修复刷新页面时window.scrollTop为0的bug
                        $(function() {
                            _Util.getScreenSize();
                            _Util.getScrollOffset();
                        });
                    });

                    _Util.updateConfig(options.config);

                    if (_Lib.isType('function', options.onReady)) {
                        options.onReady();
                    };

                    return {
                        version : {
                            major : '1.0 beta',
                            minor : '1.0.0',
                            build : '50814'
                        },
                        root : root,
                        coll : _Coll,
                        util : {
                            updateConfig : _Util.updateConfig,
                            getAddress : _Util.getAddress
                        },
                        evt : {
                            onResize : _Evt.onResize,
                            onScroll : _Evt.onScroll,
                            onChange : _Evt.onChange
                        },
                        ui : {
                            toggleBlur : _Ui.toggleBlur,
                            keepFull : _Ui.keepFull,
                            listSplit : _Ui.listSplit,
                            hoverFade : _Ui.hoverFade,
                            pageScroll : _Ui.pageScroll,
                            setFixed : _Ui.setFixed,
                            setPlaceholder : _Ui.setPlaceholder,
                            insertQRcode : _Ui.insertQRcode,
                            lazyLoad : _Ui.lazyLoad
                        },
                        com : _Com,
                        ext : _Ext,
                        cache : _Cache,
                        size : _Coll.size,
                        host : _Coll.host,
                        info : _Coll.info,
                        regex : _Coll.regex,
                        each : _Lib.each,
                        isType : _Lib.isType,
                        inObject : _Lib.inObject,
                        indexOf : _Lib.indexOf,
                        mergeJSON : _Lib.mergeJSON,
                        // HexToRGB : _Lib.HexToRGB,
                        // RGBToHex : _Lib.RGBToHex,
                        getRandom : _Lib.getRandom,
                        getRange : _Lib.getRange,
                        checkIE : _Lib.checkIE,
                        getSize : _Lib.getSize,
                        getFixed : _Lib.getFixed,
                        getEasing : _Lib.getEasing,
                        getSelecet : _Lib.getSelecet,
                        getQuery : _Lib.getQuery,
                        resetTime : _Lib.resetTime,
                        getZIndex : _Lib.getZIndex,
                        getVisibles : _Lib.getVisibles,
                        getCSS3Name : _Lib.getCSS3Name,
                        inViewport : _Lib.inViewport
                    };
                }
            };

            return plugin($, _Evt.onInit(opt));
        })(seajs.data.dir);

        return Big;
    };
});