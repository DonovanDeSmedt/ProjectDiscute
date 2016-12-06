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
    basePath: '../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
    'bower_components/angular/angular.min.js',
    'bower_components/angular-mocks/angular-mocks.js',
    'bower_components/angular-ui-router/release/angular-ui-router.min.js',
    'bower_components/angular-cookies/angular-cookies.min.js',
    'bower_components/angular-resource/angular-resource.min.js',
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
    'bower_components/karma-read-json/karma-read-json.js',
    'bower_components/angular-touch/angular-touch.min.js',
    'bower_components/ng-file-upload/ng-file-upload-all.min.js',
    'client/lib/ng-img-crop.js',

    // 'client/js/app.js',

    // // Controllers
    // '../client/js/home/home.controller.js',

    // // Services
    // '../client/js/services/authentication.service.js',
    // '../client/js/services/module.service.js',

    // // Test files
    // // './*.js',
    // // '../client/js/test/app_test.js',
    // 'client/js/services/index.service.js',
    'client/js/services/authentication.service.js',
    'client/js/services/module.service.js',
    'client/js/services/profile.service.js',
    // 'client/js/home/home.controller.js',
    // 'client/test/users.js',


    /*Tests*/
    '../Discute/client/test/dmodule_test.js',
    '../Discute/client/test/profileService_test.js',
    // 'client/test/homeController_test.js',

    /*JSON fixture*/
    { pattern: 'client/test/*.json', watched: false, included: false, served: true}

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
