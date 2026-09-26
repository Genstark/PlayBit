<!-- eslint-disable vue/multi-word-component-names -->
<!-- SignupPage.vue -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// import Header from '../components/Header.vue';

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);

const router = useRouter();

async function handleSignup() {
    if (!name.value || !email.value || !password.value || !confirmPassword.value) {
        alert('Please fill in all fields.');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
    if (!emailRegex.test(email.value)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Password match check
    if (password.value !== confirmPassword.value) {
        alert('Passwords do not match.');
        return;
    }

    isLoading.value = true;

    try {
        const signupData = {
            name: name.value,
            email: email.value,
            password: password.value,
        };

        // If env not set, fallback to localhost
        const apiUrl = `${process.env.VUE_APP_URL}/signup`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(signupData),
            credentials: 'include',
        });

        const data = await response.json();

        if (response.ok && data.ok) {
            alert(`Signup successful! Welcome, ${signupData.name}!`);
            // Clear form
            name.value = '';
            email.value = '';
            password.value = '';
            confirmPassword.value = '';
            // Redirect to login
            router.push('/login');
        } else if (response.status === 409) {
            alert('Email or username already exists. Please login.');
        } else {
            alert(`Signup failed: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred while signing up. Please try again later.');
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <!-- <Header /> -->
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <div class="space-y-4">
                <input type="text" v-model="name" placeholder="Full Name" :disabled="isLoading"
                    class="w-full px-4 py-2 border rounded-md focus:ring focus:ring-primary-200 disabled:opacity-50" />
                <input type="email" v-model="email" placeholder="Email" :disabled="isLoading"
                    class="w-full px-4 py-2 border rounded-md focus:ring focus:ring-primary-200 disabled:opacity-50" />
                <input type="password" v-model="password" placeholder="Password" :disabled="isLoading"
                    class="w-full px-4 py-2 border rounded-md focus:ring focus:ring-primary-200 disabled:opacity-50" />
                <input type="password" v-model="confirmPassword" placeholder="Confirm Password" :disabled="isLoading"
                    class="w-full px-4 py-2 border rounded-md focus:ring focus:ring-primary-200 disabled:opacity-50" />
                <button @click="handleSignup" :disabled="isLoading"
                    class="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ isLoading ? 'Signing Up...' : 'Sign Up' }}
                </button>
            </div>
            <p class="text-sm mt-4 text-center">
                Already have an account?
                <router-link to="/login" class="text-primary-600 hover:underline">Log In</router-link>
            </p>
        </div>
    </div>
</template>
