import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { LogOut, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();
    navigate("/login");
  };

  const handleNavigate = (e) => {
    e.preventDefault();

    navigate("/profile");
  };

  return (
    <div className="sticky flex h-20 w-full items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="mr-5 flex h-9 w-9 items-center justify-center gap-3 px-2 py-2"
          render={<Button variant="outline" />}
        >
          <User className="text-gray-100 hover:text-gray-300" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleNavigate}>
              <div className="flex items-center gap-3">
                <User />
                Profile
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <div className="flex items-center gap-3">
                <LogOut />
                Log out
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/setting")}>
              <div className="flex items-center gap-3">
                <Settings />
                Settings
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
