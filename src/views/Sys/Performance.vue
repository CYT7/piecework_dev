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
      </el-form>
    </div>
    <!--表格内容栏-->
    <el-table :data="pageResult" v-if="pageResult[0]!= null" stripe size="mini" style="width: 100%;" v-loading="loading" element-loading-text="$t('action.loading')">
      <el-table-column sortable prop="deptName" label="部门" header-align="center" align="center"/>
      <el-table-column sortable prop="empId" label="职工号" header-align="center" align="center"/>
      <el-table-column sortable prop="empName" label="姓名" header-align="center" align="center"/>
      <el-table-column sortable v-for="(item,i) in pageResult[0].coefficientList" :key="i" :label="item.coefficientName" header-align="center" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.coefficientList[i]?scope.row.coefficientList[i].value:''}}</span>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" :label="$t('action.operation')">
        <template slot-scope="scope">
          <kt-button icon="fa fa-edit" :label="$t('action.edit')" perms="sys:performance:edit" @click="handleEdit(scope.row)"/>
        </template>
      </el-table-column>
    </el-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="80px" ref="dataForm" :size="size" label-position="right">
        <el-form-item label="部门" prop="deptName">
          <el-select placeholder="选择部门" value-key="id" v-model="dataForm.deptId">
            <el-option v-for="item in deptData" :key="item.id" :label="item.name" :value="item.id"
                       @click.native="findEmpTree(item.id),findCoefficientTree(item.id)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="职工" prop="empId">
          <el-select placeholder="选择职工" value-key="id" v-model="dataForm.empId">
            <el-option v-for="item in empData" :key="item.id" :label="item.name" :value="item.id" @click.native="empCurrentChangeHandle(item)"></el-option>
          </el-select>
        </el-form-item>
        <div v-if="coeData[0]!=null" >
          <el-form-item v-for="(item,index) in coeData[0].coefficientList" :key="index" :label="item.title" :prop="dataForm[coeData[0].coefficientList[index].value]">
            <el-input v-model="item.value"></el-input>
            <el-input v-if="false" v-model="item.id" ></el-input>
          </el-form-item>
        </div>
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
export default {
  name: "Performance",
  components: {PopupTreeInput, KtButton, KtTable},
  data(){
    return{
      size: "small",
      loading: false,
      filters: {name: ""},
      pageRequest: { pageNum: 1, pageSize: 10 },
      pageResult: {
        coefficientList: {
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
        empId:'',
        empName: '',
        coefficientList: {
          coefficientId:'',
          coefficientName:'',
          value:'',
        }
      },
      deptData: [],
      empData:[],
      coeData:{
        coefficientList:[
          {
            id:'',
            title:'',
            value:''
          }
        ],
      },
    }
  },
  methods:{
    //获取分页数据
    findPage: function () {
      this.$api.performance.findPage({ pageNum: 1, pageSize: 10 }).then((res) => {
        this.pageResult = res.data.content
      })
    },
    //显示新增界面
    handleAdd: function () {
      this.dialogVisible = true
      this.operation = true
      this.dataForm = {
        id: 0,
        deptId: '',
        empId: '',
        empName: '',
      }
    },
    //显示编辑界面
    handleEdit: function(row) {
      this.dialogVisible = true;
      Object.assign(this.dataForm, row);
    },
    // 编辑
    submitForm: function () {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true
            let params = Object.assign({}, this.dataForm)
            console.log(params)
          })
        }
      })
    },
    // 获取部门列表
    findDeptTree: function () {this.$api.dept.findDeptTree().then((res) => {this.deptData = res.data})},
    // 获取职工列表
    findEmpTree: function (deptId){
      this.$api.emp.findEmpTree({'deptId':deptId}).then((res)=>{this.empData = res.data})
    },
    empCurrentChangeHandle: function (data){
      this.dataForm.empId = data.id
      this.dataForm.empName = data.name
    },
    // 获取绩效列表
    findCoefficientTree:function (deptId){
      this.$api.coefficient.findCoefficientTree({'deptId':deptId}).then((res)=>{this.coeData = res.data})
    },
  },
  mounted() {
    this.findPage()
    this.findDeptTree()
  }
}
</script>
<style scoped>
</style>
