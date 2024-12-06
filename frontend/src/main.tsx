import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import QueryProvider from './providers/QueryProvider.tsx'
import { RouterProvider } from 'react-router-dom'
import adminRouter from './routes/routes.tsx'
import { store } from './store/store.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryProvider>
        <RouterProvider router={adminRouter} />
      </QueryProvider>
    </Provider>
  </StrictMode>,
)
