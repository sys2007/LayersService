import request from 'request'
import common from '../config/'
// 加载编码转换模块  
import iconv from 'iconv-lite'
import later from 'later'
import fs from 'fs'
later.date.localTime()
let logger = require('./module/log4j').logger('app')

let currPage = 0
let currFlag = true

function getBody(page = 0) {
    let body = {
        "conditions": [
            {
                "cjt": "AND",
                "items": [
                    {
                        "field": "classCode",
                        "value": "OLT",
                        "operator": "EQ"
                    }
                ]
            }
        ],
        "needCount": true,
        "pageNum": page,
        "pageSize": 10000,
        "requiredFields": ["id", "name","serialNumber","ip","OLTModel","version","onState", "longitude", "latitude"]
    }
    return body
}

let sched = later.parse.recur().every(common.interval).hour(),
    t = later.setInterval(function () {
        intervalFun();
    }, sched);

let intervalFun = () => {
    download(common.outfile2)
}

let download = (savefile, callback) => {
    requestJson(savefile, currFlag)
}

function requestJson(savefile, flag) {
    let bodyString, options
    if (flag) {
        bodyString = getBody()
    } else {
        currPage++
        bodyString = getBody(currPage)
    }
    let url = 'http://' + common.host + common.path1
    request({
        url: url,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: bodyString
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            if (flag) {
                //文件头只写一次
                let head = '_=id:String,tempId:String,name:String,serialNumber:String,ip:String,OLTModel:String,version:String,location:Geometry:srid=4326\r\n'
                fs.writeFile(savefile, head, function (err) {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('写入成功');
                    }
                });
            }
            let result = body
            if (!result['empty']) {
                let dataList = result['dataList']
                let re
                for (let i = 0, len = dataList.length; i < len; i++) {
                    if (dataList[i]['longitude'] && dataList[i]['latitude'] && dataList[i]['longitude'] != '0.0' && dataList[i]['latitude'] != '0.0') {
                        if (parseFloat(dataList[i]['longitude']) > 100 && parseFloat(dataList[i]['latitude']) < 90) {
                            re = `olt.${new Date().getTime() + '' + i}=${dataList[i]['id']}|${dataList[i]['id']}|${dataList[i]['name']}|${dataList[i]['serialNumber']}|${dataList[i]['ip']}|${dataList[i]['OLTModel']}|${dataList[i]['version']}|${dataList[i]['onState']}|POINT(${dataList[i]['longitude']} ${dataList[i]['latitude']})\r\n`
                            fs.appendFile(savefile, iconv.encode(re, 'gbk'), function () {
                                // console.log('追加内容完成');
                            });
                        }

                    }

                }
                currFlag = false
                requestJson(savefile, currFlag)
            } else {
                currPage = 1
                currFlag = true
            }
        }
    });



}

