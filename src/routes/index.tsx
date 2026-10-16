import { createBrowserRouter, Outlet, ScrollRestoration } from "react-router"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { AboutPage } from "@/routes/about"
import { ContactPage } from "@/routes/contact"
import { HomePage } from "@/routes/home"
import { NotFoundPage } from "@/routes/not-found"
import { TinyHatManPage } from "@/routes/tiny-hat-man"

export const router = createBrowserRouter(
  [
    { path: "tinyhatman", element: <TinyHatManPage /> },
    {
      element: <NorthwaterPictures />,
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

function NorthwaterPictures() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col px-6">
        <Outlet />
      </main>
      <SiteFooter />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-(--z-grain) film-grain" />
      <ScrollRestoration />
    </div>
  )
}
