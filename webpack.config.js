module.exports = {
   output: {
      path: __dirname
   },
  module: {
    loaders: [
      { test: require.resolve("./index"), loader: 'expose?Lexer' },
    ]
  },
};