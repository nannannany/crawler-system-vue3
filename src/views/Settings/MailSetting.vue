<template>
  <div class="user-management-container">

    <div class="action-section">
      <div class="button-row">
        <el-button type="primary" :icon="Plus" @click="handleCreate">新建</el-button>
        <el-button
            type="warning"
            :icon="Edit"
            :disabled="selectedUsers.length !== 1"
            @click="handleEdit"
        >编辑</el-button>
        <el-button
            type="danger"
            :icon="Delete"
            :disabled="selectedUsers.length === 0"
            @click="handleDelete"
        >删除</el-button>
        <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
        <div class="search-row" style="margin-left: 10px; margin-bottom: 16px; display: flex; gap: 8px; align-items: center;">
          <el-input v-model="searchText" placeholder="输入用户名或邮箱" clearable style="width: 250px" />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
      </div>
    </div>


    <div class="table-section">
      <el-table
          ref="tableRef"
          :data="tableData"
          :row-class-name="tableRowClassName"
          v-loading="loading"
          border
          stripe
          height="calc(100vh - 300px)"
          style="width: 100%"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="username" label="用户名" width="150" align="center" />
        <el-table-column prop="email" label="邮箱" width="200" align="center" />
        <el-table-column prop="push_categories" label="关注配置" min-width="200">
          <template #default="{ row }">
            <div v-if="Array.isArray(row.push_categories) && row.push_categories.length > 0">
              <el-tag
                  v-for="(category, idx) in row.push_categories"
                  :key="idx"
                  size="small"
                  style="margin: 2px"
              >{{ category }}</el-tag>
            </div>
            <span v-else class="text-muted">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="push_switch" label="推送开关" width="100" align="center">
          <template #default="{ row }">
            <el-switch
                v-model="row.push_switch"
                :active-value="1"
                :inactive-value="0"
                @change="handleSwitchChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" align="center">
          <template #default="{ row }">{{ formatDateTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
                type="primary"
                :icon="Edit"
                size="small"
                circle
                @click="handleEditSingle(row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="500px"
        @close="handleDialogClose"
    >
      <el-form
          ref="formRef"
          :model="userForm"
          :rules="formRules"
          label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="userForm.username"
              placeholder="请输入用户名"
              :readonly="isEdit"
              @click="handleUsernameClick"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
              v-model="userForm.email"
              placeholder="请输入邮箱"
              type="email"
          />
        </el-form-item>
        <el-form-item label="关注配置" prop="push_categories">
          <el-select
              v-model="userForm.push_categories"
              placeholder="请选择关注配置"
              multiple
              filterable
              style="width: 100%"
              :loading="categoriesLoading"
          >
            <el-option
                v-for="category in availableCategories"
                :key="category"
                :label="category"
                :value="category"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="推送开关" prop="push_switch">
          <el-switch
              v-model="userForm.push_switch"
              :active-value="1"
              :inactive-value="0"
          />
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Plus, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 数据与状态
const loading = ref(false)
const submitLoading = ref(false)
const categoriesLoading = ref(false)
const tableData = ref([])
const selectedUsers = ref([])
const tableRef = ref()

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

// 表单数据
const userForm = reactive({
  username: '',
  email: '',
  push_categories: [],
  push_switch: 1
})

// 可选的配置分类
const availableCategories = ref([])

// 表单校验规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '用户名长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const formRef = ref()

// 获取配置选项
const fetchConfigurations = async () => {
  categoriesLoading.value = true
  try {
    const response = await axios.get('/api/configurations/')
    const { crawler_configs } = response.data

    // 从 crawler_configs 中提取 config_name
    availableCategories.value = crawler_configs
        ? crawler_configs.map(config => config.config_name).filter(name => name)
        : []

  } catch (error) {
    console.error('获取配置选项失败:', error)
    ElMessage.error('获取配置选项失败')
    availableCategories.value = []
  } finally {
    categoriesLoading.value = false
  }
}

// 格式化时间
const formatDateTime = (dt) => {
  if (!dt) return '-'
  const date = new Date(dt)
  date.setTime(date.getTime() + 8 * 60 * 60 * 1000) // 加上8小时
  return date.toLocaleString('zh-CN')
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/users/')
    tableData.value = response.data || []
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

// 推送开关变化
const handleSwitchChange = async (row) => {
  try {
    await axios.put(`/api/users/${row.username}`, {
      push_switch: row.push_switch
    })
    ElMessage.success('推送开关更新成功')
  } catch (error) {
    console.error('更新推送开关失败:', error)
    ElMessage.error('更新推送开关失败')
    // 回滚状态
    row.push_switch = row.push_switch === 1 ? 0 : 1
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(userForm, {
    username: '',
    email: '',
    push_categories: [],
    push_switch: 1
  })
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 新建用户
const handleCreate = async () => {
  resetForm()
  dialogTitle.value = '新建用户'
  isEdit.value = false

  // 在打开对话框前获取最新的配置选项
  await fetchConfigurations()

  dialogVisible.value = true
}

// 批量编辑用户
const handleEdit = () => {
  if (selectedUsers.value.length !== 1) {
    ElMessage.warning('请选择一个用户进行编辑')
    return
  }
  handleEditSingle(selectedUsers.value[0])
}

// 编辑单个用户
const handleEditSingle = async (user) => {
  resetForm()
  Object.assign(userForm, {
    username: user.username,
    email: user.email,
    push_categories: user.push_categories || [],
    push_switch: user.push_switch
  })
  dialogTitle.value = '编辑用户'
  isEdit.value = true

  // 在打开对话框前获取最新的配置选项
  await fetchConfigurations()

  dialogVisible.value = true
}

// 删除用户
const handleDelete = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请选择要删除的用户')
    return
  }

  const usernames = selectedUsers.value.map(user => user.username).join('、')

  try {
    await ElMessageBox.confirm(
        `确定要删除用户：${usernames} 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    // 执行删除
    const promises = selectedUsers.value.map(user =>
        axios.delete(`/api/users/${user.username}`)
    )

    await Promise.all(promises)
    ElMessage.success('用户删除成功')

    // 清空选择并刷新列表
    if (tableRef.value) {
      tableRef.value.clearSelection()
    }
    await fetchUsers()

  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败')
    }
  }
}

// 刷新列表
const handleRefresh = () => {
  if (tableRef.value) {
    tableRef.value.clearSelection()
  }
  fetchUsers()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      // 更新用户
      await axios.put(`/api/users/${userForm.username}`, {
        email: userForm.email,
        push_categories: userForm.push_categories,
        push_switch: userForm.push_switch
      })
      ElMessage.success('用户更新成功')
    } else {
      // 创建用户
      await axios.post('/api/users/', {
        username: userForm.username,
        email: userForm.email,
        push_categories: userForm.push_categories,
        push_switch: userForm.push_switch
      })
      ElMessage.success('用户创建成功')
    }

    dialogVisible.value = false
    await fetchUsers()

  } catch (error) {
    console.error('操作失败:', error)
    if (error.response?.data?.msg) {
      ElMessage.error(error.response.data.msg)
    } else {
      ElMessage.error(isEdit.value ? '用户更新失败' : '用户创建失败')
    }
  } finally {
    submitLoading.value = false
  }
}

// 点击用户名提示
const handleUsernameClick = () => {
  if (isEdit.value) {
    ElMessage({
      message: '需要修改用户名请删除后重新配置',
      type: 'warning',
    })
  }
}

// 搜索功能
const searchText = ref('')
const highlightedRow = ref(null)

const handleSearch = async () => {
  const keyword = searchText.value.trim()
  if (!keyword) return

  const index = tableData.value.findIndex(
      user => user.username === keyword || user.email === keyword
  )

  if (index === -1) {
    ElMessage.warning('未找到匹配的用户')
    return
  }

  // 表格滚动到对应行
  await nextTick()
  const tableEl = tableRef.value?.$el?.querySelector('.el-scrollbar .el-scrollbar__wrap')
  const rowEl = tableRef.value?.$el?.querySelectorAll('.el-table__body-wrapper tbody tr')[index]

  if (rowEl && tableEl) {
    const rowTop = rowEl.offsetTop
    tableEl.scrollTop = rowTop

    // 高亮当前行
    highlightedRow.value = tableData.value[index].username

    // 1秒后取消高亮
    setTimeout(() => {
      highlightedRow.value = null
    }, 1000)
  }
}

const tableRowClassName = ({ row }) => {
  return row.username === highlightedRow.value ? 'highlight-row' : ''
}

// 对话框关闭
const handleDialogClose = () => {
  resetForm()
}

// 初始化
onMounted(() => {
  fetchUsers()
  fetchConfigurations()
})
</script>

<style scoped>
.user-management-container {
  padding: 10px;
}

.action-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.text-muted {
  color: #909399;
  font-style: italic;
}

.el-tag {
  margin: 2px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #606266;
  font-weight: 500;
}

:deep(.el-table td) {
  padding: 8px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .button-row {
    flex-wrap: wrap;
  }

  .user-management-container {
    padding: 5px;
  }
}

:deep(.el-table .highlight-row) {
  animation: highlightFlash 1s ease !important;
  background-color: #ffe58f !important;
}

:deep(.el-table .highlight-row td) {
  background-color: #ffe58f !important;
}

:deep(.el-table .el-table__row--striped.highlight-row) {
  background-color: #ffe58f !important;
}

:deep(.el-table .el-table__row--striped.highlight-row td) {
  background-color: #ffe58f !important;
}

/* 高亮动画 */
@keyframes highlightFlash {
  0% {
    background-color: #ffe588 !important;
  }
  100% {
    background-color: transparent !important;
  }
}

</style>