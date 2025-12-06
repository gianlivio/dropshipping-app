"use client"

import type { ReactNode } from "react"
import Link from "next/link"

interface AuthShellProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center px-4">
      <div className="max-w-5xl w-full flex flex-col md:flex-row items-center gap-10">
        {/* Lato sinistro: “console” / brand */}
        <div className="text-white md:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#E60012] px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Store Console • Beta</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Benvenuto nella tua{" "}
            <span className="text-[#E60012]">area personale</span>
          </h1>

          {subtitle && (
            <p className="text-sm md:text-base text-gray-300 max-w-md">
              {subtitle}
            </p>
          )}

          <div className="hidden md:flex gap-4 mt-4">
            <div className="h-28 w-14 rounded-full bg-[#E60012] shadow-xl border-4 border-white flex items-center justify-center">
              <span className="h-8 w-8 rounded-full border-4 border-white" />
            </div>
            <div className="h-28 w-14 rounded-full bg-[#3B82F6] shadow-xl border-4 border-white flex items-center justify-center">
              <span className="h-8 w-2 rounded-full bg-white" />
            </div>
          </div>
        </div>

        {/* Lato destro: card form */}
        <div className="md:w-1/2">
          <div className="bg-[#F3F4F6] rounded-3xl border-4 border-[#111827] shadow-[0_12px_0_#111827] p-6 md:p-8 relative overflow-hidden">
            {/* Badge in alto a destra */}
            <div className="absolute -right-6 -top-6 bg-[#E60012] text-white text-xs font-bold px-6 py-3 rounded-full rotate-12 shadow-lg">
              START
            </div>

            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>

            {children}

            <div className="mt-6 text-[11px] md:text-xs text-gray-500 flex items-center justify-between gap-2">
              <span>© {new Date().getFullYear()} Store App</span>
              <Link
                href="/"
                className="underline underline-offset-2 hover:text-[#E60012] transition"
              >
                Torna alla home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
