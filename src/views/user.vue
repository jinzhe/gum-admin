<template>
  <div>
    <div class="layout" v-if="first">
      <div class="box" v-loading="first" style="height:500px"></div>
    </div>
    <div class="layout" v-if="!first">
      <div class="box zero">
        <header>
          <el-form :inline="true" :model="filter" class="filter-form">
            <el-form-item style="float:right">
              <el-button type="primary" @click="addData()">创建</el-button>
            </el-form-item>
            <el-form-item>
              <el-input
                prefix-icon="el-icon-search"
                @keydown.enter.native="filterSubmit()"
                v-model="filter.keyword"
                placeholder="ID/邮箱/手机/昵称"
                maxlength="10"
                clearable
              ></el-input>
            </el-form-item>

            <el-form-item>
              <el-date-picker
                style="width:260px"
                v-model="filter.time"
                type="daterange"
                :picker-options="filter.timeOptions"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                align="center"
              ></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-select v-model="filter.status" placeholder="状态" style="width:100px">
                <el-option label="正常" value="1"></el-option>
                <el-option label="禁用" value="0"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="filterSubmit()">搜索</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="normal" @click="filterReset()">重置</el-button>
            </el-form-item>
          </el-form>
        </header>
        <el-table
          ref="table"
          v-loading="loading"
          :data="items.data"
          tooltip-effect="dark"
          style="width: 100%"
          stripe
          @selection-change="onSelection"
        >
          <el-table-column type="selection" :selectable="canSelectable" width="30"></el-table-column>
          <el-table-column prop="address" label="头像" width="80" align="center">
            <template slot-scope="scope">
              <img
                :src="scope.row.photo"
                width="50"
                height="50"
                class="photo"
                v-if="scope.row.photo!=''"
              >
              <div class="photo" v-if="scope.row.photo==''">{{scope.row.nickname.substr(0,1)}}</div>
            </template>
          </el-table-column>
          <el-table-column label="账号">
            <template slot-scope="scope">
              {{ scope.row.account }} ({{ scope.row.nickname }})
              <el-tag type="success" size="mini" v-if="scope.row.level == 255">管理员</el-tag>
              <template v-if="scope.row.email">
                <br>
                邮箱：{{ scope.row.email }}
                <i
                  v-if="scope.row.email_verification"
                  class="el-icon-circle-check"
                  style="color:#67C23A"
                ></i>
              </template>
              <template v-if="scope.row.tel">
                <br>
                手机：{{ scope.row.tel }}
                <i
                  class="el-icon-circle-check"
                  v-if="scope.row.tel_verification"
                  style="color:#67C23A"
                ></i>
              </template>
            </template>
          </el-table-column>

          <el-table-column prop="address" label="登陆" width="150">
            <template slot-scope="scope">
              {{ scope.row.login_time }}
              <br>
              <el-tag type="success" size="mini">
                {{
                scope.row.login_ip
                }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="注册" width="150">
            <template slot-scope="scope">
              {{ scope.row.join_time }}
              <br>

              <el-tag type="warning" size="mini">
                {{
                scope.row.join_ip
                }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template slot-scope="scope">
              <el-tag type="success" v-if="scope.row.status == 1" size="small">正常</el-tag>
              <el-tag type="danger" v-if="scope.row.status == 0" size="small">禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="150">
            <template slot-scope="scope">
              <el-button @click="editData(scope.row)" type="primary" size="mini">编辑</el-button>
              <el-button
                @click="deleteData(scope.row.id)"
                v-if="scope.row.id!=id"
                type="danger"
                size="mini"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <footer>
          <el-row type="flex" align="center" justify="center">
            <el-col :span="6">
              <el-button type="danger" size="small" @click="batchDeleteData">批量删除</el-button>
            </el-col>
            <el-col :span="18" style="text-align:right">
              <el-pagination
                background
                :current-page="pagination.index"
                @current-change="onPagination"
                layout="total, prev, pager, next,jumper"
                :total="items.count"
                :page-size="pagination.size"
              ></el-pagination>
            </el-col>
          </el-row>
        </footer>
      </div>
    </div>

    <el-dialog :title="dialog.title" :visible.sync="dialog.show" width="540px">
      <el-form :model="dialog.fields" ref="post">
        <el-form-item v-if="dialog.fields.id!=id">
          <el-radio-group v-model="dialog.fields.level">
            <el-radio-button label="0">普通会员</el-radio-button>
            <el-radio-button label="255">管理员</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-row>
          <el-col :span="6">
            <div
              class="form-photo"
              :style="{ 'background-image': 'url(' + this.dialog.fields.photo + ')' }"
            >
              <el-upload
                class="el-upload"
                :action="upload.action"
                :data="upload.data"
                :show-file-list="false"
                :on-success="upload.success"
                :before-upload="upload.before"
              >
                <div
                  v-if="dialog.fields.photo == ''"
                  class="el-icon-picture-outline avatar-uploader-icon"
                ></div>
              </el-upload>
              <div
                v-if="dialog.fields.photo != ''"
                class="delete"
                @click.stop="dialog.fields.photo=''"
              ></div>
            </div>
          </el-col>
          <el-col :span="18">
            <el-form-item prop="account">
              <el-input
                v-model="dialog.fields.account"
                placeholder="账号（3-20个由英文字母开头的字母）"
                maxlength="20"
                :disabled="dialog.edit"
                :readonly="dialog.edit"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-if="dialog.edit"
                v-model="dialog.fields.password"
                placeholder="密码（不修改请留空，5-20个字符）"
                type="password"
                maxlength="20"
                clearable
              ></el-input>
              <el-input
                v-if="!dialog.edit"
                v-model="dialog.fields.password"
                placeholder="密码（5-20个字符）"
                type="password"
                maxlength="20"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item prop="nickname">
          <el-input
            v-model="dialog.fields.nickname"
            placeholder="昵称（3-10个字）"
            maxlength="10"
            clearable
          ></el-input>
        </el-form-item>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item prop="email">
              <el-input v-model="dialog.fields.email" placeholder="邮箱地址" maxlength="100" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="tel">
              <el-input v-model="dialog.fields.tel" placeholder="手机号码" maxlength="20" clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-row>
        <el-col :span="14" style="padding-top:10px;text-align:left">
          <el-checkbox label="手机验证" v-model="dialog.fields.tel_verification" name="best"></el-checkbox>
          <el-checkbox label="邮件验证" v-model="dialog.fields.email_verification" name="best"></el-checkbox>
          <el-checkbox label="正常" v-model="dialog.fields.status" name="status"></el-checkbox>
        </el-col>

        <el-col :span="10" style="text-align:right">
          <el-button @click="dialog.show = false">取 消</el-button>
          <el-button type="primary" @click="saveData()">确 定</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import qs from "qs";
export default {
  name: "user",
  data() {
    return {
      id: null,
      loading: false,
      first: true,
      filter: {
        keyword: "",
        status: "",
        time: "",
        timeOptions: {
          shortcuts: [
            {
              text: "最近一周",
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                picker.$emit("pick", [start, end]);
              }
            },
            {
              text: "最近一个月",
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                picker.$emit("pick", [start, end]);
              }
            },
            {
              text: "最近三个月",
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                picker.$emit("pick", [start, end]);
              }
            }
          ]
        }
      },
      upload: {
        action:
          this.$http.defaults.baseURL +
          "/api.php?class=upload&method=go&bind_type=user&original=200x200",
        data: {
          token: localStorage.token
        },

        before: file => {
          const isJPG = file.type === "image/jpeg";
          const isLt2M = file.size / 1024 / 1024 < 5;

          if (!isJPG) {
            this.$message.error("上传头像图片只能是 JPG 格式!");
          }
          if (!isLt2M) {
            this.$message.error("上传头像图片大小不能超过 2MB!");
          }
          return isJPG && isLt2M;
        },
        success: data => {
          if (data.code == 200) {
            this.dialog.fields.photo = data.result.url;
            this.dialog.fields.photo_id = data.result.id;
          } else {
            this.$message.error(data.info);
          }
        }
      },
      dialog: {
        title: "新增",
        show: false,
        edit: false,
        fields: {
          photo: "",
          photo_id: "",
          account: "",
          password: "",
          level: "0",
          nickname: "",
          email: "",
          email_verification: false,
          tel: "",
          tel_verification: false,
          status: true
        }
      },
      items: [],
      pagination: {
        size: 10,
        index: 1
      },
      multipleSelection: []
    };
  },
  mounted() {
    this.id = window.localStorage.id;
    setTimeout(_ => {
      window.bus.$emit("nav", "user");
    }, 100);
    this.getData();
  },
  methods: {
    canSelectable(row) {
      return row.id != this.id;
    },
    filterSubmit() {
      this.getData();
    },
    filterReset() {
      this.filter.keyword = "";
      this.filter.status = "";
      this.filter.time = "";
      this.pagination.index = 1;
      this.getData();
    },
    onPagination(page) {
      this.pagination.index = page;
      this.getData();
    },
    onSelection(val) {
      this.multipleSelection = val;
    },
    // 批量删除
    batchDeleteData() {
      if (this.multipleSelection.length == 0) {
        this.$message.warning("至少选择一个");
        return false;
      }
      let ids = this.multipleSelection.map(v => v.id).join(",");
      this.$confirm("确认要删除吗").then(async () => {
        this.loading = true;

        let params = {
          token: localStorage.token,
          class: "user",
          method: "delete",
          ids: ids
        };

        let response = await this.$http.get("/api.php", { params });
        try {
          let data = await response.data;
          if (data.code == 200) {
            this.loading = false;
            this.getData();
          } else {
            this.$message.error(data.code);
          }
        } catch (e) {
          this.$message.error("网络异常");
        }
      });
    },
    addData() {
      this.dialog.show = true;
      this.dialog.edit = false;
      this.dialog.title = "创建会员";
      this.dialog.fields = {
        photo: "",
        photo_id: "",
        account: "",
        password: "",
        level: "0",
        nickname: "",
        email: "",
        email_verification: false,
        tel: "",
        tel_verification: false,
        status: true
      };
    },
    editData(item) {
      item.status = item.status == 1;
      this.dialog.show = true;
      this.dialog.edit = true;
      this.dialog.title = "编辑会员";
      this.dialog.fields = item;
    },
    async deleteData(id) {
      this.$confirm("确认要删除吗").then(async () => {
        this.loading = true;

        let params = {
          token: localStorage.token,
          class: "user",
          method: "delete",
          ids: id
        };

        let response = await this.$http.get("/api.php", { params });
        try {
          let data = await response.data;
          if (data.code == 200) {
            this.loading = false;
            this.getData();
          } else {
            this.$message.error(data.code);
          }
        } catch (e) {
          this.$message.error("网络异常");
        }
      });
    },
    async getData() {
      this.loading = true;

      let params = {
        token: localStorage.token,
        class: "user",
        method: "search",
        page_index: this.pagination.index,
        page_size: this.pagination.size
      };
      if (this.filter.keyword != "") {
        params.keyword = this.filter.keyword;
      }
      if (this.filter.time != "") {
        params.begin = (+new Date(this.filter.time[0]) / 1000) >> 0;
        params.end = (+new Date(this.filter.time[1]) / 1000) >> 0;
      }
      if (this.filter.status != "") {
        params.status = this.filter.status;
      }

      let response = await this.$http.get("/api.php", { params });
      try {
        let data = await response.data;
        if (data.code == 200) {
          data.result.data.forEach(v => {
            v.tel_verification = v.tel_verification == 1;
            v.email_verification = v.email_verification == 1;
            v.join_time = new Date(v.join_time * 1000).format("yyyy/mm/dd h:i");
            v.login_time = new Date(v.login_time * 1000).format(
              "yyyy/mm/dd h:i"
            );
          });
          this.items = data.result;
          this.loading = false;
          this.first = false;
        } else {
          this.$message.error(data.code);
        }
      } catch (e) {
        this.$message.error("网络异常");
      }
    },
    // 提交数据
    async saveData() {
      if (this.dialog.fields.account == "") {
        this.$message.error("账号不能为空");
        return;
      }
      if (this.dialog.fields.nickname == "") {
        this.$message.error("昵称不能为空");
        return;
      }
      if (!this.dialog.edit && this.dialog.fields.password == "") {
        this.$message.error("密码不能为空");
        return;
      }
      if (!this.dialog.edit && this.dialog.fields.password.length < 5) {
        this.$message.error("密码不能小于5位");
        return;
      }
      // 合成标签id和附件id
      let userTemp = JSON.parse(JSON.stringify(this.dialog.fields));
      userTemp.email_verification = userTemp.email_verification ? 1 : 0;
      userTemp.tel_verification = userTemp.tel_verification ? 1 : 0;
      userTemp.status = userTemp.status ? 1 : 0;

      let params = {
        token: localStorage.token,
        class: "user",
        method: "save",
        id: this.$route.query.id,
        ...userTemp
      };

      let response = await this.$http.post("/api.php", qs.stringify(params));
      try {
        let data = await response.data;
        if (data.code == 200) {
          this.dialog.show = false;
          this.pagination.index = 1;
          this.getData();
        } else {
          this.$message.error(data.code);
        }
      } catch (e) {
        this.$message.error("网络异常");
      }
    }
  }
};
</script>

<style scoped lang="less">
@import "../styles/config.less";
.photo {
  display: inline-block;
  border-radius: 4px;
  background-color: @primary;
  color: #fff;
  font-size: 1.5rem;
  width: 50px;
  height: 50px;
  line-height: 50px;
  text-transform: uppercase;
}
.form-photo {
  position: relative;
  background-color: #efefef;
  width: 100px;
  height: 100px;
  border-radius: 4px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  .el-upload {
    width: 100%;
    div {
      display: block;
      width: 100px;
      height: 100px;
    }
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    line-height: 100px;
    text-align: center;
  }
  .delete {
    position: absolute;
    left: 100%;
    top: 0;
    margin-left: -10px;
    margin-top: -10px;
    z-index: 1;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #de5347;
    cursor: pointer;
    &:before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 9px;
      height: 1px;
      border-radius: 2px;
      background-color: #fff;
      transform: rotate(-45deg) translate3d(-3px, 9px, 0);
    }
    &:after {
      content: "";
      position: absolute;
      left: 0px;
      top: 0;
      width: 9px;
      height: 1px;
      border-radius: 2px;
      background-color: #fff;
      transform: rotate(45deg) translate3d(9px, 3px, 0);
    }
  }
}
</style>
