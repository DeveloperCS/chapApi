const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'development',
    target: 'node',
    entry: './index.ts',
    externals: [nodeExternals()],
    module: {
        rules: [{
            test: /\.(js)$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader"
            }
        }, {
            test: /\.(ts)$/,
            use: [{
                loader: 'ts-loader'
            }],
            exclude: /node_modules/
        }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    }
};