<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import Header from '@/components/Header.vue';
import Cards from '@/components/Cards.vue';
import { computed, onUnmounted } from 'vue';

const cards = computed(() => [
    {
        title: 'Arduino Kids',
        description: 'Explore interactive lessons and expand your knowledge.',
        image: "https://i.ibb.co/R4jCCY5g/teach-arduino-to-12-year-old.webp",
        page: {
            name: 'E-Book',
            params: {
                id: localStorage.getItem('user'),
                ebookName: 'arduino-book-kids'
            }
        },
        blank: false
    },
    {
        title: 'Arduino',
        description: 'Explore interactive lessons and expand your knowledge.',
        image: "https://i.ibb.co/GQqLBkQk/arduino-logo.png",
        page: {
            name: 'E-Book',
            params: {
                id: localStorage.getItem('user'),
                ebookName: 'arduino-book'
            }
        },
        blank: false
    }
]);

onUnmounted(() => {
    // console.log('Index component unmounted');
});
</script>

<template>
    <Header />
    <Cards :cards="cards" />
</template>