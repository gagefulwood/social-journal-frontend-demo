"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ReflectInProgress() {
    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-8 text-center">

            <h1 className="text-3xl font-bold mb-8">
                Password Reset Form
            </h1>

            <p className="text-2xl text-gray-600 mb-10">
                This page is currently under construction. Please excuse our progress!
            </p>

            <div className="flex justify-center items-center mb-8">
                <img
                    className="max-w-xs md:max-w-sm"
                    src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnIxdzYzZzZ5Z2Rwd3FubWY2bmg2b3pwMGdyZW53cGswbnd4YjV1ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/vR1dPIYzQmkRzLZk2w/giphy.gif"
                    alt="Penguin Progress"
                />
            </div>

            <div className="flex justify-center">
                <Button asChild variant="outline" className="px-8 py-6 text-lg">
                    <Link href="/auth/login">
                        Return to Login/Registration
                    </Link>
                </Button>
            </div>

        </main>
    );
}