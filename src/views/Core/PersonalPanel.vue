<template>
  <div class="personal-panel">
    <div class="personal-desc" :style="{'background':this.$store.state.app.themeColor}">
      <div class="name-role"><span class="sender">{{ user.chineseName }}</span></div>
      <div class="register-info"><span class="register-info fa fa-clock-o">创建时间-{{ this.dateFormat(user.createTime) }}</span></div>
    </div>
    <div class="main-operation">
      <span class="main-operation-item" @click="openPersonCenter"><el-button size="small" icon="fa fa-male" > 个人中心</el-button></span>
      <span class="main-operation-item" @click="updatePasswordDialog"><el-button size="small" icon="fa fa-key"> 修改密码</el-button></span>
    </div>
    <div class="personal-footer" @click="logout">
      <ul><li class="fa fa-sign-out">{{$t("common.logout")}}</li></ul>
    </div>
    <!--修改密码界面-->
    <el-dialog title="修改密码" width="40%" :visible.sync="updatePwdDialogVisible" :close-on-click-modal="false" :modal="false">
      <el-form :model="updatePwdDataForm" label-width="100px" :rules="updatePwdDataFormRules" ref="updatePwdDataForm" :size="size">
        <el-form-item label="原密码" prop="password">
          <el-input v-model="updatePwdDataForm.password" type="password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="updatePwdDataForm.newPassword" type="password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="updatePwdDataForm.confirmPassword" type="password" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="updatePwdDialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="updatePassword" :loading="updatePwdLoading">{{$t('action.confirms')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import {format} from "../../utils/datetime";
  export default {
    name: 'PersonalPanel',
    components:{},
    props: {user: {type: Object,}},
    data() {
      return {
        size: 'small',
        updatePwdDialogVisible: false,
        updatePwdLoading: false,
        updatePwdDataForm: {
          password: '',
          newPassword: '',
          confirmPassword: ''
        },
        updatePwdDataFormRules: {
          password: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
          newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
          confirmPassword: [{ required: true, message: '请确认密码', trigger: 'blur' }]
        },
      }
    },
    methods: {
      //打开个人中心
      openPersonCenter: function () {alert('待开发')},
      //打开修改密码对话框
      updatePasswordDialog: function () {this.updatePwdDialogVisible = true},
      //修改密码
      updatePassword: function () {
        this.$refs.updatePwdDataForm.validate((valid) => {
          if (valid) {
            if(this.updatePwdDataForm.newPassword !== this.updatePwdDataForm.confirmPassword) {
              this.$message({message: '新密码与确认新密码不一致', type: 'error'});
              return
            }
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.updatePwdLoading = true;
              let params = {username:this.user.username,password:this.updatePwdDataForm.password, newPassword:this.updatePwdDataForm.newPassword};
              this.$api.user.updatePwd(params).then((res=>{
                if(res.code === 200){
                  this.$message({message:'更新密码成功,请重新登录',type:'success'});
                  this.$refs['updatePwdDataForm'].resetFields();
                  this.logoutApi()
                }else{this.$message({message:'操作失败，'+res.msg,type:'error'})}
                this.updatePwdDialogVisible = false
              }))
            })
          }
        })
      },
      //退出登录
      logout() {
        this.$confirm("确认退出吗?", "提示", {type: "warning"})
          .then(() => {
            this.deleteCookie('token');// 清空Cookie里的token
            this.logoutApi()
          }).catch(() => {})
      },
      logoutApi() {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("deptId");
        this.$router.push("/login");
        this.$api.login.logout().then(() => {}).catch(function(res) {})
      },
      //清除Cookie
      deleteCookie(name){
        let myDate = new Date();
        myDate.setTime(-1000); // 设置过期时间
        document.cookie = name+"=''; expires="+myDate.toUTCString();
      },
      //时间格式化
      dateFormat(date){return format(date)}
    },
  }
</script>
<style scoped>
  .personal-panel {
    font-size: 14px;
    width: 280px;
    text-align: center;
    border-color: rgba(180, 190, 190, 0.2);
    border-width: 1px;
    border-style: solid;
    background: rgba(182, 172, 172, 0.1);
    margin: -14px;
  }
  .personal-desc {
    padding: 15px;
    color: #fff;
  }
  .name-role {
    font-size: 16px;
    padding: 5px;
  }
  .main-operation {
    padding: 8px;
    margin-right: 1px;
    /* background: rgba(175, 182, 179, 0.3); */
    border-color: rgba(201, 206, 206, 0.2);
    border-top-width: 1px;
    border-top-style: solid;
  }
  .main-operation-item {
    margin: 15px;
  }
  .personal-footer {
    margin-right: 1px;
    font-size: 14px;
    text-align: center;
    padding-top: 10px;
    padding-bottom: 10px;
    border-color: rgba(180, 190, 190, 0.2);
    border-top-width: 1px;
    border-top-style: solid;
  }
  .personal-footer:hover {
    cursor: pointer;
    color: rgb(19, 138, 156);
    background: #b1a6a61e;
  }
</style>
