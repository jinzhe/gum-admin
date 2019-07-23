/* eslint-disable */
module.exports = {
	publicPath: '',
	assetsDir: 'static',
	productionSourceMap: false,
	css: {
		sourceMap: false
	},
	// webpack-dev-server 相关配置
	devServer: {
		open: process.platform === 'darwin',
		host: '0.0.0.0'
	}
};
