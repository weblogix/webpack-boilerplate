const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');

exports.generateSourceMaps = ({ type }) => ({
  devtool: type,
});

exports.devServer = ({ host, port } = {}) => ({
  devServer: {
    contentBase: "./app",
    historyApiFallback: true,
    host, // Defaults to `localhost`
    port, // Defaults to 8080
    hotOnly: true,
    overlay: {
      errors: true,
      warnings: true,
    },
  },
  plugins: [
    // Enable the plugin to let webpack communicate changes
    // to WDS. --hot sets this automatically!
    new webpack.HotModuleReplacementPlugin(),
  ],
});

exports.postCSS = () => ({
  loader: 'postcss-loader',
  options: {
    plugins: () => ([
      require('postcss-cssnext')(),
    ]),
  },
});

exports.lintJavaScript = ({ include, exclude, options }) => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        include,
        exclude,
        enforce: 'pre',

        loader: 'eslint-loader',
        options,
      },
    ],
  },
});

exports.loadJavaScript = ({ include, exclude }) => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        include,
        exclude,

        loader: 'babel-loader',
        options: {
          // Enable caching for improved performance during
          // development.
          // It uses default OS directory by default. If you need
          // something more custom, pass a path to it.
          // I.e., { cacheDirectory: '<path>' }
          cacheDirectory: true,
        },
      },
    ],
  },
});

exports.lintCSS = ({ include, exclude }) => ({
  module: {
    rules: [
      {
        test: /\.css$/,
        include,
        exclude,
        enforce: 'pre',
        loader: 'postcss-loader',
        options: {
          plugins: () => ([
            require('stylelint')(),
          ]),
        },
      },
    ],
  },
});

exports.loadCSS = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.css$/,
        include,
        exclude,
        use: [
          'style-loader',
          'css-loader',
          exports.postCSS()
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
          exports.postCSS()
        ],
      },
    ],
  },
});

exports.loadPUG = () => ({
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: 'pug-loader',
      },
    ]
  }
});

exports.extractCSS = ({ include, exclude, use }) => {
  // Output extracted CSS to a file
  const plugin = new ExtractTextPlugin({
    filename: '[name].css',
  });

  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          include,
          exclude,
          use: plugin.extract([ 'css-loader', exports.postCSS()]),
        },
        {
          test: /\.(scss|sass)$/,
          include,
          exclude,
          use: plugin.extract([ 'css-loader', 'sass-loader', exports.postCSS()]),
        },
      ],
    },
    plugins: [ plugin ],
  };
};

exports.purifyCSS = ({ paths }) => ({
  plugins: [
    // new PurifyCSSPlugin({ paths }),
    new PurifyCSSPlugin({
      paths,
      purifyOptions: {
        minify: true,
      },
    }),
  ],
});

