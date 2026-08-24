import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { Archive, BellRing, Building2, CircleDollarSign, ClipboardList, FileText, LayoutDashboard, LogOut, Package, PanelLeft, UserRound, WalletCards } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

const menuGroups = [
  { label: "GENEL", items: [{ icon: LayoutDashboard, label: "Genel Bakış", path: "/" }] },
  { label: "YÖNETİM", items: [{ icon: Building2, label: "Portföy", path: "/portfolio" }, { icon: UserRound, label: "Kiracılar", path: "/tenants" }, { icon: FileText, label: "Sözleşmeler", path: "/contracts" }] },
  { label: "FİNANS", items: [{ icon: WalletCards, label: "Tahsilatlar", path: "/charges" }, { icon: CircleDollarSign, label: "Gelir & Gider", path: "/finance" }, { icon: ClipboardList, label: "Raporlar", path: "/reports" }] },
  { label: "KAYITLAR", items: [{ icon: Package, label: "Demirbaşlar", path: "/inventory" }, { icon: Archive, label: "Belge Arşivi", path: "/archive" }, { icon: BellRing, label: "Hatırlatmalar", path: "/reminders" }] },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 220;
const MAX_WIDTH = 340;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => { localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString()); }, [sidebarWidth]);
  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6"><div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-7 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-white"><Building2 className="h-5 w-5" /></div><h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">KiraTakip</h1><p className="mt-2 text-sm leading-6 text-slate-500">Kira, tahsilat ve portföy kayıtlarınıza güvenli erişim için giriş yapın.</p><Button onClick={() => startLogin()} className="mt-6 w-full rounded-md bg-blue-600 hover:bg-blue-700">Giriş yap</Button></div></div>;
  }
  return <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}><DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent></SidebarProvider>;
}

function DashboardLayoutContent({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (width: number) => void }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const allItems = menuGroups.flatMap(group => group.items);
  const activeItem = allItems.find(item => item.path === location) ?? allItems[0];

  useEffect(() => { if (isCollapsed) setIsResizing(false); }, [isCollapsed]);
  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      if (!isResizing) return;
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const width = event.clientX - left;
      if (width >= MIN_WIDTH && width <= MAX_WIDTH) setSidebarWidth(width);
    };
    const onUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); document.body.style.cursor = ""; document.body.style.userSelect = ""; };
  }, [isResizing, setSidebarWidth]);

  return <><div className="relative" ref={sidebarRef}><Sidebar collapsible="icon" className="border-r border-slate-200 bg-white" disableTransition={isResizing}><SidebarHeader className="h-16 border-b border-slate-100 px-3"><div className="flex h-full items-center gap-2"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white"><Building2 className="h-4 w-4" /></div>{!isCollapsed && <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">KiraTakip</p><p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Yönetim paneli</p></div>}<button onClick={toggleSidebar} className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Menüyü daralt veya genişlet"><PanelLeft className="h-4 w-4" /></button></div></SidebarHeader><SidebarContent className="px-2 py-3">{menuGroups.map(group => <div key={group.label} className="mb-4"><p className="px-2 pb-1.5 text-[10px] font-semibold tracking-[0.12em] text-slate-400 group-data-[collapsible=icon]:hidden">{group.label}</p><SidebarMenu className="gap-0.5">{group.items.map(item => <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={item.path === location} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-9 rounded-md px-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:hover:bg-blue-50"><item.icon className="h-4 w-4" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></div>)}</SidebarContent><SidebarFooter className="border-t border-slate-100 p-3"><DropdownMenu><DropdownMenuTrigger asChild><button className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-left hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Avatar className="h-7 w-7 shrink-0"><AvatarFallback className="bg-slate-100 text-[11px] font-semibold text-slate-600">{user?.name?.charAt(0).toUpperCase() || "K"}</AvatarFallback></Avatar><div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-xs font-medium text-slate-700">{user?.name || "Kullanıcı"}</p><p className="truncate text-[11px] text-slate-400">{user?.email || ""}</p></div></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-44"><DropdownMenuItem onClick={logout} className="cursor-pointer text-rose-600 focus:text-rose-600"><LogOut className="mr-2 h-4 w-4" />Çıkış yap</DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarFooter></Sidebar><div className={`absolute right-0 top-0 h-full w-1 cursor-col-resize ${isCollapsed ? "hidden" : ""}`} onMouseDown={() => !isCollapsed && setIsResizing(true)} style={{ zIndex: 50 }} /></div><SidebarInset className="bg-slate-50">{isMobile && <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-3"><SidebarTrigger className="h-8 w-8 rounded-md" /><div><p className="text-sm font-semibold text-slate-800">{activeItem.label}</p><p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">KiraTakip</p></div></div>}<main className="min-w-0 flex-1 p-3 sm:p-5">{children}</main></SidebarInset></>;
}
