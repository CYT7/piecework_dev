<template>
  <div class="page-container">
    <el-table :data="resData" v-if="resData[0]!= null">
      <el-table-column prop="deptName" label="部门名"/>
      <el-table-column prop="empId" label="职工号"/>
      <el-table-column prop="empName" label="姓名"/>
      <el-table-column v-for="(item,i) in resData[0].coefficientList" :key="i" :label="item.coefficientName">
        <template slot-scope="scope">
          <span>{{scope.row.coefficientList[i]?scope.row.coefficientList[i].value:''}}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <!--    <div class="page-container">-->
  <!--      <el-table :data="resData">-->
  <!--        <el-table-column v-for="(item,i) in dataColum" :key="i" :label="i">-->
  <!--          <template slot-scope="scope">-->
  <!--            {{scope.row[i]}}-->
  <!--          </template>-->
  <!--        </el-table-column>-->
  <!--      </el-table>-->
  <!--    </div>-->
</template>
<script>
import KtTable from "../Core/KtTable";
export default {
  name: "Performance",
  components: {KtTable},
  data(){
    return{
      resData: {
        coefficientList:"",
      },
    }
  },
  methods:{
    //获取分页数据
    findCoefficientTree: function () {
      this.$api.performance.findPage({ pageNum: 1, pageSize: 10 }).then((res) => {
        this.resData = res.data.content
      })
    },
    // findCoefficientTree: function () {
    //   this.$api.performance.findPages().then((res) => {
    //     this.resData = res.data
    //     this.dataColum = res.data[0]//表头
    //     this.dataList = res.data.slice(1)//内容
    //   })
    // },
  },
  mounted() {
    this.findCoefficientTree()
  }
}
</script>
<style scoped>
</style>
