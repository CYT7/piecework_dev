<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float: left;padding-left: 15px;padding-top: 10px">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item><el-input v-model="filters.name" placeholder="部门名"/></el-form-item>
        <el-form-item><kt-button icon="fa fa-search" :label="$t('action.search')" perms="sys:coefficient:view" type="primary" @click="findPage(null)"/></el-form-item>
        <el-form-item><kt-button icon="fa fa-plus" :label="$t('action.add')" perms="sys:coefficient:add" type="primary" @click="handleAdd"/></el-form-item>
        <el-form-item>
          <el-upload action="#" class="el-upload" :limit="1" ref="upload"
                     :before-upload="beforeUpload" :http-request="UploadFile"
                     accept=".xls,.xlsx">
            <kt-button icon="fa fa-upload" type="primary" perms="sys:coefficient:upload" :label="$t('action.upload')"/>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-tooltip content="刷新" x-placement="top"><kt-button perms="sys:coefficient:view" icon="fa fa-refresh" @click="findPage(null)"/></el-tooltip>
          <el-tooltip content="导出" placement="top"><kt-button perms="sys:coefficient:download" icon="fa fa-file-excel-o" @click="exportExcelFile"></kt-button></el-tooltip>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <!--表格内容栏-->
      <el-table :data="pageResult" stripe size="mini" style="width: 100%;" v-loading="loading"
                element-loading-text="$t('action.loading')" @selection-change="selectionChange">
        <el-table-column type="expand" width="20">
          <template slot-scope="props">
            <el-table stripe :data="props.row.coeList" v-if="props.row.coeList!=null" width="100%" border fit highlight-current-row>
              <el-table-column prop="points" label="类型" :formatter="typeFormat" sortable header-align="center" align="center" min-width="50%"/>
              <el-table-column prop="title" label="标题" sortable header-align="center" align="center" min-width="50%"/>
              <el-table-column prop="value" label="值" sortable header-align="center" align="center" min-width="50%"/>
              <el-table-column prop="remark" label="备注" sortable header-align="center" align="center" min-width="50%"/>
              <el-table-column prop="status" label="状态" :formatter="statusFormat" sortable header-align="center" align="center" min-width="50%"/>
              <el-table-column header-align="center" align="center" :label="$t('action.operation')"  min-width="100%">
                <template slot-scope="scope">
                  <kt-button icon="fa fa-edit" :label="$t('action.edit')" perms="sys:coefficient:edit" @click="handleEdit(scope.row)"/>
                  <kt-button icon="fa fa-trash" :label="$t('action.delete')" perms="sys:coefficient:delete" type="danger" @click="handleDelete(scope.row)"/>
                  <kt-button v-if="scope.row.status === 1" icon="fa fa-lock" :label="$t('action.disable')" perms="sys:coefficient:disable"  type="warning" @click="handleDisable(scope.row)"/>
                  <kt-button v-if="scope.row.status === 0" icon="fa fa-unlock" :label="$t('action.recover')" perms="sys:coefficient:recover" type="primary" @click="handleRecover(scope.row)"/>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column sortable prop="deptName" label="部门" header-align="center" align="center" min-width="50%"/>
        <el-table-column sortable prop="version" label="版本" header-align="center" align="center" min-width="50%"/>
        <el-table-column sortable prop="status" label="状态" header-align="center" align="center" :formatter="statusFormat" min-width="50%"/>
        <el-table-column sortable prop="updateBy" label="更新人" header-align="center" align="center" min-width="50%"/>
        <el-table-column header-align="center" align="center" :label="$t('action.operation')" min-width="100%">
          <template slot-scope="scope">
            <kt-button icon="fa fa-trash" :label="$t('action.delete')" perms="sys:coefficient:delete" type="danger" @click="handleBatchDelete(scope.row)"/>
            <kt-button v-if="scope.row.status === 1" icon="fa fa-lock" :label="$t('action.disable')" perms="sys:coefficient:disable" type="warning" @click="handleBatchDisable(scope.row)"/>
            <kt-button v-if="scope.row.status === 0" icon="fa fa-unlock" :label="$t('action.recover')" perms="sys:coefficient:recover" type="primary"   @click="handleBatchRecover(scope.row)"/>
          </template>
        </el-table-column>
      </el-table>
      <!--分页栏-->
      <div class="toolbar" style="padding:10px;">
        <el-pagination layout="total, prev, pager, next, jumper" @current-change="refreshPageRequest"
                       :current-page="pageRequest.pageNum" :page-size="pageRequest.pageSize" :total="totalSize"
                       style="float:right;"/>
      </div>
    </div>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="30%" :visible.sync="dialogVisible" :close-on-click-modal="false">
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
        <el-form-item label="系数类型" prop="points">
          <el-radio-group v-model="dataForm.points">
            <el-radio v-for="(type, index) in pointsList" :label="index" :key="index">{{type}}</el-radio>
          </el-radio-group>
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
import KtTable from "../Core/KtTable";
import KtButton from "../Core/KtButton";
import PopupTreeInput from "../../components/PopupTreeInput";
import axios from "axios";
import {baseUrl} from "../../utils/global";
import Cookies from "js-cookie";
export default {
  name: "Coefficient",
  components: {PopupTreeInput, KtButton, KtTable},
  data(){
    return{
      size: "small",
      loading: false,//加载标识
      filters: {name: ""},
      pageRequest: {pageNum: 1, pageSize: 10},//分页信息
      totalSize:0,
      pageResult: [],
      operation: false, // true:新增, false:编辑
      dialogVisible: false, // 新增编辑界面是否显示
      editLoading: false,
      dataFormRules:{
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        value: [{ required: true, message: '值不能为空', trigger: 'blur' }],
        remark: [{ required: true, message: '备注不能为空', trigger: 'blur' }],
        version: [{ required: true, message: '版本不能为空', trigger: 'blur' }],
      },
      // 新增编辑界面数据
      dataForm: {},
      pointsList: ["减分系数", "加分系数", "考勤系数"],
      deptData: [],
      deptTreeProps: {
        label: 'name',
        children: 'children'
      },
    }
  },
  methods:{
    //获取分页数据
    findPage: function () {
      this.loading = true;
      this.pageRequest.params = [{name:'name', value:this.filters.name}]
      this.$api.coefficient.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data
        this.pageResult.coeList = res.data.coeList
        this.totalSize = res.totalSize
      })
      this.loading = false
    },
    //选择切换
    selectionChange: function (selections) {
      this.selections = selections;
      this.$emit('selectionChange', {selections:selections})
    },
    //选择切换
    handleCurrentChange: function (val) {this.$emit('handleCurrentChange', {val:val})},
    //换页刷新
    refreshPageRequest: function (pageNum) {
      this.pageRequest.pageNum = pageNum;
      this.pageRequest.pageSize = 10;
      this.pageRequest.params = [{name:'name', value:this.filters.name}]
      this.loading = true;
      this.$api.coefficient.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data
        this.totalSize = res.totalSize
      })
      this.loading = false
    },
    // 显示新增界面
    handleAdd: function () {
      this.dialogVisible = true
      this.operation = true
      this.dataForm = {
        id: 0,
        points:'',
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
      this.dataForm = Object.assign({}, params)
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
              } else {this.$message({message: '操作失败, ' + res.msg, type: 'error'})}
              this.findPage(null)
            })
          })
        }
      })
    },
    //批量删除
    handleBatchDelete: function (params){
      this.$confirm('确认删除选中的信息吗？','提示',{type:'warning'}).then(()=>{
        let coeList = params.coeList
        let ids = []
        coeList.forEach(i=>{ids.push(i.id)})
        this.loading = true;
        this.$api.coefficient.Delete({'coefficientId':ids}).then(res=>{
          if (res.code===200){
            this.$message({message:'删除成功',type:'success'})
            this.findPage();
          }else{
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        })
      })
    },
    //批量禁用
    handleBatchDisable: function (params){
      this.$confirm('确认禁用选中的信息吗？','提示',{
        type:'warning'
      }).then(()=>{
        let coeList = params.coeList
        let ids = []
        coeList.forEach(i=>{ids.push(i.id)})
        this.loading = true;
        this.$api.coefficient.disable({'coefficientId':ids}).then(res=>{
          if (res.code===200){
            this.$message({message:'禁用成功',type:'success'})
            this.findPage();
          }else{
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        })
      })
    },
    //批量恢复
    handleBatchRecover: function (params){
      this.$confirm('确认恢复选中的信息吗？','提示',{
        type:'warning'
      }).then(()=>{
        let coeList = params.coeList
        let ids = []
        coeList.forEach(i=>{ids.push(i.id)})
        this.loading = true;
        this.$api.coefficient.recover({'coefficientId':ids}).then(res=>{
          if (res.code===200){
            this.$message({message:'恢复成功',type:'success'})
            this.findPage();
          }else{
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        })
      })
    },
    //删除
    handleDelete: function (params){
      this.$confirm('确认删除选中的信息吗？','提示',{
        type:'warning'
      }).then(()=>{
        let ids = [params.id]
        this.loading = true;
        this.$api.coefficient.Delete({'coefficientId':ids}).then(res=>{
          if (res.code===200){
            this.$message({message:'删除成功',type:'success'})
            this.findPage();
          }else{
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        })
      })
    },
    //禁用
    handleDisable: function(params){
      this.$confirm('确认禁用选中的信息吗？','提示',{
        type:'warning'
      }).then(()=>{
        let ids = [params.id]
        this.loading = true;
        this.$api.coefficient.disable({'coefficientId':ids}).then(res=>{
          if (res.code===200){
            this.$message({message:'禁用成功',type:'success'})
            this.findPage();
          }else{
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        })
      })
    },
    //恢复
    handleRecover: function(params){
      this.$confirm('确认恢复选中的信息吗？','提示',{
        type:'warning'
      }).then(()=>{
        let ids = [params.id]
        this.loading = true;
        this.$api.coefficient.recover({'coefficientId':ids}).then(res=>{
          if (res.code===200){
            this.$message({message:'恢复成功',type:'success'})
            this.findPage();
          }else{
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        })
      })
    },
    // 获取部门列表
    findDeptTree: function () {this.$api.dept.findTree().then((res) => {this.deptData = res.data})},
    // 菜单树选中
    deptTreeCurrentChangeHandle (data) {
      this.dataForm.deptId = data.id
      this.dataForm.deptName = data.name
    },
    // 状态格式化
    statusFormat: function (row, column){return row[column.property]===1?'正常':'禁用'},
    // 类型格式化
    typeFormat: function (row, column){
      if(row[column.property]===1){return '加分系数'}
      else if (row[column.property] === 0){return '扣分系数'}
      else{return '考勤系数'}
    },
    //上传鉴定
    beforeUpload(file){
      let testMsg = file.name.substring(file.name.lastIndexOf('.') + 1);
      const extension = (testMsg === 'xls' ||testMsg ==='xlsx')
      const isLt2M = file.size / 1024 / 1024 < 10     //这里做文件大小限制
      if(!extension) {this.$message({message: '上传文件只能是 xls、xlsx格式!', type: 'warning'});}
      if(!isLt2M) {this.$message({message: '上传文件大小不能超过 10MB!', type: 'warning'});}
      return extension && isLt2M
    },
    UploadFile(param){
      const formData = new FormData()
      formData.append('file', param.file) // 要提交给后台的文件
      this.$api.coefficient.upload(formData).then(res=>{
        if(res.code === 200) {
          this.$message({ message: '操作成功', type: 'success' })
          this.$refs['upload'].clearFiles();
        } else {
          this.$message({message: '操作失败, ' + res.msg, type: 'error'})
        }
      })
    },
    exportExcelFile: function () {
      axios.get(baseUrl+'/coefficient/download',{
        headers:{
          'token':Cookies.get('token'),
          'Content-Type': 'application/json;charset=UTF-8'
        },
        responseType: 'blob'
      }).then(response=>{
        let fileName = response.headers['content-disposition'].split('filename=').pop();//通过header中获取返回的文件名称
        let blob = new Blob([response.data], { type: "application/ms-excel" })
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
    this.findPage()
    this.findDeptTree()
  },
}
</script>
<style scoped>
</style>
