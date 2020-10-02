module.exports = function(grunt) {

	grunt.initConfig({
		browserify: {
			js: {
				files: {
					'dist/vendor.js': 'src/app/vendor.js',
					'dist/app.js': 'src/app/index.js'
				}
			}
		},
		uglify: {
			build: {
				options: {
					mangle: true,
					compress: {}
				},
				files: {
					'dist/vendor.js': 'dist/vendor.js',
					'dist/app.js': 'dist/app.js',
				}
			}
		},
		less: {
			compile: {
				options: {
					compress: true
				},
				files: {
					'dist/css/app.css': 'src/css/app.less',
					'dist/css/responsive.css': 'src/css/responsive.less'
				}
			}
		},
		jade: {
			compile: {
				options: {
					doctype: 'html'
				},
				files: [{
					expand: true,
					cwd: 'src',
					src: ['**/*.jade', '!views/static/**/*.jade'],
					dest: 'dist',
					ext: '.html'
				}]
			}
		},
		markdown: {
			all: {
				files: [{
					expand: true,
					cwd: 'src',
					src: '*.md',
					dest: 'dist',
					ext: '.html'
				}]
			}
		},
		copy: {
			build: {
				files: [
					{
						cwd: 'src',
						src: ['**', '!app/**', '!**/*.less', '!**/*.jade', '!**/*.js'],
						dest: 'dist',
						expand: true
					},
					{
						'dist/index.html': 'dist/views/index.html',
						'dist/404.html': 'src/views/404.html',
						'dist/js/cartodb.core.js': 'src/js/cartodb.core.js'
					}
				]
			}
		},
		connect: {
			server: {
				options: {
					port: 4000,
					base: 'dist',
					hostname: '*'
				}
			}
		},
		watch: {
			options: {
				livereload: true
			},
			css: {
				files: 'src/css/**/*.less',
				tasks: ['less']
			},
			jade: {
				files: 'src/views/**/*.jade',
				tasks: ['jade']
			},
			scripts: {
				files: 'src/app/**/*.js',
				tasks: ['browserify']
			},
			copy: {
				files: ['src/**', '!src/**/*.less', '!src/**/*.jade', '!src/**/*.js'],
				tasks: ['copy']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-markdown');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask(
		'javascript',
		'Compile scripts.',
		['browserify', 'uglify']
	);

	grunt.registerTask(
		'views',
		'Compile views.',
		['markdown', 'jade', 'less', 'copy']
	);

	grunt.registerTask(
		'files',
		'Copy files.',
		['copy']
	);

	grunt.registerTask(
		'build',
		'Compiles everything.',
		['javascript', 'views']
	);

	grunt.registerTask(
		'default',
		'Build, start server and watch.',
		['build', 'watch']
	);

}
