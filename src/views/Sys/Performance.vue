<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left: 15px;">
      <el-form ref="filters" :inline="true" :model="filters" :size="size" class="el-form--inline">
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input :currentChangeHandle="deptTreeFilters" :data="deptData" :nodeKey="''+filters.deptId"
                            :prop="filters.deptName" :props="deptTreeProps"/>
        </el-form-item>
        <el-form-item label="方案名" prop="scheme">
          <el-input v-model="filters.scheme" placeholder="方案名查询"/>
        </el-form-item>
        <el-form-item label="职工名" prop="empName">
          <el-input v-model="filters.empName" placeholder="职工名查询"/>
        </el-form-item>
        <el-form-item label="月份范围" prop="months">
          <el-date-picker v-model="filters.monthRange" :picker-options="pickerOptions" end-placeholder="结束月份" range-separator="至"
                          start-placeholder="开始月份" type="monthrange" unlink-panels/>
        </el-form-item>
        <el-form-item>
          <el-tooltip :content="$t('action.search')" x-placement="top">
            <kt-button :circle="true" icon="fa fa-search"
                       perms="sys:performance:view" type="primary" @click="findPage"/>
          </el-tooltip>
          <el-tooltip :content="$t('action.reset')" x-placement="top">
            <kt-button :circle="true" icon="fa fa-repeat"
                       perms="sys:performance:view" type="primary" @click="resetFindPage"/>
          </el-tooltip>
          <el-tooltip :content="$t('action.export')" x-placement="top">
            <kt-button :circle="true" icon="fa fa-file-excel-o"
                       perms="sys:performance:download" type="primary" @click="handleDownLoad"/>
          </el-tooltip>
          <el-tooltip :content="$t('action.refresh')" x-placement="top">
            <kt-button :circle="true" icon="fa fa-refresh" perms="sys:performance:view" @click="findPage(null)"/>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <!--表格内容栏-->
      <el-table v-if="pageResult[0]!= null" v-loading="loading" :data="pageResult" :element-loading-text="$t('action.loading')" class="el-table" size="mini"
                stripe style="width: 100%;" @selection-change="selectionChange">
        <el-table-column type="selection" width="30px"/>
        <el-table-column type="expand" width="25px">
          <template slot-scope="props">
            <el-table :data="[[]]" border fit highlight-current-row stripe width="100%">
              <el-table-column align="center" header-align="center" label="工作绩效产量">
                <el-table-column v-for="(item,i) in props.row.empList" :key="i" :label="item.coefficientName"
                                 align="center" header-align="center" min-width="50%">
                  {{ item.value }}
                </el-table-column>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column align="center" header-align="center" label="部门" min-width="50%" prop="deptName" width="90%"/>
        <el-table-column :formatter="empFormant" align="center" header-align="center" label="工号" min-width="50%" prop="empNo"
                         width="90%"/>
        <el-table-column align="center" header-align="center" label="姓名" min-width="50%" prop="empName" width="90%"/>
        <el-table-column :formatter="dateFormat" align="center" header-align="center" label="月份" min-width="50%"
                         prop="month" width="90%"/>
        <el-table-column align="center" header-align="center" label="方案明细" min-width="50%" prop="schemeName"
                         width="90%"/>
        <el-table-column align="center" header-align="center" label="非计件时间(h)" min-width="50%" prop="nonPieceTime"
                         width="90%"/>
        <el-table-column align="center" header-align="center" label="出勤(d)" min-width="50%" prop="attendance"
                         width="90%"/>
        <el-table-column align="center" header-align="center" label="缺勤(d)" min-width="50%" prop="absence" width="90%"/>
        <el-table-column align="center" header-align="center" label="被辅导员" min-width="50%" prop="tutoringName"
                         width="90%"/>
        <el-table-column align="center" header-align="center" label="辅导月份" min-width="50%" prop="tutoringMonth"
                         width="90%"/>
        <el-table-column align="center" header-align="center" label="分数">
          <el-table-column v-for="(item,i) in pageResult[0].scoreList" :key="i" :label="scoreFormat(item.type)"
                           align="center" header-align="center" width="70%">
            <template slot-scope="scope">
              <span>{{ scope.row.scoreList[i] ? scope.row.scoreList[i].score : '' }}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column align="center" header-align="center" label="绩效分" min-width="50%" prop="score" width="90%"/>
        <el-table-column align="center" header-align="center" label="绩效工资" min-width="50%" prop="bonus" width="90%"/>
        <el-table-column align="center" header-align="center" label="更新人" min-width="50%" prop="updateBy" width="90%"/>
        <el-table-column align="center" header-align="center" label="状态" min-width="50%" prop="status" width="90%">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 0" size="small">已确认</el-tag>
            <el-tag v-else-if="scope.row.status === 1" size="small">未确认</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" header-align="center" label="审核" min-width="50%" prop="checkStatus" width="90%">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.checkStatus === 0" size="small">待审核</el-tag>
            <el-tag v-else-if="scope.row.checkStatus === 1" size="small">通过</el-tag>
            <el-tag v-else-if="scope.row.checkStatus === 2" size="small">未通过</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('action.operation')" align="center" header-align="center" min-width="50%">
          <template slot-scope="scope">
            <el-tooltip :content="$t('action.disagree')" x-placement="top">
              <kt-button v-if="scope.row.checkStatus === 0" :circle="true" icon="fa fa-times"
                         perms="sys:performance:disagree" type="warning" @click="disagreePerformance(scope.row)"/>
            </el-tooltip>
            <el-tooltip :content="$t('action.agree')" x-placement="top">
              <kt-button v-if="scope.row.checkStatus === 0" :circle="true" icon="fa fa-check"
                         perms="sys:performance:agree" type="primary" @click="agreePerformance(scope.row)"/>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页栏-->
      <div class="toolbar" style="padding:10px;">
        <kt-button v-if="showBatch" :disabled="this.selections.length===0" :label="$t('action.batchConfirm')" :size="size"
                   perms="sys:performance:agree"
                   style="float:left;" type="primary" @click="handleBatchConfirm"/>
        <kt-button v-if="showBatch" :disabled="this.selections.length===0" :label="$t('action.batchDisagree')" :size="size"
                   perms="sys:performance:disagree" style="float:left;" type="warning"
                   @click="handleBatchUnconfirmed"/>
        <el-pagination :current-page="pageRequest.pageNum" :page-size="pageRequest.pageSize"
                       :total="totalSize" layout="total, prev, pager, next, jumper"
                       style="float:right;" @current-change="refreshPageRequest">
        </el-pagination>
      </div>
    </div>
    <el-dialog :close-on-click-modal="false" :visible.sync="downloadVisible" title="导出绩效" width="30%">
      <el-form ref="downForm" :model="downForm" :rules="downFormRules" :size="size"
               label-position="right" label-width="100px" style="text-align:left;">
        <el-form-item label="选项" prop="type">
          <el-radio-group v-model="downForm.type">
            <el-radio v-for="(type, index) in TypeList" :key="index" :label="index">{{ type }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input :currentChangeHandle="exportDeptChange" :data="deptData" :nodeKey="''+downForm.deptId"
                            :prop="downForm.deptName" :props="deptTreeProps"/>
        </el-form-item>
        <el-form-item label="月份" prop="month">
          <div class="block">
            <el-date-picker v-model="downForm.month" :picker-options="pickerOptions" end-placeholder="结束月份"
                            range-separator="至" start-placeholder="开始月份" type="monthrange"
                            unlink-panels>
            </el-date-picker>
          </div>
        </el-form-item>
        <el-form-item v-if="downForm.type===1" label="系数方案" prop="schemeId">
          <el-select v-model="downForm.schemeId" placeholder="选择系数方案" style="width: 100%" value-key="id">
            <el-option v-for="item in schemeData" :key="item.id" :label="item.title"
                       :value="item.id" @click.native="exportSchemeChange(item)"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="downloadVisible = false">{{ $t('action.cancel') }}</el-button>
        <el-button :size="size" type="primary" @click.native="submitDown">{{ $t('action.submit') }}</el-button>
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
  props: {showBatch: {type: Boolean, default: true}},//是否显示操作组件
  data() {
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
  methods: {
    // 处理导出
    handleDownLoad: function () {
      this.downloadVisible = true
      this.downForm = {
        type: '',
        month: [],
        name: '',
        deptId: '',
        schemeId: '',
        empName: '',
      }
    },
    // 重置查找页面
    resetFindPage: function () {
      this.$refs['filters'].resetFields()
      const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0);
      const end = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0);
      this.filters = {deptId: '', deptName: '', scheme: '', empName: '', monthRange: [start, end]}
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
      this.$api.performance.findPage(this.filters).then((res) => {
        this.pageResult = res.data
        this.totalSize = res.totalSize
      })
      this.loading = false
    },
    // 选择切换
    selectionChange: function (selections) {
      this.selections = selections;
    },
    // 批量通过
    handleBatchConfirm: function () {
      let ids = []
      this.selections.forEach(t => {
        if (t.checkStatus === 0) {
          ids.push(t.id)
        }
      })
      if (ids.length === 0) {
        this.$message({message: '没有需要处理的内容，请勿操作', type: 'error'})
        this.selections = []
        this.findPage();
      } else {
        this.$confirm('确定通过选中的信息吗?', '提示', {type: 'warning'}).then(() => {
          this.loading = true;
          this.$api.performance.confirm({'performanceId': ids}).then(res => {
            if (res.code === 200) {
              this.$message({message: res.msg, type: 'success'})
              this.findPage()
            } else {
              this.$message({message: res.msg, type: 'error'})
            }
            this.loading = false
          })
        });
      }
    },
    // 批量不通过
    handleBatchUnconfirmed: function () {
      let ids = []
      this.selections.forEach(t => {
        if (t.checkStatus === 0) {
          ids.push(t.id)
        }
      })
      if (ids.length === 0) {
        this.$message({message: '没有需要处理的内容，请勿操作', type: 'error'})
        this.selections = []
        this.findPage();
      } else {
        this.$api.performance.disagree({'performanceId': ids}).then(res => {
          if (res.code === 200) {
            this.$message({message: res.msg, type: 'success'})
            this.findPage()
          } else {
            this.$message({message: res.msg, type: 'error'})
          }
          this.loading = false
        })
      }
    },
    // 不通过绩效
    disagreePerformance: function (params) {
      this.$confirm('确定不通过选中的信息吗?', '提示', {type: 'warning'}).then(() => {
        this.loading = true;
        this.$api.performance.disagree({'performanceId': [params.id]}).then(res => {
          if (res.code === 200) {
            this.$message({message: res.msg, type: 'success'})
            this.findPage()
          } else {
            this.$message({message: res.msg, type: 'error'})
          }
          this.loading = false
        })
      });
    },
    // 通过绩效
    agreePerformance: function (params) {
      this.$confirm('确定通过选中的信息吗?', '提示', {type: 'warning'}).then(() => {
        this.loading = true;
        this.$api.performance.confirm({'performanceId': [params.id]}).then(res => {
          if (res.code === 200) {
            this.$message({message: res.msg, type: 'success'})
            this.findPage()
          } else {
            this.$message({message: res.msg, type: 'error'})
          }
          this.loading = false
        })
      });
    },
    // 获取部门列表
    findDeptTree: function () {
      this.$api.dept.findTree().then((res) => {
        this.deptData = res.data
      })
    },
    // 获取方案树
    findCoefficientTree: function (deptId) {
      this.$api.coefficient.findCoefficientTree({deptId: deptId}).then((res) => {
        this.schemeData = res
      });
    },
    // 查询部门选中
    deptTreeFilters(data) {
      this.filters.deptId = data.id
      this.filters.deptName = data.name
    },
    // 导出部门选中
    exportDeptChange(data) {
      this.downForm.deptId = data.id
      this.downForm.deptName = data.name
      this.findCoefficientTree(data.id)
    },
    // 导出方案选中
    exportSchemeChange: function (data) {
      this.downForm.schemeId = data.id
      this.downForm.schemeName = data.title
    },
    // 导出前效验
    submitDown: function () {
      this.$refs.downForm.validate((valid) => {
        if (valid) {
          let params = Object.assign({}, this.downForm)
          if (params.type === 1) {
            if (params.deptId === '') {
              this.$message({message: '请选择部门', type: 'warning'});
            } else {
              this.exportExcelFile(params);
              this.downloadVisible = false;
              this.$refs['downForm'].resetFields()
            }
          } else {
            this.exportExcelFile(params);
            this.downloadVisible = false;
            this.$refs['downForm'].resetFields()
          }
        }
      })
    },
    // 导出Excel
    exportExcelFile: function (params) {
      axios.post(baseUrl + '/performance/download', params, {
        headers: {
          'token': Cookies.get('token'),
          'Content-Type': 'application/json;charset=UTF-8'
        },
        responseType: 'blob'
      }).then(response => {
        let fileName = response.headers['content-disposition'].split('filename=').pop();//通过header中获取返回的文件名称
        let blob = new Blob([response.data], {type: "application/ms-excel"})
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
    dateFormat: function (row, column) {
      return formats(row[column.property])
    },
    // 日期格式化
    dateFormats: function (item) {
      return formats(item)
    },
    // 职工号格式化
    empFormant: function (row, column) {
      return row[column.property].toString().padStart(6, '0')
    },
    // 分数格式化
    scoreFormat: function (item) {
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
    const end = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0);
    this.filters.monthRange = [start, end];
    this.findPage()
    this.findDeptTree()
  },
}
</script>
<style scoped>
</style>
