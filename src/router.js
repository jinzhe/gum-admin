/* eslint-disable */
import vue from 'vue';
import router from 'vue-router';
import dashboard from './views/dashboard.vue';
import login from './views/login.vue';
import notFound from './views/404.vue';
import post from './views/post.vue';
import postForm from './views/post-form.vue';
import user from './views/user.vue';
import tag from './views/tag.vue';
import link from './views/link.vue';
import backup from './views/backup.vue';

vue.use(router);

export default new router({
	routes: [ { path: '*', component: notFound }, { path: '/', component: login }, { path: '/dashboard', component: dashboard }, { path: '/post', component: post }, { path: '/post-form', component: postForm }, { path: '/user', component: user }, { path: '/tag', component: tag }, { path: '/link', component: link }, { path: '/backup', component: backup } ]
});
