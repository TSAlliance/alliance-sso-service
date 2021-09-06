module.exports = {
    apps: [{
        name: "Alliance-SSO",
        script: "npm",
        args: "run start:dev",
        watch: false,
        increment_var: "APP_PORT",
        instances: 1,
        time: false,
        env: {
            APP_PORT: 3388
        }
    }],
    deploy: {
        production: {
            user: 'deploy.name',
            host: 'tsalliance.eu',
            key: 'deploy.key',
            ref: 'origin/main',
            repo: 'https://github.com/username/myapp',
            path: '/home/username/myapp',
            'post-deploy':
                'npm install && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save && git checkout yarn.lock',
            env: {
                NODE_ENV: 'production',
            }
        }
    }
}