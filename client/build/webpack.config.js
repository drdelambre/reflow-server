const path = require('path'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
    WorkboxPlugin = require('workbox-webpack-plugin'),
    WebpackPwaManifest = require('webpack-pwa-manifest'),
    UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
    project = require('../project.config'),
    inProject = path.resolve.bind(path, project.basePath),
    inProjectSrc = (file) => inProject(project.srcDir, file);

const __DEV__ = project.env === 'development',
    __TEST__ = project.env === 'test',
    __PROD__ = project.env === 'production';

const config = {
    mode: __DEV__ ? 'development' : 'production',
    entry: {
        normalize: [
            inProjectSrc('normalize'),
        ],
        main: [
            inProjectSrc(project.main),
        ],
    },
    optimization: {},
    devtool: project.sourcemaps ? 'source-map' : false,
    output: {
        path: inProject(project.outDir),
        filename: __DEV__ ? '[name].js' : '[name].[chunkhash].js',
        publicPath: project.publicPath,
    },
    resolve: {
        mainFiles: ['index'],
        modules: [
            inProject(project.srcDir),
            'node_modules',
        ],
        extensions: ['*', '.js', '.jsx', '.json', '.scss'],
        alias: {
            'fonts': inProject(project.srcDir, './fonts'),
            'services': inProject(project.srcDir, './services'),
            'stores': inProject(project.srcDir, './stores'),
            'views': inProject(project.srcDir, './views'),
            'util': inProject(project.srcDir, './util')
        }
    },
    externals: project.externals,
    module: {
        rules: [],
    },
    plugins: [
        new webpack.IgnorePlugin(/^(continuation-local-storage)$/),
        new webpack.DefinePlugin(Object.assign({
            'process.env': { NODE_ENV: JSON.stringify(project.env) },
            __DEV__,
            __TEST__,
            __PROD__,
        }, project.globals))
    ],
}


// JavaScript
// ------------------------------------
config.module.rules.push({
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: [{
        loader: 'babel-loader',
        query: {
            cacheDirectory: true,
            plugins: [
                'babel-plugin-transform-class-properties',
                '@babel/plugin-syntax-dynamic-import',
                [
                    '@babel/plugin-transform-runtime',
                    {
                        helpers: true,
                        regenerator: true
                    },
                ],
                [
                    'react-intl',
                    {
                        messagesDir: './src/messages/'
                    }
                ],
                [
                    'react-intl-auto',
                    {
                        removePrefix: 'src.views'
                    }
                ]
            ],
            presets: [
                '@babel/preset-react',
                ['@babel/preset-env', {
                    modules: false,
                    targets: 'cover 99.5% in US'
                }],
            ]
        }
    }, {
        loader: 'eslint-loader',
        options: {
            cache: true
        }
    }],
})

// Styles
// ------------------------------------
config.module.rules.push({
    test: /\.(sass|scss)$/,
    use: [
        {
            loader: __DEV__ ? 'style-loader' : MiniCssExtractPlugin.loader
        },
        {
            loader: 'css-loader',
            options: {
                modules: true
            }
        },
        'sass-loader'
    ]
});
config.plugins.push(new MiniCssExtractPlugin({
    filename: 'styles/[name].[contenthash].css',
    chunkFilename: 'styles/[id].css'
}));

// Images
// ------------------------------------
config.module.rules.push({
    test    : /\.(png|jpg|gif)$/,
    loader  : 'url-loader',
    options : {
        limit : 8192,
    },
})

// Fonts
// ------------------------------------
;[
    ['woff', 'application/font-woff'],
    ['woff2', 'application/font-woff2'],
    ['otf', 'font/opentype'],
    ['ttf', 'application/octet-stream'],
    ['eot', 'application/vnd.ms-fontobject'],
    ['svg', 'image/svg+xml'],
].forEach((font) => {
    const extension = font[0]
    const mimetype = font[1]

    config.module.rules.push({
        test    : new RegExp(`\\.${extension}$`),
        loader  : 'url-loader',
        options : {
            name  : 'fonts/[name].[ext]',
            limit : 10000,
            mimetype,
        },
    })
})

// HTML Template
// ------------------------------------
config.plugins.push(new HtmlWebpackPlugin({
    template: inProjectSrc('index.html'),
    inject: true,
    minify: {
        collapseWhitespace: true,
    },
}));

config.plugins.push(new WebpackPwaManifest({
    name: '{{ projectName }}',
    short_name: '{{ projectName }}',
    description: '{{ projectDescription }}',
    background_color: '#000000',
    theme_color: '#2ecc71',
    orientation: 'portrait',
    display: 'standalone',
    start_url: '/',
    crossorigin: 'use-credentials',
    icons: [{
        src: inProjectSrc('icons/splash.png'),
        size: 512
    }, {
        src: inProjectSrc('icons/icon.png'),
        size: 192
    }]
}));

// Development Tools
// ------------------------------------
if (__DEV__) {
    config.entry.main.push(
        `webpack-hot-middleware/client.js?path=${config.output.publicPath}__webpack_hmr`
    )
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin()
    )
}

// Bundle Splitting
// ------------------------------------
if (!__TEST__) {
    const bundles = ['normalize', 'manifest']

    if (project.vendors && project.vendors.length) {
        bundles.unshift('vendor')
        config.entry.vendor = project.vendors
    }
    config.optimization.splitChunks = {};
}

// Production Optimizations
// ------------------------------------
if (__PROD__) {
    config.plugins.push(new WorkboxPlugin.GenerateSW({
        swDest: 'sw.js',
        clientsClaim: true,
        skipWaiting: true,
        include: [/\.html$/, /\.js$/, /\.css$/, /\.ttf$/, /\.ico$/]
    }));

    config.optimization.minimizer = [
        new UglifyJsPlugin({
            sourceMap: !!config.devtool,
            cache: true,
            parallel: true,
            uglifyOptions: {
                warnings: false,
                ie8: false,
                compress: {
                    conditionals: true,
                    unused: true,
                    comparisons: true,
                    sequences: true,
                    dead_code: true,
                    evaluate: true,
                    if_return: true,
                    join_vars: true
                }
            }
        }),
        new OptimizeCSSAssetsPlugin({})
    ];
    config.plugins.push(
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
        })
    );
    config.plugins.push(
        new webpack.optimize.ModuleConcatenationPlugin()
    );
}

module.exports = config
