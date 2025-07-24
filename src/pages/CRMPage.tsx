import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { ArrowLeft, Building2, Plus, Search, Filter, Edit, Trash2, MapPin, Zap, DollarSign } from 'lucide-react'
import { createClient } from '@blinkdotnew/sdk'

const blink = createClient({
  projectId: 'pfnexus-clone-bppmyeua',
  authRequired: false
})

interface Developer {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  technologyType: string
  locationCountry: string
  locationRegion: string
  typicalProjectSizeMw: number
  estimatedValueGbp: number
  estimatedSuccessFeePercent: number
  notes: string
  createdAt: string
}

export default function CRMPage() {
  const [user, setUser] = useState<any>(null)
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [technologyFilter, setTechnologyFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const navigate = useNavigate()

  const [newDeveloper, setNewDeveloper] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    technologyType: 'solar',
    locationCountry: '',
    locationRegion: '',
    typicalProjectSizeMw: '',
    estimatedValueGbp: '',
    estimatedSuccessFeePercent: '',
    notes: ''
  })

  const loadDevelopers = async () => {
    try {
      const developersData = await blink.db.crmDevelopers.list({
        orderBy: { companyName: 'asc' }
      })
      setDevelopers(developersData)
      setFilteredDevelopers(developersData)
    } catch (error) {
      console.error('Error loading developers:', error)
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
    if (parsedUser.userType !== 'admin') {
      navigate('/login')
      return
    }

    setUser(parsedUser)
    loadDevelopers()
  }, [navigate])

  useEffect(() => {
    let filtered = developers

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(dev =>
        dev.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev.locationCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev.locationRegion.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by technology
    if (technologyFilter !== 'all') {
      filtered = filtered.filter(dev => dev.technologyType === technologyFilter)
    }

    setFilteredDevelopers(filtered)
  }, [developers, searchTerm, technologyFilter])

  const handleAddDeveloper = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const developerId = `dev_${Date.now()}`
      await blink.db.crmDevelopers.create({
        id: developerId,
        companyName: newDeveloper.companyName,
        contactPerson: newDeveloper.contactPerson,
        email: newDeveloper.email,
        phone: newDeveloper.phone,
        technologyType: newDeveloper.technologyType,
        locationCountry: newDeveloper.locationCountry,
        locationRegion: newDeveloper.locationRegion,
        typicalProjectSizeMw: parseInt(newDeveloper.typicalProjectSizeMw),
        estimatedValueGbp: parseInt(newDeveloper.estimatedValueGbp),
        estimatedSuccessFeePercent: parseFloat(newDeveloper.estimatedSuccessFeePercent),
        notes: newDeveloper.notes,
        userId: user.id
      })

      // Reset form
      setNewDeveloper({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        technologyType: 'solar',
        locationCountry: '',
        locationRegion: '',
        typicalProjectSizeMw: '',
        estimatedValueGbp: '',
        estimatedSuccessFeePercent: '',
        notes: ''
      })

      setIsAddDialogOpen(false)
      loadDevelopers()
    } catch (error) {
      console.error('Error adding developer:', error)
      alert('Error adding developer. Please try again.')
    }
  }

  const deleteDeveloper = async (developerId: string) => {
    if (!confirm('Are you sure you want to delete this developer?')) return

    try {
      await blink.db.crmDevelopers.delete(developerId)
      loadDevelopers()
    } catch (error) {
      console.error('Error deleting developer:', error)
      alert('Error deleting developer. Please try again.')
    }
  }

  const getTechnologyBadge = (tech: string) => {
    const colors = {
      solar: 'bg-yellow-100 text-yellow-800',
      wind: 'bg-blue-100 text-blue-800',
      hydro: 'bg-cyan-100 text-cyan-800',
      battery: 'bg-purple-100 text-purple-800',
      biomass: 'bg-green-100 text-green-800',
      geothermal: 'bg-red-100 text-red-800'
    }
    return (
      <Badge className={colors[tech as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {tech.charAt(0).toUpperCase() + tech.slice(1)}
      </Badge>
    )
  }

  const groupedDevelopers = filteredDevelopers.reduce((acc, dev) => {
    if (!acc[dev.technologyType]) {
      acc[dev.technologyType] = []
    }
    acc[dev.technologyType].push(dev)
    return acc
  }, {} as Record<string, Developer[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CRM...</p>
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
                onClick={() => navigate('/admin')}
                className="mr-4 text-green-700 hover:text-green-800 hover:bg-green-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
              <div className="flex items-center">
                <Building2 className="w-8 h-8 text-green-800 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Developer CRM</h1>
                  <p className="text-sm text-gray-600">{developers.length} developers in database</p>
                </div>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-800 hover:bg-green-900">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Developer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Developer</DialogTitle>
                  <DialogDescription>
                    Enter the developer's information to add them to the CRM system
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddDeveloper} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={newDeveloper.companyName}
                        onChange={(e) => setNewDeveloper(prev => ({ ...prev, companyName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        value={newDeveloper.contactPerson}
                        onChange={(e) => setNewDeveloper(prev => ({ ...prev, contactPerson: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newDeveloper.email}
                        onChange={(e) => setNewDeveloper(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newDeveloper.phone}
                        onChange={(e) => setNewDeveloper(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="technologyType">Technology *</Label>
                      <Select
                        value={newDeveloper.technologyType}
                        onValueChange={(value) => setNewDeveloper(prev => ({ ...prev, technologyType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solar">Solar</SelectItem>
                          <SelectItem value="wind">Wind</SelectItem>
                          <SelectItem value="hydro">Hydro</SelectItem>
                          <SelectItem value="battery">Battery Storage</SelectItem>
                          <SelectItem value="biomass">Biomass</SelectItem>
                          <SelectItem value="geothermal">Geothermal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="locationCountry">Country</Label>
                      <Input
                        id="locationCountry"
                        value={newDeveloper.locationCountry}
                        onChange={(e) => setNewDeveloper(prev => ({ ...prev, locationCountry: e.target.value }))}
                        placeholder="UK"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="locationRegion">Region</Label>
                      <Input
                        id="locationRegion"
                        value={newDeveloper.locationRegion}
                        onChange={(e) => setNewDeveloper(prev => ({ ...prev, locationRegion: e.target.value }))}
                        placeholder="Yorkshire"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="typicalProjectSizeMw">Typical Size (MW)</Label>
                      <Input
                        id="typicalProjectSizeMw"
                        type="number"
                        value={newDeveloper.typicalProjectSizeMw}
                        onChange={(e) => setNewDeveloper(prev => ({ ...prev, typicalProjectSizeMw: e.target.value }))}
                        placeholder="50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedValueGbp">Est. Value (£)</Label>
                      <Input
                        id="estimatedValueGbp"
                        type="number"
                        value={newDeveloper.estimatedValueGbp}
                        onChange={(e) => setNewDeveloper(prev => ({ ...prev, estimatedValueGbp: e.target.value }))}
                        placeholder="50000000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedSuccessFeePercent">Success Fee (%)</Label>
                      <Input
                        id="estimatedSuccessFeePercent"
                        type="number"
                        step="0.1"
                        value={newDeveloper.estimatedSuccessFeePercent}
                        onChange={(e) => setNewDeveloper(prev => ({ ...prev, estimatedSuccessFeePercent: e.target.value }))}
                        placeholder="2.5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newDeveloper.notes}
                      onChange={(e) => setNewDeveloper(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes about the developer..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-green-800 hover:bg-green-900">
                      Add Developer
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search developers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={technologyFilter} onValueChange={setTechnologyFilter}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Technologies</SelectItem>
                    <SelectItem value="solar">Solar</SelectItem>
                    <SelectItem value="wind">Wind</SelectItem>
                    <SelectItem value="hydro">Hydro</SelectItem>
                    <SelectItem value="battery">Battery Storage</SelectItem>
                    <SelectItem value="biomass">Biomass</SelectItem>
                    <SelectItem value="geothermal">Geothermal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Developers by Technology */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all">All ({filteredDevelopers.length})</TabsTrigger>
            <TabsTrigger value="solar">Solar ({groupedDevelopers.solar?.length || 0})</TabsTrigger>
            <TabsTrigger value="wind">Wind ({groupedDevelopers.wind?.length || 0})</TabsTrigger>
            <TabsTrigger value="hydro">Hydro ({groupedDevelopers.hydro?.length || 0})</TabsTrigger>
            <TabsTrigger value="battery">Battery ({groupedDevelopers.battery?.length || 0})</TabsTrigger>
            <TabsTrigger value="biomass">Biomass ({groupedDevelopers.biomass?.length || 0})</TabsTrigger>
            <TabsTrigger value="geothermal">Geothermal ({groupedDevelopers.geothermal?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredDevelopers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Developers Found</h3>
                  <p className="text-gray-600">
                    {searchTerm || technologyFilter !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Add your first developer to get started'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredDevelopers.map((developer) => (
                  <Card key={developer.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{developer.companyName}</h3>
                          <p className="text-gray-600">{developer.contactPerson}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTechnologyBadge(developer.technologyType)}
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" onClick={() => deleteDeveloper(developer.id)} />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {developer.locationRegion}, {developer.locationCountry}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Zap className="w-4 h-4 mr-2" />
                          {developer.typicalProjectSizeMw} MW typical
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          £{developer.estimatedValueGbp?.toLocaleString()} est. value
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          {developer.estimatedSuccessFeePercent}% success fee
                        </div>
                      </div>

                      {developer.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{developer.notes}</p>
                        </div>
                      )}

                      <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                        <span>Added {new Date(developer.createdAt).toLocaleDateString()}</span>
                        <div className="space-x-2">
                          <span>{developer.email}</span>
                          <span>{developer.phone}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {Object.entries(groupedDevelopers).map(([tech, devs]) => (
            <TabsContent key={tech} value={tech} className="space-y-4">
              <div className="grid gap-4">
                {devs.map((developer) => (
                  <Card key={developer.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{developer.companyName}</h3>
                          <p className="text-gray-600">{developer.contactPerson}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTechnologyBadge(developer.technologyType)}
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" onClick={() => deleteDeveloper(developer.id)} />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {developer.locationRegion}, {developer.locationCountry}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Zap className="w-4 h-4 mr-2" />
                          {developer.typicalProjectSizeMw} MW typical
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          £{developer.estimatedValueGbp?.toLocaleString()} est. value
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          {developer.estimatedSuccessFeePercent}% success fee
                        </div>
                      </div>

                      {developer.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{developer.notes}</p>
                        </div>
                      )}

                      <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                        <span>Added {new Date(developer.createdAt).toLocaleDateString()}</span>
                        <div className="space-x-2">
                          <span>{developer.email}</span>
                          <span>{developer.phone}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}