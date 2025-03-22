import React from 'react'
import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"




const Login = () => {

    

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="logo flex items-center ">
                    <img className="h-[55px]" src="logo.svg" alt="" />
                    <h1 className="font-bold text-4xl pl-4">Code Tracker</h1>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm />
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block">
                <img
                    src="loginBackground.jpg"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}

export default Login
