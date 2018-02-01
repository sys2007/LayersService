import webpack from 'webpack';
import fs from 'fs';
import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';

let nodeModules = {};
fs.readdirSync('node_modules')
    .filter((x) => {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach((mod) => {
        nodeModules[mod] = 'commonjs ' + mod;
    });

export default {
    cache: true,
    entry: [
        './src/app3.js'
    ],
    output: {
        path: path.resolve(__dirname, 'build3'),
        filename: 'bundle3.js',
        publicPath: '/'
    },
    context: __dirname,
    node: {
        __filename: false,
        __dirname: false
    },
    target: 'node',
    externals: nodeModules,
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: [
                path.resolve(__dirname, "node_modules"),
            ],
            query: {
                plugins: ['transform-runtime'],
                presets: ['es2015', 'stage-0'],
            }
        }, {
            test: /\.json$/,
            loader: 'json-loader'
        }]
    },
    plugins: [
        // 复制静态资源,将static文件内的内容复制到指定文件夹
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, 'config'),
            to: 'config3',
            ignore: ['.*']  //忽视.*文件
        }, {
            from: './processes3.json',
            to: './'
        }])
    ],
    resolve: {
        extensions: ['.js', '.json']
    }
}