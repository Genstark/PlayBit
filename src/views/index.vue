<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <HeaderComponent />
    <Cards :cards="cards" />
    <!-- <Footer /> -->
</template>

<script setup>
import HeaderComponent from '@/components/Header.vue';
// import Footer from '@/components/Footer.vue';
import Cards from '@/components/Cards.vue';
import numberBowling from '../../public/images/numberBowlingGame.png';
import taskimage from '../../public/images/daily-task.png';
import library from '../../public/images/library.jpg';
import { onUnmounted } from 'vue';

const cards = [
    {
        title: 'Number Bowling',
        description: 'Practice your skills with engaging exercises.',
        image: numberBowling,
        page: { name: 'number-bowling-id', params: { id: localStorage.getItem('user') } },
        blank: false
    },
    {
        title: 'Library',
        description: 'Explore interactive lessons and expand your knowledge.',
        // page: 'https://engage-dev1.comprodls.com/',
        page: { name: 'library-id', params: { id: localStorage.getItem('user') } },
        image: library,
        blank: false
    },
    {
        title: 'Daily Task',
        description: 'Complete the assigned tasks and quizzes.',
        image: taskimage,
        page: { name: 'task-id', params: { id: localStorage.getItem('user') } },
        blank: false
    },
];

onUnmounted(() => {
    // console.log('Index component unmounted');
});
</script>
