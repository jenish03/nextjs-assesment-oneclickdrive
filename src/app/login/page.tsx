"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/api";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface AxiosErrorLike {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginInProgress, setLoginInProgress] = useState(false);
  const router = useRouter();

  function isAxiosError(error: unknown): error is AxiosErrorLike {
    return (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as AxiosErrorLike).response === "object"
    );
  }

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (err: unknown) => {
      if (isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
            "Invalid username or password. Please try again."
        );
      } else {
        setError("Invalid username or password. Please try again.");
      }
    },
    onSettled: () => {
      setLoginInProgress(false);
    },
  });

  // Only run useAuthRedirect when not logging in
  useAuthRedirect({
    requireAuth: false,
    redirectTo: loginInProgress ? "" : "/dashboard",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoginInProgress(true);
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm mb-2">
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="username" className="mb-1">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError("");
                }}
                required
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="password" className="mb-1">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loginMutation.isPending || loginInProgress}
            >
              {loginMutation.isPending || loginInProgress
                ? "Logging in..."
                : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
      {/* Credentials hint for interviewer */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <div>
          <strong>Demo Credentials</strong>
        </div>
        <div>
          Username:{" "}
          <span className="font-mono bg-gray-200 px-1 rounded">admin</span>
        </div>
        <div>
          Password:{" "}
          <span className="font-mono bg-gray-200 px-1 rounded">
            password123
          </span>
        </div>
      </div>
    </div>
  );
}
