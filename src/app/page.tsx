import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <SignedIn>
                <div className="text-center space-y-8">
                    <h1 className="text-4xl font-bold">Welcome to your Chat App!</h1>
                    <p className="text-xl text-gray-600">
                        Go to the chat dashboard to start messaging.
                    </p>
                    <Link
                        href="/chat"
                        className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Go to Chat
                    </Link>
                    <div className="mt-8">
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </SignedIn>

            <SignedOut>
                <div className="text-center space-y-8">
                    <h1 className="text-4xl font-bold">Real-Time Chat App</h1>
                    <p className="text-xl text-gray-600">Sign in to start chatting</p>
                    <Link
                        href="/sign-in"
                        className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Sign In
                    </Link>
                </div>
            </SignedOut>
        </div>
    );
}