<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float: left;padding-top: 10px">
      <el-form :inline="true" :model="filters" :size="size" ref="filters">
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input :data="deptData" :props="deptTreeProps" :prop="filters.deptName"
                            :nodeKey="''+filters.deptId" :currentChangeHandle="deptTreeFilters"/>
        </el-form-item>
        <el-form-item label="方案" prop="name">
          <el-input v-model="filters.name" placeholder="方案名查询"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')"
                     perms="sys:deptCoe:view" type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')"
                     perms="sys:deptCoe:add" type="primary" @click="handleAdd"/>
        </el-form-item>
        <el-form-item>
          <el-upload action="#" class="el-upload" :limit="1" ref="upload"
                     :before-upload="beforeUpload" :http-request="UploadFile"
                     accept=".xls,.xlsx">
            <kt-button icon="fa fa-upload" type="primary" perms="sys:deptCoe:upload" :label="$t('action.upload')"/>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-file-excel-o" label="导出"
                     perms="sys:deptCoe:download" type="primary" @click="handleDownLoad"/>
        </el-form-item>
        <el-form-item>
          <el-tooltip content="刷新" x-placement="top">
            <kt-button perms="sys:deptCoe:view" icon="fa fa-refresh" @click="findPage(null)"/>
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
              <el-table-column prop="title" label="标题" sortable header-align="center" align="center" min-width="50%"/>
              <el-table-column prop="value" label="值" sortable header-align="center" align="center" min-width="50%"/>
              <el-table-column prop="status" label="状态" header-align="center" align="center" min-width="25%" >
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.status === 1" size="mini">正常</el-tag>
                  <el-tag v-if="scope.row.status === 0" size="mini" type="danger">禁用</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="checkStatus" label="审核" header-align="center" align="center" min-width="25%" >
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.checkStatus === 0" size="mini" type="danger">未确认</el-tag>
                  <el-tag v-if="scope.row.checkStatus === 1" size="mini">通过</el-tag>
                  <el-tag v-if="scope.row.checkStatus === 2" size="mini" type="warning">未通过</el-tag>
                </template>
              </el-table-column>
              <el-table-column sortable prop="updateBy" label="更新人" header-align="center" align="center" min-width="50%"/>
              <el-table-column header-align="center" align="center" :label="$t('action.operation')"  min-width="100%">
                <template slot-scope="scope">
                  <kt-button icon="fa fa-edit" :label="$t('action.edit')"
                             perms="sys:deptCoe:edit" @click="editCoefficient(scope.row)"/>
                  <kt-button v-if="scope.row.status === 1" icon="fa fa-lock" :label="$t('action.disable')"
                             perms="sys:deptCoe:disable"  type="warning" @click="disableCoefficient(scope.row)"/>
                  <kt-button v-if="scope.row.status === 0" icon="fa fa-unlock" :label="$t('action.recover')"
                             perms="sys:deptCoe:recover" type="primary" @click="recoverCoefficient(scope.row)"/>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column sortable prop="deptName" label="部门" header-align="center" align="center" min-width="30%"/>
        <el-table-column sortable prop="title" label="方案名" header-align="center" align="center" min-width="40%"/>
        <el-table-column sortable prop="detailed" label="明细" header-align="center" align="center" min-width="40%"/>
        <el-table-column sortable prop="version" label="版本" header-align="center" align="center" min-width="35%"/>
        <el-table-column prop="unitPrice" label="标准单价" header-align="center" align="center" min-width="30%"/>
        <el-table-column prop="multiple" label="单价倍数" header-align="center" align="center" min-width="30%"/>
        <el-table-column prop="performanceUnitPrice" label="绩效单价" header-align="center" align="center" min-width="30%"/>
        <el-table-column prop="hourTargetOutput" label="每小时指标产量分数" header-align="center" align="center" min-width="55%"/>
        <el-table-column prop="dayTargetOutput" label="8小时指标产量分数" header-align="center" align="center" min-width="55%"/>
        <el-table-column prop="tutoringMonth" label="辅导月份" header-align="center" align="center" min-width="50%"/>
        <el-table-column prop="tutoringProportion" label="辅导比例" header-align="center" align="center" min-width="50%"/>
        <el-table-column prop="effectiveDate" label="生效日期" :formatter="dateFormat"
                         header-align="center" align="center" min-width="50%"/>
        <el-table-column prop="startMonth" label="开始月份" header-align="center" align="center" min-width="50%"/>
        <el-table-column prop="endMonth" label="结束月份" header-align="center" align="center" min-width="50%"/>
        <el-table-column prop="status" label="状态" header-align="center" align="center" min-width="23%" >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 0" size="mini" type="danger">禁用</el-tag>
            <el-tag v-else-if="scope.row.status === 1" size="mini">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checkStatus" label="审核" header-align="center" align="center" min-width="23%" >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.checkStatus === 0" size="mini" type="danger">未确认</el-tag>
            <el-tag v-else-if="scope.row.checkStatus === 1" size="mini">通过</el-tag>
            <el-tag v-else-if="scope.row.checkStatus === 2" size="mini" type="warning">未通过</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateBy" label="更新人" header-align="center" align="center" min-width="25%"/>
        <el-table-column header-align="center" align="center" :label="$t('action.operation')" min-width="40%">
          <template slot-scope="scope">
            <el-tooltip :content="$t('action.edit')" x-placement="top">
              <kt-button icon="fa fa-edit" perms="sys:deptCoe:edit" :circle="true" @click="editScheme(scope.row)"/>
            </el-tooltip>
            <el-tooltip :content="$t('action.recover')" x-placement="top" v-if="scope.row.status === 0">
              <kt-button icon="fa fa-unlock" perms="sys:deptCoe:recover" type="primary"
                         :circle="true" @click="recoverScheme(scope.row)"/>
            </el-tooltip>
            <el-tooltip :content="$t('action.disable')" x-placement="top" v-if="scope.row.status === 1">
              <kt-button icon="fa fa-lock" perms="sys:deptCoe:disable" type="warning"
                         :circle="true" @click="disableScheme(scope.row)"/>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页栏-->
      <div class="toolbar" style="padding:10px;">
        <el-pagination layout="total, prev, pager, next, jumper" @current-change="refreshPageRequest"
                       :current-page="pageRequest.pageNum" :page-size="pageRequest.pageSize"
                       :total="totalSize" style="float:right;">
        </el-pagination>
      </div>
    </div>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="30%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" ref="dataForm" @keyup.enter.native="submitForm()" label-width="100px" :size="size" style="text-align:left;">
        <el-form-item label="选项" prop="type" v-if="operation">
          <el-radio-group v-model="dataForm.types">
            <el-radio v-for="(types, index) in TypeList" :label="index" :key="index"
                      @change.native="ChangeHandle(index)">{{types}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="部门" prop="deptName" v-if="operation">
          <popup-tree-input
            :data="deptData" :props="deptTreeProps" :prop="dataForm.deptName"
            :node-key="''+dataForm.deptId" :current-change-handle="deptTreeCurrentChangeHandle"/>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 1&&operation" label="系数方案" prop="coefficientSid">
          <el-select style="width: 100%" placeholder="选择系数方案" value-key="id" v-model="dataForm.coefficientSid">
            <el-option v-for="item in coeSchemeData" :key="item.id" :label="item.title"
                       :value="item.id" @click.native="CoeSchemeCurrentChange(item)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 1" label="类型" prop="type">
          <el-radio-group v-model="dataForm.type">
            <el-radio v-for="(type, index) in pointsList" :label="index" :key="index">{{type}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="TypeList[dataForm.types] + '名'" prop="title">
          <el-input v-model="dataForm.title" :placeholder="TypeList[dataForm.types] + '名'" :disabled="!operation"/>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 0" label="明细" prop="detailed">
          <el-input v-model="dataForm.detailed" placeholder="请填写明细" :disabled="!operation"/>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 0" label="版本" prop="version">
          <el-input v-model="dataForm.version" placeholder="请填写版本" :disabled="!operation"/>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 0" label="绩效单价" prop="unitPrice">
          <el-input v-model="dataForm.unitPrice" placeholder="请输入绩效单价"/>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 0" label="绩效单价倍数" prop="multiple">
          <el-input v-model="dataForm.multiple" placeholder="请输入绩效单价倍数"/>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 0" label="每小时指标产量分数" prop="hourTargetOutput">
          <el-input v-model="dataForm.hourTargetOutput" placeholder="请输入每小时指标产量分数"/>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 0" label="8小时指标产量分数" prop="dayTargetOutput">
          <el-input v-model="dataForm.dayTargetOutput" placeholder="请输入8小时指标产量分数"/>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 0" label="生效日期" prop="entryDate">
          <div class="block">
            <el-date-picker
              v-model="dataForm.effectiveDate" type="date"
              placeholder="请选择生效日期" :picker-options="pickerOptions">
            </el-date-picker>
          </div>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 0" label="辅导月数" prop="tutoringMonth">
          <el-input v-model="dataForm.tutoringMonth" placeholder="请输入辅导月数，多个请用;分开"/>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 0" label="辅导比例" prop="tutoringProportion">
          <el-input v-model="dataForm.tutoringProportion" placeholder="请输入辅导比例，多个请用;分开"/>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 0" label="开始月份" prop="startMonth">
          <el-input v-model="dataForm.startMonth" placeholder="请输入方案开始月份"/>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 0" label="结束月份" prop="endMonth">
          <el-input v-model="dataForm.endMonth" placeholder="请输入方案结束月份"/>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 1" label="系数值" prop="value">
          <el-input v-model="dataForm.value" placeholder="请输入系数值"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible=false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>
      </div>
    </el-dialog>
    <el-dialog title="导出系数" width="30%" :visible.sync="downloadVisible" :close-on-click-modal="false">
      <el-form :model="downForm" ref="downForm" :size="size" label-width="100px" label-position="right" style="text-align:left;">
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
import {Dateformat} from "../../utils/datetime";
const deptIds = sessionStorage.getItem("deptId");
export default {
  name: "Coefficient",
  components: {PopupTreeInput, KtButton, KtTable},
  data(){
    return{
      size: "small",
      loading: false,//加载标识
      filters: {deptId:'',name:'',deptName:''},
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
      TypeList:["方案", "系数"],
      downloadVisible:false,// 下载页面是否显示
      downForm:[],
      dataForm: {},
      pointsList: ["减分系数", "加分系数", "考勤系数"],
      deptData: [],
      coeSchemeData:[],
      deptTreeProps: {
        label: 'name',
        children: 'children'
      },
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
  methods:{
    resetFindPage : function (){
      this.$refs['filters'].resetFields()
      this.filters={deptId:'',name:'',deptName:''}
      this.findPage()
    },
    //获取分页数据
    findPage: function () {
      this.loading = true;
      this.pageRequest.params = [{name:'name', value:this.filters.name},{name:'deptId', value:this.filters}]
      this.$api.deptCoefficient.findPage(this.pageRequest).then((res) => {
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
      this.pageRequest.params = [{name:'name', value:this.filters.name},{name:'deptId', value:deptIds}]
      this.loading = true;
      this.$api.deptCoefficient.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data
        this.totalSize = res.totalSize
      })
      this.loading = false
    },
    // 显示新增界面
    handleAdd: function () {
      this.dialogVisible = true
      this.operation = true
      this.ChangeHandle(0)
    },
    // 显示编辑界面
    editCoefficient: function (params) {
      this.dialogVisible = true
      this.operation = false
      this.dataForm = Object.assign({}, params)
      this.dataForm.types = 1
    },
    // 显示编辑界面
    editScheme: function (params) {
      this.dialogVisible = true
      this.operation = false
      this.dataForm = Object.assign({}, params)
      this.dataForm.types = 0
    },
    // 编辑
    submitForm: function () {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true
            let params = Object.assign({}, this.dataForm)
            if (params.types===0){
              this.$api.deptCoefficient.saveScheme(params).then((res) => {
                this.editLoading = false
                if(res.code === 200) {
                  this.$message({ message: '操作成功', type: 'success' })
                  this.dialogVisible = false
                  this.$refs['dataForm'].resetFields()
                } else {this.$message({message: '操作失败, ' + res.msg, type: 'error'})}
                this.findPage(null)
              })
            }else{
              this.$api.deptCoefficient.save(params).then((res) => {
                this.editLoading = false
                if(res.code === 200) {
                  this.$message({ message: '操作成功', type: 'success' })
                  this.dialogVisible = false
                  this.$refs['dataForm'].resetFields()
                } else {this.$message({message: '操作失败, ' + res.msg, type: 'error'})}
                this.findPage(null)
              })
            }
          })
        }
      })
    },
    //批量禁用
    disableScheme: function (params){
      this.$confirm('确认禁用选中的信息吗？','提示',{type:'warning'}).then(()=>{
        let ids = [params.id]
        this.loading = true;
        this.$api.deptCoefficient.disableScheme({'coeSchemeId':ids}).then(res=>{
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
    recoverScheme: function (params){
      this.$confirm('确认恢复选中的信息吗？','提示',{type:'warning'}).then(()=>{
        let ids = [params.id]
        this.loading = true;
        this.$api.deptCoefficient.recoverScheme({'coeSchemeId':ids}).then(res=>{
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
    //禁用
    disableCoefficient: function(params){
      this.$confirm('确认禁用选中的信息吗？','提示',{type:'warning'}).then(()=>{
        let ids = [params.id]
        this.loading = true;
        this.$api.deptCoefficient.disable({'coefficientId':ids}).then(res=>{
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
    recoverCoefficient: function(params){
      this.$confirm('确认恢复选中的信息吗？','提示',{type:'warning'}).then(()=>{
        let ids = [params.id]
        this.loading = true;
        this.$api.deptCoefficient.recover({'coefficientId':ids}).then(res=>{
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
    findDeptTree: function (deptId) {this.$api.dept.findDeptTree({'deptId':deptId}).then((res) => {
      this.deptData = res.data
    })},
    // 菜单树选中
    deptTreeFilters(data) {
      this.filters.deptId = data.id
      this.filters.deptName = data.name
    },
    ChangeHandle: function(data){
      let type = data
      if (data===0){
        this.dataForm = {
          types:type,
          id: 0,
          deptId:'',
          title:'',
          detailed:'',
          version:'',
          unitPrice:'',
          multiple:'',
          hourTargetOutput:'',
          dayTargetOutput:'',
          tutoringMonth: '',
          effectiveDate: '',
          tutoringProportion: '',
          startMonth:'',
          endMonth: '',
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
      this.$api.coefficient.findCoefficientTree({deptId:deptId}).then((res)=>{
        this.coeSchemeData = res
      })
    },
    // 状态格式化
    statusFormat: function (row, column){return row[column.property]===1?'正常':'禁用'},
    // 类型格式化
    typeFormat: function (row, column){
      if(row[column.property]===1){return '加分系数'}
      else{return '扣分系数'}
    },
    dateFormat: function (row, column) {
      return Dateformat(row[column.property])
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
      axios.post(baseUrl+'/deptCoe/download',params,{
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
    this.filters.deptId = deptIds
    this.findPage()
    this.findDeptTree(deptIds)
  },
}
</script>
<style scoped>
.el-table{
  font-size: 12px;
}
</style>
