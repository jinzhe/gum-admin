<template>
  <div>
    <div class="layout" v-loading="loading">
      <el-row :gutter="20">
        <el-col :span="16">
          <div class="box">
            <el-row style="margin-bottom:20px;" type="flex" align="center" justify="center">
              <el-col>
                <h3 style="margin:10px 0 0 0;">{{ edit ? "更新文章" : "发布文章" }}</h3>
              </el-col>
              <el-col align="right">
                <el-button type="success" @click="saveDraft()" v-if="!edit">存草稿</el-button>
                <el-button
                  type="primary"
                  :loading="loading"
                  @click="submit()"
                >{{ edit ? "更新" : "发布" }}</el-button>
              </el-col>
            </el-row>

            <el-form :model="post" ref="post">
              <el-form-item prop="title">
                <el-input v-model="post.title" placeholder="标题（5-30字）" maxlength="30" clearable></el-input>
              </el-form-item>
              <editor v-model="post.content" ref="editor"></editor>
            </el-form>
          </div>
          <div class="important warn">
            <strong>上传说明</strong>
            <br>1.缩图上传会自动压缩到600x600。
            <br>2.附件中上传的照片图片会按比例自动压缩到1200x1200的范围。
            <br>3.如果安装了exif扩展可以解决iPhone拍出来的照片自动纠正方向。
            <br>4.上传格式支持jpg/png/gif/pdf/mp4/mov/mp3/psd/json/svg/docx/pptx/xlsx/ppt/xls/doc/zip/rar。
            <br>5.PHP的GD库需要2.1以上版本最佳。
          </div>
          <div class="box" v-loading="upload.file.loading">
            <el-upload
              style="float:right"
              multiple
              :action="upload.file.action"
              :data="upload.data"
              :show-file-list="false"
              :on-success="upload.file.success"
              :before-upload="upload.file.before"
              :on-progress="upload.file.progress"
            >
              <el-button size="mini" type="primary">
                上传
                <i class="el-icon-upload el-icon--right"></i>
              </el-button>
            </el-upload>
            <h3>附件</h3>
            <el-table :data="post.files" stripe show-overflow-tooltip style="width: 100%">
              <el-table-column label="文件">
                <div slot-scope="scope" @click="addFile(scope.row)">
                  <template v-if="scope.row.image">
                    <img :src="scope.row.url" height="30" align="absmiddle">
                  </template>
                  <template v-else>{{ scope.row.name }}</template>
                </div>
              </el-table-column>
              <el-table-column label="操作" align="right">
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="mini"
                    v-if="scope.row.type == 'video/mp4'"
                    @click="addFile(scope.row)"
                  >插入</el-button>
                  <el-button
                    type="text"
                    size="mini"
                    @click="previewFile(scope.row.url)"
                    v-if="scope.row.image"
                  >预览</el-button>
                  <el-button type="text" size="mini" @click="deleteFile(scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-row v-for="(file, index) in post.files" :key="index">
              <el-col :span="12"></el-col>
              <el-col :span="12"></el-col>
            </el-row>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="box">
            <h3>
              封面
              <a
                style="color:green;cursor:pointer"
                @click="previewFile(post.cover)"
                v-if="post.cover != ''"
              >预览</a>
            </h3>
       
              <el-upload
               class="cover"
                :action="upload.cover.action"
                :data="upload.data"
                :show-file-list="false"
                :on-success="upload.cover.success"
                :before-upload="upload.cover.before"
              >
                <img v-if="post.cover != ''" :src="post.cover" width="100%" align="absmiddle">
                <div v-if="post.cover == ''"  style="display:block">上传本地图片</div>
              </el-upload>
              <div v-if="post.cover != ''" class="delete" @click.stop="clearCover"></div>
    
          </div>
          <div class="box">
            <h3>关联标签</h3>

            <el-button
              round
              style="margin:0 5px 5px 0;"
              v-for="(tag, index) in tags"
              :key="index"
              @click="setTag(tag)"
              :type="tag.type"
            >{{ tag.name }}</el-button>
          </div>
          <div class="box">
            <h3>作者</h3>
            <el-input v-model="post.author" placeholder="10字内" maxlength="10" clearable></el-input>
          </div>
          <div class="box">
            <h3>关键字</h3>
            <el-input v-model="post.keywords" placeholder="例如: GUM,PHP" maxlength="80" clearable></el-input>
          </div>
          <div class="box">
            <h3>描述</h3>
            <el-input
              v-model="post.description"
              placeholder="用于文章摘要，SEO描述"
              maxlength="200"
              type="textarea"
              :rows="5"
              clearable
            ></el-input>
          </div>
          <div class="box">
            <h3>属性</h3>
            <el-checkbox label="推荐" v-model="post.best" name="best"></el-checkbox>
            <el-checkbox label="发布" v-model="post.status" name="status"></el-checkbox>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import qs from "qs";
import editor from "../components/editor";
import tinyMCE from "tinymce/tinymce";
export default {
  components: {
    editor
  },
  data() {
    return {
      edit: false,
      loading: false,
      draftInterval: null,
      upload: {
        data: {
          token: localStorage.token
        },
        cover: {
          action:
            this.$http.defaults.baseURL +
            "/api.php?class=upload&method=go&bind_type=post&original=600x600",
          before: file => {
            const isJPG = file.type === "image/jpeg";
            const isLt = file.size / 1024 / 1024 < 10;

            if (!isJPG) {
              this.$message.error("上传头像图片只能是 JPG 格式!");
            }
            if (!isLt) {
              this.$message.error("上传头像图片大小不能超过 10MB!");
            }
            return isJPG && isLt;
          },
          success: data => {
            if (data.code == 200) {
              this.post.cover = data.result.url;
              this.post.cover_id = data.result.id;
            } else {
              this.$message.error(data.info);
            }
          }
        },
        file: {
          action:
            this.$http.defaults.baseURL +
            "/api.php?class=upload&method=go&bind_type=post&original=1200x1200",
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
            if (done < 100) {
              this.upload.file.loading = true;
            }
          },
          success: data => {
            this.upload.file.loading = false;
            if (data.code == 200) {
              this.post.files.push(data.result);
            } else {
              this.$message.error(data.info);
            }
          }
        }
      },
      tags: [],
      races: [],
      post: {
        title: "",
        content: "",
        author: "",
        cover: "",
        cover_id: "",
        file: "",
        keywords: "",
        description: "",
        best: false,
        status: true,
        tag_id: 0,
        tag_name: "",
        files: []
      }
    };
  },
  mounted() {
    this.$nextTick(_ => {
      setTimeout(_ => {
        window.bus.$emit("nav", "post");
      }, 100);

      if (this.$route.query.id) {
        this.edit = true;
        this.getData();
      } else {
        let draft = localStorage.draft;
        if (draft) {
          draft = JSON.parse(draft);
          this.post = draft;
          this.$message.success("已从草稿中恢复");
        }
        this.getTags();
      }
    });
  },
  methods: {
    saveDraft() {
      if (this.post.title != "" || this.post.content != "") {
        window.localStorage.draft = JSON.stringify(this.post);
        this.$message.success("草稿已保存");
      }
    },
    // 设置编辑器内容
    setContent(content) {
      tinymce.activeEditor.execCommand("mceInsertContent", false, content);
      this.post.content = tinyMCE.activeEditor.getContent();
    },
    addFile(item) {
      if (item.image) {
        this.setContent(`<img src="${item.url}" style="max-width:100%">`);
      } else if (item.type == "video/mp4") {
        this.setContent(
          `<video controls="controls" width="720" height="480"><source src="${
            item.url
          }" type="video/mp4" /></video>`
        );
      } else {
        this.setContent(`<a href="${item.url}">${item.name}</a>`);
      }
    },
    setCover(item) {
      this.post.cover = item.url;
      this.post.cover_id = item.id;
    },
    // 清理封面
    clearCover() {
      this.post.cover = "";
      this.post.cover_id = "";
    },
    previewFile(file) {
      window.open(file);
    },
    deleteFile(index) {
      this.post.files.splice(index, 1);
    },

    setTag(item) {
      this.tags.forEach(v => (v.type = ""));
      item.type = "primary";
      this.post.tag_id = item.id;
      this.post.tag_name = item.name;
      if (item.id == 2) {
        this.getRaces();
      }
    },
    // 获取热门tag数据
    async getTags() {
      try {
        let params = {
          token: localStorage.token,
          class: "tag",
          method: "data",
          data: '{"hot":1000}'
        };

        let response = await this.$http.get("/api.php", { params });
        let data = await response.data;
        let tags = [];
        data.result.hot.forEach(v => {
          if (this.post.tag_id == v.id) {
            v.type = "primary";
            this.post.tag_name = v.name;
          } else {
            v.type = "";
          }
          tags.push(v);
        });
        this.tags = tags;
        // this.setContent(data.result.content);
      } catch (e) {
        this.$message.error("网络异常");
      }
    },

    // 获取已经绑定的tag数据
    async getBindTags() {
      try {
        let params = {
          token: localStorage.token,
          class: "tag",
          method: "data",
          data: '{"bind_id":' + this.$route.query.id + ',"bind_type":"post"}'
        };

        let response = await this.$http.get("/api.php", { params });
        let data = await response.data;
        let tags = [];
        data.result.bind.forEach(v => {
          tags.push(v);
        });
        this.post.tags = tags;
        this.$forceUpdate();
      } catch (e) {
        this.$message.error("网络异常");
      }
    },
    // 获取已经绑定的tag数据
    async getBindFiles() {
      try {
        let params = {
          token: localStorage.token,
          class: "upload",
          method: "data",
          data: '{"bind_id":' + this.$route.query.id + ',"bind_type":"post"}'
        };

        let response = await this.$http.get("/api.php", { params });
        let data = await response.data;
        if (data.code == 200) {
          let files = [];
          data.result.bind.forEach(v => {
            if (v.id != this.post.cover_id) {
              files.push(v);
            }
          });
          this.post.files = files;
          this.$forceUpdate();
        } else {
          this.$message.error(data.code);
        }
      } catch (e) {
        this.$message.error("网络异常");
      }
    },
    // 获取数据
    async getData() {
      this.loading = true;
      try {
        let params = {
          token: localStorage.token,
          class: "post",
          method: "get",
          id: this.$route.query.id
        };

        let response = await this.$http.get("/api.php", { params });
        let data = await response.data;
        if (data.code == 200) {
          data.result.files = [];
          data.result.tags = [];
          data.result.best = data.result.best == 1 ? true : false;
          data.result.status = data.result.status == 1 ? true : false;
          this.post = data.result;
          this.loading = false;
          this.getTags();
          this.getBindFiles();
        } else {
          this.$message.error(data.code);
        }

        // this.setContent(data.result.content);
      } catch (e) {
        this.$message.error("网络异常");
      }
    },
    // 提交数据
    async submit() {
      if (this.post.title == "") {
        this.$message.error("标题不能为空");
        return;
      }
      if (this.post.content == "") {
        this.$message.error("内容不能为空");
        return;
      }
      if (this.post.tag_id == "") {
        this.$message.error("标签至少选择一个");
        return;
      }

      this.loading = true;
      this.post.keywords = this.post.keywords.replace(/，/g, ",");

      // 合成标签id和附件id
      let postTemp = JSON.parse(JSON.stringify(this.post));
      postTemp.file_ids = postTemp.files.map(v => v.id).join(",");
      postTemp.best = postTemp.best ? 1 : 0;
      postTemp.status = postTemp.status ? 1 : 0;
      delete postTemp.files;

      let params = {
        token: localStorage.token,
        class: "post",
        method: "save",
        id: this.$route.query.id,
        ...postTemp
      };
      // console.log(params);
      // return false;

      let response = await this.$http.post("/api.php", qs.stringify(params));
      try {
        let data = await response.data;
        if (data.code == 200) {
          localStorage.removeItem("draft");
          this.loading = false;
          this.$router.replace({
            path: "/post"
          });
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

<style lang="less">
@import "../styles/config.less";
.tip {
  padding: 5px 0;
  font-size: 12px;
  color: #999;
}
.cover {
  min-height: 178px;
  background-color: #efefef;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: @text;
  box-shadow: 0 0 0 3px #fbfbfb;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  &:hover {
    box-shadow: 0 0 0 3px
      rgba(red(@primary), green(@primary), blue(@primary), 0.82);
  }
  img {
    border-radius: 8px;
  }
  .el-upload{
    width:100%;
    min-height:178px;
    line-height:178px;
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

.el-tag {
  margin-right: 5px;
}
.el-tag {
  cursor: pointer;
}
.tag.active {
  background-color: @primary;
  color: #fff;
}
.button-new-tag {
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  vertical-align: bottom;
}
</style>
