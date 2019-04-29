module.exports = {
    apps : [{
        name: 'api',
        script: './src/index.js',
        interpreter: 'babel-node',
        watch: ['src'],
        exec_mode: 'fork',
        env: {
            'NODE_ENV': 'development'
        },
        env_production : {
            'NODE_ENV': 'production'
        }
    }]
};

