module.exports = {
    apps: [{
        name: "Alliance-SSO",
        script: "dist/main.js",
        increment_var: "APP_PORT",
        instances: 1,
        autorestart: true,
        watch: false,
        time: false,
        exec_interpreter: "node",
        env: {
            APP_PORT: 3388
        }
    }]
}