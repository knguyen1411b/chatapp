'use client'

import { useRouter } from 'next/navigation'

import { useQueryClient } from '@tanstack/react-query'
import { Modal, Select } from 'antd'
import { motion } from 'framer-motion'

import { ChatShell } from '@/features/chat/components/ChatShell'
import { ChatWindow } from '@/features/chat/components/ChatWindow'
import { ConversationDetail } from '@/features/chat/components/ConversationDetail'
import { ConversationSidebar } from '@/features/chat/components/ConversationSidebar'
import { CreateGroupModal } from '@/features/chat/components/CreateGroupModal'
import { EmptyState } from '@/features/chat/components/EmptyState'
import { LoadingState } from '@/features/chat/components/LoadingState'
import { useChatPageState } from '@/shared/hooks/use-chat-page-state'

export default function ChatPageView() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const state = useChatPageState({ queryClient })
    const ready = Boolean(state.currentUser)

    if (!state.authBootstrapped) {
        return (
            <main id="main-content" className="mx-auto h-screen max-w-400 p-3 md:p-4">
                <div className="glass-panel h-[calc(100vh-2rem)] overflow-hidden rounded-3xl">
                    <LoadingState label="Đang khởi tạo phiên làm việc…" />
                </div>
            </main>
        )
    }

    if (!ready) {
        return (
            <main id="main-content" className="mx-auto h-screen max-w-400 p-3 md:p-4">
                <div className="glass-panel h-[calc(100vh-2rem)] overflow-hidden rounded-3xl">
                    <LoadingState label="Đang chuyển hướng…" />
                </div>
            </main>
        )
    }

    return (
        <main id="main-content" className="mx-auto h-screen max-w-400 p-3 md:p-4">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
                <ChatShell
                    showSidebarOnMobile={!state.mobileChatOpen}
                    showMainOnMobile={state.mobileChatOpen}
                    sidebar={
                        <ConversationSidebar
                            currentUser={state.currentUser}
                            searchQuery={state.searchQuery}
                            setSearchQuery={value => {
                                state.setSearchQuery(value)
                                state.setSearchError('')
                            }}
                            onSearch={value => value.trim() && state.searchMutation.mutate(value.trim())}
                            searchResult={state.searchMutation.data}
                            searchError={state.searchError}
                            startPrivateLoading={state.startPrivateMutation.isPending}
                            onStartChat={state.startChatWithFoundUser}
                            conversations={state.conversations}
                            selectedConversationId={state.selectedConversation?.id ?? null}
                            onSelectConversation={state.openConversation}
                            onTogglePin={state.togglePin}
                            onOpenGroup={() => state.setGroupOpen(true)}
                            onOpenProfile={() => router.push('/profile')}
                            onLogout={state.logout}
                            currentPresence={state.currentUser?.presence || 'ONLINE'}
                            onPresenceChange={value => {
                                state.setCurrentUser(prev => (prev ? { ...prev, presence: value } : prev))
                                state.socketRef.current?.emit('presence:set', value)
                            }}
                        />
                    }
                    main={
                        <div className="h-full">
                            {!state.selectedConversation && state.isMobile && !state.mobileChatOpen ? (
                                <EmptyState
                                    title="Danh sách trò chuyện"
                                    description="Chọn một cuộc trò chuyện để mở khung chat"
                                />
                            ) : (
                                <ChatWindow
                                    conversation={state.selectedConversation}
                                    currentUserId={state.currentUser?.id ?? 0}
                                    messages={state.messages}
                                    messagesNextCursor={state.messagesNextCursor}
                                    loadingMoreMessages={state.loadingMoreMessages}
                                    loadingMessages={state.loadingMessages}
                                    typingText={state.typingText}
                                    text={state.text}
                                    onTextChange={state.handleTyping}
                                    onSend={() => state.sendMutation.mutate()}
                                    sending={state.sendMutation.isPending}
                                    uploading={state.sendFilesMutation.isPending}
                                    onSendFiles={files => state.sendFilesMutation.mutate(files)}
                                    replyTo={state.replyTo}
                                    onCancelReply={() => state.setReplyTo(null)}
                                    onReply={state.setReplyTo}
                                    onForward={selectedMessage => {
                                        state.setForwardMessage(selectedMessage)
                                        state.setForwardOpen(true)
                                    }}
                                    onFavorite={state.toggleFavorite}
                                    onReact={state.react}
                                    onEdit={state.editMessage}
                                    onDelete={state.deleteMessage}
                                    onLoadMoreMessages={state.loadMoreMessages}
                                    onBack={state.isMobile ? () => state.setMobileChatOpen(false) : undefined}
                                    socketConnected={state.connected}
                                />
                            )}
                        </div>
                    }
                    detail={
                        <ConversationDetail
                            conversation={state.selectedConversation}
                            currentUserId={state.currentUser?.id ?? 0}
                            onTogglePin={state.togglePin}
                        />
                    }
                />
            </motion.div>

            <CreateGroupModal
                open={state.groupOpen}
                groupName={state.groupName}
                setGroupName={state.setGroupName}
                memberInput={state.groupMemberInput}
                setMemberInput={state.setGroupMemberInput}
                members={state.groupMembers}
                addMember={state.addGroupMember}
                checkingMember={state.groupMemberChecking}
                errorMessage={state.groupError}
                removeMember={state.removeGroupMember}
                loading={state.createGroupMutation.isPending}
                onCancel={() => {
                    state.setGroupError('')
                    state.setGroupOpen(false)
                }}
                onCreate={state.createGroup}
            />

            <Modal
                open={state.forwardOpen}
                onCancel={() => state.setForwardOpen(false)}
                onOk={state.forwardMessageSubmit}
                title="Forward message"
                okButtonProps={{ disabled: !state.forwardConversationId }}
            >
                <Select
                    style={{ width: '100%' }}
                    placeholder="Chọn conversation"
                    onChange={value => state.setForwardConversationId(value)}
                    options={state.conversations.map(conversation => ({
                        value: conversation.id,
                        label:
                            conversation.type === 'GROUP'
                                ? conversation.name || `Group #${conversation.id}`
                                : conversation.members.find(member => member.userId !== state.currentUser?.id)?.user
                                      .username || `Private #${conversation.id}`
                    }))}
                />
            </Modal>
        </main>
    )
}
