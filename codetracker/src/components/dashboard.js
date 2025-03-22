"use client"
import * as React from "react"
import { useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
const chartData = [
    { month: "Wee", LeetCode: 7, CodeForces: 10 },
    { month: "Week 2", LeetCode: 6, CodeForces: 8 },
    { month: "Week 3", LeetCode: 19, CodeForces: 3 },
    { month: "Week 4", LeetCode: 25, CodeForces: 5 },
]
const chartData2 = [
    { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
    { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
]
const chartConfig = {
    desktop: {
        label: "LeetCode",
        color: "#50a2ff",
    },
    mobile: {
        label: "CodeForces",
        color: "#8ec5ff",
    },
}
const chartConfig2 = {
    chrome: {
        label: "Chrome",
        color: "#50a2ff",
    },
    safari: {
        label: "Safari",
        color: "#8ec5ff",
    },
}
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart, PolarRadiusAxis, RadialBar, RadialBarChart, LabelList } from "recharts"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"


const Dashboard = ({ noSolved, name, rank, leetCodeUsername }) => {
    const totalVisitors = React.useMemo(() => {
        return String(noSolved);
    }, [])

    const [times, setTimes] = useState([]);

    useEffect(() => {
        fetch("https://codetrackrapi.onrender.com/")
            .then((res) => res.json())
            .then((data) => setTimes(data))
    }, []);


    return (
        <div>
            {/* Header */}
            <div className="header flex justify-center bg-blue-600 text-white">
                <h1 className="text-5xl font-black py-6">Dashboard</h1>
            </div>

            {/* Content */}
            <div className="flex flex-1 mt-4">

                <div className=" left flex-1 gap-4 flex flex-col">

                    <div className="stats rounded-4xl flex-1 p-10 bg-blue-500 text-white ml-5">
                        <div>
                            <h3 className="text-xl">Hello,</h3>
                            <h1 className="text-4xl font-extrabold">{name}👋</h1>
                        </div>

                        <div>
                            <div className="flex mt-10 gap-10">
                                <div className="flex-1 bg-blue-600 rounded-xl p-5 border-b-8">
                                    <h3 className="text-xl">Best Platform</h3>
                                    <h1 className="text-4xl font-extrabold">LeetCode</h1>
                                </div>

                                <div className="flex-1 bg-blue-600 rounded-xl p-5 border-b-8">
                                    <h3 className="text-xl">Rank</h3>
                                    <h1 className="text-4xl font-extrabold">{rank}</h1>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Chart */}


                    <div className="reportAndAnalysis flex-2 ml-5">
                        <Card>
                            <CardHeader>
                                <div className="text-xl font-bold">Report and Analysis</div>
                                <CardDescription>
                                    Showing the number of problems solved on each platform
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig}>
                                    <AreaChart
                                        accessibilityLayer
                                        data={chartData}
                                        margin={{
                                            left: 12,
                                            right: 12,
                                        }}
                                    >
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={true}


                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent indicator="dot" />}
                                        />
                                        <Area
                                            dataKey="CodeForces"
                                            type="natural"
                                            fill="var(--color-mobile)"
                                            fillOpacity={1}
                                            stroke="var(--color-mobile)"
                                            stackId="a"
                                        />
                                        <Area
                                            dataKey="LeetCode"
                                            type="natural"
                                            fill="var(--color-desktop)"
                                            fillOpacity={1}
                                            stroke="var(--color-desktop)"
                                            stackId="a"
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="right flex-1 mx-5 mt-4">
                    <div className=
                        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm h-full">
                        <CardHeader className="items-center pb-0">
                            <CardTitle>Progress</CardTitle>
                            <CardDescription>Problem Solved</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 pb-0">
                            <ChartContainer
                                config={chartConfig2}
                                className="mx-auto aspect-square max-h-[250px]"
                            >
                                <PieChart>
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Pie
                                        data={chartData2}
                                        dataKey="visitors"
                                        nameKey="browser"
                                        innerRadius={60}
                                        strokeWidth={5}
                                    >
                                        <Label
                                            content={({ viewBox }) => {
                                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                    return (
                                                        <text
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                        >
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={viewBox.cy}
                                                                className="fill-foreground text-3xl font-bold"
                                                            >
                                                                {totalVisitors.toLocaleString()}
                                                            </tspan>
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={(viewBox.cy || 0) + 24}
                                                                className="fill-muted-foreground"
                                                            >
                                                                Problems Solved
                                                            </tspan>
                                                        </text>
                                                    )
                                                }
                                            }}
                                        />
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                        </CardContent>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-10 text-xl font-bold">Platform</TableHead>
                                    <TableHead className="text-right pr-10 text-xl font-bold">Time Spent</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.keys(times).length > 0 ? (
                                    Object.entries(times) 
                                        .map(([platform, duration], index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium pl-10 py-4">
                                                    {platform} 
                                                </TableCell>
                                                <TableCell className="text-right pr-10">
                                                    {duration} 
                                                </TableCell>
                                            </TableRow>
                                        ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center py-4">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>

                        </Table>

                    </div>


                </div>
            </div>
        </div>
    )
}

export default Dashboard