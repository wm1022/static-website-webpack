const path = require("path")
const glob = require("glob")
const webpack = require('webpack')
const htmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'

const PAGES_PATH = path.resolve(__dirname, 's')

let entryFiles = glob.sync(PAGES_PATH + '/js/*/main.js')

let entries = {} // 入口文件
let template = [] // template模板

entryFiles.forEach((el, i) => {
  let name = el.split('\/').reverse()[1]
  let conf = {
    template: path.resolve(__dirname, `html/${name}.html`),
    filename: `${name}.html`,
    chunks: ['vender', 'common', name] // 必须设置此属性，不设置html会引入所有打包好的chunk
  }
  entries[name] = `./s/js/${name}/main.js`
  template.push(new htmlWebpackPlugin(conf))
})

const config = {
  entry: {
    ...entries
  },
  output: {
    filename: 'js/[name].js',
    path: __dirname + '/dist',
    publicPath: isDev ? '/' : 'http://s.vpea.ca/pc/4.0/'
  },
  // devServer: {
  //   contentBase: './dist'
  // },
  module: {
    rules: [
      // 用于解决html img打包问题
      {
        test: /\.html$/,
        loader: 'html-withimg-loader'
      },
      {
        test: /\.css$/,
        use: [
          { loader: isDev ? 'style-loader' : MiniCssExtractPlugin.loader}, // 只在生产环境使用MiniCssExtractPlugin， 因为这个插件会导致hmr功能缺失
          { loader: "css-loader" },
          { loader: 'postcss-loader', options: {
            plugins: (loader) => [
              require('autoprefixer')({
                browsers: ['last 15 versions']
              })
            ]
        } }
        ]
      },
      {
        test: /\.less$/,
        use: [
          { loader: isDev ? 'style-loader' : MiniCssExtractPlugin.loader},
          { loader: "css-loader" },
          { loader: 'postcss-loader',options: {
            plugins: (loader) => [
              require('autoprefixer')({
                browsers: ['last 15 versions']
              })
            ]
          }},
          { loader: "less-loader" } // less-loader只负责将less代码转化为css代码
        ]
      },
      {
        test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
        use: [
          /* config.module.rule('images').use('url-loader') */
          {
            loader: 'url-loader',
            options: {
              limit: 200,
              fallback: {
                loader: 'file-loader',
                options: {
                  esModule: false,
                  name: 'img/[name].[hash:8].[ext]'
                }
              }
            }
          }
        ]
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: "all", // 所有chunks都被打包,
      minSize: 30000,
      minChunks: 2,
      // name: 'common',
      cacheGroups: {
        venders: {
          name: 'vender',
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          name: 'common',
          test: /.+(.js)$/, // 不处理css
          priority: -20
        }
      } 
    }
  },
  plugins: [
    // 设置环境变量
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: isDev ? '"development"' : '"production"'
      }
    }),
    ...template,
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // all options are optional
      filename: 'css/[name].[chunkhash].css',
      chunkFilename: '[name].[chunkhash].css',
      ignoreOrder: false, // Enable to remove warnings about conflicting order
    }),
    new OptimizeCssAssetsPlugin(),
    // 全局注入jquery
    new webpack.ProvidePlugin({
      $: 'jquery'
    }),
    // 打包清理dist
    new CleanWebpackPlugin()
  ]
}

module.exports = config