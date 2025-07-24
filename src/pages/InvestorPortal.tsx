import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { ArrowLeft, Building2, FileText, Lock, Unlock, Eye, Download, Bell } from 'lucide-react'
import { createClient } from '@blinkdotnew/sdk'

const blink = createClient({
  projectId: 'pfnexus-clone-bppmyeua',
  authRequired: false
})

interface Project {
  id: string
  projectName: string
  technologyType: string
  location: string
  capacityMw: number
  estimatedValueGbp: number
  tier1Summary: string
  tier2Teaser: string
  tier3FullData: string
  documentFiles: string
  createdAt: string
}

interface ProjectAccess {
  id: string
  projectId: string
  accessTier: number
  grantedAt: string
}

export default function InvestorPortal() {
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [projectAccess, setProjectAccess] = useState<ProjectAccess[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const loadData = async (userId: string) => {
    try {
      // Load project access for this investor
      const accessData = await blink.db.investorProjectAccess.list({
        where: { investorUserId: userId },
        orderBy: { grantedAt: 'desc' }
      })
      setProjectAccess(accessData)

      // Load projects that this investor has access to
      if (accessData.length > 0) {
        const projectIds = accessData.map(access => access.projectId)
        const projectsData = await blink.db.projectUploads.list({
          where: {
            id: { in: projectIds }
          },
          orderBy: { createdAt: 'desc' }
        })
        setProjects(projectsData)
      }

      // Load notifications
      const notificationsData = await blink.db.notifications.list({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        limit: 10
      })
      setNotifications(notificationsData)

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const userData = localStorage.getItem('bearEnergyUser')
    if (!userData) {
      navigate('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.userType !== 'investor') {
      navigate('/login')
      return
    }

    setUser(parsedUser)
    loadData(parsedUser.id)
  }, [navigate])

  const getAccessTier = (projectId: string) => {
    const access = projectAccess.find(a => a.projectId === projectId)
    return access?.accessTier || 1
  }

  const getTierBadge = (tier: number) => {
    const colors = {
      1: 'bg-yellow-100 text-yellow-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-green-100 text-green-800'
    }
    const labels = {
      1: 'Tier 1 - Overview',
      2: 'Tier 2 - Teaser',
      3: 'Tier 3 - Full Access'
    }
    return (
      <Badge className={colors[tier as keyof typeof colors]}>
        {labels[tier as keyof typeof labels]}
      </Badge>
    )
  }

  const renderProjectContent = (project: Project, tier: number) => {
    switch (tier) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Executive Summary</h4>
              <p className="text-gray-600 text-sm">
                {project.tier1Summary || 'Basic project overview and key metrics available at this tier.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Technology:</span> {project.technologyType}
              </div>
              <div>
                <span className="font-medium">Location:</span> {project.location}
              </div>
              <div>
                <span className="font-medium">Capacity:</span> {project.capacityMw} MW
              </div>
              <div>
                <span className="font-medium">Est. Value:</span> £{project.estimatedValueGbp?.toLocaleString()}
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Detailed Teaser</h4>
              <p className="text-gray-600 text-sm">
                {project.tier2Teaser || 'Detailed project information including financial projections and development timeline.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Technology:</span> {project.technologyType}
              </div>
              <div>
                <span className="font-medium">Location:</span> {project.location}
              </div>
              <div>
                <span className="font-medium">Capacity:</span> {project.capacityMw} MW
              </div>
              <div>
                <span className="font-medium">Est. Value:</span> £{project.estimatedValueGbp?.toLocaleString()}
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-blue-800 text-sm">
                <Lock className="w-4 h-4 inline mr-1" />
                Partial data room access available. Contact Bear Energy for full access.
              </p>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Full Data Room Access</h4>
              <p className="text-gray-600 text-sm">
                {project.tier3FullData || 'Complete project documentation, financial models, legal documents, and technical specifications.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Technology:</span> {project.technologyType}
              </div>
              <div>
                <span className="font-medium">Location:</span> {project.location}
              </div>
              <div>
                <span className="font-medium">Capacity:</span> {project.capacityMw} MW
              </div>
              <div>
                <span className="font-medium">Est. Value:</span> £{project.estimatedValueGbp?.toLocaleString()}
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-md">
              <p className="text-green-800 text-sm">
                <Unlock className="w-4 h-4 inline mr-1" />
                Full access granted. All documents and data room materials available.
              </p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" className="text-green-700 border-green-300">
                  <Download className="w-4 h-4 mr-1" />
                  Download Documents
                </Button>
                <Button size="sm" variant="outline" className="text-green-700 border-green-300">
                  <Eye className="w-4 h-4 mr-1" />
                  View Data Room
                </Button>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="mr-4 text-green-700 hover:text-green-800 hover:bg-green-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
              <div className="flex items-center">
                <Building2 className="w-8 h-8 text-green-800 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Investor Portal</h1>
                  <p className="text-sm text-gray-600">Welcome, {user?.companyName}</p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem('bearEnergyUser')
                navigate('/login')
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">My Projects ({projects.length})</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications ({notifications.filter(n => !Number(n.isRead)).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            {projects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
                  <p className="text-gray-600">
                    Bear Energy will distribute relevant projects to your portfolio based on your investment criteria.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {projects.map((project) => {
                  const accessTier = getAccessTier(project.id)
                  return (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{project.projectName}</CardTitle>
                            <CardDescription>
                              {project.technologyType} • {project.location} • {project.capacityMw} MW
                            </CardDescription>
                          </div>
                          {getTierBadge(accessTier)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {renderProjectContent(project, accessTier)}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
                  <p className="text-gray-600">
                    You'll receive notifications when new projects are added to your portfolio.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card key={notification.id} className={`${Number(notification.isRead) ? 'bg-gray-50' : 'bg-white border-green-200'}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {!Number(notification.isRead) && (
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}