import path from 'node:path';
import process from 'node:process';
import test from 'ava';
import {execa} from 'execa';
import stripAnsi from 'strip-ansi';
import {temporaryDirectoryTask} from 'tempy';
import {deleteAsync} from 'del';
import createInkApp from './index.js';

// The JS template still uses babel + the import-jsx loader, which break on
// Node >=22. Skip its end-to-end test when SKIP_JS_TEMPLATE_TEST is set (CI
// does this) until the template is modernized; drop the gate once it's fixed.
const jsAppTest = process.env.SKIP_JS_TEMPLATE_TEST
	? test.serial.skip
	: test.serial;

const temporaryProjectTask = async (type, callback) => {
	await temporaryDirectoryTask(async temporaryDirectory => {
		const projectDirectory = path.join(temporaryDirectory, `test-${type}-app`);
		await deleteAsync(projectDirectory);

		try {
			await callback(projectDirectory);
		} finally {
			await execa('npm', ['unlink', '--global', `test-${type}-app`]);
		}
	});
};

jsAppTest('javascript app', async t => {
	await temporaryProjectTask('js', async projectDirectory => {
		await createInkApp(projectDirectory, {
			typescript: false,
			silent: true,
		});

		const result = await execa('test-js-app');
		t.is(stripAnsi(result.stdout).trim(), 'Hello, Stranger');

		await t.notThrowsAsync(
			execa('npm', ['test'], {
				cwd: projectDirectory,
			}),
		);
	});
});

test.serial('typescript app', async t => {
	await temporaryProjectTask('ts', async projectDirectory => {
		await createInkApp(projectDirectory, {
			typescript: true,
			silent: true,
		});

		const result = await execa('test-ts-app');
		t.is(stripAnsi(result.stdout).trim(), 'Hello, Stranger');

		await t.notThrowsAsync(
			execa('npm', ['test'], {
				cwd: projectDirectory,
			}),
		);
	});
});
