import { createBrowserRouter, Outlet } from "react-router"
import { HomePage } from "@/routes/home"
import { NotFoundPage } from "@/routes/not-found"

export const router = createBrowserRouter(
  [
    {
      element: <NorthWaterProductions />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)

function NorthWaterProductions() {
  return (
    <main className="flex min-h-svh flex-col px-6">
      <Outlet />
    </main>
  )
}
