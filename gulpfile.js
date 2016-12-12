var gulp = require('gulp');
var ts = require('gulp-typescript');
var mocha = require('gulp-mocha');

var sourcemaps = require('gulp-sourcemaps');
var tslint = require("gulp-tslint");
var merge = require('merge2');

var concat = require('gulp-concat');


var tsProject = ts.createProject('./tsconfig.json');
var path = {
	build: {
		outputFile: "app.js",
		outputDTFile: "app.dt.js",
		current: "build"
	},
	source: {
		current: ["source/Observer3.ts", "source/LiteEvent.ts"],
		rootTarget: "../source",
	}
};

gulp.task('build', function () {
	return gulp.src(path.source.current)
		.pipe(sourcemaps.init({ loadMaps: true }))
		//.pipe(tslint())
		.pipe(ts(tsProject))
		.pipe(concat(path.build.outputFile))
		.pipe(sourcemaps.write(".", {
			includeContent: false,
			sourceRoot: path.source.rootTarget
		}))
		.pipe(gulp.dest(path.build.current));
});


gulp.task('default', ['build']);