<template>
  <div class="crawl-results-container">
    <div class="search-section">
      <div class="search-row">

        <div class="search-item">
          <label>分类</label>
          <el-select
              v-model="searchForm.category"
              placeholder="请选择分类"
              clearable
              size="default"
              style="width: 120px"
          >
            <el-option label="招标" value="招标" />
            <el-option label="公告" value="公告" />
          </el-select>
        </div>

        <div class="search-item">
          <label>配置名</label>
          <el-select
              v-model="searchForm.config_name"
              placeholder="请选择配置名"
              clearable
              size="default"
              style="width: 150px"
          >
            <el-option
                v-for="config in configOptions"
                :key="config.value"
                :label="config.label"
                :value="config.value"
            />
          </el-select>
        </div>

        <div class="search-item">
          <label>来源网站</label>
          <el-select
              v-model="searchForm.website_name"
              placeholder="请选择来源网站"
              clearable
              size="default"
              style="width: 150px"
          >
            <el-option
                v-for="website in websiteOptions"
                :key="website.value"
                :label="website.label"
                :value="website.value"
            />
          </el-select>
        </div>

        <div class="search-item">
          <label>发布时间</label>
          <el-date-picker
              v-model="searchForm.publishTimeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              size="default"
              style="width: 350px"
          />
        </div>
      </div>

      <div class="button-row">
        <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
        <el-button :icon="RefreshLeft" @click="handleReset">重置</el-button>
        <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
      </div>
    </div>

    <div class="table-section">
      <el-table
          :data="displayTableData"
          v-loading="loading"
          border
          stripe
          height="calc(100vh - 360px)"
          style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="category" label="分类" width="60" align="center" />
        <el-table-column prop="config_name" label="配置名" width="150" align="center">
          <template #default="{ row }">
            <div v-if="Array.isArray(row.config_name)">
              <el-tag
                  v-for="(cfg, idx) in row.config_name"
                  :key="idx"
                  size="small"
                  style="margin: 2px"
              >{{ cfg }}</el-tag>
            </div>
            <span v-else>{{ row.config_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="keyword" label="关键词" width="150" show-overflow-tooltip />
        <el-table-column prop="website_name" label="来源网站" width="200" align="center" />
        <el-table-column prop="title" label="标题" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link
                @click="openLink(row.detail_url)"
                type="primary"
                underline="hover"
                style="cursor: pointer"
            >{{ row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="publish_time" label="发布时间" width="160" align="center">
          <template #default="{ row }">{{ formatDateTime(row.publish_time) }}</template>
        </el-table-column>
        <el-table-column prop="is_pushed" label="推送状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_pushed === 1 ? 'success' : 'info'">
              {{ row.is_pushed === 1 ? '已推送' : '未推送' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-section">
        <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.page_size"
            :page-sizes="[15, 30, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Search, RefreshLeft, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// loading & 数据
const loading = ref(false)
const tableData = ref([])
const fullDataCache = ref([])

// 筛选表单
const searchForm = reactive({
  category: '',
  config_name: '',
  website_name: '',
  publishTimeRange: []
})

// 分页
const pagination = reactive({
  page: 1,
  page_size: 15,
  total: 0
})

// 下拉选项
const configOptions = ref([])
const websiteOptions = ref([])

// 格式化时间
const formatDateTime = dt => dt ? new Date(dt).toLocaleString('zh-CN') : '-'

// 打开链接
const openLink = url => {
  if (!url) return
  const finalUrl = /^https?:\/\//.test(url) ? url : `https://${url}`
  window.open(finalUrl, '_blank')
}

// 获取顶部过滤条件
const fetchConfigurations = async () => {
  try {
    const res = await axios.get('/api/configurations/')
    const configs = res.data.crawler_configs || []

    // 扁平化 config_name 和 website_names
    const cfgSet = new Set()
    const siteSet = new Set()
    configs.forEach(item => {
      if (Array.isArray(item.website_names)) {
        item.website_names.forEach(w => w && siteSet.add(w.trim()))
      }
      if (item.config_name) {
        // 字符串或数组
        if (Array.isArray(item.config_name)) {
          item.config_name.forEach(c => c && cfgSet.add(c.trim()))
        } else {
          cfgSet.add(item.config_name.trim())
        }
      }
    })

    configOptions.value = Array.from(cfgSet).sort().map(v => ({ label: v, value: v }))
    websiteOptions.value = Array.from(siteSet).sort().map(v => ({ label: v, value: v }))
  } catch (err) {
    console.error('获取配置失败:', err)
    ElMessage.error('无法获取配置项')
  }
}

// 带时间筛选
const fetchFullDataForFilter = async () => {
  try {
    const params = {
      page: 1,
      page_size: 10000,
      // 非时间条件
      ...(searchForm.category && { category: searchForm.category.trim() }),
      ...(searchForm.config_name && { config_name: searchForm.config_name.trim() }),
      ...(searchForm.website_name && { website_name: searchForm.website_name.trim() })
    }
    const res = await axios.post('/api/results/', params)
    fullDataCache.value = res.data.data || []
    return true
  } catch (err) {
    console.warn('拉全量数据失败:', err)
    fullDataCache.value = []
    return false
  }
}

// 正常分页
const fetchData = async (resetPage = false) => {
  loading.value = true
  try {
    // 如果设置了时间区间，优先全量拉取
    if (searchForm.publishTimeRange.length === 2) {
      const ok = await fetchFullDataForFilter()
      if (ok) {
        if (resetPage) pagination.page = 1
        return
      }
    }

    // 后端分页
    const params = {
      page: pagination.page,
      page_size: pagination.page_size,
      ...(searchForm.category && { category: searchForm.category.trim() }),
      ...(searchForm.config_name && { config_name: searchForm.config_name.trim() }),
      ...(searchForm.website_name && { website_name: searchForm.website_name.trim() })
    }
    const res = await axios.post('/api/results/', params)
    tableData.value = res.data.data || []
    // 更新分页
    if (res.data.pagination) {
      pagination.total = res.data.pagination.total
      pagination.page = res.data.pagination.page
      pagination.page_size = res.data.pagination.page_size
    }
  } catch (err) {
    console.error('获取数据失败:', err)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 计算展示列表（前端时间区间分页 OR 后端分页）
const displayTableData = computed(() => {
  // 时间过滤走 fullDataCache
  if (searchForm.publishTimeRange.length === 2 && fullDataCache.value.length) {
    const [start, end] = searchForm.publishTimeRange.map(t => new Date(t))
    const filtered = fullDataCache.value.filter(item => {
      const t = new Date(item.publish_time)
      return t >= start && t <= end
    })
    pagination.total = filtered.length
    const startIdx = (pagination.page - 1) * pagination.page_size
    return filtered.slice(startIdx, startIdx + pagination.page_size)
  }
  // 否则用后端 tableData
  return tableData.value
})

// 各按钮与分页回调
const handleSearch = () => { pagination.page = 1; fetchData(true) }
const handleReset = () => {
  Object.assign(searchForm, { category: '', config_name: '', website_name: '', publishTimeRange: [] })
  pagination.page = 1
  fullDataCache.value = []
  fetchData(true)
}
const handleRefresh = () => { fullDataCache.value = []; fetchData() }
const handleCurrentChange = page => {
  pagination.page = page
  // 时间模式下不再重复请求
  if (searchForm.publishTimeRange.length === 2 && fullDataCache.value.length) return
  fetchData()
}
const handleSizeChange = size => {
  pagination.page_size = size
  pagination.page = 1
  if (searchForm.publishTimeRange.length === 2 && fullDataCache.value.length) return
  fetchData()
}

// 初始化
onMounted(async () => {
  await fetchConfigurations()
  await fetchData()
})
</script>

<style scoped>
.crawl-results-container {
  padding: 10px;

}
.search-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.search-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 15px;
}
.search-item label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}
.button-row {
  display: flex;
  gap: 12px;
}
.table-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
:deep(.el-table) { font-size: 14px; }
:deep(.el-table th) {
  background-color: #fafafa;
  color: #606266;
  font-weight: 500;
}
:deep(.el-table td) { padding: 8px 0; }
:deep(.el-link) { font-size: 14px; }
.el-tag { margin: 2px; }
@media (max-width: 768px) {
  .search-row { flex-direction: column; align-items: stretch; }
  .search-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .search-item label { min-width: auto; }
}
</style>
