import { minify } from 'uglify-js';
import uglify from 'rollup-plugin-uglify';
import typescript from 'rollup-plugin-typescript';
import nodeResolve from 'rollup-plugin-node-resolve';

class RollupRx {

	constructor(options){
		this.options = options;
	}

	resolveId( id ){
		if(id.startsWith('rxjs/')){
			return `${__dirname}/node_modules/rxjs-es/${id.replace('rxjs/', '')}.js`;
		}
	}
}

const rollupRx = config => new RollupRx( config );

export default {
  entry: 'src/index.ts',
  format: 'iife',
  dest: 'dist/autocomplete.bundle.js',
  moduleName: 'AutoHub',
  external: [
    'jquery',
    'node_modules/jquery/'
  ],
  sourceMap: true,
  globals: {
    jquery: 'jQuery'
  },
  plugins: [
    rollupRx(),
    nodeResolve({
      jsnext: true,
      main: true,
      extensions: ['.ts', '.js', '.json'],
      browser: true
    }),
    typescript({
      typescript: require('typescript')
    }),
    // uglify({}, minify)
  ]
};
