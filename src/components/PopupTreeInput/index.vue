<template>
  <div>
    <el-popover ref="popover" :placement="placement" trigger="click">
      <el-tree
        ref="popupTree"
        :data="data"
        :default-expand-all="defaultExpandAll"
        :expand-on-click-node="true"
        :highlight-current="true"
        :props="props"
        node-key="nodeKey"
        @current-change="currentChangeHandle">
      </el-tree>
    </el-popover>
    <el-input v-model="prop" v-popover:popover :placeholder="placeholder" :readonly="true"
              style="cursor:pointer;"></el-input>
  </div>
</template>
<script>
export default {
  name: 'PopupTreeInput',
  props: {
    data: {
      type: Array,
      default: []
    },
    props: {
      type: Object,
      default: {}
    },
    prop: {
      type: String,
      default: ''
    },
    nodeKey: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '点击选择内容'
    },
    placement: {
      type: String,
      default: 'right-start'
    },
    defaultExpandAll: {
      type: Boolean,
      default: false
    },
    currentChangeHandle: {
      type: Function,
      default: null
    }
  }
}
</script>
<style scoped>
</style>
