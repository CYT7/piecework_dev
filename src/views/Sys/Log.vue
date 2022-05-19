<template>
  <div class="page-container">
	<!--工具栏-->
	<div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
		<el-form :inline="true" :model="filters" :size="size">
			<el-form-item><el-input v-model="filters.name" placeholder="用户名"/></el-form-item>
			<el-form-item>
        <kt-button icon="fa fa-search" :label="$t('action.search')" perms="sys:log:view" type="primary" @click="findPage(null)"/>
			</el-form-item>
      <el-form-item>
        <el-tooltip content="刷新" x-placement="top"><el-button icon="fa fa-refresh" @click="findPage(null)"/></el-tooltip>
      </el-form-item>
		</el-form>
	</div>
	<!--表格内容栏-->
	<kt-table :data="pageResult" :columns="columns" permsDelete="sys:user:delete" @findPage="findPage" @handleDelete="handleDelete">
	</kt-table>
  </div>
</template>
<script>
import KtTable from "../Core/KtTable";
import KtButton from "../Core/KtButton";
import {format} from "../../utils/datetime";
export default {
	components: {
		KtTable,
		KtButton
	},
	data() {
		return {
			size: 'small',
			filters: {name: ''},
			columns: [
				{prop:"id", label:"ID", minWidth:'20%'},
				{prop:"userName", label:"用户名", minWidth:'20%'},
				{prop:"method", label:"方法", minWidth:'20%'},
				{prop:"params", label:"参数", minWidth:'20%'},
				{prop:"ip", label:"IP", minWidth:'20%'},
				{prop:"time", label:"耗时", minWidth:'20%',formatter:this.timeFormat},
				{prop:"createBy", label:"创建人", minWidth:'20%'},
				{prop:"createTime", label:"创建时间", minWidth:'20%', formatter:this.dateFormat},
      ],
			pageRequest: { pageNum: 1, pageSize: 10 },
      pageResult: {},
      showOperation:false
		}
	},
	methods: {
		//获取分页数据
		findPage: function (data) {
			if(data !== null) {this.pageRequest = data.pageRequest}
			this.pageRequest.params = [{name:'userName', value:this.filters.name}];
			this.$api.log.findPage(this.pageRequest).then((res) => {
			  this.pageResult = res
			}).then(data!=null?data.callback:'')
		},
    // 批量删除
    handleDelete: function (data) {this.$api.log.Delete({'logId':data.params}).then(data.callback)},
    //时间格式化
    dateFormat: function (row, column){return format(row[column.property])},
    //耗时格式化
    timeFormat: function (row,column){return row[column.property]/1000 + 's';}
	},
	mounted() {}
}
</script>
<style scoped>
</style>
