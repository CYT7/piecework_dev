<template>
  <div class="page-container">
	<!--工具栏-->
	<div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
		<el-form :inline="true" :size="size">
			<el-form-item>
				<kt-button icon="fa fa-plus" :label="$t('action.add')" perms="sys:dept:add" type="primary" @click="handleAdd"/>
			</el-form-item>
		</el-form>
	</div>
	<!--表格树内容栏-->
    <el-table :data="tableTreeData" stripe size="mini" style="width: 100%;" v-loading="loading" element-loading-text="$t('action.loading')">
      <table-tree-column prop="name" treeKey="id" label="名称"/>
      <el-table-column prop="parentName" header-align="center" align="center" min-width="50%" label="上级部门"/>
      <el-table-column prop="orderNum" header-align="center" align="center" min-width="30%" label="排序"/>
      <el-table-column prop="createBy" header-align="center" align="center" min-width="30%" label="创建人"/>
      <el-table-column prop="createTime" header-align="center" align="center" label="创建时间" :formatter="dateFormat"/>
      <el-table-column header-align="center" align="center" :label="$t('action.operation')">
        <template slot-scope="scope">
          <kt-button icon="fa fa-edit" :label="$t('action.edit')" perms="sys:dept:edit" @click="handleEdit(scope.row)"/>
          <kt-button icon="fa fa-trash" :label="$t('action.delete')" perms="sys:dept:delete" type="danger" @click="handleDelete(scope.row)"/>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增修改界面 -->
    <el-dialog :title="!dataForm.id ? '新增' : '修改'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="submitForm()" label-width="80px" :size="size" style="text-align:left;">
        <el-form-item label="部门名称" prop="name"><el-input v-model="dataForm.name" placeholder="名称"/></el-form-item>
        <el-form-item label="上级机构" prop="parentName">
          <popup-tree-input
            :data="popupTreeData" :props="popupTreeProps" :prop="dataForm.parentName==null?'顶级部门':dataForm.parentName"
            :nodeKey="''+dataForm.parentId" :currentChangeHandle="handleTreeSelectChange">
          </popup-tree-input>
        </el-form-item>
        <el-form-item label="排序编号" prop="orderNum">
          <el-input-number v-model="dataForm.orderNum" controls-position="right" :min="0" label="排序编号"></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :size="size"  @click="dialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size"  type="primary" @click="submitForm()">{{$t('action.confirms')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import FaIconTooltip from "../../components/FaIconTooltip"
import TableTreeColumn from "../Core/TableTreeColumn";
import PopupTreeInput from "../../components/PopupTreeInput";
import KtButton from "../Core/KtButton";
import {format} from "../../utils/datetime";
export default {
	components:{
    PopupTreeInput,
    KtButton,
    TableTreeColumn,
    FaIconTooltip
	},
	data() {
		return {
			size: 'small',
			loading: false,
      tableTreeData: [],
      dialogVisible: false,
      dataForm: {
        id: 0,
        name: '',
        parentId: 0,
        parentName: '',
        orderNum: 0
      },
      dataRule: {name: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],},
      popupTreeData: [],
      popupTreeProps: {
				label: 'name',
				children: 'children'
			}
		}
	},
	methods: {
		//获取数据
    findTreeData: function () {
      this.loading = true;
			this.$api.dept.findTree().then((res) => {
        this.tableTreeData = res.data;
        this.popupTreeData = this.getParentMenuTree(res.data);
        this.loading = false
			})
    },
		//获取上级机构树
    getParentMenuTree: function (tableTreeData) {
      let parent = {
        parentId: 0,
        name: '顶级部门',
        children: tableTreeData
      };
      return [parent]
    },
		//显示新增界面
		handleAdd: function () {
			this.dialogVisible = true;
			this.dataForm = {
        id: 0,
        name: '',
        parentId: 0,
        parentName: '',
        orderNum: 0
      }
		},
		//显示编辑界面
		handleEdit: function (row) {
      this.dialogVisible = true;
      Object.assign(this.dataForm, row);
		},
    //删除
    handleDelete (row) {
      this.$confirm('确认删除选中记录吗？', '提示', {
				type: 'warning'
      }).then(() => {
        let params = this.getDeleteIds([], row);
        this.$api.dept.Delete({'deptId':params}).then(() => {
          this.findTreeData();
          this.$message({message: '删除成功', type: 'success'})
        })
      })
    },
    //获取删除的包含子机构的id列表
    getDeleteIds (ids, row) {
      ids.push(row.id);
      if(row.children != null) {
        for(let i=0, len=row.children.length; i<len; i++) {
          this.getDeleteIds(ids, row.children[i])
        }
      }
      return ids
    },
    //机构树选中
    handleTreeSelectChange (data) {
      this.dataForm.parentId = data.id?data.id:0;
      this.dataForm.parentName = data.name
    },
    //表单提交
    submitForm () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.editLoading = true;
						let params = Object.assign({}, this.dataForm);
						this.$api.dept.save(params).then((res) => {
              this.editLoading = false;
              if(res.code === 200) {
								this.$message({ message: '操作成功', type: 'success' });
                this.dialogVisible = false;
                this.$refs['dataForm'].resetFields()
							} else {
								this.$message({message: '操作失败, ' + res.msg, type: 'error'})
							}
							this.findTreeData()
						})
					})
				}
      })
    },
		// 时间格式化
    dateFormat: function (row, column){return format(row[column.property])}
	},
	mounted() {this.findTreeData()}
}
</script>
<style scoped>
</style>
