module.exports = {
  node: {
    crypto: true,
    http: true,
    https: true,
    os: true,
    vm: true,
    stream: true, 
    fs: 'empty', 
    net: 'empty',
    tls: 'empty', 
    child_process: 'empty'
  },
  externals: {
    '@trust/webcrypto': 'crypto',
    'text-encoding': 'TextEncoder',
  },
  /*
  plugins:[
    new webpack.IgnorePlugin(/\/iconv-loader$/)
  ]*/
}