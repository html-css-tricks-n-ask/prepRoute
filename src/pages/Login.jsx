import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useLoginMutation } from "../store/apiSlice";
import { setCredentials } from "../store/authSlice";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Logo from "../components/common/Logo";
import loginIllustration from "../assets/login-illustration.png";

// Define login validation schema using Zod
const loginSchema = z.object({
  userId: z.string().trim().min(1, "User ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userId: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await login(data).unwrap();

      dispatch(
        setCredentials({
          token: response.token,
          user: response.user,
        }),
      );

      toast.success("Logged in successfully!");
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
      triggerShake();
      const errorMsg =
        err.data?.message ||
        err.message ||
        "Login failed. Please verify credentials.";
      toast.error(errorMsg);
    }
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  };

  return (
    <div className="login-page-container">
      <div className="login-wrapper">
        <div className={`login-split-card ${shaking ? "login-shake" : ""}`}>
          {/* Left Column: Illustration Pane */}
          <div className="login-illustration-pane">
            <img
              src={loginIllustration}
              alt="Login Illustration"
              style={{ maxWidth: "340px", width: "100%", height: "auto" }}
            />
          </div>

          {/* Right Column: Form Pane */}
          <div className="login-form-pane">
            <div className="login-form-frame">
              {/* Logo */}

              <div className="login-logo-container">
                <Logo variant="full" height={44} />
              </div>

              <div className="login-form-content">
                <h2>Login</h2>
                <div className="subtitle">
                  Use your company provided Login credentials
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="login-form-element"
                >
                  <Input
                    label="User ID"
                    id="userId"
                    placeholder="Enter User ID"
                    error={errors.userId?.message}
                    disabled={isLoading}
                    autoComplete="username"
                    {...register("userId")}
                  />

                  <Input
                    label="Password"
                    id="password"
                    type="password"
                    placeholder="Enter Password"
                    error={errors.password?.message}
                    disabled={isLoading}
                    autoComplete="current-password"
                    {...register("password")}
                  />

                  <a
                    href="#forgot"
                    className="login-forgot-link"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(
                        "Please contact your administrator to recover or reset your password.",
                      );
                    }}
                  >
                    Forgot password?
                  </a>

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    style={{ width: "100%", height: "44px", marginTop: "auto" }}
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
