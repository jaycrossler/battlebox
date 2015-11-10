// Generated on <%= (new Date).toISOString().split('T')[0] %> using
// <%= pkg.name %> <%= pkg.version %>
'use strict';
//TODO: Not initializing engine during Jasmine test

var libraryFiles = ['js/maths.js', 'js/helpers.js'];
var projectFiles = [ 'js/battlebox.js', 'js/battlebox-*.js'];
var dropbox_root = '/Users/jcrossler/Dropbox/Public/sites/battlebox/';
var cordova_root = '/Users/jcrossler/Sites/battlebox-mobile/';

var allFiles = libraryFiles.concat(projectFiles);

module.exports = function (grunt) {

    var banner = '/*\n' +
        '------------------------------------------------------------------------------------\n' +
        '-- <%= pkg.name %>.js - v<%= pkg.version %> - Built on <%= grunt.template.today("yyyy-mm-dd") %> by <%= pkg.author %> using Grunt.js\n' +
        '------------------------------------------------------------------------------------\n' +
        '-- Using rot.js (ROguelike Toolkit) which is Copyright (c) 2012-2015 by Ondrej Zara \n' +
        '-- Packaged with color.js - Copyright (c) 2008-2013, Andrew Brehaut, Tim Baumann,  \n' +
        '--                          Matt Wilson, Simon Heimler, Michel Vielmetter \n' +
        '-- colors.js - Copyright 2012-2013 Matt Jordan - https://github.com/mbjordan/Colors \n' +
        '------------------------------------------------------------------------------------\n' +
        '*/\n';

    // Project configuration.
    var config = {
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: '\n',
                banner: banner
            },
            build: {
                src: allFiles,
                dest: 'build/<%= pkg.name %>-<%= pkg.version %>.js'
            },
            quick: {
                src: allFiles,
                dest: 'build/<%= pkg.name %>.min.js'
            }

        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %>.js - <%= pkg.name %>, Minified on <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                sourceMap: true
            },
            build: {
                src: 'build/<%= pkg.name %>-<%= pkg.version %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        jasmine: {
            build: {
                src: 'build/<%= pkg.name %>.min.js',
                options: {
                    specs: 'tests/*.spec.js',
                    helpers: 'tests/helpers/*.js',
                    vendor: [
                        "js-libs/rot.js",
                        "js-libs/jquery-1.11.3.min.js",
                        "js-libs/bootstrap.min.js",
                        "js-libs/colors.min.js",
                        "js-libs/color.js",
                        "js-libs/underscore-min.js",
                        "js-libs/underscore.string.min.js"
                    ]
                }
            }
        },
        shell: {
            emulate: {
                command: 'cd ' + cordova_root + ' && cordova build && cordova emulate'
            },
            emulate_ios: {
                command: 'cd ' + cordova_root + ' && cordova build ios && cordova emulate ios'
            },
            run: {
                command: 'cd ' + cordova_root + ' && cordova build && cordova run'
            }
        },
        notify: {
            build: {
                options: {
                    title: "<%= pkg.name %> Compiled",
                    message: "Files saved and minified and merged"
                }
            },
            quick: {
                options: {
                    title: "<%= pkg.name %> Quick Compiled",
                    message: "Files merged"
                }
            },
            helpers: {
                options: {
                    title: "Helpers",
                    message: "Tests passed"
                }
            }

        },
        watch: {
            avatar: {
                files: ['**/*.js'],
                tasks: ['concat:quick']
            }
        },
        connect: {
            server: {
                options: {
                    port: 9001
                }
            },
            live: {
                options: {
                    keepalive: true,
                    port: 9002
                }
            }
        },
        copy: {
            dropbox: {
                files: [
                    {expand: true, src: ['build/**'], dest: dropbox_root},
                    {expand: true, src: ['css/**'], dest: dropbox_root},
                    {expand: true, src: ['examples/**'], dest: dropbox_root},
                    {expand: true, src: ['images/**'], dest: dropbox_root},
                    {expand: true, src: ['js/**'], dest: dropbox_root},
                    {expand: true, src: ['js-libs/**'], dest: dropbox_root},
                    {expand: false, src: ['index.html'], dest: dropbox_root}
                ]
            },
            cordova: {
                files: [
                    {expand: true, src: ['build/**'], dest: cordova_root + 'www/'},
                    {expand: true, src: ['css/**'], dest: cordova_root + 'www/'},
                    {expand: true, src: ['examples/**'], dest: cordova_root + 'www/'},
                    {expand: true, src: ['images/**'], dest: cordova_root + 'www/'},
                    {expand: true, src: ['js/**'], dest: cordova_root + 'www/'},
                    {expand: true, src: ['js-libs/**'], dest: cordova_root + 'www/'},
                    {expand: false, src: ['index.html'], dest: cordova_root + 'www/'}
                ]
            }

        },
        replace: {
            version: {
                src: ['js/<%= pkg.name %>.js'],
                overwrite: true,
                replacements: [
                    {
                        from: new RegExp("version = '(.*?)',"),
                        to: "version = '<%= pkg.version %>',"
                    },
                    {
                        from: new RegExp("summary = '(.*?)',"),
                        to: "summary = '<%= pkg.summary %>',"
                    }
                ]
            },
            index: {
                src: ['index.html'],
                overwrite: true,
                replacements: [
                    {
                        from: new RegExp('<.*?id="summary".*?>(.*?)</.*?>'),
                        to: '<h2 id="summary"><%= pkg.summary %></h2>'
                    },
                    {
                        from: new RegExp('<.*?id="description".*?>(.*?)</.*?>'),
                        to: '<p id="description" class="lead"><%= pkg.description %></p>'
                    },
                    {
                        from: new RegExp('<button.*?id="version".*?>(.*?)</button>'),
                        to: '<button type="button" class="btn btn-info btn-xs" id="version">version <%= pkg.version %></button>'
                    }
                ]
            }
        }
    };
    grunt.initConfig(config);

    // Load the plugin that provides the tasks.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
//    grunt.registerTask('default', ['replace:index', 'replace:version', 'concat:build', 'uglify:build', 'notify:build']);
    grunt.registerTask('default', ['replace:index', 'replace:version', 'concat:build', 'uglify:build', 'jasmine:build', 'notify:build', 'connect:server']);
    grunt.registerTask('quick', ['concat:quick', 'notify:quick', 'jasmine:build']);
    grunt.registerTask('server', ['concat:quick', 'notify:quick', 'connect:live']);
    grunt.registerTask('ios', ['copy:cordova', 'shell:emulate_ios']);

    grunt.registerTask('dropbox', ['copy:dropbox']);

    grunt.task.run('notify_hooks');
};