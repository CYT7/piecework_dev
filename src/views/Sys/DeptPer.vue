<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-input v-model="filters.name" placeholder="职工名" />
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="sys:DeptPer:view" type="primary" @click="findPage()"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="sys:DeptPer:add" type="primary" @click="handleAdd"/>
        </el-form-item>
        <el-form-item>
          <el-upload action="#" class="el-upload" :limit="1" ref="upload"
                     :before-upload="beforeUpload" :http-request="UploadFile"
                     accept=".xls,.xlsx">
            <kt-button icon="fa fa-upload" type="primary" perms="sys:DeptPer:upload" :label="$t('action.upload')"/>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-file-excel-o" label="下载" perms="sys:DeptPer:download" type="primary" @click="handleDownLoad"/>
        </el-form-item>
        <el-form-item>
          <el-tooltip content="刷新" x-placement="top"><kt-button perms="sys:DeptPer:view" icon="fa fa-refresh" @click="findPage(null)"/></el-tooltip>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <!--表格内容栏-->
      <el-table :data="pageResult" v-if="pageResult[0]!= null"
                stripe size="mini" class="el-table"
                v-loading="loading" element-loading-text="$t('action.loading')" @selection-change="selectionChange">
        <el-table-column type="selection" width="30px"/>
        <el-table-column type="expand" width="25px">
          <template slot-scope="props">
            <el-table stripe :data="[[]]" width="100%">
              <el-table-column label="工作绩效产量" header-align="center" align="center">
                <el-table-column v-for="(item,i) in props.row.empList"
                                 :key="i" :label="item.coefficientName"
                                 header-align="center" align="center" min-width="50%">
                  {{item.value}}
                </el-table-column>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column prop="deptName" label="部门" header-align="center" align="center" width="50%" />
        <el-table-column prop="empNo" label="工号" header-align="center" align="center" width="65%" :formatter="empFormant"/>
        <el-table-column prop="empName" label="姓名" header-align="center" align="center" width="58%" />
        <el-table-column prop="month" label="月份" header-align="center" align="center" :formatter="dateFormat" width="58%" />
        <el-table-column prop="schemeName" label="方案" header-align="center" align="center" width="95%" />
        <el-table-column prop="nonPieceTime" label="非计件" header-align="center" align="center" width="58%" />
        <el-table-column prop="attendance" label="出勤" header-align="center" align="center" width="48%" />
        <el-table-column prop="absence" label="缺勤" header-align="center" align="center" width="48%" />
        <el-table-column prop="tutoringName" label="被辅导员" header-align="center" align="center" width="70%" />
        <el-table-column prop="tutoringMonth" label="辅导月数" header-align="center" align="center" width="70%" />
        <el-table-column label="分数" header-align="center" align="center">
          <el-table-column v-for="(item,i) in pageResult[0].scoreList" :key="i"
                           :label="scoreFormat(item.type)"
                           header-align="center" align="center" width="70%">
            <template slot-scope="scope">
              <span>{{scope.row.scoreList[i]?scope.row.scoreList[i].score:''}}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column prop="score" label="绩效分" header-align="center" align="center" width="58%" />
        <el-table-column prop="bonus" label="绩效工资" header-align="center" align="center" width="70%" />
        <el-table-column prop="updateBy" label="更新人" header-align="center" align="center" width="58%" />
        <el-table-column prop="status" label="状态" header-align="center" align="center" width="65%" >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 0" size="small">已确认</el-tag>
            <el-tag v-else-if="scope.row.status === 1" size="small">未确认</el-tag>
          </template>
        </el-table-column>
        <el-table-column header-align="center" align="center" :label="$t('action.operation')">
          <template slot-scope="scope" v-if="scope.row.status === 1" style="float: left;padding-left: 5px">
            <kt-button icon="fa fa-edit" :label="$t('action.edit')" perms="sys:DeptPer:edit" @click="handleEdit(scope.row)"/>
            <kt-button icon="fa fa-check-circle" :label="$t('action.agree')" perms="sys:DeptPer:confirm" type="primary"  @click="handleConfirm(scope.row)"/>
          </template>
        </el-table-column>
      </el-table>
      <!--分页栏-->
      <div class="toolbar" style="padding:10px;">
        <kt-button :label="$t('action.batchConfirm')" perms="sys:DeptPer:confirm" :size="size" type="primary" @click="handleBatchConfirm()"
                   :disabled="this.selections.length===0" style="float:left;" v-if="showBatchDelete"/>
        <el-pagination layout="total, prev, pager, next, jumper" @current-change="refreshPageRequest"
                       :current-page="pageRequest.pageNum" :page-size="pageRequest.pageSize" :total="totalSize" style="float:right;">
        </el-pagination>
      </div>
    </div>
    <!--下载界面-->
    <el-dialog title="下载" width="30%" :visible.sync="downloadVisible" :close-on-click-modal="false">
      <el-form :model="downForm" ref="downForm" :size="size" label-width="100px" label-position="right" style="text-align:left;">
        <el-form-item label="下载" prop="type">
          <el-radio-group v-model="downForm.type">
            <el-radio v-for="(type, index) in TypeList" :label="index" :key="index" @change.native="ChangeHandle(index)">{{type}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input :data="deptData" :props="deptTreeProps" :prop="downForm.deptName"
                            :nodeKey="''+downForm.deptId"
                            :currentChangeHandle="deptTreeCurrentChange"/>
        </el-form-item>
        <el-form-item label="月份" prop="month" v-if="downForm.type===0">
          <div class="block">
            <el-date-picker
              v-model="downForm.month"
              type="monthrange"
              unlink-panels
              range-separator="至"
              start-placeholder="开始月份"
              end-placeholder="结束月份"
              :picker-options="pickerOptions">
            </el-date-picker>
          </div>
        </el-form-item>
        <el-form-item label="月" prop="month" v-if="downForm.type===1">
          <div class="block" style="width: 100%">
            <el-date-picker
              v-model="downForm.months"
              type="month"
              placeholder="选择月">
            </el-date-picker>
          </div>
        </el-form-item>
        <el-form-item label="系数方案" prop="coefficientSid" v-if="downForm.type===1">
          <el-select style="width: 100%" placeholder="选择系数方案" value-key="id" v-model="downForm.coefficientSid">
            <el-option v-for="item in coeSchemeData" :key="item.id" :label="item.title" :value="item.id" @click.native="CoeSchemeChange(item)"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="downloadVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="submitDown">{{$t('action.submit')}}</el-button>
      </div>
    </el-dialog>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="30%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" :rules="dataFormRules"
               label-width="100px" ref="dataForm" :size="size" label-position="right" style="text-align:left;">
        <el-form-item label="ID" prop="id" v-if="false">
          <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input :data="deptData" :props="deptTreeProps" :prop="dataForm.deptName"
                            :nodeKey="''+dataForm.deptId"
                            :currentChangeHandle="deptTreeCurrentChangeHandle"/>
        </el-form-item>
        <el-form-item label="职工" prop="empNo">
          <el-select style="width: 100%" placeholder="选择职工" value-key="id" v-model="dataForm.empNo">
            <el-option v-for="item in empData" :key="item.empNo" :label="item.name" :value="item.empNo" @click.native="empCurrentChangeHandle(item)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="月份" prop="month">
          <div class="block">
            <el-date-picker
              v-model="dataForm.month"
              type="month"
              placeholder="选择月"
              value-format="yyyy-MM-dd" @change="findCoefficientTree(dataForm)">
            </el-date-picker>
          </div>
        </el-form-item>
        <el-form-item v-if="operation" label="系数方案" prop="coefficientSid">
          <el-select style="width: 100%" placeholder="选择系数方案" value-key="id" v-model="dataForm.coefficientScheme">
            <el-option v-for="item in coeSchemeData" :key="item.id" :label="item.title" :value="item.id" @click.native="CoeSchemeCurrentChange(item)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="非计件时间" prop="nonPieceTime">
          <el-input v-model="dataForm.nonPieceTime" placeholder="请填写非计件时间"/>
        </el-form-item>
        <el-form-item label="出勤天数" prop="attendance">
          <el-input v-model="dataForm.attendance" placeholder="请填写出勤天数"/>
        </el-form-item>
        <el-form-item label="缺勤天数" prop="absence">
          <el-input v-model="dataForm.absence" placeholder="请填写缺勤天数"/>
        </el-form-item>
        <el-form-item label="辅导员工" prop="tutoringEmp">
          <el-select style="width: 100%" placeholder="选择辅导职工" value-key="id" v-model="dataForm.tutoringEmp">
            <el-option v-for="item in empPerData" :key="item.empNo" :label="item.empName" :value="item.empNo"/>
          </el-select>
        </el-form-item>
        <el-form-item label="辅导月数" prop="tutoringMonth">
          <el-input v-model="dataForm.tutoringMonth" placeholder="请填写非计件时间"/>
        </el-form-item>
        <el-form-item v-if="operation" v-for="(item,index) in dataForm.coefficientList" :key="index" :label="scoreFormat(item.type)" prop="coefficientList">
          <el-card>
            <el-form-item v-for="(i,t) in item.empCoe" :key="t" :label="i.coefficientName">
              <el-input v-model="i.value"></el-input>
            </el-form-item>
          </el-card>
        </el-form-item>
        <el-form-item v-if="!operation" v-for="(item,index) in dataForm.empList" :key="index" :label="item.coefficientName">
          <el-input v-model="item.value"></el-input>
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
import KtTable from "../Core/KtTable";
import KtButton from "../Core/KtButton";
import PopupTreeInput from "../../components/PopupTreeInput";
import {formats} from "../../utils/datetime";
import axios from "axios";
import {baseUrl} from "../../utils/global";
import Cookies from "js-cookie";
const deptIds = sessionStorage.getItem("deptId");
export default {
  name: "DeptPer",
  components: {PopupTreeInput, KtButton, KtTable},
  props:{showBatchDelete: {type: Boolean, default: true}},//是否显示操作组件
  data(){
    return{
      size: "small",
      loading: false,//加载标识
      filters: {name: ""},//查询
      pageRequest: {pageNum: 1, pageSize: 10},//分页信息
      totalSize:0,//总共数量
      selections: [],//列表选中列
      pageResult: {
        scoreList:{points:'', score:'',},
        empList: {id:'', coefficientId:'', coefficientName:'', value:'',},
      },
      operation: false, // true:新增, false:编辑
      dialogVisible: false, // 新增编辑界面是否显示
      downloadVisible:false,// 下载页面是否显示
      TypeList:['导出绩效','导出填写模板'],
      editLoading: false,
      // 新增编辑界面数据
      dataForm: [],
      dataFormRules: {
        empNo: [{ required: true, message: '请选择职工', trigger: 'blur' }],
      },
      downForm:[],
      deptData: [],
      coeSchemeData:[],
      deptTreeProps: {
        label: 'name',
        children: 'children'
      },
      empData:[],
      empPerData:[],
      pickerOptions: {
        shortcuts: [{
          text: '本月',
          onClick(picker) {
            const end = new Date(new Date().getFullYear(), new Date().getMonth(),1,0,0,0);
            const start = new Date(new Date().getFullYear(), new Date().getMonth(),1,0,0,0);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '今年至今',
          onClick(picker) {
            const end = new Date(new Date().getFullYear(), new Date().getMonth(),1,0,0,0);
            const start = new Date(new Date().getFullYear(), 0,1,0,0,0);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近六个月',
          onClick(picker) {
            const end = new Date(new Date().getFullYear(), new Date().getMonth(),1,0,0,0);
            const start = new Date(new Date().getFullYear(), new Date().getMonth()-6,1,0,0,0);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
    }
  },
  methods:{
    //获取分页数据
    findPage: function () {
      this.loading = true;
      this.pageRequest.params = [{name:'name', value:this.filters.name},{name:'deptId', value:deptIds}]
      this.$api.deptPer.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data
        this.totalSize = res.totalSize
      })
      this.loading = false
    },
    //选择切换
    selectionChange: function (selections) {
      this.selections = [];
      selections.forEach(i=>{
        if (i.status === 1){
          this.selections.push(i)
        }
      })
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
      this.$api.deptPer.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data
        this.totalSize = res.totalSize
      })
      this.loading = false
    },
    //显示新增界面
    handleAdd: function () {
      this.dialogVisible = true
      this.operation = true
      this.dataForm = {
        id: 0,
        deptId: '',
        empNo: '',
        empName:'',
        month:'',
        coefficientScheme:'',
        nonPieceTime:'',
        attendance:'',
        absence: '',
        tutoringEmp:'',
        tutoringMonth:'',
        coefficientList: {}
      }
    },
    handleDownLoad: function (){
      this.downloadVisible = true
      this.ChangeHandle(0)
    },
    ChangeHandle: function(data){
      let type = data
      if (data===0){
        this.downForm = {
          month:[],
          deptId: '',
          deptName:'',
          type:type
        }
      }else{
        this.downForm = {
          months:'',
          deptId: '',
          deptName:'',
          type:type,
          coefficientSid:'',
          schemeName:"",
        }
      }
    },
    //显示编辑界面
    handleEdit: function(row) {
      this.dialogVisible = true;
      this.operation = false
      this.dataForm=Object.assign({}, row);
    },
    //批量确认
    handleBatchConfirm: function () {
      let ids = []
      this.selections.forEach(t=>{ids.push(t.id)})
      this.confirm(ids)
    },
    // 确认
    handleConfirm(row){
      let ids = [row.id];
      this.confirm(ids)
    },
    confirm: function (params) {
      this.$confirm("确认此条信息无误吗？","提示",{
        type:"warning"
      }).then(()=>{
        this.loading = true;
        this.$api.deptPer.confirm({"performanceId":params}).then((res)=>{
          if (res.code===200){
            this.$message({ message: "确认成功", type: "success" });
          }else{
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.findPage();
          this.loading = false
        })
      })
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
    // 编辑
    submitForm: function () {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true
            let params = Object.assign({}, this.dataForm)
            if (params.coefficientList!=null){
              let empFinishList= []
              for (let i=0,len = params.coefficientList.length;i<len;i++){
                let empPerList = []
                params.coefficientList[i].empCoe.forEach(t=>{
                  let empPer = {
                    points:params.coefficientList[i].points,
                    coefficientId : t.coefficientId,
                    coefficientName: t.coefficientName,
                    value : t.value
                  }
                  empPerList.push(empPer)
                })
                empFinishList.push(empPerList)
              }
              let empCoeList = []
              empFinishList.forEach(t=>{t.forEach(i=>{empCoeList.push(i)})})
              params.empCoeList = empCoeList
            }else{params.empCoeList = params.empList}
            if (this.operation){
              this.$api.deptPer.save(params).then((res)=>{
                this.editLoading = false
                if(res.code === 200) {
                  this.$message({ message: '操作成功', type: 'success' })
                  this.dialogVisible = false
                  this.$refs['dataForm'].resetFields()
                } else {
                  this.$message({message: '操作失败, ' + res.msg, type: 'error'})
                }
                this.findPage()
              })
            }else{
              this.$api.deptPer.update(params).then((res)=>{
                this.editLoading = false
                if(res.code === 200) {
                  this.$message({ message: '操作成功', type: 'success' })
                  this.dialogVisible = false
                  this.$refs['dataForm'].resetFields()
                } else {
                  this.$message({message: '操作失败, ' + res.msg, type: 'error'})
                }
                this.findPage()
              })
            }
          })
        }
      })
    },
    // 获取部门列表
    findDeptTree: function (deptId) {this.$api.dept.findDeptTree({'deptId':deptId}).then((res) => {this.deptData = res.data
    })},
    // 获取职工列表
    findEmpTree: function (deptId){
      this.$api.emp.findEmpTree({'deptId':deptId}).then((res)=>{this.empData = res.data})
    },
    //获取方案树
    findCoefficientTree:function (item){
      this.$api.coefficient.findCoefficientTree({deptId:item.deptId,month:item.month}).then((res)=>{
        this.coeSchemeData = res
      })
    },
    findCoeList: function (sid) {this.$api.coefficient.findCoeList({'sid':sid}).then((res)=>{
      let CoeList = []
      res.forEach(i=>{
        let points = i.points;
        let empCoe = []
        i.children.forEach(j=>{
          let coefficient = {
            coefficientId:j.id,
            coefficientName:j.title,
            value:''
          }
          empCoe.push(coefficient)
        })
        CoeList.push({points,empCoe})
      })
      this.dataForm.coefficientList = CoeList
    })},
    deptTreeCurrentChange (data) {
      this.downForm.deptId = data.id
      this.downForm.deptName = data.name
    },
    // 菜单树选中
    deptTreeCurrentChangeHandle (data) {
      this.dataForm.deptId = data.id
      this.dataForm.deptName = data.name
      this.findEmpTree(data.id)
    },
    empCurrentChangeHandle: function (data){
      this.dataForm.empNo = data.empNo
      this.dataForm.empName = data.name
    },
    CoeSchemeCurrentChange:function (data){
      this.dataForm.coefficientScheme = data.id
      this.findCoeList(data.id)
    },
    CoeSchemeChange:function (data){
      this.downForm.coefficientSid = data.id
      this.downForm.schemeName = data.title
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
    //上传文件
    UploadFile(param){
      const formData = new FormData()
      formData.append('file', param.file) // 要提交给后台的文件
      this.$api.deptPer.upload(formData).then(res=>{
        if(res.code === 200) {
          this.$message({ message: '操作成功', type: 'success' })
          this.$refs['upload'].clearFiles();
        } else {
          this.$message({message: '操作失败, ' + res.msg, type: 'error'})
        }
      })
    },

    //下载文件
    exportExcelFile: function (params) {
      axios.post(baseUrl+'/DeptPer/download',params,{
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
    // 时间格式化
    dateFormat: function (row, column){return formats(row[column.property])},
    empFormant: function (row,column){
      return row[column.property].toString().padStart(6,'0')
    },
    dateFormats:function (item){return formats(item)},
    scoreFormat: function (item){
      switch (item) {
        case 0:
          return '扣分';
        case 1:
          return '加分';
        case 2:
          return '非计件';
        case 3:
          return '辅导';
        default:
          return '标准产量';
      }
    },
  },
  mounted() {
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
