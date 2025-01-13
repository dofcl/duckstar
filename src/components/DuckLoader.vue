<template>
    <div class="loader ma-0 pa-0">
        <div class="loader__inner ma-0 pa-0">
            <div class="loader__inner__text mx-auto text-center ma-0 pa-0">
                <img src="@/assets/loader.png" alt="DuckStar Logo" class="spinner ma-0 pa-0" />
                <h4 class="ma-0 pa-0">Loading...</h4>
            </div>
        </div>
    </div>
</template>
<style scoped>
.loader {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100px;
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
