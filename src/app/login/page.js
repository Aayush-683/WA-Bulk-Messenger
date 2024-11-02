"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/");
        }
    }, [session, status]);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
            <div className="p-8 bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-white mb-4">Sign In</h2>
                <button
                    onClick={() => signIn("facebook")}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Sign in with Facebook
                </button>
            </div>
        </div>
    );
}
