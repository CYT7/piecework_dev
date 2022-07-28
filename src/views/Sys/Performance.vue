<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left: 15px;">
      <el-form :inline="true" :model="filters" :size="size" ref="filters" class="el-form--inline">
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input :data="deptData" :props="deptTreeProps" :prop="filters.deptName"
                            :nodeKey="''+filters.deptId" :currentChangeHandle="deptTreeFilters"/>
        </el-form-item>
        <el-form-item label="方案名" prop="scheme">
          <el-input v-model="filters.scheme" placeholder="方案名查询"/>
        </el-form-item>
        <el-form-item label="职工名" prop="empName">
          <el-input v-model="filters.empName" placeholder="职工名查询" />
        </el-form-item>
        <el-form-item label="月份范围" prop="months">
          <el-date-picker v-model="filters.monthRange" type="monthrange" unlink-panels range-separator="至"
                          start-placeholder="开始月份" end-placeholder="结束月份" :picker-options="pickerOptions"/>
        </el-form-item>
        <el-form-item>
          <el-tooltip :content="$t('action.search')" x-placement="top">
            <kt-button icon="fa fa-search" :circle="true"
                       perms="sys:performance:view" type="primary" @click="findPage"/>
          </el-tooltip>
          <el-tooltip :content="$t('action.reset')" x-placement="top">
            <kt-button icon="fa fa-repeat" :circle="true"
                       perms="sys:performance:view" type="primary" @click="resetFindPage"/>
          </el-tooltip>
          <el-tooltip :content="$t('action.export')" x-placement="top">
            <kt-button icon="fa fa-file-excel-o" :circle="true"
                       perms="sys:performance:download" type="primary" @click="handleDownLoad"/>
          </el-tooltip>
          <el-tooltip :content="$t('action.refresh')" x-placement="top">
            <kt-button perms="sys:performance:view" :circle="true" icon="fa fa-refresh" @click="findPage(null)"/>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <!--表格内容栏-->
      <el-table :data="pageResult" v-if="pageResult[0]!= null" stripe size="mini" style="width: 100%;" class="el-table"
                v-loading="loading" :element-loading-text="$t('action.loading')" @selection-change="selectionChange">
        <el-table-column type="selection" width="30px"/>
        <el-table-column type="expand" width="25px">
          <template slot-scope="props">
            <el-table stripe border fit highlight-current-row :data="[[]]" width="100%">
              <el-table-column label="工作绩效产量" header-align="center" align="center">
                <el-table-column v-for="(item,i) in props.row.empList" :key="i" :label="item.coefficientName"
                                 header-align="center" align="center" min-width="50%">
                  {{item.value}}
                </el-table-column>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column prop="deptName" label="部门" header-align="center" align="center" min-width="50%" width="90%" />
        <el-table-column prop="empNo" label="工号" header-align="center" align="center" min-width="50%"  width="90%" :formatter="empFormant"/>
        <el-table-column prop="empName" label="姓名" header-align="center" align="center" min-width="50%"  width="90%" />
        <el-table-column prop="month" label="月份" header-align="center" align="center" :formatter="dateFormat" min-width="50%"  width="90%" />
        <el-table-column prop="schemeName" label="方案明细" header-align="center" align="center" min-width="50%"  width="90%" />
        <el-table-column prop="nonPieceTime" label="非计件时间(h)" header-align="center" align="center" min-width="50%"  width="90%" />
        <el-table-column prop="attendance" label="出勤(d)" header-align="center" align="center" min-width="50%"  width="90%" />
        <el-table-column prop="absence" label="缺勤(d)" header-align="center" align="center" min-width="50%"  width="90%" />
        <el-table-column prop="tutoringName" label="被辅导员" header-align="center" align="center" min-width="50%"  width="90%" />
        <el-table-column prop="tutoringMonth" label="辅导月份" header-align="center" align="center"  min-width="50%" width="90%" />
        <el-table-column label="分数" header-align="center" align="center">
          <el-table-column v-for="(item,i) in pageResult[0].scoreList" :key="i" :label="scoreFormat(item.type)"
                           header-align="center" align="center" width="70%">
            <template slot-scope="scope">
              <span>{{scope.row.scoreList[i]?scope.row.scoreList[i].score:''}}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column prop="score" label="绩效分" header-align="center" align="center" min-width="50%"  width="90%" />
        <el-table-column prop="bonus" label="绩效工资" header-align="center" align="center" min-width="50%"  width="90%" />
        <el-table-column prop="updateBy" label="更新人" header-align="center" align="center" min-width="50%"  width="90%" />
        <el-table-column prop="status" label="状态" header-align="center" align="center" min-width="50%"  width="90%" >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 0" size="small">已确认</el-tag>
            <el-tag v-else-if="scope.row.status === 1" size="small">未确认</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checkStatus" label="审核" header-align="center" align="center" min-width="50%"  width="90%" >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.checkStatus === 0" size="small">待审核</el-tag>
            <el-tag v-else-if="scope.row.checkStatus === 1" size="small">通过</el-tag>
            <el-tag v-else-if="scope.row.checkStatus === 2" size="small">未通过</el-tag>
          </template>
        </el-table-column>
        <el-table-column header-align="center" align="center" :label="$t('action.operation')"  min-width="50%">
          <template slot-scope="scope">
            <el-tooltip :content="$t('action.disagree')" x-placement="top">
              <kt-button v-if="scope.row.checkStatus === 0" icon="fa fa-times" :circle="true"
                         perms="sys:performance:disagree" type="warning" @click="disagreePerformance(scope.row)"/>
            </el-tooltip>
            <el-tooltip :content="$t('action.agree')" x-placement="top">
              <kt-button v-if="scope.row.checkStatus === 0" icon="fa fa-check" :circle="true"
                         perms="sys:performance:agree" type="primary" @click="agreePerformance(scope.row)"/>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页栏-->
      <div class="toolbar" style="padding:10px;">
        <kt-button :label="$t('action.batchConfirm')" perms="sys:performance:agree" :size="size" type="primary" style="float:left;"
                   :disabled="this.selections.length===0" v-if="showBatch" @click="handleBatchConfirm"/>
        <kt-button :label="$t('action.batchDisagree')" perms="sys:performance:disagree" :size="size" type="warning"
                   :disabled="this.selections.length===0" style="float:left;" v-if="showBatch" @click="handleBatchUnconfirmed"/>
        <el-pagination layout="total, prev, pager, next, jumper" @current-change="refreshPageRequest"
                       :current-page="pageRequest.pageNum" :page-size="pageRequest.pageSize"
                       :total="totalSize" style="float:right;">
        </el-pagination>
      </div>
    </div>
    <el-dialog title="导出绩效" width="30%" :visible.sync="downloadVisible" :close-on-click-modal="false">
      <el-form :model="downForm" ref="downForm" :size="size" label-width="100px"
               label-position="right" style="text-align:left;" :rules="downFormRules">
        <el-form-item label="选项" prop="type">
          <el-radio-group v-model="downForm.type">
            <el-radio v-for="(type, index) in TypeList" :label="index" :key="index">{{type}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input :data="deptData" :props="deptTreeProps" :prop="downForm.deptName"
                            :nodeKey="''+downForm.deptId" :currentChangeHandle="exportDeptChange"/>
        </el-form-item>
        <el-form-item label="月份" prop="month">
          <div class="block">
            <el-date-picker v-model="downForm.month" type="monthrange" unlink-panels
              range-separator="至" start-placeholder="开始月份" end-placeholder="结束月份" :picker-options="pickerOptions">
            </el-date-picker>
          </div>
        </el-form-item>
        <el-form-item label="系数方案" prop="schemeId" v-if="downForm.type===1">
          <el-select style="width: 100%" placeholder="选择系数方案" value-key="id" v-model="downForm.schemeId">
            <el-option v-for="item in schemeData" :key="item.id" :label="item.title"
                       :value="item.id" @click.native="exportSchemeChange(item)"></el-option>
          </el-select>
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
import {formats} from "../../utils/datetime";
import axios from "axios";
import {baseUrl} from "../../utils/global";
import Cookies from "js-cookie";
export default {
  name: "Performance",
  components: {PopupTreeInput, KtButton, KtTable},
  props:{showBatch: {type: Boolean, default: true}},//是否显示操作组件
  data(){
    return {
      size: "small",
      loading: false, // 加载标识
      filters: {deptId: '', deptName: '', scheme: '', empName: '', monthRange: ''}, // 查询信息
      pageRequest: {pageNum: 1, pageSize: 10},// 分页信息
      totalSize: 0,// 总共数量
      selections: [],// 列表选中列
      pageResult: {
        scoreList: {points: '', score: '',},
        empList: {id: '', coefficientId: '', coefficientName: '', value: '',},
      }, // 分页结果
      downloadVisible: false,// 下载页面是否显示
      downForm: [], // 导出信息
      deptData: [], // 部门数据
      deptTreeProps: {label: 'name', children: 'children'},
      schemeData: [], // 方案数据
      TypeList: ['导出绩效', '导出详细绩效'], // 导出选项
      downFormRules: {type: [{required: true, message: '请选择导出类型', trigger: 'change'}]}, // 模板选项
      pickerOptions: {
        shortcuts: [{
          text: '本月',
          onClick(picker) {
            const end = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0);
            const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '今年至今',
          onClick(picker) {
            const end = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0);
            const start = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近六个月',
          onClick(picker) {
            const end = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0);
            const start = new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1, 0, 0, 0);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
    };
  },
  methods:{
    // 处理导出
    handleDownLoad: function (){
      this.downloadVisible = true
      this.downForm = {
        type:'',
        month:[],
        name:'',
        deptId: '',
        schemeId: '',
        empName: '',
      }
    },
    // 重置查找页面
    resetFindPage : function (){
      this.$refs['filters'].resetFields()
      const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0);
      const end = new Date(new Date().getFullYear(), new Date().getMonth(),1,0,0,0);
      this.filters= {deptId:'',deptName:'',scheme:'',empName:'',monthRange: [start, end]}
      this.findPage()
    },
    // 获取分页数据
    findPage: function () {
      this.loading = true;
      this.filters.pageRequest = this.pageRequest
      this.$api.performance.findPage(this.filters).then((res) => {
        this.pageResult = res.data
        this.totalSize = res.totalSize
      })
      this.loading = false
    },
    // 换页刷新
    refreshPageRequest: function (pageNum) {
      this.pageRequest.pageNum = pageNum;
      this.pageRequest.pageSize = 10;
      this.filters.pageRequest = this.pageRequest
      this.loading = true;
      this.$api.performance.findPage( this.filters).then((res) => {
        this.pageResult = res.data
        this.totalSize = res.totalSize
      })
      this.loading = false
    },
    // 选择切换
    selectionChange: function (selections) {this.selections = selections;},
    // 批量通过
    handleBatchConfirm: function (){
      let ids = []
      this.selections.forEach(t => {if (t.checkStatus===0) {ids.push(t.id)}})
      if (ids.length === 0) {
        this.$message({message: '没有需要处理的内容，请勿操作', type: 'error'})
        this.selections = []
        this.findPage();
      }else{
        this.$confirm('确定通过选中的信息吗?', '提示', {type: 'warning'}).then(() => {
          this.loading = true;
          this.$api.performance.confirm({'performanceId':ids}).then(res=>{
            if (res.code === 200) {
              this.$message({message: res.msg, type: 'success'})
              this.findPage()
            }else {
              this.$message({message:res.msg, type: 'error'})
            }
            this.loading = false
          })
        });
      }
    },
    // 批量不通过
    handleBatchUnconfirmed : function (){
      let ids = []
      this.selections.forEach(t => {if (t.checkStatus===0) {ids.push(t.id)}})
      if (ids.length === 0) {
        this.$message({message: '没有需要处理的内容，请勿操作', type: 'error'})
        this.selections = []
        this.findPage();
      }else {
        this.$api.performance.disagree({'performanceId':ids}).then(res=>{
          if (res.code === 200) {
            this.$message({message: res.msg, type: 'success'})
            this.findPage()
          }else {
            this.$message({message:res.msg, type: 'error'})
          }
          this.loading = false
        })
      }
    },
    // 不通过绩效
    disagreePerformance: function (params) {
      this.$confirm('确定不通过选中的信息吗?', '提示', {type: 'warning'}).then(() => {
        this.loading = true;
        this.$api.performance.disagree({'performanceId':[params.id]}).then(res=>{
          if (res.code === 200) {
            this.$message({message: res.msg, type: 'success'})
            this.findPage()
          }else {
            this.$message({message:res.msg, type: 'error'})
          }
          this.loading = false
        })
      });
    },
    // 通过绩效
    agreePerformance: function (params) {
      this.$confirm('确定通过选中的信息吗?', '提示', {type: 'warning'}).then(() => {
        this.loading = true;
        this.$api.performance.confirm({'performanceId':[params.id]}).then(res=>{
          if (res.code === 200) {
            this.$message({message: res.msg, type: 'success'})
            this.findPage()
          }else {
            this.$message({message:res.msg, type: 'error'})
          }
          this.loading = false
        })
      });
    },
    // 获取部门列表
    findDeptTree: function () {this.$api.dept.findTree().then((res) => {this.deptData = res.data})},
    // 获取方案树
    findCoefficientTree:function (deptId){this.$api.coefficient.findCoefficientTree({deptId:deptId}).then((res)=>{this.schemeData = res});},
    // 查询部门选中
    deptTreeFilters(data) {
      this.filters.deptId = data.id
      this.filters.deptName = data.name
    },
    // 导出部门选中
    exportDeptChange (data) {
      this.downForm.deptId = data.id
      this.downForm.deptName = data.name
      this.findCoefficientTree(data.id)
    },
    // 导出方案选中
    exportSchemeChange:function (data){
      this.downForm.schemeId = data.id
      this.downForm.schemeName = data.title
    },
    // 导出前效验
    submitDown:function (){
      this.$refs.downForm.validate((valid)=>{
        if (valid){
          let params = Object.assign({},this.downForm)
          if (params.type === 1){
            if (params.deptId === ''){
              this.$message({message: '请选择部门', type: 'warning'});
            }else{
              this.exportExcelFile(params);
              this.downloadVisible = false;
              this.$refs['downForm'].resetFields()
            }
          }else {
            this.exportExcelFile(params);
            this.downloadVisible = false;
            this.$refs['downForm'].resetFields()
          }
        }
      })
    },
    // 导出Excel
    exportExcelFile: function (params) {
      axios.post(baseUrl+'/performance/download',params,{
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
    // 日期格式化
    dateFormat: function (row, column){return formats(row[column.property])},
    // 日期格式化
    dateFormats:function (item){return formats(item)},
    // 职工号格式化
    empFormant: function (row,column){return row[column.property].toString().padStart(6,'0')},
    // 分数格式化
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
    const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0);
    const end = new Date(new Date().getFullYear(), new Date().getMonth(),1,0,0,0);
    this.filters.monthRange = [start, end];
    this.findPage()
    this.findDeptTree()
  },
}
</script>
<style scoped>
</style>
