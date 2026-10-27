<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const isMobileMenuOpen = ref(false);
const largeText = ref(false);
const recentSearches = ref([]);
const user = ref(null); // ✅ Track logged-in user
const isDarkMode = ref(false);

function toggleMobileMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

// Load from localStorage on mount
onMounted(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
        recentSearches.value = JSON.parse(saved);
    }

    // ✅ check login state
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (savedUser || token) {
        user.value = savedUser;
    }

    isDarkMode.value = localStorage.getItem("theme") === "dark";
});

function toggleTheme() {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem("theme", isDarkMode.value ? "dark" : "light");
    window.dispatchEvent(new CustomEvent("theme-change", {
        detail: isDarkMode.value ? "dark" : "light"
    }));
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
// ✅ logout
function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    deleteCookie("token");
    user.value = null;
    router.push("/login");
}
</script>

<template>
    <div class="pt-16"></div>
    <header class="fixed top-0 left-0 w-full bg-white shadow z-50 dark:bg-gray-900" :class="{ 'large-text': largeText }">
        <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-3 sm:py-4">
                <!-- Left: Logo + Nav -->
                <div class="flex items-center space-x-4 sm:space-x-6">
                    <h1 class="text-2xl sm:text-3xl font-bold text-primary-600 whitespace-nowrap inline-block">
                        <!-- E-L -->
                        <router-link :to="`/${user}`" class="hover:text-primary-700">
                            PlayBit
                        </router-link>
                    </h1>

                    <!-- Nav (hidden on mobile) -->
                    <nav class="hidden md:flex items-center space-x-4 lg:space-x-6">
                        <router-link :to="`/${user}`" class="text-sm sm:text-base lg:text-lg text-gray-700 hover:text-primary-600 font-semibold">Home</router-link>
                        <router-link to="/about" class="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 font-semibold">About</router-link>
                        <!-- <router-link to="/explore" class="text-sm sm:text-base lg:text-lg text-gray-700 hover:text-primary-600">Explore</router-link> -->
                        <router-link :to="user ? `/${user}/scores` : '/scores'" class="text-sm sm:text-base lg:text-lg text-gray-700 hover:text-primary-600 font-semibold">
                            Scores
                        </router-link>
                    </nav>
                </div>

                <!-- Right side -->
                <div class="hidden md:flex items-center space-x-4 lg:space-x-6">
                    <button @click="toggleTheme" type="button"
                        class="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                        :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
                        :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'">
                        <svg v-if="isDarkMode" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <circle cx="12" cy="12" r="4" />
                            <path stroke-linecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                        </svg>
                        <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
                        </svg>
                    </button>
                    <!-- ✅ If user is logged in -->
                    <template v-if="user">
                        <div class="flex items-center space-x-3">
                            <button @click="router.push({ name: 'profile-id', params: { id: user } })"
                                    class="text-gray-700 font-semibold focus:outline-none">
                                👤 {{ user }}
                            </button>
                            <button @click="logout"
                                class="bg-red-500 hover:bg-red-600 text-white text-sm sm:text-base font-medium px-4 py-2 rounded-md">
                                Logout
                            </button>
                        </div>
                    </template>

                    <!-- ❌ If user not logged in -->
                    <template v-else>
                        <router-link v-if="route.path !== '/signup'" to="/signup"
                            class="text-base font-medium text-gray-700 hover:text-primary-600">
                            Sign up
                        </router-link>

                        <router-link v-if="route.path !== '/login'" to="/login"
                            class="bg-primary-600 text-white text-base font-medium px-4 py-2 rounded-md hover:bg-primary-700">
                            Log in
                        </router-link>
                    </template>
                </div>

                <!-- Mobile Hamburger -->
                <div class="md:hidden flex items-center text-gray-700 hover:text-primary-600">
                    <button @click="toggleMobileMenu" class="text-gray-700 hover:text-black focus:outline-none">
                        <svg class="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" stroke-width="2"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Mobile Menu -->
            <div v-if="isMobileMenuOpen" class="md:hidden space-y-4 sm:space-y-6 pb-4 sm:pb-6">
                <button @click="toggleTheme" type="button"
                    class="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
                    :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'">
                    <svg v-if="isDarkMode" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="4" />
                        <path stroke-linecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                    </svg>
                    <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
                    </svg>
                </button>
                <nav class="flex flex-col space-y-2 sm:space-y-3">
                    <p class="text-l sm:text-base text-gray-700 hover:text-primary-600 font-bold" @click="router.push({name:'user-home', params: { id: user }})">Home
                        <!-- <router-link :to="`/${user}`"></router-link> -->
                    </p>
                    <p class="text-l sm:text-base text-gray-700 hover:text-primary-600 font-bold" @click="router.push('/about')">About
                        <!-- <router-link :to="`/${user}`"></router-link> -->
                    </p>
                    <p class="text-l sm:text-base text-gray-700 hover:text-primary-600 font-bold" @click="router.push({name:'score-id', params: { id: user }})">Scores
                        <!-- <router-link :to="user ? `/${user}/scores` : '/scores'"></router-link> -->
                    </p>
                </nav>

                <!-- ✅ If user logged in -->
                <template v-if="user">
                    <div class="flex flex-col space-y-2 pt-3">
                        <span class="px-3 py-2 text-gray-700 font-semibold" @click="router.push({ name: 'profile-id', params: { id: user } })">👤 {{ user }}</span>
                        <button @click="logout" class="bg-red-500 text-white font-medium py-2 px-4 rounded-md">
                            Logout
                        </button>
                    </div>
                </template>

                <!-- ❌ If user not logged in -->
                <template v-else>
                    <button @click="router.push('/signup')"
                        class="border border-primary-600 text-primary-600 font-medium px-4 py-2 rounded-full">
                        Signup
                    </button>
                    <button @click="router.push('/login')"
                        class="bg-primary-600 text-white font-medium px-4 py-2 rounded-full">
                        Log in
                    </button>
                </template>
            </div>
        </div>
    </header>

    <!-- Accessibility Toggle -->
    <button @click="largeText = !largeText" v-if="false"
        class="fixed bottom-4 right-4 bg-gray-800 text-white text-sm sm:text-base px-3 sm:px-5 py-2 sm:py-3 rounded-full shadow-lg hover:bg-gray-900">
        Toggle Large Text
    </button>
</template>

<style scoped>
header {
    font-size: 1rem;
}

.large-text {
    font-size: 1.25rem;
}

.large-text a,
.large-text button,
.large-text input {
    font-size: 1.25rem;
    padding: 0.85rem 1.25rem;
}
</style>
