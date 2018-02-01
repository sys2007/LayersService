import http from 'http'
import common from '../config/'
import querystring from 'querystring'
// 加载编码转换模块  
import iconv from 'iconv-lite'
import later from 'later'
import fs from 'fs'
later.date.localTime()
let logger = require('./module/log4j').logger('app')

let currPage = 0
let currFlag = true
function getOptions(headers) {
    let options = {
        host: common.host,
        port: common.port,
        path: common.path1,
        method: 'POST',
        headers: headers
    }
    return options
}

function getHeaders(bodyString) {
    let headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyString)
    }
    return headers
}

function getBody(page = 0) {
    let body = {
        "conditions": [
            {
                "cjt": "AND",
                "items": [
                    {
                        "field": "classCode",
                        "value": "Camera",
                        "operator": "EQ"
                    }
                ]
            }
        ],
        "needCount": true,
        "pageNum": page,
        "pageSize": 1000,
        "requiredFields": ["id", "name", "platformId", "Tags", "civilCode", "longitude", "latitude"]
    }
    return querystring.stringify(body)
}

let sched = later.parse.recur().every(common.interval).second(),
    t = later.setInterval(function () {
        intervalFun();
    }, sched);

let intervalFun = () => {
    download(common.outfile)
}

let download = (savefile, callback) => {
    requestJson(savefile,currFlag)
}

function requestJson(savefile,flag) {
    let bodyString,options
    if(flag){
        bodyString = getBody()
    }else{
        currPage++
        bodyString = getBody(currPage)
    }
    let _headers = getHeaders(bodyString)
    console.log(_headers)
    let _options = getOptions(_headers)
    console.log(_options)
    options = getOptions(getHeaders(bodyString))
    console.log(options)
    let req = http.request(JSON.stringify(options), (res) => {
        res.setEncoding('utf-8');
        logger.info('STATUS:' + res.statusCode)
        logger.info('HEADERS:' + JSON.stringify(res.headers))

        if (flag) {
            //文件头只写一次
            let head = '_=id:String,name:String,platformId:String,Tags:String,ssqy:String,sspt:String,location:Geometry:srid=4326\r\n'
            fs.writeFile(savefile, head, function (err) {
                if (err) {
                    console.error(err);
                } else {
                    console.log('写入成功');
                }
            });
        }

        res.on('data', (data) => {
            let result = JSON.parse(data);
            console.log(data)
            if (result['empty']) {
                let dataList = result['dataList']
                let re
                for (let i = 0, len = dataList.length; i < len; i++) {
                    re = `stations.${new Date().getTime() + '' + i}=${dataList['id']}|${dataList['name']}|${dataList['platformId']}|${dataList['Tags']}|${dataList['civilCode']}|${dataList['platformId']}|POINT(${dataList['longitude']} ${dataList['latitude']})\r\n`
                    fs.appendFile(savefile, iconv.encode(re, 'gbk'), function () {
                        console.log('追加内容完成');
                    });

                }
                currFlag = false
                // requestJson(currFlag)
            }else {
                currPage = 1
                currFlag = true
            }
        })
        req.on('error', (e) => {
            logger.error('problem with request:' + e.message)
        })
        res.on('end', function () { 
            //这里接收的参数是字符串形式,需要格式化成json格式使用
            // let resultObject = JSON.parse(responseString);
            // console.log('-----resBody-----', resultObject);
        });
        req.write(bodyString);
        req.end();
    })
}

