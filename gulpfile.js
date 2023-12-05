const gulp = require("gulp");
const glupts = require("gulp-typescript");
const glupSourcemaps = require("gulp-sourcemaps");
const gulpWebpack = require("webpack-stream");
const webpack = require('webpack');
const merge = require("merge2");
const path = require("path");

gulp.task("build", () => {
    gulp.src('./src/**/*.js')
        .pipe(gulp.dest('dist/'));
    gulp.src('./src/**/*.json')
        .pipe(gulp.dest('dist/'));
    gulp.src('./src/**/*.png')
        .pipe(gulp.dest('dist/'));
    gulp.src('./src/**/*.ttf')
        .pipe(gulp.dest('dist/'));
    gulp.src(['./app/**/*.*', '!./app/**/*.ts'])
        .pipe(gulp.dest('dist/app/'));

    const appProject = glupts.createProject('tsconfig.json');
    const appCompile = gulp.src('./src/**/*.ts')
        .pipe(glupSourcemaps.init())
        .pipe(appProject());

    const renderCompile = gulp.src('./app/index.tsx')
        .pipe(gulpWebpack({
            mode: 'development',
            target: 'electron-renderer',
            module: {
                rules: [{
                    loader: 'ts-loader',
                    exclude: [/node_modules/, /src/]
                },]
            },
            resolve: {
                modules: ['node_modules', 'app'],
                extensions: ['.tsx', '.ts', '.js']
            },
            output: {
                filename: 'app.js'
            },
            devtool: 'inline-source-map'
        }, webpack))

    return merge([
        appCompile.js
            .pipe(glupSourcemaps.write({
                sourceRoot: (file) => {
                    return path.relative(path.join(file.cwd, file.path), file.base);
                }
            }))
            .pipe(gulp.dest('dist/')),
        renderCompile
            .pipe(gulp.dest('dist/app/'))
    ]);
});
