<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <div class="section-header">
        <h1 class="page-title">Войти</h1>
      </div>

      <form class="auth-form">
        <label class="field">
          <span class="field__label">Логин</span>
          <input class="field__control" name="login" type="text" autocomplete="username" />
        </label>

        <label class="field">
          <span class="field__label">Пароль</span>
          <input
            class="field__control"
            name="password"
            type="password"
            autocomplete="current-password"
          />
        </label>

        <button class="button button--primary" type="button">Войти</button>
      </form>
    </section>
  </main>
</template>
