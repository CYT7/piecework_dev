<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float: left;padding-left: 15px;padding-top: 10px">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item><el-input v-model="filters.name" placeholder="方案名查询"/></el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')"
                     perms="sys:coefficient:view" type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <el-upload action="#" class="el-upload" :limit="1" ref="upload"
                     :before-upload="beforeUpload" :http-request="UploadFile"
                     :show-file-list="false" accept=".xls,.xlsx">
            <kt-button icon="fa fa-upload" type="primary" perms="sys:coefficient:upload" :label="$t('action.upload')"/>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-file-excel-o" label="导出"
                     perms="sys:coefficient:download" type="primary" @click="handleDownLoad"/>
        </el-form-item>
        <el-form-item>
          <el-tooltip content="刷新" x-placement="top">
            <kt-button perms="sys:coefficient:view" icon="fa fa-refresh" @click="findPage(null)"/>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <!--表格内容栏-->
      <el-table :data="pageResult" stripe size="mini" style="width: 100%;" v-loading="loading" class="el-table"
                element-loading-text="$t('action.loading')" @selection-change="selectionChange">
        <el-table-column type="expand" width="20">
          <template slot-scope="props">
            <el-table stripe :data="props.row.children" v-if="props.row.children!=null"
                      width="100%" border fit highlight-current-row>
              <el-table-column prop="type" label="类型" :formatter="typeFormat" sortable
                               header-align="center" align="center" min-width="50%"/>
              <el-table-column prop="title" label="标题" sortable
                               header-align="center" align="center" min-width="100%"/>
              <el-table-column prop="value" label="值" sortable
                               header-align="center" align="center" min-width="50%"/>
              <el-table-column label="变更" header-align="center" align="center" min-width="50%">
                <template slot-scope="scope">
                  <el-popover width="10px" v-if="scope.row.remark!==null" placement="top-start"
                              title="变化记录" trigger="click" :content= scope.row.remark>
                    <el-button slot="reference" size="mini" icon="el-icon-view" circle/>
                  </el-popover>
                </template>
              </el-table-column>
              <el-table-column prop="status" sortable label="状态" header-align="center" align="center" min-width="50%" >
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.status === 0" size="mini" type="danger">禁用</el-tag>
                  <el-tag v-else-if="scope.row.status === 1" size="mini">正常</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="checkStatus" sortable label="审核" header-align="center" align="center" min-width="50%" >
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.checkStatus === 0" size="mini" type="danger">未确认</el-tag>
                  <el-tag v-else-if="scope.row.checkStatus === 1" size="mini" type="success">通过</el-tag>
                  <el-tag v-else-if="scope.row.checkStatus === 2" size="mini" type="warning">未通过</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="updateBy" label="更新人" header-align="center" align="center" min-width="50%"/>
              <el-table-column header-align="center" align="center" :label="$t('action.operation')"  min-width="50%">
                <template slot-scope="scope">
                  <el-tooltip :content="$t('action.delete')" x-placement="top">
                    <kt-button icon="fa fa-trash" perms="sys:coefficient:delete" circle="true"
                               type="danger" @click="deleteCoefficient(scope.row)"/>
                  </el-tooltip>
                  <el-tooltip :content="$t('action.disagree')" x-placement="top">
                    <kt-button v-if="scope.row.checkStatus === 0" icon="fa fa-times" circle="true"
                               perms="sys:coefficient:disable" type="warning" @click="disagreeCoefficient(scope.row)"/>
                  </el-tooltip>
                  <el-tooltip :content="$t('action.agree')" x-placement="top">
                    <kt-button v-if="scope.row.checkStatus === 0" icon="fa fa-check" circle="true"
                               perms="sys:coefficient:recover" type="primary" @click="agreeCoefficient(scope.row)"/>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column sortable prop="deptName" label="部门" header-align="center" align="center" min-width="30%"/>
        <el-table-column sortable prop="title" label="方案名" header-align="center" align="center" min-width="35%"/>
        <el-table-column sortable prop="version" label="版本" header-align="center" align="center" min-width="30%"/>
        <el-table-column prop="unitPrice" label="绩效单价" header-align="center" align="center" min-width="30%"/>
        <el-table-column prop="multiple" label="单价倍数" header-align="center" align="center" min-width="30%"/>
        <el-table-column prop="hourTargetOutput" label="每小时指标产量" header-align="center" align="center" min-width="45%"/>
        <el-table-column prop="dayTargetOutput" label="8小时指标产量" header-align="center" align="center" min-width="45%"/>
        <el-table-column prop="tutoringMonth" label="辅导月数" header-align="center" align="center" min-width="30%"/>
        <el-table-column prop="tutoringProportion" label="辅导比例" header-align="center" align="center" min-width="45%"/>
        <el-table-column prop="startMonth" label="开始月份" header-align="center" align="center" min-width="30%"/>
        <el-table-column prop="endMonth" label="结束月份" header-align="center" align="center" min-width="30%"/>
        <el-table-column label="变更" header-align="center" align="center" min-width="20%">
          <template slot-scope="scope">
            <el-popover
              width="10px"
              v-if="scope.row.remark!==null"
              placement="top-start"
              title="变化记录"
              trigger="click"
              :content= scope.row.remark>
              <el-button slot="reference" size="mini" icon="el-icon-view" circle/>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" header-align="center" align="center" min-width="25%" >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 0" size="mini" type="danger">禁用</el-tag>
            <el-tag v-else-if="scope.row.status === 1" size="mini">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checkStatus" label="审核" header-align="center" align="center" min-width="25%" >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.checkStatus === 0" size="mini" type="danger">未确认</el-tag>
            <el-tag v-else-if="scope.row.checkStatus === 1" size="mini">通过</el-tag>
            <el-tag v-else-if="scope.row.checkStatus === 2" size="mini" type="warning">未通过</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateBy" label="更新人" header-align="center" align="center" min-width="25%"/>
        <el-table-column header-align="center" align="center" :label="$t('action.operation')" min-width="50%">
          <template slot-scope="scope">
            <el-tooltip :content="$t('action.delete')" x-placement="top">
              <kt-button icon="fa fa-trash" circle="true"
                         perms="sys:coefficient:delete" type="danger" @click="deleteScheme(scope.row)"/>
            </el-tooltip>
            <el-tooltip :content="$t('action.disagree')" x-placement="top">
              <kt-button v-if="scope.row.checkStatus === 0" icon="fa fa-times" circle="true"
                         perms="sys:coefficient:disable" type="warning" @click="disagreeScheme(scope.row)"/>
            </el-tooltip>
            <el-tooltip :content="$t('action.agree')" x-placement="top">
              <kt-button v-if="scope.row.checkStatus === 0" icon="fa fa-check" circle="true"
                         perms="sys:coefficient:recover" type="primary" @click="agreeScheme(scope.row)"/>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页栏-->
      <div class="toolbar" style="padding:10px;">
        <el-pagination layout="total, prev, pager, next, jumper" @current-change="refreshPageRequest"
                       :current-page="pageRequest.pageNum" :page-size="pageRequest.pageSize"
                       :total="totalSize" style="float:right;"/>
      </div>
    </div>
    <!--下载-->
    <el-dialog title="导出系数" width="20%" :visible.sync="downloadVisible" :close-on-click-modal="false">
      <el-form :model="downForm" ref="downForm" :size="size" label-width="80px"
               label-position="right" style="text-align:left;">
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input :data="deptData" :props="deptTreeProps" :prop="downForm.deptName"
                            :nodeKey="''+downForm.deptId"
                            :currentChangeHandle="deptTreeCurrentChange"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="downloadVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="submitDown">{{$t('action.submit')}}</el-button>
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
      downloadVisible:false,// 下载页面是否显示
      downForm:[],
      deptData: [],
      coeSchemeData:[],
      deptTreeProps: {label: 'name', children: 'children'},
    }
  },
  methods:{
    //获取分页数据
    findPage: function () {
      this.loading = true;
      this.pageRequest.params = [{name:'name', value:this.filters.name}]
      this.$api.coefficient.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data
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
    // 删除系数方案
    deleteScheme: function (params){
      this.$confirm('确认删除选中的'+params.title+params.version+'吗？','提示',{type:'warning'}).then(()=>{
        let ids = [params.id]
        this.loading = true;
        this.$api.coefficient.DeleteScheme({'coeSchemeId':ids}).then(res=>{
          if (res.code===200){
            this.$message({message:'操作成功',type:'success'})
            this.findPage();
          }else{
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        })
      })
    },
    // 禁用系数方案
    disagreeScheme: function (params){
      this.$confirm('确认不通过'+params.title+params.version+'的变化内容吗？','提示',{
        type:'warning'
      }).then(()=>{
        let ids = [params.id]
        this.loading = true;
        this.$api.coefficient.disableScheme({'coeSchemeId':ids}).then(res=>{
          if (res.code===200){
            this.$message({message:'操作成功',type:'success'})
            this.findPage();
          }else{
            this.$message({message: '操作失败', type: 'error'})
          }
          this.loading = false
        })
      })
    },
    //批量恢复
    agreeScheme: function (params){
      this.$confirm('确认通过选中的信息吗？','提示',{
        type:'warning'
      }).then(()=>{
        let ids = [params.id]
        this.loading = true;
        this.$api.coefficient.recoverScheme({'coeSchemeId':ids}).then(res=>{
          if (res.code===200){
            this.$message({message:'操作成功',type:'success'})
            this.findPage();
          }else{
            this.$message({message: '操作失败', type: 'error'})
          }
          this.loading = false
        })
      })
    },
    //删除
    deleteCoefficient: function (params){
      this.$confirm('确认删除选中的信息吗？','提示',{
        type:'warning'
      }).then(()=>{
        let ids = [params.id]
        this.loading = true;
        this.$api.coefficient.Delete({'coefficientId':ids}).then(res=>{
          if (res.code===200){
            this.$message({message:'操作成功',type:'success'})
            this.findPage();
          }else{
            this.$message({message: res.msg, type: 'error'})
          }
          this.loading = false
        })
        this.loading = false
      })
    },
    //禁用
    disagreeCoefficient: function(params){
      this.$confirm('确认不通过选中的信息吗？','提示',{
        type:'warning'
      }).then(()=>{
        let ids = [params.id]
        this.loading = true;
        this.$api.coefficient.disable({'coefficientId':ids}).then(res=>{
          if (res.code===200){
            this.$message({message:'操作成功',type:'success'})
            this.findPage();
          }else{
            this.$message({message: res.msg, type: 'error'})
          }
          this.loading = false
        })
      })
    },
    //恢复
    agreeCoefficient: function(params){
      this.$confirm('确认通过选中的信息吗？','提示',{
        type:'warning'
      }).then(()=>{
        let ids = [params.id]
        this.loading = true;
        this.$api.coefficient.recover({'coefficientId':ids}).then(res=>{
          if (res.code===200){
            this.$message({message:'操作成功',type:'success'})
            this.findPage();
          }else{
            this.$message({message: res.msg, type: 'error'})
          }
          this.loading = false
        })
      })
    },
    // 获取部门列表
    findDeptTree: function () {this.$api.dept.findTree().then((res) => {this.deptData = res.data})},
    ChangeHandle: function(data){
      let type = data
      if (data===0){
        this.dataForm = {
          types:type,
          id: 0,
          deptId:'',
          title:'',
          version:'',
          unitPrice:'',
          multiple:'',
          hourTargetOutput:'',
          dayTargetOutput:'',
        }
      }else{
        this.dataForm = {
          types:type,
          id: 0,
          deptId:'',
          coefficientSid:'',
          type:'',
          title:'',
          value:'',
          remark:'',
        }
      }
    },
    // 菜单树选中
    deptTreeCurrentChangeHandle (data) {
      this.dataForm.deptId = data.id
      this.dataForm.deptName = data.name
      this.findCoefficientTree(data.id)
    },
    deptTreeCurrentChange (data) {
      this.downForm.deptId = data.id
      this.downForm.deptName = data.name
    },
    CoeSchemeCurrentChange:function (data){
      this.dataForm.coefficientSid = data.id
    },
    findCoefficientTree:function (deptId){
      this.$api.coefficient.findCoefficientTree({'deptId':deptId}).then((res)=>{
        this.coeSchemeData = res
      })
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
    handleDownLoad: function (){
      this.downloadVisible = true
      this.downForm = {
        deptId: '',
      }
    },
    submitDown:function (){
      this.$refs.downForm.validate((valid)=>{
        if (valid){
          let params = Object.assign({},this.downForm)
          this.exportExcelFile(params);
          this.downloadVisible = false;
          this.$refs['downForm'].resetFields()
        }
      })
    },
    exportExcelFile: function (params) {
      axios.post(baseUrl+'/coefficient/download',params,{
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
.el-table{
  font-size: 12px;
}
</style>
