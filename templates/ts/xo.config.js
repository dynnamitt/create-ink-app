import {fixupConfigRules} from '@eslint/compat';
import xoReact from 'eslint-config-xo-react';

// XO flat config (xo 3.x). React rules come from `eslint-config-xo-react`,
// wrapped in `fixupConfigRules` because `eslint-plugin-react` 7.x still calls
// the legacy `context.getSourceCode()` that ESLint 10 removed.
export default [
	...fixupConfigRules(xoReact()),
	{
		prettier: true,
		rules: {
			'react/prop-types': 'off',
		},
	},
];
