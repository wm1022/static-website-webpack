# static-website-webpack

###### 这是一套用webpack搭建，用于打包静态资源的项目。
###### 之前静态网站的项目打包一直使用require.js，它只能打包js，且无法实现公共代码提取等功能
###### 相比于requireJs, webpack 具有更方便的分包功能，能打包js, css，通过配置loader能将较小图片处理为base64。以及其强大的插件系统，可以实现热更新（devsever），css打包(mini-css-extract-plugin)，css自动添加前缀（postcss）,支持es6写法（babel转码）
###### 这个项目搭建了一套完整的开发及打包体系，能自动化生成打包入口及模板，不必每增加一个页面就添加一次entry，配置html-loader能模块化引入html文件，postcss自动添加css前缀，url-loader将limit内的图片转为base64,splitchunks对代码进行自定义分包，webpack.DefinePlugin设置环境变量，MiniCssExtractPlugin分离css,webpack.ProvidePlugin全局注入依赖jquery库， CleanWebpackPlugin打包时清理dist

## 安裝
#### npm install
## 运行
#### npm run dev
## 打包
#### npm run build
