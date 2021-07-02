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
const directories = {
    html: "src/index.html",
    scss: "src/styles/**/*.scss",
    images: "src/images/*",
    dist: "dist"
}

task("styles", () => src(directories.scss)
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(sass({outputStyle: "compressed"}).on("error", sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(concat('index.min.css'))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
);

task("html", () => src(directories.html)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(dest(directories.dist))
);

task("img", () => src(directories.images)
    .pipe(imagemin())
    .pipe(dest(directories.dist + "/images"))
);

task("watch", () => {
    browserSync.init({
        server: {
            baseDir: directories.dist,
        },
    });
    watch(directories.scss, series("styles"));
    watch(directories.html, series("html")).on("change", browserSync.reload);
});

task("clean", () => del(directories.dist));

task("git-publish", callback => {
    ghpages.publish(directories.dist, callback);
});

task("build", series("clean", parallel("html", "styles", "img")));
task("deploy", series("build", "git-publish"));
task("default", series("build", "watch"));
