<template>
  <el-menu
      class="sidebar-menu"
      :default-active="active"
      background-color="#304156"
      text-color="#ffffff"
      active-text-color="#3a9eff"
      unique-opened
      @select="handleMenuSelect"
  >

    <div class="logo">
      <img src="" alt="Logo" /><span>信息采集系统</span>
    </div>

    <el-menu-item index="/BaseSetting">
      <el-icon><Setting /></el-icon><span>爬虫配置</span>
    </el-menu-item>

    <el-menu-item index="/ResultList">
      <el-icon><Aim /></el-icon><span>信息查看</span>
    </el-menu-item>

    <el-menu-item index="/MailSetting">
      <el-icon><User /></el-icon><span>人员配置</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Setting, Aim, User } from '@element-plus/icons-vue'

// 定义emit事件
const emit = defineEmits(['menu-select'])

// active 菜单项
const active = ref(window.location.pathname)

// 菜单配置信息，包含标题和面包屑层级
const menuConfig = reactive({
  '/BaseSetting': {
    title: '爬虫配置',
    firstLevel: '系统配置',
    secondLevel: '爬虫配置'
  },
  '/ResultList': {
    title: '信息查看',
    firstLevel: '数据管理',
    secondLevel: '信息查看'
  },
  '/MailSetting': {
    title: '人员配置',
    firstLevel: '系统配置',
    secondLevel: '人员配置'
  }
})

// 处理菜单栏选择
function handleMenuSelect(index) {
  active.value = index

  // 获取对应的菜单配置信息
  const menuData = menuConfig[index] || {
    title: '标题',
    firstLevel: '系统',
    secondLevel: '页面'
  }

  // 向父组件发送菜单选择事件
  emit('menu-select', {
    path: index,
    ...menuData
  })
}
</script>

<style scoped>
.sidebar-menu {
  width: 200px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  border: none;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 60px;
  padding: 0 20px;
  margin-bottom: 10px;
  border-bottom: 1px solid #1f2d3d;
}

.logo img {
  flex-shrink: 0;
  height: 30px;
}

.logo span {
  display: inline-block;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}

.sidebar-menu :deep(.el-menu-item) {
  color: #ffffff !important;
  height: 48px;
  line-height: 48px;
  padding-left: 20px !important;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.sidebar-menu :deep(.is-active) {
  background-color: transparent !important;
  color: #3a9eff !important;
}

.sidebar-menu :deep(.el-menu-item i) {
  margin-right: 8px;
  font-size: 16px;
}
</style>