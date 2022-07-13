<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item><el-input v-model="filters.name" placeholder="职工名" /></el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="sys:performance:view" type="primary" @click="findPage()"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-file-excel-o" label="导出" perms="sys:performance:download" type="primary" @click="handleDownLoad"/>
        </el-form-item>
        <el-form-item>
          <el-tooltip content="刷新" x-placement="top"><kt-button perms="sys:performance:view" icon="fa fa-refresh" @click="findPage(null)"/></el-tooltip>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <!--表格内容栏-->
      <el-table :data="pageResult" v-if="pageResult[0]!= null" stripe size="mini" style="width: 100%;" v-loading="loading" element-loading-text="$t('action.loading')"
                @selection-change="selectionChange">
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
        <el-table-column prop="deptName" label="部门" header-align="center" align="center" min-width="50%" width="90%" />
        <el-table-column prop="empNo" label="工号" header-align="center" align="center" min-width="50%"  width="90%" :formatter="empFormant"/>
        <el-table-column prop="empName" label="姓名" header-align="center" align="center" min-width="50%"  width="90%" />
        <el-table-column prop="month" label="月份" header-align="center" align="center" :formatter="dateFormat" min-width="50%"  width="90%" />
        <el-table-column prop="schemeName" label="方案" header-align="center" align="center" min-width="50%"  width="90%" />
        <el-table-column prop="nonPieceTime" label="非计件" header-align="center" align="center" min-width="50%"  width="90%" />
        <el-table-column prop="attendance" label="出勤" header-align="center" align="center" min-width="50%"  width="90%" />
        <el-table-column prop="absence" label="缺勤" header-align="center" align="center" min-width="50%"  width="90%" />
        <el-table-column prop="tutoringName" label="被辅导员" header-align="center" align="center" min-width="50%"  width="90%" />
        <el-table-column prop="tutoringMonth" label="辅导月份" header-align="center" align="center"  min-width="50%" width="90%" />
        <el-table-column label="分数" header-align="center" align="center">
          <el-table-column v-for="(item,i) in pageResult[0].scoreList" :key="i"
                           :label="scoreFormat(item.type)"
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
      </el-table>
      <!--分页栏-->
      <div class="toolbar" style="padding:10px;">
        <kt-button :label="$t('action.batchConfirm')" perms="sys:performance:confirm" :size="size" type="primary"
                   :disabled="this.selections.length===0" style="float:left;" v-if="showBatchDelete"/>
        <el-pagination layout="total, prev, pager, next, jumper" @current-change="refreshPageRequest"
                       :current-page="pageRequest.pageNum" :page-size="pageRequest.pageSize" :total="totalSize" style="float:right;">
        </el-pagination>
      </div>
    </div>
    <el-dialog title="导出绩效" width="30%" :visible.sync="downloadVisible" :close-on-click-modal="false">
      <el-form :model="downForm" ref="downForm" :size="size" label-width="100px" label-position="right" style="text-align:left;">
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input :data="deptData" :props="deptTreeProps" :prop="downForm.deptName"
                            :nodeKey="''+downForm.deptId"
                            :currentChangeHandle="deptTreeCurrentChange"/>
        </el-form-item>
        <el-form-item label="月份" prop="month">
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
        <el-form-item label="职工" prop="name">
          <el-input v-model="downForm.name" placeholder="查询某职工"/>
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
      downloadVisible:false,// 下载页面是否显示
      downForm:[],
      deptData: [],
      deptTreeProps: {
        label: 'name',
        children: 'children'
      },
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
      this.pageRequest.params = [{name:'name', value:this.filters.name}]
      this.$api.performance.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data
        this.totalSize = res.totalSize
      })
      this.loading = false
    },
    //选择切换
    selectionChange: function (selections) {
      selections.forEach(i=>{if (i.status === 1){this.selections.push(i)}})
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
      this.$api.performance.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data
        this.totalSize = res.totalSize
      })
      this.loading = false
    },
    handleDownLoad: function (){
      this.downloadVisible = true
      this.downForm = {
        month:[],
        name:'',
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
    //下载文件
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
    // 获取部门列表
    findDeptTree: function () {this.$api.dept.findTree().then((res) => {this.deptData = res.data})},
    deptTreeCurrentChange (data) {
      this.downForm.deptId = data.id
      this.downForm.deptName = data.name
    },
    // 时间格式化
    dateFormat: function (row, column){return formats(row[column.property])},
    empFormant: function (row,column){
      return row[column.property].toString().padStart(6,'0')
    },
    dateFormats:function (item){return formats(item)},
    scoreFormat: function (item){
      if(item===1){return '加分'}
      else if (item === 0){return '扣分'}
      else{return '考勤'}
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
