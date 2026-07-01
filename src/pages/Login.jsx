import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useLoginMutation } from '../store/apiSlice';
import { setCredentials } from '../store/authSlice';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

// Define login validation schema using Zod
const loginSchema = z.object({
  userId: z.string().trim().min(1, 'User ID is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [shaking, setShaking] = useState(false);

  // Initialize react-hook-form with zod schema
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userId: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      const response = await login(data).unwrap();
      
      dispatch(setCredentials({
        token: response.token,
        user: response.user
      }));

      toast.success('Logged in successfully!');
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
      triggerShake();
      const errorMsg = err.data?.message || err.message || 'Login failed. Please verify credentials.';
      toast.error(errorMsg);
    }
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  };

  return (
    <div className="login-page-container">
      <div className="login-page-header-text">login</div>
      <div className="login-wrapper">
        <div className={`login-split-card ${shaking ? 'login-shake' : ''}`}>
          
          {/* Left Column: Illustration Pane */}
          <div className="login-illustration-pane">
            <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '340px' }}>
              <line x1="70" y1="150" x2="78" y2="150" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="74" y1="146" x2="74" y2="154" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="330" y1="210" x2="338" y2="210" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="334" y1="206" x2="334" y2="214" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="285" cy="170" r="3.5" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
              <line x1="45" y1="230" x2="355" y2="230" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
              <line x1="80" y1="234" x2="80" y2="330" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="320" y1="234" x2="320" y2="330" stroke="#94a3b8" strokeWidth="1.5" />
              <rect x="175" y="130" width="50" height="180" rx="25" stroke="#1e2937" strokeWidth="3" fill="#ffffff" />
              <rect x="171" y="125" width="58" height="8" rx="4" fill="#bfdbfe" stroke="#1e2937" strokeWidth="3" />
              <rect x="171" y="307" width="58" height="8" rx="4" fill="#bfdbfe" stroke="#1e2937" strokeWidth="3" />
              <path d="M176.5 155 H223.5 V185 C223.5 185, 215 180, 200 185 C185 190, 176.5 185, 176.5 185 Z" fill="#bfdbfe" stroke="#1e2937" strokeWidth="2.5" />
              <path d="M176.5 270 C176.5 270, 185 265, 200 270 C215 275, 223.5 270, 223.5 270 V295 C223.5 301, 176.5 301, 176.5 295 Z" fill="#bfdbfe" stroke="#1e2937" strokeWidth="2.5" />
              <circle cx="192" cy="225" r="3" fill="#1e2937" />
              <circle cx="208" cy="225" r="3" fill="#1e2937" />
              <path d="M197 230 Q200 233 203 230" stroke="#1e2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <circle cx="188" cy="228" r="2" fill="#fca5a5" />
              <circle cx="212" cy="228" r="2" fill="#fca5a5" />
              <line x1="190" y1="278" x2="210" y2="278" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="190" y1="284" x2="210" y2="284" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M90 190 L160 186 L180 226 L100 226 Z" fill="#f1f5f9" stroke="#1e2937" strokeWidth="3" strokeLinejoin="round" />
              <line x1="110" y1="198" x2="150" y2="195" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
              <line x1="108" y1="206" x2="148" y2="203" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
              <path d="M100 226 L205 226 L195 234 L90 234 Z" fill="#cbd5e1" stroke="#1e2937" strokeWidth="3" strokeLinejoin="round" />
              <path d="M222 215 C238 215, 252 225, 252 235 C252 240, 240 250, 222 245" stroke="#1e2937" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M178 218 C160 215, 150 218, 140 222" stroke="#1e2937" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>

          {/* Right Column: Form Pane */}
          <div className="login-form-pane">
            <div className="login-form-frame">
              
              {/* Logo */}
              <div className="login-logo-container">
                <svg width="160" height="42" viewBox="0 0 160 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 22 Q 22 2, 42 12 T 95 10" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <circle cx="6" cy="22" r="3" fill="#5B5CEB" stroke="#111827" strokeWidth="1.5" />
                  <circle cx="95" cy="10" r="3" fill="#5B5CEB" stroke="#111827" strokeWidth="1.5" />
                  <text x="5" y="32" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="800">
                    <tspan fill="#5B5CEB">Prep</tspan>
                    <tspan fill="#111827">Route</tspan>
                  </text>
                </svg>
              </div>
              
              <div className="login-form-content">
                <h2>Login</h2>
                <div className="subtitle">Use your company provided Login credentials</div>

                <form onSubmit={handleSubmit(onSubmit)} className="login-form-element">
                  <Input
                    label="User ID"
                    id="userId"
                    placeholder="Enter User ID"
                    error={errors.userId?.message}
                    disabled={isLoading}
                    autoComplete="username"
                    {...register('userId')}
                  />

                  <Input
                    label="Password"
                    id="password"
                    type="password"
                    placeholder="Enter Password"
                    error={errors.password?.message}
                    disabled={isLoading}
                    autoComplete="current-password"
                    {...register('password')}
                  />

                  <a 
                    href="#forgot" 
                    className="login-forgot-link" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      alert("Please contact your administrator to recover or reset your password."); 
                    }}
                  >
                    Forgot password?
                  </a>

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    style={{ width: '100%', height: '44px', marginTop: 'auto' }}
                  >
                    Login
                  </Button>
                </form>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
