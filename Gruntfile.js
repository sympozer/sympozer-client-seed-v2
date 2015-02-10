'use strict';

module.exports = function (grunt)
{

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);


  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: {
      // file structure
      backend       : 'backend',
      frontend      : '',
      dist          : 'dist',
      test          : 'test',
      tmp           : '.tmp',
      app           : 'app',
      local_config  : grunt.file.readJSON('local-config.json'),
    },


    /****************************************************
     *
     *                    SERVER TASKS                 *
     *
     * *************************************************/
    shell  : {
      options           : {
        stdout: true
      },
      selenium          : {
        command: './selenium/start',
        options: {
          stdout: false,
          async : true
        }
      },
      protractor_install: {
        command: 'node ./node_modules/protractor/bin/webdriver-manager update',
        options: {
          stdout: true,
          async:true
        }
      },
      npm_install       : {
        command: 'npm install'
      }
    },

    //Open a navigator page displaying a choosen url
    open   : {
      devserver  : {
        path: 'localhost:9000',
        app : '<%= yeoman.local_config.defaultBrowser %>'
      },
      //production server access
      prodserver : {
        path: 'localhost:9001',
        app : '<%= yeoman.local_config.defaultBrowser %>'
      },
      //test server access
      testserver : {
        path: 'localhost:9003',
        app : '0.0.0.'
      },
      //admin interface access
      adminserver: {
        path: '<%= yeoman.local_config.serverRootPath %>' + 'sonata/admin'
      }
    },

    // The actual grunt server settings
    connect: {
      options   : {
        hostname  : 'localhost',
        livereload: 35729
      },
      devserver : {
        options: {
          base      : '<%= yeoman.app %>',
          port     : 9000,
          keepalive: true
        }
      },
      prodserver: {
        options: {
          base      : '<%= yeoman.dist %>',
          port     : 9001,
          keepalive: true
        }
      },
      testserver: {
        options: {
          base      : '<%= yeoman.dist %>',
          port     : 9002,
          keepalive: true
        }
      }
    },


    /****************************************************
     *
     *                     BOWER TASKS                 *
     *
     * *************************************************/

    //Launch bower install command
    'bower-install-simple': {
      options: {
        color: true,
        directory: "<%= yeoman.app %>/bower"

      },
      "prod" : {
        options: {
          production: true
        }
      },
      "dev"  : {
        options: {
          production: false
        }
      }
    },

    // Automatically inject Bower components souces (js / less / css) into the index.html
    bowerInstall : {
      app: {
        src : ['<%= yeoman.app %>/index.html']
      }
    },



    /****************************************************
     *
     *                    TESTING TASKS                *
     *
     * *************************************************/

    //Protractor task config
    protractor  : {
      options  : {
        keepAlive : true,
        configFile: '<%= yeoman.test %>' + '/protractor.conf.js',
        //debug : true
        // A base URL for your application under test. Calls to protractor.get()
        // with relative paths will be prepended with this.
        args      : {
          baseUrl          : 'http://localhost:9002',
          // The location of the selenium standalone server .jar file.
          seleniumServerJar: 'node_modules/protractor/selenium/selenium-server-standalone-2.42.2.jar',
          // attempt to find chromedriver using PATH.
          chromeDriver     : 'node_modules/protractor/selenium/chromedriver',
          capabilities     : {
            'browserName': 'chrome'
          }
        }
      },
      singlerun: {},
      auto     : {
        keepAlive: true
      }
    },


    //Karma unit test config
    karma       : {
      unit: {
        configFile: '<%= yeoman.test %>' + '/karma-unit.conf.js',
        autoWatch : false,
        singleRun : true
      }
    },




    // Empties folders to start fresh
    clean       : {
      dist  : {
        files: [
          {
            dot: true,
            src: [
              '<%= yeoman.tmp %>/*',
              '<%= yeoman.dist %>/*',
              '!<%= yeoman.dist %>/.git*'
            ]
          }
        ]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist   : {
        files: [
          {
            expand: true,
            cwd   : '<%= yeoman.tmp %>/assets/css/',
            src   : '{,*/}*.css',
            dest  : '<%= yeoman.tmp %>/assets/css/'
          }
        ]
      }
    },

    /****************************************************
     *
     *                    BUILD TASKS                  *
     *
     * *************************************************/

    // Renames files for browser caching purposes
    rev          : {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/assets/css/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html   : '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          html: {
            steps: {
              js : ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post : {}
          }
        }
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin       : {
      html   : ['<%= yeoman.dist %>/{,*/}*.html'],
      css    : ['<%= yeoman.dist %>/assets/css/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>']
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    cssmin       : {
      options: {
        // root: '<%= yeoman.app %>',
        relativeTo   : '<%= yeoman.app %>',
        processImport: true,
        noAdvanced   : true
      }
    },

    imagemin: {
      dist: {
        files: [
          {
            expand: true,
            cwd   : '<%= yeoman.app %>/assets/img',
            src   : '{,*/}*.{png,jpg,jpeg,gif}',
            dest  : '<%= yeoman.dist %>/assets/img'
          }
        ]
      }
    },

    svgmin: {
      dist: {
        files: [
          {
            expand: true,
            cwd   : '<%= yeoman.app %>/images',
            src   : '{,*/}*.svg',
            dest  : '<%= yeoman.dist %>/images'
          }
        ]
      }
    },

    htmlmin   : {
      options: {
        collapseBooleanAttributes:      false,
        collapseWhitespace:             true,
        removeAttributeQuotes:          true,
        removeComments:                 true, // Only if you don't use comment directives!
        removeEmptyAttributes:          true,
        removeRedundantAttributes:      true,
        removeScriptTypeAttributes:     true,
        removeStyleLinkTypeAttributes:  true
      },
      app    : {
        files: [
          {
            expand: true,
            cwd   : '<%= yeoman.app %>',
            src   : ['partials/**/*.html'],
            dest  : '<%= yeoman.dist %>/'
          }
        ]
      },
      modules    : {
        files: [
          {
            expand: true,
            cwd   : '<%= yeoman.app %>',
            src   : ['modules/**/*.html'],
            dest  : '<%= yeoman.dist %>/'
          }
        ]
      }
    },

    // ngmin tries to make the code safe for minification automatically by
    // using the Angular long form for dependency injection. It doesn't work on
    // things like resolve or inject so those have to be done manually.
    ngmin     : {
      dist: {
        files: [
          {
            expand: true,
            cwd   : '<%= yeoman.tmp %>/concat/scripts',
            src   : '*.js',
            dest  : '<%= yeoman.tmp %>/concat/scripts'
          }
        ]
      }
    },

    // Replace Google CDN references
    cdnify    : {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy      : {
      dist  : {
        files: [
          {
            expand: true,
            dot   : true,
            cwd   : '<%= yeoman.app %>',
            dest  : '<%= yeoman.dist %>',
            src   : [
              '*.{ico,png,txt}',
              '.htaccess',
              '*.html',
              'views/{,*/}*.html',
              'images/{,*/}*.{webp}',
              'fonts/*',
              'assets/**',
              'bower/font-awesome/fonts/*',
              'bower/bootstrap/fonts/*'
            ]
          },
          {
            expand: true,
            cwd   : '<%= yeoman.tmp %>/images',
            dest  : '<%= yeoman.dist %>/images',
            src   : ['generated/*']
          }
        ]
      },
      styles: {
        expand: true,
        cwd   : '<%= yeoman.app %>/assets/css',
        dest  : '<%= yeoman.tmp %>/assets/css',
        src   : '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'copy:styles'
      ],
      test  : [
        'connect:testserver',
        'protractor:singlerun'
      ],
      dist  : [
        'copy:styles',
        'copy:dist'
        // 'imagemin',
        // 'svgmin'
      ]
    },

    ngtemplates: {
      app: {
        src: '<%= yeoman.app %>/partials/**/*.html',
        dest: '<%= yeoman.dist %>/templates/app-templates.js',
        options: {
          url: function (url) {
//                        return  url.replace('frontend/.tmp/templates/app/', 'http://localhost/sympozer/frontend/dist/templates');
            return  url.replace('frontend/app/', 'http://localhost/frontend/dist/');
            //return url;
          },
          bootstrap: function (module, script) {
            return "angular.module('sympozerApp', []).run(['$templateCache', function ($templateCache) {\n" + script + "}])";
          }
        }
      },

      modules : {
        src: '<%= yeoman.app %>/modules/**/*.html',
        dest: '<%= yeoman.dist %>/templates/modules-templates.js',
        options: {
          url: function (url) {
            // return  url.replace('frontend/.tmp/templates/app/', 'http://localhost/sympozer/frontend/dist/templates');
            return  url.replace('frontend/app/', 'http://localhost/frontend/dist/');

            // return url;
          },
          bootstrap: function (module, script)
          {
            return "angular.module('sympozerApp', []).run(['$templateCache', function ($templateCache) {\n" + script + "}])";
          }
        }
      }
    },

    less       : {

      server: {
        options: {
          // strictMath: true,
          dumpLineNumbers  : true,
          sourceMap        : true,
          sourceMapRootpath: "",
          outputSourceFiles: true
        },
        files  : [
          {
            expand: true,
            cwd   : "<%= yeoman.app %>/assets/less",
            src   : "styles.less",
            dest  : "<%= yeoman.tmp %>/assets/css",
            ext   : ".css"
          }
        ]
      },
      dist  : {
        options: {

          compress: true,
          yuicompress: false,
          optimization: 2,
          cleancss:true,
          paths: ["css"],
          syncImport: false,
          strictUnits:false,
          strictMath: true,
          strictImports: true,
          ieCompat: false,
          report  : 'min'
        },
        files  : [
          {
            expand: true,
            cwd   : "<%= yeoman.app %>/assets/less",
            src   : "styles.less",
            dest  : "<%= yeoman.dist %>/assets/css",
            ext   : ".css"
          }
        ]
      }
    },

    processhtml: {
      options: {
        commentMarker: 'prochtml',
        process      : true
      },
      dist   : {
        files: {
          '<%= yeoman.dist %>/index.html': ['<%= yeoman.dist %>/index.html']
        }
      }
    },
    uglify     : {
      options: {
        mangle: false
      }
    }

  });

  /************************* TASKS CHAINS *******************************************/


  /** INSTALL **/
  grunt.registerTask('install', ['update_dependencies', 'shell:protractor_install']);

  /** TEST **/
    //single run tests
  grunt.registerTask('test', ['test:unit', 'test:e2e']);
  grunt.registerTask('test:unit', ['karma:unit']);
  grunt.registerTask('test:e2e', ['protractor:singlerun' ]);



  /** DEVELOPMENT **/
  grunt.registerTask('update_dependencies', ['bower-install-simple', 'bowerInstall']);
  grunt.registerTask('dev', ['update_dependencies', 'open:devserver', 'connect:devserver']);
  grunt.registerTask('prod', ['update_dependencies', 'build', 'open:prodserver', 'connect:prodserver']);


  /** PRODUCTION **/
  grunt.registerTask('build', [
    //Empty dist folder
    'clean:dist',
    //Install bower dependencies
    'bowerInstall',
    //Compile html template files (remove comments etc..) and append to Dist dir
    'htmlmin:app',
    //Compile module html template files (remove comments etc..) and append to Dist dir
    'htmlmin:modules',
    //Read the index.html build markup
    'useminPrepare',
    'concurrent:dist',
    //Compile less files to css
    'less:dist',
    'autoprefixer',
    'concat',
    'ngmin',
    'copy:dist',
    // 'cdnify',
    'cssmin',
    'uglify',
//        'rev',
    'usemin',
    'imagemin',
    'processhtml:dist'
  ]);

  grunt.registerTask('default', [
    'install'
  ]);

};