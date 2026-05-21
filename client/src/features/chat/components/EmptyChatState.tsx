export const EmptyChatState = ({ title, description }: { title: string; description: string }) => (
    <div className="grid h-full place-items-center p-6 text-center">
        <div className="flex flex-col items-center max-w-xs">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-lg">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-wide">{title}</h3>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-medium">{description}</p>
        </div>
    </div>
)
