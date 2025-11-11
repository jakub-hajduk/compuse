import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import { config } from 'dotenv';
import { glob } from 'glob';

config();

process.env.NODE_OPTIONS = '--import tsx';

const files = glob.sync('**/*.test.ts', {
  ignore: 'node_modules/**',
});

const args = process.argv.slice(2);

run({ files, concurrency: true, watch: args.includes('watch') })
  .compose(spec)
  .pipe(process.stdout);
