/* eslint-disable */
import vue from 'vue';
import app from './app.vue';
import router from './router';
import qs from 'qs';
// UI 框架
import element from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
vue.use(element);

// 支持移动设备点击
import fastclick from 'fastclick';
fastclick.prototype.focus = function(target) {
	var length;
	if (/ios/g.test(window.navigator.userAgent.toLowerCase()) && target.setSelectionRange && target.type.indexOf('date') !== 0 && target.type !== 'time' && target.type !== 'month') {
		length = target.value.length;
		target.focus();
		target.setSelectionRange(length, length);
	} else {
		target.focus();
	}
};

import axios from 'axios';
if (window.localStorage.server) {
	axios.defaults.baseURL = window.localStorage.server;
}
axios.defaults.timeout = 60000; //超时
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
// 拦截器
axios.interceptors.response.use(
	(response) => {
		if (response.data.code == 403) {
			window.localStorage.removeItem('token');
			window.bus.$emit('kick');
			return;
		}
		return response;
	},
	(error) => {
		window.bus.$emit('kick');
		return Promise.reject(error);
	}
);
vue.prototype.$http = axios;

vue.config.productionTip = false;

window.bus = new vue();

// 进入路由页面前检查是否过期
router.afterEach((to, from) => {
	if (localStorage.token) {
		axios
			.post(
				'/api.php',
				qs.stringify({
					class: 'dashboard',
					method: 'noop',
					token: localStorage.token
				})
			)
			.then(function(response) {
				if (response) {
					// console.log(response);
					if (response.data.code != 200) {
						router.push({
							path: '/'
						});
					}
				}
			});
	} else {
		router.push({
			path: '/'
		});
	}
});

new vue({
	router,
	render: (h) => h(app)
}).$mount('#app');

Date.prototype.format = function(fmt) {
	var month = [ '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月' ];
	var week = [ '\u0053\u0075\u006e', '\u004d\u006f\u006e', '\u0054\u0075\u0065', '\u0057\u0065\u0064', '\u0054\u0068\u0075', '\u0046\u0072\u0069', '\u0053\u0061\u0074' ];
	var options = {
		'y+': this.getFullYear(),
		'm+': this.getMonth() + 1, //月份
		'd+': this.getDate(), //日
		'h+': this.getHours(), //小时
		'i+': this.getMinutes(), //分
		's+': this.getSeconds(), //秒
		'q+': Math.floor((this.getMonth() + 3) / 3), //季度
		n: this.getMilliseconds(), //毫秒
		M: month[this.getMonth()], //月
		W: week[this.getDay()] //星期
	};
	for (var k in options) {
		if (new RegExp('(' + k + ')').test(fmt)) {
			if (k == 'y+') {
				fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
			} else {
				fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? options[k] : ('00' + options[k]).substr(('' + options[k]).length));
			}
		}
	}
	return fmt;
};
