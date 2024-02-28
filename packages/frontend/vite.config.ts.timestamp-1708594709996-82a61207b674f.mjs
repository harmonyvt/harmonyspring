// vite.config.ts
import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import vue from 'file:///home/peachpc/harmonyspring/node_modules/@vitejs/plugin-vue/dist/index.mjs';
import * as dotenv from 'file:///home/peachpc/harmonyspring/packages/frontend/node_modules/dotenv/lib/main.js';
import { defineConfig } from 'file:///home/peachpc/harmonyspring/node_modules/vite/dist/node/index.js';
import { createHtmlPlugin } from 'file:///home/peachpc/harmonyspring/node_modules/vite-plugin-html/dist/index.mjs';
import Pages from 'file:///home/peachpc/harmonyspring/node_modules/vite-plugin-pages/dist/index.js';
var __vite_injected_original_dirname = '/home/peachpc/harmonyspring/packages/frontend';
dotenv.config({
	path: join(__vite_injected_original_dirname, '..', '.env')
});
var backendUrl = 'http://127.0.0.1:8000';
var vite_config_default = defineConfig({
	resolve: {
		alias: {
			'~/': `${resolve(__vite_injected_original_dirname, 'src')}/`,
			'@/': `${resolve(__vite_injected_original_dirname, 'src')}/`
		}
	},
	define: {
		PACKAGE_VERSION: JSON.stringify(JSON.parse(readFileSync('../../package.json', 'utf8')).version)
	},
	plugins: [
		vue({
			template: {
				compilerOptions: {
					isCustomElement: tag => tag.startsWith('media-')
				}
			}
		}),
		Pages({
			dirs: [{ dir: 'src/pages', baseRoute: '' }],
			exclude: ['**/*.test.ts'],
			extendRoute: route => {
				if (route.path === '/dashboard') {
					return { ...route, redirect: '/dashboard/uploads' };
				}
				return route;
			}
		}),
		createHtmlPlugin({
			minify: true,
			entry: '/src/main.ts',
			template: 'src/index.html'
		})
	],
	optimizeDeps: {
		include: ['vue', 'vue-router', '@vueuse/core'],
		exclude: ['vue-demi']
	},
	server: {
		port: 8001,
		proxy: {
			'/api': {
				target: backendUrl,
				changeOrigin: true,
				secure: false
			}
		},
		watch: {
			usePolling: true
		}
	},
	envDir: './frontend',
	publicDir: './src/public'
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wZWFjaHBjL2hhcm1vbnlzcHJpbmcvcGFja2FnZXMvZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3BlYWNocGMvaGFybW9ueXNwcmluZy9wYWNrYWdlcy9mcm9udGVuZC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wZWFjaHBjL2hhcm1vbnlzcHJpbmcvcGFja2FnZXMvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdub2RlOmZzJztcbmltcG9ydCB7IHJlc29sdmUsIGpvaW4gfSBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xuaW1wb3J0ICogYXMgZG90ZW52IGZyb20gJ2RvdGVudic7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IGNyZWF0ZUh0bWxQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1odG1sJztcbmltcG9ydCBQYWdlcyBmcm9tICd2aXRlLXBsdWdpbi1wYWdlcyc7XG5cbi8vIFNpbmNlIHdlJ3JlIHVzaW5nIHRoZSBzYW1lIC5lbnYgZmlsZSBmb3IgYm90aCB0aGUgZnJvbnRlbmQgYW5kIGJhY2tlbmQsIHdlIG5lZWQgdG8gc3BlY2lmeSB0aGUgcGF0aFxuZG90ZW52LmNvbmZpZyh7XG5cdHBhdGg6IGpvaW4oX19kaXJuYW1lLCAnLi4nLCAnLmVudicpXG59KTtcblxuLy8gaHR0cHM6Ly9sdWNpZGUuZGV2L2ljb25zL2xpc3RcblxuY29uc3QgYmFja2VuZFVybCA9ICdodHRwOi8vMTI3LjAuMC4xOjgwMDAnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuXHRyZXNvbHZlOiB7XG5cdFx0YWxpYXM6IHtcblx0XHRcdCd+Lyc6IGAke3Jlc29sdmUoX19kaXJuYW1lLCAnc3JjJyl9L2AsXG5cdFx0XHQnQC8nOiBgJHtyZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpfS9gXG5cdFx0fVxuXHR9LFxuXHRkZWZpbmU6IHtcblx0XHRQQUNLQUdFX1ZFUlNJT046IEpTT04uc3RyaW5naWZ5KEpTT04ucGFyc2UocmVhZEZpbGVTeW5jKCcuLi8uLi9wYWNrYWdlLmpzb24nLCAndXRmOCcpKS52ZXJzaW9uKVxuXHR9LFxuXHRwbHVnaW5zOiBbXG5cdFx0dnVlKHtcblx0XHRcdHRlbXBsYXRlOiB7XG5cdFx0XHRcdGNvbXBpbGVyT3B0aW9uczoge1xuXHRcdFx0XHRcdGlzQ3VzdG9tRWxlbWVudDogdGFnID0+IHRhZy5zdGFydHNXaXRoKCdtZWRpYS0nKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSksXG5cdFx0UGFnZXMoe1xuXHRcdFx0ZGlyczogW3sgZGlyOiAnc3JjL3BhZ2VzJywgYmFzZVJvdXRlOiAnJyB9XSxcblx0XHRcdGV4Y2x1ZGU6IFsnKiovKi50ZXN0LnRzJ10sXG5cdFx0XHRleHRlbmRSb3V0ZTogcm91dGUgPT4ge1xuXHRcdFx0XHRpZiAocm91dGUucGF0aCA9PT0gJy9kYXNoYm9hcmQnKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHsgLi4ucm91dGUsIHJlZGlyZWN0OiAnL2Rhc2hib2FyZC91cGxvYWRzJyB9O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHJvdXRlO1xuXHRcdFx0fVxuXHRcdH0pLFxuXHRcdGNyZWF0ZUh0bWxQbHVnaW4oe1xuXHRcdFx0bWluaWZ5OiB0cnVlLFxuXHRcdFx0ZW50cnk6ICcvc3JjL21haW4udHMnLFxuXHRcdFx0dGVtcGxhdGU6ICdzcmMvaW5kZXguaHRtbCdcblx0XHR9KVxuXHRdLFxuXHRvcHRpbWl6ZURlcHM6IHtcblx0XHRpbmNsdWRlOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ0B2dWV1c2UvY29yZSddLFxuXHRcdGV4Y2x1ZGU6IFsndnVlLWRlbWknXVxuXHR9LFxuXHRzZXJ2ZXI6IHtcblx0XHRwb3J0OiA4MDAxLFxuXHRcdHByb3h5OiB7XG5cdFx0XHQnL2FwaSc6IHtcblx0XHRcdFx0dGFyZ2V0OiBiYWNrZW5kVXJsLFxuXHRcdFx0XHRjaGFuZ2VPcmlnaW46IHRydWUsXG5cdFx0XHRcdHNlY3VyZTogZmFsc2Vcblx0XHRcdH1cblx0XHR9LFxuXHRcdHdhdGNoOiB7XG5cdFx0XHR1c2VQb2xsaW5nOiB0cnVlXG5cdFx0fVxuXHR9LFxuXHRlbnZEaXI6ICcuL2Zyb250ZW5kJyxcblx0cHVibGljRGlyOiAnLi9zcmMvcHVibGljJ1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlULFNBQVMsb0JBQW9CO0FBQ3RWLFNBQVMsU0FBUyxZQUFZO0FBQzlCLE9BQU8sU0FBUztBQUNoQixZQUFZLFlBQVk7QUFDeEIsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyx3QkFBd0I7QUFDakMsT0FBTyxXQUFXO0FBTmxCLElBQU0sbUNBQW1DO0FBU2xDLGNBQU87QUFBQSxFQUNiLE1BQU0sS0FBSyxrQ0FBVyxNQUFNLE1BQU07QUFDbkMsQ0FBQztBQUlELElBQU0sYUFBYTtBQUVuQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMzQixTQUFTO0FBQUEsSUFDUixPQUFPO0FBQUEsTUFDTixNQUFNLEdBQUcsUUFBUSxrQ0FBVyxLQUFLLENBQUM7QUFBQSxNQUNsQyxNQUFNLEdBQUcsUUFBUSxrQ0FBVyxLQUFLLENBQUM7QUFBQSxJQUNuQztBQUFBLEVBQ0Q7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNQLGlCQUFpQixLQUFLLFVBQVUsS0FBSyxNQUFNLGFBQWEsc0JBQXNCLE1BQU0sQ0FBQyxFQUFFLE9BQU87QUFBQSxFQUMvRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1IsSUFBSTtBQUFBLE1BQ0gsVUFBVTtBQUFBLFFBQ1QsaUJBQWlCO0FBQUEsVUFDaEIsaUJBQWlCLFNBQU8sSUFBSSxXQUFXLFFBQVE7QUFBQSxRQUNoRDtBQUFBLE1BQ0Q7QUFBQSxJQUNELENBQUM7QUFBQSxJQUNELE1BQU07QUFBQSxNQUNMLE1BQU0sQ0FBQyxFQUFFLEtBQUssYUFBYSxXQUFXLEdBQUcsQ0FBQztBQUFBLE1BQzFDLFNBQVMsQ0FBQyxjQUFjO0FBQUEsTUFDeEIsYUFBYSxXQUFTO0FBQ3JCLFlBQUksTUFBTSxTQUFTLGNBQWM7QUFDaEMsaUJBQU8sRUFBRSxHQUFHLE9BQU8sVUFBVSxxQkFBcUI7QUFBQSxRQUNuRDtBQUVBLGVBQU87QUFBQSxNQUNSO0FBQUEsSUFDRCxDQUFDO0FBQUEsSUFDRCxpQkFBaUI7QUFBQSxNQUNoQixRQUFRO0FBQUEsTUFDUixPQUFPO0FBQUEsTUFDUCxVQUFVO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ2IsU0FBUyxDQUFDLE9BQU8sY0FBYyxjQUFjO0FBQUEsSUFDN0MsU0FBUyxDQUFDLFVBQVU7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ04sUUFBUTtBQUFBLFFBQ1AsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLE1BQ1Q7QUFBQSxJQUNEO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTixZQUFZO0FBQUEsSUFDYjtBQUFBLEVBQ0Q7QUFBQSxFQUNBLFFBQVE7QUFBQSxFQUNSLFdBQVc7QUFDWixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
