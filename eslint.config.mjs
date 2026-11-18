import tseslint from 'typescript-eslint';
export default tseslint.config({ignores:['**/dist/**','reference/**','node_modules/**','**/coverage/**','test-results/**','playwright-report/**']},...tseslint.configs.recommended,{rules:{'@typescript-eslint/no-explicit-any':'error'}});
