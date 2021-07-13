const { task, src, dest, watch, series, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const sourcemaps = require("gulp-sourcemaps");
const gulpIf = require("gulp-if");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const concat = require("gulp-concat");
const htmlmin = require("gulp-htmlmin");
const browserSync = require("browser-sync").create();
const del = require("del");
const imagemin = require("gulp-imagemin");
const ghpages = require("gh-pages");
const inject = require("gulp-inject");
const ttf2woff2 = require("gulp-ttf2woff2");
const ttf2woff = require("gulp-ttf2woff");

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
const directories = {
  html: "src/index.html",
  scss: "src/styles/**/*.scss",
  images: "src/images/*",
  fonts: "src/fonts",
  favicon: "src/favicon",
  dist: "dist"
};

task("styles", () => src(directories.scss)
  .pipe(gulpIf(isDevelopment, sourcemaps.init()))
  .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
  .pipe(postcss([autoprefixer(), cssnano()]))
  .pipe(concat("index.min.css"))
  .pipe(gulpIf(isDevelopment, sourcemaps.write()))
  .pipe(dest(directories.dist))
  .pipe(browserSync.stream())
);

task("html", () => src(directories.html)
  .pipe(inject(src(`${directories.dist}/*.css`, { read: false }), {
    addRootSlash: false,
    ignorePath: directories.dist
  }))
  .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
  .pipe(dest(directories.dist))
);

task("img", () => src(directories.images)
  .pipe(imagemin())
  .pipe(dest(`${directories.dist}/images`))
);

task("ttf2woff2", () => src(`${directories.fonts}/**/*.ttf`)
  .pipe(ttf2woff2())
  .pipe(dest(directories.fonts))
);

task("ttf2woff", () => src(`${directories.fonts}/**/*.ttf`)
  .pipe(ttf2woff())
  .pipe(dest(directories.fonts))
);

task("generate-fonts", parallel("ttf2woff2", "ttf2woff"));

task("fonts", () => src(`${directories.fonts}/**/*.{ttf,woff,woff2,eot,svg}`).pipe(dest(`${directories.dist}/fonts`)));

task('favicon', () => src(`${directories.favicon}/**/*`).pipe(dest(`${directories.dist}/favicon`)))

task("watch", () => {
  browserSync.init({
    server: {
      baseDir: directories.dist
    }
  });
  watch(directories.scss, series("styles"));
  watch(directories.html, series("html")).on("change", browserSync.reload);
});

task("clean", () => del(directories.dist));

task("git-publish", callback => {
  ghpages.publish(directories.dist, callback);
});

task("build", series("clean", parallel(series("styles", "html"), "img", "fonts", "favicon")));
task("deploy", series("build", "git-publish"));
task("default", series("build", "watch"));
