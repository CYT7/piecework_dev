<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :size="size">
        <el-form-item>
          <kt-button :label="$t('action.add')" icon="fa fa-plus" perms="sys:menu:add" type="primary"
                     @click="handleAdd"/>
        </el-form-item>
      </el-form>
    </div>
    <!--表格树内容栏-->
    <el-table v-loading="loading" :data="tableTreeData" :element-loading-text="$t('action.loading')" size="mini"
              stripe style="width: 100%;">
      <table-tree-column header-align="center" label="名称" prop="name" width="150"/>
      <el-table-column align="center" header-align="center" label="图标">
        <template slot-scope="scope"><i :class="scope.row.icon || ''"/></template>
      </el-table-column>
      <el-table-column align="center" header-align="center" label="类型" prop="type">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.type === 0" size="small">目录</el-tag>
          <el-tag v-else-if="scope.row.type === 1" size="small" type="success">菜单</el-tag>
          <el-tag v-else-if="scope.row.type === 2" size="small" type="info">按钮</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" header-align="center" label="上级菜单" prop="parentName" width="120"/>
      <el-table-column :show-overflow-tooltip="true" align="center" header-align="center"
                       label="菜单URL" prop="url" width="170"/>
      <el-table-column :show-overflow-tooltip="true" align="center" header-align="center"
                       label="授权标识" prop="perms" width="150"/>
      <el-table-column align="center" header-align="center" label="排序" prop="orderNum"/>
      <el-table-column :label="$t('action.operation')" align="center" fixed="right" header-align="center" width="185">
        <template slot-scope="scope">
          <kt-button :label="$t('action.edit')" icon="fa fa-edit"
                     perms="sys:menu:edit" @click="handleEdit(scope.row)"/>
          <kt-button :label="$t('action.delete')" icon="fa fa-trash"
                     perms="sys:menu:delete" type="danger" @click="handleDelete(scope.row)"/>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增修改界面 -->
    <el-dialog :close-on-click-modal="false" :title="!dataForm.id ? $t('action.add') : $t('action.edit')"
               :visible.sync="dialogVisible" width="40%">
      <el-form ref="dataForm" :model="dataForm" :rules="dataRule" :size="size"
               label-width="80px" style="text-align:left;" @keyup.enter.native="submitForm()">
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="dataForm.type">
            <el-radio v-for="(type, index) in menuTypeList" :key="index" :label="index">{{ type }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="menuTypeList[dataForm.type] + '名称'" prop="name">
          <el-input v-model="dataForm.name" :placeholder="menuTypeList[dataForm.type] + '名称'"/>
        </el-form-item>
        <el-form-item label="上级菜单" prop="parentName">
          <popup-tree-input
            :currentChangeHandle="handleTreeSelectChange" :data="MenuData"
            :nodeKey="''+dataForm.parentId"
            :prop="dataForm.parentName==null||dataForm.parentName===''?'顶级菜单':dataForm.parentName" :props="MenuTreeProps"/>
        </el-form-item>
        <el-form-item v-if="dataForm.type === 2" label="授权标识" prop="perms">
          <el-input v-model="dataForm.perms" placeholder="如: sys:user:add"/>
        </el-form-item>
        <el-form-item v-if="dataForm.type === 1" label="菜单路由" prop="url">
          <el-row>
            <el-col :span="22">
              <el-input v-model="dataForm.url" placeholder="菜单路由"/>
            </el-col>
            <el-col :span="2" class="icon-list__tips">
              <el-tooltip effect="light" placement="top" style="padding: 10px;">
                <div slot="content">
                  <p>URL格式：用户管理：/sys/user 嵌套网页：http://www.baidu.com</p>
                </div>
                <i class="el-icon-warning"/>
              </el-tooltip>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item v-if="dataForm.type !== 2" label="排序编号" prop="orderNum">
          <el-input-number v-model="dataForm.orderNum" :min="0" controls-position="right" label="排序编号"/>
        </el-form-item>
        <el-form-item v-if="dataForm.type !== 2" label="菜单图标" prop="icon">
          <el-row>
            <el-col :span="22">
              <el-input v-model="dataForm.icon" :readonly="false"
                        class="icon-list__input" placeholder="菜单图标名称（如：fa fa-home fa-lg）"/>
            </el-col>
            <el-col :span="2" class="icon-list__tips">
              <fa-icon-tooltip/>
            </el-col>
          </el-row>
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
import PopupTreeInput from "../../components/PopupTreeInput";
import KtButton from "../Core/KtButton";
import TableTreeColumn from "../Core/TableTreeColumn";
import FaIconTooltip from "../../components/FaIconTooltip"

export default {
  components: {PopupTreeInput, KtButton, TableTreeColumn, FaIconTooltip},
  data() {
    return {
      size: "small",
      loading: false, // 加载标识
      tableTreeData: [], // 表格数据
      dialogVisible: false, // 新增编辑
      menuTypeList: ["目录", "菜单", "按钮"], // 菜单选项
      dataForm: {}, // 数据
      dataRule: {name: [{required: true, message: "名称不能为空", trigger: "blur"}]},// 数据规则
      MenuData: [], // 菜单信息
      MenuTreeProps: {label: "name", children: "children"}
    };
  },
  methods: {
    //显示新增界面
    handleAdd: function () {
      this.dialogVisible = true;
      this.dataForm = {
        id: 0,
        type: 1,
        typeList: ["目录", "菜单", "按钮"],
        name: "",
        parentId: 0,
        parentName: "",
        url: "",
        perms: "",
        orderNum: 0,
        icon: "",
      };
    },
    //显示编辑界面
    handleEdit: function (row) {
      this.dialogVisible = true;
      Object.assign(this.dataForm, row);
    },
    //获取数据
    findTreeData: function () {
      this.loading = true;
      this.$api.menu.findMenuTree().then(res => {
        this.tableTreeData = res.data;
        this.MenuData = this.getParentMenuTree(res.data);
        this.loading = false;
      });
    },
    //获取上级菜单树
    getParentMenuTree: function (tableTreeData) {
      return [{parentId: 0, name: "顶级菜单", children: tableTreeData}];
    },
    //获取删除的包含子菜单的id列表
    getDeleteIds(ids, row) {
      ids.push(row.id);
      if (row.children != null) {
        for (let i = 0, len = row.children.length; i < len; i++) {
          this.getDeleteIds(ids, row.children[i]);
        }
      }
      return ids;
    },
    //删除
    handleDelete(row) {
      this.$confirm("确认删除选中记录吗？", "提示", {type: "warning"}).then(() => {
        let params = this.getDeleteIds([], row);
        this.$api.menu.Delete({'menuId': params}).then(() => {
          this.findTreeData();
          this.$message({message: "删除成功", type: "success"});
        });
      });
    },
    //菜单树选中
    handleTreeSelectChange(data) {
      this.dataForm.parentId = data.id;
      this.dataForm.parentName = data.name;
    },
    //表单提交
    submitForm() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            let params = Object.assign({}, this.dataForm);
            this.$api.menu.save(params).then(res => {
              this.editLoading = false;
              if (res.code === 200) {
                this.$message({message: "操作成功", type: "success"});
                this.$refs["dataForm"].resetFields();
                this.dialogVisible = false;
              } else {
                this.$message({message: "操作失败, " + res.msg, type: "error"});
              }
              this.findTreeData();
            });
          });
        }
      });
    }
  },
  mounted() {
    this.findTreeData();
  }
};
</script>
<style scoped>
</style>
