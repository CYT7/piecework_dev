<template>
  <el-form ref="loginForm" :model="loginForm" :rules="fieldRules" class="demo-ruleForm login-container" label-position="left"
           label-width="0px">
    <span class="tool-bar">
      <!-- 主题切换 -->
      <theme-picker :default="themeColor" class="theme-picker" style="float:right;"
                    @onThemeChange="onThemeChange"></theme-picker>
    </span>
    <h2 class="title" style="padding-left:22px;">登录系统</h2>
    <el-form-item prop="account">
      <el-input v-model="loginForm.account" auto-complete="off" placeholder="账号" type="text"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input v-model="loginForm.password" auto-complete="off" placeholder="密码" type="password"></el-input>
    </el-form-item>
    <el-form-item style="width:100%;">
      <el-button style="width:40%;" type="primary" @click.native.prevent="reset">重 置</el-button>
      <el-button :loading="loading" style="width:40%;" type="primary" @click.native.prevent="login">登 录</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import {mapState} from 'vuex'
import Cookies from "js-cookie"
import ThemePicker from "../components/ThemePicker";

export default {
  name: 'Login',
  components: {ThemePicker},
  data() {
    return {
      loading: false,
      loginForm: {
        account: '',
        password: '',
      },
      fieldRules: {
        account: [{required: true, message: '请输入账号', trigger: 'blur'}],
        password: [{required: true, message: '请输入密码', trigger: 'blur'}]
      },
      checked: true
    }
  },
  methods: {
    login() {
      this.loading = true;
      let userInfo = {account: this.loginForm.account, password: this.loginForm.password};
      this.$api.login.login(userInfo).then((res) => {
        if (res.code !== 200) {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        } else {
          Cookies.set('token', res.data.token); // 放置token到Cookie
          this.$api.user.findByName({name: userInfo.account}).then((results) => {
            sessionStorage.setItem('user', userInfo.account); // 保存用户到本地会话
            sessionStorage.setItem('deptId', results.data.deptId); // 保存用户到本地会话
            this.$store.commit('menuRouteLoaded', false); // 要求重新加载导航菜单
            this.$router.push('/')  // 登录成功，跳转到主页
          })
        }
        this.loading = false
      }).catch((res) => {
        this.$message({
          message: res.message,
          type: 'error'
        })
        this.loading = false
      });
    },
    reset() {
      this.$refs.loginForm.resetFields()
    },
    onThemeChange: function (themeColor) {
      this.$store.commit('setThemeColor', themeColor)
    } //切换主题
  },
  computed: {
    ...mapState({themeColor: state => state.app.themeColor})
  }
}
</script>
<style lang="scss" scoped>
.login-container {
  -webkit-border-radius: 5px;
  border-radius: 5px;
  -moz-border-radius: 5px;
  background-clip: padding-box;
  margin: 100px auto;
  width: 350px;
  padding: 35px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;

  .title {
    margin: 0 auto 30px auto;
    text-align: center;
    color: #505458;
  }

  .remember {
    margin: 0 0 35px 0;
  }
}
</style>
