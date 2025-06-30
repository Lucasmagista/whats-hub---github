"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DataPoint {
  timestamp: string
  value: number
}

interface RealTimeChartProps {
  title: string
  metric: string
  color?: string
  maxDataPoints?: number
  updateInterval?: number
}

export function RealTimeChart({
  title,
  metric,
  color = "#3b82f6",
  maxDataPoints = 20,
  updateInterval = 5000,
}: RealTimeChartProps) {
  const [data, setData] = useState<DataPoint[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/metrics/${metric}`)
        const newPoint = await response.json()

        setData((prevData) => {
          const newData = [
            ...prevData,
            {
              timestamp: new Date().toLocaleTimeString(),
              value: newPoint.value,
            },
          ]

          // Keep only the last maxDataPoints
          return newData.slice(-maxDataPoints)
        })
      } catch (error) {
        console.error("Failed to fetch metric data:", error)
      }
    }

    // Initial fetch
    fetchData()

    // Set up interval
    const interval = setInterval(fetchData, updateInterval)

    return () => clearInterval(interval)
  }, [metric, maxDataPoints, updateInterval])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
