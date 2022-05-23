<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item><el-input v-model="filters.name" placeholder="用户名"/></el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="sys:emp:view" type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="sys:emp:add" type="primary" @click="handleAdd" />
        </el-form-item>
        <el-form-item>
          <el-tooltip content="刷新" x-placement="top"><el-button icon="fa fa-refresh" @click="findPage(null)"/></el-tooltip>
        </el-form-item>
      </el-form>
    </div>
    <!--表格内容栏-->
    <kt-table permsEdit="sys:emp:edit" permsDelete="sys:emp:delete" permsDisable="sys:emp:disable" permsRecover="sys:emp:recover"
              :data="pageResult" :columns="columns" @findPage="findPage" @handleEdit="handleEdit"
              @handleDelete="handleDelete" @handleDisable="handleDisable" @handleRecover="handleRecover">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="30%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size" label-position="right">
        <el-form-item label="ID" prop="id" v-if="false"><el-input v-model="dataForm.id" :disabled="true" auto-complete="off"/></el-form-item>
        <el-form-item label="职工号" prop="empNo"><el-input v-model="dataForm.empNo" auto-complete="off"/></el-form-item>
        <el-form-item label="职工名" prop="name"><el-input v-model="dataForm.name" auto-complete="off"/></el-form-item>
       <el-form-item label="部门" prop="deptName">
          <popup-tree-input :data="deptData"
                            :props="deptTreeProps"
                            :prop="dataForm.deptName"
                            :nodeKey="''+dataForm.deptId"
                            :currentChangeHandle="deptTreeCurrentChangeHandle">
          </popup-tree-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email"><el-input v-model="dataForm.email" type="email" auto-complete="off"/></el-form-item>
        <el-form-item label="手机" prop="mobile"><el-input v-model="dataForm.phone" auto-complete="off"/></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import PopupTreeInput from "../../components/PopupTreeInput";
import KtTable from "../Core/KtTable";
import KtButton from "../Core/KtButton";
import {isEmail} from "../../utils/validate";
const checkEmail = (rule,value,callback) =>{
  if (!value){return callback(new Error('请输入邮箱'));}
  else{if (isEmail(value)){callback();}else{return callback(new Error('邮箱格式不正确'))}}
}
export default {
  components:{PopupTreeInput, KtTable, KtButton,},
  data() {
    return {
      size: 'small',
      filters: {name: ''},
      columns: [
        {prop:"empNo", label:"职工号", minWidth:'25%'},
        {prop:"name", label:"职工名", minWidth:'25%'},
        {prop:"deptName", label:"部门", minWidth:'25%'},
        {prop:"phone", label:"手机", minWidth:'25%'},
        {prop:"email", label:"邮箱", minWidth:'25%'},
        {prop:"status", label:"状态", minWidth:'25%', formatter:this.statusFormat},
      ],
      pageRequest: { pageNum: 1, pageSize: 10 },
      pageResult: {},
      operation: false, // true:新增, false:编辑
      dialogVisible: false, // 新增编辑界面是否显示
      editLoading: false,
      dataFormRules: {
        empNo: [{ required: true, message: '请输入职工号', trigger: 'blur' }],
        name: [{ required: true, message: '请输入职工名', trigger: 'blur' }],
        deptName: [{ required: true, message: '请选择部门', trigger: 'blur' }],
        email: [{ required: true, validator:checkEmail, trigger: 'blur' }],
      },
      // 新增编辑界面数据
      dataForm: {},
      deptData: [],
      deptTreeProps: {
        label: 'name',
        children: 'children'
      },
    }
  },
  methods: {
    // 获取分页数据
    findPage: function (data) {
      if(data !== null) {this.pageRequest = data.pageRequest}
      this.pageRequest.params = [{name:'name', value:this.filters.name}]
      this.$api.emp.findPage(this.pageRequest).then((res) => {this.pageResult = res}).then(data!=null?data.callback:'')
    },
    // 批量删除
    handleDelete: function (data) {this.$api.emp.Delete({'employeeList':data.params}).then(data.callback)},
    // 批量禁用
    handleDisable: function (data) {this.$api.emp.disable({'employeeList':data.params}).then(data.callback)},
    //批量恢复
    handleRecover: function (data) {this.$api.emp.recover({'employeeList':data.params}).then(data.callback)},
    // 显示新增界面
    handleAdd: function () {
      this.dialogVisible = true
      this.operation = true
      this.dataForm = {
        id: 0,
        empNo: '',
        name: '',
        phone: '',
        email: '',
        deptId: '',
        deptName: '',
        status: 1,
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
            this.$api.emp.save(params).then((res) => {
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
    findDeptTree: function () {this.$api.dept.findTree().then((res) => {this.deptData = res.data
      })
    },
    // 菜单树选中
    deptTreeCurrentChangeHandle (data) {
      this.dataForm.deptId = data.id
      this.dataForm.deptName = data.name
    },
    // 状态格式化
    statusFormat: function (row, column){return row[column.property]===1 ?'正常':'禁用'}
  },
  mounted() {this.findDeptTree()}
}
</script>
<style scoped>
</style>
