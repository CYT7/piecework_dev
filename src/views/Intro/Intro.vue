<template>
  <div class="page-container" style="width:100%;margin-top:15px;">
    <el-carousel :interval="3000" type="card" height="450px" class="carousel">
      <el-carousel-item class="carousel-item-intro">
        <h2>项目介绍</h2>
        <ul>
          <li>基于 Spring Boot、Spring Security、Vue、Element-UI的平台</li>
          <li>一个练手的项目，后面会进行微服务优化</li>
        </ul>
        <div><img src="@/assets/logo.png" style="width:120px;height:120px;padding-top:15px;" /></div>
      </el-carousel-item>
      <el-carousel-item class="carousel-item-func">
        <h2>功能列表</h2>
        <ul>
          <li>系统登录：系统用户登录，系统登录认证（token方式）</li>
          <li>用户管理：新建用户，修改用户，删除用户，查询用户</li>
          <li>机构管理：新建机构，修改机构，删除机构，查询机构</li>
          <li>角色管理：新建角色，修改角色，删除角色，查询角色</li>
          <li>菜单管理：新建菜单，修改菜单，删除菜单，查询菜单</li>
          <li>系统日志：记录用户操作日志，查看系统执行日志记录</li>
          <li>主题切换：支持主题切换，自定主题颜色，一键换肤</li>
        </ul>
      </el-carousel-item>
      <el-carousel-item class="carousel-item-env">
        <h2>开发环境</h2>
        <ul>
          <li>IDE : IDEA 2020.2.3。   JDK : JDK 1.8。</li>
          <li>Maven : Maven 3.8.1。   MySQL: MySQL 5.8.x。</li>
          <li>IDE : WebStorm 2019.1。 Webpack：webpack 4.2.0。</li>
          <li>NODE: Node 12.16.1。    NPM : NPM 7.14.0。</li>
        </ul>
        <h2>技术栈</h2>
        <ul>
          <li>核心框架：Spring Boot 2.x。 安全框架：Spring Security 5.x</li>
          <li>数据库连接池：Druid 1.x。 持久层框架：MyBatis 3.x。</li>
          <li>前端框架：Vue.js 2.x。       页面组件：Element 2.x。</li>
        </ul>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>
<script>
  export default {
    components:{},
    methods :{}
  }
</script>
<style>
  .carousel {
    padding-left: 10px;
    padding-right: 10px;
    margin-right: 10px;
  }
  .carousel h2 {
    color: #475669;
    font-size: 22px;
    opacity: 1.75;
    line-height: 100px;
    margin: 0;
  }
  .carousel ul {
    color: #475669;
    font-size: 15px;
    opacity: 1.75;
    line-height: 40px;
    margin: 0;
  }
  .carousel-item-intro h2 {
    color: #ffffff;
    font-size: 22px;
    opacity: 1.75;
    line-height: 80px;
    margin: 0;
  }
  .carousel-item-intro ul {
    color: #ffffff;
    font-size: 15px;
    opacity: 1.75;
    line-height: 65px;
    padding: 5px;
    margin: 0;
  }
  .carousel-item-func h2 {
    color: #3f393b;
    font-size: 22px;
    opacity: 1.75;
    line-height: 50px;
    margin: 0;
  }
  .carousel-item-func ul {
    color: #3f393b;
    font-size: 15px;
    opacity: 1.75;
    line-height: 30px;
    text-align: left;
    padding-left: 40px;
    margin: 0;
  }
  .carousel-item-env h2 {
    color: #475669;
    font-size: 22px;
    opacity: 1.75;
    line-height: 50px;
    margin: 0;
  }
  .carousel-item-env ul {
    color: #475669;
    font-size: 15px;
    opacity: 1.75;
    line-height: 35px;
    text-align: left;
    padding-left: 40px;
    margin: 0;
  }
  .carousel-item-intro {
    background-color: #19aaaf73;
    -webkit-border-radius: 25px;
    border-radius: 25px;
    -moz-border-radius: 15px;
    background-clip: padding-box;
    box-shadow: 0 0 25px #a3b3b965;
  }
  .carousel-item-func {
    background-color: #19aaaf73;
    -webkit-border-radius: 25px;
    border-radius: 25px;
    -moz-border-radius: 15px;
    background-clip: padding-box;
    box-shadow: 0 0 25px #a3b3b965;
  }
  .carousel-item-env {
    background-color: #19aaaf73;
    -webkit-border-radius: 25px;
    border-radius: 25px;
    -moz-border-radius: 15px;
    background-clip: padding-box;
    box-shadow: 0 0 25px #a3b3b965;
  }
  .carousel-item-intro {
    background-color: #b95e5e;
  }
  .carousel-item-func {
    background-color: #52c578;
  }
  .carousel-item-env {
    background-color: #41a7b9;
  }
</style>
