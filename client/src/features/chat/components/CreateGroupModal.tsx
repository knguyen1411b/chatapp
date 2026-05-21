import { PlusOutlined } from '@ant-design/icons'
import { Alert } from 'antd'
import { Avatar, Button, Form, Input, Modal, Space, Tag, Typography } from 'antd'

export const CreateGroupModal = ({
    open,
    groupName,
    setGroupName,
    memberInput,
    setMemberInput,
    members,
    addMember,
    checkingMember,
    errorMessage,
    removeMember,
    loading,
    onCancel,
    onCreate
}: {
    open: boolean
    groupName: string
    setGroupName: (v: string) => void
    memberInput: string
    setMemberInput: (v: string) => void
    members: string[]
    addMember: (value?: string) => Promise<void>
    checkingMember: boolean
    errorMessage: string
    removeMember: (value: string) => void
    loading: boolean
    onCancel: () => void
    onCreate: () => void
}) => {
    return (
        <Modal
            open={open}
            title={
                <span className="text-base font-bold tracking-wide text-purple-600 dark:text-purple-400">
                    Tạo nhóm mới
                </span>
            }
            okText="Tạo nhóm"
            cancelText="Hủy"
            destroyOnHidden
            okButtonProps={{
                loading,
                className:
                    'hover-glow bg-gradient-to-r from-purple-600 to-indigo-600 border-0 hover:from-purple-500 hover:to-indigo-500 font-semibold'
            }}
            cancelButtonProps={{
                className: 'rounded-xl border border-slate-200/50 dark:border-white/10'
            }}
            onCancel={onCancel}
            onOk={onCreate}
        >
            <Form layout="vertical" className="mt-4">
                <Form.Item
                    label={
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tên nhóm</span>
                    }
                    required
                >
                    <Input
                        placeholder="Nhập tên nhóm..."
                        value={groupName}
                        onChange={e => setGroupName(e.target.value)}
                        className="rounded-xl border border-purple-500/10 bg-white/5 focus:border-purple-500/80"
                    />
                </Form.Item>
                <Form.Item
                    label={
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Thêm thành viên
                        </span>
                    }
                >
                    <Space.Compact block>
                        <Input
                            placeholder="username / email / tên hiển thị..."
                            autoComplete="off"
                            value={memberInput}
                            onChange={e => setMemberInput(e.target.value)}
                            onPressEnter={() => void addMember()}
                            className="rounded-l-xl border border-purple-500/10 bg-white/5 focus:border-purple-500/80"
                        />
                        <Button
                            icon={<PlusOutlined />}
                            loading={checkingMember}
                            onClick={() => void addMember()}
                            className="rounded-r-xl border-purple-500/10 bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                        >
                            Thêm
                        </Button>
                    </Space.Compact>
                </Form.Item>
                <div className="rounded-2xl border border-purple-500/10 bg-white/15 dark:bg-slate-900/40 backdrop-blur-md p-4 shadow-inner">
                    <Typography.Text
                        type="secondary"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wider"
                    >
                        Thành viên đã chọn ({members.length})
                    </Typography.Text>
                    <div className="flex flex-wrap gap-2">
                        {members.map(member => (
                            <Tag
                                key={member}
                                closable
                                icon={
                                    <Avatar size={16} className="bg-purple-600 font-bold shrink-0">
                                        {member[0]?.toUpperCase()}
                                    </Avatar>
                                }
                                className="m-0 flex items-center gap-1.5 rounded-full border-0 bg-purple-500/10 dark:bg-purple-500/20 px-2.5 py-1 text-xs font-medium text-purple-600 dark:text-purple-300"
                                onClose={event => {
                                    event.preventDefault()
                                    removeMember(member)
                                }}
                            >
                                {member}
                            </Tag>
                        ))}
                    </div>
                </div>
                {errorMessage ? (
                    <Alert
                        className="mt-4 rounded-xl border-red-500/20 bg-red-500/10 text-red-200"
                        type="error"
                        showIcon
                        title={errorMessage}
                    />
                ) : null}
            </Form>
        </Modal>
    )
}
