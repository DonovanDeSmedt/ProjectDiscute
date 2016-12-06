
module.exports = function(grunt){


  require("load-grunt-tasks")(grunt);

	// Define the configuration for all the tasks
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),


    uglify: {
      options: {
        mangle: false,
        compress: true,
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>'],
        }
      }
    },
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'client/css',
          src: ['app.css', '!*.min.css'],
          dest: 'client/css',
          ext: '.min.css'
        }]
      }
    },

    jshint: {
      files: ["client/js/**/*.js"],
      options: {
        "curly": true,
        "eqeqeq": true,
        "undef": true,
        "unused": "vars",
        "esnext":true,
        "devel":true,
        "node":true,
        "noyield":true
      }
    },

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['client/dist/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },



    babel: {
      options: {
        sourceMap: false,
        presets: ['es2015']
      },
      dist: {
        files: [{
         expand: true,
          cwd: 'client/js',
          src: ['**/*.js'],
          dest: 'client/dist'
        }]
      }
    },
    nodemon: {
      dev: {
        script: 'server.js'
      }
    },
    browserSync: {
      bsFiles: {
        src : [
          'client/js/**/*.js',
          'client/css/*.css'
        ]
      }
    },

    watch: {
      files: ['client/js/**/*.js'],
        tasks: ['jshint']
      }
    });



  	grunt.loadNpmTasks('grunt-babel');
  	grunt.loadNpmTasks('grunt-contrib-uglify');
  	grunt.loadNpmTasks('grunt-nodemon');
  	grunt.loadNpmTasks('grunt-ngmin');
    // grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['nodemon:dev', 'watch', 'jshint']);
    grunt.registerTask('min', ['babel','concat','uglify', 'cssmin', 'nodemon:dev']);
};




