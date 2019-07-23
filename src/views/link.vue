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
              <el-button type="primary" @click="addData()">新增</el-button>
            </el-form-item>
            <el-form-item>
              <el-input
                prefix-icon="el-icon-search"
                @keydown.enter.native="filterSubmit()"
                v-model="filter.keyword"
                placeholder="关键字(标题/网址/标签)"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-select v-model="filter.status" placeholder="状态" style="width:100px">
                <el-option label="启用" value="1"></el-option>
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

        <el-table :data="result.data" style="width: 100%">
          <el-table-column label="图片" width="80" align="center">
            <template slot-scope="scope">
              <div
                @click="open(scope.row.image)"
                class="empty"
                v-if="scope.row.image!=''"
                :style="{ 'background-image': 'url(' + scope.row.image + ')' }"
              ></div>
              <div class="empty" v-if="scope.row.image==''">?</div>
            </template>
          </el-table-column>
          <el-table-column label="标题" width="150">
            <template slot-scope="scope">
              <b>{{scope.row.title}}</b>
            </template>
          </el-table-column>
          <el-table-column label="网址">
            <template slot-scope="scope">{{scope.row.url}}</template>
          </el-table-column>
          <el-table-column label="标签" width="100">
            <template slot-scope="scope">
              <b>{{scope.row.tag}}</b>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80" align="center">
            <template slot-scope="scope">
              <el-tag
                :disable-transitions="false"
                type="success"
                v-if="scope.row.status == 1"
                size="small"
              >启用</el-tag>
              <el-tag
                :disable-transitions="false"
                type="danger"
                v-if="scope.row.status == 0"
                size="small"
              >禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="300">
            <template slot-scope="scope">
              <el-button @click="moveUp(scope.$index)" type="success" size="mini">上移</el-button>
              <el-button @click="moveDown(scope.$index)" type="success" size="mini">下移</el-button>
              <el-button @click="editData(scope.row)" type="primary" size="mini">编辑</el-button>
              <el-button @click="deleteData(scope.row)" type="danger" size="mini">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <footer v-if="result.data && result.data.length>0 && result.total>pagination.size">
          <el-pagination
            background
            @current-change="onPagination"
            layout="total, prev, pager, next,jumper"
            :total="result.total"
            :page-size="pagination.size"
          ></el-pagination>
        </footer>
      </div>

      <div class="important warn">
        <strong>使用帮助</strong>
        <br>链接标签是用于二次开发模板的时候用的，可以做轮换图片模块等。
      </div>
    </div>

    <el-dialog :title="dialog.title" :visible.sync="dialog.show" width="40%">
      <el-form>
        <el-row :gutter="20">
          <el-col :span="6">
            <div
              class="image"
              :style="{ 'background-image': 'url(' + this.dialog.fields.image + ')' }"
            >
              <el-upload
                class="el-upload"
                :action="upload.action"
                :data="upload.data"
                :show-file-list="false"
                :on-success="upload.success"
                :before-upload="upload.before"
              >
                <div class="placeholder">
                  <template v-if="dialog.fields.image == ''">图片(可选)</template>
                </div>
              </el-upload>
              <div
                v-if="dialog.fields.image != ''"
                class="delete"
                @click.stop="dialog.fields.image=''"
              ></div>
            </div>
          </el-col>
          <el-col :span="18">
            <el-form-item>
              <el-input v-model="dialog.fields.title" placeholder="标题"></el-input>
            </el-form-item>

            <el-form-item>
              <el-input v-model="dialog.fields.url" placeholder="网址"></el-input>
            </el-form-item>

            <el-form-item>
              <el-input v-model="dialog.fields.tag" placeholder="标签（可选）" maxlength="10"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-checkbox label="发布" v-model="dialog.fields.status" name="status"></el-checkbox>&nbsp;
        <el-button @click="dialog.show = false">取 消</el-button>
        <el-button type="primary" @click="saveData()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      first: true,
      upload: {
        action:
          this.$http.defaults.baseURL +
          "/api.php?class=upload&method=go&bind_type=link",
        data: {
          token: localStorage.token
        },

        before: file => {
          const isImage =
            file.type === "image/jpeg" ||
            file.type === "image/png" ||
            file.type === "image/svg+xml" ||
            file.type === "image/gif";
          const isLt1M = file.size / 1024 / 1024 < 1;

          if (!isImage) {
            this.$message.error("上传图片格式错误!");
          }
          if (!isLt1M) {
            this.$message.error("上传图片大小不能超过 1MB!");
          }
          return isImage && isLt1M;
        },
        success: data => {
          if (data.code == 200) {
            this.dialog.fields.image_id = data.result.id;
            this.dialog.fields.image = data.result.url;
          } else {
            this.$message.error(data.info);
          }
        }
      },
      filter: {
        keyword: "",
        status: ""
      },
      dialog: {
        title: "新增",
        show: false,
        fields: {
          image: "",
          image_id: "",
          title: "",
          url: "",
          tag: "",
          status: true
        }
      },
      result: {},
      pagination: {
        size: 100000,
        index: 1
      }
    };
  },
  computed: {},
  mounted() {
    setTimeout(() => {
      window.bus.$emit("nav", "link");
    }, 100);
    this.getData();
  },
  methods: {
    open(url) {
      window.open(url);
    },
    filterSubmit() {
      this.getData();
    },
    filterReset() {
      this.filter.keyword = "";
      this.filter.status = "";
      this.pagination.index = 1;
      this.getData();
    },
    onPagination(index) {
      this.pagination.index = index;
      this.getData();
    },
    async getData() {
      this.loading = true;

      let params = {
        token: localStorage.token,
        class: "link",
        method: "search",
        page_size: this.pagination.size,
        page_index: this.pagination.index
      };
      if (this.filter.keyword != "") {
        params.keyword = this.filter.keyword;
      }
      if (this.filter.status != "") {
        params.status = this.filter.status;
      }

      let response = await this.$http.get("/api.php", { params });
      try {
        let data = await response.data;
        if (data.code == 200) {
          data.result.data.forEach(v => {
            v.status = v.status == 1 ? true : false;
          });
          this.result = data.result;
          this.loading = false;
          this.first = false;
        } else {
          this.$message.error(data.code);
        }
      } catch (e) {
        this.$message.error("网络异常");
      }
    },
    addData() {
      this.dialog = {
        title: "添加",
        show: true,
        fields: {
          image: "",
          image_id: "",
          title: "",
          url: "",
          tag: "",
          status: true
        }
      };
    },
    editData(item) {
      let temp = JSON.parse(JSON.stringify(item));
      temp.status = temp.status == 1;
      this.dialog = {
        title: "编辑",
        show: true,
        fields: {
          ...temp
        }
      };
    },
    async deleteData(item) {
      this.$confirm("确认要删除吗").then(async () => {
        this.loading = true;

        let params = {
          token: localStorage.token,
          class: "link",
          method: "delete",
          id: item.id
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
    async saveData() {
      if (this.dialog.fields.title == "") {
        this.$message.error("标题不能为空");
        return;
      }
      if (this.dialog.fields.url == "") {
        this.$message.error("网址不能为空");
        return;
      }
      this.loading = true;
      let temp = JSON.parse(JSON.stringify(this.dialog.fields));
      temp.status = temp.status ? 1 : 0;
      let params = {
        token: localStorage.token,
        class: "link",
        method: "save",
        ...temp
      };

      let response = await this.$http.get("/api.php", { params });
      try {
        let data = await response.data;
        if (data.code == 200) {
          this.loading = false;
          this.dialog.show = false;
          this.getData();
        } else {
          this.$message.error(data.code);
        }
      } catch (e) {
        this.$message.error("网络异常");
      }
    },
    swap(arr, fromIndex, toIndex) {
      arr[toIndex] = arr.splice(fromIndex, 1, arr[toIndex])[0];
      return arr;
    },
    moveUp(index) {
      if (index == 0) {
        return;
      }
      this.swap(this.result.data, index, index - 1);
      this.updateSort();
    },
    moveDown(index) {
      if (index == this.result.data.length - 1) {
        return;
      }
      this.swap(this.result.data, index, index + 1);
      this.updateSort();
    },
    async updateSort() {
      let params = {
        token: localStorage.token,
        class: "link",
        method: "update_sort",
        ids: this.result.data.map(v => v.id).join(",")
      };

      let response = await this.$http.get("/api.php", { params });
      try {
        let data = await response.data;
        if (data.code == 200) {
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
.empty {
  display: inline-block;
  border-radius: 4px;
  // background-color: @primary;
  border: 1px dotted #efefef;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  color: #999;
  font-size: 1.5rem;
  width: 50px;
  height: 50px;
  line-height: 50px;
  text-transform: uppercase;
}
.image {
  width: 100px;
  height: 100px;
  border: 1px solid #dcdfe6;
  font-size: 12px;
  color: @text;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  color: #dcdfe6;
  line-height: 1.5;
  .placeholder {
    display: block;
    width: 100px;
    height: 100px;
    line-height: 100px;
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
