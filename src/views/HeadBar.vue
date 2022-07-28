<template>
  <div :class="collapse?'position-collapse-left':'position-left'" :style="{'background':themeColor}"
       class="headboard">
    <!-- 导航收缩 -->
    <span class="hamburg">
      <el-menu :active-text-color="themeColor" :background-color="themeColor" class="el-menu-demo"
               mode="horizontal" text-color="#fff">
        <el-menu-item index="1" @click="onCollapse">
          <hamburger :isActive="collapse"/>
        </el-menu-item>
      </el-menu>
    </span>
    <!-- 导航菜单 -->
    <span class="navbar">
      <el-menu :background-color="themeColor" :default-active="activeIndex"
               active-text-color="#ffd04b" class="el-menu-demo"
               mode="horizontal" text-color="#fff">
        <el-menu-item index="1" @click="$router.push('/')">{{ $t("common.home") }}</el-menu-item>
      </el-menu>
    </span>
    <!-- 工具栏 -->
    <span class="toolbar">
      <el-menu :active-text-color="themeColor" :background-color="themeColor" class="el-menu-demo"
               mode="horizontal" text-color="#14889A">
        <el-menu-item index="1">
          <!-- 主题切换 -->
          <theme-picker :default="themeColor" class="theme-picker" @onThemeChange="onThemeChange"/>
        </el-menu-item>
        <el-menu-item v-popover:popover-lang index="2">
          <!-- 语言切换 -->
          <li class="fa fa-language fa-lg" style="color:#fff;"></li>
          <el-popover ref="popover-lang" v-model="langVisible" placement="bottom-start" trigger="click">
            <div class="lang-item" @click="changeLanguage('zh_cn')">简体中文</div>
            <div class="lang-item" @click="changeLanguage('en_us')">English</div>
          </el-popover>
        </el-menu-item>
        <el-menu-item v-popover:popover-personal index="3">
          <!-- 用户信息 -->
          <span class="user-info fa fa-user"></span>
          <el-popover ref="popover-personal" :visible-arrow="false" placement="bottom-end" trigger="click">
            <personal-panel :user="user"></personal-panel>
          </el-popover>
        </el-menu-item>
      </el-menu>
    </span>
  </div>
</template>
<script>
import {mapState} from 'vuex'
import Hamburger from "../components/Hamburger";
import ThemePicker from "../components/ThemePicker";
import PersonalPanel from "./Core/PersonalPanel";

export default {
  components: {
    PersonalPanel,
    ThemePicker,
    Hamburger,
  },
  data() {
    return {
      user: {},
      activeIndex: '1',
      langVisible: false
    }
  },
  methods: {
    //折叠导航栏
    onCollapse: function () {
      this.$store.commit('onCollapse')
    },
    //切换主题
    onThemeChange: function (themeColor) {
      this.$store.commit('setThemeColor', themeColor)
    },
    //语言切换
    changeLanguage(lang) {
      this.$i18n.locale = lang === '' ? 'zh_cn' : lang;
      this.langVisible = false
    }
  },
  mounted() {
    const user = sessionStorage.getItem("user");
    if (user) {
      const params = {name: user};
      this.$api.user.findByName(params).then((res) => {
        if (res.code === 200) {
          this.user = res.data;
        }
      })
    }
  },
  computed: {
    ...mapState({
      themeColor: state => state.app.themeColor,
      collapse: state => state.app.collapse
    })
  }
}
</script>
<style lang="scss" scoped>
.headboard {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1030;
  height: 60px;
  line-height: 60px;
  border-color: rgba(180, 190, 190, 0.8);
  border-left-width: 1px;
  border-left-style: solid;
}

.hamburg {
  float: left;
}

.navbar {
  float: left;
}

.toolbar {
  float: right;
}

.lang-item {
  font-size: 16px;
  padding-left: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
  cursor: pointer;
}

.lang-item:hover {
  font-size: 18px;
  background: #b0d6ce4d;
}

.user-info {
  font-size: 20px;
  color: #fff;
  cursor: pointer;

  img {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    margin: 10px 0 10px 10px;
    float: right;
  }
}

.badge {
  line-height: 18px;
}

.position-left {
  left: 110px;
}

.position-collapse-left {
  left: 55px;
}
</style>
