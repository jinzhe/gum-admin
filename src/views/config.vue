<template>
  <div>
    <div class="layout" v-if="first">
      <div class="box" v-loading="first" style="height:500px"></div>
    </div>
    <div class="layout" v-if="!first">
      <div class="box">
        <el-row>
          <el-col :span="10">
            <b>全局设置</b>
          </el-col>
          <el-col :span="14" align="right">
            <el-button @click="addData()" type="primary" size="mini">创建</el-button>
          </el-col>
        </el-row>

        <el-table :data="items">
          <el-table-column label="描述">
            <template slot-scope="scope">{{scope.row.description}} ({{scope.row.key}})</template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template slot-scope="scope">
              <el-tag type="success" v-if="scope.row.status == 1" size="small">正常</el-tag>
              <el-tag type="danger" v-if="scope.row.status == 0" size="small">禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <el-button @click="editData(scope.row)" type="primary" size="mini">编辑</el-button>
              <el-button @click="deleteData(scope.row)" type="danger" size="mini">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog :title="dialog.title" :visible.sync="dialog.show" width="650px">
      <el-form label-width="80px">
        <el-form-item label="变量">
          <el-input v-model="dialog.fields.key" placeholder="只允许大小写字母、数字、-_.等字符"></el-input>
        </el-form-item>

        <el-form-item label="描述">
          <el-input type="textarea" v-model="dialog.fields.description" placeholder="这个变量是用来做什么的？"></el-input>
        </el-form-item>

        <el-form-item label="内容">
          <el-radio
            v-model="dialog.fields.type"
            :label="0"
            :disabled="edit"
            @click.native="dialog.fields.value=''"
          >纯文本</el-radio>
          <el-radio
            v-model="dialog.fields.type"
            :label="1"
            :disabled="edit"
            @click.native="dialog.fields.value=''"
          >富文本</el-radio>
          <el-radio
            v-model="dialog.fields.type"
            :label="2"
            :disabled="edit"
            @click.native="dialog.fields.value=''"
          >上传文件</el-radio>
          <el-radio
            v-model="dialog.fields.type"
            :label="3"
            :disabled="edit"
            @click.native="dialog.fields.value='off'"
          >开关</el-radio>
        </el-form-item>
        <el-form-item label=" ">
          <template v-if="dialog.fields.type==0">
            <el-input type="textarea" v-model="dialog.fields.value" rows="4"></el-input>
          </template>
          <template v-if="dialog.fields.type==1">
            <editor :height="150" v-model="dialog.fields.value" ref="editor"></editor>
            <br />
          </template>
          <template v-if="dialog.fields.type==2">
            <img :src="dialog.fields.value" v-if="uploadIsImage" width="100%" />
            <video
              controls="controls"
              :src="dialog.fields.value"
              v-else-if="uploadIsVideo"
              width="100%"
              height="auto"
            ></video>
            <a :href="dialog.fields.value" v-else target="_blank" v-text="dialog.fields.value"></a>
          </template>
          <template v-if="dialog.fields.type==3">
            <el-switch
              v-model="dialog.switch"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-value="on"
              inactive-value="off"
              active-text="on"
              inactive-text="off"
            ></el-switch>
          </template>

          <el-upload
            v-if="dialog.fields.type==1 ||dialog.fields.type==2"
            :action="upload.action"
            :data="upload.data"
            :show-file-list="false"
            :on-success="upload.success"
            :before-upload="upload.before"
            :on-progress="upload.progress"
          >
            <el-button type="primary">
              上传文件
              <i class="el-icon-upload el-icon--right"></i>
            </el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-checkbox label="发布" v-model="dialog.fields.status" name="status"></el-checkbox>&nbsp;
        <el-button @click="dialog.show = false">取 消</el-button>
        <el-button type="primary" @click="save()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import editor from "../components/editor";
import tinyMCE from "tinymce/tinymce";
import qs from "qs";

export default {
  name: "config",
  components: {
    editor
  },
  watch: {
    "dialog.switch": function(value) {
      if (dialog.fields.type == 3) {
        if (value) {
          this.dialog.fields.value = "on";
        } else {
          this.dialog.fields.value = "off";
        }
      } else {
        this.dialog.fields.value = "";
      }
    }
  },
  data() {
    return {
      loading: false,
      first: true,
      edit: false,
      files: [],
      upload: {
        action:
          this.$http.defaults.baseURL +
          "/api.php?class=upload&method=go&bind_type=config",
        data: {
          token: localStorage.token
        },
        before: file => {
          const isLt50M = file.size / 1024 / 1024 < 50;
          if (!isLt50M) {
            this.$message.error("上传大小不能超过 50MB!");
          }
          return isLt50M;
        },
        loading: false,
        progress: e => {
          let done = Math.floor((e.loaded / e.total) * 100);
          // window.console.log(done);
          if (done < 100) {
            this.upload.loading = true;
          }
        },
        success: data => {
          if (data.code == 200) {
            this.addFile(data.result);
          } else {
            this.$message.error(data.info);
          }
        }
      },
      file: [],
      dialog: {
        title: "添加",
        show: false,
        switch: false,
        fields: {
          key: "",
          value: "",
          description: "",
          status: true,
          type: 0
        }
      },
      items: []
    };
  },
  computed: {
    uploadIsImage() {
      if (this.dialog.fields.type == 0 || this.dialog.fields.value == "") {
        return false;
      }

      let ext = this.dialog.fields.value.substring(
        this.dialog.fields.value.lastIndexOf(".") + 1
      );
      return ext == "jpg" || ext == "gif" || ext == "png";
    },
    uploadIsVideo() {
      if (this.dialog.fields.type == 0 || this.dialog.fields.value == "") {
        return false;
      }
      let ext = this.dialog.fields.value.substring(
        this.dialog.fields.value.lastIndexOf(".") + 1
      );
      return ext == "mp4";
    }
  },
  mounted() {
    setTimeout(_ => {
      window.bus.$emit("nav", "config");
    }, 100);
    this.getData();
  },
  methods: {
    // 设置编辑器内容
    setContent(content) {
      const old = tinyMCE.activeEditor.getContent();
      tinyMCE.activeEditor.setContent(old + content);
    },
    addFile(item) {
      if (this.dialog.fields.type == 0) {
        if (item.image) {
          this.setContent(`<img src="${item.url}" style="max-width:100%">`);
        } else if (item.type == "video/mp4") {
          this.setContent(
            `<video controls="controls" width="720" height="480"><source src="${item.url}" type="video/mp4" /></video>`
          );
        } else {
          this.setContent(`<a href="${item.url}">${item.name}</a>`);
        }
      } else {
        this.dialog.fields.value = item.url;
      }
    },
    async getData() {
      this.loading = true;

      let params = {
        token: localStorage.token,
        class: "config",
        method: "gets"
      };

      try {
        let response = await this.$http.get("/api.php", { params });
        let data = await response.data;
        if (data.code == 200) {
          data.result.forEach(v => {
            v.status = v.status == 1 ? true : false;
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
    addData() {
      this.edit = false;
      this.dialog = {
        title: "创建变量",
        show: true,
        fields: {
          key: "",
          value: "",
          description: "",
          status: true,
          type: 0
        }
      };
    },
    editData(item) {
      this.edit = true;
      this.dialog = {
        title: "修改设置",
        show: true,
        fields: {
          ...item
        }
      };
    },
    async deleteData(item) {
      this.$confirm("确认要删除吗").then(async () => {
        this.loading = true;

        let params = {
          token: localStorage.token,
          class: "config",
          method: "delete",
          key: item.key
        };
        try {
          let response = await this.$http.get("/api.php", { params });
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
    deleteFile(index) {
      this.files.splice(index, 1);
    },

    async save() {
      if (this.dialog.fields.key == "") {
        this.$message.warning("数据未填写完整");
        return;
      }
      if (!/^[a-zA-Z0-9-_\.]*$/.test(this.dialog.fields.key)) {
        this.$message.warning("变量只允许大小写字母数字和“-”，“_”，“.”字符串");
        return;
      }
      this.loading = true;

      let params = {
        token: localStorage.token,
        class: "config",
        method: "save",
        key: this.dialog.fields.key,
        value: this.dialog.fields.value,
        description: this.dialog.fields.description,
        status: this.dialog.fields.status ? 1 : 0,
        type: this.dialog.fields.type
      };

      try {
        let response = await this.$http.post("/api.php", qs.stringify(params));
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
  background-size: 40px auto;
  background-repeat: no-repeat;
  color: #999;
  font-size: 1.5rem;
  width: 50px;
  height: 50px;
  line-height: 50px;
  text-transform: uppercase;
}
.icon {
  width: 100px;
  height: 100px;
  border: 1px dotted #efefef;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: @text;
  background-position: center;
  background-size: 80px auto;
  background-repeat: no-repeat;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  .el-upload {
    width: 100%;
    & > div {
      display: block;
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
