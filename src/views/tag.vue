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
              <el-input prefix-icon="el-icon-search" v-model="filter.keyword" placeholder="关键字"></el-input>
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
        <el-table
          ref="table"
          v-loading="loading"
          :data="result.data"
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="onSelection"
        >
          <el-table-column align="center" label="编号" width="80">
            <template slot-scope="scope">{{ scope.row.id }}</template>
          </el-table-column>

          <el-table-column label="名称">
            <template slot-scope="scope">{{ scope.row.name }}</template>
          </el-table-column>
          <el-table-column align="center" label="标签" width="80">
            <template slot-scope="scope">{{ scope.row.tag }}</template>
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
          <el-table-column align="center" label="操作" width="300">
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
        <br>标签中的标签字段是用于二次开发时候使用的，比如在首页有些标签需要显示图片列表可以用标签字段值进行区别显示。
      </div>
    </div>

    <el-dialog :title="dialog.title" :visible.sync="dialog.show" width="30%">
      <el-form>
        <el-form-item>
          <el-input v-model="dialog.fields.name" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="dialog.fields.tag" placeholder="标签（可选）"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-checkbox label="启用" v-model="dialog.fields.status" name="status"></el-checkbox>&nbsp;
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
      filter: {
        keyword: "",
        status: ""
      },
      dialog: {
        title: "修改",
        show: false,
        fields: {
          name: "",
          tag: "",
          status: true
        }
      },
      result: {},
      pagination: {
        size: 100000,
        index: 1
      },
      multipleSelection: []
    };
  },
  mounted() {
    setTimeout(_ => {
      window.bus.$emit("nav", "tag");
    }, 100);
    this.getData();
  },
  methods: {
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
      this.pagination.current = page;
      this.getData();
    },
    onSelection(val) {
      this.multipleSelection = val;
    },
    onSelectionToggle() {
      this.$refs.table.toggleAllSelection();
    },
    addData() {
      this.dialog = {
        title: "新增",
        show: true,
        fields: {
          name: "",
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
        fields: temp
      };
    },
    async deleteData(item) {
      this.$confirm("确认要删除吗").then(async () => {
        this.loading = true;

        let params = {
          token: localStorage.token,
          class: "tag",
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
    async getData() {
      this.loading = true;

      let params = {
        token: localStorage.token,
        class: "tag",
        method: "search",
        page_index: this.pagination.index,
        page_size: this.pagination.size
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
    async saveData() {
      if (this.dialog.name == "") {
        this.$message.error("标签不能为空");
        return;
      }
      this.loading = true;
      let temp = JSON.parse(JSON.stringify(this.dialog.fields));
      temp.status = temp.status ? 1 : 0;
      let params = {
        token: localStorage.token,
        class: "tag",
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
        class: "tag",
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
</style>
