import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OtpAuthPage = () => {
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      login(token);
      navigate('/dashboard', { replace: true });
    }
  }, [login, navigate]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = window.location.hostname.includes('vercel.app') 
                   ? 'https://your-backend-url.onrender.com' 
                   : 'http://localhost:8080';

      const response = await fetch(`${apiUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2);
        if (data.mockOtpCode) {
          alert(`[MOCK EMAIL/SMS SYSTEM]\n\nYour OTP is: ${data.mockOtpCode}`);
        }
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = window.location.hostname.includes('vercel.app') 
                   ? 'https://your-backend-url.onrender.com' 
                   : 'http://localhost:8080';

      const response = await fetch(`${apiUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otpCode }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid or expired OTP');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="route-container route-container--centered" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
          {step === 1 ? 'Login / Register' : 'Verify Identity'}
        </h2>
        
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <a 
              href={window.location.hostname.includes('vercel.app') ? 'https://your-backend-url.onrender.com/oauth2/authorization/google' : 'http://localhost:8080/oauth2/authorization/google'} 
              className="btn btn--ghost btn--block" 
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '8px', border: '1px solid var(--color-border)', textDecoration: 'none' }}
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Logo" style={{ width: '20px', height: '20px' }} />
              Sign in with Google
            </a>
            
            <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px', margin: '8px 0' }}>— OR —</div>

            <div className="field">
              <label className="label">Email or Phone Number</label>
              <input 
                type="text" 
                className="input" 
                placeholder="user@example.com or 1234567890" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn--primary btn--block mt-4" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="field">
              <label className="label">Enter 6-Digit OTP</label>
              <input 
                type="text" 
                className="input" 
                placeholder="••••••"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '20px' }}
              />
            </div>

            <button type="submit" className="btn btn--primary btn--block mt-4" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button 
              type="button" 
              className="btn btn--ghost btn--block" 
              onClick={() => setStep(1)}
              style={{ marginTop: '8px' }}
            >
              Back to Start
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default OtpAuthPage;
