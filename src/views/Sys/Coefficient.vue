<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float: left;padding-left: 15px;padding-top: 10px">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item><el-input v-model="filters.name" aria-placeholder="部门名"/></el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="sys:coefficient:view" type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="sys:coefficient:add" type="primary" @click="handleAdd"/>
        </el-form-item>
      </el-form>
    </div>
    <!--表格内容栏-->
    <kt-table perms-edit="sys:coefficient:edit" perms-delete="sys:coefficient:delete" perms-disable="sys:coefficient:disable" perms-recover="sys:coefficient:recover"
              :highlight-current-row="true" :stripe="false" :data="pageResult" :columns="columns" :show-batch-delete="true"
              @findPage="findPage" @handleEdit="handleEdit" @handleDelte="handleDelete" @handleDisable="handleDisable" @handleRecover="handleRecover"/>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size" label-position="right">
        <el-form-item label="ID" prop="id" v-if="false"><el-input v-model="dataForm.id" :disabled="true" auto-complete="off"/></el-form-item>
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input
            :data="deptData"
            :props="deptTreeProps"
            :prop="dataForm.deptName"
            :node-key="''+dataForm.deptId"
            :current-change-handle="deptTreeCurrentChangeHandle"/>
        </el-form-item>
        <el-form-item label="标题" prop="title"><el-input v-model="dataForm.title" auto-complete="off"/></el-form-item>
        <el-form-item label="值" prop="value"><el-input v-model="dataForm.value" auto-complete="off"/></el-form-item>
        <el-form-item label="备注" prop="remark"><el-input v-model="dataForm.remark" auto-complete="off"/></el-form-item>
        <el-form-item label="版本" prop="version"><el-input v-model="dataForm.version" auto-complete="off"/></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible=false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import PopupTreeInput from "../../components/PopupTreeInput";
import KtTable from "../Core/KtTable";
import KtButton from "../Core/KtButton";
export default {
  name: "Coefficient",
  components: {KtButton, KtTable, PopupTreeInput},
  data(){
    return{
      size:"small",
      filters:{name:''},
      columns:[
        {prop:"deptName", label:"部门", minWidth:'20%'},
        {prop:"title", label:"标题", minWidth:'20%'},
        {prop:"value", label:"值", minWidth:'20%'},
        {prop:"remark", label:"备注", minWidth:'20%'},
        {prop:"version", label:"版本", minWidth:'20%'},
        {prop:"status", label:"状态", minWidth:'20%', formatter:this.statusFormat},
      ],
      user:{},
      pageRequest: { pageNum: 1, pageSize: 10 },
      pageResult: {},
      operation: false, // true:新增, false:编辑
      dialogVisible: false, // 新增编辑界面是否显示
      editLoading: false,
      dataFormRules:{
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        value: [{ required: true, message: '值不能为空', trigger: 'blur' }],
      },
      // 新增编辑界面数据
      dataForm: {
        id: 0,
        title: '',
        value:'',
        deptId: '',
        deptName: '',
        status: 1,
        remark: '',
        version: '',
      },
      deptData: [],
      deptTreeProps: {
        label: 'name',
        children: 'children'
      },
    }
  },
  methods:{
    // 获取分页数据
    findPage: function (data) {
      if(data !== null) {
        this.pageRequest = data.pageRequest
      }
      this.pageRequest.params = [{name:'name', value:this.filters.name}]
      this.$api.coefficient.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data
      }).then(data!=null?data.callback:'')
    },
    // 批量删除
    handleDelete: function (data) {
      this.$api.coefficient.batchDelete(data.params).then(data.callback)
    },
    // 批量禁用
    handleDisable: function (data) {
      this.$api.coefficient.batchDisable(data.params).then(data.callback)
    },
    //批量恢复
    handleRecover: function (data) {
      this.$api.coefficient.batchRecover(data.params).then(data.callback)
    },
    // 显示新增界面
    handleAdd: function () {
      this.dialogVisible = true
      this.operation = true
      this.dataForm = {
        id: 0,
        title: '',
        value:'',
        deptId: '',
        deptName: '',
        status: 1,
        remark: '',
        version: '',
      }
    },
    // 显示编辑界面
    handleEdit: function (params) {
      this.dialogVisible = true
      this.operation = false
      this.dataForm = Object.assign({}, params.row)
    },
    // 编辑
    submitForm: function () {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true
            let params = Object.assign({}, this.dataForm)
            this.$api.coefficient.save(params).then((res) => {
              this.editLoading = false
              if(res.code === 200) {
                this.$message({ message: '操作成功', type: 'success' })
                this.dialogVisible = false
                this.$refs['dataForm'].resetFields()
              } else {
                this.$message({message: '操作失败, ' + res.msg, type: 'error'})
              }
              this.findPage(null)
            })
          })
        }
      })
    },
    // 获取部门列表
    findDeptTree: function () {
      this.$api.dept.findDeptTree().then((res) => {
        this.deptData = res.data
      })
    },
    // 菜单树选中
    deptTreeCurrentChangeHandle (data) {
      this.dataForm.deptId = data.id
      this.dataForm.deptName = data.name
    },
    // 状态格式化
    statusFormat: function (row, column){
      return row[column.property]===1?'正常':'禁用'
    },
  },
  mounted() {
    this.findDeptTree()
  }
}
</script>
<style scoped>
</style>
