<template>
    
    <h1>Settings</h1>

    Bio<br>
    Producers<br>
    AI PopStars<br>
    Payments
    <el-button @click="handleSignOut" class="float-right">Sign Out</el-button>
</template>
<script setup>
import { signOut } from 'aws-amplify/auth';

async function handleSignOut() {
    try {
        await signOut();
        // You can add additional logic here after successful sign out
        // For example, redirecting to login page
    } catch (error) {
        console.error('Error signing out:', error);
    }
}
</script>