const {task, src, dest, watch, series, parallel} = require("gulp");
const sass = require("gulp-sass")(require('sass'));
const postcss = require("gulp-postcss");
const sourcemaps = require("gulp-sourcemaps");
const gulpIf = require('gulp-if');
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const concat = require("gulp-concat");
const htmlmin = require("gulp-htmlmin");
const browserSync = require("browser-sync").create();
const del = require("del");
const imagemin = require("gulp-imagemin");
const ghpages = require("gh-pages");

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
const distDirectory = "dist";

task("styles", () => src("src/styles/**/*.scss")
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(sass({outputStyle: "compressed"}).on("error", sass.logError))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(concat('index.min.css'))
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(dest('dist'))
        .pipe(browserSync.stream())
);

task("html",  () => src("src/index.html")
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest(distDirectory))
);

task("img", () => src("src/images/*")
    .pipe(imagemin())
    .pipe(dest(distDirectory + "/images"))
);

task("watch", () => {
    browserSync.init({
        server: {
            baseDir: distDirectory,
        },
    });
    watch("src/styles/**/*.scss", series("styles"));
    watch("src/index.html", series("html")).on("change", browserSync.reload);
});

task("clean", () => del(distDirectory));

task("git-publish", callback => {
    ghpages.publish(distDirectory, callback);
});

task("build", series("clean", parallel("html", "styles", "img")));
task("deploy", series("build", "git-publish"));
task("default", series("build", "watch"));
