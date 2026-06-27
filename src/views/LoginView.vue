<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const password = ref('')
const loading = ref(false)

async function onSubmit() {
  if (!password.value.trim()) {
    ElMessage.warning('请输入密码')
    return
  }

  loading.value = true
  try {
    await auth.login(password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect)
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>WorkNote</h1>
      <p class="subtitle">请输入访问密码</p>
      <el-form @submit.prevent="onSubmit">
        <el-form-item>
          <el-input
            v-model="password"
            type="password"
            placeholder="访问密码"
            show-password
            autofocus
            @keyup.enter="onSubmit"
          />
        </el-form-item>
        <el-button type="primary" :loading="loading" class="submit-btn" @click="onSubmit">
          进入
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 380px;
  padding: 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
}

h1 {
  margin: 0 0 8px;
  font-size: 28px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 0 0 24px;
  color: #64748b;
}

.submit-btn {
  width: 100%;
}
</style>
