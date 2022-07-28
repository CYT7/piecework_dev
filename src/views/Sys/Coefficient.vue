<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float: left;padding-left: 15px;padding-top: 10px">
      <el-form ref="filters" :inline="true" :model="filters" :size="size">
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input :currentChangeHandle="deptTreeFilters" :data="deptData" :nodeKey="''+filters.deptId"
                            :prop="filters.deptName" :props="deptTreeProps"/>
        </el-form-item>
        <el-form-item label="方案" prop="name">
          <el-input v-model="filters.name" placeholder="方案名查询"/>
        </el-form-item>
        <el-form-item>
          <kt-button :label="$t('action.search')" icon="fa fa-search"
                     perms="sys:coefficient:view" type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <kt-button :label="$t('action.reset')" icon="fa fa-repeat"
                     perms="sys:coefficient:view" type="primary" @click="resetFindPage"/>
        </el-form-item>
        <el-form-item>
          <kt-button :label="$t('action.upload')" icon="fa fa-upload"
                     perms="sys:coefficient:upload" type="primary" @click="handleUpload"/>
        </el-form-item>
        <el-form-item>
          <kt-button :label="$t('action.export')" icon="fa fa-file-excel-o"
                     perms="sys:coefficient:download" type="primary" @click="handleDownLoad"/>
        </el-form-item>
        <el-form-item>
          <kt-button :label="$t('action.refresh')" icon="fa fa-refresh"
                     perms="sys:coefficient:view" @click="findPage(null)"/>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <!--表格内容栏-->
      <el-table v-loading="loading" :data="pageResult" :element-loading-text="$t('action.loading')" class="el-table" fit size="mini"
                stripe style="width: 100%;">
        <el-table-column type="expand" width="20">
          <template slot-scope="props">
            <el-table v-if="props.row.children!=null" :data="props.row.children" border
                      fit highlight-current-row stripe width="100%" @selection-change="selectionChange">
              <el-table-column type="selection" width="30px"/>
              <el-table-column :formatter="typeFormat" align="center" header-align="center" label="类型"
                               min-width="50%" prop="type" sortable/>
              <el-table-column align="center" header-align="center" label="标题" min-width="50%" prop="title" sortable/>
              <el-table-column align="center" header-align="center" label="值" min-width="50%" prop="value" sortable/>
              <el-table-column align="center" header-align="center" label="状态" min-width="25%" prop="status">
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.status === 1" size="mini">正常</el-tag>
                  <el-tag v-if="scope.row.status === 0" size="mini" type="danger">禁用</el-tag>
                </template>
              </el-table-column>
              <el-table-column align="center" header-align="center" label="审核" min-width="25%" prop="checkStatus">
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.checkStatus === 0" size="mini" type="danger">未确认</el-tag>
                  <el-tag v-if="scope.row.checkStatus === 1" size="mini">通过</el-tag>
                  <el-tag v-if="scope.row.checkStatus === 2" size="mini" type="warning">未通过</el-tag>
                </template>
              </el-table-column>
              <el-table-column align="center" header-align="center" label="变更" min-width="25%">
                <template slot-scope="scope">
                  <el-popover v-if="scope.row.remark!==null" :content=scope.row.remark placement="top-start"
                              title="变化记录" trigger="click" width="10px">
                    <el-button slot="reference" circle icon="el-icon-view" size="mini"/>
                  </el-popover>
                </template>
              </el-table-column>
              <el-table-column align="center" header-align="center" label="历史" min-width="25%">
                <template slot-scope="scope">
                  <el-popover v-if="scope.row.coefficientHistory!==undefined && scope.row.coefficientHistory != null
                        && scope.row.coefficientHistory.length > 0" placement="left"
                              title="历史记录" trigger="click" width="600">
                    <el-table :data="scope.row.coefficientHistory" border fit highlight-current-row>
                      <el-table-column label="字段名" property="fieldName" width="140"/>
                      <el-table-column label="旧值" property="oldValue" width="100"/>
                      <el-table-column label="新值" property="newValue" width="100"/>
                      <el-table-column label="修改人" property="createBy" width="100"/>
                      <el-table-column :formatter="timeFormat" label="修改时间" property="createTime" width="160"/>
                    </el-table>
                    <el-button slot="reference" circle icon="el-icon-view" size="mini"/>
                  </el-popover>
                </template>
              </el-table-column>
              <el-table-column align="center" header-align="center" label="更新人" min-width="50%" prop="updateBy"
                               sortable/>
              <el-table-column :label="$t('action.operation')" align="center" header-align="center" min-width="50%">
                <template slot-scope="scope">
                  <el-tooltip :content="$t('action.delete')" x-placement="top">
                    <kt-button v-if="scope.row.status===0" :circle="true" icon="fa fa-trash"
                               perms="sys:coefficient:delete" type="danger" @click="deleteCoefficient(scope.row)"/>
                  </el-tooltip>
                  <el-tooltip :content="$t('action.disagree')" x-placement="top">
                    <kt-button v-if="scope.row.checkStatus === 0" :circle="true" icon="fa fa-times"
                               perms="sys:coefficient:unconfirmed" type="warning"
                               @click="disagreeCoefficient(scope.row)"/>
                  </el-tooltip>
                  <el-tooltip :content="$t('action.agree')" x-placement="top">
                    <kt-button v-if="scope.row.checkStatus === 0" :circle="true" icon="fa fa-check"
                               perms="sys:coefficient:confirm" type="primary" @click="agreeCoefficient(scope.row)"/>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column align="center" header-align="center" label="部门" min-width="40%" prop="deptName" sortable/>
        <el-table-column align="center" header-align="center" label="方案名" min-width="50%" prop="title" sortable/>
        <el-table-column align="center" header-align="center" label="明细" min-width="50%" prop="detailed" sortable/>
        <el-table-column align="center" header-align="center" label="版本" min-width="40%" prop="version" sortable/>
        <el-table-column align="center" header-align="center" label="标准单价" min-width="30%" prop="unitPrice"/>
        <el-table-column align="center" header-align="center" label="单价倍数" min-width="30%" prop="multiple"/>
        <el-table-column align="center" header-align="center" label="绩效单价" min-width="30%" prop="performanceUnitPrice"/>
        <el-table-column align="center" header-align="center" label="每小时指标" min-width="45%" prop="hourTargetOutput"/>
        <el-table-column align="center" header-align="center" label="8小时指标" min-width="45%" prop="dayTargetOutput"/>
        <el-table-column align="center" header-align="center" label="辅导月份" min-width="50%" prop="tutoringMonth"/>
        <el-table-column align="center" header-align="center" label="辅导比例" min-width="50%" prop="tutoringProportion"/>
        <el-table-column :formatter="dateFormat" align="center" header-align="center"
                         label="生效日期" min-width="50%" prop="effectiveDate"/>
        <el-table-column align="center" header-align="center" label="开始月份" min-width="50%" prop="startMonth"/>
        <el-table-column align="center" header-align="center" label="结束月份" min-width="50%" prop="endMonth"/>
        <el-table-column align="center" header-align="center" label="状态" min-width="25%" prop="status">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 0" size="mini" type="danger">禁用</el-tag>
            <el-tag v-else-if="scope.row.status === 1" size="mini">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" header-align="center" label="审核" min-width="25%" prop="checkStatus">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.checkStatus === 0" size="mini" type="danger">未确认</el-tag>
            <el-tag v-else-if="scope.row.checkStatus === 1" size="mini">通过</el-tag>
            <el-tag v-else-if="scope.row.checkStatus === 2" size="mini" type="warning">未通过</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" header-align="center" label="变更" min-width="25%">
          <template slot-scope="scope">
            <el-popover v-if="scope.row.remark!==null" :content=scope.row.remark placement="top-start"
                        title="变化记录" trigger="click" width="50px">
              <el-button slot="reference" circle icon="el-icon-view" size="mini"/>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column align="center" header-align="center" label="历史" min-width="25%">
          <template slot-scope="scope">
            <el-popover v-if="scope.row.schemeHistory!==undefined && scope.row.schemeHistory != null
                        && scope.row.schemeHistory.length > 0" placement="left" title="历史记录" trigger="click"
                        width="600">
              <el-table :data="scope.row.schemeHistory" border fit highlight-current-row>
                <el-table-column label="字段名" property="fieldName" width="140"/>
                <el-table-column label="旧值" property="oldValue" width="100"/>
                <el-table-column label="新值" property="newValue" width="100"/>
                <el-table-column label="修改人" property="createBy" width="100"/>
                <el-table-column :formatter="timeFormat" label="修改时间" property="createTime" width="160"/>
              </el-table>
              <el-button slot="reference" circle icon="el-icon-view" size="mini"/>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column align="center" header-align="center" label="更新人" min-width="30%" prop="updateBy"/>
        <el-table-column :label="$t('action.operation')" align="center" header-align="center" min-width="50%">
          <template slot-scope="scope">
            <el-tooltip :content="$t('action.delete')" x-placement="top">
              <kt-button v-if="scope.row.status===0" :circle="true" icon="fa fa-trash"
                         perms="sys:coefficient:delete" type="danger" @click="deleteScheme(scope.row)"/>
            </el-tooltip>
            <el-tooltip :content="$t('action.disagree')" x-placement="top">
              <kt-button v-if="scope.row.checkStatus === 0" :circle="true" icon="fa fa-times"
                         perms="sys:coefficient:unconfirmed" type="warning" @click="disagreeScheme(scope.row)"/>
            </el-tooltip>
            <el-tooltip :content="$t('action.agree')" x-placement="top">
              <kt-button v-if="scope.row.checkStatus === 0" :circle="true" icon="fa fa-check"
                         perms="sys:coefficient:confirm" type="primary" @click="agreeScheme(scope.row)"/>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页栏-->
      <div class="toolbar" style="padding:10px;">
        <kt-button v-if="showBatch" :disabled="this.selections.length===0" :label="$t('action.batchConfirm')"
                   :size="size" perms="sys:coefficient:confirm"
                   style="float:left;" type="primary" @click="handleBatchConfirm()"/>
        <kt-button v-if="showBatch" :disabled="this.selections.length===0" :label="$t('action.batchDisagree')"
                   :size="size" perms="sys:coefficient:unconfirmed"
                   style="float:left;" type="waring" @click="handleBatchUnconfirmed()"/>
        <el-pagination :current-page="pageRequest.pageNum" :page-size="pageRequest.pageSize"
                       :total="totalSize" layout="total, prev, pager, next, jumper"
                       style="float:right;" @current-change="refreshPageRequest"/>
      </div>
    </div>
    <!--导出-->
    <el-dialog :close-on-click-modal="false" :title="$t('action.export')" :visible.sync="downloadVisible" width="25%">
      <el-form ref="downForm" :model="downForm" :rules="downFormRules" :size="size"
               label-position="right" label-width="80px" style="text-align:left;">
        <el-form-item label="选项" prop="type">
          <el-radio-group v-model="downForm.type">
            <el-radio v-for="(type, index) in TypeList" :key="index" :label="index">{{ type }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="downForm.type===1" label="模板选择" prop="templateSelection">
          <el-radio-group v-model="downForm.templateSelection">
            <el-radio v-for="(type, index) in templateList" :key="index" :label="index">{{ type }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input :currentChangeHandle="exportDeptChange" :data="deptData" :nodeKey="''+downForm.deptId"
                            :prop="downForm.deptName"
                            :props="deptTreeProps"/>
        </el-form-item>
        <el-form-item label="系数方案" prop="schemeId">
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
    <!--上传-->
    <el-dialog :close-on-click-modal="false" :title="$t('action.upload')" :visible.sync="uploadVisible" width="25%">
      <el-form ref="uploadForm" :model="uploadForm" :rules="uploadFormRules" :size="size"
               label-position="right" label-width="80px" style="text-align:left;">
        <el-form-item label="选项" prop="type">
          <el-radio-group v-model="uploadForm.type">
            <el-radio v-for="(type, index) in templateList" :key="index" :label="index">{{ type }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="uploadForm.type===2" label="部门" prop="deptName">
          <popup-tree-input :currentChangeHandle="uploadDeptChange" :data="deptData" :nodeKey="''+uploadForm.deptId"
                            :prop="uploadForm.deptName" :props="deptTreeProps"/>
        </el-form-item>
        <el-form-item v-if="uploadForm.type===2" label="系数方案" prop="schemeId">
          <el-select v-model="uploadForm.schemeId" placeholder="选择系数方案" style="width: 100%" value-key="id">
            <el-option v-for="item in schemeData" :key="item.id" :label="item.title"
                       :value="item.id" @click.native="uploadSchemeChange(item)"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="uploadVisible = false">{{ $t('action.cancel') }}</el-button>
        <el-upload ref="upload" :before-upload="beforeUpload" :http-request="UploadFile" :limit="1"
                   :show-file-list="false" accept=".xls,.xlsx"
                   action="#" class="el-upload">
          <el-button :size="size" type="primary">{{ $t('action.upload') }}</el-button>
        </el-upload>
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
import {Dateformat, format} from "../../utils/datetime";

export default {
  name: "Coefficient",
  components: {PopupTreeInput, KtButton, KtTable},
  props: {showBatch: {type: Boolean, default: true}},//是否显示操作组件
  data() {
    return {
      size: "small",
      loading: false, // 加载标识
      filters: {deptId: '', name: '', deptName: ''}, // 查询信息
      pageRequest: {pageNum: 1, pageSize: 10}, // 分页信息
      totalSize: 0, // 统计数
      pageResult: [], // 分页结果
      selections: [],// 列表选中列
      schemeHistory: '', // 方案历史
      coefficientHistory: '', // 系数历史
      downloadVisible: false,// 下载页面是否显示
      uploadVisible: false,// 下载页面是否显示
      uploadForm: [], // 上传信息
      downForm: [], // 导出信息
      uploadFormRules: {type: [{required: true, message: '请选择上传类型', trigger: 'change'}]}, // 上传信息规则
      downFormRules: {type: [{required: true, message: '请选择导出类型', trigger: 'change'}]}, // 导出信息规则
      deptData: [], // 部门数据
      schemeData: [], //方案数据
      deptTreeProps: {label: 'name', children: 'children'},
      TypeList: ['导出', '上传模板'], //导出选项
      templateList: ['方案&系数', '方案', '系数'], // 模板选项
    };
  },
  methods: {
    // 上传处理
    handleUpload: function () {
      this.uploadVisible = true;
      this.uploadForm = {
        type: "",
        schemeId: ""
      }
    },
    // 导出处理
    handleDownLoad: function () {
      this.downloadVisible = true
      this.downForm = {
        type: '',
        templateSelection: '',
        deptId: '',
        deptName: '',
        schemeId: '',
        schemeName: '',
      }
    },
    // 重置
    resetFindPage: function () {
      this.$refs['filters'].resetFields()
      this.filters = {deptId: '', name: '', deptName: ''}
      this.findPage()
    },
    // 获取分页数据
    findPage: function () {
      this.loading = true;
      this.pageRequest.params = [{name: 'name', value: this.filters.name}, {name: 'deptId', value: this.filters.deptId}]
      this.$api.coefficient.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data
        this.totalSize = res.totalSize
      })
      this.loading = false
    },
    // 换页刷新
    refreshPageRequest: function (pageNum) {
      this.pageRequest.pageNum = pageNum;
      this.pageRequest.pageSize = 10;
      this.pageRequest.params = [{name: 'name', value: this.filters.name}, {name: 'deptId', value: this.filters.deptId}]
      this.loading = true;
      this.$api.coefficient.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data;
        this.totalSize = res.totalSize
      })
      this.loading = false
    },
    // 选择切换
    selectionChange: function (selections) {
      this.selections = selections;
    },
    // 删除系数方案
    deleteScheme: function (params) {
      this.$confirm('确认删除选中的信息吗？', '提示', {type: 'warning'}).then(() => {
        this.loading = true;
        this.$api.coefficient.DeleteScheme({'schemeId': [params.id]}).then(res => {
          if (res.code === 200) {
            this.$message({message: '操作成功', type: 'success'})
            this.findPage();
          } else {
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        })
      })
    },
    // 删除系数
    deleteCoefficient: function (params) {
      this.$confirm('确认删除选中的信息吗？', '提示', {type: 'warning'}).then(() => {
        this.loading = true;
        this.$api.coefficient.Delete({'coefficientId': [params.id]}).then(res => {
          if (res.code === 200) {
            this.$message({message: '操作成功', type: 'success'})
            this.findPage();
          } else {
            this.$message({message: res.msg, type: 'error'})
          }
          this.loading = false
        })
        this.loading = false
      })
    },
    // 不通过系数方案
    disagreeScheme: function (params) {
      this.$confirm('确认不通过选中的信息吗？', '提示', {type: 'warning'}).then(() => {
        this.loading = true;
        this.$api.coefficient.unconfirmedScheme({'schemeId': [params.id]}).then(res => {
          if (res.code === 200) {
            this.$message({message: '操作成功', type: 'success'})
            this.findPage();
          } else {
            this.$message({message: '操作失败', type: 'error'})
          }
          this.loading = false
        })
      })
    },
    // 不通过系数
    disagreeCoefficient: function (params) {
      this.$confirm('确认不通过选中的信息吗？', '提示', {type: 'warning'}).then(() => {
        this.loading = true;
        this.$api.coefficient.unconfirmed({'coefficientId': [params.id]}).then(res => {
          if (res.code === 200) {
            this.$message({message: '操作成功', type: 'success'})
            this.findPage();
          } else {
            this.$message({message: res.msg, type: 'error'})
          }
          this.loading = false
        })
      })
    },
    // 通过系数方案
    agreeScheme: function (params) {
      this.$confirm('确认通过选中的信息吗？', '提示', {type: 'warning'}).then(() => {
        this.loading = true;
        this.$api.coefficient.confirmScheme({'schemeId': [params.id]}).then(res => {
          if (res.code === 200) {
            this.$message({message: '操作成功', type: 'success'})
            this.findPage();
          } else {
            this.$message({message: '操作失败', type: 'error'})
          }
          this.loading = false
        })
      })
    },
    // 通过系数
    agreeCoefficient: function (params) {
      this.$confirm('确认通过选中的信息吗？', '提示', {type: 'warning'}).then(() => {
        this.loading = true;
        this.$api.coefficient.confirm({'coefficientId': [params.id]}).then(res => {
          if (res.code === 200) {
            this.$message({message: '操作成功', type: 'success'})
            this.findPage();
          } else {
            this.$message({message: res.msg, type: 'error'})
          }
          this.loading = false
        })
      })
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
        this.$confirm('确认通过选中的信息吗？', '提示', {type: 'warning'}).then(() => {
          this.loading = true;
          this.$api.coefficient.confirm({'coefficientId': ids}).then(res => {
            if (res.code === 200) {
              this.$message({message: '操作成功', type: 'success'})
              this.selections = []
              this.findPage();
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
        this.$confirm('确认不通过选中的信息吗？', '提示', {type: 'warning'}).then(() => {
          this.loading = true;
          this.$api.coefficient.unconfirmed({'coefficientId': ids}).then(res => {
            if (res.code === 200) {
              this.$message({message: '操作成功', type: 'success'})
              this.findPage();
            } else {
              this.$message({message: res.msg, type: 'error'})
            }
            this.loading = false
          })
        })
      }
    },
    // 获取部门列表
    findDeptTree: function () {
      this.$api.dept.findTree().then((res) => {
        this.deptData = res.data
      })
    },
    // 查询部门选择
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
    // 上传部门选中
    uploadDeptChange(data) {
      this.uploadForm.deptId = data.id
      this.uploadForm.deptName = data.name
      this.findCoefficientTree(data.id)
    },
    // 获取方案列表
    findCoefficientTree: function (deptId) {
      this.$api.coefficient.findCoefficientTree({deptId: deptId}).then((res) => {
        this.schemeData = res
      })
    },
    // 导出方案选中
    exportSchemeChange: function (data) {
      this.downForm.schemeId = data.id
      this.downForm.schemeName = data.title
    },
    // 上传方案选中
    uploadSchemeChange: function (data) {
      this.uploadForm.schemeId = data.id
      this.uploadForm.schemeName = data.title
    },
    // 上传前鉴定
    beforeUpload(file) {
      let testMsg = file.name.substring(file.name.lastIndexOf('.') + 1);
      const extension = (testMsg === 'xls' || testMsg === 'xlsx')
      const isLt2M = file.size / 1024 / 1024 < 10     //这里做文件大小限制
      if (!extension) {
        this.$message({message: '上传文件只能是 xls、xlsx格式!', type: 'warning'});
      }
      if (!isLt2M) {
        this.$message({message: '上传文件大小不能超过 10MB!', type: 'warning'});
      }
      return extension && isLt2M
    },
    // 上传文件
    UploadFile(param) {
      if (this.uploadForm.type === null || this.uploadForm.type === '') {
        this.$message({message: '请选择上传类型', type: 'error'});
        this.$refs['upload'].clearFiles();
      } else if (this.uploadForm.type === 2 && this.uploadForm.schemeId === '') {
        this.$message({message: '请选择方案然后再上传', type: 'error'});
        this.$refs['upload'].clearFiles();
      } else {
        const formData = new FormData()
        formData.append('file', param.file) // 要提交给后台的文件
        formData.append('type', this.uploadForm.type)
        formData.append('schemeId', this.uploadForm.schemeId === '' || this.uploadForm.schemeId === null ? 0 : this.uploadForm.schemeId);
        this.$api.coefficient.upload(formData).then(res => {
          if (res.code === 200) {
            this.$message({message: '操作成功', type: 'success'})
            this.$refs['upload'].clearFiles();
            this.$refs['uploadForm'].resetFields()
            this.uploadVisible = false
          } else {
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
            this.$refs['upload'].clearFiles();
            this.uploadVisible = false
          }
        })
      }
    },
    // 导出提交处理校验
    submitDown: function () {
      this.$refs.downForm.validate((valid) => {
        if (valid) {
          let params = Object.assign({}, this.downForm)
          if (params.type === 1 && params.templateSelection === 2) {
            if (params.schemeId === '') {
              this.$message({message: '请选择方案再下载模板', type: 'warning'})
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
      axios.post(baseUrl + '/coefficient/download', params, {
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
    // 类型格式化
    typeFormat: function (row, column) {
      if (row[column.property] === 1) {
        return '加分系数'
      } else {
        return '扣分系数'
      }
    },
    // 时间格式化
    timeFormat: function (row, column) {
      return format(row[column.property])
    },
    //日期格式化
    dateFormat: function (row, column) {
      return Dateformat(row[column.property])
    },
  },
  mounted() {
    this.findPage()
    this.findDeptTree()
  },
}
</script>
<style scoped>
.el-table {
  font-size: 12px;
}
</style>
