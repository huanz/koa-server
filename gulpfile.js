var path = require('path');
var fs = require('fs-extra');
var gulp = require('gulp');
var tinypng = require('gulp-tinypng-compress');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cleancss = require('gulp-clean-css');
var watch = require('gulp-watch');
var replace = require('gulp-replace');
var UglifyJS = require("uglify-js");
var optimizeJs = require('optimize-js');
var browserSync = require('browser-sync');
var clean = require('gulp-clean');
var gulpIgnore = require('gulp-ignore');
var cssimport = require("gulp-cssimport");
var nodemon = require('gulp-nodemon');

var projectDir = './public/';
var srcDir = projectDir;
var distDir = './dist/';
var config = {
    html: srcDir + '**/*.html',
    sass: [srcDir + 'sass/**/*.scss', '!' + srcDir + 'sass/**/_*.scss'],
    img: srcDir + 'img/**/*.{png,jpg,jpeg}',
    css: srcDir + 'css',
    dist: {
        img: distDir + 'img',
        css: distDir + 'css',
        script: distDir + 'script',
        html: distDir
    }
}

gulp.task('image', function () {
    return gulp.src(config.img)
        .pipe(tinypng({
            key: (function () {
                var keys = [
                    'xMYaN3BaIQv4U11qMTiKSHiRle-4CcQJ',
                    'cXrHaVpfUyAxJETKGXUqXtMLkv6OXnSm',
                    '2AkR2IApbA5LE7kIjkDczQxyahpOF4Sp',
                    'v6aTztRcc56bCfGmvUf5H9o2lsK5UvK3'
                ];
                return keys[Math.floor(Math.random() * keys.length)];
            })(),
            sigFile: srcDir + 'img/.tinypng-sigs',
            log: true,
            sameDest: false,
            summarise: true
        }))
        .pipe(gulp.dest(config.dist.img));
});

gulp.task('sass', function () {
    return gulp.src(config.sass)
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(cssimport({
            extensions: ['css']
        }))
        .pipe(autoprefixer({
            browsers: [
                'safari >= 7',
                'ios >= 7',
                'android >= 2.3'
            ]
        }))
        .pipe(cleancss({
            level: {
                1: {
                    specialComments: 0
                }
            }
        }))
        .pipe(gulp.dest(config.css));
});

gulp.task('build:sass', function () {
    return gulp.src(config.sass)
        .pipe(sass().on('error', sass.logError))
        .pipe(cssimport({
            extensions: ['css']
        }))
        .pipe(autoprefixer({
            browsers: [
                'safari >= 7',
                'ios >= 7',
                'android >= 2.3'
            ]
        }))
        .pipe(cleancss({
            level: {
                1: {
                    specialComments: 0
                }
            }
        }))
        .pipe(gulp.dest(config.dist.css));
});

var regjs = /<script\s+.*?src="([^"]+.js).*"?><\/script>/gi;
var regscript = /<script\s*(^|src)*?>[\s\S]*?<\/script>/gi;
var regsrc = /\s*src="(\S+)"/gi;
var regbuild = /<!--\s*build[\s\S]*?-->[\s\S]*?<!--\s*endbuild\s*-->/;
var concatFiles = [];
gulp.task('build:html', function () {
    return gulp.src(config.html)
        .pipe(replace(regscript, function ($1) {
            /**
             * @desc 内嵌js压缩 <script>...</script>
             */
            var start = '';
            $1.replace(/^<script\s*[\s\S]*?>/, function (s) {
                start = s;
                return '';
            });
            var result = UglifyJS.minify($1.replace(/^<script>/, '').replace(/<\/script>$/, ''), {
                fromString: true,
                compress: {
                    drop_console: true
                }
            });
            return start + result.code + '</script>';
        }))
        .pipe(replace(regbuild, function ($1) {
            /**
             * @desc js合并：<!-- build path=js/libs/lib.index.min.js -->...<!-- endbuild -->
             */
            var filePath = $1.match(/^<!--\s*build\s*path=(\S+)[\s\S]*-->/)[1];
            var src = []
            var scripts = $1.match(regsrc);
            if (scripts.length) {
                scripts.forEach(function (s) {
                    var tmp = s.match(/"(\S+)"/)[1];
                    src.push(path.join(srcDir, tmp));
                    concatFiles.push(tmp.replace('./script/', ''));
                });
                fs.outputFile(path.join(distDir, filePath), optimizeJs(UglifyJS.minify(src).code), function () {

                });
                return '<script src="' + filePath + '"></script>';
            }
            return $1;
        }))
        .pipe(replace(regjs, function ($1) {
            /**
             * @desc 外链js压缩 <script src="..."></script> 忽略.min.js文件以及http://或//开头的外部文件
             */
            var url = '';
            var src = $1.match(/src="((?!https?:\/\/|\/\/)\S+)"/);
            if (src && src[1]) {
                src = src[1];
                var parsed = path.parse(src);
                var filename = path.join(parsed.dir, parsed.name);
                if (!filename.endsWith('.min')) {
                    fs.outputFileSync(distDir + filename + '.min.js', optimizeJs(UglifyJS.minify(srcDir + filename + '.js').code));
                    return $1.replace(src, path.join(parsed.dir, parsed.name + '.min.js'));
                }
                return $1;
            }
            return $1;
        }))
        .pipe(gulp.dest(config.dist.html));
});

gulp.task('copy:js', function () {
    return gulp.src(srcDir + 'script/**/*.min.js')
        .pipe(gulpIgnore.exclude(concatFiles))
        .pipe(gulp.dest(config.dist.script));
});

gulp.task('clean', function () {
    return gulp.src(distDir, {
            read: false
        })
        .pipe(clean());
});

gulp.task('copy:modules', function () {
    var videos = [
        './node_modules/video.js/dist/*.{css,js,swf}',
        './node_modules/videojs-contrib-hls/dist/*.js'
    ];
    gulp.src(videos).pipe(gulp.dest(srcDir + 'video'));

    gulp.src([
        './node_modules/photoswipe/dist/*.min.js',
    ]).pipe(gulp.dest(srcDir + 'script'));
    gulp.src('./node_modules/photoswipe/src/css/**/*').pipe(gulp.dest(srcDir + 'sass/photoswipe'));
});

gulp.task('build', ['image', 'build:sass', 'build:html'], function () {
    gulp.start('copy:js');
});

gulp.task('default', function () {
    gulp.watch(config.sass[0], ['sass']);
    nodemon({
        script: './src/server.js',
        ext: 'js json',
        watch: ['src/'],
        ignore: ['.git', 'node_modules']
    });
});