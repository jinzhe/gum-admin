<template>
  <div>
    <div class="layout" v-if="first">
      <div class="box" v-loading="first" style="height:500px"></div>
    </div>
    <div class="box" v-if="!first" v-loading="loading">
      <h3>服务器基本信息</h3>
      <div class="info">
        <el-row>
          <el-col :span="4">服务器域名</el-col>
          <el-col :span="20">
            <el-link type="primary" :href="domain" target="_blank">{{info.domain}}</el-link>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="4">服务器时间</el-col>
          <el-col :span="20">{{info.time}}</el-col>
        </el-row>

        <el-row>
          <el-col :span="4">服务器引擎</el-col>
          <el-col :span="20">{{info.software}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="4">服务器系统</el-col>
          <el-col :span="20">{{info.os}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="4">PHP版本</el-col>
          <el-col :span="20">
            <el-link type="primary" href="https://php.net" target="_blank">{{info.php_version}}</el-link>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="4">PHP 运行方式</el-col>
          <el-col :span="20">{{info.run_mode}}</el-col>
        </el-row>

        <el-row>
          <el-col :span="4">MySQL 版本</el-col>
          <el-col :span="20">{{info.mysql_version}}</el-col>
        </el-row>

        <el-row>
          <el-col :span="4">最大上传</el-col>
          <el-col :span="20">{{info.upload_max_filesize}}</el-col>
        </el-row>

        <el-row>
          <el-col :span="4">最大POST提交</el-col>
          <el-col :span="20">{{info.post_max_size}}</el-col>
        </el-row>

        <el-row>
          <el-col :span="4">硬盘可用空间</el-col>
          <el-col :span="20">{{info.disk_free_space}}</el-col>
        </el-row>

        <el-row>
          <el-col :span="4">脚本超时时间</el-col>
          <el-col :span="20">{{info.max_execution_time}}</el-col>
        </el-row>

        <el-row>
          <el-col :span="4">网站根目录</el-col>
          <el-col :span="20">{{info.document_root}}</el-col>
        </el-row>

        <el-row>
          <el-col :span="4">网站默认主题</el-col>
          <el-col :span="20">
            <el-link type="success" title="点击切换主题" @click="dialog.show=true">{{info.theme_dir}}</el-link>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="4">网站程序版本</el-col>
          <el-col :span="20">
            <el-link
              title="获取最新版本"
              type="danger"
              href="https://github.com/jinzhe/gum"
              target="_blank"
            >{{info.version}}</el-link>
          </el-col>
        </el-row>

        <el-row v-if="version!=''">
          <el-col :span="4">最新程序版本</el-col>
          <el-col :span="20">
            <el-link
              title="获取最新版本"
              type="warning"
              href="https://github.com/jinzhe/gum"
              target="_blank"
            >{{version}}</el-link>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="box" v-if="info.disable_functions!=''" v-loading="loading">
      <h3>被禁用的PHP函数</h3>
      <div class="info">{{info.disable_functions}}</div>
    </div>
    <div class="box" v-if="info.extensions" v-loading="loading">
      <h3>支持的PHP扩展模块</h3>
      <div class="info">{{info.extensions.join(",")}}</div>
    </div>

    <el-dialog title="默认主题" :visible.sync="dialog.show" width="50%" v-loading="dialog.loading">
      <el-button
        v-for="dir in info.theme_dirs"
        :key="dir"
        :class="{'el-button--primary':dir==info.theme_dir}"
        @click.native="setTheme(dir)"
      >{{dir}}</el-button>
      <br />
      <br />
      <div class="important warn">
        <strong>说明</strong>
        <br />切换后会自动将主题配置文件中的config全局设置变量导入到数据库中，如果数据库中已经存在则不会导入。
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "dashboard",
  data() {
    return {
      domain: localStorage.server,
      first: true,
      loading: false,
      dialog: {
        show: false,
        loading: false
      },
      version: "",
      info: {}
    };
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(_ => {
        window.bus.$emit("nav", "dashboard");
      }, 100);
      this.getData();
      this.getVersion();
    });
  },
  methods: {
    // 获取数据
    async getData() {
      this.loading = true;

      let params = {
        token: localStorage.token,
        class: "dashboard",
        method: "info"
      };

      let response = await this.$http.get("/api.php", { params });

      let data = await response.data;
      if (data.code == 200) {
        this.info = data.result;
        this.loading = false;
        this.first = false;
      } else {
        this.$message.error(data.code);
      }
    },
    // 获取最新版本数据
    async getVersion() {
      let params = {
        class: "dashboard",
        method: "version"
      };
      let response = await this.$http.get(
        "https://zee.kim/api.php?class=dashboard&method=version"
      );
      let data = await response.data;
      if (data.code == 200) {
        this.version = data.version;
      }
    },
    async setTheme(dir) {
      this.dialog.loading = true;

      let params = {
        token: localStorage.token,
        class: "dashboard",
        method: "theme",
        dir: dir
      };

      let response = await this.$http.get("/api.php", { params });

      let data = await response.data;
      if (data.code == 200) {
        this.getData();
        this.dialog.show = false;
        this.dialog.loading = false;
      } else {
        this.$message.error(data.code);
      }
    }
  }
};
</script>

<style scoped lang="less">
@import "../styles/config.less";
.info {
  font-size: 14px;
  line-height: 1.8;
}
</style>
