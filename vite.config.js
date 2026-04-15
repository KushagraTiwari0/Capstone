// // import { defineConfig } from 'vite'
// // import react from '@vitejs/plugin-react'

// // export default defineConfig({
// //   plugins: [react()],
// // })

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       // This tells Vite to forward any request starting with "/api" to your Express server
//       '/api': {
//         target: 'http://localhost:5000',
//         "https://capstone-something.vercel.app", // ⚠️ Change 5000 to whatever port your backend runs on!
//         changeOrigin: true,
//       }
//     }
//   }
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This tells Vite to forward any request starting with "/api" to your LOCAL Express server
      // Vercel will ignore this entirely in production.
      '/api': {
        target: 'http://localhost:10000', // Or 5000, whichever your local backend uses
        changeOrigin: true,
      }
    }
  }
})