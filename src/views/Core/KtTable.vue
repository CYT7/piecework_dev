<template>
  <div>
    <!--表格栏-->
    <el-table v-loading="loading" :align="align" :border="border"
              :data="data.data" :element-loading-text="$t('action.loading')"
              :highlight-current-row="highlightCurrentRow" :show-overflow-tooltip="showOverflowTooltip" :size="size"
              :stripe="stripe"
              style="width:100%;" @selection-change="selectionChange" @current-change="handleCurrentChange">
      <el-table-column v-if="showBatchOperation & showOperation" type="selection" width="40"></el-table-column>
      <el-table-column v-for="column in columns" :key="column.prop" :fixed="column.fixed"
                       :formatter="column.formatter" :label="column.label" :min-width="column.minWidth" :prop="column.prop"
                       :sortable="column.sortable==null?true:column.sortable" :type="column.type" :width="column.width" align="center"
                       header-align="center">
      </el-table-column>
      <el-table-column v-if="showOperation" :label="$t('action.operation')" align="center" header-align="center"
                       min-width="40%">
        <template slot-scope="scope">
          <div v-if="circle">
            <el-tooltip :content="$t('action.edit')" x-placement="top">
              <kt-button v-if="permsEdit?permsEdit:''" :circle="circle" :perms="permsEdit"
                         :size="size" icon="fa fa-edit" @click="handleEdit(scope.$index, scope.row)"/>
            </el-tooltip>
            <el-tooltip v-if="scope.row.status === 0" :content="$t('action.delete')" x-placement="top">
              <kt-button v-if="permsDelete?permsDelete:''" :circle="circle" :perms="permsDelete"
                         :size="size" icon="fa fa-trash" type="danger"
                         @click="handleDelete(scope.$index, scope.row)"/>
            </el-tooltip>
            <el-tooltip v-if="scope.row.status === 1" :content="$t('action.disable')" x-placement="top">
              <kt-button v-if="permsDisable?permsDisable:''" :circle="circle" :perms="permsDisable"
                         :size="size" icon="fa fa-lock" type="warning"
                         @click="handleDisable(scope.$index, scope.row)"/>
            </el-tooltip>
            <el-tooltip v-if="scope.row.status === 0" :content="$t('action.recover')" x-placement="top">
              <kt-button v-if="permsRecover?permsRecover:''" :circle="circle" :perms="permsRecover"
                         :size="size" icon="fa fa-unlock" type="primary"
                         @click="handleRecover(scope.$index, scope.row)"/>
            </el-tooltip>
            <el-tooltip v-if="scope.row.checkStatus === 0" :content="$t('action.disagree')" x-placement="top">
              <kt-button v-if="permsDisagree?permsDisagree:''" :circle="circle" :perms="permsDisagree"
                         :size="size" icon="fa fa-times" type="warning"
                         @click="handleDisagree(scope.$index, scope.row)"/>
            </el-tooltip>
            <el-tooltip v-if="scope.row.checkStatus === 0" :content="$t('action.disagree')" x-placement="top">
              <kt-button v-if="permsAgree?permsAgree:''" :circle="circle" :perms="permsAgree"
                         :size="size" icon="fa fa-check" type="primary" @click="handleAgree(scope.$index, scope.row)"/>
            </el-tooltip>
          </div>
          <div v-else>
            <kt-button v-if="permsEdit?permsEdit:''" :circle="circle" :label="$t('action.edit')" :perms="permsEdit"
                       :size="size" icon="fa fa-edit" @click="handleEdit(scope.$index, scope.row)"/>
            <kt-button v-if="permsDelete?permsDelete:''" :circle="circle" :label="$t('action.delete')"
                       :perms="permsDelete"
                       :size="size" icon="fa fa-trash" type="danger" @click="handleDelete(scope.$index, scope.row)"/>
            <kt-button v-if="scope.row.status === 1" :circle="circle" :label="$t('action.disable')" :perms="permsDisable"
                       :size="size" icon="fa fa-lock" type="warning"
                       @click="handleDisable(scope.$index, scope.row)"/>
            <kt-button v-if="scope.row.status === 0" :circle="circle" :label="$t('action.recover')" :perms="permsRecover"
                       :size="size" icon="fa fa-unlock" type="primary"
                       @click="handleRecover(scope.$index, scope.row)"/>
            <kt-button v-if="scope.row.checkStatus === 0" :circle="circle" :label="$t('action.disagree')"
                       :perms="permsDisagree"
                       :size="size" icon="fa fa-times" type="warning"
                       @click="handleDisagree(scope.$index, scope.row)"/>
            <kt-button v-if="scope.row.checkStatus === 0" :circle="circle" :label="$t('action.agree')"
                       :perms="permsAgree"
                       :size="size" icon="fa fa-check" type="primary" @click="handleAgree(scope.$index, scope.row)"/>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!--分页栏-->
    <div class="toolbar" style="padding:10px;">
      <kt-button v-if="showBatchOperation & showOperation" :disabled="this.selections.length===0" :label="$t('action.batchDelete')"
                 :perms="permsDelete" :size="size" style="float:left;"
                 type="danger" @click="handleBatchDelete()"/>
      <kt-button v-if="showBatchOperation & showOperation" :disabled="this.selections.length===0" :label="$t('action.batchDisable')"
                 :perms="permsDisable" :size="size" style="float:left;"
                 type="waring" @click="handleBatchDisable()"/>
      <kt-button v-if="showBatchOperation & showOperation" :disabled="this.selections.length===0" :label="$t('action.batchRecover')"
                 :perms="permsRecover" :size="size" style="float:left;"
                 type="primary" @click="handleBatchRecover()"/>
      <kt-button v-if="showBatchOperation & showOperation" :disabled="this.selections.length===0" :label="$t('action.batchDisagree')"
                 :perms="permsDisagree" :size="size" style="float:left;"
                 type="waring" @click="handleBatchDisagree()"/>
      <kt-button v-if="showBatchOperation & showOperation" :disabled="this.selections.length===0" :label="$t('action.batchAgree')"
                 :perms="permsAgree" :size="size" style="float:left;"
                 type="primary" @click="handleBatchAgree()"/>
      <el-pagination :current-page="pageRequest.pageNum" :page-size="pageRequest.pageSize"
                     :total="data.totalSize" layout="total, prev, pager, next, jumper"
                     style="float:right;" @current-change="refreshPageRequest">
      </el-pagination>
    </div>
  </div>
</template>
<script>
import KtButton from "./KtButton";

export default {
  name: 'KtTable',
  components: {KtButton},
  props: {
    columns: Array, //表格列配置
    data: Object, //表格分页数据
    permsEdit: String,  //编辑权限标识
    permsDelete: String,  //删除权限标识
    permsDisable: String,  //禁用权限标识
    permsRecover: String,  //恢复权限标识
    permsDisagree: String,  //不通过权限标识
    permsAgree: String,  //通过权限标识
    circle: {type: Boolean, default: false},//是否显示操作组件
    size: {type: String, default: 'mini'},//尺寸样式
    align: {type: String, default: 'left'},//文本对齐方式
    showOperation: {type: Boolean, default: true},//是否显示操作组件
    border: {type: Boolean, default: false},//是否显示边框
    stripe: {type: Boolean, default: true},//是否显示斑马线
    highlightCurrentRow: {type: Boolean, default: true},//是否高亮当前行
    showOverflowTooltip: {type: Boolean, default: true},//是否单行显示
    showBatchOperation: {type: Boolean, default: true},//是否显示操作组件

  },
  data() {
    return {
      pageRequest: {pageNum: 1, pageSize: 10},//分页信息
      loading: false,//加载标识
      selections: [],//列表选中列
      checkStatus: ''
    }
  },
  methods: {
    //分页查询
    findPage: function () {
      this.loading = true;
      let callback = () => {
        this.loading = false
      };
      this.$emit('findPage', {pageRequest: this.pageRequest, callback: callback})
    },
    //选择切换
    selectionChange: function (selections) {
      this.selections = selections;
      this.$emit('selectionChange', {selections: selections})
    },
    //选择切换
    handleCurrentChange: function (val) {
      this.$emit('handleCurrentChange', {val: val})
    },
    //换页刷新
    refreshPageRequest: function (pageNum) {
      this.pageRequest.pageNum = pageNum;
      this.findPage()
    },
    //编辑
    handleEdit: function (index, row) {
      this.$emit('handleEdit', {index: index, row: row})
    },
    //删除
    handleDelete: function (index, row) {
      let ids = [row.id];
      this.delete(ids)
    },
    //禁用
    handleDisable: function (index, row) {
      let ids = [row.id];
      this.disable(ids)
    },
    //恢复
    handleRecover: function (index, row) {
      let ids = [row.id];
      this.recover(ids)
    },
    handleDisagree: function (index, row) {
      let ids = [row.id];
      this.disagree(ids)
    },
    handleAgree: function (index, row) {
      let ids = [row.id];
      this.Agree(ids)
    },
    //批量删除
    handleBatchDelete: function () {
      let ids = []
      this.selections.forEach(t => {
        ids.push(t.id)
      })
      this.delete(ids)
    },
    //批量禁用
    handleBatchDisable: function () {
      let ids = []
      this.selections.forEach(t => {
        if (t.status === 1) {
          ids.push(t.id)
        }
      })
      this.disable(ids)
    },
    //批量恢复
    handleBatchRecover: function () {
      let ids = []
      this.selections.forEach(t => {
        if (t.status === 0) {
          ids.push(t.id)
        }
      })
      this.recover(ids)
    },
    //批量不通过
    handleBatchDisagree: function () {
      let ids = []
      this.selections.forEach(t => {
        ids.push(t.id)
      })
      this.disagree(ids)
    },
    //批量通过
    handleBatchAgree: function () {
      let ids = []
      this.selections.forEach(t => {
        ids.push(t.id)
      })
      this.Agree(ids)
    },
    //删除操作
    delete: function (ids) {
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        let params = ids;
        this.loading = true;
        let callback = res => {
          if (res.code === 200) {
            this.$message({message: '删除成功', type: 'success'});
            this.findPage()
          } else {
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        };
        this.$emit('handleDelete', {params: params, callback: callback})
      }).catch(() => {
      })
    },
    //禁用操作
    disable: function (ids) {
      this.$confirm('确认禁用选中的记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        let params = ids
        this.loading = true;
        let callback = res => {
          if (res.code === 200) {
            this.$message({message: '禁用成功', type: 'success'});
            this.findPage()
          } else {
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        };
        this.$emit('handleDisable', {params: params, callback: callback})
      }).catch(() => {
      })
    },
    //恢复操作
    recover: function (ids) {
      this.$confirm('确认恢复选中的记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        let params = ids
        this.loading = true;
        let callback = res => {
          if (res.code === 200) {
            this.$message({message: '恢复成功', type: 'success'});
            this.findPage()
          } else {
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        };
        this.$emit('handleRecover', {params: params, callback: callback})
      }).catch(() => {
      })
    },
    //恢复操作
    disagree: function (ids) {
      this.$confirm('确认操作选中的记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        let params = ids
        this.loading = true;
        let callback = res => {
          if (res.code === 200) {
            this.$message({message: '操作成功', type: 'success'});
            this.findPage()
          } else {
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        };
        this.$emit('handleDisagree', {params: params, callback: callback})
      }).catch(() => {
      })
    },
    //恢复操作
    Agree: function (ids) {
      this.$confirm('确认通过选中的记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        let params = ids
        this.loading = true;
        let callback = res => {
          if (res.code === 200) {
            this.$message({message: '操作成功', type: 'success'});
            this.findPage()
          } else {
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        };
        this.$emit('handleAgree', {params: params, callback: callback})
      }).catch(() => {
      })
    },
  },
  mounted() {
    this.refreshPageRequest(1)
  }
}
</script>
<style scoped>
</style>
