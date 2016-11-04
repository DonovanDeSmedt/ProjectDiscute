// Karma configuration
// Generated on Fri Oct 21 2016 08:52:58 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({

    plugins: [
    'karma-jasmine',
    'karma-chrome-launcher',
    'karma-phantomjs-launcher'
    ],

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
    '../client/js/lib/angular.js',
    '../client/js/lib/angular-mocks.js',
    '../client/js/lib/angular-ui-router.min.js',
    '../client/js/lib/ng-img-crop.js',
    '../client/js/lib/ng-file-upload.js',
    '../client/js/lib/angular-touch.min.js',
    '../client/js/lib/angular-cookies.min.js',
    '../client/js/lib/angular-resource.min.js',
    '../client/js/lib/ng-file-upload-shim.js',
    '../client/js/lib/angular-resource.min.js',
    '../client/js/lib/jquery-3.0.0.min.js',
    
    '../client/js/lib/autosize.min.js',


    '../client/js/app.js',

    // Controllers
    '../client/js/controller/home.controller.js',

    // Services
    '../client/js/services/authentication.service.js',
    '../client/js/services/module.service.js',

    // Test files
    './*.js',
    '../client/js/test/app_test.js',
    // '../client/js/test/homeController_test.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
})
}
