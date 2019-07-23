<template>
  <div class="side">
    <div class="info">
      <span
        v-if="photo!=''"
        :style="{ 'background-image': 'url(' + this.photo + ')' }"
        class="photo"
      ></span>
      <span v-if="photo==''" class="photo">{{nickname.substr(0,1)}}</span>
      <div class="account">{{nickname}}</div>
      <!-- <em>{{nickname}}</em> -->
      <div class="other">
        <span @click="profile()">修改密码</span>
        <span @click="clear()">清理缓存</span>
      </div>
    </div>
    <el-scrollbar wrap-class="menu-scrollbar" view-class="view-box">
      <el-menu class="el-menu-vertical-side" @select="select">
        <el-menu-item :class="{ active: active == 'dashboard' }" index="dashboard">
          <i class="icon-monitor"></i>
          <span slot="title">管理首页</span>
        </el-menu-item>

        <el-menu-item :class="{ active: active == 'post' }" index="post">
          <i class="icon-paper"></i>
          <span slot="title">文章管理</span>
        </el-menu-item>

        <el-menu-item :class="{ active: active == 'tag' }" index="tag">
          <i class="icon-tag"></i>
          <span slot="title">标签管理</span>
        </el-menu-item>

        <el-menu-item :class="{ active: active == 'link' }" index="link">
          <i class="icon-link"></i>
          <span slot="title">链接管理</span>
        </el-menu-item>
        <el-menu-item :class="{ active: active == 'user' }" index="user">
          <i class="icon-head"></i>
          <span slot="title">会员管理</span>
        </el-menu-item>
        <el-menu-item :class="{ active: active == 'backup' }" index="backup">
          <i class="icon-server"></i>
          <span slot="title">数据备份/还原</span>
        </el-menu-item>
        <el-menu-item :class="{ active: active == 'logout' }" index="logout">
          <i class="icon-outbox"></i>
          <span slot="title">退出登陆</span>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>

    <el-dialog
      :title="dialog.title"
      :visible.sync="dialog.show"
      width="320px"
      :append-to-body="true"
    >
      <el-form ref="post">
        <el-form-item prop="password">
          <el-input
            v-model="dialog.password"
            placeholder="新密码（5-20个字符）"
            type="password"
            maxlength="20"
            clearable
          ></el-input>
        </el-form-item>
      </el-form>
      <el-row>
        <el-col align="right">
          <el-button @click="dialog.show = false">取 消</el-button>
          <el-button type="primary" @click="updatePassword()">确 定</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import qs from "qs";
export default {
  name: "side",
  data() {
    return {
      active: "",
      info: false,
      account: window.localStorage.account,
      nickname: window.localStorage.nickname,
      photo: window.localStorage.photo,
      dialog: {
        title: "",
        show: false,
        edit: false,
        password: ""
      }
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.info = true;
      window.bus.$on("nav", v => (this.active = v));
    });
  },
  methods: {
    select(key) {
      if (key == "logout") {
        window.localStorage.removeItem("token");
        this.$router.push({
          path: "/"
        });
        return;
      }
      if (key == "post-article") {
        key = "post";
      }
      this.$router.push({
        path: "/" + key
      });
    },
    backup() {
      this.$router.push({
        path: "/backup"
      });
    },
    logout() {
      window.localStorage.removeItem("token");
      this.$router.push({
        path: "/"
      });
    },
    profile() {
      this.dialog.show = true;
      this.dialog.edit = true;
      this.dialog.title = "修改密码";
      this.dialog.password = "";
    },
    async clear() {
      let params = {
        token: localStorage.token,
        class: "dashboard",
        method: "clear"
      };
      let response = await this.$http.post("/api.php", qs.stringify(params));
      try {
        let data = await response.data;
        if (data.code == 200) {
          this.$message.success("清理成功");
        } else {
          this.$message.error(data.info);
        }
      } catch (e) {
        this.$message.error("网络异常");
      }
    },
    async updatePassword() {
      if (this.dialog.password == "") {
        this.$message.error("密码不能为空");
        return;
      }

      if (this.dialog.password.length < 5) {
        this.$message.error("密码不能小于5位");
        return;
      }
      let params = {
        token: localStorage.token,
        class: "user",
        method: "update_password",
        id: window.localStorage.id,
        password: this.dialog.password
      };
      let response = await this.$http.post("/api.php", qs.stringify(params));
      try {
        let data = await response.data;
        if (data.code == 200) {
          this.dialog.show = false;
          this.logout();
        } else {
          this.$message.error(data.info);
        }
      } catch (e) {
        this.$message.error("网络异常");
      }
    }
  }
};
</script>

<style lang="less">
@import "../styles/config.less";
.menu-scrollbar {
  height: calc(100vh - 60px) !important;
}
.side {
  position: fixed;
  left: 0px;
  top: 0px;
  bottom: 0px;
  width: 220px;
  z-index: 99;
  background-color: #fff;
  box-shadow: 2px 0 10px 0 rgba(29, 35, 41, 0.05);
  overflow: hidden;
  .info {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 150px;
    // border-bottom: 1px solid #eee;
    &::after {
      content: "";
      position: absolute;
      left: 0;
      bottom: 0;
      right: 0;
      width: 200%;
      border-top: 1px solid #efefef;
      transform-origin: 0 0;
      transform: scaleY(0.5);
    }
    .photo {
      display: block;
      margin: 10px;
      border-radius: 50%;
      background-color: @primary;
      background-position: center center;
      background-size: cover;
      box-shadow: 0 0 0 4px lighten(@primary, 40%);
      width: 60px;
      height: 60px;
      text-align: center;
      font-size: 2rem;
      line-height: 60px;
      color: lighten(@primary, 20%);
      // cursor: pointer;
    }

    div.account {
      font-weight: 600;
      color: @primary;
    }
    em {
      font-size: 70%;
      color: #999;
    }
    .other {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 40px;
      span {
        display: block;
        padding: 1px 5px;
        border-radius: 2px;
        flex: 1;
        text-align: center;
        font-size: 1rem;
        color: #555;
        cursor: pointer;
        &:hover {
          background-color: @primary;
          color: #fff;
        }
      }
    }
  }
  .el-menu-vertical-side {
    border-right: none;
    font-size: 1rem;
    .el-submenu {
      ul {
        li {
          padding-left: 10px !important;
          font-size: 1rem;
        }
      }
    }
    .el-menu-item,
    .el-submenu__title {
      height: 50px;
      line-height: 50px;
      border-left: 3px solid #fff;
      transition: none;
      color: #5a616b;
      &::after {
        content: "";
        display: block;
        position: absolute;
        right: 15px;
        top: 22px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #efefef;
      }
      & > span {
        font-size: 1.1rem;
        color: #313a45;
      }
      [class^="icon-"] {
        font-size: 1.3rem;
        margin-right: 10px;
        color: #313a45;
      }
      &.active {
        background-color: lighten(@primary, 40%);
        // border-right: 3px solid @primary;
        color: @primary;
        [class^="icon-"],
        & > span {
          font-weight: 500;
          color: @primary;
        }

        &::after {
          background-color: @primary;
          box-shadow: 0 0 0 2px lighten(@primary, 30%);
        }
      }
    }
  }
}
</style>
