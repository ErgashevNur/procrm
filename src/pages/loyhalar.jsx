import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function Loyhalar() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("user");

    fetch("https://prohome-backend.prohome.uz/api/v1/projects", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  console.log(projects);

  return <div>loyhalar</div>;
}
