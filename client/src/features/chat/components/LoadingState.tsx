import { Skeleton, Space, Typography } from 'antd'

export const LoadingState = ({ label = 'Đang tải…' }: { label?: string }) => (
    <div className="h-full p-4 text-slate-500">
        <Typography.Text aria-live="polite" type="secondary" className="mb-3 block">
            {label}
        </Typography.Text>
        <Space orientation="vertical" className="w-full" size={16}>
            <Skeleton active title={false} paragraph={{ rows: 2 }} />
            <Skeleton active title={false} paragraph={{ rows: 2 }} />
            <Skeleton active title={false} paragraph={{ rows: 2 }} />
        </Space>
    </div>
)
