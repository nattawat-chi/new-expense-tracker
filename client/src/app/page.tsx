// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { SignedIn, SignedOut } from "@clerk/nextjs";
// import binderLogo from "../../public/binderLogo.png";
// import Image from "next/image";

// export default function LandingPage() {
//   return (
//     <main className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] dark:from-[#18181b] dark:to-[#27272a] flex flex-col items-center">
//       <header className="w-full max-w-5xl mx-auto flex justify-between items-center py-8 px-4">
//         <a href="/">
//           <Image src={binderLogo} alt="Binder Logo" width={150} height={150} />
//         </a>
//         <div>
//           <SignedOut>
//             <Link href="/login">
//               <Button>Sign in</Button>
//             </Link>
//           </SignedOut>
//           <SignedIn>
//             <Link href="/dashboard">
//               <Button
//                 className="cursor-pointer hover:bg-primary/10"
//                 variant="secondary"
//               >
//                 Go to Dashboard
//               </Button>
//             </Link>
//           </SignedIn>
//         </div>
//       </header>
//       <section className="flex-1 flex flex-col items-center justify-center text-center px-4">
//         <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-primary">
//           Know where your money goes
//         </h1>
//         <p className="text-lg md:text-2xl text-muted-foreground mb-8 max-w-2xl">
//           Spend less than you earn, achieve financial dreams, and experience a
//           brighter financial future. <br />
//           <span className="text-primary font-semibold">Binder</span> helps you
//           track, budget, and control your expenses with ease.
//         </p>
//         <Link href="/login">
//           <Button size="lg" className="text-lg px-8 py-6">
//             Get Started
//           </Button>
//         </Link>
//       </section>
//       <section className="w-full max-w-5xl mx-auto py-12 px-4 grid md:grid-cols-3 gap-8">
//         <div className="bg-card rounded-xl shadow p-6 flex flex-col items-center">
//           <div className="text-3xl mb-2">📊</div>
//           <div className="font-bold mb-1">Budgeting</div>
//           <div className="text-muted-foreground text-sm">
//             Flexible budgeting tools, custom categories, and rollovers to stay
//             on track.
//           </div>
//         </div>
//         <div className="bg-card rounded-xl shadow p-6 flex flex-col items-center">
//           <div className="text-3xl mb-2">💡</div>
//           <div className="font-bold mb-1">Spending Insights</div>
//           <div className="text-muted-foreground text-sm">
//             Analyze your spending data to better adjust your budget and habits.
//           </div>
//         </div>
//         <div className="bg-card rounded-xl shadow p-6 flex flex-col items-center">
//           <div className="text-3xl mb-2">🔒</div>
//           <div className="font-bold mb-1">Security</div>
//           <div className="text-muted-foreground text-sm">
//             Your data is protected with industry-leading security and privacy
//             standards.
//           </div>
//         </div>
//       </section>
//       <footer className="w-full text-center py-6 text-muted-foreground text-xs">
//         © {new Date().getFullYear()} Binder. Inspired by{" "}
//         <a
//           href="https://pocketguard.com/"
//           className="underline"
//           target="_blank"
//         >
//           PocketGuard
//         </a>
//       </footer>
//     </main>
//   );
// }
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const router = useRouter();
  const { isSignedIn } = useUser();
  const rotatingTexts = [
    "to control your finances",
    "and improve your life",
    "to stop financial anxiety",
  ];

  const trustedLogos = [
    "Forbes",
    "TechCrunch",
    "CNN",
    "Wall Street Journal",
    "Washington Post",
    "CNBC",
    "Bloomberg",
    "Reuters",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  const components: { title: string; href: string; description: string }[] = [
    {
      title: "Alert Dialog",
      href: "/docs/primitives/alert-dialog",
      description:
        "A modal dialog that interrupts the user with important content and expects a response.",
    },
    {
      title: "Hover Card",
      href: "/docs/primitives/hover-card",
      description:
        "For sighted users to preview content available behind a link.",
    },
    {
      title: "Progress",
      href: "/docs/primitives/progress",
      description:
        "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
    },
    {
      title: "Scroll-area",
      href: "/docs/primitives/scroll-area",
      description: "Visually or semantically separates content.",
    },
    {
      title: "Tabs",
      href: "/docs/primitives/tabs",
      description:
        "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
    },
    {
      title: "Tooltip",
      href: "/docs/primitives/tooltip",
      description:
        "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
    },
  ];

  return (
    <div className="">
      {/* Navigation */}
      <nav className="relative  bg-transparent">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center py-6">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Image
                src="/binderLogo.png"
                alt="Binder Logo"
                width={150}
                height={150}
                className="cursor-pointer rounded-md hover:scale-105 transition-all duration-300"
                onClick={() => router.push("/")}
              />
            </div>

            {/* Desktop Navigation */}
            {/* <div className="hidden lg:flex items-center space-x-8">
              <div className="flex items-center space-x-1  hover:text-blue-300 cursor-pointer">
                <span>Features</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-1  hover:text-blue-300 cursor-pointer">
                <span>Resources</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-1  hover:text-blue-300 cursor-pointer">
                <span>Solutions</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-1  hover:text-blue-300 cursor-pointer">
                <span>Company</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <span className=" hover:text-blue-300 cursor-pointer">
                Pricing
              </span>
            </div> */}
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                <NavigationMenuItem className="z-60">
                  <NavigationMenuTrigger>Home</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                            href="/"
                          >
                            <div className="mt-4 mb-2 text-lg font-medium">
                              shadcn/ui
                            </div>
                            <p className="text-muted-foreground text-sm leading-tight">
                              Beautifully designed components built with
                              Tailwind CSS.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/docs" title="Introduction">
                        Re-usable components built using Radix UI and Tailwind
                        CSS.
                      </ListItem>
                      <ListItem href="/docs/installation" title="Installation">
                        How to install dependencies and structure your app.
                      </ListItem>
                      <ListItem
                        href="/docs/primitives/typography"
                        title="Typography"
                      >
                        Styles for headings, paragraphs, lists...etc
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem className="z-60">
                  <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {components.map((component) => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          href={component.href}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem className="z-60">
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link href="/docs">Docs</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem className="z-60">
                  <NavigationMenuTrigger>List</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link href="#">
                            <div className="font-medium">Components</div>
                            <div className="text-muted-foreground">
                              Browse all components in the library.
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link href="#">
                            <div className="font-medium">Documentation</div>
                            <div className="text-muted-foreground">
                              Learn how to use the library.
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link href="#">
                            <div className="font-medium">Blog</div>
                            <div className="text-muted-foreground">
                              Read our latest blog posts.
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem className="z-60">
                  <NavigationMenuTrigger>Simple</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link href="#">Components</Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link href="#">Documentation</Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link href="#">Blocks</Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem className="z-60">
                  <NavigationMenuTrigger>With Icon</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="#"
                            className="flex-row items-center gap-2"
                          >
                            <CircleHelpIcon />
                            Backlog
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="#"
                            className="flex-row items-center gap-2"
                          >
                            <CircleIcon />
                            To Do
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="#"
                            className="flex-row items-center gap-2"
                          >
                            <CircleCheckIcon />
                            Done
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link href="/login">
                {isSignedIn ? (
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => router.push("/dashboard")}
                  >
                    Dashboard
                  </Button>
                ) : (
                  <Button variant="outline" className="cursor-pointer">
                    Sign in
                  </Button>
                )}
              </Link>
              {/* <Button className="bg-teal-500 hover:bg-teal-600 ">
                Sign up
              </Button> */}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className=""
              >
                {isMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-slate-800 border-t border-slate-700">
            <div className="px-4 py-6 space-y-4">
              <div className=" py-2">Features</div>
              <div className=" py-2">Resources</div>
              <div className=" py-2">Solutions</div>
              <div className=" py-2">Company</div>
              <div className=" py-2">Pricing</div>
              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full  border-white">
                  <Link href="/login">Sign in</Link>
                </Button>
                {/* <Button className="w-full bg-teal-500 hover:bg-teal-600">
                  Sign up
                </Button> */}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold  leading-tight">
                  Know where your money goes
                </h1>
                <div className="h-16 flex items-center">
                  <h2 className="text-3xl lg:text-4xl font-bold text-blue-400 transition-opacity duration-500">
                    {rotatingTexts[currentTextIndex]}
                  </h2>
                </div>
              </div>

              <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
                Spend less than you earn, achieve financial dreams, and
                experience a brighter financial future.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Button
                  size="lg"
                  className="bg-teal-500 hover:bg-teal-600  px-8 py-4 text-lg"
                  onClick={() => router.push("/dashboard")}
                >
                  Get started
                </Button>

                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-16 h-16 bg-slate-800 rounded grid grid-cols-3 gap-1 p-2">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="bg-white rounded-sm"></div>
                      ))}
                    </div>
                  </div>
                  <div className="text-slate-500">
                    <div className="font-medium">or scan QR</div>
                    <div className="text-sm">to install</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Device Mockups */}
            <div className="relative">
              {/* MacBook Mockup */}
              <div className="relative ml-8">
                <div className="bg-slate-500 rounded-t-xl p-1">
                  <div className="bg-slate-300 rounded-t-lg aspect-[16/10] p-6">
                    <Card className="w-full h-full  rounded-lg shadow-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">
                          Financial Overview
                        </h3>
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                      </div>

                      {/* Pie Chart */}
                      <div className="flex justify-center mb-6">
                        <div className="relative w-48 h-48">
                          <svg
                            className="w-full h-full transform -rotate-90"
                            viewBox="0 0 100 100"
                          >
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="8"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="8"
                              strokeDasharray="120 251"
                              strokeDashoffset="0"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="8"
                              strokeDasharray="80 251"
                              strokeDashoffset="-120"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="8"
                              strokeDasharray="51 251"
                              strokeDashoffset="-200"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-2xl font-bold">
                                $2,372.78
                              </div>
                              <div className="text-sm text-gray-500">Total</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Legend */}
                      {/* <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm">Housing</span>
                          </div>
                          <span className="text-sm font-medium">$1,200</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm">Food</span>
                          </div>
                          <span className="text-sm font-medium">$400</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm">Transport</span>
                          </div>
                          <span className="text-sm font-medium">$300</span>
                        </div>
                      </div> */}
                    </Card>
                  </div>
                </div>
                <div className="bg-slate-600 h-1 rounded-b-xl"></div>
              </div>

              {/* iPhone Mockup */}
              <div className="absolute -bottom-12 -left-8 ">
                <div className="w-64 h-128 bg-slate-800 rounded-3xl p-2">
                  <div className="w-full h-full bg-slate-900 rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-br from-teal-400 to-blue-500 p-6 ">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-sm opacity-80">February 25</div>
                        <div className="text-sm opacity-80">9:41 AM</div>
                      </div>

                      <div className="mb-6">
                        <div className="text-2xl font-bold mb-1">
                          Left to Spend
                        </div>
                        <div className="text-4xl font-bold">$1,530.5</div>
                        <div className="text-sm opacity-80">Feb 25 - Mar 1</div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur">
                          <div>
                            <div className="font-medium">Savings & Stocks</div>
                            <div className="text-sm opacity-80">
                              Multiple accounts
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">$10,000.4</div>
                            <div className="text-sm opacity-80">+2.5%</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur">
                          <div>
                            <div className="font-medium">Spending</div>
                            <div className="text-sm opacity-80">
                              Current month
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">$2,469.5</div>
                            <div className="text-sm opacity-80">
                              85% of budget
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted By Section */}
      <div className="bg-slate-600/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold  text-center mb-12">
            Trusted by the best
          </h3>
          <div className="overflow-hidden">
            <div className="flex animate-scroll space-x-12 items-center">
              {[...trustedLogos, ...trustedLogos].map((logo, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 text-slate-500 text-xl font-bold whitespace-nowrap"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-600  py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                  <div className="w-5 h-5 bg-blue-600 rounded-sm"></div>
                </div>
                <span className="font-bold text-xl">POCKETGUARD</span>
              </div>
              <p className=" text-sm">
                Take control of your finances and build a brighter financial
                future.
              </p>
              <Button className="bg-teal-500 hover:bg-teal-600">
                Contact Support
              </Button>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Features</h4>
              <div className="space-y-2 text-sm">
                <div className=" hover: cursor-pointer">Budgeting</div>
                <div className=" hover: cursor-pointer">Spending Insights</div>
                <div className=" hover: cursor-pointer">Financial Goals</div>
                <div className=" hover: cursor-pointer">Bill Tracking</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Resources</h4>
              <div className="space-y-2 text-sm">
                <div className=" hover: cursor-pointer">Get Started</div>
                <div className=" hover: cursor-pointer">Security</div>
                <div className=" hover: cursor-pointer">Budget Calculator</div>
                <div className=" hover: cursor-pointer">Help Center</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <div className="space-y-2 text-sm">
                <div className=" hover: cursor-pointer">About</div>
                <div className=" hover: cursor-pointer">Blog</div>
                <div className=" hover: cursor-pointer">Privacy Policy</div>
                <div className=" hover: cursor-pointer">Terms of Use</div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-12 pt-8 text-center">
            <p className=" text-sm">© 2025 POCKETGUARD. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
