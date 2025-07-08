"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/api";
import { useAuthRedirect } from "@/lib/useAuthRedirect";
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
  useAuthRedirect({ requireAuth: false, redirectTo: "/dashboard" });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
        setError(err.response?.data?.error || "Login failed");
      } else {
        setError("Login failed");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
                onChange={(e) => setUsername(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
