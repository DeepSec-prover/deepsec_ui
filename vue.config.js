const { defineConfig } = require('@vue/cli-service');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  
  configureWebpack: {
    plugins: [ new NodePolyfillPlugin() ],
    resolve: {
      fallback: {
        path: require.resolve('path-browserify'),
        querystring: require.resolve('querystring-es3'),
        os: require.resolve('os-browserify/browser'),
        stream: require.resolve('stream-http'),
        http: require.resolve('http-browserify'),
        https: require.resolve('https-browserify'),
      },
    },
    externals: {
      fs: 'commonjs2 fs', // Exclude fs from bundling
      sqlite3: 'commonjs sqlite3', // Exclude sqlite3 from bundling
      usb: 'commonjs usb', // Exclude usb from bundling
      // 'electron-log': 'commonjs2 electron-log'
    },
    module:  {
      rules: [
        // NEW: make webpack copy fonts into dist_electron/fonts
        {
          test: /\.(woff2?|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {               // keep all fonts together
            filename: 'fonts/[name].[hash:8][ext]'
          }
        }
      ]
    }
  },
  pluginOptions: {
    electronBuilder: {
      externals: ['usb', 'sqlite3'], // Ensure usb is excluded for Electron
      nodeIntegration: true, // Disable Node.js integration in renderer process
      contextIsolation: false,    
      extraResources: [
         "./node_modules/**",
         "./node_modules/element-ui/lib/theme-chalk/**",
         { "from": "public/icons", "to": "icons" }
    ]
    },
  },
});