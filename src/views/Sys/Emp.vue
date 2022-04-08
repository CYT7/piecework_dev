<template>
  <div class="el-pager">
    <!--工具栏 -->
    <div class="toolbar" style="float: left;padding-top: 10px;padding-left: 15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-input v-model="filters.name" aria-placeholder="职工名"></el-input>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="sys:emp:view" type="primary" @click="findPage(null)"></kt-button>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="sys:emp:add" type="primary" @click="handleAdd"></kt-button>
        </el-form-item>
      </el-form>
    </div>
    <!--表格内容栏-->
    <kt-table permsEdit="sys:emp:edit" permsDelete="sys:emp:delete" :highlightCurrentRow="true" :stripe="false"
              :data="pageResult" :columns="columns" :showBatchDelete="false"
              @findPage="findPage" @handleEdit="handleEdit" @handleDelete="handleDelete">
    </kt-table>
  </div>
</template>
<script>
import KtButton from "../Core/KtButton";
import KtTable from "../Core/KtTable";
export default {
  name: "Emp",
  components: {KtButton,KtTable,},
  data() {
    return{
      size:"small",
      filters:{name:""},
      columns: [
        {prop:"empNo", label:"职工号", minWidth:120},
        {prop:"name", label:"职工名", minWidth:120},
        {prop:"phone", label:"手机", minWidth:120},
        {prop:"deptId", label:"部门id", minWidth:120},
        {prop:"status", label:"状态", minWidth:120},
      ],
      pageRequest: { pageNum: 1, pageSize: 10 },
      pageResult: {},
      operation: false, // true:新增, false:编辑
      dialogVisible: false, // 新增编辑界面是否显示
      editLoading: false,
    }
  },
  methods: {
    // 获取分页数据
    findPage: function (data) {
      if(data !== null) {
        this.pageRequest = data.pageRequest
      }
      this.pageRequest.params = [{name:'name', value:this.filters.name}]
      this.$api.emp.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data
      }).then(data!=null?data.callback:'')
    },
    // 显示新增界面
    handleAdd: function () {
      this.dialogVisible = true
      this.operation = true
      this.dataForm = {
        id: 0,
        empNo: '',
        name: '',
        phone:'',
        deptId:'',
        status:1,
      }
    },
    // 显示编辑界面
    handleEdit: function (params) {
      this.dialogVisible = true
      this.operation = false
      this.dataForm = Object.assign({}, params.row)
    },
    // 批量删除
    handleDelete: function (data) {
      this.$api.emp.batchDelete(data.params).then(data.callback)
    },
  }
}
</script>
<style scoped>
</style>
