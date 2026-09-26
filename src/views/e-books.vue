<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const ebookUrls = {
    'arduino-kids': process.env.VUE_APP_ARDUINO_KIDS_URL,
    arduino: process.env.VUE_APP_ARDUINO_URL
};

const iframeSrc = computed(() => {
    const bookName = String(route.params.ebookName || '').toLowerCase();
    const source = ebookUrls[bookName];

    if (!source) return '';

    try {
        const url = new URL(source);
        return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
        return '';
    }
});

</script>

<template>
    <!-- <Header /> -->
    <main class="box-border flex h-screen w-full flex-col bg-gray-100 p-0">
        <!-- <button 
            type="button"
            class="group mx-4 mb-3 inline-flex items-center gap-2 self-start rounded-lg border border-indigo-600 bg-indigo-600 
                px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:border-indigo-700 
                hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mx-6"
            @click="goBack"
        >
            <svg 
                class="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" 
                fill="none"
                viewBox="0 0 24 24" 
                stroke="currentColor"
            >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Library
        </button> -->
        <iframe
            v-if="iframeSrc"
            :src="iframeSrc"
            title="E-book reader"
            class="min-h-0 w-full flex-1 rounded-lg border border-gray-300 bg-white shadow-sm"
            allowfullscreen
        ></iframe>
        <p v-else class="m-auto p-6 text-center text-gray-700">
            No valid URL is configured for this ebook.
        </p>
    </main>
</template>