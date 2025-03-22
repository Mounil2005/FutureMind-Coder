import React from 'react'
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react";

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const Settings = ({username}) => {

    const { setTheme } = useTheme();
    
    return (
        <div>
            {/* Header */}
            <div className="header flex justify-center bg-blue-600 text-white">
                <h1 className="text-5xl font-black py-6">Settings</h1>
            </div>

            {/* Content */}
            <div className='p-10'>
                <h1 className='font-bold text-4xl border-b-4 pb-4 mb-4'>Profile</h1>

                <div className='flex items-center border-b-4 pb-4 mb-4'>
                    <h3 className='text-2xl font-bold flex-1'>Profile Picture</h3>

                    <div className='flex-2 flex items-center justify-evenly'>
                        <img src="dp.png" className='h-[250px] invert-[0]' />

                        <div className='font-bold bg-blue-600 text-white p-4 h-auto' onClick={() => { }}>Upload Picture</div>
                    </div>
                </div>

                {/* <div className='flex items-center gap-10 my-10'>
                    <div className='flex flex-col gap-4 flex-1'>
                        <h3 className='text-2xl font-bold flex-1'>First Name: </h3>
                        <input type="text" placeholder='Enter First Name' className='text-2xl rounded-lg border-2 w-[400px] px-2' />
                    </div>

                    <div className='flex flex-col gap-4 flex-1'>
                        <h3 className='text-2xl font-bold flex-1'>Last Name: </h3>
                        <input type="text" placeholder='Enter Last Name' className='text-2xl rounded-lg border-2 w-[400px] px-2' />
                    </div>
                </div> */}

                <div className='flex items-center my-10'>
                    <h3 className='text-2xl font-bold pr-5'>Username: </h3>
                    <h3 className='text-2xl flex-1'>{username}</h3>
                    <h3></h3>
                </div>

                <div className='flex items-center my-10'>
                    <h3 className='text-2xl font-bold pr-5'>Email Id: </h3>
                    <h3 className='text-2xl flex-1'>user@domain.com</h3>
                </div>

                <div className='flex items-center my-10'>
                    <h3 className='text-2xl font-bold pr-5'>Change Password: </h3>

                    <input type="password" placeholder='Enter New Password' className='text-2xl rounded-lg border-2 w-[400px] px-2' />

                    <div className='cursor-pointer font-bold bg-blue-600 w-[81px] flex justify-center text-white p-2 rounded-lg ml-4' onClick={() => { }}>Change</div>

                </div>

                <div className='flex items-center my-10'>
                    <h3 className='text-2xl font-bold pr-5'>LeetCode Username: </h3>
                    <input type="text" placeholder='Enter LeetCode Username' className='text-2xl rounded-lg border-2 w-[400px] px-2' />
                </div>

                <div className='flex items-center my-10'>
                    <h3 className='text-2xl font-bold pr-5'>CodeForces Username: </h3>
                    <input type="text" placeholder='Enter CodeForces Username' className='text-2xl rounded-lg border-2 w-[400px] px-2' />
                </div>

                <div className='flex items-center my-10 border-b-4 pb-10'>
                    <h3 className='text-2xl font-bold pr-5'>GitHub Username: </h3>
                    <input type="text" placeholder='Enter GitHub Username' className='text-2xl rounded-lg border-2 w-[400px] px-2' />
                </div>

                <div className='flex items-center justify-between'>
                    <div className='flex gap-4'>
                        <div className='cursor-pointer font-bold border-2 border-blue-600 p-4' onClick={() => { }}>Cancle</div>

                        <div className='cursor-pointer font-bold bg-blue-600 w-[81px] flex justify-center text-white p-4' onClick={() => { }}>Save</div>
                    </div>

                    <div className="flex items-center p-4 my-4 rounded-xl cursor-pointer hover:bg-muted">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost">
                                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
                                    Change Theme
                                    <Moon className="h-5 w-5 rotate-0 scale-0 transition-all dark:rotate-0 dark:scale-100" />

                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className='cursor-pointer font-bold bg-red-600 text-white p-4' onClick={() => { }}>Logout</div>
                </div>


            </div>
        </div>
    )
}

export default Settings
