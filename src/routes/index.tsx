import { createBrowserRouter, Outlet } from "react-router"
import { SiteHeader } from "@/components/site-header"
import { AboutPage } from "@/routes/about"
import { ContactPage } from "@/routes/contact"
import { HomePage } from "@/routes/home"
import { NotFoundPage } from "@/routes/not-found"

export const router = createBrowserRouter(
  [
    {
      element: <NorthWaterProductions />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "about", element: <AboutPage /> },
        { path: "contact", element: <ContactPage /> },
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)

function NorthWaterProductions() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col px-6">
        <Outlet />
      </main>
    </div>
  )
}
