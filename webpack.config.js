const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const parts = require('./webpack.parts');
const glob = require('glob');
var FlowBabelWebpackPlugin = require('flow-babel-webpack-plugin');


const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build'),
};

const commonConfig = merge([
  {
    // Entries have to resolve to files! They rely on Node
    // convention by default so if a directory contains *index.js*,
    // it resolves to that.
    entry: {
      app: PATHS.app + '/app.js',
    },
    output: {
      path: PATHS.build,
      filename: '[name].js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Webpack demo',
        filename: 'app.html',
        template: 'app/app.html',
      }),
      new FlowBabelWebpackPlugin(),
    ],
  },
  parts.loadJavaScript({ include: PATHS.app }),
  parts.lintJavaScript({ include: PATHS.app }),
  parts.lintCSS({ include: PATHS.app }),
]);

const productionConfig = merge([
  parts.generateSourceMaps({ type: 'source-map' }),
  parts.extractCSS({ use: 'css-loader' }),
  parts.purifyCSS({
    paths: glob.sync(`${PATHS.app}/**/*.js`, { nodir: true }),
  }),
]);

const developmentConfig = merge([
  {
    output: {
      devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
    },
  },
  parts.generateSourceMaps({ type: 'cheap-module-eval-source-map' }),
  parts.loadCSS(),
  parts.devServer({
    host: process.env.HOST,
    port: process.env.PORT,
  }),
]);

module.exports = (env) => {

  process.env.BABEL_ENV = env;

  if (env === 'production') {
    return merge(commonConfig, productionConfig);
  }

  return merge(commonConfig, developmentConfig);
};
