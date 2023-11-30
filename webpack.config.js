const path = require('path');

module.exports = {
    mode: 'development',
    entry: './app/index.tsx',
    module: {
        rules: [{
            loader: 'ts-loader',
            exclude: [/node_modules/, /src/]
        },]
    },
    resolve: {
        modules: ['node_modules', 'app'],
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, 'dist/app'),
        filename: 'app.js'
    },
    devtool: 'inline-source-map',
};