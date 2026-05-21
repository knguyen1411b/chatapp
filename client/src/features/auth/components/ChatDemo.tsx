import { motion } from 'framer-motion'

const messages = [
    {
        name: 'Khánh Nguyên',
        text: 'Xin chào nhé!',
        align: 'left'
    },
    {
        name: 'You',
        text: 'Xin chào! Rất vui được gặp bạn ở đây.',
        align: 'right'
    },
    {
        name: 'Đình Hàm',
        text: 'Chào bạn! Rất vui được kết nối với bạn.',
        align: 'left'
    }
]
export const ChatDemo = () => (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.5 }}
        className="relative z-10 mx-auto w-full max-w-md"
    >
        <div className="rounded-[28px] border border-white/20 bg-white/15 p-4 shadow-2xl backdrop-blur-2xl">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/30" />
                    <div>
                        <div className="h-3 w-24 rounded-full bg-white/70" />
                        <div className="mt-2 h-2 w-16 rounded-full bg-white/35" />
                    </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-white/20" />
            </div>

            <div className="space-y-3">
                {messages.map((message, index) => (
                    <motion.div
                        key={message.text}
                        initial={{ opacity: 0, x: message.align === 'right' ? 18 : -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + index * 0.12 }}
                        className={`flex ${message.align === 'right' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`
                                                        max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-lg
                                                        ${
                                                            message.align === 'right'
                                                                ? 'rounded-br-md bg-white text-slate-900'
                                                                : 'rounded-bl-md bg-black/20 text-white'
                                                        }
                                                    `}
                        >
                            <div className="mb-1 text-[11px] font-semibold opacity-70">{message.name}</div>
                            {message.text}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/20 p-2">
                <div className="h-9 flex-1 rounded-xl bg-white/30" />
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600">➤</div>
            </div>
        </div>
    </motion.div>
)
