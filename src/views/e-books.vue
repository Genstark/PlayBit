<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const isLoading = ref(true);
const loadError = ref('');
const iframeHtml = ref('');

const bookName = computed(() =>
    String(route.params.ebookName || '').toLowerCase()
);

const bookUrl = computed(() =>
    `${process.env.VUE_APP_URL}/e-library/${encodeURIComponent(bookName.value)}`
);

watch(bookUrl, async (url, _previousUrl, onCleanup) => {
    const controller = new AbortController();
    onCleanup(() => controller.abort());
    isLoading.value = true;
    loadError.value = '';
    iframeHtml.value = '';

    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
            throw new Error(`Could not load ebook (HTTP ${response.status})`);
        }

        const html = await response.text();
        const document = new DOMParser().parseFromString(html, 'text/html');
        const base = document.createElement('base');
        base.href = `${url}/`;
        document.head.prepend(base);
        iframeHtml.value = `<!DOCTYPE html>${document.documentElement.outerHTML}`;
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('E-book load error:', error);
            loadError.value = 'Unable to load this e-book. Please try again later.';
            isLoading.value = false;
        }
    }
}, { immediate: true });

function onLoad() {
    isLoading.value = false;
}
</script>

<template>
    <main class="box-border flex h-screen w-full flex-col bg-gray-100 p-0">
        <p v-if="isLoading || loadError" class="m-auto p-6 text-center text-gray-700" role="status">
            {{ loadError || 'Loading e-book…' }}
        </p>

        <iframe v-if="iframeHtml" v-show="!isLoading" :key="bookUrl" :srcdoc="iframeHtml" title="E-book reader"
            class="min-h-0 w-full flex-1 rounded-lg border border-gray-300 bg-white shadow-sm"
            sandbox="allow-scripts allow-forms allow-popups" allowfullscreen @load="onLoad" />
    </main>
</template>