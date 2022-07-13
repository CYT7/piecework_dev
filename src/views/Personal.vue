<template>
  <div class="page-container" style="width:100%">
    <el-container style="border: 1px solid #eee">
      <el-aside width="40%">
        <el-card style="margin:20px" class="box-card">
          <div slot="header" class="el-dialog--center"><span>个人信息</span></div>
          <div style="padding-top:10px">
            <el-row :gutter="10">
              <el-col :span="6"><div class="grid-content bg-purple">用户名</div></el-col>
              <el-col :span="17" :offset="1">
                <div style="text-align:right" class="grid-content bg-purple">{{ userData.username }}</div>
              </el-col>
            </el-row>
            <el-divider />
            <el-row :gutter="10">
              <el-col :span="6"><div class="grid-content bg-purple">姓名</div></el-col>
              <el-col :span="17" :offset="1">
                <div style="text-align:right" class="grid-content bg-purple">{{ userData.chineseName }}</div>
              </el-col>
            </el-row>
            <el-divider />
            <el-row :gutter="10">
              <el-col :span="6"><div class="grid-content bg-purple">部门</div></el-col>
              <el-col :span="17" :offset="1">
                <div style="text-align:right" class="grid-content bg-purple">{{ (userData.deptName) }}</div>
              </el-col>
            </el-row>
            <el-divider />
            <el-row :gutter="10">
              <el-col :span="6">
                <div class="grid-content bg-purple">角色名</div>
              </el-col>
              <el-col :span="17" :offset="1">
                <div style="text-align:right" class="grid-content bg-purple">{{ (userData.roleNames) }}</div>
              </el-col>
            </el-row>
            <el-divider />
            <el-row :gutter="10">
              <el-col :span="6"><div class="grid-content bg-purple">邮箱</div></el-col>
              <el-col :span="17" :offset="1">
                <div style="text-align:right" class="grid-content bg-purple">{{ (userData.email) }}</div>
              </el-col>
            </el-row>
            <el-divider />
            <el-row :gutter="10">
              <el-col :span="6"><div class="grid-content bg-purple">手机</div></el-col>
              <el-col :span="17" :offset="1">
                <div style="text-align:right" class="grid-content bg-purple">{{ (userData.phone) }}</div>
              </el-col>
            </el-row>
            <el-divider />
            <el-row :gutter="10">
              <el-col :span="6">
                <div class="grid-content bg-purple">状态</div>
              </el-col>
              <el-col :span="17" :offset="1">
                <div style="text-align:right" class="grid-content bg-purple">
                  <el-switch
                    v-model="userData.status === 1"
                    disabled
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    active-text="正常"
                    inactive-text="禁用"
                  >
                  </el-switch>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-aside>
      <el-container>
        <el-aside width="100%">
          <el-main>
            <el-card class="box-card">
              <div slot="header" class="el-dialog--center"><span>修改</span></div>
              <template>
                <el-form ref="dataForm" :model="dataForm" status-icon label-width="90px" class="demo-ruleForm" :rules="dataFormRules">
                  <el-form-item label="姓名" prop="chineseName"><el-input v-model="dataForm.chineseName" /></el-form-item>
                  <el-form-item label="部门" prop="deptName" v-if="dataForm.username.toLowerCase() === admin ">
                    <popup-tree-input :data="deptData" :props="deptTreeProps"
                                      :prop="dataForm.deptName" :nodeKey="''+dataForm.deptId"
                                      :currentChangeHandle="deptTreeCurrentChangeHandle"/>
                  </el-form-item>
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="dataForm.email" type="email" auto-complete="off"/>
                  </el-form-item>
                  <el-form-item label="手机" prop="phone">
                    <el-input v-model="dataForm.phone" auto-complete="off" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="submitForm('dataForm')">提交</el-button>
                    <el-button @click="resetForm('dataForm')">重置</el-button>
                  </el-form-item>
                </el-form>
              </template>
            </el-card>
          </el-main>
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>
<script>
import {format} from "../utils/datetime";
import PopupTreeInput from "../components/PopupTreeInput";
import {isEmail, isPhone} from "../utils/validate";
export default {
  name: "Personal",
  components: {PopupTreeInput},
  data() {
    const checkEmail = (rule,value,callback) =>{//验证邮箱
      if (!value){return callback(new Error('请输入邮箱'));}
      else{if (isEmail(value)){callback();}else{return callback(new Error('邮箱格式不正确'))}}
    }
    const checkPhone = (rule,value,callback) =>{
      if (!value){callback();}
      else{if (isPhone(value)){callback();}else{return callback(new Error('手机格式不正确'))}}
    }
    return {
      admin: 'admin',//管理员
      userData: "",//个人信息
      disabled:true,//开关禁用
      loading: true,//加载
      dataForm: {//修改信息
        username: '',
        chineseName: '',
        deptId: '',
        phone: '',
        deptName:'',
        email:'',
      },
      dataFormRules: {//添加验证
        chineseName:[{required: true, message: '请输入名字', trigger: 'blur'}],
        email:[{required: true, validator:checkEmail,trigger: 'blur'}],
        phone:[{validator:checkPhone,trigger:'blur'}]
      },
      deptData: [],//部门数据
      deptTreeProps: {//部门树
        label: 'name',
        children: 'children'
      },
    }
  },
  methods: {
    personalCenter: function () {//个人中心
      this.$api.user.personalCenter().then((res) => {
        this.userData = res.data;
        this.dataForm = Object.assign({}, this.userData);
      })
    },
    dateFormat(date) {return format(date)},//时间格式化
    submitForm(formName) {//提交
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(()=>{
            let params = Object.assign({}, this.dataForm)
            this.$api.user.save(params).then((res) => {
              if(res.code === 200) {
                if (params.username.toLowerCase() === 'admin'){
                  sessionStorage.removeItem("deptId");
                  sessionStorage.setItem('deptId', params.deptId); // 保存用户到本地会话
                }
                this.$message({ message: res.msg, type: 'success' })
                this.$refs['dataForm'].resetFields()
              } else {this.$message({message: res.msg, type: 'error'})}
              this.personalCenter();
            })
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {this.$refs[formName].resetFields()},//重置数据
    findDeptTree: function () {this.$api.dept.findTree().then((res) => {this.deptData = res.data})},// 获取部门列表
    // 菜单树选中
    deptTreeCurrentChangeHandle (data) {
      this.dataForm.deptId = data.id
      this.dataForm.deptName = data.name
    },
  },
  mounted() {
    this.findDeptTree();
    this.personalCenter();
  }
};
</script>
<style scoped>
</style>
