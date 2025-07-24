import React, { useState, useEffect } from 'react';
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
import { Plus, Search, TrendingUp, DollarSign, Clock, Users, CheckCircle, XCircle } from 'lucide-react';

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
  priority: string;
}

interface DealAssignment {
  id: string;
  deal_id: string;
  introducer_id: string;
  mandate_id: string;
  assigned_at: string;
  status: string;
  notes: string;
  commission_percentage: number;
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
  investment_timeline: string;
  status: string;
}

export default function IntroducerPortal() {
  const [user, setUser] = useState<any>(null);
  const [assignments, setAssignments] = useState<DealAssignment[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [mandates, setMandates] = useState<InvestorMandate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // New mandate form state
  const [newMandate, setNewMandate] = useState({
    investor_name: '',
    investor_type: '',
    min_investment: '',
    max_investment: '',
    preferred_technologies: '',
    preferred_regions: '',
    risk_tolerance: 'medium',
    investment_timeline: '6months',
    additional_criteria: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await blink.auth.me();
      setUser(currentUser);

      // Find introducer record for current user
      const introducers = await blink.db.introducers.list({
        where: { user_id: currentUser.id }
      });

      if (introducers.length > 0) {
        const introducerId = introducers[0].id;

        const [assignmentsData, dealsData, mandatesData] = await Promise.all([
          blink.db.dealAssignments.list({
            where: { introducer_id: introducerId },
            orderBy: { assigned_at: 'desc' }
          }),
          blink.db.deals.list({ orderBy: { created_at: 'desc' } }),
          blink.db.investorMandates.list({
            where: { introducer_id: introducerId },
            orderBy: { created_at: 'desc' }
          })
        ]);

        setAssignments(assignmentsData);
        setDeals(dealsData);
        setMandates(mandatesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createMandate = async () => {
    try {
      const introducers = await blink.db.introducers.list({
        where: { user_id: user.id }
      });

      if (introducers.length > 0) {
        const mandateData = {
          id: `mandate_${Date.now()}`,
          introducer_id: introducers[0].id,
          ...newMandate,
          min_investment: parseFloat(newMandate.min_investment) || 0,
          max_investment: parseFloat(newMandate.max_investment) || 0,
          preferred_technologies: JSON.stringify(newMandate.preferred_technologies.split(',').map(t => t.trim())),
          preferred_regions: JSON.stringify(newMandate.preferred_regions.split(',').map(r => r.trim())),
          status: 'active'
        };

        await blink.db.investorMandates.create(mandateData);
        setNewMandate({
          investor_name: '',
          investor_type: '',
          min_investment: '',
          max_investment: '',
          preferred_technologies: '',
          preferred_regions: '',
          risk_tolerance: 'medium',
          investment_timeline: '6months',
          additional_criteria: ''
        });
        loadData();
      }
    } catch (error) {
      console.error('Error creating mandate:', error);
    }
  };

  const updateAssignmentStatus = async (assignmentId: string, status: string, notes?: string) => {
    try {
      await blink.db.dealAssignments.update(assignmentId, {
        status,
        notes: notes || '',
        ...(status === 'completed' && { actual_close_date: new Date().toISOString() })
      });
      loadData();
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  const getAssignedDeals = () => {
    return assignments.map(assignment => {
      const deal = deals.find(d => d.id === assignment.deal_id);
      return { ...assignment, deal };
    }).filter(item => item.deal);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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
          <p className="mt-4 text-gray-600">Loading portal...</p>
        </div>
      </div>
    );
  }

  const assignedDeals = getAssignedDeals();
  const completedDeals = assignedDeals.filter(a => a.status === 'completed');
  const totalCommission = completedDeals.reduce((sum, assignment) => sum + (assignment.commission_amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Introducer Portal</h1>
              <p className="text-gray-600">Welcome back, {user?.email}</p>
            </div>
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Deals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedDeals.length}</div>
              <p className="text-xs text-muted-foreground">
                {assignedDeals.filter(a => a.status === 'assigned').length} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Deals</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedDeals.length}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCommission.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All time earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investor Mandates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
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
        <Tabs defaultValue="assignments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assignments">My Assignments</TabsTrigger>
            <TabsTrigger value="mandates">Investor Mandates</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Deal Assignments</h2>
            </div>

            <div className="grid gap-6">
              {assignedDeals.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{assignment.deal?.title}</CardTitle>
                        <CardDescription className="mt-2">{assignment.deal?.description}</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getPriorityColor(assignment.deal?.priority || '')}>
                          {assignment.deal?.priority}
                        </Badge>
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium capitalize">{assignment.deal?.deal_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Investment</p>
                        <p className="font-medium">${assignment.deal?.investment_required}M</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expected Return</p>
                        <p className="font-medium">{assignment.deal?.expected_return}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Commission</p>
                        <p className="font-medium">{(assignment.commission_percentage * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">{assignment.deal?.location}, {assignment.deal?.country}</p>
                        <p className="text-xs text-gray-400">Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        {assignment.status === 'assigned' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateAssignmentStatus(assignment.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              className="bg-[#004225] hover:bg-[#003319]"
                              onClick={() => updateAssignmentStatus(assignment.id, 'in_progress')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                          </>
                        )}
                        {assignment.status === 'in_progress' && (
                          <Button
                            size="sm"
                            className="bg-[#004225] hover:bg-[#003319]"
                            onClick={() => updateAssignmentStatus(assignment.id, 'completed', 'Deal successfully closed')}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mandates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Investor Mandates</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-[#004225] hover:bg-[#003319]">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Mandate
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Investor Mandate</DialogTitle>
                    <DialogDescription>
                      Define your investor's investment criteria and preferences
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="investor_name">Investor Name</Label>
                      <Input
                        id="investor_name"
                        value={newMandate.investor_name}
                        onChange={(e) => setNewMandate({...newMandate, investor_name: e.target.value})}
                        placeholder="Green Capital Partners"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="investor_type">Investor Type</Label>
                      <Select value={newMandate.investor_type} onValueChange={(value) => setNewMandate({...newMandate, investor_type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="institutional">Institutional</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="fund">Fund</SelectItem>
                          <SelectItem value="bank">Bank</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="min_investment">Min Investment ($M)</Label>
                      <Input
                        id="min_investment"
                        type="number"
                        value={newMandate.min_investment}
                        onChange={(e) => setNewMandate({...newMandate, min_investment: e.target.value})}
                        placeholder="10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_investment">Max Investment ($M)</Label>
                      <Input
                        id="max_investment"
                        type="number"
                        value={newMandate.max_investment}
                        onChange={(e) => setNewMandate({...newMandate, max_investment: e.target.value})}
                        placeholder="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferred_technologies">Preferred Technologies</Label>
                      <Input
                        id="preferred_technologies"
                        value={newMandate.preferred_technologies}
                        onChange={(e) => setNewMandate({...newMandate, preferred_technologies: e.target.value})}
                        placeholder="Solar, Wind, Battery"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferred_regions">Preferred Regions</Label>
                      <Input
                        id="preferred_regions"
                        value={newMandate.preferred_regions}
                        onChange={(e) => setNewMandate({...newMandate, preferred_regions: e.target.value})}
                        placeholder="North America, Europe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="risk_tolerance">Risk Tolerance</Label>
                      <Select value={newMandate.risk_tolerance} onValueChange={(value) => setNewMandate({...newMandate, risk_tolerance: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="investment_timeline">Investment Timeline</Label>
                      <Select value={newMandate.investment_timeline} onValueChange={(value) => setNewMandate({...newMandate, investment_timeline: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="3months">3 Months</SelectItem>
                          <SelectItem value="6months">6 Months</SelectItem>
                          <SelectItem value="12months">12 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="additional_criteria">Additional Criteria</Label>
                      <Textarea
                        id="additional_criteria"
                        value={newMandate.additional_criteria}
                        onChange={(e) => setNewMandate({...newMandate, additional_criteria: e.target.value})}
                        placeholder="Any specific requirements or preferences..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={createMandate} className="bg-[#004225] hover:bg-[#003319]">
                      Create Mandate
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6">
              {mandates.map((mandate) => (
                <Card key={mandate.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{mandate.investor_name}</CardTitle>
                        <CardDescription className="capitalize">{mandate.investor_type} Investor</CardDescription>
                      </div>
                      <Badge className={mandate.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {mandate.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Investment Range</p>
                        <p className="font-medium">${mandate.min_investment}M - ${mandate.max_investment}M</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Risk Tolerance</p>
                        <p className="font-medium capitalize">{mandate.risk_tolerance}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Timeline</p>
                        <p className="font-medium">{mandate.investment_timeline}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium capitalize">{mandate.status}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Preferred Technologies</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {JSON.parse(mandate.preferred_technologies || '[]').map((tech: string, index: number) => (
                            <Badge key={index} variant="outline">{tech}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Preferred Regions</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {JSON.parse(mandate.preferred_regions || '[]').map((region: string, index: number) => (
                            <Badge key={index} variant="outline">{region}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <h2 className="text-2xl font-bold">Performance Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deal Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#004225]">
                    {assignedDeals.length > 0 ? Math.round((completedDeals.length / assignedDeals.length) * 100) : 0}%
                  </div>
                  <p className="text-gray-600">
                    {completedDeals.length} of {assignedDeals.length} deals completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average Commission</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#004225]">
                    ${completedDeals.length > 0 ? Math.round(totalCommission / completedDeals.length).toLocaleString() : 0}
                  </div>
                  <p className="text-gray-600">Per completed deal</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}