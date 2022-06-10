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
          <el-tooltip content="刷新" x-placement="top"><kt-button perms="sys:performance:view" icon="fa fa-refresh" @click="findPage(null)"/></el-tooltip>
          <el-tooltip content="导出" placement="top"><kt-button perms="sys:performance:download" icon="fa fa-file-excel-o" @click="exportExcelFile"></kt-button></el-tooltip>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <!--表格内容栏-->
      <el-table :data="pageResult" v-if="pageResult[0]!= null" stripe size="mini" style="width: 100%;" v-loading="loading" element-loading-text="$t('action.loading')"
                @selection-change="selectionChange">
        <el-table-column type="selection" width="40"/>
        <el-table-column type="expand" width="40">
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
        <el-table-column sortable prop="deptName" label="部门" header-align="center" align="center" min-width="50%"/>
        <el-table-column sortable prop="empNo" label="职工号" header-align="center" align="center" min-width="60%"/>
        <el-table-column sortable prop="empName" label="姓名" header-align="center" align="center" min-width="60%"/>
        <el-table-column sortable prop="month" label="月份" header-align="center" align="center" :formatter="dateFormat" min-width="60%"/>
        <el-table-column sortable prop="status" label="状态" header-align="center" align="center" min-width="60%">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 0" size="small">已确认</el-tag>
            <el-tag v-else-if="scope.row.status === 1" size="small">可编辑</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分数" header-align="center" align="center" min-width="60%">
          <el-table-column v-for="(item,i) in pageResult[0].scoreList" :key="i"
                           :label="scoreFormat(item.points)"
                           header-align="center" align="center" min-width="80%">
            <template slot-scope="scope">
              <span>{{scope.row.scoreList[i]?scope.row.scoreList[i].score:''}}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column sortable prop="score" label="总分数" header-align="center" align="center" min-width="50%"/>
        <el-table-column sortable prop="updateBy" label="更新人" header-align="center" align="center" min-width="60%"/>
<!--        <el-table-column header-align="center" align="center" :label="$t('action.operation')" min-width="100%">-->
<!--          <template slot-scope="scope" v-if="scope.row.status === 1">-->
<!--            <kt-button icon="fa fa-edit" :label="$t('action.edit')" perms="sys:performance:edit" @click="handleEdit(scope.row)"/>-->
<!--            <kt-button icon="fa fa-check-circle" :label="$t('action.agree')" perms="sys:performance:confirm" type="primary"  @click="handleConfirm(scope.row)"/>-->
<!--          </template>-->
<!--        </el-table-column>-->
      </el-table>
      <!--分页栏-->
      <div class="toolbar" style="padding:10px;">
        <kt-button :label="$t('action.batchConfirm')" perms="sys:performance:confirm" :size="size" type="primary" @click="handleBatchConfirm()"
                   :disabled="this.selections.length===0" style="float:left;" v-if="showBatchDelete"/>
        <el-pagination layout="total, prev, pager, next, jumper" @current-change="refreshPageRequest"
                       :current-page="pageRequest.pageNum" :page-size="pageRequest.pageSize" :total="totalSize" style="float:right;">
        </el-pagination>
      </div>
    </div>
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
    //下载文件
    exportExcelFile: function () {
      axios.get(baseUrl+'/performance/download',{
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
    dateFormats:function (item){return formats(item)},
    scoreFormat: function (item){
      if(item===1){return '加分分数'}
      else if (item === 0){return '扣分分数'}
      else{return '考勤分数'}
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
