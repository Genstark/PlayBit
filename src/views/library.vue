<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import Header from '@/components/Header.vue';
import Cards from '@/components/Cards.vue';
import { computed, onUnmounted } from 'vue';

const cards = computed(() => [
    {
        title: 'Arduino Kids',
        description: '',
        image: "/images/arduino-kids.png",
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
        description: '',
        image: "/images/arduino.png",
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