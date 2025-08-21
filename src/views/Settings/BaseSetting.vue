<template>
  <div class="config-management-container">

    <div class="config-card">
      <div class="card-header">
        <h3>基础配置</h3>
      </div>
      <div class="card-content">

        <div class="row">
          <el-button type="primary" :icon="Connection" @click="saveBaseConfig" :loading="saveLoading">
            保存基础配置
          </el-button>
          <el-button type="success" :icon="Plus" @click="handleCreate">
            新增爬虫配置
          </el-button>
        </div>


        <div class="row">
          <div class="form-item">
            <label>爬虫开关：</label>
            <el-switch
                v-model="baseConfig.switch_status"
                :active-value="1"
                :inactive-value="0"
                active-text="开启"
                inactive-text="关闭"
            />
          </div>
          <div class="form-item">
            <label>爬取频率：</label>
            <el-input-number
                v-model="baseConfig.frequency"
                :min="1"
                :max="24"
                controls-position="right"
                style="width: 120px"
            />
            <span style="margin-left: 8px; color: #606266;">小时</span>
          </div>
        </div>


        <div class="row">
          <div class="status-item">
            <label>爬虫状态：</label>
            <el-tag
                :type="getStatusType(baseConfig.crawler_status)"
                size="small"
            >
              {{ getStatusText(baseConfig.crawler_status) }}
            </el-tag>
          </div>
          <div class="status-item">
            <label>邮件状态：</label>
            <el-tag
                :type="getEmailStatusType(heartbeatData.email_status)"
                size="small"
            >
              {{ getEmailStatusText(heartbeatData.email_status) }}
            </el-tag>
          </div>
          <div class="status-item">
            <label>下次爬取时间：</label>
            <span class="time-text">{{ formatDateTime(baseConfig.next_run_time) }}</span>
          </div>
        </div>
      </div>
    </div>


    <div class="configs-container">
      <div
          v-for="config in crawlerConfigs"
          :key="config.config_name"
          class="config-card crawler-config"
      >
        <div class="card-content">

          <div class="row">
            <h4 class="config-name">{{ config.config_name }}</h4>
          </div>

          <div class="row">
            <el-button
                type="primary"
                :icon="Edit"
                size="small"
                @click="handleEdit(config)"
            >
              编辑
            </el-button>
            <el-button
                type="danger"
                :icon="Delete"
                size="small"
                @click="handleDelete(config)"
            >
              删除
            </el-button>
          </div>

          <div class="row info-row">
            <div class="info-item">
              <label>配置分类：</label>
              <el-tag size="small" type="info">{{ config.category }}</el-tag>
            </div>
            <div class="info-item">
              <label>创建用户：</label>
              <span>{{ config.created_user }}</span>
            </div>
            <div class="info-item">
              <label>创建时间：</label>
              <span>{{ formatDateTime(config.created_at) }}</span>
            </div>
          </div>


          <div class="row">
            <div class="tags-section">
              <label>关键词：</label>
              <div class="tags-container">
                <el-tag
                    v-for="(keyword, idx) in config.keywords"
                    :key="idx"
                    size="small"
                    style="margin: 2px;"
                >
                  {{ keyword }}
                </el-tag>
                <span v-if="!config.keywords || config.keywords.length === 0" class="no-data">
                  暂无关键词
                </span>
              </div>
            </div>
          </div>


          <div class="row">
            <div class="tags-section">
              <label>网站名：</label>
              <div class="tags-container">
                <el-tag
                    v-for="(website, idx) in config.website_names"
                    :key="idx"
                    size="small"
                    type="success"
                    style="margin: 2px;"
                >
                  {{ website }}
                </el-tag>
                <span v-if="!config.website_names || config.website_names.length === 0" class="no-data">
                  暂无网站
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div v-if="crawlerConfigs.length === 0" class="empty-state">
        <el-empty description="暂无爬虫配置" />
      </div>
    </div>


    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="600px"
        @close="handleDialogClose"
    >
      <el-form
          ref="formRef"
          :model="configForm"
          :rules="formRules"
          label-width="120px"
      >
        <el-form-item label="配置名" prop="config_name">
          <el-input
              v-model="configForm.config_name"
              placeholder="请输入配置名"
              :readonly="isEdit"
              @click="handleConfignameClick"
          />
        </el-form-item>

        <el-form-item label="创建用户" prop="created_user">
          <el-input
              v-model="configForm.created_user"
              placeholder="请输入创建用户"
          />
        </el-form-item>

        <el-form-item label="配置分类" prop="category">
          <el-select
              v-model="configForm.category"
              placeholder="请选择配置分类"
              style="width: 100%"
              @change="handleCategoryChange"
          >
            <el-option label="配置分类A" value="配置分类A" />
            <el-option label="配置分类B" value="配置分类B" />
          </el-select>
        </el-form-item>

        <el-form-item label="关注的网站" prop="website_names">
          <el-select
              v-model="configForm.website_names"
              placeholder="请选择关注的网站"
              multiple
              filterable
              style="width: 100%"
          >
            <el-option
                v-for="website in availableWebsites"
                :key="website"
                :label="website"
                :value="website"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="关注的关键词" prop="keywords">
          <div class="keywords-input">
            <el-input
                v-model="keywordInput"
                placeholder="输入关键词后按回车添加"
                @keyup.enter="addKeyword"
                style="margin-bottom: 10px;"
            />
            <div class="keywords-display">
              <el-tag
                  v-for="(keyword, index) in configForm.keywords"
                  :key="index"
                  closable
                  style="margin: 2px;"
                  @close="removeKeyword(index)"
              >
                {{ keyword }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted , onUnmounted} from 'vue'
import { Plus, Edit, Delete, Connection } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import axios from 'axios'

// 数据与状态
const saveLoading = ref(false)
const submitLoading = ref(false)
const baseConfig = reactive({
  switch_status: 0,
  frequency: 2,
  crawler_status: 0,
  next_run_time: null,
  last_run_time: null
})

const crawlerConfigs = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

// 表单数据
const configForm = reactive({
  config_name: '',
  created_user: '',
  category: '',
  website_names: [],
  source_urls: [],
  keywords: []
})

// 关键词输入
const keywordInput = ref('')

// 可选的网站选项
const availableWebsites = ref([])

// 网站选项配置
const websiteOptions = {
  '配置分类A': [
    '网站A',
  ],
  '配置分类B': [
    '网站B',
  ]
}

// 表单校验规则
const formRules = {
  config_name: [
    { required: true, message: '请输入配置名', trigger: 'blur' }
  ],
  created_user: [
    { required: true, message: '请输入创建用户', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择配置分类', trigger: 'change' }
  ]
}

const formRef = ref()

// 格式化时间
const formatDateTime = (dt) => {
  if (!dt) return '-'
  const date = new Date(dt)
  date.setTime(date.getTime() + 8 * 60 * 60 * 1000)
  return date.toLocaleString('zh-CN')
}

// 获取爬虫状态类型
const getStatusType = (status) => {
  const types = { 0: 'info', 1: 'success', 2: 'warning' }
  return types[status] || 'info'
}

// 获取爬虫状态文本
const getStatusText = (status) => {
  const texts = { 0: '服务未启动', 1: '空闲', 2: '爬取中' }
  return texts[status] || '未知'
}

const heartbeatData = ref({
  email_status: 0
})

// 获取邮件状态类型
const getEmailStatusType = (status) => {
  return status === 1 ? 'success' : 'info'
}

// 获取邮件状态文本
const getEmailStatusText = (status) => {
  return status === 1 ? '工作中' : '服务未启动'
}

// 获取心跳数据
const fetchHeartbeatData = async () => {
  try {
    const response = await fetch('/api/heartbeat/')
    const data = await response.json()
    if (data.heartbeat) {
      heartbeatData.value = data.heartbeat
    }
  } catch (error) {
    console.error('获取心跳数据失败:', error)
  }
}

// 获取所有配置
const fetchConfigurations = async () => {
  try {
    const response = await axios.get('/api/configurations/')
    const { base_crawler, crawler_configs } = response.data

    if (base_crawler) {
      Object.assign(baseConfig, base_crawler)
    }

    crawlerConfigs.value = crawler_configs || []
  } catch (error) {
    console.error('获取配置失败:', error)
    ElMessage.error('获取配置失败')
  }
}

// 保存基础配置
const saveBaseConfig = async () => {
  saveLoading.value = true
  try {
    const response = await axios.patch('/api/configurations/base', {
      switch_status: baseConfig.switch_status,
      frequency: baseConfig.frequency
    })

    // 更新本地数据
    Object.assign(baseConfig, response.data)
    ElMessage.success('基础配置保存成功')
  } catch (error) {
    console.error('保存基础配置失败:', error)
    if (error.response?.data?.error) {
      ElMessage.error(error.response.data.error)
    } else {
      ElMessage.error('保存基础配置失败')
    }
  } finally {
    saveLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(configForm, {
    config_name: '',
    created_user: '',
    category: '',
    website_names: [],
    source_urls: [],
    keywords: []
  })
  keywordInput.value = ''
  availableWebsites.value = []
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 新建配置
const handleCreate = () => {
  resetForm()
  dialogTitle.value = '新增爬虫配置'
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑配置
const handleEdit = (config) => {
  resetForm()
  Object.assign(configForm, {
    config_name: config.config_name,
    created_user: config.created_user,
    category: config.category,
    website_names: [...(config.website_names || [])],
    source_urls: [...(config.source_urls || [])],
    keywords: [...(config.keywords || [])]
  })

  // 更新可选网站
  availableWebsites.value = websiteOptions[config.category] || []

  dialogTitle.value = '编辑爬虫配置'
  isEdit.value = true
  dialogVisible.value = true
}

// 删除配置
const handleDelete = async (config) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除配置"${config.config_name}"吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    const response = await axios.delete(`/api/crawler/${config.config_name}`)
    if (response.data.success) {
      ElMessage.success(response.data.msg || '配置删除成功')
      await fetchConfigurations()
    } else {
      throw new Error(response.data.msg || '删除失败')
    }

  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除配置失败:', error)
      if (error.response?.data?.msg) {
        ElMessage.error(error.response.data.msg)
      } else if (error.message) {
        ElMessage.error(error.message)
      } else {
        ElMessage.error('删除配置失败')
      }
    }
  }
}

// 分类变化处理
const handleCategoryChange = (category) => {
  availableWebsites.value = websiteOptions[category] || []
  configForm.website_names = []
}

// 添加关键词
const addKeyword = () => {
  const keyword = keywordInput.value.trim()
  if (keyword && !configForm.keywords.includes(keyword)) {
    configForm.keywords.push(keyword)
    keywordInput.value = ''
  }
}

// 移除关键词
const removeKeyword = (index) => {
  configForm.keywords.splice(index, 1)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    const submitData = {
      config_name: configForm.config_name,
      created_user: configForm.created_user,
      category: configForm.category,
      website_names: configForm.website_names,
      source_urls: configForm.source_urls,
      keywords: configForm.keywords
    }

    if (isEdit.value) {
      const response = await axios.put(`/api/crawler/${configForm.config_name}`, submitData)
      if (response.data.success) {
        ElMessage.success(response.data.msg || '配置更新成功')
      } else {
        throw new Error(response.data.msg || '更新失败')
      }
    } else {
      const response = await axios.post('/api/crawler/', submitData)
      if (response.data.success) {
        ElMessage.success(response.data.msg || '配置创建成功')
      } else {
        throw new Error(response.data.msg || '创建失败')
      }
    }

    dialogVisible.value = false
    await fetchConfigurations()

  } catch (error) {
    console.error('操作失败:', error)
    if (error.response?.data?.msg) {
      ElMessage.error(error.response.data.msg)
    } else if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error(isEdit.value ? '配置更新失败' : '配置创建失败')
    }
  } finally {
    submitLoading.value = false
  }
}

// 点击用户名提示
const handleConfignameClick = () => {
  if (isEdit.value) {
    ElMessage({
      message: '需要修改配置名请删除后重新配置',
      type: 'warning',
    })
  }
}


// 对话框关闭
const handleDialogClose = () => {
  resetForm()
}

// 公告弹窗
import { ElNotification } from 'element-plus'

// 初始化
onMounted(() => {
  fetchConfigurations()
  fetchHeartbeatData()

  if (!sessionStorage.getItem('noticeShown')) {
    ElNotification({
      title: '系统公告',
      dangerouslyUseHTMLString: true,
      message: `<div style="line-height: 1.6;">
        • 每小时最多全量爬取20个关键词<br/>
        • 单个关键词单个网站约20-30秒<br/>
        • 按需爬取、请勿过量<br/>
      </div>`,
      duration: 0,
      position: 'top-right',
      type: 'warning'
    })
    sessionStorage.setItem('noticeShown', 'true')
  }
})

</script>

<style scoped>
.config-management-container {
  padding: 10px;
  background-color: #f5f5f5;

}

.config-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.card-header {
  background: #f8f9fa;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.card-content {
  padding: 20px;
}

.row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.row:last-child {
  margin-bottom: 0;
}

.form-item, .status-item, .info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-item label, .status-item label, .info-item label {
  font-weight: 500;
  color: #606266;
  white-space: nowrap;

}

.time-text {
  color: #409eff;
  font-family: monospace;
}

.configs-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.crawler-config {
  margin-bottom: 0;
}

.config-name {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.info-row {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  margin: 12px 0;
}

.tags-section {
  width: 100%;
}

.tags-section label {
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
  display: block;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.no-data {
  color: #c0c4cc;
  font-style: italic;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.keywords-input {
  width: 100%;
}

.keywords-display {
  min-height: 32px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  background: #f8f9fa;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .config-management-container {
    padding: 10px;
  }

  .configs-container {
    grid-template-columns: 1fr;
  }

  .row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .form-item, .status-item, .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

:deep(.el-input-number) {
  width: 120px;
}
</style>