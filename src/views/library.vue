<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import Header from '@/components/Header.vue';
import Cards from '@/components/Cards.vue';
import { onUnmounted } from 'vue';

const cards = [
    {
        title: 'Arduino Kids',
        description: 'Explore interactive lessons and expand your knowledge.',
        image: "https://mp.moonpreneur.com/blog/wp-content/uploads/2024/02/teach-arduino-to-12-year-old.webp",
                page: {
            name: 'E-Book',
            params: {
                id: localStorage.getItem('user'),
                ebookName: 'Arduino-Kids'
            }
        },
        blank: false
    },
    {
        title: 'Arduino',
        description: 'Explore interactive lessons and expand your knowledge.',
        image: "https://roboticsbackend.com/wp-content/uploads/2022/04/arduino_logo.png",
        page: {
            name: 'E-Book',
            params: {
                id: localStorage.getItem('user'),
                ebookName: 'Arduino'
            }
        },
        blank: false
    }
];

onUnmounted(() => {
    // console.log('Index component unmounted');
});
</script>

<template>
    <Header />
    <Cards :cards="cards" />
</template>