<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item><el-input v-model="filters.name" aria-placeholder="职工名" /></el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="sys:performance:view" type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="sys:performance:add" type="primary" @click="handleAdd"/>
        </el-form-item>
        <el-form-item>
          <el-tooltip content="刷新" x-placement="top"><el-button icon="fa fa-refresh" @click="findPage(null)"/></el-tooltip>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <!--表格内容栏-->
      <el-table :data="pageResult" v-if="pageResult[0]!= null" stripe size="mini" style="width: 100%;" v-loading="loading" element-loading-text="$t('action.loading')"
                @selection-change="selectionChange">
        <el-table-column type="selection" width="40"/>
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-table stripe :data="[[]]" width="100%">
              <el-table-column v-for="(item,i) in props.row.empList" :key="i" :label="item.coefficientName" aria-rowcount="1" header-align="center" align="center" min-width="50%">
                {{item.value}}
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
            <el-tag v-if="scope.row.status === 0" size="small">不可编辑</el-tag>
            <el-tag v-else-if="scope.row.status === 1" size="small">可编辑</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分数" header-align="center" align="center" min-width="60%">
          <el-table-column v-for="(item,i) in pageResult[0].scoreList" :key="i" :label="statusFormat(item.points)" header-align="center" align="center" min-width="80%">
            <template slot-scope="scope">
              <span>{{scope.row.scoreList[i]?scope.row.scoreList[i].score:''}}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column header-align="center" align="center" :label="$t('action.operation')" min-width="100%">
          <template slot-scope="scope" v-if="scope.row.status === 1">
            <kt-button icon="fa fa-edit" :label="$t('action.edit')" perms="sys:performance:edit" @click="handleEdit(scope.row)"/>
            <kt-button icon="fa fa-check-circle" :label="$t('action.agree')" perms="sys:performance:confirm" @click="handleConfirm(scope.row)"/>
          </template>
        </el-table-column>
      </el-table>
      <!--分页栏-->
      <div class="toolbar" style="padding:10px;">
        <kt-button :label="$t('action.batchConfirm')" perms="sys:performance:confirm" :size="size" type="danger" @click="handleBatchConfirm()"
                   :disabled="this.selections.length===0" style="float:left;" v-if="showBatchDelete"/>
        <el-pagination layout="total, prev, pager, next, jumper" @current-change="refreshPageRequest"
                       :current-page="pageRequest.pageNum" :page-size="pageRequest.pageSize" :total="totalSize" style="float:right;">
        </el-pagination>
      </div>
    </div>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form v-if="operation===true" :model="dataForm" label-width="80px" ref="dataForm" :size="size" label-position="right">
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
              value-format="yyyy-MM-dd"
            >
            </el-date-picker>
          </div>
        </el-form-item>
        <div v-if="coeData[0]!=null">
          <el-form-item v-for="(item,index) in dataForm.coefficientList" :key="index" :label="item.coefficientName" prop="coefficientList">
            <el-input v-model="item.value" aria-placeholder="请输入值"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <el-form v-if="operation===false" :model="dataForm" label-width="80px" ref="dataForm" :size="size" label-position="right">
        <el-form-item label="部门" prop="deptName">{{dataForm.deptName}}</el-form-item>
        <el-form-item label="职工" prop="empName">{{dataForm.empName}}</el-form-item>
        <el-form-item v-for="(item,index) in dataForm.coefficientList" :key="index" :label="item.coefficientName">
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
export default {
  name: "Performance",
  components: {PopupTreeInput, KtButton, KtTable},
  props:{
    showBatchDelete: {//是否显示操作组件
      type: Boolean,
      default: true
    }
  },
  data(){
    return{
      size: "small",
      loading: false,//加载标识
      filters: {name: ""},
      //分页信息
      pageRequest: {
        pageNum: 1,
        pageSize: 10
      },
      totalSize:0,
      pageResult: {
        scoreList:{
          points:'',
          score:'',
        },
        empList: {
          coefficientId:'',
          coefficientName:'',
          value:'',
        },
      },
      operation: false, // true:新增, false:编辑
      dialogVisible: false, // 新增编辑界面是否显示
      editLoading: false,
      // 新增编辑界面数据
      dataForm: {
        id: 0,
        deptId: '',
        empNo:'',
        empName: '',
        month:'',
        coefficientList: {
          coefficientId:'',
          coefficientName:'',
          value:'',
        }
      },
      deptData: [],
      deptTreeProps: {
        label: 'name',
        children: 'children'
      },
      empData:[],
      coeData:{
        coefficientList: {
          coefficientId:'',
          coefficientName:'',
          value:'',
        }
      },
      selections: []//列表选中列
    }
  },
  methods:{
    //获取分页数据
    findPage: function () {
      this.loading = true;
      this.$api.performance.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data
        console.log(res.data)
        this.totalSize = res.totalSize
        this.loading = false
      })
    },
    //换页刷新
    refreshPageRequest: function (pageNum) {
      this.pageRequest.pageNum = pageNum;
      this.findPage()
    },
    //显示新增界面
    handleAdd: function () {
      this.coeData = ''
      this.dialogVisible = true
      this.operation = true
      this.dataForm = {
        id: 0,
        deptId: '',
        empNo: '',
        empName: '',
        month:'',
        coefficientList: {
          coefficientId:'',
          coefficientName:'',
          value:'',
        }
      }
    },
    //显示编辑界面
    handleEdit: function(row) {
      this.dialogVisible = true;
      this.operation = false
      this.dataForm=Object.assign({}, row);
    },
    //选择切换
    selectionChange: function (selections) {
      this.selections = selections;
      this.$emit('selectionChange', {selections:selections})
    },
    //选择切换
    handleCurrentChange: function (val) {
      this.$emit('handleCurrentChange', {val:val})
    },
    //批量确认
    handleBatchConfirm: function () {
      let Params = []
      this.selections.forEach(t=>{
        let params = {
          "empNo":t.empNo,
          "month":t.month,
        }
        Params.push(params)
      })
      this.confirm(Params)
    },
    // 确认
    handleConfirm(row){
      let params = [{"empNo":row.empNo,"month":row.month}];
      this.confirm(params)
    },
    confirm: function (params) {
      this.$confirm("确认此条信息无误吗？","提示",{
        type:"warning"
      }).then(()=>{
        this.loading = true;
        this.$api.performance.confirm(params).then((res)=>{
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
    // 编辑
    submitForm: function () {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true
            let params = Object.assign({}, this.dataForm)
            let empCoe = []
            console.log(params.coefficientList)
            for(let i=0,len = params.coefficientList.length;i<len;i++){
              let empPer = {
                coefficientId : params.coefficientList[i].coefficientId,
                coefficientName: params.coefficientList[i].coefficientName,
                value: params.coefficientList[i].value,
              }
              empCoe.push(empPer)
            }
            params.coefficientList = empCoe
            console.log(params)
            this.$api.performance.save(params).then((res)=>{
              this.editLoading = false
              if(res.code === 200) {
                this.$message({ message: '操作成功', type: 'success' })
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
    findDeptTree: function () {this.$api.dept.findDeptTree().then((res) => {this.deptData = res.data})},
    // 菜单树选中
    deptTreeCurrentChangeHandle (data) {
      this.dataForm.deptId = data.id
      this.dataForm.deptName = data.name
      this.findCoefficientTree(data.id)
      this.findEmpTree(data.id)
    },
    // 获取职工列表
    findEmpTree: function (deptId){
      this.$api.emp.findEmpTree({'deptId':deptId}).then((res)=>{this.empData = res.data})
    },
    empCurrentChangeHandle: function (data){
      this.dataForm.empNo = data.empNo
      this.dataForm.empName = data.name
    },
    // 获取绩效列表
    findCoefficientTree:function (deptId){
      this.$api.coefficient.findCoefficientTree({'deptId':deptId}).then((res)=>{
        let result = res.data[0].coefficientList;
        this.coeData = res.data
        let empCoe = []
        for(let i = 0,len=result.length;i<len;i++){
          let coefficient = {
            coefficientId:result[i].id,
            coefficientName:result[i].title,
            value:result[i].value
          }
          empCoe.push(coefficient)
        }
        this.dataForm.coefficientList = empCoe
        })
    },
    // 时间格式化
    dateFormat: function (row, column){
      return formats(row[column.property])
    },
    statusFormat: function (item){
      if(item===1){
        return '加分'
      }else if (item === 2){
        return '扣分'
      }
      else{
        return '其他'
      }
    },
  },
  mounted() {
    this.refreshPageRequest(1)
    this.findDeptTree()
  },
}
</script>
<style scoped>
</style>
