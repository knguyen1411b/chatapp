import { EmptyChatState } from './EmptyChatState'

export const EmptyState = ({ title, description }: { title: string; description: string }) => (
    <EmptyChatState title={title} description={description} />
)
