<template>
  <div>
    <div class="layout" v-if="first">
      <div class="box" v-loading="first" style="height:500px"></div>
    </div>
    <div class="layout" v-if="!first">
      <div class="box">
        <el-row>
          <el-col :span="10">
            <b>数据备份/还原</b>
          </el-col>
          <el-col :span="14" align="right">
            <el-button @click="backup()" type="danger" size="small">备份</el-button>
          </el-col>
        </el-row>

        <el-table :data="items" style="width: 100%">
          <el-table-column label="时间">
            <template slot-scope="scope">{{scope.row.time}}</template>
          </el-table-column>
          <!-- <el-table-column label="文件名称"><template slot-scope="scope">{{scope.row.name}}</template></el-table-column> -->
          <el-table-column label="操作" width="150" align="right">
            <template slot-scope="scope">
              <el-button @click="restore(scope.row.name)" type="success">还原</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="important warn">
        <strong>使用说明</strong>
        <br />还原数据库会覆盖现有的数据库，请谨慎操作。
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "backup",
  data() {
    return {
      loading: false,
      first: true,

      items: []
    };
  },
  computed: {},
  mounted() {
    setTimeout(_ => {
      window.bus.$emit("nav", "backup");
    }, 100);
    this.getData();
  },
  methods: {
    async getData() {
      this.loading = true;

      let params = {
        token: localStorage.token,
        class: "backup",
        method: "search"
      };

      let response = await this.$http.get("/api.php", { params });
      try {
        let data = await response.data;
        if (data.code == 200) {
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
    async backup() {
      let params = {
        token: localStorage.token,
        class: "backup",
        method: "backup"
      };

      let response = await this.$http.get("/api.php", { params });
      try {
        let data = await response.data;
        if (data.code == 200) {
          this.getData();
          this.$message.success("备份成功");
        } else {
          this.$message.error(data.code);
        }
      } catch (e) {
        this.$message.error("网络异常");
      }
    },
    async restore(name) {
      this.$confirm("确定要还原数据库吗？还原后现有的数据库将会被覆盖！").then(
        async () => {
          let params = {
            token: localStorage.token,
            class: "backup",
            method: "restore",
            file: name
          };

          let response = await this.$http.get("/api.php", { params });
          try {
            let data = await response.data;
            if (data.code == 200) {
              this.getData();
              this.$message.success("还原成功");
            } else {
              this.$message.error("还原失败");
            }
          } catch (e) {
            this.$message.error("网络异常");
          }
        }
      );
    }
  }
};
</script>
 
