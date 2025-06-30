"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, User, Edit, Trash2, Plus, Eye } from "lucide-react"

interface AuditEntry {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  action: string
  resource: string
  resourceId?: string
  oldValues?: any
  newValues?: any
  ipAddress?: string
  timestamp: Date
}

export function AuditTrail() {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [resourceFilter, setResourceFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAuditEntries = async () => {
      try {
        const response = await fetch("/api/audit-logs")
        const data = await response.json()
        setAuditEntries(data)
      } catch (error) {
        console.error("Failed to fetch audit entries:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAuditEntries()
  }, [])

  const getActionIcon = (action: string) => {
    if (action.includes("CREATE")) return <Plus className="w-4 h-4 text-green-500" />
    if (action.includes("UPDATE")) return <Edit className="w-4 h-4 text-blue-500" />
    if (action.includes("DELETE")) return <Trash2 className="w-4 h-4 text-red-500" />
    if (action.includes("VIEW")) return <Eye className="w-4 h-4 text-gray-500" />
    return <User className="w-4 h-4 text-gray-500" />
  }

  const getActionColor = (action: string) => {
    if (action.includes("CREATE")) return "bg-green-100 text-green-800"
    if (action.includes("UPDATE")) return "bg-blue-100 text-blue-800"
    if (action.includes("DELETE")) return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  const filteredEntries = auditEntries.filter((entry) => {
    const matchesSearch =
      entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.resource.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAction = actionFilter === "all" || entry.action.includes(actionFilter.toUpperCase())
    const matchesResource = resourceFilter === "all" || entry.resource.toLowerCase() === resourceFilter

    return matchesSearch && matchesAction && matchesResource
  })

  const formatChanges = (oldValues: any, newValues: any) => {
    if (!oldValues || !newValues) return null

    const changes = []
    for (const key in newValues) {
      if (oldValues[key] !== newValues[key]) {
        changes.push({
          field: key,
          from: oldValues[key],
          to: newValues[key],
        })
      }
    }

    return changes
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
        <div className="flex space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="view">View</SelectItem>
            </SelectContent>
          </Select>
          <Select value={resourceFilter} onValueChange={setResourceFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Resource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="ticket">Tickets</SelectItem>
              <SelectItem value="customer">Customers</SelectItem>
              <SelectItem value="bot">Bot</SelectItem>
              <SelectItem value="settings">Settings</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No audit entries found</div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => {
                const changes = formatChanges(entry.oldValues, entry.newValues)

                return (
                  <div
                    key={entry.id}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={entry.userAvatar || "/placeholder.svg"} />
                      <AvatarFallback>{entry.userName.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {getActionIcon(entry.action)}
                        <Badge className={getActionColor(entry.action)}>{entry.action}</Badge>
                        <span className="text-sm text-gray-600">on</span>
                        <Badge variant="outline">{entry.resource}</Badge>
                        {entry.resourceId && <span className="text-sm text-gray-500">#{entry.resourceId}</span>}
                      </div>

                      <p className="text-sm text-gray-900 mb-2">
                        <span className="font-medium">{entry.userName}</span> performed {entry.action.toLowerCase()} on{" "}
                        {entry.resource}
                      </p>

                      {changes && changes.length > 0 && (
                        <div className="bg-white p-3 rounded border text-xs">
                          <p className="font-medium mb-2">Changes:</p>
                          {changes.map((change, index) => (
                            <div key={index} className="mb-1">
                              <span className="font-medium">{change.field}:</span>
                              <span className="text-red-600 line-through ml-1">{String(change.from)}</span>
                              <span className="mx-1">→</span>
                              <span className="text-green-600">{String(change.to)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                        <span>{new Date(entry.timestamp).toLocaleString()}</span>
                        {entry.ipAddress && <span>IP: {entry.ipAddress}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
