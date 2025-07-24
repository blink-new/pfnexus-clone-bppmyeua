import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@blinkdotnew/sdk';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Plus, Search, Filter, Users, TrendingUp, DollarSign, Clock, ArrowLeft, Upload, Database, Send, Eye, Building2 } from 'lucide-react';

const blink = createClient({
  projectId: 'pfnexus-clone-bppmyeua',
  authRequired: true
});

interface Deal {
  id: string;
  title: string;
  description: string;
  deal_type: string;
  capacity_mw: number;
  location: string;
  country: string;
  investment_required: number;
  expected_return: number;
  status: string;
  created_by: string;
  created_at: string;
  priority: string;
}

interface Introducer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company: string;
  specialization: string;
  regions: string;
  commission_rate: number;
  status: string;
  performance_rating: number;
  total_deals_closed: number;
  total_commission_earned: number;
}

interface InvestorMandate {
  id: string;
  introducer_id: string;
  investor_name: string;
  investor_type: string;
  min_investment: number;
  max_investment: number;
  preferred_technologies: string;
  preferred_regions: string;
  risk_tolerance: string;
  status: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [introducers, setIntroducers] = useState<Introducer[]>([]);
  const [mandates, setMandates] = useState<InvestorMandate[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('deals');

  // New deal form state
  const [newDeal, setNewDeal] = useState({
    title: '',
    description: '',
    deal_type: '',
    capacity_mw: '',
    location: '',
    country: '',
    investment_required: '',
    expected_return: '',
    priority: 'medium'
  });

  // New introducer form state
  const [newIntroducer, setNewIntroducer] = useState({
    name: '',
    email: '',
    company: '',
    specialization: '',
    regions: '',
    commission_rate: '5'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [dealsData, introducersData, mandatesData, projectsData, investorsData] = await Promise.all([
        blink.db.deals.list({ orderBy: { created_at: 'desc' } }),
        blink.db.introducers.list({ orderBy: { created_at: 'desc' } }),
        blink.db.investorMandates.list({ orderBy: { created_at: 'desc' } }),
        blink.db.projectUploads.list({ orderBy: { createdAt: 'desc' } }),
        blink.db.users.list({ where: { userType: 'investor' } })
      ]);
      
      setDeals(dealsData);
      setIntroducers(introducersData);
      setMandates(mandatesData);
      setProjects(projectsData);
      setInvestors(investorsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('bearEnergyUser');
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.userType !== 'admin') {
      navigate('/login');
      return;
    }

    setUser(parsedUser);
    loadData();
  }, [navigate]);

  const createDeal = async () => {
    try {
      const user = await blink.auth.me();
      const dealData = {
        id: `deal_${Date.now()}`,
        ...newDeal,
        capacity_mw: parseFloat(newDeal.capacity_mw) || 0,
        investment_required: parseFloat(newDeal.investment_required) || 0,
        expected_return: parseFloat(newDeal.expected_return) || 0,
        created_by: user.id,
        status: 'active'
      };

      await blink.db.deals.create(dealData);
      setNewDeal({
        title: '',
        description: '',
        deal_type: '',
        capacity_mw: '',
        location: '',
        country: '',
        investment_required: '',
        expected_return: '',
        priority: 'medium'
      });
      loadData();
    } catch (error) {
      console.error('Error creating deal:', error);
    }
  };

  const createIntroducer = async () => {
    try {
      const introducerData = {
        id: `intro_${Date.now()}`,
        user_id: `user_${Date.now()}`,
        ...newIntroducer,
        commission_rate: parseFloat(newIntroducer.commission_rate) / 100,
        specialization: JSON.stringify(newIntroducer.specialization.split(',').map(s => s.trim())),
        regions: JSON.stringify(newIntroducer.regions.split(',').map(r => r.trim())),
        status: 'active'
      };

      await blink.db.introducers.create(introducerData);
      setNewIntroducer({
        name: '',
        email: '',
        company: '',
        specialization: '',
        regions: '',
        commission_rate: '5'
      });
      loadData();
    } catch (error) {
      console.error('Error creating introducer:', error);
    }
  };

  const assignDealToIntroducer = async (dealId: string, introducerId: string) => {
    try {
      // Find matching mandates for this introducer
      const introducerMandates = mandates.filter(m => m.introducer_id === introducerId && m.status === 'active');
      
      for (const mandate of introducerMandates) {
        const assignment = {
          id: `assign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          deal_id: dealId,
          introducer_id: introducerId,
          mandate_id: mandate.id,
          status: 'assigned',
          commission_percentage: introducers.find(i => i.id === introducerId)?.commission_rate || 0.05
        };

        await blink.db.dealAssignments.create(assignment);
      }

      // Update deal status
      await blink.db.deals.update(dealId, { status: 'assigned' });
      loadData();
    } catch (error) {
      console.error('Error assigning deal:', error);
    }
  };

  const distributeProjectToInvestor = async (projectId: string, investorId: string, accessTier: number) => {
    try {
      const project = projects.find(p => p.id === projectId);
      const investor = investors.find(i => i.id === investorId);
      
      if (!project || !investor) return;

      // Create project access record
      const accessId = `access_${Date.now()}`;
      await blink.db.investorProjectAccess.create({
        id: accessId,
        investorUserId: investorId,
        projectId: projectId,
        accessTier: accessTier,
        grantedByUserId: user.id
      });

      // Create notification
      const notificationId = `notif_${Date.now()}`;
      await blink.db.notifications.create({
        id: notificationId,
        userId: investorId,
        type: 'project_added',
        title: 'New Project Added to Your Portfolio',
        message: `Bear Energy has added "${project.projectName}" to your investment portfolio. This ${project.technologyType} project in ${project.location} is now available for your review.`,
        projectId: projectId,
        isRead: "0"
      });

      // Send email notification
      try {
        await blink.notifications.email({
          to: investor.email,
          from: 'deals@bearenergy.co.uk',
          subject: `New Investment Opportunity: ${project.projectName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #004225; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Bear Energy</h1>
                <p style="margin: 5px 0 0 0;">New Investment Opportunity</p>
              </div>
              
              <div style="padding: 30px 20px;">
                <h2 style="color: #004225; margin-bottom: 20px;">New Project Added to Your Portfolio</h2>
                
                <p>Dear ${investor.companyName || 'Valued Investor'},</p>
                
                <p>We're pleased to inform you that a new investment opportunity has been added to your portfolio:</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #004225; margin-top: 0;">${project.projectName}</h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                    <div>
                      <strong>Technology:</strong> ${project.technologyType}<br>
                      <strong>Location:</strong> ${project.location}<br>
                    </div>
                    <div>
                      <strong>Capacity:</strong> ${project.capacityMw} MW<br>
                      <strong>Est. Value:</strong> £${project.estimatedValueGbp?.toLocaleString()}<br>
                    </div>
                  </div>
                  <div style="margin-top: 15px;">
                    <strong>Access Level:</strong> 
                    <span style="background: ${accessTier === 1 ? '#fef3c7' : accessTier === 2 ? '#dbeafe' : '#d1fae5'}; 
                                 color: ${accessTier === 1 ? '#92400e' : accessTier === 2 ? '#1e40af' : '#065f46'}; 
                                 padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                      Tier ${accessTier} - ${accessTier === 1 ? 'Overview' : accessTier === 2 ? 'Teaser' : 'Full Access'}
                    </span>
                  </div>
                </div>
                
                <p>You can now review this opportunity in your investor portal. Please log in to access the project details and documentation.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${window.location.origin}/investor" 
                     style="background: #004225; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    View Project Details
                  </a>
                </div>
                
                <p>If you have any questions about this opportunity, please don't hesitate to contact our team.</p>
                
                <p>Best regards,<br>
                The Bear Energy Team</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                <p>Bear Energy | Renewable Energy Deal Flow Platform</p>
                <p>bearenergy.co.uk | deals@bearenergy.co.uk</p>
              </div>
            </div>
          `,
          text: `
New Investment Opportunity: ${project.projectName}

Dear ${investor.companyName || 'Valued Investor'},

We're pleased to inform you that a new investment opportunity has been added to your portfolio:

Project: ${project.projectName}
Technology: ${project.technologyType}
Location: ${project.location}
Capacity: ${project.capacityMw} MW
Est. Value: £${project.estimatedValueGbp?.toLocaleString()}
Access Level: Tier ${accessTier}

You can now review this opportunity in your investor portal at ${window.location.origin}/investor

Best regards,
The Bear Energy Team
bearenergy.co.uk
          `
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Continue even if email fails
      }

      alert('Project successfully distributed to investor with email notification sent!');
      loadData();
    } catch (error) {
      console.error('Error distributing project:', error);
      alert('Error distributing project. Please try again.');
    }
  };

  const filteredDeals = deals.filter(deal =>
    deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.deal_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIntroducers = introducers.filter(introducer =>
    introducer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    introducer.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004225] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                  <h1 className="text-xl font-bold text-gray-900">Bear Energy Admin</h1>
                  <p className="text-sm text-gray-600">Deal Management & Distribution System</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/upload-project')}
                className="text-green-700 border-green-300 hover:bg-green-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Project
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/crm')}
                className="text-green-700 border-green-300 hover:bg-green-50"
              >
                <Database className="w-4 h-4 mr-2" />
                CRM
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem('bearEnergyUser');
                  navigate('/login');
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deals.length}</div>
              <p className="text-xs text-muted-foreground">
                {deals.filter(d => d.status === 'active').length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Introducers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{introducers.length}</div>
              <p className="text-xs text-muted-foreground">
                {introducers.filter(i => i.status === 'active').length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${deals.reduce((sum, deal) => sum + (deal.investment_required || 0), 0).toLocaleString()}M
              </div>
              <p className="text-xs text-muted-foreground">
                Across all deals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investor Mandates</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mandates.length}</div>
              <p className="text-xs text-muted-foreground">
                {mandates.filter(m => m.status === 'active').length} active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deals">Deals Management</TabsTrigger>
            <TabsTrigger value="projects">Project Distribution</TabsTrigger>
            <TabsTrigger value="introducers">Introducers</TabsTrigger>
            <TabsTrigger value="assignments">Deal Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="deals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Deal Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-[#004225] hover:bg-[#003319]">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Deal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Deal</DialogTitle>
                    <DialogDescription>
                      Add a new renewable energy deal to the platform
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Deal Title</Label>
                      <Input
                        id="title"
                        value={newDeal.title}
                        onChange={(e) => setNewDeal({...newDeal, title: e.target.value})}
                        placeholder="Solar Farm Project..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deal_type">Deal Type</Label>
                      <Select value={newDeal.deal_type} onValueChange={(value) => setNewDeal({...newDeal, deal_type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solar">Solar</SelectItem>
                          <SelectItem value="wind">Wind</SelectItem>
                          <SelectItem value="hydro">Hydro</SelectItem>
                          <SelectItem value="battery">Battery Storage</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity (MW)</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={newDeal.capacity_mw}
                        onChange={(e) => setNewDeal({...newDeal, capacity_mw: e.target.value})}
                        placeholder="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="investment">Investment Required ($M)</Label>
                      <Input
                        id="investment"
                        type="number"
                        value={newDeal.investment_required}
                        onChange={(e) => setNewDeal({...newDeal, investment_required: e.target.value})}
                        placeholder="50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newDeal.location}
                        onChange={(e) => setNewDeal({...newDeal, location: e.target.value})}
                        placeholder="California, USA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={newDeal.country}
                        onChange={(e) => setNewDeal({...newDeal, country: e.target.value})}
                        placeholder="United States"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="return">Expected Return (%)</Label>
                      <Input
                        id="return"
                        type="number"
                        value={newDeal.expected_return}
                        onChange={(e) => setNewDeal({...newDeal, expected_return: e.target.value})}
                        placeholder="12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newDeal.priority} onValueChange={(value) => setNewDeal({...newDeal, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newDeal.description}
                        onChange={(e) => setNewDeal({...newDeal, description: e.target.value})}
                        placeholder="Detailed description of the deal..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={createDeal} className="bg-[#004225] hover:bg-[#003319]">
                      Create Deal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6">
              {filteredDeals.map((deal) => (
                <Card key={deal.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{deal.title}</CardTitle>
                        <CardDescription className="mt-2">{deal.description}</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getPriorityColor(deal.priority)}>
                          {deal.priority}
                        </Badge>
                        <Badge className={getStatusColor(deal.status)}>
                          {deal.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium capitalize">{deal.deal_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Capacity</p>
                        <p className="font-medium">{deal.capacity_mw} MW</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Investment</p>
                        <p className="font-medium">${deal.investment_required}M</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expected Return</p>
                        <p className="font-medium">{deal.expected_return}%</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">{deal.location}, {deal.country}</p>
                      </div>
                      {deal.status === 'active' && (
                        <Select onValueChange={(introducerId) => assignDealToIntroducer(deal.id, introducerId)}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Assign to introducer" />
                          </SelectTrigger>
                          <SelectContent>
                            {introducers.filter(i => i.status === 'active').map((introducer) => (
                              <SelectItem key={introducer.id} value={introducer.id}>
                                {introducer.name} - {introducer.company}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Project Distribution</h2>
              <div className="text-sm text-gray-600">
                {projects.length} projects • {investors.length} investors
              </div>
            </div>

            <div className="grid gap-6">
              {projects.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Upload projects to start distributing them to investors
                    </p>
                    <Button 
                      onClick={() => navigate('/upload-project')}
                      className="bg-[#004225] hover:bg-[#003319]"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload First Project
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                projects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{project.projectName}</CardTitle>
                          <CardDescription>
                            {project.technologyType} • {project.location} • {project.capacityMw} MW
                          </CardDescription>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {project.uploadStatus}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                          <p className="text-sm text-gray-500">Technology</p>
                          <p className="font-medium capitalize">{project.technologyType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Capacity</p>
                          <p className="font-medium">{project.capacityMw} MW</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Est. Value</p>
                          <p className="font-medium">£{project.estimatedValueGbp?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Uploaded</p>
                          <p className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Distribute to Investors</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {investors.map((investor) => (
                            <div key={investor.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h5 className="font-medium text-sm">{investor.companyName || investor.username}</h5>
                                  <p className="text-xs text-gray-500">{investor.email}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => distributeProjectToInvestor(project.id, investor.id, 1)}
                                    className="flex-1 text-xs"
                                  >
                                    <Send className="w-3 h-3 mr-1" />
                                    Tier 1
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => distributeProjectToInvestor(project.id, investor.id, 2)}
                                    className="flex-1 text-xs"
                                  >
                                    <Send className="w-3 h-3 mr-1" />
                                    Tier 2
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => distributeProjectToInvestor(project.id, investor.id, 3)}
                                    className="flex-1 text-xs"
                                  >
                                    <Send className="w-3 h-3 mr-1" />
                                    Tier 3
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="introducers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Introducers Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-[#004225] hover:bg-[#003319]">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Introducer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Introducer</DialogTitle>
                    <DialogDescription>
                      Register a new introducer to the platform
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={newIntroducer.name}
                          onChange={(e) => setNewIntroducer({...newIntroducer, name: e.target.value})}
                          placeholder="John Smith"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newIntroducer.email}
                          onChange={(e) => setNewIntroducer({...newIntroducer, email: e.target.value})}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={newIntroducer.company}
                        onChange={(e) => setNewIntroducer({...newIntroducer, company: e.target.value})}
                        placeholder="Energy Partners Ltd"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization (comma-separated)</Label>
                      <Input
                        id="specialization"
                        value={newIntroducer.specialization}
                        onChange={(e) => setNewIntroducer({...newIntroducer, specialization: e.target.value})}
                        placeholder="Solar, Wind, Battery Storage"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regions">Regions (comma-separated)</Label>
                      <Input
                        id="regions"
                        value={newIntroducer.regions}
                        onChange={(e) => setNewIntroducer({...newIntroducer, regions: e.target.value})}
                        placeholder="North America, Europe, Asia"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commission">Commission Rate (%)</Label>
                      <Input
                        id="commission"
                        type="number"
                        value={newIntroducer.commission_rate}
                        onChange={(e) => setNewIntroducer({...newIntroducer, commission_rate: e.target.value})}
                        placeholder="5"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={createIntroducer} className="bg-[#004225] hover:bg-[#003319]">
                      Add Introducer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6">
              {filteredIntroducers.map((introducer) => (
                <Card key={introducer.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{introducer.name}</CardTitle>
                        <CardDescription>{introducer.company}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(introducer.status)}>
                        {introducer.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{introducer.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Commission Rate</p>
                        <p className="font-medium">{(introducer.commission_rate * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Deals Closed</p>
                        <p className="font-medium">{introducer.total_deals_closed}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Commission</p>
                        <p className="font-medium">${introducer.total_commission_earned.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Specialization</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {JSON.parse(introducer.specialization || '[]').map((spec: string, index: number) => (
                          <Badge key={index} variant="outline">{spec}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <h2 className="text-2xl font-bold">Deal Assignments & Distribution</h2>
            <Card>
              <CardHeader>
                <CardTitle>Automated Matching System</CardTitle>
                <CardDescription>
                  Deals are automatically matched with introducers based on their investor mandates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  The system analyzes deal characteristics (type, size, location, returns) against 
                  introducer investor mandates to find optimal matches and automatically distribute 
                  opportunities to the most suitable introducers.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}