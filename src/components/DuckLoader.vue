<template>
    <div class="loader">
        <div class="loader__inner">
            <div class="loader__inner__text mx-auto text-center">
                <img src="@/assets/loader.png" alt="DuckStar Logo" class="spinner" />
                <h2 class="ma-0 pa-0">Loading...</h2>
            </div>
        </div>
    </div>
</template>
<style scoped>
.loader {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    width: 100%;
}

.loader__inner {
    text-align: center;
}

.spinner {
    width: 100px;
    height: 100px;
    animation: spin 1.2s ease-in-out infinite;
    /* Optional: add smooth animation start/end */
    transform-origin: center center;
    /* Optional: add smoother animation */
    will-change: transform;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

/* Optional: Add fade-in animation */
.loader__inner__text {
    animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style>
