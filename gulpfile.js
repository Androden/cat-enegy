const gulp = require('gulp');
const plumber = require('gulp-plumber'); // Убирает ошибочный код, при этом сборка не ломается, код продолжает работать
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass")(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const csso = require('postcss-csso'); // минификатор CSS
const rename = require("gulp-rename");
const htmlmin = require("gulp-htmlmin");
const terser = require("gulp-terser"); // минификатор JS
//const squoosh = require("gulp-libsquoosh");//для оптимизации изображений
// const webp = require("gulp-webp"); // Конвертирует изображения в webp
//const svgstore = require("gulp-svgstore");// Делает SVG-спрайты
//const del = require("del"); // Удаляет файлы и директории
const sync = require("browser-sync").create(); // Синхронизация CSS в браузере, в режиме реального времени

// Styles
const styles = () => {
  return gulp.src('source/sass/style.scss') // находит нужный файл и передаёт его дальше
    //.pipe — функция, в которую нужно передать результат предыдущей функции
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([ // перерабатывает css файл
      autoprefixer(),
      csso()
    ]))
    //.pipe(gulp.dest('source/css', { sourcemaps: '.' })) // Указывает куда сохронять результат. Позволяет просматриавать SCSS в браузере, в DevTools
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// HTML
const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
}

// Scripts
// const scripts = () => {
//   return gulp.src("source/js/app.js")
//     .pipe(terser())
//     .pipe(rename("app.min.js"))
//     .pipe(gulp.dest("build/js"))
//     .pipe(sync.stream());
// }
//
//exports.scripts = scripts;

//Images
// const optimizeImages = () => {
//   return gulp.src("source/img/**/*.{png,jpg,svg}")
//     .pipe(squoosh())
//     .pipe(gulp.dest("build/img"))
// }

// exports.images = optimizeImages;

const copyImages = () => {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(gulp.dest("build/img"))
}

exports.images = copyImages;

// Webp
// const createWebp = () => {
//   return gulp.src("source/img/**/*.{jpg,png}")
//     .pipe(webp({quality: 90}))
//     .pipe(gulp.dest("build/img"))
// }
//
//exports.createWebp = createWebp;

//SVG-sprite
// const sprite = () => {
//   return gulp.src("source/img/icons/*.svg")
//     .pipe(svgstore({
//       inlineSvg: true
//     }))
//     .pipe(rename("sprite.svg"))
//     .pipe(gulp.dest("build/img"));
// }
//
//exports.sprite = sprite;

const copy = (done) => {
  gulp.src([
    "source/fonts/*.{woff2,woff}",
    "source/*.ico",
    "source/img/**/*.{jpg,png,svg}",
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"))
  done();
}

//Clean
// const clean = () => {
//   return del("build");
// };

// Server
const server = (done) => {
  sync.init({
    server: {
      baseDir: 'source'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Reload
const reload = (done) => {
  sync.reload();
  done();
}

// Watcher
const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch("source/*.html", gulp.series(html, reload));
  //gulp.watch("source/js/app.js", gulp.series(scripts));
}

const build = gulp.series(
  //clean,
  copy,
  // optimizeImages,
  gulp.parallel(
    styles,
    html,
    //scripts
    // sprite,
    //createWebp
  ),
);

exports.build = build;


// Default

exports.default = gulp.series(
  //clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    //scripts,
    //sprite,
    //createWebp
  ),
  gulp.series(
    server,
    watcher
  )
);



