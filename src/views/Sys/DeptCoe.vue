<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float: left;padding-left: 15px;padding-top: 10px">
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
          <kt-button icon="fa fa-repeat" :label="$t('action.reset')"
                     perms="sys:deptCoe:view" type="primary" @click="resetFindPage"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')"
                     perms="sys:deptCoe:add" type="primary" @click="handleAdd"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-upload" :label="$t('action.upload')"
                     perms="sys:deptCoe:upload" type="primary" @click="handleUpload"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-file-excel-o" :label="$t('action.export')"
                     perms="sys:deptCoe:download" type="primary" @click="handleDownLoad"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-refresh" :label="$t('action.refresh')"
                     perms="sys:deptCoe:view"  @click="findPage(null)"/>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <!--表格内容栏-->
      <el-table :data="pageResult" stripe size="mini" style="width: 100%;" v-loading="loading"
                class="el-table" :element-loading-text="$t('action.loading')">
        <el-table-column type="expand" width="20">
          <template slot-scope="props">
            <el-table stripe :data="props.row.children" v-if="props.row.children!=null"
                      width="100%" border fit highlight-current-row @selection-change="selectionChange">
              <el-table-column type="selection" width="30px"/>
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
                  <kt-button icon="fa fa-lock" :label="$t('action.disable')" v-if="scope.row.status === 1"
                             perms="sys:deptCoe:disable"  type="warning" @click="disableCoefficient(scope.row)"/>
                  <kt-button icon="fa fa-unlock" :label="$t('action.recover')" v-if="scope.row.status === 0"
                             perms="sys:deptCoe:recover" type="primary" @click="recoverCoefficient(scope.row)"/>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column sortable prop="deptName" label="部门" header-align="center" align="center" min-width="40%"/>
        <el-table-column sortable prop="title" label="方案名" header-align="center" align="center" min-width="50%"/>
        <el-table-column sortable prop="detailed" label="明细" header-align="center" align="center" min-width="50%"/>
        <el-table-column sortable prop="version" label="版本" header-align="center" align="center" min-width="40%"/>
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
        <el-table-column prop="status" label="状态" header-align="center" align="center" min-width="25%" >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 0" size="mini" type="danger">禁用</el-tag>
            <el-tag v-else-if="scope.row.status === 1" size="mini">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checkStatus" label="审核" header-align="center" align="center" min-width="25%" >
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
    <el-dialog :title="operation?$t('action.add'):$t('action.edit')" width="30%"
               :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" ref="dataForm" @keyup.enter.native="submitForm()" label-width="100px"
               :size="size" style="text-align:left;" :rules="dataFormRules">
        <el-form-item label="选项" prop="types" v-if="operation">
          <el-radio-group v-model="dataForm.types">
            <el-radio v-for="(types, index) in TypeList" :label="index" :key="index"
                      @change.native="changeForm(index)">{{types}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="部门" prop="deptName" v-if="operation">
          <popup-tree-input
            :data="deptData" :props="deptTreeProps" :prop="dataForm.deptName"
            :node-key="''+dataForm.deptId" :current-change-handle="saveDeptChange"/>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 1&&operation" label="系数方案" prop="schemeId">
          <el-select style="width: 100%" placeholder="选择系数方案" value-key="id" v-model="dataForm.schemeId">
            <el-option v-for="item in schemeData" :key="item.id" :label="item.title"
                       :value="item.id" @click.native="saveSchemeChange(item)"></el-option>
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
          <el-input v-model="dataForm.unitPrice" placeholder="请输入绩效单价" :disabled="!operation"/>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 0" label="绩效单价倍数" prop="multiple">
          <el-input v-model="dataForm.multiple" placeholder="请输入绩效单价倍数" :disabled="!operation"/>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 0" label="每小时指标产量分数" prop="hourTargetOutput">
          <el-input v-model="dataForm.hourTargetOutput" placeholder="请输入每小时指标产量分数" :disabled="!operation"/>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 0" label="8小时指标产量分数" prop="dayTargetOutput">
          <el-input v-model="dataForm.dayTargetOutput" placeholder="请输入8小时指标产量分数" :disabled="!operation"/>
        </el-form-item>
        <el-form-item v-if="dataForm.types === 0" label="生效日期" prop="entryDate" :disabled="!operation">
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
    <el-dialog title="导出" width="25%" :visible.sync="downloadVisible" :close-on-click-modal="false">
      <el-form :model="downForm" ref="downForm" :size="size" label-width="80px"
               label-position="right" style="text-align:left;" :rules="downFormRules">
        <el-form-item label="选项" prop="type">
          <el-radio-group v-model="downForm.type">
            <el-radio v-for="(type, index) in downList" :label="index" :key="index">{{type}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="模板选择" prop="type" v-if="downForm.type===1">
          <el-radio-group v-model="downForm.templateSelection">
            <el-radio v-for="(type, index) in templateList" :label="index" :key="index">{{type}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input :data="deptData" :props="deptTreeProps" :prop="downForm.deptName"
                            :nodeKey="''+downForm.deptId"
                            :currentChangeHandle="exportDeptChange"/>
        </el-form-item>
        <el-form-item label="系数方案" prop="schemeId">
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
    <!--上传-->
    <el-dialog title="上传" width="25%" :visible.sync="uploadVisible" :close-on-click-modal="false">
      <el-form :model="uploadForm" ref="uploadForm" :size="size" label-width="80px"
               label-position="right" style="text-align:left;" :rules="uploadFormRules">
        <el-form-item label="选项" prop="type">
          <el-radio-group v-model="uploadForm.type">
            <el-radio v-for="(type, index) in templateList" :label="index" :key="index">{{type}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="部门" prop="deptName" v-if="uploadForm.type===2">
          <popup-tree-input :data="deptData" :props="deptTreeProps" :prop="uploadForm.deptName"
                            :nodeKey="''+uploadForm.deptId"
                            :currentChangeHandle="uploadDeptChange"/>
        </el-form-item>
        <el-form-item label="系数方案" prop="schemeId" v-if="uploadForm.type===2">
          <el-select style="width: 100%" placeholder="选择系数方案" value-key="id" v-model="uploadForm.schemeId">
            <el-option v-for="item in schemeData" :key="item.id" :label="item.title"
                       :value="item.id" @click.native="uploadSchemeChange(item)"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="uploadVisible = false">{{$t('action.cancel')}}</el-button>
        <el-upload action="#" class="el-upload" :limit="1" ref="upload"
                   :before-upload="beforeUpload" :http-request="UploadFile"
                   :show-file-list="false" accept=".xls,.xlsx">
          <el-button :size="size" type="primary">{{$t('action.upload')}}</el-button>
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
import {Dateformat} from "../../utils/datetime";
const deptIds = sessionStorage.getItem("deptId");
const validatePass = (rule,value,callback) =>{
  if (value.length===0||!value){
    callback(new Error("请选择部门"))
  }else{
    callback();
  }
}
export default {
  name: "DeptCoe",
  components: {PopupTreeInput, KtButton, KtTable},
  data(){
    return {
      size: "small",
      loading: false, // 加载标识
      filters: {deptId: '', name: '', deptName: ''}, // 查询信息
      pageRequest: {pageNum: 1, pageSize: 10}, // 分页信息
      totalSize: 0, // 统计数
      pageResult: [], // 分页结果
      operation: false, // true:新增, false:编辑
      dialogVisible: false, // 新增编辑界面是否显示
      editLoading: false, // 编辑界面
      downloadVisible: false,// 下载页面是否显示
      uploadVisible: false,// 下载页面是否显示
      TypeList: ["方案", "系数"], // 新增选项
      pointsList: ["减分", "加分"], //系数选项
      uploadForm: [], // 上传信息
      downForm: [], // 导出信息
      dataForm: {}, // 新增编辑信息
      downList: ['导出', '上传模板'], //导出选项
      templateList: ['方案&系数', '方案', '系数'],  // 模板选项
      deptData: [], // 部门数据
      schemeData: [],// 方案数据
      dataFormRules: {
        deptName: [{required: true, validator: validatePass, trigger: "change"}],
        title: [{required: true, message: '请输入标题', trigger: 'blur'}],
        version: [{required: true, message: '版本不能为空', trigger: 'blur'}],
        detailed: [{required: true, message: '明细不能为空', trigger: 'blur'}],
        unitPrice: [{required: true, message: '绩效单价不能为空', trigger: 'blur'}],
        multiple: [{required: true, message: '绩效单价倍数不能为空', trigger: 'blur'}],
        hourTargetOutput: [{required: true, message: '每小时指标产量分数', trigger: 'blur'}],
        dayTargetOutput: [{required: true, message: '8小时指标产量分数', trigger: 'blur'}],
        effectiveDate: [{required: true, message: '生效日期', trigger: 'change'}],
        startMonth: [{required: true, message: '开始月份', trigger: 'change'}],
        endMonth: [{required: true, message: '结束月份', trigger: 'change'}],
        schemeId: [{required: true, message: '请选择方案', trigger: 'change'}],
        type: [{required: true, message: '请选择系数类型', trigger: 'change'}],
        value: [{required: true, message: '值不能为空', trigger: 'blur'}],
      }, //新增编辑规矩
      uploadFormRules: {type: [{required: true, message: '请上传导出类型', trigger: 'change'}]}, // 上传信息规则
      downFormRules: {
        type: [{required: true, message: '请选择导出类型', trigger: 'change'}],
        deptName: [{required: true, validator: validatePass, trigger: "change"}],
      }, // 导出信息规则
      deptTreeProps: {label: 'name', children: 'children'},
      //日历快速选择
      pickerOptions: {
        shortcuts: [{
          text: '今天', onClick(picker) {
            picker.$emit('pick', new Date());
          }
        },
          {
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
    };
  },
  methods: {
    // 改变表单
    changeForm: function (data) {
      let type = data
      if (data === 0) {
        this.dataForm = {
          types: type,
          id: 0,
          deptId: '',
          deptName: '',
          title: '',
          detailed: '',
          version: '',
          unitPrice: '',
          multiple: '',
          hourTargetOutput: '',
          dayTargetOutput: '',
          tutoringMonth: '',
          effectiveDate: '',
          tutoringProportion: '',
          startMonth: '',
          endMonth: '',
        }
      } else {
        this.dataForm = {
          types: type,
          id: 0,
          deptId: '',
          deptName: '',
          schemeId: '',
          type: '',
          title: '',
          value: '',
        }
      }
    },
    // 显示新增界面
    handleAdd: function () {
      this.dialogVisible = true
      this.operation = true
      this.changeForm(0)
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
    // 上传处理
    handleUpload: function () {
      this.uploadVisible = true;
      this.uploadForm = {
        type: "",
        schemeId: ""
      }
    },
    // 重置
    resetFindPage: function () {
      this.$refs['filters'].resetFields()
      this.filters = {deptId: deptIds, name: '', deptName: ''}
      this.findPage()
    },
    // 获取分页数据
    findPage: function () {
      this.loading = true;
      this.pageRequest.params = [{name: 'name', value: this.filters.name}, {name: 'deptId', value: this.filters.deptId}]
      this.$api.deptCoefficient.findPage(this.pageRequest).then((res) => {
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
      this.$api.deptCoefficient.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data
        this.totalSize = res.totalSize
      })
      this.loading = false
    },
    // 保存
    submitForm: function () {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true
            let params = Object.assign({}, this.dataForm)
            if (params.types === 0) {
              this.$api.deptCoefficient.saveScheme(params).then((res) => {
                this.editLoading = false
                if (res.code === 200) {
                  this.$message({message: '操作成功', type: 'success'})
                  this.dialogVisible = false
                  this.$refs['dataForm'].resetFields()
                } else {
                  this.$message({message: '操作失败, ' + res.msg, type: 'error'})
                }
                this.findPage(null)
              })
            } else {
              this.$api.deptCoefficient.save(params).then((res) => {
                this.editLoading = false
                if (res.code === 200) {
                  this.$message({message: '操作成功', type: 'success'})
                  this.dialogVisible = false
                  this.$refs['dataForm'].resetFields()
                } else {
                  this.$message({message: '操作失败, ' + res.msg, type: 'error'})
                }
                this.findPage(null)
              })
            }
          })
        }
      })
    },
    // 禁用方案
    disableScheme: function (params) {
      this.$confirm('确认禁用选中的信息吗？', '提示', {type: 'warning'}).then(() => {
        this.loading = true;
        this.$api.deptCoefficient.disableScheme({'schemeId': [params.id]}).then(res => {
          if (res.code === 200) {
            this.$message({message: '禁用成功', type: 'success'})
            this.findPage();
          } else {
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        })
      })
    },
    // 禁用系数
    disableCoefficient: function (params) {
      this.$confirm('确认禁用选中的信息吗？', '提示', {type: 'warning'}).then(() => {
        this.loading = true;
        this.$api.deptCoefficient.disable({'coefficientId': [params.id]}).then(res => {
          if (res.code === 200) {
            this.$message({message: res.msg, type: 'success'})
            this.findPage();
          } else {
            this.$message({message: res.msg, type: 'error'})
          }
          this.loading = false
        })
      })
    },
    // 恢复方案
    recoverScheme: function (params) {
      this.$confirm('确认恢复选中的信息吗？', '提示', {type: 'warning'}).then(() => {
        this.loading = true;
        this.$api.deptCoefficient.recoverScheme({'schemeId': [params.id]}).then(res => {
          if (res.code === 200) {
            this.$message({message: '恢复成功', type: 'success'})
            this.findPage();
          } else {
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        })
      })
    },
    // 恢复系数
    recoverCoefficient: function (params) {
      this.$confirm('确认恢复选中的信息吗？', '提示', {type: 'warning'}).then(() => {
        this.loading = true;
        this.$api.deptCoefficient.recover({'coefficientId': [params.id]}).then(res => {
          if (res.code === 200) {
            this.$message({message: '恢复成功', type: 'success'})
            this.findPage();
          } else {
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        })
      })
    },
    // 获取部门列表
    findDeptTree: function (deptId) {
      this.$api.dept.findDeptTree({'deptId': deptId}).then((res) => {this.deptData = res.data})
    },
    // 查询部门选择
    deptTreeFilters(data) {
      this.filters.deptId = data.id
      this.filters.deptName = data.name
    },
    // 查询方案列表
    findCoefficientTree: function (deptId) {
      this.$api.coefficient.findCoefficientTree({deptId: deptId}).then((res) => {
        this.schemeData = res
      })
    },
    // 保存部门选择
    saveDeptChange(data) {
      this.dataForm.deptId = data.id
      this.dataForm.deptName = data.name
      this.findCoefficientTree(data.id)
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
    // 保存方案选择
    saveSchemeChange: function (data) {this.dataForm.schemeId = data.id},
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
    // 类型格式化
    typeFormat: function (row, column) {return row[column.property] === 1 ? '加分系数' : '扣分系数';},
    // 日期格式化
    dateFormat: function (row, column) {return Dateformat(row[column.property])},
    // 上传鉴定
    beforeUpload(file) {
      let testMsg = file.name.substring(file.name.lastIndexOf('.') + 1);
      const extension = (testMsg === 'xls' || testMsg === 'xlsx')
      const isLt2M = file.size / 1024 / 1024 < 10     //这里做文件大小限制
      if (!extension) {this.$message({message: '上传文件只能是 xls、xlsx格式!', type: 'warning'});}
      if (!isLt2M) {this.$message({message: '上传文件大小不能超过 10MB!', type: 'warning'});}
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
          }
        })
      }
    },
    // 导出提交处理校验
    submitDown: function () {
      this.$refs.downForm.validate((valid) => {
        if (valid) {
          this.downForm.deptId = this.downForm.deptId === '' ? deptIds : this.downForm.deptId
          let params = Object.assign({}, this.downForm)
          this.exportExcelFile(params);
          this.downloadVisible = false;
          this.$refs['downForm'].resetFields()
        }
      })
    },
    // 导出Excel
    exportExcelFile: function (params) {
      axios.post(baseUrl + '/deptCoe/download', params, {
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
