const gulp = require('gulp');
const ghpages = require('gh-pages');
const gulpDocumentation = require('gulp-documentation');

gulp.task('documentation-multiple-files', function () {
    return gulp.src('./src/*.js')
        .pipe(gulpDocumentation('md'))
        .pipe(gulp.dest('md-documentation'));
});

gulp.task('default', () => {
    ghpages.publish(path.join(__dirname, 'docs'));

});