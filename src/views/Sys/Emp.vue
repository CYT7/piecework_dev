<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size" ref="filters">
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input :data="deptData" :props="deptTreeProps" :prop="filters.deptName"
                            :nodeKey="''+filters.deptId" :currentChangeHandle="deptTreeFilters"/>
        </el-form-item>
        <el-form-item label="职工名" prop="name">
          <el-input v-model="filters.name" placeholder="职工名"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')"
                     perms="sys:emp:view" type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.reset')"
                     perms="sys:emp:view" type="primary" @click="resetFindPage"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="sys:emp:add" type="primary" @click="handleAdd" />
        </el-form-item>
        <el-form-item>
          <el-upload action="#" class="el-upload" :limit="1" ref="upload"
                     :before-upload="beforeUpload" :http-request="UploadFile"
                     accept=".xls,.xlsx">
            <kt-button icon="fa fa-upload" type="primary" perms="sys:emp:upload" :label="$t('action.upload')"/>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-tooltip content="刷新" x-placement="top">
            <kt-button perms="sys:emp:view" icon="fa fa-refresh" @click="findPage(null)"/>
          </el-tooltip>
          <el-tooltip content="导出" placement="top">
            <kt-button perms="sys:emp:download" icon="fa fa-file-excel-o" @click="exportExcelFile"/>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </div>
    <!--表格内容栏-->
    <kt-table permsDelete="sys:emp:delete" permsDisagree="sys:emp:unconfirmed" permsAgree="sys:emp:confirm"
              permsEdit = "sys:emp:edit" :data="pageResult" :columns="columns" @findPage="findPage"
              @handleEdit="handleEdit" @handleDelete="handleDelete" :circle="true"
              @handleDisagree="handleDisagree" @handleAgree="handleAgree">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="25%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="100px" :rules="dataFormRules"
               ref="dataForm" :size="size" label-position="right">
        <el-form-item label="ID" prop="id" v-if="false">
          <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="职工号" prop="empNo">
          <el-input v-model="dataForm.empNo" auto-complete="off" placeholder="请输入职工号" :disabled="!operation"/>
        </el-form-item>
        <el-form-item label="职工名" prop="name">
          <el-input v-model="dataForm.name" auto-complete="off" placeholder="请输入职工名" :disabled="!operation"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="dataForm.email" type="email" auto-complete="off" placeholder="请输入邮箱"/>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="dataForm.phone" auto-complete="off" placeholder="请输入手机"/>
        </el-form-item>
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input :data="deptData" :props="deptTreeProps" :prop="dataForm.deptName"
                            :nodeKey="''+dataForm.deptId" :currentChangeHandle="deptTreeCurrentChangeHandle"/>
        </el-form-item>
        <el-form-item label="N+1" prop="superior">
          <el-select style="width: 100%" placeholder="请选择N+1" value-key="id" v-model="dataForm.superior">
            <el-option v-for="item in empData" :key="item.empNo" :label="item.name" :value="item.empNo"/>
          </el-select>
        </el-form-item>
        <el-form-item label="BU" prop="bu">
          <el-input v-model="dataForm.bu" auto-complete="off" placeholder="请输入BU"/>
        </el-form-item>
        <el-form-item label="入职日期" prop="entryDate">
          <div class="block">
            <el-date-picker
              v-model="dataForm.entryDate" type="date"
              placeholder="请选择入职日期" :picker-options="pickerOptions">
            </el-date-picker>
          </div>
        </el-form-item>
        <el-form-item label="开始绩效日期" prop="startPerformance">
          <div class="block">
            <el-date-picker
              v-model="dataForm.startPerformance" type="date"
              placeholder="请选择开始绩效日期" :picker-options="pickerOptions">
            </el-date-picker>
          </div>
        </el-form-item>
        <el-form-item label="绩效单价" prop="unitPrice">
          <el-input v-model="dataForm.unitPrice" auto-complete="off" placeholder="输入绩效单价"/>
        </el-form-item>
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
import {isEmail, isPhone} from "../../utils/validate";
import {baseUrl} from "../../utils/global";
import axios from "axios";
import Cookies from "js-cookie";
import {formats} from "../../utils/datetime";
const checkEmail = (rule,value,callback) =>{
  if (!value){return callback(new Error('请输入邮箱'));}
  else{if (isEmail(value)){callback();}else{return callback(new Error('邮箱格式不正确'))}}
}
const checkPhone = (rule,value,callback) =>{
  if (!value){callback();}
  else{if (isPhone(value)){callback();}else{return callback(new Error('手机格式不正确'))}}
}
export default {
  components:{PopupTreeInput, KtTable, KtButton,},
  data() {
    return {
      size: 'small',
      filters: {deptId:'',name:'',deptName:''},
      columns: [
        {prop: "empNo", label: "职工号", minWidth: '30%', formatter: this.empFormat},
        {prop: "name", label: "职工名", minWidth: '30%'},
        {prop: "deptName", label: "部门", minWidth: '30%'},
        {prop: "email", label: "邮箱", minWidth: '50%'},
        {prop: "supervisor", label: "N+1", minWidth: '30%'},
        {prop: "bu", label: "BU", minWidth: '30%'},
        {prop: "entryDate", label: "入职日期", minWidth: '50%', formatter: this.dateFormat},
        {prop: "startPerformance", label: "开始绩效", minWidth: '50%', formatter: this.dateFormat},
        {prop: "title", label: "计件方案", minWidth: '50%'},
        {prop: "detailed", label: "方案明细", minWidth: '50%'},
        {prop: "status", label: "状态", minWidth: '30%', formatter: this.statusFormat},
        {prop: "checkStatus", label: "审核", minWidth: '30%', formatter: this.checkFormat},
      ],
      pageRequest: { pageNum: 1, pageSize: 10 },
      pageResult: {},
      operation: false, // true:新增, false:编辑
      dialogVisible: false, // 新增编辑界面是否显示
      editLoading: false,
      dataFormRules: {
        empNo: [{required: true, message: '请输入职工号', trigger: 'blur'}],
        name: [{ required: true, message: '请输入职工名', trigger: 'blur' }],
        email: [{ required: true, validator:checkEmail, trigger: 'blur' }],
        phone: [{validator:checkPhone, trigger: 'blur' }],
      },
      // 新增编辑界面数据
      dataForm: {},
      downloadForm:{},
      deptData: [],
      deptTreeProps: { label: 'name', children: 'children'},
      empData:[],
      //日历快速选择
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick(picker) {picker.$emit('pick', new Date());}
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
      },
    }
  },
  methods: {
    resetFindPage : function (){
      this.$refs['filters'].resetFields();
      this.filters={deptId: '',name:'',deptName:''}
      this.findPage(null);
    },
    // 获取分页数据
    findPage: function (data) {
      if (data !== null) {this.pageRequest = data.pageRequest}
      this.pageRequest.params = [{name: 'name', value: this.filters.name},{name: 'deptId', value: this.filters.deptId}]
      this.$api.emp.findPage(this.pageRequest).then((res) => {
        this.pageResult = res
      }).then(data != null ? data.callback : '')
    },
    // 批量删除
    handleDelete: function (data) {
      this.$api.emp.Delete({'employeeList': data.params}).then(data.callback)
    },
    // 批量禁用
    handleDisagree: function (data) {
      this.$api.emp.unconfirmed({'employeeList': data.params}).then(data.callback)
    },
    // 批量恢复
    handleAgree: function (data) {
      this.$api.emp.confirm({'employeeList': data.params}).then(data.callback)
    },
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
        bu: '',
        entryDate: '',
        startPerformance: '',
        unitPrice: '',
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
              if (res.code === 200) {
                this.$message({message: res.msg, type: 'success'})
                this.dialogVisible = false
                this.$refs['dataForm'].resetFields()
              } else {
                this.$message({message: res.msg, type: 'error'})
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
    deptTreeCurrentChangeHandle(data) {
      this.dataForm.deptId = data.id
      this.dataForm.deptName = data.name
      this.findEmpTree(data.id)
    },
    // 菜单树选中
    deptTreeFilters(data) {
      this.filters.deptId = data.id
      this.filters.deptName = data.name
    },
    // 获取职工列表
    findEmpTree: function (deptId) {
      this.$api.emp.findEmpTree({'deptId': deptId}).then((res) => {
        this.empData = res.data
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
    // 上传鉴定
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
    UploadFile(param) {
      const formData = new FormData()
      formData.append('file', param.file) // 要提交给后台的文件
      this.$api.emp.upload(formData).then(res => {
        if (res.code === 200) {
          this.$message({message: res.msg, type: 'success'})
          this.$refs['upload'].clearFiles();
        } else {
          this.$message({message: res.msg, type: 'error'})
          this.$refs['upload'].clearFiles();
        }
      })
      this.findPage(null)
    },
    exportExcelFile: function () {
      this.downloadForm.name = this.filters.name;
      axios.post(baseUrl + '/emp/download', this.downloadForm, {
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
