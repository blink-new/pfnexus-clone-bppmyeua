import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { ArrowLeft, Building2 } from 'lucide-react'
import { createClient } from '@blinkdotnew/sdk'

const blink = createClient({
  projectId: 'pfnexus-clone-bppmyeua',
  authRequired: false
})

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Query users table for authentication
      const users = await blink.db.users.list({
        where: {
          AND: [
            { username: username },
            { password: password },
            { is_active: "1" }
          ]
        }
      })

      if (users.length === 0) {
        setError('Invalid username or password')
        setLoading(false)
        return
      }

      const user = users[0]
      
      // Store user session in localStorage
      localStorage.setItem('bearEnergyUser', JSON.stringify(user))
      
      // Update last login
      await blink.db.users.update(user.id, {
        lastLogin: new Date().toISOString()
      })

      // Redirect based on user type
      if (user.userType === 'admin') {
        navigate('/admin')
      } else if (user.userType === 'introducer') {
        navigate('/introducer')
      } else if (user.userType === 'investor') {
        navigate('/investor')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
      console.error('Login error:', err)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-green-700 hover:text-green-800 hover:bg-green-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-800 rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Bear Energy Portal
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-11"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-green-800 hover:bg-green-900 text-white"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Demo Accounts:</p>
                <div className="space-y-1 text-xs">
                  <p><strong>Admin:</strong> admin / admin123</p>
                  <p><strong>Introducer:</strong> introducer / intro123</p>
                  <p><strong>Investor:</strong> investor / investor123</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}