import { Bell, User, LogOut, Shield, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";

export default function TopNavbar() {
  const { user, logout } = useAuth();
  return (
    <motion.header 
      className="mb-8 flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">EcoTech Innovators</h1>
        <p className="text-sm text-muted-foreground">Smart Waste Monitoring Dashboard</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-3 p-2 h-auto" data-testid="button-user-menu">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  <Badge variant={user?.role === 'admin' ? 'default' : user?.role === 'worker' ? 'secondary' : 'outline'} className="text-xs">
                    {user?.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                    {user?.role === 'worker' && <Briefcase className="h-3 w-3 mr-1" />}
                    {user?.role === 'citizen' && <Users className="h-3 w-3 mr-1" />}
                    {user?.role}
                  </Badge>
                </div>
              </div>
              <Avatar className="h-10 w-10" data-testid="avatar-user">
                <AvatarFallback>
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem data-testid="menu-item-profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} data-testid="menu-item-logout">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
