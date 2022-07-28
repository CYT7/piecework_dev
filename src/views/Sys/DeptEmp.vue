<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form ref="filters" :inline="true" :model="filters" :size="size">
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input :currentChangeHandle="deptTreeFilters" :data="deptData" :nodeKey="''+filters.deptId"
                            :prop="filters.deptName" :props="deptTreeProps"/>
        </el-form-item>
        <el-form-item label="职工名" prop="name">
          <el-input v-model="filters.name" placeholder="职工名"/>
        </el-form-item>
        <el-form-item>
          <kt-button :label="$t('action.search')" icon="fa fa-search"
                     perms="sys:DeptEmp:view" type="primary" @click="findPage(null)"/>
          <kt-button :label="$t('action.reset')" icon="fa fa-repeat"
                     perms="sys:emp:view" type="primary" @click="resetFindPage"/>
          <kt-button :label="$t('action.export')" icon="fa fa-file-excel-o"
                     perms="sys:DeptEmp:download" @click="handleDownLoad"/>
          <kt-button :label="$t('action.refresh')" icon="fa fa-repeat"
                     perms="sys:DeptEmp:view" @click="findPage(null)"/>
        </el-form-item>
      </el-form>
    </div>
    <!--表格内容栏-->
    <kt-table :circle="true" :columns="columns" :data="pageResult"
              permsDisable="sys:DeptEmp:disable" permsEdit="sys:DeptEmp:edit" permsRecover="sys:DeptEmp:recover" @findPage="findPage"
              @handleDisable="handleDisable" @handleEdit="handleEdit" @handleRecover="handleRecover">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :close-on-click-modal="false" :title="operation?$t('action.add'):$t('action.edit')"
               :visible.sync="dialogVisible" width="25%">
      <el-form ref="dataForm" :model="dataForm" :rules="dataFormRules"
               :size="size" label-position="right" label-width="100px">
        <el-form-item v-if="false" label="ID" prop="id">
          <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="职工号" prop="empNo">
          <el-input v-model="dataForm.empNo" :disabled="!operation" auto-complete="off" placeholder="请输入职工号"/>
        </el-form-item>
        <el-form-item label="职工名" prop="name">
          <el-input v-model="dataForm.name" :disabled="!operation" auto-complete="off" placeholder="请输入职工名"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="dataForm.email" auto-complete="off" placeholder="请输入邮箱" type="email"/>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="dataForm.phone" auto-complete="off" placeholder="请输入手机"/>
        </el-form-item>
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input :currentChangeHandle="saveDeptChange" :data="deptData" :nodeKey="''+dataForm.deptId"
                            :prop="dataForm.deptName" :props="deptTreeProps"/>
        </el-form-item>
        <el-form-item label="N+1" prop="supervisor">
          <el-select v-model="dataForm.supervisor" placeholder="请选择N+1" style="width: 100%" value-key="id">
            <el-option v-for="item in empData" :key="item.empNo" :label="item.name"
                       :value="item.empNo" @click.native="superiorChange(item)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="开始绩效日期" prop="startPerformance">
          <div class="block">
            <el-date-picker
              v-model="dataForm.startPerformance" :picker-options="pickerOptions"
              placeholder="请选择开始绩效日期" type="date">
            </el-date-picker>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible = false">{{ $t('action.cancel') }}</el-button>
        <el-button :loading="editLoading" :size="size" type="primary" @click.native="submitForm">
          {{ $t('action.submit') }}
        </el-button>
      </div>
    </el-dialog>
    <!--下载-->
    <el-dialog :close-on-click-modal="false" :visible.sync="downloadVisible" title="导出" width="20%">
      <el-form ref="downForm" :model="downForm" :rules="downFormRules" :size="size" label-position="right"
               label-width="80px" style="text-align:left;">
        <el-form-item label="选项" prop="type">
          <el-radio-group v-model="downForm.type">
            <el-radio v-for="(type, index) in TypeList" :key="index" :label="index">{{ type }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="this.downForm.type===0" label="部门" prop="deptName">
          <popup-tree-input :currentChangeHandle="exportDeptChange" :data="deptData" :nodeKey="''+downForm.deptId"
                            :prop="downForm.deptName" :props="deptTreeProps"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="downloadVisible = false">{{ $t('action.cancel') }}</el-button>
        <el-button :size="size" type="primary" @click.native="submitDown">{{ $t('action.submit') }}</el-button>
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
import {formats} from "../../utils/datetime";

const deptIds = sessionStorage.getItem("deptId");
const checkEmail = (rule, value, callback) => {
  if (!value) {
    callback();
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
export default {
  components: {PopupTreeInput, KtTable, KtButton,},
  data() {
    return {
      size: 'small',
      filters: {deptId: '', name: '', deptName: ''}, // 查询信息
      columns: [
        {prop: "empNo", label: "职工号", minWidth: '50%', formatter: this.empFormat},
        {prop: "name", label: "职工名", minWidth: '50%'},
        {prop: "deptName", label: "部门", minWidth: '50%'},
        {prop: "email", label: "邮箱", minWidth: '50%'},
        {prop: "supervisor", label: "N+1", minWidth: '50%'},
        {prop: "bu", label: "BU", minWidth: '50%'},
        {prop: "entryDate", label: "入职日期", minWidth: '50%', formatter: this.dateFormat},
        {prop: "startPerformance", label: "开始绩效", minWidth: '50%', formatter: this.dateFormat},
        {prop: "status", label: "状态", minWidth: '50%', formatter: this.statusFormat},
        {prop: "checkStatus", label: "审核", minWidth: '50%', formatter: this.checkFormat},
      ], // 表格列
      pageRequest: {pageNum: 1, pageSize: 10}, // 分页请求
      pageResult: {}, // 分页结果
      operation: false, // true:新增, false:编辑
      dialogVisible: false, // 新增编辑界面是否显示
      editLoading: false, // 编辑加载
      downloadVisible: false,// 下载页面是否显示
      TypeList: ['导出职工'], // 导出选项
      dataFormRules: {
        email: [{validator: checkEmail, trigger: 'blur'}],
        phone: [{validator: checkPhone, trigger: 'blur'}],
      }, // 保存信息规矩
      downFormRules: {type: [{required: true, message: '请选择导出类型', trigger: 'change'}]}, // 导出选项
      dataForm: {}, // 新增编辑信息
      downForm: [], // 导出信息
      deptData: [], // 部门数据
      deptTreeProps: {label: 'name', children: 'children'},
      empData: [], // 职工数据
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date());
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24);
            picker.$emit('pick', date);
          }
        }, {
          text: '一周前',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', date);
          }
        }]
      },//日历快速选择
    }
  },
  methods: {
    // 显示新增界面
    handleAdd: function () {
      this.dialogVisible = true
      this.operation = true
      this.dataForm = {
        id: 0,
        empNo: '',
        name: '',
        deptId: '',
        deptName: '',
        phone: '',
        email: '',
        superior: '',
        supervisor: '',
        bu: '',
        entryDate: '',
        startPerformance: '',
        status: 1,
      }
    },
    // 显示编辑界面
    handleEdit: function (params) {
      this.dialogVisible = true
      this.operation = false
      this.dataForm = Object.assign({}, params.row)
    },
    // 显示导出界面
    handleDownLoad: function () {
      this.downloadVisible = true
      this.downForm = {
        type: '',
        deptId: ''
      }
    },
    // 重置查找页面
    resetFindPage: function () {
      this.$refs['filters'].resetFields();
      this.filters = {deptId: deptIds, name: '', deptName: ''}
      this.findPage(null);
    },
    // 获取分页数据
    findPage: function (data) {
      if (data !== null) {
        this.pageRequest = data.pageRequest
      }
      this.filters.deptId = this.filters.deptId === '' ? deptIds : this.filters.deptId
      this.pageRequest.params = [{name: 'name', value: this.filters.name}, {name: 'deptId', value: this.filters.deptId}]
      this.$api.deptEmp.findPage(this.pageRequest).then((res) => {
        this.pageResult = res
      }).then(data != null ? data.callback : '');
    },
    // 批量禁用
    handleDisable: function (data) {
      this.$api.deptEmp.disable({'employeeList': data.params}).then(data.callback)
    },
    // 批量恢复
    handleRecover: function (data) {
      this.$api.deptEmp.recover({'employeeList': data.params}).then(data.callback)
    },
    // 获取部门列表
    findDeptTree: function () {
      this.$api.dept.findDeptTree({deptId: deptIds}).then((res) => {
        this.deptData = res.data
      })
    },
    // 获取职工列表
    findEmpTree: function (deptId) {
      this.$api.emp.findEmpTree({'deptId': deptId}).then((res) => {
        this.empData = res.data
      })
    },
    // 菜单树选中
    saveDeptChange(data) {
      this.dataForm.deptId = data.id
      this.dataForm.deptName = data.name
      this.findEmpTree(data.id)
    },
    // 导出部门选中
    exportDeptChange(data) {
      this.downForm.deptId = data.id
      this.downForm.deptName = data.name
    },
    // 查询部门选中
    deptTreeFilters(data) {
      this.filters.deptId = data.id
      this.filters.deptName = data.name
    },
    // 保存N+1选中
    superiorChange(data) {
      this.dataForm.superior = data.empNo
      this.dataForm.supervisor = data.name
    },
    // 保存
    submitForm: function () {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true
            let params = Object.assign({}, this.dataForm)
            this.$api.emp.save(params).then((res) => {
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
    // 状态格式化
    statusFormat: function (row, column) {
      return row[column.property] === 1 ? '正常' : '禁用'
    },
    // 职工号格式化
    empFormat: function (row, column) {
      return row[column.property].toString().padStart(6, '0')
    },
    // 时间格式化
    dateFormat: function (row, column) {
      return formats(row[column.property])
    },
    // 审核状态格式化
    checkFormat: function (row, column) {
      switch (row[column.property]) {
        case 0:
          return '审核中'
        case 1:
          return '通过'
        default:
          return '不通过'
      }
    },
    // 上传前鉴定
    beforeUpload(file) {
      let testMsg = file.name.substring(file.name.lastIndexOf('.') + 1);
      const extension = (testMsg === 'xls' || testMsg === 'xlsx')
      const isLt2M = file.size / 1024 / 1024 < 10     //这里做文件大小限制
      if (!extension) {
        this.$message({message: '上传文件只能是 xls、xlsx格式!', type: 'warning'});
      }
      if (!isLt2M) {
        this.$message({message: '上传文件大小不能超过 10MB!', type: 'warning'});
      }
      return extension && isLt2M
    },
    // 上传文件
    UploadFile(param) {
      const formData = new FormData()
      formData.append('file', param.file) // 要提交给后台的文件
      this.$api.deptEmp.upload(formData).then(res => {
        if (res.code === 200) {
          this.$message({message: res.msg, type: 'success'})
          this.$refs['upload'].clearFiles();
        } else {
          this.$message({message: res.msg, type: 'error'})
          this.$refs['upload'].clearFiles();
        }
      })
    },
    // 导出前校验
    submitDown: function () {
      this.$refs.downForm.validate((valid) => {
        if (valid) {
          let params = Object.assign({}, this.downForm)
          params.deptId = params.deptId === '' ? deptIds : params.deptId;
          this.exportExcelFile(params);
          this.downloadVisible = false;
          this.$refs['downForm'].resetFields()
        }
      })
    },
    // 导出Excel
    exportExcelFile: function (params) {
      axios.post(baseUrl + '/DeptEmp/download', params, {
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
    this.filters.deptId = deptIds
    this.findDeptTree();
  }
}
</script>
<style scoped>
</style>
