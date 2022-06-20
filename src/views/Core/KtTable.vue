<template>
  <div>
    <!--表格栏-->
    <el-table :data="data.data" :highlight-current-row="highlightCurrentRow" @selection-change="selectionChange"
              @current-change="handleCurrentChange" v-loading="loading"
              :element-loading-text="$t('action.loading')" :border="border" :stripe="stripe"
              :show-overflow-tooltip="showOverflowTooltip" :max-height="maxHeight"
              :size="size" :align="align" style="width:100%;" >
      <el-table-column type="selection" width="40" v-if="showBatchOperation & showOperation"></el-table-column>
      <el-table-column v-for="column in columns" header-align="center" align="center"
        :prop="column.prop" :label="column.label" :width="column.width" :min-width="column.minWidth"
        :fixed="column.fixed" :key="column.prop" :type="column.type" :formatter="column.formatter"
        :sortable="column.sortable==null?true:column.sortable">
      </el-table-column>
      <el-table-column :label="$t('action.operation')" min-width="40%" v-if="showOperation" header-align="center" align="center">
        <template slot-scope="scope">
          <kt-button v-if="permsEdit?permsEdit:''" icon="fa fa-edit" :label="$t('action.edit')"
                     :perms="permsEdit" :size="size" @click="handleEdit(scope.$index, scope.row)" />
          <kt-button v-if="permsDelete?permsDelete:''" icon="fa fa-trash" :label="$t('action.delete')"
                     :perms="permsDelete" :size="size" type="danger" @click="handleDelete(scope.$index, scope.row)" />
          <kt-button v-if="scope.row.status === 1" icon="fa fa-lock" :label="$t('action.disable')"
                     :perms="permsDisable" :size="size" type="warning" @click="handleDisable(scope.$index, scope.row)" />
          <kt-button v-else-if="scope.row.status === 0" icon="fa fa-unlock" :label="$t('action.recover')"
                     :perms="permsRecover" :size="size" type="primary" @click="handleRecover(scope.$index, scope.row)" />
        </template>
      </el-table-column>
    </el-table>
    <!--分页栏-->
    <div class="toolbar" style="padding:10px;">
      <kt-button :label="$t('action.batchDelete')" :perms="permsDelete" :size="size"
                 type="danger" @click="handleBatchDelete()" :disabled="this.selections.length===0"
                 style="float:left;" v-if="showBatchOperation & showOperation"/>
      <kt-button :label="$t('action.batchDisable')" :perms="permsDisable" :size="size"
                 type="waring" @click="handleBatchDisable()" :disabled="this.selections.length===0"
                 style="float:left;" v-if="showBatchOperation & showOperation"/>
      <kt-button :label="$t('action.batchRecover')" :perms="permsRecover" :size="size"
                 type="primary" @click="handleBatchRecover()" :disabled="this.selections.length===0"
                 style="float:left;" v-if="showBatchOperation & showOperation"/>
      <el-pagination layout="total, prev, pager, next, jumper" @current-change="refreshPageRequest"
                     :current-page="pageRequest.pageNum" :page-size="pageRequest.pageSize"
                     :total="data.totalSize" style="float:right;">
      </el-pagination>
    </div>
  </div>
</template>
<script>
import KtButton from "./KtButton";
export default {
  name: 'KtTable',
  components:{KtButton},
  props: {
    columns: Array, //表格列配置
    data: Object, //表格分页数据
    permsEdit: String,  //编辑权限标识
    permsDelete: String,  //删除权限标识
    permsDisable: String,  //禁用权限标识
    permsRecover: String,  //恢复权限标识
    size: {type: String, default: 'mini'},//尺寸样式
    align: {type: String, default: 'left'},//文本对齐方式
    maxHeight: {type: Number, default: '100%'},//表格最大高度
    showOperation: {type: Boolean, default: true},//是否显示操作组件
    border: {type: Boolean, default: false},//是否显示边框
    stripe: {type: Boolean, default: true},//是否显示斑马线
    highlightCurrentRow: {type: Boolean, default: true},//是否高亮当前行
    showOverflowTooltip: {type: Boolean, default: true},//是否单行显示
    showBatchOperation: {type: Boolean, default: true}//是否显示操作组件
  },
  data() {
    return {
			pageRequest: {pageNum: 1, pageSize: 10},//分页信息
      loading: false,//加载标识
      selections: []//列表选中列
    }
  },
  methods: {
    //分页查询
    findPage: function () {
      this.loading = true;
      let callback = () => {this.loading = false};
      this.$emit('findPage', {pageRequest:this.pageRequest, callback:callback})
    },
    //选择切换
    selectionChange: function (selections) {
      this.selections = selections;
      this.$emit('selectionChange', {selections:selections})
    },
    //选择切换
    handleCurrentChange: function (val) {this.$emit('handleCurrentChange', {val:val})},
    //换页刷新
		refreshPageRequest: function (pageNum) {
      this.pageRequest.pageNum = pageNum;
      this.findPage()
    },
    //编辑
		handleEdit: function (index, row) {this.$emit('handleEdit', {index:index, row:row})},
    //删除
		handleDelete: function (index, row) {let ids = [row.id];this.delete(ids)},
    //禁用
    handleDisable: function (index, row) {let ids = [row.id];this.disable(ids)},
    //恢复
    handleRecover: function (index, row) {let ids = [row.id];this.recover(ids)},
		//批量删除
		handleBatchDelete: function () {
      let ids = []
      this.selections.forEach(t=>{ids.push(t.id)})
			this.delete(ids)
		},
    //批量禁用
    handleBatchDisable: function () {
      let ids = []
      this.selections.forEach(t=>{if (t.status ===1){ids.push(t.id)}})
      this.disable(ids)
    },
    //批量恢复
    handleBatchRecover: function () {
      let ids = []
      this.selections.forEach(t=>{if (t.status ===0){ids.push(t.id)}})
      this.recover(ids)
    },
		//删除操作
		delete: function (ids) {
			this.$confirm('确认删除选中记录吗？', '提示', {type: 'warning'
			}).then(() => {
				let params = ids;
        this.loading = true;
        let callback = res => {
          if(res.code === 200) {
            this.$message({message: '删除成功', type: 'success'});
            this.findPage()
          } else {
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        };
        this.$emit('handleDelete', {params:params, callback:callback})
			}).catch(() => {})
		},
		//禁用操作
    disable: function (ids) {
      this.$confirm('确认禁用选中的记录吗？', '提示', {type: 'warning'
      }).then(() => {
        let params = ids
        this.loading = true;
        let callback = res => {
          if(res.code === 200) {
            this.$message({message: '禁用成功', type: 'success'});
            this.findPage()
          } else {
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        };
        this.$emit('handleDisable', {params:params, callback:callback})
      }).catch(() => {})
    },
    //恢复操作
    recover: function (ids) {
      this.$confirm('确认恢复选中的记录吗？', '提示', {type: 'warning'
      }).then(() => {
        let params = ids
        this.loading = true;
        let callback = res => {
          if(res.code === 200) {
            this.$message({message: '恢复成功', type: 'success'});
            this.findPage()
          } else {
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        };
        this.$emit('handleRecover', {params:params, callback:callback})
      }).catch(() => {})
    }
  },
  mounted() {this.refreshPageRequest(1)}
}
</script>
<style scoped>
</style>
