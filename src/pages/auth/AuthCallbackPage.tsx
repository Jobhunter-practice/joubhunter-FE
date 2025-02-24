import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserLoginInfo } from '@/redux/slice/accountSlide';
import { callOAuth2Login } from 'config/api';
import { message, notification } from 'antd';

const AuthCallbackPage = () => {
    debugger;
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [isProcessing, setIsProcessing] = useState(true);
    const processedRef = useRef(false);

    useEffect(() => {
        const handleOAuthCallback = async () => {
            // If already processed, skip
            if (processedRef.current) return;
            processedRef.current = true;
            try {
                const provider = location.pathname.split('/')[2];

                if (!['google', 'facebook'].includes(provider)) {
                    throw new Error('Invalid provider');
                }

                const params = new URLSearchParams(location.search);
                const code = params.get('code');

                if (!code) {
                    throw new Error('Missing authentication code');
                }

                const res = await callOAuth2Login(provider, code);

                if (res?.data) {
                    localStorage.setItem('access_token', res.data.access_token);
                    dispatch(setUserLoginInfo(res.data.user));
                    message.success('Đăng nhập thành công!');

                    // Get the stored callback URL if any
                    const storedCallback =
                        sessionStorage.getItem('oauth_callback_url');
                    sessionStorage.removeItem('oauth_callback_url'); // Clean up

                    window.location.href = storedCallback || '/';
                } else {
                    throw new Error(res.message || 'Đăng nhập thất bại');
                }
            } catch (error) {
                notification.error({
                    message: 'Login Error',
                    description:
                        error instanceof Error
                            ? error.message
                            : 'Failed to complete OAuth login',
                });
                navigate('/login');
            } finally {
                setIsProcessing(false);
            }
        };

        handleOAuthCallback();
    }, []);

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center">
                <h2>Processing Login...</h2>
                {isProcessing && (
                    <p>Please wait while we complete your authentication.</p>
                )}
            </div>
        </div>
    );
};

export default AuthCallbackPage;
