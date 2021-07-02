const {task, src, dest} = require("gulp");
const sass = require("gulp-sass")(require('sass'));
const postcss = require("gulp-postcss");
const sourcemaps = require("gulp-sourcemaps");
const gulpIf = require('gulp-if');
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const concat = require("gulp-concat");

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

task("styles", () => src("src/styles/**/*.scss")
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(sass({outputStyle: "compressed"}).on("error", sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(concat('index.min.css'))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(dest('dist'))
    // .pipe(browserSync.stream())
);
