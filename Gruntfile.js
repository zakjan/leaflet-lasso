const webpackConfig = require('./webpack.config');
module.exports = function(grunt) {
  grunt.initConfig({
    ts: {
      default : {
        tsconfig: './tsconfig.json',
        passThrough: true
      }
    },
    webpack: {
      default: webpackConfig
    }    
  });
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks('grunt-webpack');
  grunt.registerTask("default", ["ts","webpack"]);
};