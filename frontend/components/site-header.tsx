"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Notifications } from "./notifications";
import Logo from "@/components/logo";

interface SiteHeaderProps {
  showAuthButtons?: boolean;
}

export function SiteHeader({ showAuthButtons = true }: Readonly<SiteHeaderProps>) {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />

        {/* Center links: marketing when signed-out, in-app when signed-in */}
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          {!session ? (
            <MarketingLinks />
          ) : (
            <AppLinks />
          )}
        </div>

        {showAuthButtons && (
          <>
            {/* Right actions */}
            <div className="hidden md:flex items-center gap-3">
              {session !== null && <Notifications />}
              {!session ? (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Log in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-black text-white hover:bg-gray-800">Create event</Button>
                  </Link>
                </div>
              ) : (
                <Button
                  onClick={async () => { await signOut(); }}
                  size="sm"
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Log out
                </Button>
              )}
            </div>

            {/* Mobile */}
            <div className="md:hidden flex items-center gap-2">
              {session !== null && <Notifications />}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col gap-6 mt-6">
                    <div className="flex flex-col gap-3 text-sm">
                      {!session ? <MarketingLinksMobile onNavigate={() => setIsMobileMenuOpen(false)} /> : <AppLinksMobile onNavigate={() => setIsMobileMenuOpen(false)} />}
                    </div>
                    {showAuthButtons && (
                      <div className="pt-4 border-t">
                        {!session ? (
                          <div className="flex flex-col gap-2">
                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                              <Button variant="ghost" className="w-full">Log in</Button>
                            </Link>
                            <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                              <Button className="w-full bg-black text-white hover:bg-gray-800">Create event</Button>
                            </Link>
                          </div>
                        ) : (
                          <Button
                            onClick={async () => { await signOut(); setIsMobileMenuOpen(false); }}
                            className="w-full bg-black text-white hover:bg-gray-800"
                          >
                            Log out
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

function MarketingLinks() {
  return (
    <>
      <Link href="#features" className="hover:text-foreground">Features</Link>
      <Link href="/events" className="hover:text-foreground">Explore</Link>
      <Link href="#how" className="hover:text-foreground">How it works</Link>
      <Link href="#realtime" className="hover:text-foreground">Realtime</Link>
    </>
  );
}

function AppLinks() {
  return (
    <>
      <Link href="/wall" className="hover:text-foreground">Public Wall</Link>
      <Link href="/events/mine" className="hover:text-foreground">My Events</Link>
      <Link href="/events" className="hover:text-foreground">Discover</Link>
    </>
  );
}

function MarketingLinksMobile({ onNavigate }: Readonly<{ onNavigate: () => void }>) {
  return (
    <>
      <a href="#features" onClick={onNavigate} className="hover:text-foreground">Features</a>
      <Link href="/events" onClick={onNavigate} className="hover:text-foreground">Explore</Link>
      <a href="#how" onClick={onNavigate} className="hover:text-foreground">How it works</a>
      <a href="#realtime" onClick={onNavigate} className="hover:text-foreground">Realtime</a>
    </>
  );
}

function AppLinksMobile({ onNavigate }: Readonly<{ onNavigate: () => void }>) {
  return (
    <>
      <Link href="/wall" onClick={onNavigate} className="hover:text-foreground">Public Wall</Link>
      <Link href="/events/mine" onClick={onNavigate} className="hover:text-foreground">My Events</Link>
      <Link href="/events" onClick={onNavigate} className="hover:text-foreground">Discover</Link>
    </>
  );
}
