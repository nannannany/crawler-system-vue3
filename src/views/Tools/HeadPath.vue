<template>
  <div class="head-path">
    <h1 class="head-path__title">{{ title }}</h1>
    <div class="head-path__breadcrumb">
      <span>信息集成系统</span>
      <span class="head-path__sep">></span>
      <span>{{ firstLevel }}</span>
      <span class="head-path__sep">></span>
      <span>{{ secondLevel }}</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  firstLevel: {
    type: String,
    default: ''
  },
  secondLevel: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.head-path {
  margin: 10px 10px 7px 10px;
  background-color: #fff;
  border-bottom: 1px solid #eaeaea;
  border-radius:7px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.head-path__title {
  font-size: 20px;
  padding-top: 15px;
  padding-left: 20px;
  font-weight: bold;
  line-height: 1.2;
}

.head-path__breadcrumb {
  font-size: 14px;
  padding-bottom: 15px;
  padding-left: 20px;
  color: #666;
}

.head-path__sep {
  margin: 0 4px;
}
</style>
