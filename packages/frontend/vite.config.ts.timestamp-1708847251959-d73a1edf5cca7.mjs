// vite.config.ts
import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import vue from 'file:///Users/aidandavis/harmonyspring/node_modules/@vitejs/plugin-vue/dist/index.mjs';
import * as dotenv from 'file:///Users/aidandavis/harmonyspring/packages/frontend/node_modules/dotenv/lib/main.js';
import { defineConfig } from 'file:///Users/aidandavis/harmonyspring/node_modules/vite/dist/node/index.js';
import { createHtmlPlugin } from 'file:///Users/aidandavis/harmonyspring/node_modules/vite-plugin-html/dist/index.mjs';
import Pages from 'file:///Users/aidandavis/harmonyspring/node_modules/vite-plugin-pages/dist/index.js';
var __vite_injected_original_dirname = '/Users/aidandavis/harmonyspring/packages/frontend';
dotenv.config({
	path: join(__vite_injected_original_dirname, '..', '.env')
});
var backendUrl = 'https://other.harmony.ngrok.dev/';
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWlkYW5kYXZpcy9oYXJtb255c3ByaW5nL3BhY2thZ2VzL2Zyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYWlkYW5kYXZpcy9oYXJtb255c3ByaW5nL3BhY2thZ2VzL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9haWRhbmRhdmlzL2hhcm1vbnlzcHJpbmcvcGFja2FnZXMvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdub2RlOmZzJztcbmltcG9ydCB7IHJlc29sdmUsIGpvaW4gfSBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xuaW1wb3J0ICogYXMgZG90ZW52IGZyb20gJ2RvdGVudic7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IGNyZWF0ZUh0bWxQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1odG1sJztcbmltcG9ydCBQYWdlcyBmcm9tICd2aXRlLXBsdWdpbi1wYWdlcyc7XG5cbi8vIFNpbmNlIHdlJ3JlIHVzaW5nIHRoZSBzYW1lIC5lbnYgZmlsZSBmb3IgYm90aCB0aGUgZnJvbnRlbmQgYW5kIGJhY2tlbmQsIHdlIG5lZWQgdG8gc3BlY2lmeSB0aGUgcGF0aFxuZG90ZW52LmNvbmZpZyh7XG5cdHBhdGg6IGpvaW4oX19kaXJuYW1lLCAnLi4nLCAnLmVudicpXG59KTtcblxuLy8gaHR0cHM6Ly9sdWNpZGUuZGV2L2ljb25zL2xpc3RcblxuY29uc3QgYmFja2VuZFVybCA9ICdodHRwczovL290aGVyLmhhcm1vbnkubmdyb2suZGV2Lyc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG5cdHJlc29sdmU6IHtcblx0XHRhbGlhczoge1xuXHRcdFx0J34vJzogYCR7cmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKX0vYCxcblx0XHRcdCdALyc6IGAke3Jlc29sdmUoX19kaXJuYW1lLCAnc3JjJyl9L2Bcblx0XHR9XG5cdH0sXG5cdGRlZmluZToge1xuXHRcdFBBQ0tBR0VfVkVSU0lPTjogSlNPTi5zdHJpbmdpZnkoSlNPTi5wYXJzZShyZWFkRmlsZVN5bmMoJy4uLy4uL3BhY2thZ2UuanNvbicsICd1dGY4JykpLnZlcnNpb24pXG5cdH0sXG5cdHBsdWdpbnM6IFtcblx0XHR2dWUoe1xuXHRcdFx0dGVtcGxhdGU6IHtcblx0XHRcdFx0Y29tcGlsZXJPcHRpb25zOiB7XG5cdFx0XHRcdFx0aXNDdXN0b21FbGVtZW50OiB0YWcgPT4gdGFnLnN0YXJ0c1dpdGgoJ21lZGlhLScpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KSxcblx0XHRQYWdlcyh7XG5cdFx0XHRkaXJzOiBbeyBkaXI6ICdzcmMvcGFnZXMnLCBiYXNlUm91dGU6ICcnIH1dLFxuXHRcdFx0ZXhjbHVkZTogWycqKi8qLnRlc3QudHMnXSxcblx0XHRcdGV4dGVuZFJvdXRlOiByb3V0ZSA9PiB7XG5cdFx0XHRcdGlmIChyb3V0ZS5wYXRoID09PSAnL2Rhc2hib2FyZCcpIHtcblx0XHRcdFx0XHRyZXR1cm4geyAuLi5yb3V0ZSwgcmVkaXJlY3Q6ICcvZGFzaGJvYXJkL3VwbG9hZHMnIH07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcm91dGU7XG5cdFx0XHR9XG5cdFx0fSksXG5cdFx0Y3JlYXRlSHRtbFBsdWdpbih7XG5cdFx0XHRtaW5pZnk6IHRydWUsXG5cdFx0XHRlbnRyeTogJy9zcmMvbWFpbi50cycsXG5cdFx0XHR0ZW1wbGF0ZTogJ3NyYy9pbmRleC5odG1sJ1xuXHRcdH0pXG5cdF0sXG5cdG9wdGltaXplRGVwczoge1xuXHRcdGluY2x1ZGU6IFsndnVlJywgJ3Z1ZS1yb3V0ZXInLCAnQHZ1ZXVzZS9jb3JlJ10sXG5cdFx0ZXhjbHVkZTogWyd2dWUtZGVtaSddXG5cdH0sXG5cdHNlcnZlcjoge1xuXHRcdHBvcnQ6IDgwMDEsXG5cdFx0cHJveHk6IHtcblx0XHRcdCcvYXBpJzoge1xuXHRcdFx0XHR0YXJnZXQ6IGJhY2tlbmRVcmwsXG5cdFx0XHRcdGNoYW5nZU9yaWdpbjogdHJ1ZSxcblx0XHRcdFx0c2VjdXJlOiBmYWxzZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0d2F0Y2g6IHtcblx0XHRcdHVzZVBvbGxpbmc6IHRydWVcblx0XHR9XG5cdH0sXG5cdGVudkRpcjogJy4vZnJvbnRlbmQnLFxuXHRwdWJsaWNEaXI6ICcuL3NyYy9wdWJsaWMnXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVUsU0FBUyxvQkFBb0I7QUFDbFcsU0FBUyxTQUFTLFlBQVk7QUFDOUIsT0FBTyxTQUFTO0FBQ2hCLFlBQVksWUFBWTtBQUN4QixTQUFTLG9CQUFvQjtBQUM3QixTQUFTLHdCQUF3QjtBQUNqQyxPQUFPLFdBQVc7QUFObEIsSUFBTSxtQ0FBbUM7QUFTbEMsY0FBTztBQUFBLEVBQ2IsTUFBTSxLQUFLLGtDQUFXLE1BQU0sTUFBTTtBQUNuQyxDQUFDO0FBSUQsSUFBTSxhQUFhO0FBRW5CLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzNCLFNBQVM7QUFBQSxJQUNSLE9BQU87QUFBQSxNQUNOLE1BQU0sR0FBRyxRQUFRLGtDQUFXLEtBQUssQ0FBQztBQUFBLE1BQ2xDLE1BQU0sR0FBRyxRQUFRLGtDQUFXLEtBQUssQ0FBQztBQUFBLElBQ25DO0FBQUEsRUFDRDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ1AsaUJBQWlCLEtBQUssVUFBVSxLQUFLLE1BQU0sYUFBYSxzQkFBc0IsTUFBTSxDQUFDLEVBQUUsT0FBTztBQUFBLEVBQy9GO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUixJQUFJO0FBQUEsTUFDSCxVQUFVO0FBQUEsUUFDVCxpQkFBaUI7QUFBQSxVQUNoQixpQkFBaUIsU0FBTyxJQUFJLFdBQVcsUUFBUTtBQUFBLFFBQ2hEO0FBQUEsTUFDRDtBQUFBLElBQ0QsQ0FBQztBQUFBLElBQ0QsTUFBTTtBQUFBLE1BQ0wsTUFBTSxDQUFDLEVBQUUsS0FBSyxhQUFhLFdBQVcsR0FBRyxDQUFDO0FBQUEsTUFDMUMsU0FBUyxDQUFDLGNBQWM7QUFBQSxNQUN4QixhQUFhLFdBQVM7QUFDckIsWUFBSSxNQUFNLFNBQVMsY0FBYztBQUNoQyxpQkFBTyxFQUFFLEdBQUcsT0FBTyxVQUFVLHFCQUFxQjtBQUFBLFFBQ25EO0FBRUEsZUFBTztBQUFBLE1BQ1I7QUFBQSxJQUNELENBQUM7QUFBQSxJQUNELGlCQUFpQjtBQUFBLE1BQ2hCLFFBQVE7QUFBQSxNQUNSLE9BQU87QUFBQSxNQUNQLFVBQVU7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDYixTQUFTLENBQUMsT0FBTyxjQUFjLGNBQWM7QUFBQSxJQUM3QyxTQUFTLENBQUMsVUFBVTtBQUFBLEVBQ3JCO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTixRQUFRO0FBQUEsUUFDUCxRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUEsTUFDVDtBQUFBLElBQ0Q7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNOLFlBQVk7QUFBQSxJQUNiO0FBQUEsRUFDRDtBQUFBLEVBQ0EsUUFBUTtBQUFBLEVBQ1IsV0FBVztBQUNaLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
