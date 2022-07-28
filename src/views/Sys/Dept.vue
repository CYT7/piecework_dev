<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :size="size">
        <el-form-item>
          <kt-button :label="$t('action.add')" icon="fa fa-plus"
                     perms="sys:dept:add" type="primary" @click="handleAdd"/>
        </el-form-item>
      </el-form>
    </div>
    <!--表格树内容栏-->
    <el-table v-loading="loading" :data="tableTreeData" :element-loading-text="$t('action.loading')" :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
              row-key="id" size="mini"
              stripe style="width: 100%;">
      <el-table-column align="center" header-align="center" label="部门" min-width="50%" prop="name"/>
      <el-table-column align="center" header-align="center" label="上级部门" min-width="50%" prop="parentName"/>
      <el-table-column align="center" header-align="center" label="排序" min-width="50%" prop="orderNum"/>
      <el-table-column :label="$t('action.operation')" align="center" header-align="center" min-width="100%">
        <template slot-scope="scope">
          <kt-button :label="$t('action.edit')" icon="fa fa-edit"
                     perms="sys:dept:edit" @click="handleEdit(scope.row)"/>
          <kt-button :label="$t('action.delete')" icon="fa fa-trash"
                     perms="sys:dept:delete" type="danger" @click="handleDelete(scope.row)"/>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增修改界面 -->
    <el-dialog :close-on-click-modal="false" :title="!dataForm.id ? $t('action.add') : $t('action.edit')"
               :visible.sync="dialogVisible" width="40%">
      <el-form ref="dataForm" :model="dataForm" :rules="dataRule" :size="size"
               label-width="80px" style="text-align:left;" @keyup.enter.native="submitForm()">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="dataForm.name" placeholder="名称"/>
        </el-form-item>
        <el-form-item label="上级机构" prop="parentName">
          <popup-tree-input
            :currentChangeHandle="saveDeptChange" :data="deptData" :nodeKey="''+dataForm.parentId"
            :prop="dataForm.parentName==null?'顶级':dataForm.parentName" :props="deptTreeProps">
          </popup-tree-input>
        </el-form-item>
        <el-form-item label="排序编号" prop="orderNum">
          <el-input-number v-model="dataForm.orderNum" :min="0" controls-position="right" label="排序编号"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :size="size" @click="dialogVisible = false">{{ $t('action.cancel') }}</el-button>
        <el-button :size="size" type="primary" @click="submitForm()">{{ $t('action.confirms') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import FaIconTooltip from "../../components/FaIconTooltip"
import TableTreeColumn from "../Core/TableTreeColumn";
import PopupTreeInput from "../../components/PopupTreeInput";
import KtButton from "../Core/KtButton";

export default {
  components: {PopupTreeInput, KtButton, TableTreeColumn, FaIconTooltip},
  data() {
    return {
      size: 'small',
      loading: false, // 加载标识
      tableTreeData: [], // 数据
      dialogVisible: false, // 编辑标识
      dataForm: {}, // 编辑信息
      dataRule: {name: [{required: true, message: '部门名称不能为空', trigger: 'blur'}],},
      deptData: [], // 部门数据
      deptTreeProps: {label: 'name', children: 'children'}
    }
  },
  methods: {
    // 显示新增界面
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
    // 显示编辑界面
    handleEdit: function (row) {
      this.dialogVisible = true;
      Object.assign(this.dataForm, row);
    },
    // 获取数据
    findTreeData: function () {
      this.loading = true;
      this.$api.dept.findTree().then((res) => {
        this.tableTreeData = res.data;
        this.deptData = this.getParentMenuTree(res.data);
        this.loading = false
      })
    },
    // 获取上级机构树
    getParentMenuTree: function (tableTreeData) {
      return [{parentId: 0, name: '顶级', children: tableTreeData}]
    },
    // 获取删除的包含子机构的id列表
    getDeleteIds(ids, row) {
      ids.push(row.id);
      if (row.children != null) {
        for (let i = 0, len = row.children.length; i < len; i++) {
          this.getDeleteIds(ids, row.children[i])
        }
      }
      return ids
    },
    // 删除
    handleDelete(row) {
      this.$confirm('确认删除选中记录吗？', '提示', {type: 'warning'}).then(() => {
        let params = this.getDeleteIds([], row);
        this.$api.dept.Delete({'deptId': params}).then((res) => {
          this.findTreeData();
          if (res.code === 200) {
            this.$message({message: res.msg, type: 'success'})
            this.dialogVisible = false;
            this.$refs['dataForm'].resetFields()
          } else {
            this.$message({message: res.msg, type: 'error'})
          }
        })
      })
    },
    // 保存部门选中
    saveDeptChange(data) {
      this.dataForm.parentId = data.id ? data.id : 0;
      this.dataForm.parentName = data.name
    },
    // 表单提交
    submitForm() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true;
            let params = Object.assign({}, this.dataForm);
            this.$api.dept.save(params).then((res) => {
              this.editLoading = false;
              if (res.code === 200) {
                this.$message({message: '操作成功', type: 'success'});
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
  },
  mounted() {
    this.findTreeData()
  }
}
</script>
<style scoped>
</style>
