<template>
  <div class="layout">
    <div class="menu-list">
      <MenuList @menu-select="onMenuSelect" />
    </div>

    <div class="content-wrapper">
      <div class="munepath">
        <HeadPath
            :title="currentMenuData.title"
            :firstLevel="currentMenuData.firstLevel"
            :secondLevel="currentMenuData.secondLevel"
        />
      </div>

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MenuList from '@/views/Tools/MenuList.vue'
import HeadPath from '@/views/Tools/HeadPath.vue'

const route = useRoute()
const router = useRouter()

// 当前菜单数据
const currentMenuData = ref({
  title: '默认标题',
  firstLevel: '系统',
  secondLevel: '页面'
})

// 默认菜单配置
const defaultMenuConfig = reactive({
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

// 处理来自 MenuList 的选择事件
function onMenuSelect(menuData) {

  // 更新当前菜单数据
  currentMenuData.value = {
    title: menuData.title,
    firstLevel: menuData.firstLevel,
    secondLevel: menuData.secondLevel
  }

  // 进行路由跳转
  if (route.path !== menuData.path) {
    router.push(menuData.path)
  }
}

// 初始化时根据当前路由设置菜单数据
function initMenuData() {
  const currentPath = route.path
  const menuData = defaultMenuConfig[currentPath]

  if (menuData) {
    currentMenuData.value = {
      title: menuData.title,
      firstLevel: menuData.firstLevel,
      secondLevel: menuData.secondLevel
    }
  } else {
    // 如果没有匹配的配置，也可以从路由 meta 中读取
    currentMenuData.value = {
      title: route.meta.title || '默认标题',
      firstLevel: route.meta.first || '系统',
      secondLevel: route.meta.second || '页面'
    }
  }
}

// 组件挂载时初始化菜单数据
onMounted(() => {
  initMenuData()
  // console.log("")
})
</script>

<style scoped>
:global(body) {
  margin: 0;
}

.layout {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: #f4f4f4;
}

.menu-list {
  /* 确保菜单占据固定宽度 */
  width: 200px;
}

.content-wrapper {
  top: 0;
  display: flex;
  position: relative;
  flex: 1;
  flex-direction: column;
  overflow: hidden auto;
}

.munepath {

}
.main-content {
  flex: 1;
}
</style>