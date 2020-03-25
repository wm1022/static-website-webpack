# static-website-webpack

这是一套用webpack搭建，用于打包静态资源的项目。
之前静态网站的项目打包一直使用require.js，它只能打包js，且无法实现公共代码提取等功能
相比于requireJs, webpack 具有更方便的分包功能，能打包js, css，通过配置loader能将较小图片处理为base64。以及其强大的插件系统，可以实现热更新（devsever），css打包(mini-css-extract-plugin)，css自动添加前缀（postcss）,支持es6写法（babel转码）
