module.exports = {
    apps: [{
        name: "Alliance-SSO",
        script: "./dist/main.js",
        exec_interpreter: "node",
        watch: false,
        env: {
            NODE_ENV: "production",
            APP_PORT: 3000
        }
    }]
}