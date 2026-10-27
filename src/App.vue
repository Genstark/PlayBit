<script setup>
import { onMounted, ref } from 'vue';

const isDarkMode = ref(false);

function applyTheme() {
	const savedTheme = localStorage.getItem('theme');
	isDarkMode.value = savedTheme === 'dark';
	document.documentElement.classList.toggle('dark', isDarkMode.value);
}

function handleThemeChange(event) {
	isDarkMode.value = event.detail === 'dark';
	document.documentElement.classList.toggle('dark', isDarkMode.value);
}

onMounted(() => {
	applyTheme();
	window.addEventListener('theme-change', handleThemeChange);
});
</script>

<template>
	<div :class="{ dark: isDarkMode }">
		<router-view />
	</div>
</template>

<style></style>
