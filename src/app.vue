<template>
  <div id="app">
    <router-view class="router" :class="{'full':$route.path=='/login'||$route.path=='/'}" />
    <side v-if="$route.path!='/login'&&$route.path!='/'"></side>
    <el-backtop target="body"></el-backtop>
  </div>
</template>

<script>
import side from "./components/side.vue";
export default {
  name: "app",
  components: {
    side
  },
  created() {
    window.bus.$on("kick", () => {
      // this.$message.success("您的账号已被他人登陆");
      this.$router.push({
        path: "/"
      });
    });
  }
};
</script>

<style lang="less">
@import "./styles/icon.less";
@import "./styles/config.less";
html,
body {
  margin: 0;
  height: 100%;
  background-color: #f0f4f7;
  font: normal 14px/1.4 -apple-system, BlinkMacSystemFont, Helvetica Neue,
    PingFang SC, Lantinghei SC, Helvetica Neue, Helvetica, Arial, "Segoe UI",
    "Microsoft YaHei UI", "Microsoft YaHei", "Source Han Sans CN",
    STHeitiSC-Light, simsun, WenQuanYi Zen Hei, WenQuanYi Micro Hei,
    "sans-serif";
}
#app {
  height: 100%;
  .router {
    margin-left: 220px;
    padding: 20px;
    &.full {
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: hidden;
    }
  }
}
.layout {
  margin: auto;
}
.box {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 20px;
  word-break: break-all;
  &.zero {
    padding: 0;
  }
  h3 {
    margin: 0 0 10px 0;
    font-size: 1.2rem;
    color: @text;
  }
  header {
    background-color: #fbfbfb;
    border-radius: 8px 8px 0 0;
    padding: 20px;
    .el-form-item {
      margin-bottom: 0px;
    }
  }
  footer {
    background-color: #fbfbfb;
    border-radius: 0 0 8px 8px;
    padding: 20px;
  }
}
.important {
  position: relative;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  line-height: 1.5;
  word-break: break-all;
  &.warn {
    color: #856404;
    background-color: #fff3cd;
    border-color: #ffeeba;
  }
}
</style>
