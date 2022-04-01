import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { Configuration, EnvironmentPlugin } from 'webpack';
import { InjectManifest } from 'workbox-webpack-plugin';

import { paths } from './paths';

function isTruthy<T>(value: false | T): value is T {
    return !!value === true;
}

interface ConfigOptions {
    isProduction: boolean;
    isDemo?: boolean;
}

export function config({ isProduction, isDemo }: ConfigOptions): Configuration {
    const isDevelopment = !isProduction;

    return {
        mode: isProduction ? 'production' : 'development',
        bail: isProduction,
        devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
        entry: path.resolve(paths.src, 'index.tsx'),
        output: {
            path: paths.dist,
            filename: 'static/js/[name].[contenthash:8].js',
            chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
            publicPath: '/',
            devtoolModuleFilenameTemplate: isProduction
                ? (info: any) => path
                    .relative(paths.src, info.absoluteResourcePath)
                    .replace(/\\/g, '/')
                : (info: any) => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
        },
        cache: {
            type: 'filesystem',
            buildDependencies: {
                defaultWebpack: ['webpack/lib/'],
                config: [__filename],
                tsconfig: [paths.tsconfig],
            },
        },
        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        ecma: 2020 as const,
                    },
                }),
                new CssMinimizerPlugin(),
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        module: {
            rules: [{
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: [
                            '@babel/preset-env',
                            [
                                '@babel/preset-react',
                                {
                                    development: isDevelopment,
                                    runtime: 'automatic',
                                },
                            ],
                            '@babel/preset-typescript',
                        ],
                        plugins: [
                            isDevelopment &&'react-refresh/babel',
                            [
                                'babel-plugin-styled-components',
                                {
                                    ssr: false,
                                    fileName: false,
                                },
                            ],
                        ].filter(Boolean),
                    },
                },
            }, {
                test: /\.css$/,
                use: [
                    isDevelopment && 'style-loader',
                    isProduction && MiniCssExtractPlugin.loader,
                    'css-loader',
                ].filter(isTruthy),
            }],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.resolve(paths.public, 'index.html'),
            }),
            isDevelopment && new ReactRefreshWebpackPlugin(),
            isProduction && new MiniCssExtractPlugin({
                filename: 'static/css/[name].[contenthash:8].css',
                chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
            }),
            isProduction && new InjectManifest({
                swSrc: path.resolve(paths.src, 'serviceWorker.ts'),
                exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
            }),
            new ForkTsCheckerWebpackPlugin({
                typescript: {
                    mode: 'write-references',
                    configFile: paths.tsconfig,
                },
                logger: 'webpack-infrastructure',
            }),
            new EnvironmentPlugin({
                HITPOINTS_DEMO: !!isDemo,
            }),
        ].filter(isTruthy),
    };
}
