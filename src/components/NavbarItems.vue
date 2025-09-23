<script setup>

</script>

<template>
    <div class="navbar">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/login">Login</RouterLink>
        <RouterLink to="/inscrire">Inscrire</RouterLink>
    </div>
</template>

<style lang="scss" scoped>
    .navbar {
        display: flex;
        gap: 1rem;
    }
</style>