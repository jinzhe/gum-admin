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
              <el-button type="primary" @click="publish()">发布</el-button>
            </el-form-item>

            <el-form-item>
              <el-select v-model="filter.tag_id" placeholder="标签" style="width:100px">
                <el-option :label="tag.name" :value="tag.id" v-for="tag in tags" :key="tag.id"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-input
                prefix-icon="el-icon-search"
                style="width:150px"
                @keydown.enter.native="filterSubmit()"
                v-model="filter.keyword"
                placeholder="关键字"
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
                <el-option label="已发布" value="1"></el-option>
                <el-option label="未发布" value="0"></el-option>
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
          stripe
          style="width: 100%"
          @selection-change="onSelection"
        >
          <el-table-column type="selection" width="30"></el-table-column>
          <el-table-column label="标签" width="100" align="center">
            <template slot-scope="scope">
              <el-tag :disable-transitions="bool" type="info" size="small">
                {{
                scope.row.tag_name
                }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="标题">
            <span class="title" @click="editData(scope.row)" slot-scope="scope">
              <el-popover trigger="hover" placement="right" v-if="scope.row.cover != ''">
                <img :src="scope.row.cover" align="absmiddle" width="200">
                <span slot="reference" class="name-wrapper">{{ scope.row.title }}</span>
              </el-popover>
              <span v-if="scope.row.cover == ''">{{ scope.row.title }}</span>
              &nbsp;
              <el-tag
                :disable-transitions="true"
                type="primary"
                v-if="scope.row.best == 1"
                size="small"
              >推荐</el-tag>
            </span>
          </el-table-column>

          <el-table-column label="状态" width="80" align="center">
            <template slot-scope="scope">
              <el-popover trigger="hover" placement="top">
                <p>作者: {{ scope.row.author }}</p>
                <p>日期: {{ scope.row.time }}</p>
                <div slot="reference" class="name-wrapper">
                  <el-tag
                    :disable-transitions="bool"
                    type="success"
                    v-if="scope.row.status == 1"
                    size="small"
                  >已发布</el-tag>
                  <el-tag
                    :disable-transitions="bool"
                    type="danger"
                    v-if="scope.row.status == 0"
                    size="small"
                  >未发布</el-tag>
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template slot-scope="scope">
              <el-button @click="editData(scope.row)" type="primary" size="mini">编辑</el-button>
              <el-button @click="deleteData(scope.row)" type="danger" size="mini">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <footer v-if="items.data && items.data.length>0">
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
                :total="items.total"
                :page-size="pagination.size"
              ></el-pagination>
            </el-col>
          </el-row>
        </footer>
      </div>

      <div class="important warn">
        <strong>使用帮助</strong>
        <br>1.当使用了搜索功能后，会保存上一次搜索参数，如果需要清除点击重置按钮即可。
        <br>2.附件功能中的文件即使在页面删除也不会真正删除物理文件，需要清理缓存才会批量删除会未使用的上传文件。
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "post",
  data() {
    return {
      bool: true,
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
      tags: [],
      items: [],
      pagination: {
        size: 10,
        index: 1
      },
      multipleSelection: []
    };
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(_ => {
        window.bus.$emit("nav", "post");
      }, 100);
      if (window.localStorage.postIndex) {
        this.pagination.index = window.localStorage.postIndex >> 0;
      }
      if (window.localStorage.postFilter) {
        this.filter = JSON.parse(window.localStorage.postFilter);
      }
      this.getTags();
      this.getData();
    });
  },
  methods: {
    // 获取热门tag数据
    async getTags() {
      let params = {
        token: localStorage.token,
        class: "tag",
        method: "data",
        data: '{"hot":1000}'
      };

      let response = await this.$http.get("/api.php", { params });
      try {
        let data = await response.data;
        this.tags = data.result.hot;
        // this.setContent(data.result.content);
      } catch (e) {
        this.$message.error("网络异常");
      }
    },
    publish() {
      this.$router.push({
        path: "/post-form"
      });
    },
    filterSubmit() {
      window.localStorage.postFilter = JSON.stringify(this.filter);
      window.localStorage.postIndex = this.pagination.index;
      this.getData();
    },
    filterReset() {
      window.localStorage.removeItem("postFilter");
      window.localStorage.removeItem("postIndex");
      this.filter.keyword = "";
      this.filter.status = "";
      this.filter.time = "";
      this.filter.tag_id = "";
      this.pagination.index = 1;
      this.getData();
    },
    onPagination(page) {
      window.localStorage.postIndex = page;
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
          class: "post",
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

    editData(item) {
      this.$router.push({
        path: "/post-form",
        query: {
          id: item.id
        }
      });
    },
    async deleteData(item) {
      this.$confirm("确认要删除吗").then(async () => {
        this.loading = true;

        let params = {
          token: localStorage.token,
          class: "post",
          method: "delete",
          ids: item.id
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

    // 获取数据
    async getData() {
      this.loading = true;

      let params = {
        token: localStorage.token,
        class: "post",
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
      if (this.filter.tag_id != "") {
        params.tag_id = this.filter.tag_id;
      }
      let response = await this.$http.get("/api.php", { params });
      try {
        let data = await response.data;
        data.result.data.forEach(v => {
          v.time = new Date(v.time * 1000).format("yyyy/mm/dd");
        });
        this.items = data.result;
        this.loading = false;
        this.first = false;
      } catch (e) {
        this.$message.error("网络异常");
      }
    }
  }
};
</script>

<style scoped lang="less">
@import "../styles/config.less";
.title {
  cursor: pointer;
}
</style>
