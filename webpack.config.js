module.exports = {
    entry: './dist/index.js',
    output: {
      path: __dirname + '/dist',
      filename: 'leaflet-lasso.min.js'
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              declaration: false
            }
          }
        }
      ]
    },
    externals: {
      leaflet: 'L'
    }
  };