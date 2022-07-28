<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :size="size">
        <el-form-item>
          <kt-button :label="$t('action.add')" icon="fa fa-plus" perms="sys:role:add" type="primary"
                     @click="handleAdd"/>
        </el-form-item>
        <el-form-item>
          <kt-button :label="$t('action.refresh')" icon="fa fa-refresh" perms="sys:role:view" @click="findPage(null)"/>
        </el-form-item>
      </el-form>
    </div>
    <!--表格内容栏-->
    <kt-table :columns="columns" :data="pageResult" :highlightCurrentRow="true" :showBatchOperation="false"
              :stripe="false" permsDelete="sys:role:delete" permsEdit="sys:role:edit"
              @findPage="findPage" @handleCurrentChange="handleRoleSelectChange"
              @handleDelete="handleDelete" @handleEdit="handleEdit"/>
    <!--新增编辑界面-->
    <el-dialog :close-on-click-modal="false" :title="operation? $t('action.add') : $t('action.edit')"
               :visible.sync="dialogVisible" width="30%">
      <el-form ref="dataForm" :model="dataForm" :rules="dataFormRules" :size="size" label-width="auto">
        <el-form-item v-if="false" label="ID" prop="id">
          <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="角色名" prop="name">
          <el-input v-model="dataForm.name" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="备注 " prop="remark">
          <el-input v-model="dataForm.remark" auto-complete="off"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible = false">{{ $t('action.cancel') }}</el-button>
        <el-button :loading="editLoading" :size="size" type="primary"
                   @click.native="submitForm">{{ $t('action.submit') }}
        </el-button>
      </div>
    </el-dialog>
    <!--角色菜单，表格树内容栏-->
    <div :v-if="true" class="menu-container">
      <div class="menu-header">
        <span><B>角色菜单授权</B></span>
      </div>
      <el-tree ref="menuTree" v-loading="menuLoading" :check-strictly="true" :data="menuData" :element-loading-text="$t('action.loading')"
               :props="defaultProps" :render-content="renderContent" node-key="id"
               show-checkbox size="mini" style="width: 100%;padding-top:20px;"
               @check-change="handleMenuCheckChange">
      </el-tree>
      <div style="float:left;padding-left:24px;padding-top:12px;padding-bottom:4px;">
        <el-checkbox v-model="checkAll" :disabled="this.selectRole.id == null" @change="handleCheckAll">
          <b>全选</b>
        </el-checkbox>
      </div>
      <div style="float:right;padding-right:15px;padding-top:4px;padding-bottom:4px;">
        <kt-button :disabled="this.selectRole.id == null" :label="$t('action.reset')" perms="sys:role:edit"
                   type="primary" @click="resetSelection"/>
        <kt-button :disabled="this.selectRole.id == null" :label="$t('action.submit')" :loading="authLoading"
                   perms="sys:role:edit" type="primary" @click="submitAuthForm"/>
      </div>
    </div>
  </div>
</template>
<script>
import KtTable from "../Core/KtTable";
import KtButton from "../Core/KtButton";
import {format} from "../../utils/datetime";
import TableTreeColumn from "../Core/TableTreeColumn";

export default {
  components: {KtTable, KtButton, TableTreeColumn},
  data() {
    return {
      size: 'small',
      columns: [
        {prop: "name", label: "角色名", minWidth: '25%'},
        {prop: "remark", label: "备注", minWidth: '25%'}
      ], // 表格列
      pageRequest: {pageNum: 1, pageSize: 10}, // 分页请求
      pageResult: {}, // 分页结果
      operation: false, // true:新增, false:编辑
      dialogVisible: false, // 新增编辑界面是否显示
      editLoading: false, // 编辑加载
      menuLoading: false, // 菜单加载
      authLoading: false, // 提交加载
      checkAll: false,  // 全选
      dataFormRules: {
        name: [{required: true, message: '请输入角色名', trigger: 'blur'}],
        remark: [{required: true, message: '请输入备注', trigger: 'blur'}],
      }, // 规则
      dataForm: {}, // 新增编辑界面数据
      selectRole: {}, // 角色选择
      menuData: [], // 菜单数据
      menuSelections: [], // 菜单选择
      currentRoleMenus: [], // 现在角色菜单
      defaultProps: {children: 'children', label: 'name'}
    }
  },
  methods: {
    // 显示新增界面
    handleAdd: function () {
      this.dialogVisible = true
      this.operation = true
      this.dataForm = {
        id: 0,
        name: '',
        remark: ''
      }
    },
    // 显示编辑界面
    handleEdit: function (params) {
      this.dialogVisible = true
      this.operation = false
      this.dataForm = Object.assign({}, params.row)
    },
    // 获取分页数据
    findPage: function (data) {
      this.$api.role.findPage(this.pageRequest).then((res) => {
        this.pageResult = res
        this.findTreeData()
      }).then(data != null ? data.callback : '')
    },
    // 批量删除
    handleDelete: function (data) {
      this.$api.role.Delete({'roleId': data.params}).then(data.callback)
    },
    // 保存
    submitForm: function () {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true
            let params = Object.assign({}, this.dataForm)
            this.$api.role.save(params).then((res) => {
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
          })
        }
      })
    },
    // 获取数据
    findTreeData: function () {
      this.menuLoading = true
      this.$api.menu.findMenuTree().then((res) => {
        this.menuData = res.data
        this.menuLoading = false
      })
    },
    // 角色选择改变监听
    handleRoleSelectChange(val) {
      if (val == null || val.val == null) {
        return
      }
      this.selectRole = val.val
      this.$api.role.findRoleMenus({'roleId': val.val.id}).then((res) => {
        this.currentRoleMenus = res.data
        this.$refs.menuTree.setCheckedNodes(res.data)
      })
    },
    // 树节点选择监听
    handleMenuCheckChange(data, check) {
      if (check) {
        // 节点选中时同步选中父节点
        let parentId = data.parentId
        this.$refs.menuTree.setChecked(parentId, true, false)
      } else {
        // 节点取消选中时同步取消选中子节点
        if (data.children != null) {
          data.children.forEach(element => {
            this.$refs.menuTree.setChecked(element.id, false, false)
          });
        }
      }
    },
    // 重置选择
    resetSelection() {
      this.checkAll = false
      this.$refs.menuTree.setCheckedNodes(this.currentRoleMenus)
    },
    // 全选操作
    handleCheckAll() {
      if (this.checkAll) {
        let allMenus = []
        this.checkAllMenu(this.menuData, allMenus)
        this.$refs.menuTree.setCheckedNodes(allMenus)
      } else {
        this.$refs.menuTree.setCheckedNodes([])
      }
    },
    // 递归全选
    checkAllMenu(menuData, allMenus) {
      menuData.forEach(menu => {
        allMenus.push(menu)
        if (menu.children) {
          this.checkAllMenu(menu.children, allMenus)
        }
      });
    },
    // 角色菜单授权提交
    submitAuthForm() {
      let roleId = this.selectRole.id
      if ('admin' === this.selectRole.name) {
        this.$message({message: '超级管理员拥有所有菜单权限，不允许修改！', type: 'error'})
        return
      }
      this.authLoading = true
      let checkedNodes = this.$refs.menuTree.getCheckedNodes(false, true)
      let roleMenus = []
      for (let i = 0, len = checkedNodes.length; i < len; i++) {
        let roleMenu = {roleId: roleId, menuId: checkedNodes[i].id}
        roleMenus.push(roleMenu)
      }
      this.$api.role.saveRoleMenus({"roleMenuList": roleMenus}).then((res) => {
        if (res.code === 200) {
          this.$message({message: '操作成功', type: 'success'})
        } else {
          this.$message({message: res.msg, type: 'error'})
        }
        this.authLoading = false
      })
    },
    // 渲染内容
    renderContent(h, {data}) {
      return (
        <div class="column-container">
          <span style="text-align:center;margin-right:80px;">{data.name}</span>
          <span style="text-align:center;margin-right:80px;">
            <el-tag type={data.type === 0 ? '' : data.type === 1 ? 'success' : 'info'} size="small">
              {data.type === 0 ? '目录' : data.type === 1 ? '菜单' : '按钮'}
            </el-tag>
          </span>
          <span style="text-align:center;margin-right:80px;"><i class={data.icon}/></span>
          <span style="text-align:center;margin-right:80px;">{data.parentName ? data.parentName : '顶级菜单'}</span>
          <span style="text-align:center;margin-right:80px;">{data.url ? data.url : '\t'}</span>
        </div>);
    },
    dateFormat: function (row, column) {
      return format(row[column.property])
    }// 时间格式化
  },
  mounted() {
  }
}
</script>
<style scoped>
.menu-container {
  margin-top: 10px;
}

.menu-header {
  padding-left: 8px;
  padding-bottom: 5px;
  text-align: left;
  font-size: 16px;
  color: rgb(20, 89, 121);
}
</style>
