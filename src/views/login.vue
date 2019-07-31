<template>
  <div class="login">
    <el-form class="login-form">
      <header>管理登录</header>
      <main>
        <el-form-item>
          <el-input
            prefix-icon="icon-server"
            v-model="server"
            placeholder="服务器"
            @keydown.enter.native="login"
            autocomplete="off"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-input
            prefix-icon="icon-head"
            v-model="account"
            placeholder="账号"
            @keydown.enter.native="login"
            autocomplete="off"
            maxlength="20"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-input
            prefix-icon="icon-lock"
            v-model="password"
            autocomplete="off"
            @keydown.enter.native="login"
            placeholder="密码"
            type="password"
            maxlength="20"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login" :loading="loading" style="width:100%">立即登录</el-button>
        </el-form-item>
      </main>
    </el-form>
  </div>
</template>

<script>
import qs from "qs";

export default {
  name: "login",
  data() {
    return {
      loading: false,
      server: "",
      account: "",
      password: ""
    };
  },
  mounted() {
    if (window.localStorage.server) {
      this.server = window.localStorage.server;
    } else {
      this.server = window.location.protocol + "//" + window.location.host;
    }
  },
  methods: {
    async login() {
      if (this.account == "") {
        this.$message.error("账号不能为空");
        return;
      }
      if (this.password == "") {
        this.$message.error("密码不能为空");
        return;
      }
      this.loading = true;

      let params = {
        token: localStorage.token,
        class: "user",
        method: "login",
        account: this.account,
        password: this.password
      };
      window.localStorage.server = this.server;
      this.$http.defaults.baseURL = window.localStorage.server;
      let response = await this.$http.post("/api.php", qs.stringify(params));
      try {
        let data = await response.data;
        if (data.code == 200) {
          if (data.result.level != 255) {
            this.loading = false;
            this.$message.error("登陆失败");
            return;
          }

          window.localStorage.token = data.token;
          window.localStorage.id = data.result.id;
          window.localStorage.account = data.result.account;
          window.localStorage.nickname = data.result.nickname;
          window.localStorage.photo = data.result.photo;
          window.localStorage.permission = btoa(data.result.permission);
          this.loading = false;
          this.$message.success("登陆成功");
          this.$router.push({
            path: "/dashboard"
          });
        } else if (data.code == 404) {
          this.loading = false;
          this.$message.error("登陆失败");
        } else {
          this.$message.error(data.code);
          this.loading = false;
        }
      } catch (e) {
        this.$message.error("服务器无法链接");
        this.loading = false;
      }
    }
  }
};
</script>
<style lang="less">
.login {
  .el-input__prefix {
    width: 26px;
    top: -2px;
  }
}
</style>
<style lang="less" scoped>
@import "../styles/config.less";
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  .login-form {
    width: 400px;
    margin: auto;
    background-color: #fff;
    box-shadow: 0 0 80px 0 rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    header {
      border-radius: 4px 4px 0 0;
      background-color: @primary;
      height: 80px;
      font-size: 2rem;
      line-height: 80px;
      text-align: center;
      letter-spacing: 5px;
      color: #fff;
    }
    main {
      padding: 40px;
    }
  }
}
</style>
