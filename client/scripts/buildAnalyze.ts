import { webpack } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import { config } from './webpack.config';

const webpackConfig = config({ isProduction: true });

const compiler = webpack({
    ...webpackConfig,
    optimization: {
        ...webpackConfig.optimization,
        concatenateModules: false,
    },
    plugins: [
        ...webpackConfig.plugins!,
        new BundleAnalyzerPlugin(),
    ],
});

compiler.run(error => {
    if (error) {
        throw error;
    }

    compiler.close(error => {
        if (error) {
            throw error;
        }
    });
});
