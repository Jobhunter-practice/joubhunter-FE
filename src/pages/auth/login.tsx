import {
    Button,
    Divider,
    Form,
    Input,
    message,
    notification,
    Typography,
    Space,
} from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { callLogin, callGetAuthURL } from 'config/api';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserLoginInfo } from '@/redux/slice/accountSlide';
import { useAppSelector } from '@/redux/hooks';
import GoogleButton from '@/components/ui/google-button';
import GithubButton from '@/components/ui/github-button';
import styles from 'styles/auth.module.scss';

const { Title, Text } = Typography;

interface LoginFormValues {
    username: string;
    password: string;
}

const LoginPage = () => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const dispatch = useDispatch();
    const isAuthenticated = useAppSelector(
        state => state.account.isAuthenticated,
    );

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const callback = params?.get('callback');

    useEffect(() => {
        if (isAuthenticated) {
            window.location.href = '/';
        }
    }, [isAuthenticated]);

    const onFinish = async (values: LoginFormValues) => {
        const { username, password } = values;
        setIsSubmitting(true);

        try {
            const res = await callLogin(username, password);
            if (res?.data) {
                localStorage.setItem('access_token', res.data.access_token);
                dispatch(setUserLoginInfo(res.data.user));
                message.success('Đăng nhập thành công!');
                window.location.href = callback || '/';
            } else {
                throw new Error(res.message || 'Đăng nhập thất bại');
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi đăng nhập',
                description: (error as Error).message,
                duration: 5,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSocialLogin = async (provider: string) => {
        try {
            const res = await callGetAuthURL(provider);
            if (res?.data) {
                window.location.href = res.data;
            }
        } catch (error) {
            notification.error({
                message: 'Authentication Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to initialize OAuth login',
                duration: 5,
            });
        }
    };

    return (
        <div className={styles['login-page']}>
            <main className={styles.main}>
                <div className={styles.container}>
                    <section className={styles.wrapper}>
                        <Title level={2} className={styles.heading}>
                            Đăng Nhập
                        </Title>
                        <Divider />
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '10px',
                                justifyContent: 'center',
                            }}
                        >
                            <GoogleButton
                                onClick={() => handleSocialLogin('google')}
                            />
                            <GithubButton
                                onClick={() => handleSocialLogin('github')}
                            />
                        </div>

                        <Divider />
            
                        <Form<LoginFormValues>
                            name="login"
                            layout="vertical"
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            <Form.Item
                                label="Email"
                                name="username"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập email!',
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="Nhập email của bạn"
                                    aria-label="Email"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Mật khẩu"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập mật khẩu!',
                                    },
                                ]}
                            >
                                <Input.Password
                                    placeholder="Nhập mật khẩu"
                                    aria-label="Mật khẩu"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSubmitting}
                                    block
                                >
                                    Đăng nhập
                                </Button>
                            </Form.Item>

                            <Divider>Hoặc</Divider>

                            <Text className={styles.footerText}>
                                Chưa có tài khoản?{' '}
                                <Link to="/register">Đăng Ký</Link>
                            </Text>
                        </Form>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
