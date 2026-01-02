const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    // Use production version with real chat tracking
    content: './src/content/content-production.ts',
    background: './src/background/background.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'public', to: '.', noErrorOnMissing: true },
        {
          from: 'src/content/sidebar.html',
          to: 'sidebar.html',
          noErrorOnMissing: true
        },
      ],
    }),
  ],
  devtool: 'inline-source-map',
};
