const webpack = require('webpack');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = (async () => {
  return {
    entry: slsw.lib.entries,
    target: 'node',
    devtool: 'source-map',
    externals: [nodeExternals()],
    mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
    performance: {
      hints: false, // Turn off size warnings for entry points
    },
    stats: 'minimal', // https://github.com/serverless-heaven/serverless-webpack#stats
    plugins: [
      new webpack.DefinePlugin({
        AWS_ACCOUNT_ID: slsw.lib.webpack.isLocal ? 
          'LocalStub' :
          await slsw.lib.serverless.providers.aws.getAccountId()
      }),
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          use: ['babel-loader'],
          include: __dirname,
          exclude: /node_modules/,
        },
        {
          test: /\.tsx?$/,
          use: 'babel-loader',
          include: __dirname,
          exclude: /node_modules/,
        }
      ],
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    }
  };
})();
