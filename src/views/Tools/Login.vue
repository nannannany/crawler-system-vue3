<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-title">系统登录</div>
      <div class="input-container">
        <input
            v-model="password"
            type="password"
            placeholder="请输入口令"
            class="login-input"
            @keyup.enter="login"
        />
      </div>
      <button @click="login" class="login-btn">登录</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const password = ref("");

const login = async () => {
  try {
    const res = await axios.post("/api/login/", { password: password.value });
    if (res.data.success) {
      localStorage.setItem("token", "1");
      router.push("/BaseSetting");
    } else {
      alert("口令错误");
    }
  } catch (err) {
    console.error(err);
    alert("服务器错误");
  }
};
</script>

<style scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  background: url("@/assets/img/bgimg.png") no-repeat center/cover;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 40px 35px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  min-width: 320px;
}

.login-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 20px;
  font-weight: 300;
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.input-container {
  position: relative;
  width: 100%;
}

.login-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.9);
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.login-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.login-input:focus {
  border-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.login-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: 300;
  letter-spacing: 1px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.login-btn:hover {
  border-color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.1);
}

.login-btn:active {
  transform: translateY(1px);
}
</style>