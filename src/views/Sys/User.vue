<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-input v-model="filters.name" placeholder="用户名查询"/>
        </el-form-item>
        <el-form-item>
          <kt-button :label="$t('action.search')" icon="fa fa-search" perms="sys:user:view"
                     type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <kt-button :label="$t('action.add')" icon="fa fa-plus" perms="sys:user:add"
                     type="primary" @click="handleAdd"/>
        </el-form-item>
        <el-form-item>
          <kt-button :label="$t('action.refresh')" icon="fa fa-refresh"
                     perms="sys:user:view" @click="findPage(null)"></kt-button>
        </el-form-item>
        <el-form-item>
          <kt-button :label="$t('action.export')" icon="fa fa-file-excel-o"
                     perms="sys:user:download" @click="exportUserExcelFile"></kt-button>
        </el-form-item>
      </el-form>
    </div>
    <!--表格内容栏-->
    <kt-table :columns="columns" :data="pageResult"
              permsDelete="sys:user:delete" permsDisable="sys:user:disable"
              permsEdit="sys:user:edit" permsRecover="sys:user:recover" @findPage="findPage" @handleDelete="handleDelete"
              @handleDisable="handleDisable" @handleEdit="handleEdit" @handleRecover="handleRecover">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :close-on-click-modal="false" :title="operation?'新增':'编辑'" :visible.sync="dialogVisible" width="30%">
      <el-form ref="dataForm" :model="dataForm" :rules="dataFormRules"
               :size="size" label-position="right" label-width="80px">
        <el-form-item v-if="false" label="ID" prop="id">
          <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="dataForm.username" :disabled="!operation" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="中文名" prop="chineseName">
          <el-input v-model="dataForm.chineseName" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="dataForm.password" auto-complete="off" type="password"/>
        </el-form-item>
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input :currentChangeHandle="saveDeptChange" :data="deptData"
                            :nodeKey="''+dataForm.deptId" :prop="dataForm.deptName"
                            :props="deptTreeProps"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="dataForm.email" auto-complete="off" type="email"/>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="dataForm.phone" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="角色" prop="userRoles">
          <el-select v-model="dataForm.userRoles" multiple placeholder="请选择" style="width: 100%;">
            <el-option v-for="item in roles" :key="item.id" :label="item.remark" :value="item.id"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible = false">{{ $t('action.cancel') }}</el-button>
        <el-button :loading="editLoading" :size="size" type="primary" @click.native="submitForm">
          {{ $t('action.submit') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import PopupTreeInput from "../../components/PopupTreeInput";
import KtTable from "../Core/KtTable";
import KtButton from "../Core/KtButton";
import {isEmail, isPhone} from "../../utils/validate";
import axios from "axios";
import {baseUrl} from "../../utils/global";
import Cookies from "js-cookie";

const checkEmail = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入邮箱'));
  } else {
    if (isEmail(value)) {
      callback();
    } else {
      return callback(new Error('邮箱格式不正确'))
    }
  }
}
const checkPhone = (rule, value, callback) => {
  if (!value) {
    callback();
  } else {
    if (isPhone(value)) {
      callback();
    } else {
      return callback(new Error('手机格式不正确'))
    }
  }
}
const validatePass = (rule, value, callback) => {
  if (value.length === 0 || !value) {
    callback(new Error("请选择部门"))
  } else {
    callback();
  }
}
export default {
  components: {PopupTreeInput, KtTable, KtButton,},
  data() {
    return {
      size: 'small',
      filters: {name: ''}, // 查询信息
      columns: [
        {prop: "username", label: "用户名", minWidth: '20%'},
        {prop: "deptName", label: "部门", minWidth: '20%'},
        {prop: "chineseName", label: "名字", minWidth: '20%'},
        {prop: "roleNames", label: "角色", minWidth: '20%'},
        {prop: "email", label: "邮箱", minWidth: '20%'},
        {prop: "phone", label: "手机", minWidth: '20%'},
        {prop: "status", label: "状态", minWidth: '20%', formatter: this.statusFormat},
      ],
      pageRequest: {pageNum: 1, pageSize: 10}, // 分页请求
      pageResult: {}, // 分页结果
      operation: false, // true:新增, false:编辑
      dialogVisible: false, // 新增编辑界面是否显示
      editLoading: false, //新增编辑加载
      dataFormRules: {//添加验证
        username: [{required: true, message: '请输入用户名', trigger: 'blur'}],
        chineseName: [{required: true, message: '请输入名字', trigger: 'blur'}],
        password: [{required: true, message: '请输入密码', trigger: 'blur'}],
        email: [{required: true, validator: checkEmail, trigger: 'blur'}],
        phone: [{validator: checkPhone, trigger: 'blur'}],
        deptName: [{required: true, validator: validatePass, trigger: "change"}],
        userRoles: [{required: true, message: "分配角色不能为空", trigger: ["blur", 'change'], type: 'array'}],
      },
      dataForm: {},// 新增编辑界面数据
      deptData: [],// 部门数据
      deptTreeProps: {label: 'name', children: 'children'},//部门树
      roles: [] //角色
    }
  },
  methods: {
    // 显示新增界面
    handleAdd: function () {
      this.dialogVisible = true
      this.operation = true
      this.dataForm = {
        id: 0,
        username: '',
        chineseName: '',
        password: '',
        deptId: '',
        deptName: '',
        email: '',
        phone: '',
        userRoles: []
      }
    },
    // 显示编辑界面
    handleEdit: function (params) {
      this.dialogVisible = true
      this.operation = false
      this.dataForm = Object.assign({}, params.row)
      let userRoles = []
      for (let i = 0, len = params.row.userRoles.length; i < len; i++) {
        userRoles.push(params.row.userRoles[i].roleId)
      }
      this.dataForm.userRoles = userRoles
    },
    // 获取分页数据
    findPage: function (data) {
      if (data !== null) {
        this.pageRequest = data.pageRequest
      }
      this.pageRequest.params = [{name: 'username', value: this.filters.name}]
      this.$api.user.findPage(this.pageRequest).then((res) => {
        this.pageResult = res
        this.findUserRoles()
      }).then(data != null ? data.callback : '')
    },
    // 加载用户角色信息
    findUserRoles: function () {
      this.$api.role.findAll().then((res) => {
        this.roles = res.data
      })
    },
    // 批量删除
    handleDelete: function (data) {
      this.$api.user.Delete({'userId': data.params}).then(data.callback)
    },
    // 批量禁用
    handleDisable: function (data) {
      this.$api.user.disable({'userId': data.params}).then(data.callback)
    },
    //批量恢复
    handleRecover: function (data) {
      this.$api.user.recover({'userId': data.params}).then(data.callback)
    },
    // 编辑
    submitForm: function () {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true
            let params = Object.assign({}, this.dataForm)
            let userRoles = []
            for (let i = 0, len = params.userRoles.length; i < len; i++) {
              let userRole = {userId: params.id, roleId: params.userRoles[i]}
              userRoles.push(userRole)
            }
            params.userRoles = userRoles
            this.$api.user.save(params).then((res) => {
              this.editLoading = false
              if (res.code === 200) {
                this.$message({message: '操作成功', type: 'success'})
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
      this.$api.dept.findTree().then((res) => {
        this.deptData = res.data
      })
    },
    // 菜单树选中
    saveDeptChange(data) {
      this.dataForm.deptId = data.id
      this.dataForm.deptName = data.name
    },
    // 状态格式化
    statusFormat: function (row, column) {
      return row[column.property] === 1 ? '正常' : '禁用';
    },
    //导出用户信息
    exportUserExcelFile: function () {
      axios.post(baseUrl + '/user/download', {names: this.filters.name}, {
        headers: {
          'token': Cookies.get('token'),
          'Content-Type': 'application/json;charset=UTF-8'
        },
        responseType: 'blob'
      }).then(response => {
        let fileName = response.headers['content-disposition'].split('filename=').pop();//通过header中获取返回的文件名称
        let blob = new Blob([response.data], {type: "application/ms-excel"})
        let downloadElement = document.createElement("a")
        let href = window.URL.createObjectURL(blob)
        downloadElement.href = href
        downloadElement.download = decodeURI(fileName)//指定下载的文件的名称，切记进行decode
        document.body.appendChild(downloadElement)
        downloadElement.click()
        document.body.removeChild(downloadElement)//移除临时创建对象，释放资源
        window.URL.revokeObjectURL(href)
      })
    },
  },
  mounted() {
    this.findDeptTree()
  }
}
</script>
<style scoped>
</style>
