const path    = require('path');
const { webpack} = require('webpack');

module.exports = {

  target: 'electron',              // Ensure the output is compatible with web browsers
  mode: 'production',        // Set the mode to development for easier debugging
  resolve: {
    extensions: ['.mjs', '.js', '.jsx', '.json'],

    /**
     * 1. Polyfill only the Node-core modules your *frontend* really needs.
     * 2. Explicitly stub out anything that must *not* run in the browser.
     */
    fallback: {
      path:    require.resolve('path-browserify'),
      os:      require.resolve('os-browserify/browser'),
      events:  require.resolve('events/'),
      stream:  require.resolve('stream-browserify'),
      util:    require.resolve('util/'),
      process: require.resolve('process/browser'),
      buffer:  require.resolve('buffer/'),

      /* ❌ These APIs do not exist in the browser.
         Stubbing them as `false` prevents webpack from
         leaving a naked `require("fs")` in the output. */
      fs:      false,
      sqlite3: false,
      usb:     false,
      events:  false,
    },
  },

  plugins: [
    /**
     * Make `process` and `Buffer` magically available to every module that
     * expects the Node globals—just like webpack ≤ 4 used to do.
     */
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer:  ['buffer', 'Buffer'],
    }),
    new webpack.NormalModuleReplacementPlugin(/element-ui[\/\\]lib[\/\\]locale[\/\\]lang[\/\\]zh-CN/, 'element-ui/lib/locale/lang/en')

  ],
};
