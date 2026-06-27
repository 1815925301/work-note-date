<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/auth'
import { today, weekPath } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const showShell = computed(() => route.name !== 'login')

const navItems = [
  { label: '首页', path: '/' },
  { label: '今日', path: `/day/${today()}` },
  { label: '周视图', path: weekPath() },
  {
    label: '月视图',
    path: `/month/${dayjs().year()}/${dayjs().month() + 1}`,
  },
  {
    label: '季度',
    path: `/quarter/${dayjs().year()}/${Math.ceil((dayjs().month() + 1) / 3)}`,
  },
  { label: '标签搜索', path: '/search' },
]

const activePath = computed(() => {
  if (route.path.startsWith('/day')) return `/day/${today()}`
  if (route.path.startsWith('/week')) return weekPath()
  if (route.path.startsWith('/month')) return route.path
  if (route.path.startsWith('/quarter')) return route.path
  if (route.path.startsWith('/search')) return '/search'
  return '/'
})

function navigate(path: string) {
  router.push(path)
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <router-view v-if="!showShell" />
  <el-container v-else class="app-layout">
    <el-header class="app-header">
      <div class="brand" @click="navigate('/')">WorkNote</div>
      <el-menu
        mode="horizontal"
        :default-active="activePath"
        :ellipsis="false"
        class="nav-menu"
        @select="navigate"
      >
        <el-menu-item v-for="item in navItems" :key="item.path" :index="item.path">
          {{ item.label }}
        </el-menu-item>
      </el-menu>
      <el-button v-if="auth.authRequired" text @click="logout">退出</el-button>
    </el-header>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.06), transparent 28%),
    linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  color: #0f172a;
}

.app-layout {
  min-height: 100vh;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 24px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  padding: 0 24px;
  height: 64px;
}

.brand {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  white-space: nowrap;
}

.nav-menu {
  flex: 1;
  border-bottom: none !important;
}

.app-main {
  max-width: 1120px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 24px 40px;
}
</style>
