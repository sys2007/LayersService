/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _request = __webpack_require__(2);

var _request2 = _interopRequireDefault(_request);

var _config = __webpack_require__(3);

var _config2 = _interopRequireDefault(_config);

var _iconvLite = __webpack_require__(4);

var _iconvLite2 = _interopRequireDefault(_iconvLite);

var _later = __webpack_require__(5);

var _later2 = _interopRequireDefault(_later);

var _fs = __webpack_require__(6);

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_later2.default.date.localTime();
// 加载编码转换模块  

var logger = __webpack_require__(7).logger('app');

var currPage = 0;
var currFlag = true;
function getOptions(headers) {
    var options = {
        host: _config2.default.host,
        port: _config2.default.port,
        path: _config2.default.path1,
        method: 'POST',
        headers: headers
    };
    return options;
}

function getHeaders(bodyString) {
    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyString)
    };
    return headers;
}

function getBody() {
    var page = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    var body = {
        "conditions": [{
            "cjt": "AND",
            "items": [{
                "field": "classCode",
                "value": "ONU",
                "operator": "EQ"
            }]
        }],
        "needCount": true,
        "pageNum": page,
        "pageSize": 10000,
        "requiredFields": ["id", "ponid", "name", "serialNumber", "ONUType", "mac", "oltid", "longitude", "latitude"]
    };
    return body;
}

var sched = _later2.default.parse.recur().every(_config2.default.interval).hour(),
    t = _later2.default.setInterval(function () {
    intervalFun();
}, sched);

var intervalFun = function intervalFun() {
    download(_config2.default.outfile3);
};

var download = function download(savefile, callback) {
    requestJson(savefile, currFlag);
};

function requestJson(savefile, flag) {
    var bodyString = void 0,
        options = void 0;
    if (flag) {
        bodyString = getBody();
    } else {
        currPage++;
        bodyString = getBody(currPage);
    }
    var url = 'http://' + _config2.default.host + _config2.default.path1;
    (0, _request2.default)({
        url: url,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json"
        },
        body: bodyString
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            if (flag) {
                //文件头只写一次
                var head = '_=id:String,tempId:String,name:String,serialNumber:String,oltid:String,ONUType:String,mac:String,onState:String,location:Geometry:srid=4326\r\n';
                _fs2.default.writeFile(savefile, head, function (err) {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('写入成功');
                    }
                });
            }
            var result = body;
            if (!result['empty']) {
                var dataList = result['dataList'];
                var re = void 0;
                for (var i = 0, len = dataList.length; i < len; i++) {
                    if (dataList[i]['longitude'] && dataList[i]['latitude'] && dataList[i]['longitude'] != '0' && dataList[i]['latitude'] != '0') {
                        if (parseFloat(dataList[i]['longitude']) > 100 && parseFloat(dataList[i]['latitude']) < 90) {
                            re = 'stations.' + (new Date().getTime() + '' + i) + '=' + dataList[i]['id'] + '|' + dataList[i]['id'] + '|' + dataList[i]['name'] + '|' + dataList[i]['serialNumber'] + '|' + dataList[i]['oltid'] + '|' + dataList[i]['ONUType'] + '|' + dataList[i]['mac'] + '|' + dataList[i]['onState'] + '|POINT(' + dataList[i]['longitude'] + ' ' + dataList[i]['latitude'] + ')\r\n';
                            _fs2.default.appendFile(savefile, _iconvLite2.default.encode(re, 'gbk'), function () {
                                // console.log('追加内容完成');
                            });
                        }
                    }
                }
                currFlag = false;
                requestJson(savefile, currFlag);
            } else {
                currPage = 1;
                currFlag = true;
            }
        }
    });
}

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("request");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    host: '13.81.21.1',
    port: 80,
    path1: '/store/openapi/v2/resources/query?apikey=e10adc3949ba59abbe56e057f2gg88dd',
    interval: 1, //小时
    outfile: 'D:/geoserver-2.11.2-hd/data_dir/user_projections/c1.properties',
    outfile2: 'D:/geoserver-2.11.2-hd/data_dir/user_projections/c2.properties',
    outfile3: 'D:/geoserver-2.11.2-hd/data_dir/user_projections/c3.properties'
};

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("iconv-lite");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("later");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _log4js = __webpack_require__(8);

var _log4js2 = _interopRequireDefault(_log4js);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_log4js2.default.configure({
    appenders: {
        out: { type: 'console' },
        app: {
            type: 'file',
            filename: 'logs/access.log',
            maxLogSize: 10240,
            backups: 4,
            category: 'debug'
        }
    },

    categories: {
        default: { appenders: ['out', 'app'], level: 'debug' }
    },
    replaceConsole: true
});

exports.logger = function (name) {
    var logger = _log4js2.default.getLogger(name);
    // logger.setLevel('INFO')
    logger.level = 'debug';
    return logger;
};

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("log4js");

/***/ })
/******/ ]);