import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { ArrowLeft, Upload, FileText, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@blinkdotnew/sdk'

const blink = createClient({
  projectId: 'pfnexus-clone-bppmyeua',
  authRequired: false
})

interface Developer {
  id: string
  companyName: string
  technologyType: string
  location: string
}

export default function ProjectUploadPage() {
  const [user, setUser] = useState<any>(null)
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    projectName: '',
    technologyType: 'solar',
    location: '',
    capacityMw: '',
    estimatedValueGbp: '',
    developerId: '',
    tier1Summary: '',
    tier2Teaser: '',
    tier3FullData: '',
    documentFiles: [] as File[]
  })

  const loadDevelopers = async () => {
    try {
      const developersData = await blink.db.crmDevelopers.list({
        orderBy: { companyName: 'asc' }
      })
      setDevelopers(developersData)
    } catch (error) {
      console.error('Error loading developers:', error)
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setFormData(prev => ({
        ...prev,
        documentFiles: [...prev.documentFiles, ...Array.from(files)]
      }))
    }
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documentFiles: prev.documentFiles.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Upload files to storage first
      const uploadedFiles = []
      for (const file of formData.documentFiles) {
        const { publicUrl } = await blink.storage.upload(
          file,
          `projects/${Date.now()}-${file.name}`,
          { upsert: true }
        )
        uploadedFiles.push({
          name: file.name,
          url: publicUrl,
          type: file.type
        })
      }

      // Create project record
      const projectId = `proj_${Date.now()}`
      await blink.db.projectUploads.create({
        id: projectId,
        projectName: formData.projectName,
        technologyType: formData.technologyType,
        location: formData.location,
        capacityMw: parseFloat(formData.capacityMw),
        estimatedValueGbp: parseInt(formData.estimatedValueGbp),
        developerId: formData.developerId || null,
        tier1Summary: formData.tier1Summary,
        tier2Teaser: formData.tier2Teaser,
        tier3FullData: formData.tier3FullData,
        documentFiles: JSON.stringify(uploadedFiles),
        uploadStatus: 'active',
        uploadedByUserId: user.id
      })

      // Reset form
      setFormData({
        projectName: '',
        technologyType: 'solar',
        location: '',
        capacityMw: '',
        estimatedValueGbp: '',
        developerId: '',
        tier1Summary: '',
        tier2Teaser: '',
        tier3FullData: '',
        documentFiles: []
      })

      alert('Project uploaded successfully!')
      navigate('/admin')

    } catch (error) {
      console.error('Error uploading project:', error)
      alert('Error uploading project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
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
              <div>
                <h1 className="text-xl font-bold text-gray-900">Upload New Project</h1>
                <p className="text-sm text-gray-600">Add projects to distribute to investors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the fundamental details about the project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => handleInputChange('projectName', e.target.value)}
                    placeholder="e.g., Sunfield Solar Farm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="technologyType">Technology Type *</Label>
                  <Select
                    value={formData.technologyType}
                    onValueChange={(value) => handleInputChange('technologyType', value)}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Yorkshire, UK"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacityMw">Capacity (MW) *</Label>
                  <Input
                    id="capacityMw"
                    type="number"
                    step="0.1"
                    value={formData.capacityMw}
                    onChange={(e) => handleInputChange('capacityMw', e.target.value)}
                    placeholder="50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedValueGbp">Estimated Value (£) *</Label>
                  <Input
                    id="estimatedValueGbp"
                    type="number"
                    value={formData.estimatedValueGbp}
                    onChange={(e) => handleInputChange('estimatedValueGbp', e.target.value)}
                    placeholder="50000000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="developerId">Associated Developer</Label>
                <Select
                  value={formData.developerId}
                  onValueChange={(value) => handleInputChange('developerId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a developer (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {developers.map((dev) => (
                      <SelectItem key={dev.id} value={dev.id}>
                        {dev.companyName} - {dev.technologyType} ({dev.location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tiered Information */}
          <Card>
            <CardHeader>
              <CardTitle>Tiered Access Information</CardTitle>
              <CardDescription>
                Define what information is available at each access tier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tier1Summary">Tier 1 - Executive Summary *</Label>
                <Textarea
                  id="tier1Summary"
                  value={formData.tier1Summary}
                  onChange={(e) => handleInputChange('tier1Summary', e.target.value)}
                  placeholder="Basic project overview, key metrics, and high-level information..."
                  rows={4}
                  required
                />
                <p className="text-xs text-gray-500">
                  This information will be visible to all investors initially
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tier2Teaser">Tier 2 - Detailed Teaser</Label>
                <Textarea
                  id="tier2Teaser"
                  value={formData.tier2Teaser}
                  onChange={(e) => handleInputChange('tier2Teaser', e.target.value)}
                  placeholder="Detailed project information, financial projections, development timeline..."
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Additional details for qualified investors
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tier3FullData">Tier 3 - Full Data Room</Label>
                <Textarea
                  id="tier3FullData"
                  value={formData.tier3FullData}
                  onChange={(e) => handleInputChange('tier3FullData', e.target.value)}
                  placeholder="Complete project documentation, financial models, legal documents..."
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Full access granted only after developer approval
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <CardDescription>
                Upload project documents and data room materials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <Label htmlFor="fileUpload" className="cursor-pointer">
                    <span className="text-green-600 hover:text-green-700 font-medium">
                      Click to upload files
                    </span>
                    <span className="text-gray-600"> or drag and drop</span>
                  </Label>
                  <Input
                    id="fileUpload"
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  />
                  <p className="text-xs text-gray-500">
                    PDF, DOC, XLS, PPT files up to 10MB each
                  </p>
                </div>
              </div>

              {formData.documentFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files ({formData.documentFiles.length})</Label>
                  <div className="space-y-2">
                    {formData.documentFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({(file.size / 1024 / 1024).toFixed(1)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-800 hover:bg-green-900"
            >
              {loading ? 'Uploading...' : 'Upload Project'}
              <Plus className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}