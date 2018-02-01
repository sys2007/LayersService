import fs from 'fs'
let logger = require('./log4j').logger('writeLayer')
const writeLineStream = require('lei-stream').writeLine

let writeStream = (savefile) => {
    // writeLineStream第一个参数为WriteStream实例，也可以为文件名
    const stream = writeLineStream(fs.createWriteStream(savefile), {
        // 换行符，默认\n
        newline: '\n',
        // 编码器，可以为函数或字符串（内置编码器：json，base64），默认null
        // encoding: function (data) {
        //   return JSON.stringify(data);
        // },
        // 缓存的行数，默认为0（表示不缓存），此选项主要用于优化写文件性能，写入的内容会先存储到缓存中，当内容超过指定数量时再一次性写入到流中，可以提高写速度
        cacheLines: 10
    })
    return stream
    // fs.writeFile(common.outfile, resultBuffer, (err) => {
    //     if (err) {
    //         logger.error(err.message)
    //         throw err
    //     }
    //     logger.info('write JSON into File')
    // })
}



export default writeStream
