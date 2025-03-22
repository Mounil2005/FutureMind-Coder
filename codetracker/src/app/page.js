"use client"
import Dashboard from "@/components/dashboard";
import Settings from "@/components/settings";
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import LeetCodeInput from "@/components/leet";
import CodeForcesInput from "@/components/codeforces";

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function Home() {

  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [activeSection, setActiveSection] = useState("Dashboard");

  const [rank, setRank] = useState("302");
  const [name, setName] = useState("User");
  const [username, setUsername] = useState("User");
  const [solved, setSolved] = useState("232");

  const [leetCodeUsername, setLeetCodeUsername] = useState("");
  const [codeForcesUsername, setCodeForcesUsername] = useState("");


  useEffect(() => {

  }, []);

  useEffect(() => {
    fetch("https://codetrackrapi.onrender.com/")
        .then((res) => res.json())
        .then((data)=>console.log(data))
  }, []);


  useEffect(() => {
    if (leetCodeUsername) {
      fetch(`https://alfa-leetcode-api.onrender.com/${leetCodeUsername}`)
        .then((res) => res.json())
        .then((data) => { setRank(data.ranking); setName(data.name); setUsername(data.username) })
        .catch((error) => console.error("Error fetching data:", error));

      fetch("https://alfa-leetcode-api.onrender.com/" + { leetCodeUsername } + "/solved")
        .then((res) => res.json())
        .then((data) => setSolved(data.solvedProblem));

      // fetch("https://alfa-leetcode-api.onrender.com/imlakshy")
      //   .then((res) => res.json())
      //   .then((data) => console.log(data))
    }
  }, [leetCodeUsername]);


  return (
    <div className="main flex">

      <div className="sideBar w-[400px] bg-sidebar p-10 h-screen fixed text-foreground">
        {/* Logo */}
        <div className="logo flex items-center justify-center">
          <img className="h-[55px]" src="logo.svg" alt="" />
          <h1 className="font-bold text-4xl pl-4">Code Tracker</h1>
        </div>


        {/* Sidebar Content */}
        <div className="flex flex-col justify-center p-10">
          {/* Item */}
          <div className="flex items-center p-4 my-4 rounded-xl cursor-pointer hover:bg-muted">
            <img className="h-[30px]" src="dashboard.png" alt="" />
            <h1 className="font-medium pl-2 text-xl" onClick={() => setActiveSection("Dashboard")}>Dashboard</h1>
          </div>
          {/* Item */}
          <div className="flex items-center p-4 my-4 rounded-xl cursor-pointer hover:bg-muted">
            <img className="h-[30px]" src="folder.svg" alt="" />
            <h1 className="font-medium pl-2 text-xl">My Projects</h1>
          </div>
          {/* Item */}
          <div className="flex items-center p-4 my-4 rounded-xl cursor-pointer hover:bg-muted">
            <img className="h-[30px] mr-2" src="leetcode.svg" alt="" />
            <LeetCodeInput setLeetCodeUsername={setLeetCodeUsername} />
          </div>
          {/* Item */}
          <div className="flex items-center p-4 my-4 rounded-xl cursor-pointer hover:bg-muted">
            <img className="h-[30px] mr-2" src="codeforces.svg" alt="" />
            <CodeForcesInput setCodeForcesUsername={setCodeForcesUsername}/>
          </div>
          

        </div>

        {/* User profile and settings */}
        <div className="absolute bottom-5 w-full border-t border-muted pt-5">
          {/* Settings */}
          <div className="flex items-center p-4 my-4 w-[300px] rounded-xl cursor-pointer hover:bg-muted">
            <img className="h-[30px]" src="settings.svg" alt="" />
            <h1 className="pl-2 text-[18px]" onClick={() => setActiveSection("Settings")}>Settings</h1>
          </div>
          {/* Help */}
          <div className="flex items-center p-4 w-[300px] rounded-xl cursor-pointer hover:bg-muted">
            <img className="h-[30px]" src="help.svg" alt="" />
            <h1 className="pl-2 text-[18px]">Help</h1>
          </div>
          {/* User Info */}
          <div className="flex items-center p-4 hover:bg-muted w-[300px] rounded-lg cursor-pointer" onClick={() => { router.push("/login"); }}>
            <img className="h-[40px] rounded-full" src="user.png" alt="" />
            <div className="flex flex-col pl-2">
              <h1 className="font-medium text-xl">{name}</h1>
              {/* <h3 className="text-muted-foreground">user@domain.com</h3> */}
            </div>
          </div>
        </div>
      </div>


      <div className="contentMain flex-1 ml-[400px]">
        {activeSection === "Dashboard" &&
          submissions !== null && ( // ⬅️ Render only when data is fetched
            <Dashboard solvedProblem={submissions} name={name} rank={rank} noSolved={solved} />
          )}
        {activeSection === "Settings" && <Settings username={username} />}


      </div>
    </div>
  );
}
